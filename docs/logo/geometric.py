# Clean geometric DomOrava mark, measured from the generated pavilion
# (1254 px canvas): an oak gable roof floating over a forest-green arch,
# separated by one even gap that follows the arch's curved top.
# Output: mark-geo.svg, mark-geo.json (paths in a 0..1000 high box), previews.
import math, json, os, sys
import numpy as np
import cv2

out = os.path.dirname(os.path.abspath(__file__))
CX = 628.0

# --- structure top: circle through (190,498), (628,395), (1066,498)
half, sag = 438.0, 103.0
R = (half * half + sag * sag) / (2 * sag)
CY = 395.0 + R
GAP = 30.0


def arc_y(x, r):
    return CY - math.sqrt(r * r - (x - CX) ** 2)


def arc_pts(x0, x1, r, n=48):
    return [(x0 + (x1 - x0) * i / n, arc_y(x0 + (x1 - x0) * i / n, r)) for i in range(n + 1)]


def rounded(poly, radius, closed=True, sharp=()):
    """Polygon -> SVG path with quadratic rounded corners (skip indices in sharp)."""
    n = len(poly)
    d = []
    for i in range(n):
        p0, p1, p2 = poly[i - 1], poly[i], poly[(i + 1) % n]
        if i in sharp or radius <= 0:
            a = b = p1
        else:
            v1 = (p0[0] - p1[0], p0[1] - p1[1])
            v2 = (p2[0] - p1[0], p2[1] - p1[1])
            l1, l2 = math.hypot(*v1), math.hypot(*v2)
            r = min(radius, l1 * 0.45, l2 * 0.45)
            a = (p1[0] + v1[0] / l1 * r, p1[1] + v1[1] / l1 * r)
            b = (p1[0] + v2[0] / l2 * r, p1[1] + v2[1] / l2 * r)
        d.append((a, p1, b))
    s = f'M{d[0][2][0]:.1f},{d[0][2][1]:.1f}'
    for i in range(1, n + 1):
        a, p, b = d[i % n]
        s += f' L{a[0]:.1f},{a[1]:.1f}'
        if a != b:
            s += f' Q{p[0]:.1f},{p[1]:.1f} {b[0]:.1f},{b[1]:.1f}'
    return s + ' Z'


# --- roof: apex, eaves with a short fascia, underside = arc concentric to the structure top
APEX = (CX, 74.0)
EAVE_X = 67.0
EAVE_TOP = 392.0
FASCIA_BOTTOM = 470.0
UNDER_END = 150.0  # where the underside arc starts
r_under = R + GAP
roof = [APEX, (2 * CX - EAVE_X, EAVE_TOP), (2 * CX - EAVE_X, FASCIA_BOTTOM)]
roof += [p for p in arc_pts(2 * CX - UNDER_END, UNDER_END, r_under)]
roof += [(EAVE_X, FASCIA_BOTTOM), (EAVE_X, EAVE_TOP)]
# round only the real corners: apex, eave corners, and the two kinks where the arc starts
corner_idx = {0, 1, 2, 3, len(roof) - 3, len(roof) - 2, len(roof) - 1}
arc_idx = set(range(4, len(roof) - 3))
roof_d = rounded(roof, 9, sharp=arc_idx)

# --- structure: curved top, beam ends overhang the posts a little, semicircular opening
TOP_L, TOP_R = 190.0, 1066.0
BEAM_BOTTOM = 536.0
POST_OUT_L, POST_OUT_R = 206.0, 2 * CX - 206.0
BOTTOM = 1028.0
JAMB_L, JAMB_R = 358.0, 2 * CX - 358.0
SPRING = 785.0
r_open = (JAMB_R - JAMB_L) / 2
outer = arc_pts(TOP_L, TOP_R, R)[::-1]  # right to left along the top? keep orientation consistent
outer = arc_pts(TOP_L, TOP_R, R)
struct = list(outer)  # left -> right along the top
struct += [(TOP_R, BEAM_BOTTOM), (POST_OUT_R, BEAM_BOTTOM), (POST_OUT_R, BOTTOM), (JAMB_R, BOTTOM), (JAMB_R, SPRING)]
for i in range(1, 64):
    a = math.pi * i / 64  # right jamb -> over the top -> left jamb
    struct.append((CX + r_open * math.cos(a), SPRING - r_open * math.sin(a)))
struct += [(JAMB_L, SPRING), (JAMB_L, BOTTOM), (POST_OUT_L, BOTTOM), (POST_OUT_L, BEAM_BOTTOM), (TOP_L, BEAM_BOTTOM)]
n_arc_top = 49
sharp = set(range(1, n_arc_top - 1)) | set(range(n_arc_top + 5, n_arc_top + 5 + 64))
struct_d = rounded(struct, 7, sharp=sharp)

xs = [p[0] for p in roof + struct]
ys = [p[1] for p in roof + struct]
box = [min(xs), min(ys), max(xs), max(ys)]
print('box', [round(v, 1) for v in box], 'R', round(R, 1))

OAK, FOREST = '#806447', '#263E33'
vb = f'{box[0]:.1f} {box[1]:.1f} {box[2]-box[0]:.1f} {box[3]-box[1]:.1f}'
svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}"><path fill="{OAK}" d="{roof_d}"/><path fill="{FOREST}" d="{struct_d}"/></svg>'
open(os.path.join(out, 'mark-geo.svg'), 'w').write(svg)
json.dump({'box': box, 'roof': roof_d, 'structure': struct_d}, open(os.path.join(out, 'mark-geo.json'), 'w'))

# raster previews via cv2 polygon fill (corners unrounded, fine for a check)
S = 2.0
img = np.full((int(1254 * S), int(1254 * S), 3), (237, 243, 246), np.uint8)
cv2.fillPoly(img, [np.array([[x * S, y * S] for x, y in roof], np.int32)], (71, 100, 128), cv2.LINE_AA)
cv2.fillPoly(img, [np.array([[x * S, y * S] for x, y in struct], np.int32)], (51, 62, 38), cv2.LINE_AA)
img = cv2.resize(img, (1254, 1254), interpolation=cv2.INTER_AREA)
cv2.imwrite(os.path.join(out, 'mark-geo.png'), img)
crop = img[40:1060, 40:1220]
tiles = [cv2.resize(crop, (s * 1180 // 1020 if False else s, s), interpolation=cv2.INTER_AREA) for s in (24, 32, 64, 128)]
canvas = np.full((160, 300, 3), (237, 243, 246), np.uint8)
x = 8
for t in tiles:
    canvas[8:8 + t.shape[0], x:x + t.shape[1]] = t
    x += t.shape[1] + 10
cv2.imwrite(os.path.join(out, 'mark-geo-small.png'), cv2.resize(canvas, (900, 480), interpolation=cv2.INTER_NEAREST))
