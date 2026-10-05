import * as THREE from 'three';
import { glowTexture } from './textures.js';

const TEAL = '#3fd6c6';
const BRAIN = '#7ff0e2';
const LINE = '#0b5f59';

/** Side-view head profile (facing +x) drawn with bezier curves. */
function headShape() {
  const s = new THREE.Shape();
  s.moveTo(-0.45, -1.7);
  s.bezierCurveTo(-0.5, -1.3, -0.55, -1.05, -0.78, -0.85); // nape
  s.bezierCurveTo(-1.28, -0.45, -1.32, 0.45, -0.98, 0.92); // back of skull
  s.bezierCurveTo(-0.62, 1.38, 0.28, 1.46, 0.66, 1.04); // crown
  s.bezierCurveTo(0.9, 0.78, 0.98, 0.5, 0.97, 0.24); // forehead
  s.bezierCurveTo(0.97, 0.14, 0.95, 0.08, 0.96, 0.03); // brow → bridge
  s.bezierCurveTo(1.06, -0.06, 1.2, -0.16, 1.22, -0.26); // nose
  s.bezierCurveTo(1.22, -0.33, 1.1, -0.37, 1.02, -0.38); // under nose
  s.bezierCurveTo(1.06, -0.42, 1.1, -0.46, 1.08, -0.5); // upper lip
  s.lineTo(1.0, -0.56); // mouth
  s.bezierCurveTo(1.08, -0.58, 1.08, -0.63, 1.05, -0.67); // lower lip
  s.bezierCurveTo(0.98, -0.74, 1.08, -0.86, 1.0, -0.96); // chin
  s.bezierCurveTo(0.9, -1.05, 0.7, -1.06, 0.56, -1.1); // jaw
  s.bezierCurveTo(0.49, -1.3, 0.5, -1.5, 0.5, -1.7); // neck
  s.lineTo(-0.45, -1.7);
  return s;
}

/** Layered sine "gyri" displacement on a unit direction. */
function folds(n) {
  return (
    0.05 * Math.sin(n.x * 13 + Math.sin(n.y * 9) * 1.6) * Math.sin(n.y * 12 + n.z * 7) +
    0.025 * Math.sin(n.z * 21 + n.x * 17 + n.y * 5)
  );
}

const R = 0.56;

function hemisphereGeometry() {
  const geo = new THREE.SphereGeometry(R, 64, 48);
  const pos = geo.attributes.position;
  const n = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    n.fromBufferAttribute(pos, i).normalize();
    const d = 1 + folds(n);
    pos.setXYZ(i, n.x * R * d, n.y * R * d, n.z * R * d);
  }
  geo.computeVertexNormals();
  return geo;
}

/** Point on the folded hemisphere surface for a unit direction. */
function surfacePoint(dir, lift = 1.02) {
  return dir.clone().multiplyScalar(R * (1 + folds(dir)) * lift);
}

