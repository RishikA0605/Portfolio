import * as THREE from 'three';
import { makeCanvas, toTexture, roundRect } from './textures.js';
import { clamp, lerp, easeOut, easeInOut, roundedRectShape } from './utils.js';

// --- BALANCED ARCHITECTURAL LAYOUT ---
// Placed symmetrically in flanking wings and an elevated crown with ample clearance around the 3D stack slabs
export const LOGO_DEFS = [
  // Top Crown (UI Layer)
  { id: 'react', name: 'React', layer: 0, color: '#61dafb', role: 'Component UI', x: -2.85, yOffset: 0.18, z: 0.35 },
  { id: 'next', name: 'Next.js', layer: 0, color: '#edeaf5', role: 'App Framework', x: 0.0, yOffset: 1.28, z: 0.55 },
  { id: 'tailwind', name: 'Tailwind CSS', layer: 0, color: '#38bdf8', role: 'Design System', x: 2.85, yOffset: 0.18, z: 0.35 },
  // Middle Wing (API Layer)
  { id: 'node', name: 'Node.js', layer: 1, color: '#5fa04e', role: 'Microservices & APIs', x: -2.95, yOffset: 0.0, z: 0.4 },
  { id: 'ts', name: 'TypeScript', layer: 1, color: '#3178c6', role: 'Strict Type Safety', x: 2.95, yOffset: 0.0, z: 0.4 },
  // Bottom Wing (DB Layer)
  { id: 'pg', name: 'PostgreSQL', layer: 2, color: '#336791', role: 'Relational Database', x: -2.85, yOffset: -0.22, z: 0.35 },
  { id: 'redis', name: 'Redis', layer: 2, color: '#ff4438', role: 'In-Memory Cache & Pub/Sub', x: 2.85, yOffset: -0.22, z: 0.35 },
];

// Clean perimeter pipeline routes — zero intersection with stack slabs
export const CONNECTIONS = [
  { from: 'react', to: 'next', color: '#61dafb', label: 'JSX ➔ Next.js', arc: [-1.4, 0.9, 0.45] },
  { from: 'tailwind', to: 'next', color: '#38bdf8', label: 'Styles ➔ Next.js', arc: [1.4, 0.9, 0.45] },
  { from: 'next', to: 'node', color: '#7cc6ff', label: 'Server Actions ➔ Node.js', arc: [-2.1, 0.65, 0.6] },
  { from: 'next', to: 'ts', color: '#3178c6', label: 'End-to-End Typed Payloads', arc: [2.1, 0.65, 0.6] },
  { from: 'node', to: 'pg', color: '#5fa04e', label: 'Prisma Relational Queries', arc: [-3.05, -0.6, 0.45] },
  { from: 'ts', to: 'redis', color: '#ff4438', label: 'Typed Cache & Session Store', arc: [3.05, -0.6, 0.45] },
];

const TILE_W = 0.86;
const TILE_H = 0.86;
const TILE_D = 0.12;

function createTextPlane(text, color = '#ffffff') {
  const [c, ctx] = makeCanvas(256, 256);
  ctx.fillStyle = color;
  ctx.font = 'bold 120px "Bricolage Grotesque", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 128, 128);
  const geo = new THREE.PlaneGeometry(0.68, 0.68);
  const mat = new THREE.MeshBasicMaterial({ map: toTexture(c), transparent: true, depthWrite: false });
  return new THREE.Mesh(geo, mat);
}

function createLabelPlane(name) {
  const [c, ctx] = makeCanvas(512, 128);
  ctx.fillStyle = '#edeaf5';
  ctx.font = 'bold 52px "Bricolage Grotesque", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(name, 256, 64);
  const geo = new THREE.PlaneGeometry(1.35, 0.34);
  const mat = new THREE.MeshBasicMaterial({ map: toTexture(c), transparent: true, depthWrite: false });
  return new THREE.Mesh(geo, mat);
}

