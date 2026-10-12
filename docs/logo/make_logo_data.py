# DomOrava lockup for the 3D intro and the header:
#  - mark: the two geometric pieces (roof, structure) from mark-geo.json
#  - wordmark: "DomOrava" in Cormorant Garamond 600 + ".sk" in Cormorant italic 500,
#    letter-spacing as on the site (-0.035em / -0.02em), GPOS kerning applied.
# Units: "lockup units", y pointing down, mark 400 high, cap height 160.
# Writes resources/js/intro/logo-data.js and two Blade components with inline SVG.
import json, os, re, sys
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

HERE = os.path.dirname(os.path.abspath(__file__))
PROJ = sys.argv[1]
FONTS = os.path.join(PROJ, 'resources', 'fonts')
NORMAL = os.path.join(FONTS, 'co3bmX5slCNuHLi8bLeY9MK7whWMhyjYqXtK.woff2')
ITALIC = os.path.join(FONTS, 'co3ZmX5slCNuHLi8bLeY9MK7whWMhyjYrEtImSo.woff2')

MARK_H = 400.0
CAP = 160.0
GAP_EM = 0.62  # space between mark and text, in cap heights

geo = json.load(open(os.path.join(HERE, 'mark-geo.json')))
bx0, by0, bx1, by1 = geo['box']
ms = MARK_H / (by1 - by0)


def tf_path(d, sx, sy, dx, dy, nd=2):
    nums = re.findall(r'-?\d+(?:\.\d+)?', d)
    cmds = re.findall(r'[MLQZ]', d)
    out, i = [], 0
    toks = re.findall(r'[MLQZ]|-?\d+(?:\.\d+)?,-?\d+(?:\.\d+)?', d)
    for tk in toks:
        if tk in 'MLQZ':
            out.append(tk)
        else:
            x, y = map(float, tk.split(','))
            out.append(f'{x * sx + dx:.{nd}f},{y * sy + dy:.{nd}f}')
    s = ''
    for tk in out:
        s += (tk if tk in 'MLQZ' else ' ' + tk + ' ') if tk != 'Z' else 'Z'
    return re.sub(r'\s+', ' ', s).replace(' M', 'M').strip()


roof_d = tf_path(geo['roof'], ms, ms, -bx0 * ms, -by0 * ms)
struct_d = tf_path(geo['structure'], ms, ms, -bx0 * ms, -by0 * ms)
mark_w = (bx1 - bx0) * ms
mark_box = [0, 0, round(mark_w, 2), MARK_H]


def instance(path, wght):
    f = TTFont(path)
    return instancer.instantiateVariableFont(f, {'wght': wght}) if 'fvar' in f else f


def kern_table(font):
    """Pair kerning (font units) from GPOS 'kern' lookups, PairPos format 1 and 2."""
    pairs = {}
    if 'GPOS' not in font:
        return lambda a, b: 0
    gpos = font['GPOS'].table
    idx = set()
    for fr in gpos.FeatureList.FeatureRecord:
        if fr.FeatureTag == 'kern':
            idx.update(fr.Feature.LookupListIndex)
    subs = []
    for i in idx:
        lk = gpos.LookupList.Lookup[i]
        for st in lk.SubTable:
            if lk.LookupType == 9:
                st = st.ExtSubTable
            if st.LookupType == 2 if hasattr(st, 'LookupType') else True:
                subs.append(st)

    def kern(a, b):
        for st in subs:
            cov = st.Coverage.glyphs
            if a not in cov:
                continue
            if st.Format == 1:
                ps = st.PairSet[cov.index(a)]
                for r in ps.PairValueRecord:
                    if r.SecondGlyph == b:
                        return getattr(r.Value1, 'XAdvance', 0) or 0
            elif st.Format == 2:
                c1 = st.ClassDef1.classDefs.get(a, 0)
                c2 = st.ClassDef2.classDefs.get(b, 0)
                v = st.Class1Record[c1].Class2Record[c2].Value1
                adv = getattr(v, 'XAdvance', 0) or 0 if v else 0
                if adv:
                    return adv
        return 0
    return kern


def run(font, text, tracking_em, x0, scale, base_y, tone):
    gs = font.getGlyphSet()
    cmap = font.getBestCmap()
    upm = font['head'].unitsPerEm
    kern = kern_table(font)
    names = [cmap[ord(c)] for c in text]
    x = x0
    out = []
    for i, (ch, gn) in enumerate(zip(text, names)):
        pen = SVGPathPen(gs)
        # font units (y up) -> lockup (y down)
        tp = TransformPen(pen, (scale, 0, 0, -scale, x, base_y))
        gs[gn].draw(tp)
        bp = BoundsPen(gs)
        gs[gn].draw(bp)
        d = pen.getCommands()
        if bp.bounds:
            b = bp.bounds
            bbox = [x + b[0] * scale, base_y - b[3] * scale, x + b[2] * scale, base_y - b[1] * scale]
            out.append({'ch': ch, 'd': d, 'bbox': [round(v, 2) for v in bbox], 'tone': tone})
        adv = gs[gn].width
        if i + 1 < len(names):
            adv += kern(gn, names[i + 1])
        x += adv * scale + tracking_em * upm * scale
    return out, x


