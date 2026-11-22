import * as THREE from 'three';
import { makeCanvas, toTexture } from './textures.js';
import { clamp, lerp, easeOut, easeInOut } from './utils.js';

// --- CONFIGURATION CONSTANTS ---
const LOGOS = [
  { id: 'react', name: 'React', color: '#61dafb' },
  { id: 'next', name: 'Next.js', color: '#000000' },
  { id: 'tailwind', name: 'Tailwind CSS', color: '#38bdf8' },
  { id: 'node', name: 'Node.js', color: '#5fa04e' },
  { id: 'pg', name: 'PostgreSQL', color: '#336791' },
];

const COL_Z = -2;              // depth of the logo column + showcase
const CAM_Z = 10;             // camera distance for depth math
const TILE = 3;               // tile geometry size (world units at scale 1)
const IDLE_OPACITY = 0.7;     // opacity when resting in the column
const ZOOM_OPACITY = 0.95;    // opacity when zoomed in showcase
// -------------------------------

// Shared geometries and materials
const tileShape = new THREE.Shape();
(function () {
  const size = 3, r = 0.4, hs = size / 2;
  tileShape.moveTo(-hs + r, -hs);
  tileShape.lineTo(hs - r, -hs);
  tileShape.quadraticCurveTo(hs, -hs, hs, -hs + r);
  tileShape.lineTo(hs, hs - r);
  tileShape.quadraticCurveTo(hs, hs, hs - r, hs);
  tileShape.lineTo(-hs + r, hs);
  tileShape.quadraticCurveTo(-hs, hs, -hs, hs - r);
  tileShape.lineTo(-hs, -hs + r);
  tileShape.quadraticCurveTo(-hs, -hs, -hs + r, -hs);
})();
const tileGeo = new THREE.ExtrudeGeometry(tileShape, { depth: 0.5, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.05, bevelThickness: 0.05 });
tileGeo.center();
const tileEdgesGeo = new THREE.EdgesGeometry(tileGeo);
const edgeMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });

function createTextPlane(text, color = '#ffffff') {
  const [c, ctx] = makeCanvas(256, 256);
  ctx.fillStyle = color;
  ctx.font = 'bold 120px "Bricolage Grotesque", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 128, 128);
  const geo = new THREE.PlaneGeometry(1.8, 1.8);
  const mat = new THREE.MeshBasicMaterial({ map: toTexture(c), transparent: true, depthWrite: false });
  return new THREE.Mesh(geo, mat);
}

function createLabelPlane(name) {
  const [c, ctx] = makeCanvas(512, 128);
  ctx.fillStyle = '#edeaf5';
  ctx.font = 'bold 64px "Bricolage Grotesque", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(name, 256, 64);
  const geo = new THREE.PlaneGeometry(4, 1);
  const mat = new THREE.MeshBasicMaterial({ map: toTexture(c), transparent: true, depthWrite: false });
  return new THREE.Mesh(geo, mat);
}

