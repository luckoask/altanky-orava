// Realistic DomOrava logo as a 3D object: oak gable roof floating over a
// painted forest-green timber arch on split-stone plinths, with young firs
// and pebbles. Proportions are measured from ../pavilion-source.png
// (1254 px canvas, 1 px = 4 mm, ground at y 1175 px).
//
// buildPavilion() returns a THREE.Group with one mesh per material. The
// textures are procedural (textures.js), so the whole model is this code.
import * as THREE from 'three';
import { mergeGeometries, toCreasedNormals } from 'three/addons/utils/BufferGeometryUtils.js';
import { woodTextures, stoneTextures, sprigTexture } from './textures.js';

const PX = 1 / 250;               // metres per source pixel
const X = (px) => (px - 628) * PX;
const Y = (py) => (1175 - py) * PX;

// --- measured layout (source pixels)
const CY_TOP = 1377.8;            // centre of the curved top of the arch
const R_TOP = 983;                // radius of that top
const R_HEAD_IN = 945;            // underside of the curved header beam
const GAP = 31;                   // the floating gap under the roof
const R_SOFFIT = R_TOP + GAP;
const RING_C = 785;               // spring line of the arch opening
const RING_IN = 270, RING_OUT = 340;
const POST_OUT = 428, POST_IN = 340, JAMB = 270;   // |x - 628|
const HEAD_HALF = 442;
const BASE_TOP = 1028;            // top of the stone caps
const SLOPE = 0.565;              // roof pitch (29.5 deg)
const WOOD_APEX = 60;             // top of the oak at the ridge
const EAVE = 561;                 // |x| of the eave end cut
const BARGE = 80;                 // vertical depth of the barge boards

// --- depths (metres, z)
const Z_POST = 0.23, Z_RING = 0.24, Z_SPAN = 0.2, Z_HEAD = 0.25, Z_BAND = 0.262;
const Z_ROOF = 0.57, Z_BARGE = 0.625, Z_METAL = 0.665, Z_BRACKET = 0.69;

function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (Math.imul(s ^ (s >>> 15), 2246822519) + 0x9e3779b9) >>> 0; s ^= s >>> 13; return (s >>> 0) / 4294967296; };
}

// ---------------------------------------------------------------- UVs

/**
 * World-scaled UVs so wood grain follows each member.
 * mode 'linear': grain along `dir`; mode 'polar': grain follows circles
 * around `center` (curved members). tex = { worldU, worldV }.
 */
function grainUV(geom, tex, { dir = new THREE.Vector3(1, 0, 0), center = null, offU = 0, offV = 0, rot = 0 } = {}) {
  const pos = geom.attributes.position, nor = geom.attributes.normal;
  const uv = new Float32Array(pos.count * 2);
  const p = new THREE.Vector3(), n = new THREE.Vector3(), w = new THREE.Vector3();
  const g = dir.clone().normalize();
  const cr = Math.cos(rot), sr = Math.sin(rot);
  for (let i = 0; i < pos.count; i++) {
    p.fromBufferAttribute(pos, i);
    n.fromBufferAttribute(nor, i);
    let u, v;
    if (center) {
      const rx = p.x - center.x, ry = p.y - center.y;
      const rad = Math.hypot(rx, ry);
      const ang = Math.atan2(rx, ry);
      const nr = (n.x * rx + n.y * ry) / (rad || 1);
      const nt = (n.x * ry - n.y * rx) / (rad || 1);
      if (Math.abs(n.z) > 0.6) { u = ang * center.ref; v = rad; }
      else if (Math.abs(nr) >= Math.abs(nt)) { u = ang * center.ref; v = p.z; }
      else { u = p.z; v = rad; }
    } else {
      const ng = n.dot(g);
      if (Math.abs(ng) > 0.75) {
        // end grain face: any two axes across the member
        w.crossVectors(g, Math.abs(g.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0)).normalize();
        const w2 = new THREE.Vector3().crossVectors(g, w);
        u = p.dot(w); v = p.dot(w2);
      } else {
        w.crossVectors(n, g);
        if (w.lengthSq() < 1e-6) w.set(0, 0, 1);
        w.normalize();
        u = p.dot(g); v = p.dot(w);
      }
    }
    const ur = u * cr - v * sr, vr = u * sr + v * cr;
    uv[i * 2] = ur / tex.worldU + offU;
    uv[i * 2 + 1] = vr / tex.worldV + offV;
  }
  geom.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  return geom;
}

