# Favicon / app icons with the new mark: forest rounded square, ivory arch, light oak roof.
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
PROJ = sys.argv[1]
src = open(os.path.join(PROJ, 'resources', 'js', 'intro', 'logo-data.js'), encoding='utf-8').read()
data = json.loads(src[src.index('{'):src.rindex('}') + 1])
mw, mh = data['markBox'][2], data['markBox'][3]
roof = next(p['d'] for p in data['mark'] if p['part'] == 'roof')
struct = next(p['d'] for p in data['mark'] if p['part'] == 'structure')


def icon(size_box=64, pad=0.17, radius=0.19, bg='#263e33', arch='#f4f0e8', roof_c='#d0ad7e'):
    inner = size_box * (1 - 2 * pad)
    s = inner / max(mw, mh)
    dx = (size_box - mw * s) / 2
    dy = (size_box - mh * s) / 2 + size_box * 0.01
    r = size_box * radius
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size_box} {size_box}">'
            f'<rect width="{size_box}" height="{size_box}" rx="{r:.1f}" fill="{bg}"/>'
            f'<g transform="translate({dx:.2f} {dy:.2f}) scale({s:.5f})">'
            f'<path fill="{arch}" d="{struct}"/><path fill="{roof_c}" d="{roof}"/></g></svg>')


fav = icon()
open(os.path.join(PROJ, 'public', 'favicon.svg'), 'w', encoding='utf-8', newline='\n').write(fav)
# square without rounding for apple-touch (iOS rounds it) and the 512 logo
open(os.path.join(HERE, 'icon-square.svg'), 'w', encoding='utf-8').write(icon(radius=0, pad=0.16))
print('favicon.svg', len(fav), 'bytes')