function buildEmblem(id, color) {
  const group = new THREE.Group();
  group.position.z = 0.28; // sit on front face

  const wMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, metalness: 0.1 });
  const cMat = new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.2 });

  if (id === 'react') {
    const tGeo = new THREE.TorusGeometry(0.7, 0.08, 8, 32);
    const r1 = new THREE.Mesh(tGeo, cMat); r1.rotation.z = 0;
    const r2 = new THREE.Mesh(tGeo, cMat); r2.rotation.z = Math.PI / 3;
    const r3 = new THREE.Mesh(tGeo, cMat); r3.rotation.z = -Math.PI / 3;
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), cMat);
    r1.scale.set(1, 0.4, 1); r2.scale.set(1, 0.4, 1); r3.scale.set(1, 0.4, 1);
    group.add(r1, r2, r3, core);
  } else if (id === 'next') {
    const discGeo = new THREE.CylinderGeometry(0.9, 0.9, 0.1, 32);
    discGeo.rotateX(Math.PI / 2);
    const disc = new THREE.Mesh(discGeo, new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.4 }));
    const ringGeo = new THREE.TorusGeometry(0.9, 0.05, 8, 32);
    const ring = new THREE.Mesh(ringGeo, wMat);
    const txt = createTextPlane('N', '#ffffff');
    txt.position.z = 0.06;
    group.add(disc, ring, txt);
  } else if (id === 'ts') {
    const txt = createTextPlane('TS', '#ffffff');
    group.add(txt);
  } else if (id === 'tailwind') {
    class WaveCurve extends THREE.Curve {
      getPoint(t, optionalTarget = new THREE.Vector3()) {
        const x = (t - 0.5) * 2;
        const y = Math.sin(t * Math.PI * 2) * 0.4;
        return optionalTarget.set(x, y, 0);
      }
    }
    const tubeGeo = new THREE.TubeGeometry(new WaveCurve(), 32, 0.15, 8, false);
    const w1 = new THREE.Mesh(tubeGeo, cMat); w1.position.y = 0.3;
    const w2 = new THREE.Mesh(tubeGeo, cMat); w2.position.y = -0.3;
    group.add(w1, w2);
  } else if (id === 'node') {
    const hexGeo = new THREE.CylinderGeometry(0.9, 0.9, 0.2, 6);
    hexGeo.rotateX(Math.PI / 2);
    hexGeo.rotateZ(Math.PI / 2);
    const hex = new THREE.Mesh(hexGeo, cMat);
    const txt = createTextPlane('JS', '#ffffff');
    txt.position.z = 0.11;
    group.add(hex, txt);
  } else if (id === 'pg') {
    const cylGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.2, 32);
    cylGeo.rotateX(Math.PI / 2);
    const c1 = new THREE.Mesh(cylGeo, cMat); c1.position.y = 0.4;
    const c2 = new THREE.Mesh(cylGeo, cMat); c2.position.y = 0;
    const c3 = new THREE.Mesh(cylGeo, cMat); c3.position.y = -0.4;
    const txt = createTextPlane('Pg', '#ffffff');
    txt.position.z = 0.11;
    group.add(c1, c2, c3, txt);
  }
  return group;
}