// planar UVs (x, y) rotated by `rot` - used for the gable boards
function planarUV(geom, tex, rot, offU = 0, offV = 0) {
  const pos = geom.attributes.position;
  const uv = new Float32Array(pos.count * 2);
  const c = Math.cos(rot), s = Math.sin(rot);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i);
    uv[i * 2] = (x * c + y * s) / tex.worldU + offU;
    uv[i * 2 + 1] = (-x * s + y * c) / tex.worldV + offV;
  }
  geom.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  return geom;
}

// ---------------------------------------------------------------- shapes

/** Extrude a THREE.Shape (metres) between z0..z1 with a small rounded bevel. */
function extrude(shape, z0, z1, { bevel = 0.006, curveSegments = 64, bevelSegments = 2 } = {}) {
  const depth = z1 - z0 - 2 * bevel;
  const g = new THREE.ExtrudeGeometry(shape, {
    depth, curveSegments, steps: 1,
    bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel,
    bevelOffset: -bevel, bevelSegments,
  });
  g.translate(0, 0, z0 + bevel);
  const c = toCreasedNormals(g, Math.PI / 5);
  g.dispose();
  return c;
}

/** Bevelled box from min/max corners (metres). */
function box(x0, y0, z0, x1, y1, z1, bevel = 0.006) {
  const s = new THREE.Shape();
  s.moveTo(x0, y0); s.lineTo(x1, y0); s.lineTo(x1, y1); s.lineTo(x0, y1); s.closePath();
  return extrude(s, z0, z1, { bevel, curveSegments: 1 });
}

/** Box of length L along local x, size (h along y, d along z), centred at origin. */
function beam(L, h, d, bevel = 0.006) {
  return box(-L / 2, -h / 2, -d / 2, L / 2, h / 2, d / 2, bevel);
}

/** Points of a circle arc in source pixels, returned in metres. */
function arcPts(cx, cy, r, a0, a1, n) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const a = a0 + (a1 - a0) * i / n;
    pts.push(new THREE.Vector2(X(cx + r * Math.sin(a)), Y(cy - r * Math.cos(a))));
  }
  return pts;
}

const yTop = (dx) => CY_TOP - Math.sqrt(R_TOP * R_TOP - dx * dx);
const yHeadIn = (dx) => CY_TOP - Math.sqrt(R_HEAD_IN * R_HEAD_IN - dx * dx);
const ySoffit = (dx) => CY_TOP - Math.sqrt(R_SOFFIT * R_SOFFIT - dx * dx);
const yRake = (dx) => WOOD_APEX + Math.abs(dx) * SLOPE;

// ---------------------------------------------------------------- materials

function makeMaterials(q) {
  const W = (o) => woodTextures({ w: 1024 * q, h: 256 * q, ...o });
  const oakPal = { early: [214, 150, 88], late: [118, 70, 34] };
  const greenPal = { early: [72, 112, 70], late: [34, 60, 38] };
  const tex = {
    oakBeam: W({ palette: oakPal, seed: 11, rings: 30, knots: 3 }),
    oakBoards: W({ palette: oakPal, seed: 23, boards: 6, rings: 38, knots: 4 }),
    greenBeam: W({ palette: greenPal, paint: 1, seed: 31, rings: 30, knots: 3, normalStrength: 3.2 }),
    greenBoards: W({ palette: greenPal, paint: 1, seed: 47, boards: 5, rings: 36, knots: 4, normalStrength: 3.2 }),
    stone: stoneTextures({ size: 512 * q, seed: 5 }),
  };
  const std = (o) => new THREE.MeshStandardMaterial(o);
  const wood = (t, o = {}) => std({ map: t.map, normalMap: t.normalMap, roughness: 0.6, metalness: 0, ...o });
  const mats = {
    oakBeam: wood(tex.oakBeam, { name: 'oak-timber', roughness: 0.58 }),
    oakBoards: wood(tex.oakBoards, { name: 'oak-boards', roughness: 0.62 }),
    greenBeam: wood(tex.greenBeam, { name: 'forest-paint', roughness: 0.5 }),
    greenBoards: wood(tex.greenBoards, { name: 'forest-paint-boards', roughness: 0.52 }),
    stone: std({ name: 'split-stone', map: tex.stone.map, normalMap: tex.stone.normalMap, vertexColors: true, roughness: 0.88 }),
    cap: std({ name: 'cap-stone', map: tex.stone.map, normalMap: tex.stone.normalMap, color: new THREE.Color(1.0, 0.97, 0.93), roughness: 0.82 }),
    mortar: std({ name: 'mortar', color: 0x4a463f, roughness: 1 }),
    metal: std({ name: 'roof-metal', color: 0x2a2c30, metalness: 0.6, roughness: 0.38 }),
    pebble: std({ name: 'pebbles', map: tex.stone.map, normalMap: tex.stone.normalMap, normalScale: new THREE.Vector2(0.4, 0.4), vertexColors: true, roughness: 0.55 }),
    needles: std({ name: 'fir-needles', map: sprigTexture({ size: 512 * q, seed: 4 }), alphaTest: 0.42, side: THREE.DoubleSide, vertexColors: true, roughness: 0.78 }),
    core: std({ name: 'fir-core', color: 0x1d3317, roughness: 0.95 }),
  };
  return { tex, mats };
}

