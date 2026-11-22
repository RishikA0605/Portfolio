import * as THREE from 'three';
import { makeCanvas, toTexture, SANS, MONO } from './textures.js';
import { setOpacity } from './utils.js';

/** Front badge plaque for the LeetCode 423 / 365 Days Milestone. */
function badgeTexture() {
  const [c, ctx] = makeCanvas(512, 256);
  ctx.fillStyle = '#0f1328';
  ctx.fillRect(0, 0, 512, 256);

  // Gold border
  ctx.strokeStyle = '#ffa116';
  ctx.lineWidth = 6;
  ctx.strokeRect(10, 10, 492, 236);

  // LeetCode bracket glyph
  ctx.fillStyle = '#ffa116';
  ctx.font = `800 32px ${MONO}`;
  ctx.textAlign = 'center';
  ctx.fillText('⚡ LEETCODE MILESTONE', 256, 56);

  // Stat number
  ctx.fillStyle = '#ffffff';
  ctx.font = `800 68px ${SANS}`;
  ctx.fillText('423 SOLVED', 256, 134);

  // Badges & Hard count
  ctx.fillStyle = '#ef4743';
  ctx.font = `700 20px ${MONO}`;
  ctx.fillText('58 HARD', 140, 192);

  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fillText('·', 220, 192);

  ctx.fillStyle = '#ffc01e';
  ctx.fillText('15 BADGES', 300, 192);

  ctx.fillStyle = '#8ce0b0';
  ctx.font = `600 16px ${MONO}`;
  ctx.fillText('★ 365 DAYS STREAK', 256, 226);

  return toTexture(c, { anisotropy: 8 });
}

/**
 * 3D LeetCode Trophy & Algorithmic Hologram for the Achievements section.
 * - Golden faceted core (Data Structures & Algorithms)
 * - Gyroscopic orbital rings (Arrays, Graphs, DP)
 * - Orbiting Easy (green), Medium (orange) & Hard (crimson) tier crystals
 * - Titanium pedestal base with glowing achievement plaque
 */
