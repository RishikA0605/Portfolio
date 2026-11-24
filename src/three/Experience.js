import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import gsap from 'gsap';
import { createStack } from './stack.js';
import { createLaptop } from './laptop.js';
import { createPhone } from './phone.js';
import { createBrain } from './brain.js';
import { createLogos } from './logos.js';
import { createTrophy } from './trophy.js';
import { createGlobe } from './globe.js';
import { createParticles } from './particles.js';
import { createProjectScreens, createMobileProjectScreens } from './screens.js';
import { disposeObject } from './utils.js';

const FOV = 35;
const CAM_Z = 10;

/** Laptop-screen backdrop for the globe: dark HUD with a faint grid and status text. */
function globeScreenBackground() {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 640;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(512, 320, 40, 512, 320, 620);
  g.addColorStop(0, '#0d1834');
  g.addColorStop(1, '#05070f');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 1024, 640);
  ctx.strokeStyle = 'rgba(63,214,198,0.07)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= 1024; x += 48) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 640); ctx.stroke(); }
  for (let y = 0; y <= 640; y += 48) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1024, y); ctx.stroke(); }
  ctx.font = '600 18px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
  ctx.fillStyle = 'rgba(63,214,198,0.85)';
  ctx.fillText('● network.status: online', 32, 46);
  ctx.fillStyle = 'rgba(237,234,245,0.45)';
  ctx.fillText('nodes: 11   links: 9   latency: 42ms', 32, 74);
  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(255,184,107,0.8)';
  ctx.fillText('contact.sh — open to new roles', 992, 608);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Values driven by the master scroll timeline (see motion/choreography.js). */
export function initialState() {
  return {
    stackX: 0, stackY: 0, stackS: 0.55, stackSpin: 0, stackOp: 1, explode: 0,
    glow0: 0, glow1: 0, glow2: 0,
    lapX: 0, lapY: 0, lapS: 0.8, lapRotY: -0.5, lapRotX: 0.32, lid: 1, lapOp: 1,
    brainOp: 0, brainS: 0.6, brainRotY: -0.5, brainRotX: 0.12, brainX: 0, brainY: 0,
    trophyOp: 0, trophyS: 0.85, trophyX: 0, trophyY: 0, trophyRotY: 0, trophyRotX: 0,
    globeOp: 0, globeS: 0.95, globeX: 0, globeY: 0, globeRotY: 0, globeRotX: 0,
    logoP: 0, logoFade: 0, partOp: 1, scroll: 0, phoneOp: 1, screenGlobe: 0,
  };
}

export class Experience {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {{reduced:boolean, light:boolean, projects:Array}} opts
   */
  constructor(canvas, { reduced, light, projects }) {
    this.canvas = canvas;
    this.reduced = reduced;
    this.light = light;
    this.projects = projects;
    this.state = initialState();
    this.fx = {
      intro: { stack: 0, spin: 0, lapOp: 0, lid: 0 },
      layers: { d0: 1, d1: 1, d2: 1, g0: 0, g1: 0, g2: 0 },
      pulse: { v: 0 },
      flash: { v: 0 },
    };
    this.mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    this.activeProject = -1;
    /** Tech Stack text panel bounds in px, measured by the choreography. */
    this.techPanel = null;
    this.pointerFine = window.matchMedia('(pointer: fine)').matches;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer = renderer;

    const scene = new THREE.Scene();
    this.scene = scene;
    this.pmrem = new THREE.PMREMGenerator(renderer);
    this.envTex = this.pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = this.envTex;
    scene.environmentIntensity = 0.85;

    this.camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 80);
    this.camera.position.set(0, 0, CAM_Z);

    scene.add(new THREE.HemisphereLight('#d6dcff', '#1a1d33', 0.7));
    const key = new THREE.DirectionalLight('#ffffff', 2.2);
    key.position.set(4, 6, 7);
    const rim = new THREE.DirectionalLight('#7cc6ff', 3.2);
    rim.position.set(-6, 3, -5);
    const rim2 = new THREE.DirectionalLight('#ffb86b', 1.4);
    rim2.position.set(6, -3, -5);
    scene.add(key, rim, rim2);

    this.stack = createStack();
    this.laptop = createLaptop();
    this.phone = createPhone();
    this.brain = createBrain();
    this.trophy = createTrophy();
    this.globe = createGlobe();
    this.logos = createLogos({ light });
    this.particles = createParticles({
      count: window.innerWidth < 768 ? 280 : 600,
      color: light ? '#6b6890' : '#9a98b4',
    });
    this.screens = createProjectScreens(projects);
    this.mobileScreens = createMobileProjectScreens(projects);
    scene.add(this.particles, this.logos.group, this.brain.group, this.trophy.group, this.laptop.group, this.phone.group, this.stack.group);

