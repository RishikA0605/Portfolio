import * as THREE from 'three';
import { roundedRectShape, lerp } from './utils.js';
import { labelTexture } from './textures.js';

export const LAYERS = [
  { key: 'ui', label: 'UI', color: '#7cc6ff' },
  { key: 'api', label: 'API', color: '#ffb86b' },
  { key: 'db', label: 'DB', color: '#8ce0b0' },
];

const SIZE = 2;
const THICK = 0.3;
const BEVEL = 0.05;

/**
 * The hero object: three bevelled slabs (UI / API / DB).
 * group  → positioned/scaled by the scroll timeline
 * tilt   → isometric tilt + spin + mouse tilt
 */
export function createStack() {
  const group = new THREE.Group();
  group.name = 'stack';
  const tilt = new THREE.Group();
  group.add(tilt);

  const shape = roundedRectShape(SIZE - BEVEL * 2, SIZE - BEVEL * 2, 0.26);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: THICK - BEVEL * 2,
    bevelEnabled: true,
    bevelThickness: BEVEL,
    bevelSize: BEVEL,
    bevelSegments: 4,
    curveSegments: 10,
  });
  geo.center();
  geo.rotateX(-Math.PI / 2);
  const edgeGeo = new THREE.EdgesGeometry(geo, 30);
  const labelGeo = new THREE.PlaneGeometry(1.1, 1.1);
  labelGeo.rotateX(-Math.PI / 2);

  const materials = [];
  const slabs = LAYERS.map((l) => {
    const color = new THREE.Color(l.color);
    const mat = new THREE.MeshPhysicalMaterial({
      color,
      metalness: 0.55,
      roughness: 0.24,
      clearcoat: 1,
      clearcoatRoughness: 0.12,
      emissive: color,
      emissiveIntensity: 0.14,
      transparent: true,
    });
    const lineMat = new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.8 });
    const labelMat = new THREE.MeshBasicMaterial({
      map: labelTexture(l.label),
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      toneMapped: false,
    });
    const slab = new THREE.Group();
    const mesh = new THREE.Mesh(geo, mat);
    const lines = new THREE.LineSegments(edgeGeo, lineMat);
    const label = new THREE.Mesh(labelGeo, labelMat);
    label.position.y = THICK / 2 + 0.004;
    slab.add(mesh, lines, label);
    tilt.add(slab);
    materials.push(mat, lineMat, labelMat);
    return { slab, mat, lineMat, labelMat, color };
  });

  const tmp = new THREE.Color();
  const white = new THREE.Color('#ffffff');

  /**
   * @param {object} p
   * @param {number} p.explode  0 merged → 1 fully separated
   * @param {number[]} p.dim    per layer brightness 0..1
   * @param {number[]} p.glow   per layer extra emissive 0..1
   * @param {number} p.opacity
   */
  function update({ explode, dim, glow, opacity }) {
    const gap = lerp(0.07, 1.05, explode);
    slabs.forEach((s, i) => {
      s.slab.position.y = (1 - i) * (THICK + gap);
      const d = dim[i];
      tmp.copy(s.color).multiplyScalar(0.18 + 0.82 * d);
      s.mat.color.copy(tmp);
      s.mat.emissiveIntensity = (0.05 + 0.1 * d) + glow[i] * 0.85;
      s.mat.opacity = opacity;
      s.lineMat.color.copy(white).lerp(s.color, 1 - d);
      s.lineMat.opacity = 0.8 * opacity * (0.25 + 0.75 * d);
      s.labelMat.opacity = 0.95 * opacity * (0.3 + 0.7 * d);
    });
    group.visible = opacity > 0.01;
  }

  return { group, tilt, slabs, materials, update };
}