export function createTrophy() {
  const masterGroup = new THREE.Group();
  masterGroup.name = 'trophy';

  const body = new THREE.Group();
  masterGroup.add(body);

  const materials = [];

  // ── Plinth / Pedestal Base ──
  const baseGeo = new THREE.CylinderGeometry(0.9, 1.05, 0.32, 32);
  const baseMat = new THREE.MeshStandardMaterial({
    color: '#1a1e36',
    metalness: 0.85,
    roughness: 0.25,
    transparent: true,
  });
  const baseMesh = new THREE.Mesh(baseGeo, baseMat);
  baseMesh.position.y = -1.25;
  body.add(baseMesh);
  materials.push(baseMat);

  // Plinth gold trim ring
  const trimGeo = new THREE.TorusGeometry(0.96, 0.024, 16, 32);
  trimGeo.rotateX(Math.PI / 2);
  const goldTrimMat = new THREE.MeshStandardMaterial({
    color: '#ffa116',
    metalness: 0.95,
    roughness: 0.15,
    emissive: '#ff7b00',
    emissiveIntensity: 0.3,
    transparent: true,
  });
  const trimMesh = new THREE.Mesh(trimGeo, goldTrimMat);
  trimMesh.position.y = -1.1;
  body.add(trimMesh);
  materials.push(goldTrimMat);

  // Plaque on front of pedestal
  const plaqueGeo = new THREE.PlaneGeometry(0.85, 0.42);
  const plaqueMat = new THREE.MeshBasicMaterial({
    map: badgeTexture(),
    transparent: true,
    depthWrite: false,
  });
  const plaqueMesh = new THREE.Mesh(plaqueGeo, plaqueMat);
  plaqueMesh.position.set(0, -1.25, 0.98);
  plaqueMesh.rotation.x = -0.12;
  body.add(plaqueMesh);
  materials.push(plaqueMat);

  // ── Golden Faceted Jewel Core ──
  const coreGeo = new THREE.IcosahedronGeometry(0.72, 0);
  const coreMat = new THREE.MeshPhysicalMaterial({
    color: '#ffa116',
    metalness: 0.85,
    roughness: 0.15,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    emissive: '#ff8800',
    emissiveIntensity: 0.35,
    transparent: true,
  });
  const coreMesh = new THREE.Mesh(coreGeo, coreMat);
  body.add(coreMesh);
  materials.push(coreMat);

  // Wireframe facet lines over core
  const wireGeo = new THREE.WireframeGeometry(coreGeo);
  const wireMat = new THREE.LineBasicMaterial({
    color: '#ffe58f',
    transparent: true,
    opacity: 0.8,
  });
  const wireMesh = new THREE.LineSegments(wireGeo, wireMat);
  coreMesh.add(wireMesh);
  materials.push(wireMat);

  // ── Orbiting Gyroscopic Rings ──
  const ring1Group = new THREE.Group();
  ring1Group.rotation.z = Math.PI / 4;
  ring1Group.rotation.x = 0.2;
  body.add(ring1Group);

  const ring1Geo = new THREE.TorusGeometry(1.22, 0.024, 16, 64);
  const ring1Mat = new THREE.MeshStandardMaterial({
    color: '#ffb86b',
    metalness: 0.9,
    roughness: 0.2,
    emissive: '#ff7b00',
    emissiveIntensity: 0.4,
    transparent: true,
  });
  const ring1Mesh = new THREE.Mesh(ring1Geo, ring1Mat);
  ring1Group.add(ring1Mesh);
  materials.push(ring1Mat);

  const ring2Group = new THREE.Group();
  ring2Group.rotation.z = -Math.PI / 3.5;
  ring2Group.rotation.y = 0.3;
  body.add(ring2Group);

  const ring2Geo = new THREE.TorusGeometry(1.42, 0.02, 16, 64);
  const ring2Mat = new THREE.MeshStandardMaterial({
    color: '#7cc6ff',
    metalness: 0.9,
    roughness: 0.2,
    emissive: '#3fd6c6',
    emissiveIntensity: 0.4,
    transparent: true,
  });
  const ring2Mesh = new THREE.Mesh(ring2Geo, ring2Mat);
  ring2Group.add(ring2Mesh);
  materials.push(ring2Mat);

  // ── Problem Solving Tier Crystals (Easy, Medium, Hard) ──
  const tierData = [
    { name: 'easy', color: '#00b8a3', size: 0.12, r: 1.22, speed: 1.1, group: ring1Group },
    { name: 'med', color: '#ffc01e', size: 0.15, r: 1.22, speed: -0.8, group: ring1Group },
    { name: 'hard', color: '#ef4743', size: 0.14, r: 1.42, speed: 1.3, group: ring2Group },
  ];

  const orbs = tierData.map((d) => {
    const geo = new THREE.OctahedronGeometry(d.size, 0);
    const mat = new THREE.MeshStandardMaterial({
      color: d.color,
      emissive: d.color,
      emissiveIntensity: 0.7,
      metalness: 0.6,
      roughness: 0.2,
      transparent: true,
    });
    const mesh = new THREE.Mesh(geo, mat);
    d.group.add(mesh);
    materials.push(mat);

    const light = new THREE.PointLight(d.color, 1.8, 3.5);
    mesh.add(light);

    return { mesh, light, ...d };
  });

  // Central glow point light
  const coreLight = new THREE.PointLight('#ffa116', 2.5, 6.0);
  coreMesh.add(coreLight);

  /**
   * @param {number} t  elapsed time
   * @param {object} p
   * @param {number} p.opacity
   * @param {boolean} p.reduced
   */
  function update(t, { opacity, reduced }) {
    masterGroup.visible = opacity > 0.01;
    if (!masterGroup.visible) return;

    const idle = reduced ? 0 : 1;

    // Gentle floating bob
    body.position.y = Math.sin(t * 1.5) * 0.06 * idle;

    // Slow faceted jewel rotation
    coreMesh.rotation.y = t * 0.4 * idle;
    coreMesh.rotation.x = Math.sin(t * 0.3) * 0.15 * idle;

    // Gyroscopic rings spin
    ring1Mesh.rotation.z = t * 0.6 * idle;
    ring2Mesh.rotation.z = -t * 0.45 * idle;

    // Orbiting tier crystals
    orbs.forEach((o, i) => {
      const angle = t * o.speed + i * (Math.PI * 2 / 3);
      o.mesh.position.set(
        Math.cos(angle) * o.r,
        Math.sin(angle) * o.r,
        0
      );
      o.mesh.rotation.y = t * 2.0;
      o.mesh.rotation.z = t * 1.5;
    });

    // Breathing emissive glow
    coreMat.emissiveIntensity = 0.25 + Math.sin(t * 2.2) * 0.15 * idle;

    setOpacity(materials, opacity);
  }

  return { group: masterGroup, body, materials, update };
}
