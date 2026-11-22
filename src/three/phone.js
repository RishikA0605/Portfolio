import * as THREE from 'three';
import { roundedRectShape } from './utils.js';
import { codeTexture, makeCanvas, toTexture, roundRect, SANS, MONO } from './textures.js';
import { PHONE_SCREEN_W, PHONE_SCREEN_H } from './screens.js';

const W = 0.86;
const H = 1.76;
const DEPTH = 0.075;
const RADIUS = 0.14;

/** Mobile code placeholder screen shown when idle (-1). */
function mobileCodeTexture() {
  const [c, ctx] = makeCanvas(PHONE_SCREEN_W, PHONE_SCREEN_H);
  ctx.fillStyle = '#0b0e1f';
  ctx.fillRect(0, 0, PHONE_SCREEN_W, PHONE_SCREEN_H);
  // Status bar
  ctx.fillStyle = '#edeaf5';
  ctx.font = `600 18px ${MONO}`;
  ctx.fillText('9:41', 28, 38);
  ctx.fillRect(PHONE_SCREEN_W - 54, 26, 26, 14);
  // Mini code editor preview
  ctx.fillStyle = '#10142a';
  ctx.fillRect(16, 68, PHONE_SCREEN_W - 32, PHONE_SCREEN_H - 100);
  ctx.font = `500 17px ${MONO}`;
  const lines = [
    '// v2.0 mobile client',
    'import { DevSync } from "ai";',
    '',
    'export default function App() {',
    '  const [user, setUser] = useState();',
    '  const { data } = useStream();',
    '  return (',
    '    <SafeAreaView>',
    '      <LiveFeed stream={data} />',
    '    </SafeAreaView>',
    '  );',
    '}',
  ];
  lines.forEach((l, i) => {
    ctx.fillStyle = l.startsWith('//') ? '#6b6a8a' : l.startsWith('import') ? '#c3a6ff' : '#8ce0b0';
    ctx.fillText(l, 32, 110 + i * 28);
  });
  return toTexture(c, { anisotropy: 4 });
}

/**
 * 3D Smartphone companion model for the dual-device Projects showcase.
 * Displays the responsive mobile companion preview of each project.
 */
export function createPhone() {
  const group = new THREE.Group();
  group.name = 'phone';

  const body = new THREE.Group();
  group.add(body);

  const titanium = new THREE.MeshStandardMaterial({
    color: '#2a2e4a',
    metalness: 0.9,
    roughness: 0.22,
    transparent: true,
  });

  const backGlass = new THREE.MeshStandardMaterial({
    color: '#15182e',
    metalness: 0.6,
    roughness: 0.15,
    transparent: true,
  });

  const dark = new THREE.MeshStandardMaterial({
    color: '#07080f',
    roughness: 0.5,
    metalness: 0.2,
    transparent: true,
  });

  // Chassis / frame
  const frameGeo = new THREE.ExtrudeGeometry(roundedRectShape(W, H, RADIUS), {
    depth: DEPTH - 0.02,
    bevelEnabled: true,
    bevelThickness: 0.01,
    bevelSize: 0.01,
    bevelSegments: 3,
    curveSegments: 8,
  });
  frameGeo.center();
  const frame = new THREE.Mesh(frameGeo, titanium);
  body.add(frame);

  // Back panel
  const backGeo = new THREE.ShapeGeometry(roundedRectShape(W - 0.02, H - 0.02, RADIUS - 0.01), 8);
  const back = new THREE.Mesh(backGeo, backGlass);
  back.position.z = -DEPTH / 2 - 0.002;
  back.rotation.y = Math.PI;
  body.add(back);

  // Rear camera island
  const camBumpGeo = new THREE.ShapeGeometry(roundedRectShape(0.32, 0.32, 0.08), 6);
  const camBump = new THREE.Mesh(camBumpGeo, titanium);
  camBump.position.set(-W / 4, H / 3, -DEPTH / 2 - 0.01);
  camBump.rotation.y = Math.PI;
  body.add(camBump);

  // Rear camera lenses
  const lensGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.015, 16);
  lensGeo.rotateX(Math.PI / 2);
  const lensMat = new THREE.MeshStandardMaterial({ color: '#05070e', roughness: 0.1, metalness: 0.9 });
  const lens1 = new THREE.Mesh(lensGeo, lensMat);
  lens1.position.set(-W / 4 - 0.065, H / 3 + 0.065, -DEPTH / 2 - 0.018);
  const lens2 = new THREE.Mesh(lensGeo, lensMat);
  lens2.position.set(-W / 4 + 0.065, H / 3 - 0.065, -DEPTH / 2 - 0.018);
  body.add(lens1, lens2);

  // Front bezel
  const bezelGeo = new THREE.ShapeGeometry(roundedRectShape(W - 0.03, H - 0.03, RADIUS - 0.01), 8);
  const bezel = new THREE.Mesh(bezelGeo, dark);
  bezel.position.z = DEPTH / 2 + 0.002;
  body.add(bezel);

  // Screen
  const screenW = W - 0.08;
  const screenH = H - 0.08;
  const screenGeo = new THREE.PlaneGeometry(screenW, screenH);
  const defaultTex = mobileCodeTexture();
  const screenMat = new THREE.MeshBasicMaterial({
    map: defaultTex,
    toneMapped: false,
    transparent: true,
  });
  const screen = new THREE.Mesh(screenGeo, screenMat);
  screen.position.set(0, 0, DEPTH / 2 + 0.005);
  body.add(screen);

  // Dynamic Island pill
  const pillGeo = new THREE.ShapeGeometry(roundedRectShape(0.2, 0.05, 0.025), 6);
  const pillMat = new THREE.MeshBasicMaterial({ color: '#000000' });
  const pill = new THREE.Mesh(pillGeo, pillMat);
  pill.position.set(0, screenH / 2 - 0.05, DEPTH / 2 + 0.008);
  body.add(pill);

  const materials = [titanium, backGlass, dark, lensMat, screenMat, pillMat];
  const screenColor = new THREE.Color(1, 1, 1);

  function setScreen(texture) {
    screenMat.map = texture || defaultTex;
    screenMat.needsUpdate = true;
  }

  function update(dt, { opacity, flash = 0 }) {
    screenMat.color.copy(screenColor).multiplyScalar(1 - flash * 0.85);
    for (const m of materials) {
      if (m.userData.baseOpacity === undefined) m.userData.baseOpacity = m.opacity;
      m.opacity = m.userData.baseOpacity * opacity;
    }
    group.visible = opacity > 0.01;
  }

  return { group, body, materials, setScreen, update };
}