// ---------------------------------------------------------------- parts

/** collects geometries per material, merged at the end */
class Bin {
  constructor() { this.parts = new Map(); }
  add(key, g) { (this.parts.get(key) || this.parts.set(key, []).get(key)).push(g); }
}

function addTimber(bin, key, g, tex, r, opts = {}) {
  grainUV(g, tex, { offU: r(), offV: r(), ...opts });
  bin.add(key, g);
}

function buildArch(bin, T, r) {
  // outer posts (stand on the caps, run up into the header)
  for (const s of [-1, 1]) {
    const x0 = s * POST_OUT * PX, x1 = s * POST_IN * PX;
    addTimber(bin, 'greenBeam', box(Math.min(x0, x1), Y(BASE_TOP), -Z_POST, Math.max(x0, x1), Y(492), Z_POST, 0.008), T.greenBeam, r, { dir: new THREE.Vector3(0, 1, 0) });
  }
  // jambs: the legs of the arch ring, up to the impost band
  const BAND_Y = 747;
  for (const s of [-1, 1]) {
    const x0 = s * POST_IN * PX, x1 = s * JAMB * PX;
    addTimber(bin, 'greenBeam', box(Math.min(x0, x1), Y(BASE_TOP), -Z_RING, Math.max(x0, x1), Y(BAND_Y), Z_RING, 0.007), T.greenBeam, r, { dir: new THREE.Vector3(0, 1, 0) });
  }
  // the ring (curved glulam) from band to band
  const ao = Math.asin((RING_C - BAND_Y) / RING_OUT), ai = Math.asin((RING_C - BAND_Y) / RING_IN);
  const ring = new THREE.Shape();
  const outer = arcPts(628, RING_C, RING_OUT, -Math.PI / 2 + ao, Math.PI / 2 - ao, 72);
  const inner = arcPts(628, RING_C, RING_IN, Math.PI / 2 - ai, -Math.PI / 2 + ai, 72);
  ring.setFromPoints([...outer, ...inner]);
  addTimber(bin, 'greenBeam', extrude(ring, -Z_RING, Z_RING, { bevel: 0.007, curveSegments: 1 }), T.greenBeam, r,
    { center: { x: 0, y: Y(RING_C), ref: (RING_IN + RING_OUT) / 2 * PX } });

  // impost bands where the ring meets the jambs
  for (const s of [-1, 1]) {
    const x0 = s * (POST_IN + 4) * PX, x1 = s * (JAMB - 6) * PX;
    addTimber(bin, 'greenBeam', box(Math.min(x0, x1), Y(BAND_Y + 9), -Z_BAND, Math.max(x0, x1), Y(BAND_Y - 9), Z_BAND, 0.005), T.greenBeam, r);
  }

  // spandrel infill (vertical boards, recessed) between ring, posts and header
  const sp = new THREE.Shape();
  const pts = [new THREE.Vector2(X(628 - POST_IN), Y(RING_C))];
  for (let i = 0; i <= 48; i++) {
    const dx = -POST_IN + (2 * POST_IN) * i / 48;
    pts.push(new THREE.Vector2(dx * PX, Y(yHeadIn(dx) - 4)));
  }
  pts.push(new THREE.Vector2(X(628 + POST_IN), Y(RING_C)));
  pts.push(...arcPts(628, RING_C, RING_OUT - 2, Math.PI / 2, -Math.PI / 2, 72).slice(1, -1));
  sp.setFromPoints(pts);
  const spg = extrude(sp, -Z_SPAN, Z_SPAN, { bevel: 0, curveSegments: 1 });
  addTimber(bin, 'greenBoards', spg, T.greenBoards, r, { dir: new THREE.Vector3(0, 1, 0) });

  // curved header beam on top, square end cuts
  const hd = new THREE.Shape();
  const top = [], bot = [];
  for (let i = 0; i <= 64; i++) {
    const dx = -HEAD_HALF + 2 * HEAD_HALF * i / 64;
    top.push(new THREE.Vector2(dx * PX, Y(yTop(dx))));
    bot.push(new THREE.Vector2(dx * PX, Y(yHeadIn(dx))));
  }
  hd.setFromPoints([...bot, ...top.reverse()]);
  addTimber(bin, 'greenBeam', extrude(hd, -Z_HEAD, Z_HEAD, { bevel: 0.009, curveSegments: 1 }), T.greenBeam, r,
    { center: { x: 0, y: Y(CY_TOP), ref: R_TOP * PX } });
}