    // Holographic network globe lives in its own scene and is rendered into a
    // texture that is shown on the laptop screen in the Contact section.
    this.globeRT = new THREE.WebGLRenderTarget(1024, 640, { samples: 4 });
    this.globeRT.texture.colorSpace = THREE.SRGBColorSpace;
    const gScene = new THREE.Scene();
    gScene.background = globeScreenBackground();
    gScene.environment = this.envTex;
    gScene.environmentIntensity = 0.85;
    gScene.add(new THREE.HemisphereLight('#d6dcff', '#1a1d33', 0.7));
    const gKey = new THREE.DirectionalLight('#ffffff', 2.0);
    gKey.position.set(4, 6, 7);
    const gRim = new THREE.DirectionalLight('#7cc6ff', 2.6);
    gRim.position.set(-6, 3, -5);
    gScene.add(gKey, gRim, this.globe.group);
    this.globeScene = gScene;
    this.globeCam = new THREE.PerspectiveCamera(35, 1024 / 640, 0.1, 40);
    this.globeCam.position.set(0, 0.15, 6.4);
    this.globeCam.lookAt(0, 0, 0);
    this.screenIsGlobe = false;

    this.clock = new THREE.Clock();
    this.resize();

    this._onResize = () => this.resize();
    this._onMove = (e) => {
      this.mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.ty = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('resize', this._onResize);
    window.addEventListener('pointermove', this._onMove, { passive: true });

    // compile up-front so the first scrolled frame doesn't hitch
    renderer.compile(scene, this.camera);
    renderer.setAnimationLoop(() => this.tick());
  }