/** Spiral curve wound across the surface around a centre direction. */
function swirlCurve(center, turns, maxR, rng) {
  const up = Math.abs(center.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
  const u = new THREE.Vector3().crossVectors(center, up).normalize();
  const v = new THREE.Vector3().crossVectors(center, u).normalize();
  const pts = [];
  const N = 30;
  const dirSign = rng() > 0.5 ? 1 : -1;
  for (let k = 0; k <= N; k++) {
    const t = k / N;
    const a = dirSign * t * turns * Math.PI * 2;
    const r = 0.03 + t * maxR;
    const d = center.clone().addScaledVector(u, Math.cos(a) * r).addScaledVector(v, Math.sin(a) * r).normalize();
    pts.push(surfacePoint(d));
  }
  return new THREE.CatmullRomCurve3(pts);
}

function mulberry(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Growth-mindset head + brain, fully code-built.
 * Head silhouette at z=0, brain group pushed forward (+z) for parallax.
 */
export function createBrain() {
  const group = new THREE.Group();
  group.name = 'brain';
  const inner = new THREE.Group(); // rotation / float
  group.add(inner);
  const materials = [];
  const rng = mulberry(7);

  // A · head
  const headGeo = new THREE.ExtrudeGeometry(headShape(), {
    depth: 0.3,
    bevelEnabled: true,
    bevelThickness: 0.04,
    bevelSize: 0.03,
    bevelSegments: 2,
    curveSegments: 16,
  });
  headGeo.translate(0, 0, -0.15);
  const headMat = new THREE.MeshStandardMaterial({
    color: TEAL,
    metalness: 0.3,
    roughness: 0.35,
    emissive: TEAL,
    emissiveIntensity: 0.12,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
  });
  const head = new THREE.Mesh(headGeo, headMat);
  const edgeMat = new THREE.LineBasicMaterial({ color: '#b8fff6', transparent: true, opacity: 0.7 });
  const headEdges = new THREE.LineSegments(new THREE.EdgesGeometry(headGeo, 35), edgeMat);
  inner.add(head, headEdges);
  materials.push(headMat, edgeMat);

  // B · brain
  const brain = new THREE.Group();
  brain.position.set(-0.12, 0.42, 0.8);
  inner.add(brain);

  const hemiGeo = hemisphereGeometry();
  const brainMat = new THREE.MeshStandardMaterial({
    color: BRAIN,
    emissive: TEAL,
    emissiveIntensity: 0.35,
    roughness: 0.4,
    metalness: 0.1,
    transparent: true,
  });
  const lineMat = new THREE.MeshBasicMaterial({ color: LINE, transparent: true, opacity: 0.95 });
  materials.push(brainMat, lineMat);

  const hemis = [-1, 1].map((side) => {
    const m = new THREE.Mesh(hemiGeo, brainMat);
    m.scale.set(1.25, 0.9, 0.62);
    m.position.z = side * 0.24;
    brain.add(m);
    return m;
  });

  // swirl/maze lines: more on the camera-facing hemisphere
  const swirlGeos = [];
  for (let i = 0; i < 18; i++) {
    const front = i < 12;
    const dir = new THREE.Vector3(rng() * 2 - 1, rng() * 1.6 - 0.5, front ? 0.35 + rng() * 0.8 : -(0.35 + rng() * 0.8)).normalize();
    const curve = swirlCurve(dir, 1.2 + rng() * 1.3, 0.22 + rng() * 0.2, rng);
    const g = new THREE.TubeGeometry(curve, 72, 0.0085, 4, false);
    swirlGeos.push(g);
    const tube = new THREE.Mesh(g, lineMat);
    (front ? hemis[1] : hemis[0]).add(tube);
  }

  // midline between hemispheres
  const mid = [];
  for (let k = 0; k <= 24; k++) {
    const t = k / 24;
    const a = Math.PI * (0.05 + t * 0.9);
    mid.push(new THREE.Vector3(-Math.cos(a) * R * 1.25 * 1.02, Math.sin(a) * R * 0.9 * 1.04, 0));
  }
  const midGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(mid), 48, 0.014, 5, false);
  brain.add(new THREE.Mesh(midGeo, lineMat));

  // C · neural points + lines
  const COUNT = 26;
  const orbit = Array.from({ length: COUNT }, () => ({
    r: 0.95 + rng() * 0.55,
    speed: (0.12 + rng() * 0.25) * (rng() > 0.5 ? 1 : -1),
    phase: rng() * Math.PI * 2,
    tilt: (rng() - 0.5) * 1.4,
    yaw: rng() * Math.PI,
  }));
  const pPos = new Float32Array(COUNT * 3);
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({
    color: '#a8fff4',
    size: 0.09,
    map: glowTexture(),
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(pGeo, pMat);
  brain.add(points);

  const pairs = [];
  for (let i = 0; i < COUNT; i++) {
    pairs.push([i, (i + 1) % COUNT]);
    if (i % 3 === 0) pairs.push([i, (i + 5) % COUNT]);
  }
  const lPos = new Float32Array(pairs.length * 6);
  const lGeo = new THREE.BufferGeometry();
  lGeo.setAttribute('position', new THREE.BufferAttribute(lPos, 3));
  const nMat = new THREE.LineBasicMaterial({
    color: TEAL,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  brain.add(new THREE.LineSegments(lGeo, nMat));
  materials.push(pMat, nMat);

  const light = new THREE.PointLight(TEAL, 2, 5, 1.6);
  light.position.set(0, 0, 0.2);
  brain.add(light);

  const e = new THREE.Euler();
  const v = new THREE.Vector3();
  function updateNeurons(time) {
    for (let i = 0; i < COUNT; i++) {
      const o = orbit[i];
      const a = o.phase + time * o.speed;
      v.set(Math.cos(a) * o.r * 1.1, Math.sin(a * 0.7) * 0.25, Math.sin(a) * o.r * 0.7);
      e.set(o.tilt, o.yaw, 0);
      v.applyEuler(e);
      pPos.set([v.x, v.y, v.z], i * 3);
    }
    pairs.forEach(([a, b], k) => {
      lPos.set(pPos.subarray(a * 3, a * 3 + 3), k * 6);
      lPos.set(pPos.subarray(b * 3, b * 3 + 3), k * 6 + 3);
    });
    pGeo.attributes.position.needsUpdate = true;
    lGeo.attributes.position.needsUpdate = true;
  }
  updateNeurons(0);

  /**
   * @param {number} time
   * @param {object} p  opacity, pulse (0..1), reduced
   */
  function update(time, { opacity, pulse, reduced }) {
    group.visible = opacity > 0.01;
    if (!group.visible) return;
    for (const m of materials) {
      if (m.userData.baseOpacity === undefined) m.userData.baseOpacity = m.opacity;
      m.opacity = m.userData.baseOpacity * opacity;
    }
    brainMat.emissiveIntensity = 0.35 + pulse * 1.1;
    headMat.emissiveIntensity = 0.12 + pulse * 0.25;
    light.intensity = (2 + pulse * 9) * opacity;
    if (!reduced) {
      inner.position.y = Math.sin(time * 0.8) * 0.06;
      updateNeurons(time);
    }
  }

  return { group, inner, materials, update };
}