function buildRoof(bin, T, r) {
  // roof body: barge line, eave cuts and the curved soffit, extruded along z
  const profile = [];
  profile.push(new THREE.Vector2(0, Y(WOOD_APEX)));
  profile.push(new THREE.Vector2(X(628 + EAVE), Y(yRake(EAVE))));
  profile.push(new THREE.Vector2(X(628 + EAVE), Y(468)));
  const UNDER = 478;
  for (let i = 0; i <= 64; i++) {
    const dx = UNDER - 2 * UNDER * i / 64;
    profile.push(new THREE.Vector2(dx * PX, Y(ySoffit(dx))));
  }
  profile.push(new THREE.Vector2(X(628 - EAVE), Y(468)));
  profile.push(new THREE.Vector2(X(628 - EAVE), Y(yRake(EAVE))));

  // gable infill boards: one shape per half so boards run parallel to each rake
  const ang = Math.atan(SLOPE);
  for (const s of [-1, 1]) {
    const half = profile.filter((p) => p.x * s >= -1e-6);
    // order: apex -> eave -> soffit to centre
    const sh = new THREE.Shape();
    const pts = s > 0 ? half : [half[0], ...half.slice(1).reverse()];
    sh.setFromPoints(pts.length ? pts : half);
    for (const zf of [1, -1]) {
      const g = extrude(sh, zf > 0 ? Z_ROOF - 0.03 : -Z_ROOF, zf > 0 ? Z_ROOF : -Z_ROOF + 0.03, { bevel: 0, curveSegments: 1 });
      planarUV(g, T.oakBoards, s > 0 ? ang : -ang, r(), r());
      bin.add('oakBoards', g);
    }
  }

  // roof body: solid between the gables (soffit boards and eave ends visible)
  const body = new THREE.Shape();
  body.setFromPoints(profile);
  addTimber(bin, 'oakBoards', extrude(body, -Z_ROOF + 0.03, Z_ROOF - 0.03, { bevel: 0, curveSegments: 1 }), T.oakBoards, r,
    { dir: new THREE.Vector3(0, 0, 1) });

  // barge boards along both rakes, plumb cuts at the ridge and the eave
  for (const s of [-1, 1]) {
    const ex = EAVE + 4;
    const sh = new THREE.Shape();
    sh.setFromPoints([
      new THREE.Vector2(0, Y(WOOD_APEX)),
      new THREE.Vector2(s * ex * PX, Y(yRake(ex))),
      new THREE.Vector2(s * ex * PX, Y(yRake(ex) + BARGE)),
      new THREE.Vector2(0, Y(WOOD_APEX + BARGE)),
    ]);
    for (const zf of [1, -1]) {
      const z0 = zf > 0 ? Z_ROOF - 0.05 : -Z_BARGE, z1 = zf > 0 ? Z_BARGE : -Z_ROOF + 0.05;
      addTimber(bin, 'oakBeam', extrude(sh, z0, z1, { bevel: 0.007, curveSegments: 1 }), T.oakBeam, r,
        { dir: new THREE.Vector3(s * Math.cos(ang), -Math.sin(ang), 0) });
    }
  }
  // king post and struts on both gables
  for (const zf of [1, -1]) {
    const zc = zf * (Z_ROOF + 0.012), zd = 0.07;
    const kTop = WOOD_APEX + BARGE - 6, kBot = 368;
    const kp = box(X(600), Y(kBot), zc - zd / 2, X(656), Y(kTop), zc + zd / 2, 0.006);
    addTimber(bin, 'oakBeam', kp, T.oakBeam, r, { dir: new THREE.Vector3(0, 1, 0) });
    for (const s of [-1, 1]) {
      // from the foot of the king post up to the barge underside
      const fx = s * 28 * PX, fy = Y(352);
      const a = (36 * Math.PI) / 180;
      const dir = new THREE.Vector2(s * Math.cos(a), Math.sin(a));
      // walk until the barge underside
      let t = 0;
      while (t < 2) {
        const px = fx + dir.x * t, py = fy + dir.y * t;
        const under = Y(yRake(Math.abs(px) / PX) + BARGE * 0.92);
        if (py >= under) break;
        t += 0.005;
      }
      const g = beam(t, 46 * PX, zd - 0.012, 0.006);
      grainUV(g, T.oakBeam, { offU: r(), offV: r() });
      g.rotateZ(s * a);
      g.translate(fx + dir.x * t / 2, fy + dir.y * t / 2, zc - zf * 0.004);
      bin.add('oakBeam', g);
    }
  }

  // purlin ends under the eaves (square beams through the whole roof, bevelled foot)
  for (const s of [-1, 1]) {
    const x0 = 183, x1 = 255, yT = 396, yB = 470;
    const sh = new THREE.Shape();
    const ch = 16;  // bevel of the lower outer corner
    const P = (x, y) => new THREE.Vector2(s < 0 ? X(x) : X(1256 - x), Y(y));
    sh.setFromPoints([P(x0, yT), P(x1, yT), P(x1, yB), P(x0 + ch, yB), P(x0, yB - ch)]);
    const g = extrude(sh, -Z_BRACKET, Z_BRACKET, { bevel: 0.007, curveSegments: 1 });
    addTimber(bin, 'oakBeam', g, T.oakBeam, r, { dir: new THREE.Vector3(0, 0, 1) });
  }

  // standing-seam metal roof with drip edges and a ridge cap
  const metalT = 0.042;
  const L = (EAVE + 16) * PX / Math.cos(ang);
  for (const s of [-1, 1]) {
    const d = new THREE.Vector3(s * Math.cos(ang), -Math.sin(ang), 0);
    const nrm = new THREE.Vector3(s * Math.sin(ang), Math.cos(ang), 0);
    const sheet = beam(L, metalT, 2 * Z_METAL, 0.004);
    sheet.rotateZ(-s * ang);
    const c = new THREE.Vector3(0, Y(WOOD_APEX), 0).addScaledVector(d, L / 2).addScaledVector(nrm, metalT / 2 - 0.002);
    sheet.translate(c.x, c.y, 0);
    bin.add('metal', sheet);
    // seams every ~33 cm
    const n = 5;
    for (let i = 0; i < n; i++) {
      const z = -Z_METAL + 0.09 + (2 * Z_METAL - 0.18) * i / (n - 1);
      const seam = beam(L - 0.02, 0.028, 0.014, 0.004);
      seam.rotateZ(-s * ang);
      const sc = c.clone().addScaledVector(nrm, metalT / 2 + 0.012);
      seam.translate(sc.x, sc.y, z);
      bin.add('metal', seam);
    }
  }
  const ridge = beam(0.16, 0.05, 2 * Z_METAL + 0.01, 0.01);
  ridge.translate(0, Y(WOOD_APEX) + metalT + 0.012, 0);
  bin.add('metal', ridge);
}