export function createLogos({ light }) {
  const masterGroup = new THREE.Group();
  masterGroup.name = 'logos';

  const items = LOGOS.map((logoData) => {
    const group = new THREE.Group();

    // Brand color logic
    let cHex = logoData.color;
    if (logoData.id === 'next') cHex = light ? '#15172b' : '#edeaf5';

    // Cinematic Base Tile: High metalness, low roughness for beautiful reflections
    const tileMat = new THREE.MeshStandardMaterial({
      color: cHex,
      roughness: 0.15,
      metalness: 0.85,
      emissive: cHex,
      emissiveIntensity: 0.05,
      transparent: true,
      opacity: IDLE_OPACITY,
    });
    const tile = new THREE.Mesh(tileGeo, tileMat);

    const edges = new THREE.LineSegments(tileEdgesGeo, edgeMat.clone());

    const emblem = buildEmblem(logoData.id, cHex);
    const label = createLabelPlane(logoData.name);
    label.position.y = -2.4;

    // Intense Cinematic Point Light behind for glow
    const pLight = new THREE.PointLight(cHex, 0, 10);
    pLight.position.set(0, 0, -1.5);

    group.add(tile, edges, emblem, label, pLight);
    masterGroup.add(group);

    return { group, tile, edges, tileMat, pLight, emblem, label, baseColor: new THREE.Color(cHex) };
  });

  const slot = new THREE.Vector3();
  const center = new THREE.Vector3();

  /**
   * Logos rest in a vertical column on the left edge of the screen. As the
   * Tech Stack section scrolls, each one in turn flies to the centre of the
   * free space next to the text panel, spins a full 360° and flies home.
   *
   * @param {number} time
   * @param {object} p
   * @param {number} p.progress  0..1 showcase progress (one slice per logo)
   * @param {number} p.fade      0..1 column visibility (also slides it in)
   * @param {number} p.hw        half viewport width at z = 0 (world)
   * @param {number} p.hh        half viewport height at z = 0 (world)
   * @param {number} p.w         viewport width in px
   * @param {{left:number,right:number}|null} p.panel  text panel bounds in px
   */
  function update(time, { progress, fade, hw, hh, w, panel, mobile, reduced }) {
    masterGroup.visible = fade > 0.01;
    if (!masterGroup.visible) return;

    const depthK = (CAM_Z - COL_Z) / CAM_Z;
    const halfW = hw * depthK;
    const halfH = hh * depthK;
    const wpp = (halfW * 2) / w; // world units per CSS px at COL_Z
    const pxToX = (px) => -halfW + px * wpp;
    const n = items.length;

    // ── column on the left edge ──
    const span = halfH * (mobile ? 1.25 : 1.45);
    const step = span / (n - 1);
    const tile = Math.min(step * 0.8, (mobile ? 40 : 84) * wpp);
    const smallScale = tile / TILE;
    const margin = (mobile ? 10 : 40) * wpp;
    const slideIn = (1 - easeOut(clamp(fade))) * (tile + margin) * 1.6;
    const colX = -halfW + margin + tile / 2 - slideIn;
    const colY = -halfH * 0.05;

    // ── showcase: centre of the widest empty gap beside the text panel ──
    let gapL = -halfW + margin * 2 + tile;
    let gapR = halfW - margin;
    if (panel && panel.right > panel.left) {
      const pL = pxToX(panel.left);
      const pR = pxToX(panel.right);
      if (pL - gapL >= gapR - pR) gapR = pL;
      else gapL = pR;
    }
    // no real gap (phones / narrow tablets) → showcase over the text, softened
    const compact = mobile || gapR - gapL < 2.2;
    if (compact) {
      gapL = -halfW;
      gapR = halfW;
    }
    const gap = gapR - gapL;
    center.set((gapL + gapR) / 2, halfH * 0.12, COL_Z);
    const bigScale = clamp(Math.min(gap * 0.62, halfH * 0.95) / TILE, smallScale * 1.6, 1.15);

    const restDim = mobile ? 0.4 : 1;
    const showDim = compact ? 0.55 : 1;
    const slice = 1 / n;

    items.forEach((it, i) => {
      slot.set(colX, colY + span / 2 - i * step, COL_Z);

      const p = clamp((progress - i * slice) / slice); // 0..1 inside its own slice
      // scroll-scrubbed (user controlled), so it also runs with reduced motion on
      const t = p;

      let zoom = 0; // 0 resting → 1 in showcase
      let spin = 0; // 0..1 → one full turn

      if (t <= 0 || t >= 1) {
        it.group.position.copy(slot);
        it.group.position.y += Math.sin(time * 1.5 + i) * 0.04 * (reduced ? 0 : 1);
      } else if (t < 0.3) {
        // fly out from the column to the centre
        zoom = easeInOut(t / 0.3);
        it.group.position.lerpVectors(slot, center, zoom);
      } else if (t < 0.7) {
        // hold in the centre and spin 360°
        zoom = 1;
        spin = easeInOut((t - 0.3) / 0.4);
        it.group.position.copy(center);
      } else {
        // fly back to its own place
        spin = 1;
        zoom = 1 - easeInOut((t - 0.7) / 0.3);
        it.group.position.lerpVectors(slot, center, zoom);
      }

      // gentle arc while travelling so it doesn't move on a dead straight line
      it.group.position.z += Math.sin(zoom * Math.PI) * 0.6;
      it.group.rotation.y = spin * Math.PI * 2;
      it.group.rotation.x = Math.sin(spin * Math.PI) * 0.2;
      it.group.scale.setScalar(lerp(smallScale, bigScale, zoom));

      // Materials
      const op = lerp(IDLE_OPACITY * restDim, ZOOM_OPACITY * showDim, zoom) * fade;

      it.tileMat.opacity = op;
      it.tileMat.emissiveIntensity = lerp(0.08, 1.5, zoom);
      it.edges.material.opacity = lerp(0.35, 1.0, zoom) * fade * restDim;

      // label only appears in the showcase
      it.label.material.opacity = lerp(0, op, Math.pow(zoom, 0.5));

      it.emblem.children.forEach((child) => {
        if (child.material) {
          child.material.transparent = true;
          child.material.opacity = op;
          if (child.material.emissive) {
            child.material.emissiveIntensity = lerp(0, 1.0, zoom);
          }
        }
      });

      it.pLight.intensity = lerp(0, 25, Math.pow(zoom, 1.5)) * fade;
    });
  }

  return { group: masterGroup, items, update };
}
