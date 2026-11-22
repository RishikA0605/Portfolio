/**
 * Laptop & Phone screen previews for each project, drawn procedurally with canvas.
 *
 * To use real screenshots instead, set `screenImage` and `screenImageMobile`
 * on the project in src/content.js (e.g. '/screens/devsync-desktop.webp' and
 * '/screens/devsync-mobile.webp' placed in /public). The image is loaded and
 * replaces the drawn preview automatically.
 */
import * as THREE from 'three';
import { makeCanvas, roundRect, toTexture, SANS, MONO } from './textures.js';

export const SCREEN_W = 1024;
export const SCREEN_H = 640;

export const PHONE_SCREEN_W = 390;
export const PHONE_SCREEN_H = 844;

function bar(ctx, x, y, w, h, color, r = h / 2) {
  roundRect(ctx, x, y, w, h, r);
  ctx.fillStyle = color;
  ctx.fill();
}

function browserChrome(ctx, bg, fg) {
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, SCREEN_W, 44);
  ['#ff5f56', '#ffbd2e', '#27c93f'].forEach((c, i) => {
    ctx.beginPath();
    ctx.arc(24 + i * 20, 22, 6, 0, Math.PI * 2);
    ctx.fillStyle = c;
    ctx.fill();
  });
  bar(ctx, 280, 10, 464, 24, fg, 6);
  ctx.fillStyle = 'rgba(237,234,245,0.45)';
  ctx.font = `500 12px ${MONO}`;
  ctx.fillText('https://app.devsync.ai/workspace', 320, 26);
}

function phoneStatusBar(ctx, light = false) {
  ctx.fillStyle = light ? '#1d2a3a' : '#edeaf5';
  ctx.font = `700 14px ${MONO}`;
  ctx.fillText('9:41', 32, 28);
  // wifi & battery bars
  bar(ctx, PHONE_SCREEN_W - 68, 18, 12, 10, light ? '#1d2a3a' : '#edeaf5', 2);
  bar(ctx, PHONE_SCREEN_W - 50, 17, 20, 12, light ? '#1d2a3a' : '#edeaf5', 3);
}

/* ═════════════════════════════════════════════════════════════
   1. DevSync AI (Desktop & Mobile)
   ═════════════════════════════════════════════════════════════ */