/** Split-face stone plinth with a cap stone. cx = centre x (metres). */
function buildPlinth(bin, cx, r) {
  const W = 0.752, D = 0.58, H = 0.472, courses = 4;
  const ch = H / courses, joint = 0.009, depthT = 0.11;
  bin.add('mortar', box(cx - W / 2 + 0.012, 0, -D / 2 + 0.012, cx + W / 2 - 0.012, H, D / 2 - 0.012, 0));
  const tints = [[0.66, 0.66, 0.64], [0.84, 0.74, 0.6], [0.7, 0.58, 0.47], [0.78, 0.74, 0.68], [0.52, 0.53, 0.52], [0.86, 0.82, 0.75]];
  for (let k = 0; k < courses; k++) {
    const y0 = k * ch + joint / 2, y1 = (k + 1) * ch - joint / 2;
    const frontFull = (k % 2) === 0;
    // faces: [axis along, fixed coord, normal sign]
    const faces = [
      { along: 'x', fixed: D / 2, sign: 1, len: W, full: frontFull },
      { along: 'x', fixed: -D / 2, sign: -1, len: W, full: frontFull },
      { along: 'z', fixed: W / 2, sign: 1, len: D, full: !frontFull },
      { along: 'z', fixed: -W / 2, sign: -1, len: D, full: !frontFull },
    ];
    for (const f of faces) {
      const a0 = -f.len / 2 + (f.full ? 0 : depthT), a1 = f.len / 2 - (f.full ? 0 : depthT);
      let a = a0;
      while (a < a1 - 0.03) {
        let L = 0.13 + r() * 0.17;
        if (a1 - (a + L) < 0.1) L = a1 - a;
        const b0 = a + joint / 2, b1 = a + L - joint / 2;
        const out = (r() - 0.3) * 0.008;
        const t = tints[Math.floor(r() * tints.length)];
        const g = stone(b1 - b0, y1 - y0, depthT, r, t);
        // place: local x along the face, local z outward
        if (f.along === 'x') {
          if (f.sign < 0) g.rotateY(Math.PI);
          g.translate(cx + (b0 + b1) / 2, (y0 + y1) / 2, f.fixed + f.sign * (out - depthT / 2));
        } else {
          g.rotateY(f.sign > 0 ? Math.PI / 2 : -Math.PI / 2);
          g.translate(cx + f.fixed + f.sign * (out - depthT / 2), (y0 + y1) / 2, (b0 + b1) / 2);
        }
        bin.add('stone', g);
        a += L;
      }
    }
  }
  // cap stone
  const cw = 0.82, cd = 0.65, chh = Y(1028) - H;
  const cap = roundedBlock(cw, chh, cd, 0.012, 10, 3, 8, r, 0.0035);
  cap.translate(cx, H + chh / 2, 0);
  bin.add('cap', boxUV(cap, 0.5, r));
}

