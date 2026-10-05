import * as THREE from 'three';

export const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace';
export const SANS = '"Bricolage Grotesque", system-ui, sans-serif';

export function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')];
}

export function toTexture(canvas, { anisotropy = 4 } = {}) {
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = anisotropy;
  return t;
}

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Text label used on the top face of each slab. */
export function labelTexture(text) {
  const [c, ctx] = makeCanvas(512, 512);
  ctx.clearRect(0, 0, 512, 512);
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(255,255,255,0.65)';
  ctx.shadowBlur = 18;
  ctx.font = `800 ${text.length > 2 ? 170 : 200}px ${SANS}`;
  ctx.fillText(text, 256, 268);
  return toTexture(c);
}

/** Soft round sprite for particles / neural points. */
export function glowTexture() {
  const [c, ctx] = makeCanvas(64, 64);
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.25, 'rgba(255,255,255,0.8)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  return t;
}

/** Laptop keyboard: grid of keys on a dark deck. */
export function keyboardTexture() {
  const W = 1024;
  const H = 400;
  const [c, ctx] = makeCanvas(W, H);
  ctx.fillStyle = '#121527';
  ctx.fillRect(0, 0, W, H);
  const rows = [14, 14, 13, 12, 11];
  const pad = 18;
  const gap = 8;
  const rowH = (H - pad * 2 - gap * 5) / 6;
  // function row
  let y = pad;
  const drawKey = (x, y, w, h, accent) => {
    roundRect(ctx, x, y, w, h, 7);
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, accent ? '#2a2f4d' : '#23263c');
    g.addColorStop(1, '#191c2e');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  };
  const fw = (W - pad * 2 - gap * 13) / 14;
  for (let i = 0; i < 14; i++) drawKey(pad + i * (fw + gap), y, fw, rowH * 0.7, false);
  y += rowH * 0.7 + gap;
  rows.forEach((n, r) => {
    const extra = r === 0 ? 0 : r * 0.35;
    const keyW = (W - pad * 2 - gap * (n - 1) - extra * fw) / n;
    let x = pad;
    for (let i = 0; i < n; i++) {
      const w = i === 0 ? keyW + extra * fw * 0.5 : i === n - 1 ? keyW + extra * fw * 0.5 : keyW;
      drawKey(x, y, w, rowH, i === 0 || i === n - 1);
      x += w + gap;
    }
    y += rowH + gap;
  });
  // space bar row
  const sx = W * 0.3;
  drawKey(pad, y, sx - pad - gap, rowH * 0.95, true);
  drawKey(sx, y, W * 0.4, rowH * 0.95, false);
  drawKey(sx + W * 0.4 + gap, y, W - pad - (sx + W * 0.4 + gap), rowH * 0.95, true);
  return toTexture(c, { anisotropy: 8 });
}

const CODE = [
  "// v2.0 · full stack: interface → api → database",
  "model Workspace {",
  "  id        String   @id @default(cuid())",
  "  name      String",
  "  members   Member[]",
  "  tasks     Task[]",
  "}",
  "",
  "export async function GET(req: Request) {",
  "  const session = await auth();",
  "  if (!session) return unauthorized();",
  "  const tasks = await prisma.task.findMany({",
  "    where: { workspaceId: session.workspace },",
  "    orderBy: { createdAt: 'desc' },",
  "  });",
  "  return Response.json(tasks);",
  "}",
  "",
  "io.on('connection', (socket) => {",
  "  socket.join(`room:${socket.data.room}`);",
  "  socket.on('message', async (msg) => {",
  "    await redis.publish('chat', msg);",
  "  });",
  "});",
  "",
  "export function Board({ columns }: Props) {",
  "  const [items, setItems] = useState(columns);",
  "  return (",
  "    <section className=\"grid gap-4\">",
  "      {items.map((c) => <Column key={c.id} {...c} />)}",
  "    </section>",
  "  );",
  "}",
];

const KW = /^(const|let|await|async|return|export|import|from|function|if|new|type|model|default)$/;

function drawCodeLine(ctx, line, x, y) {
  const re = /(\/\/.*$|'[^']*'|"[^"]*"|`[^`]*`|@\w+(?:\([^)]*\))?|[A-Za-z_]\w*|\d+|\s+|.)/g;
  let m;
  let cx = x;
  while ((m = re.exec(line))) {
    const tok = m[0];
    let col = '#d8d6ea';
    if (tok.startsWith('//')) col = '#6b6a8a';
    else if (/^['"`]/.test(tok)) col = '#8ce0b0';
    else if (tok.startsWith('@')) col = '#ff7a90';
    else if (KW.test(tok)) col = '#c3a6ff';
    else if (/^[A-Z]/.test(tok)) col = '#ffb86b';
    else if (/^\d/.test(tok)) col = '#ffb86b';
    else if (/^[A-Za-z_]/.test(tok) && line[re.lastIndex] === '(') col = '#7cc6ff';
    else if (/^[{}()[\]<>=]/.test(tok)) col = '#9a98b4';
    ctx.fillStyle = col;
    ctx.fillText(tok, cx, y);
    cx += ctx.measureText(tok).width;
  }
}

/**
 * Tall, vertically seamless code texture. The laptop shows a window of it
 * (texture.repeat.y < 1) and scrolls texture.offset.y for an endless editor.
 */
export function codeTexture() {
  const W = 1024;
  const H = 2048;
  const LH = 32; // 64 lines exactly → seamless wrap
  const [c, ctx] = makeCanvas(W, H);
  ctx.fillStyle = '#0b0e1f';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#10142a';
  ctx.fillRect(0, 0, 64, H);
  ctx.font = `500 21px ${MONO}`;
  ctx.textBaseline = 'middle';
  const lines = H / LH;
  for (let i = 0; i < lines; i++) {
    const y = i * LH + LH / 2;
    ctx.fillStyle = 'rgba(154,152,180,0.35)';
    ctx.fillRect(28, y - 1.5, 8, 3);
    drawCodeLine(ctx, CODE[i % CODE.length], 92, y);
  }
  const t = toTexture(c, { anisotropy: 8 });
  t.wrapS = THREE.ClampToEdgeWrapping;
  t.wrapT = THREE.RepeatWrapping;
  return t;
}
