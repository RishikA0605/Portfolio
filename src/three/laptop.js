import * as THREE from 'three';
import { roundedRectShape } from './utils.js';
import { keyboardTexture, codeTexture, makeCanvas, toTexture, roundRect } from './textures.js';
import { SCREEN_W, SCREEN_H } from './screens.js';

const W = 3;
const D = 2;
const BASE_T = 0.11;
const LID_T = 0.06;
const LID_H = D - 0.06;
const SCREEN_ASPECT = SCREEN_W / SCREEN_H;

function backLogoTexture() {
  const [c, ctx] = makeCanvas(256, 256);
  ['#7cc6ff', '#ffb86b', '#8ce0b0'].forEach((col, i) => {
    roundRect(ctx, 48, 58 + i * 50, 160, 36, 10);
    ctx.fillStyle = col;
    ctx.fill();
  });
  return toTexture(c);
}

/**
 * Code-built laptop: base, keyboard, trackpad, hinged lid with a screen.
 * group → positioned by the timeline · body → tilt / swing · lidPivot → hinge
 */
export function createLaptop() {
  const group = new THREE.Group();
  group.name = 'laptop';
  const body = new THREE.Group();
  group.add(body);

  const alu = new THREE.MeshStandardMaterial({
    color: '#3b4060',
    metalness: 0.85,
    roughness: 0.3,
    transparent: true,
  });
  const dark = new THREE.MeshStandardMaterial({ color: '#07080f', roughness: 0.5, metalness: 0.2, transparent: true });

  // base
  const baseGeo = new THREE.ExtrudeGeometry(roundedRectShape(W, D, 0.14), {
    depth: BASE_T - 0.04,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.02,
    bevelSegments: 3,
    curveSegments: 8,
  });
  baseGeo.center();
  baseGeo.rotateX(-Math.PI / 2);
  const base = new THREE.Mesh(baseGeo, alu);
  base.position.y = BASE_T / 2;
  body.add(base);

  // keyboard
  const kbMat = new THREE.MeshStandardMaterial({
    map: keyboardTexture(),
    roughness: 0.65,
    metalness: 0.1,
    transparent: true,
  });
  const kbGeo = new THREE.PlaneGeometry(W * 0.86, D * 0.4);
  kbGeo.rotateX(-Math.PI / 2);
  const keyboard = new THREE.Mesh(kbGeo, kbMat);
  keyboard.position.set(0, BASE_T + 0.003, -0.3);
  body.add(keyboard);

  // trackpad
  const tpGeo = new THREE.ShapeGeometry(roundedRectShape(1.0, 0.56, 0.06), 6);
  tpGeo.rotateX(-Math.PI / 2);
  const tpMat = new THREE.MeshStandardMaterial({ color: '#2c3150', metalness: 0.7, roughness: 0.22, transparent: true });
  const trackpad = new THREE.Mesh(tpGeo, tpMat);
  trackpad.position.set(0, BASE_T + 0.003, 0.56);
  body.add(trackpad);

  // lid
  const lidPivot = new THREE.Group();
  lidPivot.position.set(0, BASE_T, -D / 2 + 0.04);
  body.add(lidPivot);

  const lidGeo = new THREE.ExtrudeGeometry(roundedRectShape(W, LID_H, 0.14), {
    depth: LID_T - 0.03,
    bevelEnabled: true,
    bevelThickness: 0.015,
    bevelSize: 0.015,
    bevelSegments: 3,
    curveSegments: 8,
  });
  lidGeo.center();
  lidGeo.translate(0, LID_H / 2, -LID_T / 2);
  const lid = new THREE.Mesh(lidGeo, alu);
  lidPivot.add(lid);

  const bezelGeo = new THREE.ShapeGeometry(roundedRectShape(W - 0.06, LID_H - 0.06, 0.11), 6);
  const bezel = new THREE.Mesh(bezelGeo, dark);
  bezel.position.set(0, LID_H / 2, 0.002);
  lidPivot.add(bezel);

  const screenH = LID_H - 0.26;
  const screenW = Math.min(W - 0.22, screenH * SCREEN_ASPECT);
  const screenGeo = new THREE.PlaneGeometry(screenW, screenH);
  const code = codeTexture();
  // window of the tall code canvas matching the screen aspect
  code.repeat.set(1, (1024 / screenW) * screenH / 2048);
  const screenMat = new THREE.MeshBasicMaterial({ map: code, toneMapped: false, transparent: true });
  const screen = new THREE.Mesh(screenGeo, screenMat);
  screen.position.set(0, LID_H / 2 + 0.02, 0.004);
  lidPivot.add(screen);

  const logoMat = new THREE.MeshBasicMaterial({ map: backLogoTexture(), transparent: true, opacity: 0.85, toneMapped: false });
  const logo = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.42), logoMat);
  logo.rotation.y = Math.PI;
  logo.position.set(0, LID_H / 2, -LID_T - 0.002);
  lidPivot.add(logo);

  const materials = [alu, dark, kbMat, tpMat, screenMat, logoMat];

  let showingCode = true;
  let codeOffset = 0;
  const screenColor = new THREE.Color(1, 1, 1);

  function setScreen(texture) {
    showingCode = !texture;
    screenMat.map = texture || code;
    screenMat.needsUpdate = true;
  }

  /**
   * @param {number} dt
   * @param {object} p
   * @param {number} p.lid     0 closed → 1 normal open → >1 wider
   * @param {number} p.opacity
   * @param {number} p.flash   0..1 screen brightness dip when switching previews
   */
  function update(dt, { lid: open, opacity, flash = 0 }) {
    lidPivot.rotation.x = Math.PI / 2 - open * (Math.PI / 2 + 0.22);
    if (showingCode) {
      codeOffset = (codeOffset - dt * 0.035 + 1) % 1;
      code.offset.y = codeOffset;
    }
    screenMat.color.copy(screenColor).multiplyScalar(1 - flash * 0.85);
    for (const m of materials) {
      if (m.userData.baseOpacity === undefined) m.userData.baseOpacity = m.opacity;
      m.opacity = m.userData.baseOpacity * opacity;
    }
    group.visible = opacity > 0.01;
  }

  return { group, body, lidPivot, materials, codeTexture: code, setScreen, update };
}