/** irregular split-face stone: rounded block with a rough outer face */
function stone(w, h, d, r, tint) {
  const g = roundedBlock(w, h, d, 0.014, 6, 3, 3, r, 0.0045, true);
  boxUV(g, 0.5, r);
  const n = g.attributes.position.count;
  const col = new Float32Array(n * 3);
  const k = 0.92 + r() * 0.16;
  for (let i = 0; i < n; i++) { col[i * 3] = tint[0] * k; col[i * 3 + 1] = tint[1] * k; col[i * 3 + 2] = tint[2] * k; }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return g;
}

/**
 * Box with rounded edges and noisy surface. Subdivided box whose vertices are
 * pushed onto a rounded box, then jittered. roughFront: extra relief on +z.
 */
function roundedBlock(w, h, d, radius, sx, sy, sz, r, amp, roughFront = false) {
  let g = new THREE.BoxGeometry(w, h, d, sx, sy, sz);
  g = g.toNonIndexed();
  const pos = g.attributes.position;
  const inner = new THREE.Vector3(w / 2 - radius, h / 2 - radius, d / 2 - radius);
  const p = new THREE.Vector3(), q = new THREE.Vector3();
  // stable per-position noise so shared corners stay welded
  const seed = Math.floor(r() * 1e6);
  const hn = (x, y, z) => {
    let s = Math.imul(Math.round(x * 2000) | 0, 73856093) ^ Math.imul(Math.round(y * 2000) | 0, 19349663) ^ Math.imul(Math.round(z * 2000) | 0, 83492791) ^ seed;
    s = Math.imul(s ^ (s >>> 13), 0x5bd1e995); s ^= s >>> 15;
    return ((s >>> 0) / 4294967296) - 0.5;
  };
  for (let i = 0; i < pos.count; i++) {
    p.fromBufferAttribute(pos, i);
    q.set(Math.max(-inner.x, Math.min(inner.x, p.x)), Math.max(-inner.y, Math.min(inner.y, p.y)), Math.max(-inner.z, Math.min(inner.z, p.z)));
    const dir = p.clone().sub(q);
    const len = dir.length();
    if (len > 1e-6) p.copy(q).addScaledVector(dir, radius / len);
    const n = hn(p.x, p.y, p.z);
    let a = amp * (1 + (roughFront && p.z > d / 2 - radius * 1.5 ? 1.6 : 0));
    p.addScaledVector(dir.lengthSq() > 0 ? dir.normalize() : new THREE.Vector3(0, 0, 1), n * a * 2);
    pos.setXYZ(i, p.x, p.y, p.z);
  }
  g.deleteAttribute('normal');
  g = toCreasedNormals(g, Math.PI / 3);
  return g;
}