function buildEmblem(id, color) {
  const group = new THREE.Group();
  group.position.z = TILE_D / 2 + 0.02;

  const wMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, metalness: 0.2 });
  const cMat = new THREE.MeshStandardMaterial({ color, roughness: 0.25, metalness: 0.3, emissive: color, emissiveIntensity: 0.15 });

  if (id === 'react') {
    const tGeo = new THREE.TorusGeometry(0.26, 0.032, 8, 32);
    const r1 = new THREE.Mesh(tGeo, cMat);
    const r2 = new THREE.Mesh(tGeo, cMat); r2.rotation.z = Math.PI / 3;
    const r3 = new THREE.Mesh(tGeo, cMat); r3.rotation.z = -Math.PI / 3;
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.075, 16, 16), cMat);
    r1.scale.set(1, 0.38, 1);
    r2.scale.set(1, 0.38, 1);
    r3.scale.set(1, 0.38, 1);
    group.add(r1, r2, r3, core);
  } else if (id === 'next') {
    const discGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.035, 32);
    discGeo.rotateX(Math.PI / 2);
    const disc = new THREE.Mesh(discGeo, new THREE.MeshStandardMaterial({ color: 0x0a0c18, roughness: 0.4 }));
    const ringGeo = new THREE.TorusGeometry(0.3, 0.018, 8, 32);
    const ring = new THREE.Mesh(ringGeo, wMat);
    const txt = createTextPlane('N', '#ffffff');
    txt.scale.set(0.55, 0.55, 0.55);
    txt.position.z = 0.025;
    group.add(disc, ring, txt);
  } else if (id === 'tailwind') {
    class WaveCurve extends THREE.Curve {
      getPoint(t, optionalTarget = new THREE.Vector3()) {
        const x = (t - 0.5) * 0.58;
        const y = Math.sin(t * Math.PI * 2) * 0.11;
        return optionalTarget.set(x, y, 0);
      }
    }
    const tubeGeo = new THREE.TubeGeometry(new WaveCurve(), 24, 0.048, 8, false);
    const w1 = new THREE.Mesh(tubeGeo, cMat); w1.position.y = 0.095;
    const w2 = new THREE.Mesh(tubeGeo, cMat); w2.position.y = -0.095;
    group.add(w1, w2);
  } else if (id === 'node') {
    const hexGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.065, 6);
    hexGeo.rotateX(Math.PI / 2);
    hexGeo.rotateZ(Math.PI / 2);
    const hex = new THREE.Mesh(hexGeo, cMat);
    const txt = createTextPlane('JS', '#ffffff');
    txt.scale.set(0.5, 0.5, 0.5);
    txt.position.z = 0.04;
    group.add(hex, txt);
  } else if (id === 'ts') {
    const bgGeo = new THREE.PlaneGeometry(0.52, 0.52);
    const bgMat = new THREE.MeshStandardMaterial({ color: '#3178c6', roughness: 0.3, metalness: 0.3 });
    const bg = new THREE.Mesh(bgGeo, bgMat);
    const txt = createTextPlane('TS', '#ffffff');
    txt.scale.set(0.55, 0.55, 0.55);
    txt.position.z = 0.01;
    group.add(bg, txt);
  } else if (id === 'pg') {
    const cylGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.065, 32);
    cylGeo.rotateX(Math.PI / 2);
    const c1 = new THREE.Mesh(cylGeo, cMat); c1.position.y = 0.13;
    const c2 = new THREE.Mesh(cylGeo, cMat); c2.position.y = 0;
    const c3 = new THREE.Mesh(cylGeo, cMat); c3.position.y = -0.13;
    const txt = createTextPlane('Pg', '#ffffff');
    txt.scale.set(0.46, 0.46, 0.46);
    txt.position.z = 0.05;
    group.add(c1, c2, c3, txt);
  } else if (id === 'redis') {
    for (let i = 0; i < 3; i++) {
      const geo = new THREE.CylinderGeometry(0.26 - i * 0.018, 0.28 - i * 0.018, 0.05, 18);
      geo.rotateX(Math.PI / 2);
      const m = new THREE.Mesh(geo, cMat);
      m.position.y = (i - 1) * 0.1;
      group.add(m);
    }
    const txt = createTextPlane('Rd', '#ffffff');
    txt.scale.set(0.46, 0.46, 0.46);
    txt.position.z = 0.05;
    group.add(txt);
  }
  return group;
}

