/**
 * Laptop screen previews for each project, drawn with canvas.
 *
 * To use a real screenshot instead, set `screenImage` on the project in
 * src/content.js (e.g. '/screens/devsync.webp' placed in /public). The image
 * is loaded and replaces the drawn preview automatically. Aim for 1024×640.
 */
import * as THREE from 'three';
import { makeCanvas, roundRect, toTexture, SANS, MONO } from './textures.js';

export const SCREEN_W = 1024;
export const SCREEN_H = 640;

function bar(ctx, x, y, w, h, color, r = h / 2) {
  roundRect(ctx, x, y, w, h, r);
  ctx.fillStyle = color;
  ctx.fill();
}

function browserChrome(ctx, bg, fg) {
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, SCREEN_W, 44);
  ['#ff6b6b', '#ffcc66', '#6bdc8b'].forEach((c, i) => {
    ctx.beginPath();
    ctx.arc(26 + i * 22, 22, 6.5, 0, Math.PI * 2);
    ctx.fillStyle = c;
    ctx.fill();
  });
  bar(ctx, 300, 12, 424, 20, fg);
}

function drawDevSync(ctx) {
  ctx.fillStyle = '#0d1022';
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  browserChrome(ctx, '#151935', 'rgba(255,255,255,0.08)');
  // sidebar
  ctx.fillStyle = '#121633';
  ctx.fillRect(0, 44, 190, SCREEN_H - 44);
  ctx.fillStyle = '#edeaf5';
  ctx.font = `700 24px ${SANS}`;
  ctx.fillText('DevSync AI', 22, 86);
  const ws = ['#7cc6ff', '#ffb86b', '#8ce0b0', '#c3a6ff'];
  ws.forEach((c, i) => {
    bar(ctx, 22, 118 + i * 44, 26, 26, c, 7);
    bar(ctx, 58, 126 + i * 44, 92 - i * 10, 10, 'rgba(237,234,245,0.35)');
  });
  // chat column
  ctx.fillStyle = '#9a98b4';
  ctx.font = `600 16px ${MONO}`;
  ctx.fillText('# general', 214, 80);
  const msgs = [
    [0, 230, '#7cc6ff'],
    [1, 180, '#ffb86b'],
    [0, 250, '#8ce0b0'],
    [1, 150, '#7cc6ff'],
    [0, 210, '#c3a6ff'],
  ];
  msgs.forEach(([me, w, c], i) => {
    const y = 108 + i * 84;
    const x = me ? 520 - w - 20 : 252;
    if (!me) {
      ctx.beginPath();
      ctx.arc(230, y + 18, 13, 0, Math.PI * 2);
      ctx.fillStyle = c;
      ctx.fill();
    }
    bar(ctx, x, y, w, 52, me ? 'rgba(124,198,255,0.22)' : 'rgba(255,255,255,0.07)', 14);
    bar(ctx, x + 16, y + 15, w * 0.7, 8, 'rgba(237,234,245,0.55)');
    bar(ctx, x + 16, y + 30, w * 0.45, 8, 'rgba(237,234,245,0.3)');
  });
  bar(ctx, 214, SCREEN_H - 62, 300, 40, 'rgba(255,255,255,0.06)', 12);
  // kanban
  const cols = ['To do', 'Doing', 'Done'];
  const colors = ['#7cc6ff', '#ffb86b', '#8ce0b0'];
  cols.forEach((name, i) => {
    const x = 548 + i * 156;
    bar(ctx, x, 64, 144, SCREEN_H - 84, 'rgba(255,255,255,0.035)', 14);
    ctx.fillStyle = colors[i];
    ctx.font = `700 15px ${SANS}`;
    ctx.fillText(name, x + 14, 92);
    for (let k = 0; k < 4 - i; k++) {
      const y = 110 + k * 96;
      bar(ctx, x + 10, y, 124, 82, '#171b3a', 10);
      bar(ctx, x + 22, y + 16, 36, 8, colors[i]);
      bar(ctx, x + 22, y + 36, 92, 8, 'rgba(237,234,245,0.45)');
      bar(ctx, x + 22, y + 52, 64, 8, 'rgba(237,234,245,0.25)');
    }
  });
}