/** triplanar-ish box UVs in metres (for stone) */
function boxUV(g, world, r) {
  const pos = g.attributes.position, nor = g.attributes.normal;
  const uv = new Float32Array(pos.count * 2);
  const ou = r(), ov = r();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const ax = Math.abs(nor.getX(i)), ay = Math.abs(nor.getY(i)), az = Math.abs(nor.getZ(i));
    let u, v;
    if (ax >= ay && ax >= az) { u = z; v = y; } else if (ay >= az) { u = x; v = z; } else { u = x; v = y; }
    uv[i * 2] = u / world + ou; uv[i * 2 + 1] = v / world + ov;
  }
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  return g;
}

/** Young fir (tall=true) or low spreading juniper made of sprig cards. */
function buildShrub(bin, cx, cz, height, radius, tall, r) {
  const cards = [];
  const up = new THREE.Vector3(0, 1, 0);
  const n = tall ? 260 : 170;
  for (let i = 0; i < n; i++) {
    let base, dir, len;
    if (tall) {
      const t = Math.pow(r(), 0.85);                       // height along the trunk
      const y = 0.06 + t * height * 0.86;
      const rad = radius * (1 - t) * (0.85 + r() * 0.3) + 0.05;
      const az = r() * Math.PI * 2;
      base = new THREE.Vector3(cx, y, cz);
      dir = new THREE.Vector3(Math.cos(az), 0.25 + r() * 0.35 - t * 0.1, Math.sin(az)).normalize();
      len = Math.max(0.12, rad * (0.9 + r() * 0.35));
    } else {
      const az = r() * Math.PI * 2, el = r() * 1.25;
      dir = new THREE.Vector3(Math.cos(az) * Math.cos(el), Math.sin(el) + 0.15, Math.sin(az) * Math.cos(el)).normalize();
      base = new THREE.Vector3(cx + (r() - 0.5) * radius * 0.5, 0.03 + r() * height * 0.25, cz + (r() - 0.5) * radius * 0.4);
      len = radius * (0.65 + r() * 0.45);
    }
    const width = len * (0.75 + r() * 0.25);
    // card frame: v along dir, u = random roll around dir
    const side = new THREE.Vector3().crossVectors(dir, up);
    if (side.lengthSq() < 1e-4) side.set(1, 0, 0);
    side.normalize().applyAxisAngle(dir, (r() - 0.5) * Math.PI * 0.9);
    const p0 = base.clone().addScaledVector(side, -width / 2), p1 = base.clone().addScaledVector(side, width / 2);
    const tip = dir.clone().multiplyScalar(len);
    tip.y -= len * len * (tall ? 0.35 : 0.2);              // branches droop
    const p2 = p1.clone().add(tip), p3 = p0.clone().add(tip);
    // inner = darker, tips lighter, plus random tint
    const k = 0.75 + r() * 0.35;
    const warm = r() * 0.12;
    const cBase = [0.42 * k, 0.45 * k, 0.4 * k], cTip = [(1.0 + warm) * k, 1.0 * k, (0.92 - warm) * k];
    cards.push([p0, p1, p2, p3, cBase, cTip]);
  }
  const pos = [], uv = [], col = [], nor = [];
  const nrm = new THREE.Vector3();
  for (const [p0, p1, p2, p3, cb, ct] of cards) {
    nrm.subVectors(p1, p0).cross(new THREE.Vector3().subVectors(p3, p0)).normalize();
    // bend normals outward a little so cards shade like a volume
    const out = new THREE.Vector3((p0.x + p2.x) / 2 - cx, 0.4, (p0.z + p2.z) / 2 - cz).normalize();
    const nn = nrm.clone().multiplyScalar(0.35).addScaledVector(out, 0.65).normalize();
    const quad = [[p0, 0, 0, cb], [p1, 1, 0, cb], [p2, 1, 1, ct], [p0, 0, 0, cb], [p2, 1, 1, ct], [p3, 0, 1, ct]];
    for (const [p, u, v, c] of quad) {
      pos.push(p.x, p.y, p.z); uv.push(u, v); col.push(...c); nor.push(nn.x, nn.y, nn.z);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  bin.add('needles', g);
  // dark core so you never look straight through the shrub
  const core = tall ? new THREE.ConeGeometry(radius * 0.55, height * 0.8, 10, 1) : new THREE.SphereGeometry(radius * 0.55, 10, 6);
  if (tall) core.translate(cx, height * 0.43, cz); else { core.scale(1, 0.6, 0.9); core.translate(cx, height * 0.28, cz); }
  bin.add('core', core.toNonIndexed());
}

function buildPebble(bin, x, z, s, r, tint) {
  let g = new THREE.IcosahedronGeometry(1, 3);
  g = g.toNonIndexed();
  const pos = g.attributes.position;
  const sx = s * (1 + r() * 0.5), sy = s * (0.55 + r() * 0.2), sz = s * (0.8 + r() * 0.3);
  const ph = r() * 10;
  for (let i = 0; i < pos.count; i++) {
    const px = pos.getX(i), py = pos.getY(i), pz = pos.getZ(i);
    const n = 1 + 0.08 * Math.sin(px * 3.1 + ph) * Math.sin(pz * 2.7 + ph * 1.3) + 0.05 * Math.sin(py * 4 + ph);
    pos.setXYZ(i, px * sx * n, Math.max(py * sy * n, -sy * 0.45), pz * sz * n);
  }
  g.deleteAttribute('normal');
  g = toCreasedNormals(g, Math.PI / 2.2);
  g.rotateY(r() * Math.PI);
  g.translate(x, sy * 0.4, z);
  boxUV(g, 0.35, r);
  const n = g.attributes.position.count, col = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) col.set(tint, i * 3);
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  bin.add('pebble', g);
}

// ---------------------------------------------------------------- main

/**
 * @param {object} o
 * @param {boolean} o.plants   firs, junipers and pebbles at the plinths
 * @param {number}  o.quality  texture multiplier (1 = 1024 px wood tiles)
 */
export function buildPavilion({ plants = true, quality = 1 } = {}) {
  const r = rng(20261012);
  const { tex, mats } = makeMaterials(quality);
  const bin = new Bin();
  buildArch(bin, tex, r);
  buildRoof(bin, tex, r);
  const plinthX = (279 - 628) * PX;
  buildPlinth(bin, plinthX, r);
  buildPlinth(bin, -plinthX, r);
  if (plants) {
    buildShrub(bin, X(150), 0.12, 0.92, 0.36, true, r);
    buildShrub(bin, X(200), 0.42, 0.34, 0.3, false, r);
    buildShrub(bin, X(1110), 0.06, 0.88, 0.34, true, r);
    buildShrub(bin, X(1050), 0.44, 0.3, 0.28, false, r);
    buildPebble(bin, X(105), 0.42, 0.075, r, [0.62, 0.5, 0.4]);
    buildPebble(bin, X(140), 0.5, 0.06, r, [0.78, 0.72, 0.62]);
    buildPebble(bin, X(1130), 0.45, 0.07, r, [0.66, 0.66, 0.62]);
    buildPebble(bin, X(1165), 0.36, 0.05, r, [0.72, 0.62, 0.5]);
  }

  const group = new THREE.Group();
  group.name = 'DomOrava';
  const names = {
    oakBeam: 'roof-timber', oakBoards: 'roof-boards', greenBeam: 'arch-timber', greenBoards: 'arch-boards',
    stone: 'plinth-stones', cap: 'plinth-caps', mortar: 'plinth-core', metal: 'roof-metal',
    pebble: 'pebbles', needles: 'firs', core: 'fir-cores',
  };
  for (const [key, list] of bin.parts) {
    // unify attributes before merging
    const needColor = list.some((g) => g.attributes.color);
    const prepared = list.map((g) => {
      let q = g.index ? g.toNonIndexed() : g;
      for (const a of Object.keys(q.attributes)) if (!['position', 'normal', 'uv', 'color'].includes(a)) q.deleteAttribute(a);
      if (!q.attributes.uv) q.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(q.attributes.position.count * 2), 2));
      if (needColor && !q.attributes.color) {
        const c = new Float32Array(q.attributes.position.count * 3).fill(1);
        q.setAttribute('color', new THREE.BufferAttribute(c, 3));
      }
      q.clearGroups();
      return q;
    });
    const merged = mergeGeometries(prepared, false);
    const mesh = new THREE.Mesh(merged, mats[key]);
    mesh.name = names[key] || key;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
  }
  return { group, materials: mats, textures: tex };
}