/** Floating holographic tooltip badge showing role & connection information */
function createHoloBadge() {
  const [c, ctx] = makeCanvas(512, 128);
  const tex = toTexture(c);
  const geo = new THREE.PlaneGeometry(2.2, 0.55);
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0, depthWrite: false });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.visible = false;

  function updateContent(title, subtitle, color = '#7cc6ff') {
    ctx.clearRect(0, 0, 512, 128);

    ctx.fillStyle = 'rgba(8, 12, 30, 0.92)';
    roundRect(ctx, 4, 4, 504, 120, 18);
    ctx.fill();

    ctx.strokeStyle = color;
    ctx.lineWidth = 3.5;
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    roundRect(ctx, 4, 4, 504, 120, 18);
    ctx.stroke();

    ctx.shadowColor = 'transparent';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 34px "Bricolage Grotesque", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, 256, 48);

    ctx.fillStyle = color;
    ctx.font = '600 22px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.fillText(subtitle, 256, 90);

    tex.needsUpdate = true;
  }

  return { mesh, mat, updateContent };
}

/**
 * 3D Tech Stack: Assembled Stack + Dependency Graph (Option E + B Hybrid)
 * - Refined, uncrowded layout with generous clearance around the 3D stack slabs
 * - Top crown (Next.js) elevated clearly above the UI slab with zero text clash
 * - Flanking wings (React/Node/Pg on left, Tailwind/TS/Redis on right) well outside slab boundaries
 * - Curved cybernetic perimeter pipelines with glowing traveling energy packets
 * - Interactive hover with raycasting, dynamic glow, and holographic inspector badge
 */