function drawAdventra(ctx) {
  ctx.fillStyle = '#f6f1ea';
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  browserChrome(ctx, '#e9e2d8', 'rgba(0,0,0,0.08)');
  // nav
  ctx.fillStyle = '#1d2a3a';
  ctx.font = `800 26px ${SANS}`;
  ctx.fillText('Adventra', 40, 90);
  [0, 1, 2].forEach((i) => bar(ctx, 620 + i * 96, 78, 70, 10, 'rgba(29,42,58,0.35)'));
  bar(ctx, 900, 68, 90, 32, '#ff7a59', 16);
  // hero banner
  const g = ctx.createLinearGradient(40, 118, 984, 330);
  g.addColorStop(0, '#ff9a62');
  g.addColorStop(0.55, '#f2668b');
  g.addColorStop(1, '#5b6cf0');
  roundRect(ctx, 40, 118, 944, 200, 22);
  ctx.fillStyle = g;
  ctx.fill();
  // mountains
  ctx.fillStyle = 'rgba(29,42,58,0.35)';
  ctx.beginPath();
  ctx.moveTo(520, 318);
  ctx.lineTo(680, 190);
  ctx.lineTo(780, 270);
  ctx.lineTo(860, 210);
  ctx.lineTo(984, 318);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = `800 40px ${SANS}`;
  ctx.fillText('Explore destinations', 76, 200);
  bar(ctx, 76, 228, 260, 12, 'rgba(255,255,255,0.7)');
  bar(ctx, 76, 262, 150, 36, '#1d2a3a', 18);
  // destination cards
  const tones = [
    ['#5fb3c9', '#2f6f86'],
    ['#f0b35b', '#c0673a'],
    ['#7bc47f', '#3d7a52'],
    ['#9d8cf0', '#5747b8'],
  ];
  tones.forEach(([a, b], i) => {
    const x = 40 + i * 240;
    roundRect(ctx, x, 344, 224, 256, 18);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    const cg = ctx.createLinearGradient(x, 344, x, 484);
    cg.addColorStop(0, a);
    cg.addColorStop(1, b);
    roundRect(ctx, x + 10, 354, 204, 130, 12);
    ctx.fillStyle = cg;
    ctx.fill();
    bar(ctx, x + 16, 500, 140, 12, '#1d2a3a');
    bar(ctx, x + 16, 524, 100, 9, 'rgba(29,42,58,0.35)');
    bar(ctx, x + 16, 556, 88, 28, '#ff7a59', 14);
  });
}

function drawRestaurant(ctx) {
  ctx.fillStyle = '#1a120d';
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  browserChrome(ctx, '#2a1d15', 'rgba(255,255,255,0.08)');
  ctx.fillStyle = '#ffcf8a';
  ctx.font = `800 30px ${SANS}`;
  ctx.fillText('Menu', 40, 98);
  // tabs
  ['Starters', 'Mains', 'Desserts', 'Drinks'].forEach((t, i) => {
    const x = 40 + i * 130;
    bar(ctx, x, 120, 118, 36, i === 1 ? '#ff9f43' : 'rgba(255,255,255,0.08)', 18);
    ctx.fillStyle = i === 1 ? '#1a120d' : '#f3e6d8';
    ctx.font = `600 16px ${SANS}`;
    ctx.fillText(t, x + 20, 144);
  });
  // menu list
  for (let i = 0; i < 5; i++) {
    const y = 184 + i * 86;
    ctx.beginPath();
    ctx.arc(72, y + 32, 30, 0, Math.PI * 2);
    const pg = ctx.createRadialGradient(64, y + 24, 4, 72, y + 32, 30);
    pg.addColorStop(0, ['#ffd27f', '#ff8a5c', '#9fd67a', '#ff6f6f', '#ffc2a1'][i]);
    pg.addColorStop(1, '#5a3420');
    ctx.fillStyle = pg;
    ctx.fill();
    bar(ctx, 122, y + 16, 180 + (i % 3) * 30, 12, '#f3e6d8');
    bar(ctx, 122, y + 40, 240, 9, 'rgba(243,230,216,0.35)');
    ctx.setLineDash([3, 7]);
    ctx.strokeStyle = 'rgba(243,230,216,0.25)';
    ctx.beginPath();
    ctx.moveTo(400, y + 26);
    ctx.lineTo(540, y + 26);
    ctx.stroke();
    ctx.setLineDash([]);
    bar(ctx, 552, y + 18, 46, 16, '#ff9f43');
  }
  // offer panel
  const g = ctx.createLinearGradient(640, 120, 984, 600);
  g.addColorStop(0, '#ff9f43');
  g.addColorStop(1, '#e8505b');
  roundRect(ctx, 640, 120, 344, 480, 22);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.fillStyle = '#1a120d';
  ctx.font = `800 34px ${SANS}`;
  ctx.fillText("Today's offers", 668, 176);
  for (let i = 0; i < 3; i++) {
    bar(ctx, 668, 210 + i * 120, 288, 100, 'rgba(26,18,13,0.18)', 16);
    bar(ctx, 688, 236 + i * 120, 160, 12, 'rgba(26,18,13,0.75)');
    bar(ctx, 688, 260 + i * 120, 110, 9, 'rgba(26,18,13,0.45)');
  }
}

const DRAWERS = { devsync: drawDevSync, adventra: drawAdventra, restaurant: drawRestaurant };

/** Build one texture per project. Real screenshots (screenImage) override the drawing. */
export function createProjectScreens(projects) {
  const loader = new THREE.TextureLoader();
  return projects.map((p) => {
    const [c, ctx] = makeCanvas(SCREEN_W, SCREEN_H);
    (DRAWERS[p.screen] || drawDevSync)(ctx);
    const tex = toTexture(c, { anisotropy: 8 });
    if (p.screenImage) {
      loader.load(p.screenImage, (img) => {
        tex.image = img.image;
        tex.needsUpdate = true;
        img.dispose();
      });
    }
    return tex;
  });
}