normal = instance(NORMAL, 600)
italic = instance(ITALIC, 500)
cap_units = normal['OS/2'].sCapHeight or 630
scale_n = CAP / cap_units
scale_i = scale_n  # same font size for both spans
upm = normal['head'].unitsPerEm
base_y = MARK_H / 2 + CAP / 2  # cap centred on the mark
x0 = mark_w + GAP_EM * CAP
name, xe = run(normal, 'DomOrava', -0.035, x0, scale_n, base_y, 'name')
domain, xe2 = run(italic, '.sk', -0.02, xe, scale_i, base_y, 'domain')
letters = name + domain
cap = [round(base_y - CAP, 2), round(base_y, 2)]
print('mark', mark_box, 'text from', round(x0, 1), 'to', round(max(l['bbox'][2] for l in letters), 1), 'upm', upm, 'capUnits', cap_units)

data = {
    'markBox': mark_box,
    'mark': [{'part': 'structure', 'd': struct_d}, {'part': 'roof', 'd': roof_d}],
    'letters': letters,
    'cap': cap,
}
js = ('// DomOrava lockup for the 3D intro and the header logo (generated, do not edit by hand).\n'
      '// Mark: oak roof over a forest-green arch, rebuilt as clean geometry from the generated\n'
      '// pavilion (docs/logo). Wordmark: Cormorant Garamond 600 "DomOrava" + italic 500 ".sk",\n'
      '// tracking as on the site. Units: y down, mark 400 high, cap height 160.\n'
      'export const DOMORAVA_LOGO = ' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n')
os.makedirs(os.path.join(PROJ, 'resources', 'js', 'intro'), exist_ok=True)
open(os.path.join(PROJ, 'resources', 'js', 'intro', 'logo-data.js'), 'w', encoding='utf-8', newline='\n').write(js)

# Blade components: inline SVG, colours from the header tokens (they flip over dark photos).
tb = [min(l['bbox'][0] for l in letters), min(l['bbox'][1] for l in letters), max(l['bbox'][2] for l in letters), max(l['bbox'][3] for l in letters)]
tb = [round(v, 2) for v in tb]
comp = os.path.join(PROJ, 'resources', 'views', 'components')
mark_svg = ('{{-- generated by docs/logo/make_logo_data.py: oak roof over the forest arch --}}\n'
            f'<svg {{{{ $attributes->merge([\'class\' => \'brand-mark\']) }}}} viewBox="0 0 {mark_box[2]} {mark_box[3]}" aria-hidden="true" focusable="false">'
            f'<path class="brand-mark-structure" fill="#263E33" d="{struct_d}"/>'
            f'<path class="brand-mark-roof" fill="#806447" d="{roof_d}"/></svg>\n')
open(os.path.join(comp, 'brand-mark.blade.php'), 'w', encoding='utf-8', newline='\n').write(mark_svg)
name_d = ''.join(l['d'] for l in name)
dom_d = ''.join(l['d'] for l in domain)
word_svg = ('{{-- generated by docs/logo/make_logo_data.py: DomOrava (Cormorant 600) + .sk (italic 500) --}}\n'
            f'<svg {{{{ $attributes->merge([\'class\' => \'brand-text\']) }}}} viewBox="{tb[0]} {tb[1]} {round(tb[2]-tb[0], 2)} {round(tb[3]-tb[1], 2)}" aria-hidden="true" focusable="false">'
            f'<path class="brand-text-name" fill="#263E33" d="{name_d}"/>'
            f'<path class="brand-text-domain" fill="#806447" d="{dom_d}"/></svg>\n')
open(os.path.join(comp, 'brand-wordmark.blade.php'), 'w', encoding='utf-8', newline='\n').write(word_svg)
json.dump({'markBox': mark_box, 'textBox': tb, 'cap': cap}, open(os.path.join(HERE, 'lockup.json'), 'w'))

# preview SVG of the whole lockup
pv = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-40 -40 {tb[2] + 80} {MARK_H + 80}" style="background:#f6f3ed">'
      f'<path fill="#263E33" d="{struct_d}"/><path fill="#806447" d="{roof_d}"/>'
      f'<path fill="#263E33" d="{name_d}"/><path fill="#806447" d="{dom_d}"/></svg>')
open(os.path.join(HERE, 'lockup-preview.svg'), 'w', encoding='utf-8').write(pv)
print('text box', tb)
