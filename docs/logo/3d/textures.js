// Procedural textures for the realistic DomOrava logo: oiled oak, painted
// forest-green timber, split-face stone and a conifer sprig. Everything is
// drawn into canvases (tileable), no image files involved.
import * as THREE from 'three';

// ---------------------------------------------------------------- noise

function hash(x, y, s) {
  let h = Math.imul(x, 0x27d4eb2d) ^ Math.imul(y, 0x165667b1) ^ Math.imul(s + 1, 0x9e3779b9);
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

// value noise on a lattice that wraps every (px, py) cells -> tileable
function vnoise(x, y, px, py, s) {
  const x0 = Math.floor(x), y0 = Math.floor(y);
  const fx = x - x0, fy = y - y0;
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  const xa = ((x0 % px) + px) % px, xb = (xa + 1) % px;
  const ya = ((y0 % py) + py) % py, yb = (ya + 1) % py;
  const a = hash(xa, ya, s), b = hash(xb, ya, s), c = hash(xa, yb, s), d = hash(xb, yb, s);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

// fractal noise, u/v in 0..1, fx/fy = integer base frequencies (keeps it tileable)
function fbm(u, v, fx, fy, oct, s) {
  let sum = 0, amp = 0.5, norm = 0;
  for (let o = 0; o < oct; o++) {
    sum += amp * vnoise(u * fx, v * fy, fx, fy, s + o * 17);
    norm += amp; amp *= 0.5; fx *= 2; fy *= 2;
  }
  return sum / norm;
}

const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const mix = (a, b, t) => a + (b - a) * t;
const wrap = (d) => d - Math.round(d);

// ---------------------------------------------------------------- helpers

function canvasOf(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

function toTexture(canvas, { srgb = true, jpeg = true } = {}) {
  const t = new THREE.CanvasTexture(canvas);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.anisotropy = 8;
  t.userData.mimeType = jpeg ? 'image/jpeg' : 'image/png';
  return t;
}

// tangent-space normal map from a wrapped height field
function normalFromHeight(hf, w, h, strength) {
  const c = canvasOf(w, h);
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(w, h);
  const d = img.data;
  for (let y = 0; y < h; y++) {
    const yu = ((y - 1 + h) % h) * w, yd = ((y + 1) % h) * w;
    for (let x = 0; x < w; x++) {
      const xl = (x - 1 + w) % w, xr = (x + 1) % w;
      const dx = (hf[y * w + xr] - hf[y * w + xl]) * strength;
      const dy = (hf[yd + x] - hf[yu + x]) * strength;
      // canvas row 0 is the top of the image = v 1 with flipY, so +y in
      // texture space points up the canvas: flip dy
      let nx = -dx, ny = dy, nz = 1;
      const l = Math.hypot(nx, ny, nz);
      nx /= l; ny /= l; nz /= l;
      const i = (y * w + x) * 4;
      d[i] = (nx * 0.5 + 0.5) * 255;
      d[i + 1] = (ny * 0.5 + 0.5) * 255;
      d[i + 2] = (nz * 0.5 + 0.5) * 255;
      d[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

// ---------------------------------------------------------------- wood

/**
 * Flat-sawn timber. Grain runs along u (texture x). worldU/worldV = metres the
 * tile covers. boards > 0 splits v into planks with grooves and butt joints.
 * Rings come from a log model: every plank is a slice at a slowly varying
 * distance from the pith, which gives straight grain with cathedral arches.
 * palette: { early:[r,g,b], late:[r,g,b] }, paint: 1 = opaque paint over
 * brushed wood (grain mostly in the relief).
 */
export function woodTextures({ w = 1024, h = 256, worldU = 2.4, worldV = 0.6, boards = 0,
  palette, paint = 0, seed = 1, rings = 110, knots = 3, normalStrength = 1.0 }) {
  const col = canvasOf(w, h);
  const ctx = col.getContext('2d');
  const img = ctx.createImageData(w, h);
  const d = img.data;
  const hf = new Float32Array(w * h);
  const nb = boards || 1;
  const boardW = worldV / nb;
  const TAU = Math.PI * 2;

  // per-board log slice: pith offset across the board, slice depth along it
  const B = [];
  for (let b = 0; b < nb; b++) {
    const R = (k) => hash(b, k, seed);
    B.push({
      tint: 0.9 + R(1) * 0.2,
      warm: R(2) - 0.5,
      pith: boards ? (R(3) - 0.5) * boardW * 1.6 : 0,
      d0: 0.025 + R(4) * 0.09,
      amp: 0.012 + R(5) * 0.05,
      k: 1 + Math.floor(R(6) * 3),
      ph: R(7) * TAU,
      freq: rings * (0.8 + R(8) * 0.45),
      joint: R(9),
    });
  }
  const K = [];
  for (let k = 0; k < knots; k++) K.push([hash(k, 11, seed), hash(k, 12, seed), 0.007 + hash(k, 13, seed) * 0.012]);
  const [er, eg, eb] = palette.early, [lr, lg, lb] = palette.late;

  for (let y = 0; y < h; y++) {
    const v = y / h;
    const bi = boards ? Math.min(nb - 1, Math.floor(v * nb)) : 0;
    const bd = B[bi];
    const vb = boards ? v * nb - bi : v;
    // across-grain distance from the pith (metres); beams are symmetric so v wraps
    const across = boards ? (vb - 0.5) * boardW - bd.pith : (vb - 0.5) * worldV;
    const edge = boards ? Math.min(vb, 1 - vb) * boardW : 1;
    for (let x = 0; x < w; x++) {
      const u = x / w;
      const wob = fbm(u, v, 4, 2, 3, seed + bi * 31) - 0.5;
      const depth = bd.d0 + bd.amp * Math.sin(TAU * bd.k * u + bd.ph) + wob * 0.02;
      const yy = across + (fbm(u, v, 8, 3, 2, seed + 5) - 0.5) * 0.006;
      let rr = Math.sqrt(yy * yy + depth * depth) * bd.freq;
      let knot = 0;
      for (const [ku, kv, ks] of K) {
        const dx = wrap(u - ku) * worldU, dy = wrap(v - kv) * worldV;
        const d2 = dx * dx * 0.06 + dy * dy;
        rr += Math.exp(-d2 / (ks * ks * 10)) * 2.2;
        const core = Math.sqrt(dx * dx * 0.5 + dy * dy) / ks;
        knot = Math.max(knot, 1 - smooth(0.5, 1.0, core));
      }
      const ring = rr - Math.floor(rr);
      const late = smooth(0.55, 0.9, ring) * (1 - smooth(0.92, 1.0, ring));
      const fib = vnoise(u * 96, v * h * 0.5, 96, Math.round(h * 0.5), seed + 9);
      const fib2 = vnoise(u * 24, v * h * 0.18, 24, Math.round(h * 0.18), seed + 19);
      const pore = smooth(0.82, 0.95, vnoise(u * 300, v * h * 0.8, 300, Math.round(h * 0.8), seed + 3));
      const mott = fbm(u, v, 6, 2, 3, seed + 21);

      let R, G, Bc, k;
      if (paint) {
        const tp = late * 0.3 + (fib - 0.5) * 0.1 + (fib2 - 0.5) * 0.1 + knot * 0.35;
        R = mix(er, lr, tp); G = mix(eg, lg, tp); Bc = mix(eb, lb, tp);
        k = (0.95 + bd.tint * 0.05) * (0.94 + mott * 0.12);
      } else {
        const t = late * 0.72 + (fib - 0.5) * 0.16 + (fib2 - 0.5) * 0.2 + pore * 0.12 + knot * 0.85;
        R = mix(er, lr, t); G = mix(eg, lg, t); Bc = mix(eb, lb, t);
        k = bd.tint * (0.9 + mott * 0.2);
        R *= 1 + bd.warm * 0.1; Bc *= 1 - bd.warm * 0.14;
      }
      // relief: latewood stands proud (weathered / brushed), fine fibres
      let h0 = late * (paint ? 0.9 : 0.5) + fib * 0.12 + fib2 * 0.1 - pore * 0.05 + knot * 0.3;
      if (boards) {
        const g = smooth(0.0008, 0.004, edge);
        k *= 0.32 + 0.68 * g;
        h0 -= (1 - g) * 3.0;
        const jd = Math.abs(wrap(u - bd.joint)) * worldU;
        const jg = smooth(0.0006, 0.0025, jd);
        k *= 0.45 + 0.55 * jg;
        h0 -= (1 - jg) * 2.0;
      }
      const i = (y * w + x) * 4;
      d[i] = Math.min(255, R * k);
      d[i + 1] = Math.min(255, G * k);
      d[i + 2] = Math.min(255, Bc * k);
      d[i + 3] = 255;
      hf[y * w + x] = h0;
    }
  }
  ctx.putImageData(img, 0, 0);
  const map = toTexture(col);
  const normalMap = toTexture(normalFromHeight(hf, w, h, normalStrength), { srgb: false });
  return { map, normalMap, worldU, worldV };
}

// ---------------------------------------------------------------- stone

/** Neutral light stone; per-stone colour comes from vertex colours. */
export function stoneTextures({ size = 512, world = 0.5, seed = 7, normalStrength = 3.0, base = [205, 199, 190] } = {}) {
  const w = size, h = size;
  const col = canvasOf(w, h);
  const ctx = col.getContext('2d');
  const img = ctx.createImageData(w, h);
  const d = img.data;
  const hf = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    const v = y / h;
    for (let x = 0; x < w; x++) {
      const u = x / w;
      const mott = fbm(u, v, 4, 4, 4, seed);
      const warm = fbm(u, v, 3, 3, 3, seed + 40);
      const spk = vnoise(u * 180, v * 180, 180, 180, seed + 2);
      const spk2 = vnoise(u * 260, v * 260, 260, 260, seed + 3);
      const ridge = 1 - Math.abs(fbm(u, v, 6, 6, 4, seed + 8) * 2 - 1);
      let k = 0.78 + mott * 0.34;
      if (spk > 0.86) k *= 0.62;
      if (spk2 > 0.9) k *= 1.18;
      const wt = smooth(0.55, 0.8, warm) * 0.35;
      const R = base[0] * k * (1 + wt * 0.12);
      const G = base[1] * k * (1 + wt * 0.02);
      const B = base[2] * k * (1 - wt * 0.18);
      const i = (y * w + x) * 4;
      d[i] = Math.min(255, R); d[i + 1] = Math.min(255, G); d[i + 2] = Math.min(255, B); d[i + 3] = 255;
      hf[y * w + x] = ridge * 1.3 + mott * 0.6 - (spk > 0.86 ? 0.25 : 0) + spk2 * 0.1;
    }
  }
  ctx.putImageData(img, 0, 0);
  return {
    map: toTexture(col),
    normalMap: toTexture(normalFromHeight(hf, w, h, normalStrength), { srgb: false }),
    world,
  };
}

// ---------------------------------------------------------------- foliage

/**
 * One conifer sprig on transparency: stem from bottom centre to the top,
 * side shoots with dense needles. Stem runs along v (texture up).
 */
export function sprigTexture({ size = 512, seed = 3, tones } = {}) {
  const c = canvasOf(size, size);
  const ctx = c.getContext('2d');
  let s = seed * 9973;
  const rnd = () => { s = (Math.imul(s, 1103515245) + 12345) >>> 0; return s / 4294967296; };
  const T = tones || ['#2f5221', '#3d6a28', '#4d7d2f', '#5f8f36', '#78a544', '#8fb956'];
  const S = size;
  ctx.lineCap = 'round';

  function needles(x0, y0, x1, y1, len, density, light) {
    const n = Math.max(4, Math.round(Math.hypot(x1 - x0, y1 - y0) / S * density));
    const ang = Math.atan2(y1 - y0, x1 - x0);
    for (let i = 0; i < n; i++) {
      const t = i / n;
      const px = x0 + (x1 - x0) * t, py = y0 + (y1 - y0) * t;
      const tipFade = 1 - t * 0.45;
      for (const side of [-1, 1]) {
        const a = ang + side * (0.75 + rnd() * 0.5) - 0.25 * side * t;
        const l = len * tipFade * (0.7 + rnd() * 0.5);
        const shade = Math.min(T.length - 1, Math.floor((t * 0.6 + rnd() * 0.5) * T.length * 0.75 + light));
        ctx.strokeStyle = T[Math.max(0, shade)];
        ctx.lineWidth = S * 0.0065 * (0.8 + rnd() * 0.5);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l);
        ctx.stroke();
      }
    }
  }

  // main stem: bottom centre -> top, slight curve
  const stem = [];
  const bend = (rnd() - 0.5) * 0.12;
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    stem.push([S * (0.5 + Math.sin(t * Math.PI) * bend), S * (1 - t * 0.96)]);
  }
  // side shoots, alternating, shorter towards the tip
  for (let i = 2; i < 19; i += 1) {
    const [px, py] = stem[i];
    const t = i / 20;
    const side = i % 2 ? 1 : -1;
    const len = S * (0.36 - t * 0.26) * (0.8 + rnd() * 0.35);
    const a = -Math.PI / 2 + side * (0.85 + rnd() * 0.25);
    const ex = px + Math.cos(a) * len, ey = py + Math.sin(a) * len;
    ctx.strokeStyle = '#4a3a22'; ctx.lineWidth = S * 0.006;
    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(ex, ey); ctx.stroke();
    needles(px, py, ex, ey, S * 0.05, 90, 0.5 + t * 2);
  }
  ctx.strokeStyle = '#4a3a22'; ctx.lineWidth = S * 0.012;
  ctx.beginPath(); ctx.moveTo(...stem[0]);
  for (const p of stem) ctx.lineTo(...p);
  ctx.stroke();
  for (let i = 0; i < 20; i++) needles(...stem[i], ...stem[i + 1], S * 0.06, 260, 1 + i / 8);

  const t = toTexture(c, { jpeg: false });
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  return t;
}