function drawDevSync(ctx) {
  ctx.fillStyle = '#0a0d1e';
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  browserChrome(ctx, '#121630', 'rgba(255,255,255,0.06)');

  // ── Sidebar ──
  ctx.fillStyle = '#0f132b';
  ctx.fillRect(0, 44, 210, SCREEN_H - 44);

  // Logo & workspace
  bar(ctx, 20, 64, 30, 30, '#7cc6ff', 8);
  ctx.fillStyle = '#ffffff';
  ctx.font = `800 16px ${SANS}`;
  ctx.fillText('DevSync AI', 60, 84);

  // Channels
  ctx.fillStyle = 'rgba(154,152,180,0.6)';
  ctx.font = `700 11px ${MONO}`;
  ctx.fillText('CHANNELS', 22, 126);

  const channels = ['# general', '# standup-ai', '# sprints', '# releases'];
  channels.forEach((ch, i) => {
    if (i === 0) bar(ctx, 14, 138 + i * 36, 182, 30, 'rgba(124,198,255,0.14)', 8);
    ctx.fillStyle = i === 0 ? '#7cc6ff' : 'rgba(237,234,245,0.65)';
    ctx.font = `600 13px ${SANS}`;
    ctx.fillText(ch, 26, 158 + i * 36);
  });

  // Copilot pill in sidebar
  bar(ctx, 14, 310, 182, 44, 'rgba(195,166,255,0.12)', 10);
  ctx.fillStyle = '#c3a6ff';
  ctx.font = `700 12px ${SANS}`;
  ctx.fillText('✦ AI Pair Programmer', 26, 332);
  ctx.fillStyle = 'rgba(195,166,255,0.7)';
  ctx.font = `500 10px ${MONO}`;
  ctx.fillText('Online · GPT-4 Turbo', 26, 345);

  // Direct messages with status dots
  ctx.fillStyle = 'rgba(154,152,180,0.6)';
  ctx.font = `700 11px ${MONO}`;
  ctx.fillText('DIRECT MESSAGES', 22, 395);

  const dms = [
    ['Alex R.', '#8ce0b0'],
    ['Sarah K.', '#ffb86b'],
    ['Elena V.', '#8ce0b0'],
  ];
  dms.forEach(([name, dot], i) => {
    ctx.beginPath();
    ctx.arc(28, 420 + i * 30, 4, 0, Math.PI * 2);
    ctx.fillStyle = dot;
    ctx.fill();
    ctx.fillStyle = 'rgba(237,234,245,0.7)';
    ctx.font = `500 13px ${SANS}`;
    ctx.fillText(name, 42, 424 + i * 30);
  });

  // ── Main Chat Feed ──
  ctx.fillStyle = '#10142e';
  ctx.fillRect(210, 44, 370, SCREEN_H - 44);

  // Chat header
  ctx.fillStyle = '#edeaf5';
  ctx.font = `700 15px ${SANS}`;
  ctx.fillText('# general', 230, 76);
  bar(ctx, 510, 62, 54, 22, 'rgba(63,214,198,0.15)', 6);
  ctx.fillStyle = '#3fd6c6';
  ctx.font = `600 11px ${MONO}`;
  ctx.fillText('LIVE', 525, 77);

  // Chat messages
  const msgs = [
    { user: 'Alex', time: '10:24 AM', color: '#7cc6ff', text: 'Auth refactor merged into main. Socket.io is ready!' },
    { user: 'Sarah', time: '10:26 AM', color: '#ffb86b', text: 'Running e2e test suite now. Latency is under 40ms.' },
    { user: 'DevSync AI', time: '10:27 AM', color: '#c3a6ff', text: '✓ Code review passed. 0 vulnerabilities detected in PR #42.' },
  ];
  msgs.forEach((m, i) => {
    const y = 100 + i * 110;
    // Avatar
    bar(ctx, 230, y, 32, 32, m.color, 8);
    ctx.fillStyle = '#0a0d1e';
    ctx.font = `800 12px ${SANS}`;
    ctx.fillText(m.user[0], 241, y + 21);

    ctx.fillStyle = '#ffffff';
    ctx.font = `700 13px ${SANS}`;
    ctx.fillText(m.user, 272, y + 16);
    ctx.fillStyle = 'rgba(154,152,180,0.5)';
    ctx.font = `500 11px ${MONO}`;
    ctx.fillText(m.time, 330, y + 16);

    bar(ctx, 272, y + 26, 280, 48, 'rgba(255,255,255,0.04)', 10);
    ctx.fillStyle = 'rgba(237,234,245,0.85)';
    ctx.font = `400 12px ${SANS}`;
    ctx.fillText(m.text.slice(0, 38), 284, y + 46);
    if (m.text.length > 38) {
      ctx.fillText(m.text.slice(38), 284, y + 62);
    }
  });

  // Chat input
  bar(ctx, 226, SCREEN_H - 60, 338, 42, 'rgba(255,255,255,0.06)', 12);
  ctx.fillStyle = 'rgba(154,152,180,0.6)';
  ctx.font = `400 13px ${SANS}`;
  ctx.fillText('Message #general...', 246, SCREEN_H - 34);

  // ── Kanban Column ──
  ctx.fillStyle = '#0d1024';
  ctx.fillRect(580, 44, SCREEN_W - 580, SCREEN_H - 44);

  const cols = [
    { name: 'IN PROGRESS', count: '3', col: '#ffb86b' },
    { name: 'DONE', count: '8', col: '#8ce0b0' },
  ];
  cols.forEach((c, idx) => {
    const colX = 600 + idx * 210;
    ctx.fillStyle = c.col;
    ctx.font = `700 12px ${MONO}`;
    ctx.fillText(`${c.name} (${c.count})`, colX, 80);

    const cards = idx === 0
      ? [
          { title: 'Prisma Connection Pool', tag: 'DB', col: '#8ce0b0' },
          { title: 'Redis Cache Layer', tag: 'API', col: '#ffb86b' },
          { title: 'Responsive Kanban DnD', tag: 'UI', col: '#7cc6ff' },
        ]
      : [
          { title: 'NextAuth GitHub SSO', tag: 'SEC', col: '#7cc6ff' },
          { title: 'Websocket Rooms', tag: 'NET', col: '#c3a6ff' },
          { title: 'Cloudinary CDN upload', tag: 'API', col: '#8ce0b0' },
        ];

    cards.forEach((card, ci) => {
      const cy = 100 + ci * 125;
      bar(ctx, colX, cy, 195, 108, '#141838', 12);
      bar(ctx, colX + 14, cy + 14, 46, 20, `${card.col}22`, 6);
      ctx.fillStyle = card.col;
      ctx.font = `700 10px ${MONO}`;
      ctx.fillText(card.tag, colX + 24, cy + 28);

      ctx.fillStyle = '#edeaf5';
      ctx.font = `700 13px ${SANS}`;
      ctx.fillText(card.title, colX + 14, cy + 56);

      bar(ctx, colX + 14, cy + 74, 120, 6, 'rgba(255,255,255,0.08)', 3);
      bar(ctx, colX + 14, cy + 74, idx === 0 ? 70 : 120, 6, card.col, 3);
    });
  });
}

