import * as THREE from 'three';
import { makeCanvas, toTexture } from './textures.js';
import { clamp, lerp, easeOut, easeInOut } from './utils.js';

// --- CONFIGURATION CONSTANTS ---
const LOGOS = [
  { id: 'react', name: 'React', color: '#61dafb' },
  { id: 'next', name: 'Next.js', color: '#000000' },
  { id: 'ts', name: 'TypeScript', color: '#3178c6' },
  { id: 'tailwind', name: 'Tailwind CSS', color: '#38bdf8' },
  { id: 'node', name: 'Node.js', color: '#5fa04e' },
  { id: 'pg', name: 'PostgreSQL', color: '#336791' },
];

const ROW_Z = -8;             // base depth of grid
const CAM_Z = 10;             // camera distance for depth math
const IDLE_OPACITY = 0.6;     // opacity when resting in grid
const ZOOM_OPACITY = 0.95;    // opacity when zoomed in showcase
// -------------------------------

// Shared geometries and materials
const tileShape = new THREE.Shape();
(function() {
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

  function update(time, { progress, fade, hw, hh, mobile, reduced, dt }) {
    masterGroup.visible = fade > 0.01;
    if (!masterGroup.visible) return;

    const depthK = (CAM_Z - ROW_Z) / CAM_Z;
    const halfW = hw * depthK;
    const halfH = hh * depthK;
    const n = items.length;

    // Grid layout on the Right side
    const cols = mobile ? 3 : 2;
    const spacingX = mobile ? 2.5 : 3.5;
    const spacingY = mobile ? 3.0 : 4.0;
    
    // Top-Right resting position
    const startX = mobile ? 0 : halfW * 0.45;
    const startY = mobile ? halfH * 0.4 : halfH * 0.4; // Top part of the section
    
    // Showcase left-center position
    center.set(mobile ? 0 : -halfW * 0.35, mobile ? -halfH * 0.2 : 0, -1.0);
    
    const smallScale = mobile ? 0.45 : 0.65;
    const bigScale = mobile ? 1.6 : 2.5;

    items.forEach((it, i) => {
      // Calculate grid slot
      const col = i % cols;
      const row = Math.floor(i / cols);
      
      const offsetX = (col - (cols - 1) / 2) * spacingX;
      const offsetY = -(row * spacingY); // Go down
      
      slot.set(startX + offsetX, startY + offsetY, ROW_Z);
      
      // We divide the total progress into `n` slices, one for each logo.
      // But we pad it slightly so they don't immediately snap.
      const slice = 1 / n;
      const p = clamp((progress - i * slice) / slice); // 0 to 1 inside its own slice
      const t = reduced ? 0 : p;

      let s = smallScale;
      let zoomFactor = 0;
      let rotPhase = 0; // 0..1 for full 360 turn
      
      if (t === 0 || t === 1) {
        // Resting in grid
        it.group.position.copy(slot);
        // Add tiny idle float to grid items
        it.group.position.y += Math.sin(time * 1.5 + i) * 0.1;
        it.group.rotation.y = 0;
        it.group.rotation.x = 0;
      } else {
        // Animating in showcase
        if (t < 0.5) {
          // Fly out to center
          const a = easeOut(t / 0.5); // 0 -> 1
          it.group.position.lerpVectors(slot, center, a);
          s = lerp(smallScale, bigScale, a);
          zoomFactor = a;
          rotPhase = a * 0.5; // 0 -> 0.5 (180 deg)
        } else {
          // Fly back to grid
          const b = easeInOut((t - 0.5) / 0.5); // 0 -> 1
          it.group.position.lerpVectors(center, slot, b);
          s = lerp(bigScale, smallScale, b);
          zoomFactor = 1 - b;
          rotPhase = 0.5 + b * 0.5; // 0.5 -> 1.0 (360 deg)
        }
        
        // 360 Y Rotation + slight X tilt
        it.group.rotation.y = rotPhase * Math.PI * 2;
        it.group.rotation.x = Math.sin(rotPhase * Math.PI) * 0.25; // tilts down in middle
      }
      
      it.group.scale.setScalar(s);
      
      // Materials
      const currentOp = lerp(IDLE_OPACITY, ZOOM_OPACITY, zoomFactor);
      const op = currentOp * fade;
      
      it.tileMat.opacity = op;
      it.tileMat.emissiveIntensity = lerp(0.05, 1.5, zoomFactor);
      it.edges.material.opacity = lerp(0.3, 1.0, zoomFactor) * fade;
      
      // Hide label while resting in grid to keep it compact. Show when zooming.
      it.label.material.opacity = lerp(0.0, op, Math.pow(zoomFactor, 0.5));
      
      it.emblem.children.forEach(child => {
        if (child.material) {
          child.material.transparent = true;
          child.material.opacity = op;
          if (child.material.emissive) {
            child.material.emissiveIntensity = lerp(0, 1.0, zoomFactor);
          }
        }
      });
      
      it.pLight.intensity = lerp(0, 25, Math.pow(zoomFactor, 1.5)) * fade;
    });
  }

  return { group: masterGroup, items, update };
}
