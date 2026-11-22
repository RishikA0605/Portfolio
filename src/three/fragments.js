import * as THREE from 'three';
import { makeCanvas, toTexture, roundRect, MONO } from './textures.js';
import { roundedRectShape, lerp, clamp } from './utils.js';

const TOKENS = [
  { text: '<UI />', color: '#7cc6ff', pos: [-1.65, 0.85, 0.75], dir: [-1.8, 1.2, 1.5] },
  { text: '{ API }', color: '#ffb86b', pos: [1.65, 0.45, 0.65], dir: [2.0, 0.6, 1.2] },
  { text: '( DB )', color: '#8ce0b0', pos: [-1.5, -0.65, 0.85], dir: [-1.6, -1.2, 1.4] },
  { text: 'async/await', color: '#c3a6ff', pos: [1.45, 1.25, -0.2], dir: [1.5, 1.8, -1.0] },
  { text: 'SELECT *', color: '#8ce0b0', pos: [1.55, -0.75, 0.55], dir: [1.8, -1.4, 1.0] },
  { text: 'useState()', color: '#7cc6ff', pos: [-1.15, 0.1, 1.15], dir: [-1.4, 0.2, 2.0] },
];

const CHIP_W = 0.96;
const CHIP_H = 0.48;
const DEPTH = 0.045;
const RADIUS = 0.12;