function drawDevSyncMobile(ctx) {
  ctx.fillStyle = '#0a0d1e';
  ctx.fillRect(0, 0, PHONE_SCREEN_W, PHONE_SCREEN_H);
  phoneStatusBar(ctx, false);

  // App header
  bar(ctx, 20, 54, 32, 32, '#7cc6ff', 8);
  ctx.fillStyle = '#ffffff';
  ctx.font = `800 18px ${SANS}`;
  ctx.fillText('DevSync', 62, 76);
  bar(ctx, PHONE_SCREEN_W - 68, 56, 48, 28, 'rgba(63,214,198,0.16)', 14);
  ctx.fillStyle = '#3fd6c6';
  ctx.font = `700 11px ${MONO}`;
  ctx.fillText('LIVE', PHONE_SCREEN_W - 56, 74);

  // Channel banner
  bar(ctx, 20, 102, PHONE_SCREEN_W - 40, 48, '#121636', 14);
  ctx.fillStyle = '#7cc6ff';
  ctx.font = `700 14px ${SANS}`;
  ctx.fillText('# general', 36, 131);
  ctx.fillStyle = 'rgba(154,152,180,0.6)';
  ctx.font = `500 12px ${MONO}`;
  ctx.fillText('14 members', PHONE_SCREEN_W - 116, 131);

  // Chat stream
  const msgs = [
    { u: 'Alex R.', t: '10:24', text: 'Auth refactor merged into main!', col: '#7cc6ff' },
    { u: 'Sarah K.', t: '10:26', text: 'Realtime WebSocket connected. 0 errors.', col: '#ffb86b' },
    { u: 'DevSync AI', t: '10:27', text: '✦ PR #42 approved. Ready for deploy.', col: '#c3a6ff' },
  ];
  msgs.forEach((m, i) => {
    const y = 170 + i * 110;
    bar(ctx, 20, y, PHONE_SCREEN_W - 40, 96, '#101430', 16);
    bar(ctx, 36, y + 16, 28, 28, m.col, 8);
    ctx.fillStyle = '#ffffff';
    ctx.font = `700 14px ${SANS}`;
    ctx.fillText(m.u, 74, y + 34);
    ctx.fillStyle = 'rgba(154,152,180,0.5)';
    ctx.font = `500 11px ${MONO}`;
    ctx.fillText(m.t, PHONE_SCREEN_W - 74, y + 34);
    ctx.fillStyle = 'rgba(237,234,245,0.85)';
    ctx.font = `400 13px ${SANS}`;
    ctx.fillText(m.text, 36, y + 70);
  });

  // Task card widget
  bar(ctx, 20, 520, PHONE_SCREEN_W - 40, 120, 'rgba(124,198,255,0.08)', 16);
  ctx.fillStyle = '#7cc6ff';
  ctx.font = `700 12px ${MONO}`;
  ctx.fillText('ACTIVE SPRINT', 36, 548);
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 16px ${SANS}`;
  ctx.fillText('Redis Caching & Sockets', 36, 576);
  bar(ctx, 36, 600, PHONE_SCREEN_W - 72, 8, 'rgba(255,255,255,0.1)', 4);
  bar(ctx, 36, 600, 210, 8, '#7cc6ff', 4);

  // Bottom tab bar
  bar(ctx, 20, PHONE_SCREEN_H - 86, PHONE_SCREEN_W - 40, 60, '#13173a', 30);
  const tabs = ['Chat', 'Tasks', 'AI ✦', 'More'];
  tabs.forEach((t, i) => {
    const tx = 48 + i * 82;
    ctx.fillStyle = i === 0 ? '#7cc6ff' : 'rgba(154,152,180,0.7)';
    ctx.font = `700 12px ${SANS}`;
    ctx.fillText(t, tx, PHONE_SCREEN_H - 50);
  });
}

/* ═════════════════════════════════════════════════════════════
   2. Adventra (Desktop & Mobile)
   ═════════════════════════════════════════════════════════════ */

function drawAdventra(ctx) {
  ctx.fillStyle = '#faf8f5';
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  browserChrome(ctx, '#ede7df', 'rgba(0,0,0,0.06)');

  // ── Header ──
  ctx.fillStyle = '#1c2833';
  ctx.font = `800 24px ${SANS}`;
  ctx.fillText('Adventra', 44, 84);

  // Search pill
  bar(ctx, 310, 60, 400, 42, '#ffffff', 21);
  ctx.fillStyle = 'rgba(28,40,51,0.5)';
  ctx.font = `500 13px ${SANS}`;
  ctx.fillText('Any destination  •  Any week  •  Add guests', 360, 86);
  bar(ctx, 672, 65, 32, 32, '#ff6b4a', 16);

  // User menu
  bar(ctx, 890, 64, 88, 36, '#ffffff', 18);
  ctx.fillStyle = '#1c2833';
  ctx.font = `700 13px ${SANS}`;
  ctx.fillText('Sign in', 914, 87);

  // ── Hero Banner ──
  const heroG = ctx.createLinearGradient(44, 120, 980, 320);
  heroG.addColorStop(0, '#ff7555');
  heroG.addColorStop(0.5, '#ea4c89');
  heroG.addColorStop(1, '#5352ed');
  roundRect(ctx, 44, 120, 936, 180, 24);
  ctx.fillStyle = heroG;
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = `800 36px ${SANS}`;
  ctx.fillText('Find Your Next Journey', 80, 184);
  ctx.font = `500 16px ${SANS}`;
  ctx.fillText('Handpicked mountain expeditions, coastal villas & stays.', 80, 218);

  bar(ctx, 80, 244, 150, 38, '#ffffff', 19);
  ctx.fillStyle = '#1c2833';
  ctx.font = `700 14px ${SANS}`;
  ctx.fillText('Explore packages', 98, 268);

  // ── Destination Cards ──
  const destinations = [
    { title: 'Swiss Alps Trail', loc: 'Zermatt, Switzerland', price: '$340/night', g: ['#5fb3c9', '#2f6f86'] },
    { title: 'Amalfi Coast Villa', loc: 'Positano, Italy', price: '$420/night', g: ['#f0b35b', '#c0673a'] },
    { title: 'Kyoto Bamboo Sanctuary', loc: 'Kyoto, Japan', price: '$280/night', g: ['#7bc47f', '#3d7a52'] },
    { title: 'Banff Glacial Retreat', loc: 'Alberta, Canada', price: '$310/night', g: ['#9d8cf0', '#5747b8'] },
  ];

  destinations.forEach((d, i) => {
    const cx = 44 + i * 242;
    bar(ctx, cx, 324, 222, 280, '#ffffff', 20);

    const cardG = ctx.createLinearGradient(cx, 334, cx, 474);
    cardG.addColorStop(0, d.g[0]);
    cardG.addColorStop(1, d.g[1]);
    roundRect(ctx, cx + 10, 334, 202, 140, 14);
    ctx.fillStyle = cardG;
    ctx.fill();

    // Rating badge
    bar(ctx, cx + 18, 344, 60, 22, 'rgba(0,0,0,0.35)', 11);
    ctx.fillStyle = '#ffffff';
    ctx.font = `700 11px ${SANS}`;
    ctx.fillText('★ 4.96', cx + 28, 359);

    ctx.fillStyle = '#1c2833';
    ctx.font = `700 16px ${SANS}`;
    ctx.fillText(d.title, cx + 16, 502);

    ctx.fillStyle = 'rgba(28,40,51,0.55)';
    ctx.font = `500 12px ${SANS}`;
    ctx.fillText(d.loc, cx + 16, 524);

    ctx.fillStyle = '#ff6b4a';
    ctx.font = `800 15px ${SANS}`;
    ctx.fillText(d.price, cx + 16, 554);

    bar(ctx, cx + 16, 568, 88, 26, 'rgba(255,107,74,0.12)', 13);
    ctx.fillStyle = '#ff6b4a';
    ctx.font = `700 11px ${SANS}`;
    ctx.fillText('Book Now →', cx + 26, 585);
  });
}

function drawAdventraMobile(ctx) {
  ctx.fillStyle = '#faf8f5';
  ctx.fillRect(0, 0, PHONE_SCREEN_W, PHONE_SCREEN_H);
  phoneStatusBar(ctx, true);

  // Mobile nav
  ctx.fillStyle = '#1c2833';
  ctx.font = `800 22px ${SANS}`;
  ctx.fillText('Adventra', 24, 76);

  // Search box
  bar(ctx, 24, 100, PHONE_SCREEN_W - 48, 48, '#ffffff', 24);
  ctx.fillStyle = 'rgba(28,40,51,0.5)';
  ctx.font = `500 13px ${SANS}`;
  ctx.fillText('Where to next?', 64, 130);

  // Story filters
  const tags = ['Trending', 'Mountains', 'Beach', 'Camp'];
  tags.forEach((tag, i) => {
    const x = 24 + i * 86;
    bar(ctx, x, 164, 76, 32, i === 0 ? '#1c2833' : '#ede8e1', 16);
    ctx.fillStyle = i === 0 ? '#ffffff' : '#1c2833';
    ctx.font = `600 12px ${SANS}`;
    ctx.fillText(tag, x + 12, 185);
  });

  // Featured Destination Card
  const cardG = ctx.createLinearGradient(24, 216, PHONE_SCREEN_W - 24, 460);
  cardG.addColorStop(0, '#ff7555');
  cardG.addColorStop(0.5, '#ea4c89');
  cardG.addColorStop(1, '#5352ed');
  roundRect(ctx, 24, 216, PHONE_SCREEN_W - 48, 250, 24);
  ctx.fillStyle = cardG;
  ctx.fill();

  bar(ctx, 40, 236, 76, 26, 'rgba(0,0,0,0.3)', 13);
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 12px ${SANS}`;
  ctx.fillText('★ 4.98', 56, 254);

  ctx.fillStyle = '#ffffff';
  ctx.font = `800 28px ${SANS}`;
  ctx.fillText('Swiss Alps Trail', 44, 390);
  ctx.font = `500 14px ${SANS}`;
  ctx.fillText('Zermatt, Switzerland  ·  $340 / night', 44, 420);

  // Second preview card
  bar(ctx, 24, 484, PHONE_SCREEN_W - 48, 170, '#ffffff', 20);
  const g2 = ctx.createLinearGradient(36, 496, 176, 640);
  g2.addColorStop(0, '#7bc47f');
  g2.addColorStop(1, '#3d7a52');
  roundRect(ctx, 36, 496, 140, 146, 16);
  ctx.fillStyle = g2;
  ctx.fill();

  ctx.fillStyle = '#1c2833';
  ctx.font = `700 18px ${SANS}`;
  ctx.fillText('Kyoto Forest', 190, 532);
  ctx.fillStyle = '#ff6b4a';
  ctx.font = `800 16px ${SANS}`;
  ctx.fillText('$280 / night', 190, 564);

  // Sticky bottom booking bar
  bar(ctx, 24, PHONE_SCREEN_H - 96, PHONE_SCREEN_W - 48, 64, '#1c2833', 32);
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 15px ${SANS}`;
  ctx.fillText('Explore All Stays →', 110, PHONE_SCREEN_H - 58);
}

/* ═════════════════════════════════════════════════════════════
   3. Restaurant Ordering UI (Desktop & Mobile)
   ═════════════════════════════════════════════════════════════ */

function drawRestaurant(ctx) {
  ctx.fillStyle = '#120d09';
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  browserChrome(ctx, '#1f1610', 'rgba(255,255,255,0.06)');

  // ── Header ──
  ctx.fillStyle = '#ffaf54';
  ctx.font = `800 24px ${SANS}`;
  ctx.fillText('Artisan Kitchen', 44, 84);

  // Categories
  const cats = ['Starters', 'Gourmet Mains', 'Artisan Pizzas', 'Desserts', 'Cocktails'];
  cats.forEach((c, i) => {
    const cx = 250 + i * 135;
    bar(ctx, cx, 62, 120, 36, i === 1 ? '#ff9a3c' : 'rgba(255,255,255,0.07)', 18);
    ctx.fillStyle = i === 1 ? '#120d09' : '#f5e8da';
    ctx.font = `700 13px ${SANS}`;
    ctx.fillText(c, cx + 16, 85);
  });

  // ── Food Grid ──
  const dishes = [
    { name: 'Truffle Wagyu Burger', desc: 'Aged cheddar, caramelized onions, brioche', price: '$24.50', g: ['#ff8a5c', '#7a2e12'] },
    { name: 'Wood-fired Truffle Pizza', desc: 'San Marzano tomatoes, buffalo mozzarella', price: '$22.00', g: ['#ffd27f', '#8f4f1a'] },
    { name: 'Pan-seared Salmon', desc: 'Asparagus risotto, lemon caper glaze', price: '$28.00', g: ['#ff6f6f', '#7a1c1c'] },
    { name: 'Wild Mushroom Pasta', desc: 'Handmade tagliatelle, parmesan crisp', price: '$19.50', g: ['#9fd67a', '#2e6b18'] },
  ];

  dishes.forEach((d, i) => {
    const rx = 44 + (i % 2) * 290;
    const ry = 126 + Math.floor(i / 2) * 230;

    bar(ctx, rx, ry, 270, 208, '#1d1510', 18);

    // Food radial illustration
    ctx.beginPath();
    ctx.arc(rx + 60, ry + 60, 38, 0, Math.PI * 2);
    const dishG = ctx.createRadialGradient(rx + 50, ry + 50, 4, rx + 60, ry + 60, 38);
    dishG.addColorStop(0, d.g[0]);
    dishG.addColorStop(1, d.g[1]);
    ctx.fillStyle = dishG;
    ctx.fill();

    ctx.fillStyle = '#ffeedd';
    ctx.font = `700 16px ${SANS}`;
    ctx.fillText(d.name, rx + 20, ry + 126);

    ctx.fillStyle = 'rgba(245,232,218,0.55)';
    ctx.font = `400 12px ${SANS}`;
    ctx.fillText(d.desc.slice(0, 30), rx + 20, ry + 150);

    ctx.fillStyle = '#ff9a3c';
    ctx.font = `800 17px ${SANS}`;
    ctx.fillText(d.price, rx + 20, ry + 184);

    bar(ctx, rx + 200, ry + 160, 50, 32, '#ff9a3c', 16);
    ctx.fillStyle = '#120d09';
    ctx.font = `800 16px ${SANS}`;
    ctx.fillText('+ Add', rx + 208, ry + 182);
  });

  // ── Order Summary Drawer ──
  const drawerG = ctx.createLinearGradient(650, 126, 980, 600);
  drawerG.addColorStop(0, '#ff9a3c');
  drawerG.addColorStop(1, '#e04343');
  roundRect(ctx, 646, 126, 334, 474, 24);
  ctx.fillStyle = drawerG;
  ctx.fill();

  ctx.fillStyle = '#120d09';
  ctx.font = `800 24px ${SANS}`;
  ctx.fillText('Your Order (3)', 678, 172);

  const orderItems = [
    ['1x Truffle Wagyu Burger', '$24.50'],
    ['1x Wood-fired Pizza', '$22.00'],
    ['2x Craft Ginger Ale', '$12.00'],
  ];
  orderItems.forEach(([name, pr], i) => {
    bar(ctx, 678, 204 + i * 68, 270, 54, 'rgba(18,13,9,0.14)', 14);
    ctx.fillStyle = '#120d09';
    ctx.font = `700 14px ${SANS}`;
    ctx.fillText(name, 694, 234 + i * 68);
    ctx.font = `800 14px ${SANS}`;
    ctx.fillText(pr, 894, 234 + i * 68);
  });

  bar(ctx, 678, 510, 270, 54, '#120d09', 27);
  ctx.fillStyle = '#ffffff';
  ctx.font = `800 16px ${SANS}`;
  ctx.fillText('Checkout  •  $58.50', 740, 543);
}

function drawRestaurantMobile(ctx) {
  ctx.fillStyle = '#120d09';
  ctx.fillRect(0, 0, PHONE_SCREEN_W, PHONE_SCREEN_H);
  phoneStatusBar(ctx, false);

  // Header
  ctx.fillStyle = '#ffaf54';
  ctx.font = `800 22px ${SANS}`;
  ctx.fillText('Artisan Kitchen', 24, 76);
  bar(ctx, PHONE_SCREEN_W - 90, 56, 66, 26, 'rgba(255,154,60,0.18)', 13);
  ctx.fillStyle = '#ff9a3c';
  ctx.font = `700 11px ${MONO}`;
  ctx.fillText('25 MIN', PHONE_SCREEN_W - 78, 73);

  // Category scroller
  const cats = ['All', 'Burgers', 'Pizzas', 'Drinks'];
  cats.forEach((c, i) => {
    const cx = 24 + i * 84;
    bar(ctx, cx, 104, 74, 32, i === 1 ? '#ff9a3c' : 'rgba(255,255,255,0.08)', 16);
    ctx.fillStyle = i === 1 ? '#120d09' : '#f5e8da';
    ctx.font = `700 12px ${SANS}`;
    ctx.fillText(c, cx + 14, 124);
  });

  // Food cards
  const dishes = [
    { name: 'Truffle Wagyu', desc: 'Aged cheddar, brioche', price: '$24.50', g: ['#ff8a5c', '#7a2e12'] },
    { name: 'Wood-fired Pizza', desc: 'San Marzano, mozzarella', price: '$22.00', g: ['#ffd27f', '#8f4f1a'] },
    { name: 'Pan-seared Salmon', desc: 'Asparagus & lemon caper', price: '$28.00', g: ['#ff6f6f', '#7a1c1c'] },
  ];
  dishes.forEach((d, i) => {
    const y = 160 + i * 154;
    bar(ctx, 24, y, PHONE_SCREEN_W - 48, 138, '#1d1510', 20);

    ctx.beginPath();
    ctx.arc(74, y + 68, 36, 0, Math.PI * 2);
    const dg = ctx.createRadialGradient(64, y + 58, 4, 74, y + 68, 36);
    dg.addColorStop(0, d.g[0]);
    dg.addColorStop(1, d.g[1]);
    ctx.fillStyle = dg;
    ctx.fill();

    ctx.fillStyle = '#ffeedd';
    ctx.font = `700 16px ${SANS}`;
    ctx.fillText(d.name, 126, y + 48);

    ctx.fillStyle = 'rgba(245,232,218,0.5)';
    ctx.font = `400 12px ${SANS}`;
    ctx.fillText(d.desc, 126, y + 74);

    ctx.fillStyle = '#ff9a3c';
    ctx.font = `800 16px ${SANS}`;
    ctx.fillText(d.price, 126, y + 108);

    bar(ctx, PHONE_SCREEN_W - 78, y + 84, 40, 32, '#ff9a3c', 16);
    ctx.fillStyle = '#120d09';
    ctx.font = `800 16px ${SANS}`;
    ctx.fillText('+', PHONE_SCREEN_W - 64, y + 105);
  });

  // Floating cart bar
  bar(ctx, 24, PHONE_SCREEN_H - 96, PHONE_SCREEN_W - 48, 64, '#ff9a3c', 32);
  ctx.fillStyle = '#120d09';
  ctx.font = `800 16px ${SANS}`;
  ctx.fillText('🛒 2 items  ·  $46.50', 60, PHONE_SCREEN_H - 58);
  ctx.fillText('View Cart →', PHONE_SCREEN_W - 138, PHONE_SCREEN_H - 58);
}

const DESKTOP_DRAWERS = { devsync: drawDevSync, adventra: drawAdventra, restaurant: drawRestaurant };
const MOBILE_DRAWERS = { devsync: drawDevSyncMobile, adventra: drawAdventraMobile, restaurant: drawRestaurantMobile };

/** Build desktop project textures. Real screenshots (screenImage) override the drawing. */
export function createProjectScreens(projects) {
  const loader = new THREE.TextureLoader();
  return projects.map((p) => {
    const [c, ctx] = makeCanvas(SCREEN_W, SCREEN_H);
    (DESKTOP_DRAWERS[p.screen] || drawDevSync)(ctx);
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

/** Build companion mobile phone textures. screenImageMobile overrides the drawing. */
export function createMobileProjectScreens(projects) {
  const loader = new THREE.TextureLoader();
  return projects.map((p) => {
    const [c, ctx] = makeCanvas(PHONE_SCREEN_W, PHONE_SCREEN_H);
    (MOBILE_DRAWERS[p.screen] || drawDevSyncMobile)(ctx);
    const tex = toTexture(c, { anisotropy: 8 });
    if (p.screenImageMobile) {
      loader.load(p.screenImageMobile, (img) => {
        tex.image = img.image;
        tex.needsUpdate = true;
        img.dispose();
      });
    }
    return tex;
  });
}