export function createLogos({ light }) {
  const masterGroup = new THREE.Group();
  masterGroup.name = 'tech-stack-graph';

  // Tile geometries
  const tileShape = roundedRectShape(TILE_W, TILE_H, 0.14);
  const tileGeo = new THREE.ExtrudeGeometry(tileShape, {
    depth: TILE_D,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.025,
    bevelThickness: 0.025,
  });
  tileGeo.center();
  const tileEdgesGeo = new THREE.EdgesGeometry(tileGeo, 24);
  const edgeMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.4 });

  // 1. Create Nodes
  const nodes = LOGO_DEFS.map((def) => {
    const group = new THREE.Group();
    group.name = `node-${def.id}`;

    let cHex = def.color;
    if (def.id === 'next') cHex = light ? '#15172b' : '#edeaf5';

    // Frosted glass slab
    const tileMat = new THREE.MeshStandardMaterial({
      color: cHex,
      roughness: 0.2,
      metalness: 0.75,
      emissive: cHex,
      emissiveIntensity: 0.08,
      transparent: true,
      opacity: 0.85,
    });
    const tile = new THREE.Mesh(tileGeo, tileMat);
    tile.userData = { nodeId: def.id, def };

    const edges = new THREE.LineSegments(tileEdgesGeo, edgeMat.clone());
    const emblem = buildEmblem(def.id, cHex);
    const label = createLabelPlane(def.name);
    label.position.y = -0.62;

    // Local point light
    const pLight = new THREE.PointLight(cHex, 0, 3.5);
    pLight.position.set(0, 0, 0.25);

    group.add(tile, edges, emblem, label, pLight);
    masterGroup.add(group);

    return {
      id: def.id,
      def,
      group,
      tile,
      edges,
      tileMat,
      pLight,
      emblem,
      label,
      baseColor: new THREE.Color(cHex),
      targetPos: new THREE.Vector3(),
      curPos: new THREE.Vector3(),
      hoverScale: 1,
      isHovered: false,
    };
  });

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  // 2. Create Dependency Pipelines & Moving Data Pulses
  const PULSES_PER_CONN = 2;
  const pulseGeo = new THREE.SphereGeometry(0.04, 12, 12);

  const pipelines = CONNECTIONS.map((cDef) => {
    const pipeGroup = new THREE.Group();

    const lineMat = new THREE.LineBasicMaterial({
      color: cDef.color,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
    });

    const lineGeo = new THREE.BufferGeometry();
    const lineMesh = new THREE.Line(lineGeo, lineMat);
    pipeGroup.add(lineMesh);

    // Glowing energy pulse packets
    const pulses = [];
    for (let i = 0; i < PULSES_PER_CONN; i++) {
      const pMat = new THREE.MeshBasicMaterial({
        color: cDef.color,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
      });
      const pMesh = new THREE.Mesh(pulseGeo, pMat);
      pipeGroup.add(pMesh);
      pulses.push({ mesh: pMesh, mat: pMat, offset: i / PULSES_PER_CONN });
    }

    masterGroup.add(pipeGroup);

    return {
      cDef,
      pipeGroup,
      lineMesh,
      lineMat,
      lineGeo,
      pulses,
      curve: null,
      active: false,
    };
  });

  // 3. Floating Tooltip / Holographic Badge
  const holoBadge = createHoloBadge();
  masterGroup.add(holoBadge.mesh);

  // Raycaster for mouse picking
  const raycaster = new THREE.Raycaster();
  const pickTiles = nodes.map((n) => n.tile);

  let activeLayerGlow = [0, 0, 0];
  let hoveredNodeId = null;

  /**
   * @param {number} t
   * @param {number} dt
   * @param {object} p
   */
  function update(t, dt, {
    progress = 0,
    fade = 0,
    hw = 5,
    hh = 3,
    mobile = false,
    reduced = false,
    stackX = 0,
    stackY = 0,
    stackS = 0.72,
    explode = 0.85,
    mx = 0,
    my = 0,
    pointer = null,
    camera = null,
  }) {
    masterGroup.visible = fade > 0.01;
    if (!masterGroup.visible) return;

    const idle = reduced ? 0 : 1;
    const mobScale = mobile ? 0.68 : 1.0;

    // Raycast hover check
    hoveredNodeId = null;
    if (pointer && camera && !reduced) {
      raycaster.setFromCamera(new THREE.Vector2(pointer.x, pointer.y), camera);
      const hits = raycaster.intersectObjects(pickTiles);
      if (hits.length > 0) {
        hoveredNodeId = hits[0].object.userData.nodeId;
      }
    }

    // Scroll-driven layer emphasis (UI: 0.0-0.35, API: 0.35-0.70, DB: 0.70-1.0)
    let activeLayer = 0;
    if (progress > 0.35 && progress <= 0.7) activeLayer = 1;
    else if (progress > 0.7) activeLayer = 2;

    const targetGlow = [
      activeLayer === 0 ? 0.8 : 0.1,
      activeLayer === 1 ? 0.8 : 0.1,
      activeLayer === 2 ? 0.8 : 0.1,
    ];

    // Compute node docking positions relative to stack slabs
    // THICK = 0.3 matches stack.js
    const gap = lerp(0.07, 1.05, explode);
    const THICK = 0.3;

    nodes.forEach((n, idx) => {
      const def = n.def;
      const slabY = (1 - def.layer) * (THICK + gap);

      // Natural bobbing
      const bobY = Math.sin(t * 1.5 + idx * 1.1) * 0.035 * idle;
      const bobX = Math.cos(t * 1.1 + idx * 0.9) * 0.025 * idle;

      // Position in world space:
      // def.x is the horizontal offset from stack center (wide enough to completely avoid the slabs)
      // def.yOffset adds extra vertical separation from the slab
      const tx = stackX + (def.x * mobScale + bobX) * stackS;
      const ty = stackY + (slabY + def.yOffset + bobY) * stackS;
      const tz = def.z + Math.sin(t * 0.8 + idx) * 0.04 * idle;

      n.targetPos.set(tx, ty, tz);

      // Smooth position interpolation
      n.curPos.lerp(n.targetPos, 0.22);
      n.group.position.copy(n.curPos);

      // Hover reaction
      const isHovered = hoveredNodeId === def.id;
      n.isHovered = isHovered;
      const targetScale = isHovered ? 1.2 : 1.0;
      n.hoverScale = lerp(n.hoverScale, targetScale, 0.18);

      const baseNodeScale = stackS * (mobile ? 0.74 : 0.86) * n.hoverScale;
      n.group.scale.setScalar(baseNodeScale);

      // Subtle tilt toward mouse
      n.group.rotation.x = 0.12 + my * 0.06 + Math.sin(t * 0.7 + idx) * 0.03 * idle;
      n.group.rotation.y = mx * 0.1 + Math.cos(t * 0.8 + idx) * 0.04 * idle;

      // Glow & Opacity
      const isTierActive = def.layer === activeLayer;
      const nodeOp = fade * (isHovered ? 1.0 : isTierActive ? 0.92 : 0.65);
      n.tileMat.opacity = nodeOp;
      n.tileMat.emissiveIntensity = (isHovered ? 1.6 : isTierActive ? 0.75 : 0.1) * fade;
      n.edges.material.opacity = (isHovered ? 1.0 : isTierActive ? 0.75 : 0.3) * fade;
      n.pLight.intensity = (isHovered ? 5.0 : isTierActive ? 2.0 : 0.3) * fade;

      if (isHovered) {
        targetGlow[def.layer] = 1.0;
      }
    });

    activeLayerGlow = activeLayerGlow.map((g, i) => lerp(g, targetGlow[i], 0.12));

    // Update Pipelines and Pulses
    pipelines.forEach((p) => {
      const fromNode = nodeMap.get(p.cDef.from);
      const toNode = nodeMap.get(p.cDef.to);
      if (!fromNode || !toNode) return;

      const p1 = fromNode.group.position;
      const p2 = toNode.group.position;

      // Outer arched control point to guarantee curve stays on perimeter outside the slabs
      const mid = p1.clone().add(p2).multiplyScalar(0.5);
      mid.x += p.cDef.arc[0] * stackS * 0.45;
      mid.y += p.cDef.arc[1] * stackS * 0.45;
      mid.z += p.cDef.arc[2];

      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
      p.curve = curve;

      // Update line points
      const points = curve.getPoints(24);
      p.lineGeo.setFromPoints(points);

      const isConnectedHover = hoveredNodeId === p.cDef.from || hoveredNodeId === p.cDef.to;
      const isTierActive = fromNode.def.layer === activeLayer || toNode.def.layer === activeLayer;

      p.lineMat.opacity = fade * (isConnectedHover ? 0.95 : isTierActive ? 0.55 : 0.18);
      p.lineMat.color.set(p.cDef.color);

      // Traverse energy pulses
      const pulseSpeed = isConnectedHover ? 1.8 : 0.9;
      p.pulses.forEach((pulse) => {
        const u = ((t * pulseSpeed * idle + pulse.offset) % 1 + 1) % 1;
        const pos = curve.getPointAt(u);
        pulse.mesh.position.copy(pos);
        pulse.mat.opacity = fade * (isConnectedHover ? 1.0 : isTierActive ? 0.85 : 0.3);
        pulse.mesh.scale.setScalar(isConnectedHover ? 1.35 : 1.0);
      });
    });

    // Holographic Badge display
    if (hoveredNodeId) {
      const hNode = nodeMap.get(hoveredNodeId);
      if (hNode) {
        holoBadge.mesh.visible = true;
        holoBadge.mesh.position.set(hNode.group.position.x, hNode.group.position.y + 0.85 * stackS, hNode.group.position.z + 0.3);
        holoBadge.updateContent(hNode.def.name, hNode.def.role, hNode.def.color);
        holoBadge.mat.opacity = lerp(holoBadge.mat.opacity, 1.0, 0.2);
      }
    } else {
      holoBadge.mat.opacity = lerp(holoBadge.mat.opacity, 0.0, 0.2);
      if (holoBadge.mat.opacity < 0.01) holoBadge.mesh.visible = false;
    }
  }

  function getLayerGlow() {
    return activeLayerGlow;
  }

  return { group: masterGroup, nodes, pipelines, getLayerGlow, update };
}