function tokenTexture(text, color) {
  const [c, ctx] = makeCanvas(256, 128);
  ctx.clearRect(0, 0, 256, 128);

  // Soft tinted translucent glass backdrop
  ctx.fillStyle = 'rgba(10, 14, 34, 0.78)';
  roundRect(ctx, 6, 6, 244, 116, 16);
  ctx.fill();

  // Vibrant neon border
  ctx.strokeStyle = color;
  ctx.lineWidth = 3.5;
  ctx.shadowColor = color;
  ctx.shadowBlur = 8;
  roundRect(ctx, 6, 6, 244, 116, 16);
  ctx.stroke();

  // Crisp glowing syntax text
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;
  ctx.fillStyle = '#ffffff';
  ctx.font = `800 ${text.length > 8 ? 32 : 40}px ${MONO}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 128, 64);

  return toTexture(c, { anisotropy: 4 });
}

/**
 * 3D Floating Code Fragments / Syntax Tokens for the Hero & About sections.
 * - Glassmorphic floating chips (<UI/>, { API }, ( DB ), async/await, SELECT *, useState())
 * - Cluster harmoniously around the 3-layer stack in Hero
 * - Disperse radially outwards into deep space on scroll as you transition into Layers
 */
export function createFragments() {
  const masterGroup = new THREE.Group();
  masterGroup.name = 'fragments';

  const materials = [];

  const chipShape = roundedRectShape(CHIP_W, CHIP_H, RADIUS);
  const chipGeo = new THREE.ExtrudeGeometry(chipShape, {
    depth: DEPTH,
    bevelEnabled: true,
    bevelThickness: 0.016,
    bevelSize: 0.016,
    bevelSegments: 3,
    curveSegments: 8,
  });
  chipGeo.center();

  const edgeGeo = new THREE.EdgesGeometry(chipGeo, 24);
  const textGeo = new THREE.PlaneGeometry(CHIP_W - 0.04, CHIP_H - 0.04);

  const chips = TOKENS.map((tok, idx) => {
    const group = new THREE.Group();

    // Frosted glass slab
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: '#121735',
      metalness: 0.2,
      roughness: 0.15,
      transmission: 0.55,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      transparent: true,
      opacity: 0.85,
    });
    const glassMesh = new THREE.Mesh(chipGeo, glassMat);
    group.add(glassMesh);
    materials.push(glassMat);

    // Glowing neon wireframe edge
    const edgeMat = new THREE.LineBasicMaterial({
      color: tok.color,
      transparent: true,
      opacity: 0.75,
    });
    const edgeLines = new THREE.LineSegments(edgeGeo, edgeMat);
    group.add(edgeLines);
    materials.push(edgeMat);

    // Front token text plane
    const tex = tokenTexture(tok.text, tok.color);
    const textMat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      depthWrite: false,
    });
    const textMesh = new THREE.Mesh(textGeo, textMat);
    textMesh.position.z = DEPTH / 2 + 0.008;
    group.add(textMesh);

    // Back token text plane (mirrored for full 3D viewing)
    const backTextMesh = new THREE.Mesh(textGeo, textMat);
    backTextMesh.position.z = -(DEPTH / 2 + 0.008);
    backTextMesh.rotation.y = Math.PI;
    group.add(backTextMesh);

    materials.push(textMat);

    // Mini ambient glow point light
    const light = new THREE.PointLight(tok.color, 1.0, 2.2);
    light.position.set(0, 0, 0.25);
    group.add(light);

    masterGroup.add(group);

    return {
      group,
      glassMesh,
      glassMat,
      edgeMat,
      textMat,
      light,
      basePos: new THREE.Vector3(...tok.pos),
      disperseDir: new THREE.Vector3(...tok.dir).normalize(),
      phase: idx * 1.15,
      tok,
    };
  });

  /**
   * @param {number} t             elapsed time
   * @param {object} p
   * @param {number} p.opacity       master opacity (0..1)
   * @param {number} p.disperse      dispersal progress (0 clustered -> 1 dispersed)
   * @param {number} p.stackX        current stack X coordinate
   * @param {number} p.stackY        current stack Y coordinate
   * @param {number} p.stackS        current stack scale
   * @param {number} p.mx            mouse X tilt (-1..1)
   * @param {number} p.my            mouse Y tilt (-1..1)
   * @param {boolean} p.mobile       mobile layout flag
   * @param {boolean} p.reduced      reduced motion flag
   */
  function update(t, { opacity, disperse = 0, stackX = 0, stackY = 0, stackS = 1, mx = 0, my = 0, mobile = false, reduced = false }) {
    masterGroup.visible = opacity > 0.01;
    if (!masterGroup.visible) return;

    const idle = reduced ? 0 : 1;
    const disp = clamp(disperse, 0, 1);
    const mobScale = mobile ? 0.65 : 1.0;

    chips.forEach((c) => {
      // Natural floating harmonic bobbing
      const bobY = Math.sin(t * 1.5 + c.phase) * 0.07 * idle;
      const bobX = Math.cos(t * 1.1 + c.phase) * 0.05 * idle;

      // Dispersal vector: push outwards into deep 3D space
      const dispDistance = disp * 4.5;
      const curX = stackX + (c.basePos.x * mobScale + bobX + c.disperseDir.x * dispDistance) * Math.max(0.4, stackS);
      const curY = stackY + (c.basePos.y * mobScale + bobY + c.disperseDir.y * dispDistance) * Math.max(0.4, stackS);
      const curZ = c.basePos.z + c.disperseDir.z * dispDistance;

      c.group.position.set(curX, curY, curZ);

      // Micro rotation & tilt toward cursor
      c.group.rotation.x = Math.sin(t * 0.75 + c.phase) * 0.12 * idle + my * 0.12;
      c.group.rotation.y = Math.cos(t * 0.85 + c.phase) * 0.15 * idle + mx * 0.18;
      c.group.rotation.z = Math.sin(t * 0.55 + c.phase) * 0.06 * idle;

      // Scale reduces as it disperses
      const s = Math.max(0.35, stackS) * (mobile ? 0.72 : 0.88) * lerp(1.0, 0.25, disp);
      c.group.scale.setScalar(s);

      // Fade out with dispersal
      const chipOp = opacity * (1 - Math.pow(disp, 1.4));
      c.glassMat.opacity = 0.85 * chipOp;
      c.edgeMat.opacity = 0.75 * chipOp;
      c.textMat.opacity = chipOp;
      c.light.intensity = 1.0 * chipOp;
    });
  }

  return { group: masterGroup, chips, materials, update };
}