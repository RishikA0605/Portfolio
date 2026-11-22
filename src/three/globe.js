import * as THREE from 'three';
import { glowTexture } from './textures.js';
import { setOpacity, lerp } from './utils.js';

const RADIUS = 1.25;

/** Convert latitude and longitude to 3D Cartesian coordinates on the sphere. */
function latLonToVec3(lat, lon, r = RADIUS) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

/**
 * 3D Holographic Network Globe for the Contact section.
 * - Dark holographic glass core sphere with neon cyan wireframe grid
 * - Glowing communication arcs (system design / global data connections)
 * - Orbiting satellite nodes with glowing signal point lights
 * - Interactive pulse & expanding communication waves on "Email me" hover
 */
export function createGlobe() {
  const masterGroup = new THREE.Group();
  masterGroup.name = 'globe';

  const body = new THREE.Group();
  masterGroup.add(body);

  const materials = [];

  // ── Inner Holographic Glass Sphere ──
  const glassGeo = new THREE.SphereGeometry(RADIUS * 0.98, 36, 28);
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: '#0a0e26',
    metalness: 0.2,
    roughness: 0.1,
    transmission: 0.65,
    transparent: true,
    opacity: 0.85,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
  });
  const glassMesh = new THREE.Mesh(glassGeo, glassMat);
  body.add(glassMesh);
  materials.push(glassMat);

  // ── Outer Wireframe Lat/Long Grid ──
  const wireGeo = new THREE.WireframeGeometry(new THREE.SphereGeometry(RADIUS, 28, 16));
  const wireMat = new THREE.LineBasicMaterial({
    color: '#3fd6c6',
    transparent: true,
    opacity: 0.35,
  });
  const wireMesh = new THREE.LineSegments(wireGeo, wireMat);
  body.add(wireMesh);
  materials.push(wireMat);

  // ── Surface Data Node Points ──
  // Key global tech hub coordinates (US East, US West, India, Europe, Japan, Australia, etc.)
  const cities = [
    { lat: 28.6, lon: 77.2, name: 'India (Delhi/Patna)' },
    { lat: 12.9, lon: 77.6, name: 'Bangalore' },
    { lat: 37.7, lon: -122.4, name: 'San Francisco' },
    { lat: 40.7, lon: -74.0, name: 'New York' },
    { lat: 51.5, lon: -0.1, name: 'London' },
    { lat: 35.6, lon: 139.6, name: 'Tokyo' },
    { lat: 1.3, lon: 103.8, name: 'Singapore' },
    { lat: 52.5, lon: 13.4, name: 'Berlin' },
    { lat: -33.8, lon: 151.2, name: 'Sydney' },
    { lat: 25.2, lon: 55.2, name: 'Dubai' },
    { lat: 47.6, lon: -122.3, name: 'Seattle' },
  ];

  const dotGeo = new THREE.SphereGeometry(0.038, 12, 12);
  const dotMat = new THREE.MeshStandardMaterial({
    color: '#3fd6c6',
    emissive: '#3fd6c6',
    emissiveIntensity: 0.8,
    transparent: true,
  });
  materials.push(dotMat);

  const dotPositions = cities.map((c) => {
    const pos = latLonToVec3(c.lat, c.lon, RADIUS * 1.005);
    const m = new THREE.Mesh(dotGeo, dotMat);
    m.position.copy(pos);
    body.add(m);
    return pos;
  });

  // ── Glowing Communication Arcs ──
  // Arching Bezier curves between global nodes
  const arcConnections = [
    [0, 2, '#3fd6c6'], // India -> US West (clients)
    [0, 3, '#ffb86b'], // India -> US East
    [0, 4, '#7cc6ff'], // India -> London
    [2, 3, '#3fd6c6'], // US West -> US East
    [3, 4, '#ffb86b'], // US East -> London
    [4, 7, '#8ce0b0'], // London -> Berlin
    [0, 5, '#7cc6ff'], // India -> Tokyo
    [0, 6, '#3fd6c6'], // India -> Singapore
    [6, 8, '#ffb86b'], // Singapore -> Sydney
  ];

  const arcMeshes = [];
  arcConnections.forEach(([fromIdx, toIdx, color]) => {
    const p1 = dotPositions[fromIdx];
    const p2 = dotPositions[toIdx];
    const dist = p1.distanceTo(p2);

    // Height of arc proportional to distance
    const mid = p1.clone().add(p2).multiplyScalar(0.5);
    const arcH = Math.min(dist * 0.35, 0.55);
    mid.normalize().multiplyScalar(RADIUS + arcH);

    const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
    const tubeGeo = new THREE.TubeGeometry(curve, 28, 0.014, 8, false);
    const tubeMat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.75,
    });
    const tube = new THREE.Mesh(tubeGeo, tubeMat);
    body.add(tube);
    materials.push(tubeMat);
    arcMeshes.push({ mesh: tube, mat: tubeMat, baseColor: new THREE.Color(color) });
  });

  // ── Orbiting Satellite Relays & Gyroscopic Rings ──
  const ring1Group = new THREE.Group();
  ring1Group.rotation.x = Math.PI / 3;
  body.add(ring1Group);

  const ringGeo1 = new THREE.TorusGeometry(1.68, 0.016, 16, 64);
  const ringMat1 = new THREE.MeshStandardMaterial({
    color: '#3fd6c6',
    emissive: '#3fd6c6',
    emissiveIntensity: 0.35,
    metalness: 0.9,
    roughness: 0.2,
    transparent: true,
  });
  const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
  ring1Group.add(ring1);
  materials.push(ringMat1);

  const satGeo = new THREE.OctahedronGeometry(0.09, 0);
  const satMat = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    emissive: '#3fd6c6',
    emissiveIntensity: 0.9,
    metalness: 0.8,
    roughness: 0.2,
    transparent: true,
  });
  const sat1 = new THREE.Mesh(satGeo, satMat);
  ring1Group.add(sat1);
  materials.push(satMat);

  const satLight1 = new THREE.PointLight('#3fd6c6', 2.2, 3.8);
  sat1.add(satLight1);

  const ring2Group = new THREE.Group();
  ring2Group.rotation.y = Math.PI / 4;
  ring2Group.rotation.z = -Math.PI / 4;
  body.add(ring2Group);

  const ringGeo2 = new THREE.TorusGeometry(1.82, 0.012, 16, 64);
  const ringMat2 = new THREE.MeshStandardMaterial({
    color: '#ffb86b',
    emissive: '#ffb86b',
    emissiveIntensity: 0.35,
    metalness: 0.9,
    roughness: 0.2,
    transparent: true,
  });
  const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
  ring2Group.add(ring2);
  materials.push(ringMat2);

  const sat2 = new THREE.Mesh(satGeo, satMat);
  ring2Group.add(sat2);

  const satLight2 = new THREE.PointLight('#ffb86b', 2.0, 3.8);
  sat2.add(satLight2);

  // ── Central Glowing Core Light ──
  const coreLight = new THREE.PointLight('#3fd6c6', 2.4, 6.0);
  body.add(coreLight);

  // ── Expanding Hover Signal Ripple Ring ──
  const rippleGeo = new THREE.RingGeometry(0.1, 0.16, 48);
  const rippleMat = new THREE.MeshBasicMaterial({
    color: '#3fd6c6',
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
  });
  const rippleMesh = new THREE.Mesh(rippleGeo, rippleMat);
  body.add(rippleMesh);
  materials.push(rippleMat);

  // ── Ambient Data Dust Particles ──
  const P_COUNT = 60;
  const pPos = new Float32Array(P_COUNT * 3);
  for (let i = 0; i < P_COUNT; i++) {
    const v = latLonToVec3((Math.random() - 0.5) * 160, (Math.random() - 0.5) * 360, RADIUS * (1.1 + Math.random() * 0.45));
    pPos[i * 3] = v.x;
    pPos[i * 3 + 1] = v.y;
    pPos[i * 3 + 2] = v.z;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({
    color: '#3fd6c6',
    size: 0.12,
    map: glowTexture(),
    transparent: true,
    opacity: 0.6,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const pMesh = new THREE.Points(pGeo, pMat);
  body.add(pMesh);
  materials.push(pMat);

  let isHovered = false;
  let hoverStrength = 0;
  let rippleScale = 0;

  function setHover(hovered) {
    isHovered = hovered;
  }

  /**
   * @param {number} t   elapsed time
   * @param {number} dt  delta time
   * @param {object} p
   * @param {number} p.opacity
   * @param {boolean} p.reduced
   */
  function update(t, dt, { opacity, reduced }) {
    masterGroup.visible = opacity > 0.01;
    if (!masterGroup.visible) return;

    const idle = reduced ? 0 : 1;

    hoverStrength += ((isHovered ? 1 : 0) - hoverStrength) * 0.12;

    // Slow rotation of globe on Y axis (accelerates slightly when hovered)
    const rotSpeed = 0.25 + hoverStrength * 0.6;
    body.rotation.y = t * rotSpeed * idle;
    body.position.y = Math.sin(t * 1.5) * 0.06 * idle;

    // Orbiting satellites
    const angle1 = t * (0.8 + hoverStrength * 1.5);
    sat1.position.set(Math.cos(angle1) * 1.68, Math.sin(angle1) * 1.68, 0);

    const angle2 = -t * (0.6 + hoverStrength * 1.2);
    sat2.position.set(Math.cos(angle2) * 1.82, Math.sin(angle2) * 1.82, 0);

    // Glowing core pulse
    coreLight.intensity = (2.2 + Math.sin(t * 2.5) * 0.6 + hoverStrength * 4.0) * opacity;
    wireMat.opacity = (0.3 + hoverStrength * 0.35) * opacity;

    // Arc communication beam shimmer
    arcMeshes.forEach((a, i) => {
      a.mat.opacity = (0.55 + Math.sin(t * 3.5 + i) * 0.3 + hoverStrength * 0.4) * opacity;
    });

    // Expanding signal ripple on hover
    if (isHovered || hoverStrength > 0.05) {
      rippleScale = (rippleScale + dt * 1.8) % 1;
      const rSize = 0.5 + rippleScale * 1.9;
      rippleMesh.scale.set(rSize, rSize, 1);
      rippleMat.opacity = (1 - rippleScale) * hoverStrength * 0.75 * opacity;
    } else {
      rippleMat.opacity = 0;
      rippleScale = 0;
    }

    pMat.size = 0.1 + hoverStrength * 0.08;
    pMat.opacity = (0.4 + hoverStrength * 0.5) * opacity;

    setOpacity(materials, opacity);
  }

  return { group: masterGroup, body, materials, setHover, update };
}