  /** World-space size of the viewport at z = 0. */
  get layout() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const hh = Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * CAM_Z;
    const aspect = w / h;
    return { hh, hw: hh * aspect, aspect, mobile: w < 768 || aspect < 0.8, w, h };
  }

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const maxDpr = w < 768 ? 1.75 : 2;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  /** Loader → intro: stack spins in, laptop lid opens. */
  intro() {
    const i = this.fx.intro;
    if (this.reduced) {
      Object.assign(i, { stack: 1, spin: 0, lapOp: 1, lid: 1 });
      return gsap.timeline();
    }
    i.spin = -Math.PI * 2;
    const tl = gsap.timeline();
    tl.to(i, { stack: 1, duration: 1.3, ease: 'back.out(1.4)' }, 0)
      .to(i, { spin: 0, duration: 1.6, ease: 'power3.out' }, 0)
      .to(i, { lapOp: 1, duration: 0.8, ease: 'power2.out' }, 0.25)
      .to(i, { lid: 1, duration: 1.2, ease: 'power3.inOut' }, 0.9);
    return tl;
  }

  /** Swap the laptop screen to a project preview (-1 = code editor) and light its layers. */
  setProject(index) {
    if (index === this.activeProject) return;
    this.activeProject = index;
    const layerKeys = ['ui', 'api', 'db'];
    const p = this.projects[index];
    const on = p ? layerKeys.map((k) => p.layers.includes(k)) : [true, true, true];
    gsap.to(this.fx.layers, {
      d0: on[0] ? 1 : 0.15, d1: on[1] ? 1 : 0.15, d2: on[2] ? 1 : 0.15,
      g0: p && on[0] ? 0.6 : 0, g1: p && on[1] ? 0.6 : 0, g2: p && on[2] ? 0.6 : 0,
      duration: 0.6, ease: 'power2.out', overwrite: true,
    });
    const tex = p ? this.screens[index] : null;
    const mobTex = p ? this.mobileScreens[index] : null;
    if (this.screenIsGlobe) {
      this.phone.setScreen(mobTex);
      return;
    }
    if (this.reduced) {
      this.laptop.setScreen(tex);
      this.phone.setScreen(mobTex);
      return;
    }
    gsap.timeline({ overwrite: true })
      .to(this.fx.flash, {
        v: 1,
        duration: 0.14,
        ease: 'power1.in',
        onComplete: () => {
          this.laptop.setScreen(tex);
          this.phone.setScreen(mobTex);
        },
      })
      .to(this.fx.flash, { v: 0, duration: 0.35, ease: 'power2.out' });
  }

  /** Brain "learns a new version": quick emissive + light pulse. */
  pulse() {
    if (this.reduced) return;
    gsap.timeline({ overwrite: true })
      .to(this.fx.pulse, { v: 1, duration: 0.22, ease: 'power2.out' })
      .to(this.fx.pulse, { v: 0, duration: 1.0, ease: 'power2.inOut' });
  }

  /** Trigger interactive network pulse and communication waves on the 3D globe when hovering email. */
  setMailHover(hovered) {
    this.globe?.setHover(hovered);
  }

  tick() {
    const dt = Math.min(this.clock.getDelta(), 0.05);
    const t = this.clock.elapsedTime;
    const S = this.state;
    const fx = this.fx;
    const L = this.layout;
    const m = this.mouse;
    const tiltOn = this.pointerFine && !L.mobile && !this.reduced;
    m.x += ((tiltOn ? m.tx : 0) - m.x) * 0.06;
    m.y += ((tiltOn ? m.ty : 0) - m.y) * 0.06;
    const idle = this.reduced ? 0 : 1;

    // stack
    const st = this.stack;
    const introS = Math.max(fx.intro.stack, 0.0001);
    st.group.position.set(S.stackX, S.stackY + Math.sin(t * 1.1) * 0.07 * idle, 0);
    st.group.scale.setScalar(S.stackS * introS);
    st.tilt.rotation.set(
      0.52 + m.y * 0.16,
      -Math.PI / 4 + S.stackSpin + fx.intro.spin + m.x * 0.35 + Math.sin(t * 0.5) * 0.05 * idle,
      0
    );
    st.update({
      explode: S.explode,
      dim: [fx.layers.d0, fx.layers.d1, fx.layers.d2],
      glow: [S.glow0 + fx.layers.g0, S.glow1 + fx.layers.g1, S.glow2 + fx.layers.g2],
      opacity: S.stackOp * Math.min(1, fx.intro.stack * 1.5),
    });

    // laptop
    const lp = this.laptop;
    lp.group.position.set(S.lapX, S.lapY + Math.sin(t * 1.1 + 1.2) * 0.045 * idle, 0);
    lp.group.scale.setScalar(S.lapS);
    lp.body.rotation.set(S.lapRotX + m.y * 0.08, S.lapRotY + m.x * 0.18, 0);
    lp.update(dt, { lid: S.lid * fx.intro.lid, opacity: S.lapOp * fx.intro.lapOp, flash: fx.flash.v });

    // companion smartphone (dual-device project showcase)
    const ph = this.phone;
    // Positioned to the right and in front of the laptop base so the right corner never overlaps the phone screen
    const phoneOffsetX = L.mobile ? 0.78 : 1.92;
    const phoneOffsetY = L.mobile ? -0.22 : -0.18;
    const phoneOffsetZ = L.mobile ? 1.35 : 1.45;
    ph.group.position.set(
      S.lapX + phoneOffsetX * S.lapS,
      S.lapY + phoneOffsetY * S.lapS + Math.sin(t * 1.35 + 2.4) * 0.038 * idle,
      phoneOffsetZ
    );
    ph.group.scale.setScalar(S.lapS * (L.mobile ? 0.74 : 0.9));
    ph.body.rotation.set(
      0.14 + m.y * 0.05,
      -0.28 + m.x * 0.12,
      -0.03
    );
    ph.group.renderOrder = 10;
    ph.update(dt, { opacity: S.lapOp * S.phoneOp * fx.intro.lapOp, flash: fx.flash.v });

    // brain
    const br = this.brain;
    br.group.position.set(S.brainX, S.brainY, -1);
    br.group.scale.setScalar(S.brainS);
    br.inner.rotation.set(S.brainRotX, S.brainRotY, 0);
    br.update(t, { opacity: S.brainOp, pulse: fx.pulse.v, reduced: this.reduced });

    // trophy (LeetCode achievements)
    const tr = this.trophy;
    tr.group.position.set(S.trophyX, S.trophyY, 0);
    tr.group.scale.setScalar(S.trophyS);
    tr.body.rotation.set(
      S.trophyRotX + m.y * 0.1,
      S.trophyRotY + m.x * 0.18,
      0
    );
    tr.update(t, { opacity: S.trophyOp, reduced: this.reduced });

    // globe → rendered onto the laptop screen in the Contact section
    const wantGlobe = S.screenGlobe > 0.5;
    if (wantGlobe !== this.screenIsGlobe) {
      this.screenIsGlobe = wantGlobe;
      const p = this.activeProject;
      lp.setScreen(wantGlobe ? this.globeRT.texture : p >= 0 ? this.screens[p] : null);
    }
    if (wantGlobe && S.lapOp * fx.intro.lapOp > 0.01) {
      const gb = this.globe;
      gb.body.rotation.x = 0.18 + m.y * 0.1;
      gb.update(t, dt, { opacity: 1, reduced: this.reduced });
      this.renderer.setRenderTarget(this.globeRT);
      this.renderer.render(this.globeScene, this.globeCam);
      this.renderer.setRenderTarget(null);
    }

    // logos
    this.logos.update(t, {
      progress: S.logoP, fade: S.logoFade, hw: L.hw, hh: L.hh, w: L.w,
      panel: this.techPanel || null, mobile: L.mobile, reduced: this.reduced,
    });

    // particles (hidden during the tech stack section) + light camera parallax
    this.particles.material.opacity = 0.7 * S.partOp;
    this.particles.visible = S.partOp > 0.01;
    this.particles.rotation.y = t * 0.012 * idle;
    this.particles.position.y = S.scroll * 0.35;
    this.camera.position.x = m.x * 0.25;
    this.camera.position.y = -m.y * 0.15;
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.renderer.setAnimationLoop(null);
    window.removeEventListener('resize', this._onResize);
    window.removeEventListener('pointermove', this._onMove);
    gsap.killTweensOf([this.fx.intro, this.fx.layers, this.fx.pulse, this.fx.flash]);
    this.screens.forEach((t) => t.dispose());
    this.mobileScreens.forEach((t) => t.dispose());
    this.laptop.codeTexture.dispose();
    disposeObject(this.scene);
    disposeObject(this.globeScene);
    this.globeScene.background?.dispose();
    this.globeRT.dispose();
    this.envTex.dispose();
    this.pmrem.dispose();
    this.renderer.dispose();
    this.renderer.forceContextLoss?.();
  }
}

export function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch {
    return false;
  }
}
