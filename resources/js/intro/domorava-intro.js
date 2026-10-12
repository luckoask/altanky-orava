/* DomOrava intro: 3D logo pred stránkou domorava.sk.
 *
 * Ten istý film ako na lcks.eu a LCKSplit, vo svetlých farbách webu, ale so
 * skutočným modelom altánku z Blendera: zelený rám na kamenných pätkách príde
 * zdola, drevená strecha dopadne zhora a dosadne, kríky vyrastú. Model sa
 * dotočí čelom, pätky a kríky odídu a pás svetla ho zdola nahor premení na
 * plochú značku. Značka sa posunie doľava a vedľa nej sa vypíše
 * „DomOrava.sk“. Slonovinová plocha sa potom rozdelí po oblúku medzi
 * strechou a stĺpmi (strecha hore, oblúk dole) a logo dosadne do hlavičky.
 *
 * Three.js a model sa sťahujú iba vtedy, keď intro naozaj beží (samostatný
 * kúsok). Model vzniká skriptom docs/logo/export_portal_glb.py.
 *
 * Celá animácia je čistá funkcia času, frame(t): ?intro_t=3.4 zastaví na
 * snímke, ?intro_speed=0.3 spomalí. Kedy sa intro pustí, rozhoduje app.js.
 */
import './domorava-intro.css';
import { DOMORAVA_LOGO } from './logo-data.js';
import PORTAL_URL from './domorava-portal.glb?url';

function loadThree() {
    return import('./three-parts.js').then(function (m) {
        return { THREE: m, RoomEnvironment: m.RoomEnvironment, SVGLoader: m.SVGLoader, toCreasedNormals: m.toCreasedNormals, GLTFLoader: m.GLTFLoader };
    });
}

/* Model altánku: 1 m modelu = 222,2 px predlohy (docs/logo/pavilion-source.png),
   stred x = 627 px, zem = 1183 px. Značka v intre je tá istá predloha
   prekreslená v rámčeku 67–1189 × 74–1028 px (docs/logo/mark-geo.json), takže
   model sedí presne na nej. */
var PORTAL = { pxPerM: 2000 / 9, x0: 627, ground: 1183, markBox: [67, 74, 1189, 1028], joint: 3.58 };

/* Spustí intro. Vráti Promise, ktorý sa splní vo chvíli, keď sa opona otvára
   (aj pri preskočení či chybe), aby stránka vedela pustiť vlastný úvod. */
export function startIntro(opts) {
    opts = opts || {};
    // Pohyb ako pri „dieliku“ na lcks.eu: najprv spodný diel (oblúk), strecha dopadne po ňom.
    var VARIANT = 'dielik';
    var SKIP_LABEL = opts.skipLabel || 'Preskočiť';
    var onReveal = function () {};
    var whenRevealed = new Promise(function (resolve) { onReveal = resolve; });
    run(true);
    return whenRevealed;

    function run(force) {
        var doc  = document;
        var html = doc.documentElement;
        var DATA = DOMORAVA_LOGO;

        var qs     = new URLSearchParams(location.search);
        var FREEZE = qs.has('intro_t') ? parseFloat(qs.get('intro_t')) : null;
        var SPEED  = qs.has('intro_speed') ? Math.max(0.05, parseFloat(qs.get('intro_speed')) || 1) : 1;
        var HOLD   = qs.has('intro_hold');

        var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;


        var skipIntro = FREEZE === null && !force &&
            (reduce || (location.hash.length > 1 && !qs.has('intro')));
        if (!DATA || skipIntro) {
            window.DOMORAVA_INTRO_REVEALED = true;
            window.DOMORAVA_INTRO_DONE = true;
            onReveal();
            return;
        }

        // Model sa sťahuje hneď, súbežne s three.js.
        var modelBytes = fetch(PORTAL_URL).then(function (r) {
            if (!r.ok) throw new Error('model ' + r.status);
            return r.arrayBuffer();
        });

        /* ------------------------------------------------------------------ DOM */

        window.DOMORAVA_INTRO_REVEALED = false;
        window.DOMORAVA_INTRO_DONE = false;
        html.classList.add('si-on');
        var restoreWas = 'scrollRestoration' in history ? history.scrollRestoration : null;
        if (restoreWas !== null) history.scrollRestoration = 'manual';
        window.scrollTo(0, 0);

        // Polovica opony: výplň a hrana rezu. Hrana má ľavú aj pravú vetvu ako
        // samostatné cesty, aby sa každá dala dokresľovať od stredu von.
        function half(name) {
            var edge = function (cls, side) {
                return cls === 'si-edge-glow'
                    ? '<path class="si-edge-glow" data-side="' + side + '" fill="none" stroke="#d9bc8f" stroke-width="5" stroke-linecap="round" filter="url(#si-blur)" opacity="0"/>'
                    : '<path class="si-edge" data-side="' + side + '" fill="none" stroke="#806447" stroke-width="1.2" stroke-linecap="round" opacity="0"/>';
            };
            return '<g class="si-half" data-half="' + name + '"><polygon fill="url(#si-fill)"/>' +
                edge('si-edge-glow', 'l') + edge('si-edge-glow', 'r') + edge('si-edge', 'l') + edge('si-edge', 'r') + '</g>';
        }

        var el = doc.createElement('div');
        el.id = 'si';
        el.innerHTML =
            '<div class="si-back"></div>' +
            '<svg class="si-curtains" aria-hidden="true">' +
              '<defs>' +
                '<radialGradient id="si-fill" gradientUnits="userSpaceOnUse">' +
                  '<stop offset="0" stop-color="#fcfaf5"/>' +
                  '<stop offset=".55" stop-color="#f4efe5"/>' +
                  '<stop offset="1" stop-color="#e6ddcc"/>' +
                '</radialGradient>' +
                '<filter id="si-blur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3.5"/></filter>' +
              '</defs>' +
              half('top') + half('bottom') +
            '</svg>' +
            '<div class="si-vignette"></div>' +
            '<div class="si-grain"></div>' +
            '<div class="si-load" aria-hidden="true"></div>' +
            '<button type="button" class="si-skip"></button>';
        (doc.body || html).appendChild(el);

        // Vlastná opona stránky (čierna s nápisom) je pod nami zbytočná. Len sa
        // skryje, úvod stránky ju potom sám odstráni.
        var siteCurtain = doc.querySelector('.curtain');
        if (siteCurtain) siteCurtain.style.display = 'none';

        var back     = el.querySelector('.si-back');
        var svg      = el.querySelector('.si-curtains');
        var halves   = el.querySelectorAll('.si-half');
        var grad     = el.querySelector('#si-fill');
        var vignette = el.querySelector('.si-vignette');
        var grain    = el.querySelector('.si-grain');
        var skipBtn  = el.querySelector('.si-skip');
        skipBtn.textContent = SKIP_LABEL;

        /* --------------------------------------------------------- časovanie */

        var T = {
            in0: 0.30, in1: 2.15,          // príchod spodku a strechy
            turn1: 3.00,                   // model sa dotočí čelom k divákovi
            hide0: 2.85, hide1: 3.35,      // kríky a kamenné pätky odídu
            scan0: 3.20, scan1: 3.95,      // pás svetla premení model na značku
            slide0: 3.85, slide1: 4.85,    // posun doľava
            caret0: 4.58,                  // kurzor sa objaví, keď ho značka odkryje
            type0: 4.72, step: 0.115, ldur: 0.62,
            sweep0: 5.85, sweep1: 6.95,    // pás svetla
            crack0: 6.90, crack1: 7.25,    // prasknutie opony
            split0: 7.20, split1: 8.30,    // rozostúpenie
            fly0: 7.15, fly1: 8.20,        // let do hlavičky
            land: 8.20, end: 8.65
        };

        /* ------------------------------------------------------------ pomocné */

        function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
        function lerp(a, b, k) { return a + (b - a) * k; }
        function prog(t, a, b) { return clamp01((t - a) / (b - a)); }
        function smooth(x) { x = clamp01(x); return x * x * (3 - 2 * x); }

        /* Kubická Bézierova krivka ako v CSS a After Effects. */
        function bezier(x1, y1, x2, y2) {
            function cA(a, b) { return 1 - 3 * b + 3 * a; }
            function cB(a, b) { return 3 * b - 6 * a; }
            function cC(a) { return 3 * a; }
            function at(t, a, b) { return ((cA(a, b) * t + cB(a, b)) * t + cC(a)) * t; }
            function sl(t, a, b) { return 3 * cA(a, b) * t * t + 2 * cB(a, b) * t + cC(a); }
            return function (x) {
                if (x <= 0) return 0;
                if (x >= 1) return 1;
                var t = x, i;
                for (i = 0; i < 8; i++) {
                    var s = sl(t, x1, x2);
                    if (Math.abs(s) < 1e-6) break;
                    t -= (at(t, x1, x2) - x) / s;
                }
                if (!(t >= 0 && t <= 1) || Math.abs(at(t, x1, x2) - x) > 1e-4) {
                    var lo = 0, hi = 1;
                    for (i = 0; i < 40; i++) {
                        t = (lo + hi) / 2;
                        if (at(t, x1, x2) < x) lo = t; else hi = t;
                    }
                }
                return at(t, y1, y2);
            };
        }

        var E_IN    = bezier(0.12, 0.86, 0.22, 1);   // príchod, dlhé mäkké dobrzdenie
        var E_INOUT = bezier(0.65, 0, 0.35, 1);
        var E_SOFT  = bezier(0.22, 1, 0.36, 1);      // tá istá krivka ako na stránke
        var E_LET   = bezier(0.2, 0.85, 0.25, 1);
        var E_SPLIT = bezier(0.76, 0, 0.24, 1);
        var E_FLY   = bezier(0.62, 0, 0.22, 1);

        /* Mierny presah, keď kríky vyrastú. */
        function backOut(x) { x = clamp01(x) - 1; return 1 + 2.2 * x * x * x + 1.2 * x * x; }

        /* Okamih dotyku: diely sú na 99 % cesty. */
        var tContact = (function () {
            var p = 0;
            while (p < 1 && E_IN(p) < 0.99) p += 0.002;
            // Pri dieliku je dotyk na dopade dielika, ten štartuje neskôr.
            var a0 = VARIANT === 'dielik' ? T.in0 + 0.35 : T.in0;
            return a0 + p * (T.in1 - a0);
        })();

        /* Obálka záblesku: rýchly nábeh, pomalý dozvuk. */
        function pulse(t, at, rise, decay) {
            var d = t - at;
            return d < 0 ? Math.exp(-(d / rise) * (d / rise)) : Math.exp(-d / decay);
        }

        /* ------------------------------------------------------------- opony */

        var CUT = null;   // geometria rezu v pixeloch obrazovky

        /* Rez opony podľa medzery v značke: oblúk ako spodok strechy nad
           stĺpmi, v strede najvyššie, ku krajom klesá. Horná časť (strecha)
           odíde hore, dolná (oblúk) dole. Hrana má dve vetvy, obe idú od
           stredu oblúka von a pokračujú ďaleko za okraj obrazovky. */
        function cutGeometry(W, H) {
            var cx = W / 2, pad = 6;
            var far = (W + H) * 2;
            var peak = H * 0.47;
            // Rovnaké zakrivenie ako medzera v značke (prehnutie 0,235 polovice šírky).
            var sag = Math.min(W * 0.5 * 0.235, H * 0.24);
            var k = sag / (cx * cx);
            function y(x) { return peak + k * (x - cx) * (x - cx); }
            var x0 = -W * 0.25, x1 = W * 1.25, N = 48;
            var arc = [];
            for (var i = 0; i <= N; i++) { var x = x0 + (x1 - x0) * i / N; arc.push([x, y(x)]); }
            var yl = arc[0][1], yr = arc[N][1];
            var left = [], right = [];
            for (var j = N / 2; j >= 0; j--) left.push(arc[j]);
            left.push([-far, yl + (yl - arc[1][1]) * (far / (W * 1.5 / N))]);
            for (var m = N / 2; m <= N; m++) right.push(arc[m]);
            right.push([W + far, yr + (yr - arc[N - 1][1]) * (far / (W * 1.5 / N))]);
            var dropL = left[left.length - 1][1], dropR = right[right.length - 1][1];
            function visible(branch) {
                var l = 0;
                for (var q = 1; q < branch.length; q++) {
                    var a = branch[q - 1], b = branch[q];
                    if (a[0] < 0 || a[0] > W) break;
                    l += Math.hypot(b[0] - a[0], b[1] - a[1]);
                }
                return l + pad;
            }
            return {
                top: [[-far, -far], [W + far, -far], [W + far, dropR]].concat(arc.slice().reverse(), [[-far, dropL]]),
                bot: [[-far, dropL]].concat(arc, [[W + far, dropR], [W + far, H + far], [-far, H + far]]),
                a: [left, visible(left)],
                b: [right, visible(right)],
                c: [cx, peak],
                vTop: [0, -1], vBot: [0, 1],
                pivTop: [cx, peak], rotTop: 0,
                pivBot: [cx, peak], rotBot: 0,
                // strecha sa zdvihne o chlp skôr, opak príchodu
                lagTop: 0, lagBot: 0.08
            };
        }

        function layoutCurtains() {
            var W = innerWidth, H = innerHeight;
            var g = cutGeometry(W, H);

            function pts(arr) { return arr.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '); }
            function path(arr) { return 'M' + arr.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join('L'); }
            function len(arr) {
                var l = 0;
                for (var i = 1; i < arr.length; i++) l += Math.hypot(arr[i][0] - arr[i - 1][0], arr[i][1] - arr[i - 1][1]);
                return l;
            }
            function unit(v) { var l = Math.hypot(v[0], v[1]); return [v[0] / l, v[1] / l]; }

            svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
            grad.setAttribute('cx', g.c[0]);
            grad.setAttribute('cy', g.c[1]);
            grad.setAttribute('r', Math.hypot(W, H) * 0.62);

            halves[0].querySelector('polygon').setAttribute('points', pts(g.top));
            halves[1].querySelector('polygon').setAttribute('points', pts(g.bot));

            // Každá polovica nesie celú hranu a vezme ju so sebou. Čiara siaha
            // za okraj obrazovky (pri posune nesmie skončiť uprostred), ale
            // „kreslí sa" len po okraj: dĺžka čiarky je viditeľná časť.
            Array.prototype.forEach.call(el.querySelectorAll('.si-edge, .si-edge-glow'), function (p) {
                var branch = p.getAttribute('data-side') === 'l' ? g.a : g.b;
                var l = branch[1];
                p.setAttribute('d', path(branch[0]));
                p.setAttribute('stroke-dasharray', l.toFixed(1) + ' ' + (len(branch[0]) + 10).toFixed(1));
                p.__len = l;
            });

            CUT = { W: W, H: H, vTop: unit(g.vTop), vBot: unit(g.vBot), D: Math.hypot(W, H) * 1.05, g: g };
        }

        function frameCurtains(t) {
            var c = CUT;
            var crack = smooth(prog(t, T.crack0, T.crack1));

            // Pod oponami je plná čierna, kým sa nerozídu, inak by cez
            // vyhladený šev presvitala stránka.
            back.style.opacity = t < T.split0 ? '1' : '0';

            var g = c.g;
            var spT = E_SPLIT(prog(t, T.split0 + g.lagTop, T.split1 - g.lagBot + g.lagTop));
            var spB = E_SPLIT(prog(t, T.split0 + g.lagBot, T.split1));
            function move(v, piv, rot, k) {
                return 'translate(' + (v[0] * c.D * k).toFixed(2) + ',' + (v[1] * c.D * k).toFixed(2) + ')' +
                    (rot ? ' rotate(' + (rot * k).toFixed(3) + ' ' + piv[0].toFixed(1) + ' ' + piv[1].toFixed(1) + ')' : '');
            }
            halves[0].setAttribute('transform', move(c.vTop, g.pivTop, g.rotTop, spT));
            halves[1].setAttribute('transform', move(c.vBot, g.pivBot, g.rotBot, spB));

            var edgeOn = crack * (1 - smooth(prog(t, T.split0 + 0.35, T.split1)));
            var flick  = 0.85 + 0.15 * Math.sin(t * 61) * Math.sin(t * 23);
            Array.prototype.forEach.call(el.querySelectorAll('.si-edge, .si-edge-glow'), function (p) {
                var glowing = p.classList.contains('si-edge-glow');
                if (crack < 1) {
                    p.setAttribute('stroke-dashoffset', (p.__len * (1 - crack)).toFixed(1));
                } else if (p.getAttribute('stroke-dasharray') !== 'none') {
                    // Dokreslená: odteraz celá, aj za pôvodným okrajom obrazovky.
                    p.setAttribute('stroke-dasharray', 'none');
                }
                p.setAttribute('opacity', (edgeOn * (glowing ? 0.55 : flick)).toFixed(3));
            });

            var fx = 1 - smooth(prog(t, T.split0, T.split0 + 0.6));
            vignette.style.opacity = fx.toFixed(3);
            grain.style.opacity = (0.085 * fx).toFixed(4);
        }

        layoutCurtains();
        frameCurtains(0);

        /* ------------------------------------------------------------ koniec */

        var finished = false;
        var renderer = null;
        var rafId = 0;

        var revealed = false;

        /* Opona sa otvára: ostatné skripty stránky môžu začať svoje nástupy. */
        function reveal() {
            if (revealed) return;
            revealed = true;
            window.DOMORAVA_INTRO_REVEALED = true;
            doc.dispatchEvent(new CustomEvent('domorava:intro-reveal'));
            onReveal();
        }

        function finish(skipped) {
            if (finished) return;
            finished = true;
            reveal();
            if (restoreWas !== null) history.scrollRestoration = restoreWas;
            cancelAnimationFrame(rafId);
            removeEventListener('resize', onResize);
            removeEventListener('keydown', onKey);
            if (renderer) {
                renderer.dispose();
                if (renderer.forceContextLoss) renderer.forceContextLoss();
            }
            if (el.parentNode) el.parentNode.removeChild(el);
            html.classList.remove('si-on', 'si-land');
            window.DOMORAVA_INTRO_DONE = true;
            doc.dispatchEvent(new CustomEvent('domorava:intro-done', { detail: { skipped: !!skipped } }));
        }

        function skip() {
            if (finished || el.classList.contains('si-skip-out') || el.classList.contains('si-final')) return;
            el.classList.add('si-skip-out');
            html.classList.add('si-land');
            reveal();
            setTimeout(function () { finish(true); }, 520);
        }

        function onKey(e) {
            if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); skip(); }
        }

        el.addEventListener('click', skip);
        addEventListener('keydown', onKey);
        setTimeout(function () { skipBtn.classList.add('si-show'); }, 900);

        /* ------------------------------------------------------------ 3D scéna */

        var THREE, scene, camera, stage, markGroup, textGroup, pieces = [], letters = [];
        var caret, caretGlow, glow, streakThin, streakWide, dust;
        var model, base, roof, frameNode, pedestals, plants = [], shadow, scanCore, scanGlow;
        var modelClip, markClip, MK, MODEL_H, MODEL_LIFT, SCAN_LO, SCAN_HI;
        var _v = null;
        var key, fill, rimL, rimR, sweep;
        var matLCK = [], colLight, colDark, chrome = [], envTex = null;
        var L = {};       // rozloženie závislé od veľkosti okna
        var TGT = null;   // ciele v hlavičke, merajú sa pri štarte letu

        var U  = 1 / 200;                     // 200 px lockupu = 1 jednotka sveta
        var MB = DATA.markBox;                // značka v lockupe
        var MARK_C = [(MB[0] + MB[2]) / 2, (MB[1] + MB[3]) / 2];
        var TB = [Infinity, Infinity, -Infinity, -Infinity];
        DATA.letters.forEach(function (g) {
            TB[0] = Math.min(TB[0], g.bbox[0]); TB[1] = Math.min(TB[1], g.bbox[1]);
            TB[2] = Math.max(TB[2], g.bbox[2]); TB[3] = Math.max(TB[3], g.bbox[3]);
        });
        var TEXT_C = [(TB[0] + TB[2]) / 2, (TB[1] + TB[3]) / 2];

        var MARK_W, MARK_H = MB[3] - MB[1];   // šírka sa dopočíta z geometrie
        var LOCK_C, LOCK_W;

        var EX = { depth: 44, bt: 11, bs: 6.5 };   // vysunutie a skosenie v px lockupu

        function softTexture(size, stops) {
            var c = doc.createElement('canvas');
            c.width = c.height = size;
            var g = c.getContext('2d');
            var r = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
            stops.forEach(function (s) { r.addColorStop(s[0], s[1]); });
            g.fillStyle = r;
            g.fillRect(0, 0, size, size);
            var tex = new THREE.CanvasTexture(c);
            tex.colorSpace = THREE.SRGBColorSpace;
            return tex;
        }

        function streakTexture() {
            var w = 512, h = 64;
            var c = doc.createElement('canvas');
            c.width = w; c.height = h;
            var g = c.getContext('2d');
            var img = g.createImageData(w, h);
            for (var y = 0; y < h; y++) {
                var vy = (y - h / 2) / (h / 2);
                var fy = Math.exp(-vy * vy * 9);
                for (var x = 0; x < w; x++) {
                    var vx = (x - w / 2) / (w / 2);
                    var fx = Math.pow(1 - Math.abs(vx), 2.2);
                    var a = fx * fy;
                    var i = (y * w + x) * 4;
                    img.data[i] = 255; img.data[i + 1] = 255; img.data[i + 2] = 255;
                    img.data[i + 3] = Math.round(a * 255);
                }
            }
            g.putImageData(img, 0, 0);
            var tex = new THREE.CanvasTexture(c);
            tex.colorSpace = THREE.SRGBColorSpace;
            return tex;
        }

        function build(lib) {
            THREE = lib.THREE;
            var RoomEnvironment = lib.RoomEnvironment;
            var SVGLoader = lib.SVGLoader;
            var toCreasedNormals = lib.toCreasedNormals;

            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
            renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
            renderer.setClearColor(0x000000, 0);
            renderer.outputColorSpace = THREE.SRGBColorSpace;
            renderer.toneMapping = THREE.NeutralToneMapping;
            renderer.toneMappingExposure = 1.0;
            renderer.domElement.setAttribute('aria-hidden', 'true');
            el.insertBefore(renderer.domElement, vignette);


            scene = new THREE.Scene();
            var pmrem = new THREE.PMREMGenerator(renderer);
            scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
            envTex = scene.environment;
            pmrem.dispose();
            scene.environmentIntensity = 0;

            camera = new THREE.PerspectiveCamera(28, innerWidth / innerHeight, 0.1, 100);
            camera.position.set(0, 0, 18);

            /* svetlá */
            key  = new THREE.DirectionalLight(0xffffff, 0);  key.position.set(-4, 6, 10);
            fill = new THREE.DirectionalLight(0xfff1de, 0);  fill.position.set(7, -4, 6);
            rimL = new THREE.PointLight(0xffd9a8, 0, 0, 2);  rimL.position.set(-7, 4, 1.2);
            rimR = new THREE.PointLight(0xffffff, 0, 0, 2);  rimR.position.set(7, -3.5, 1.4);
            sweep = new THREE.PointLight(0xffffff, 0, 0, 2);
            sweep.position.set(-9, 0.4, 2.4);
            scene.add(key, fill, rimL, rimR, sweep);

            /* geometria */
            var loader = new SVGLoader();
            function shapes(d) {
                var parsed = loader.parse('<svg xmlns="http://www.w3.org/2000/svg"><path d="' + d + '"/></svg>');
                var out = [];
                parsed.paths.forEach(function (p) { out.push.apply(out, p.toShapes()); });
                return out;
            }
            function extrude(d, curve) {
                var g = new THREE.ExtrudeGeometry(shapes(d), {
                    depth: EX.depth, steps: 1, curveSegments: curve,
                    bevelEnabled: true, bevelThickness: EX.bt, bevelSize: EX.bs,
                    bevelOffset: -EX.bs, bevelSegments: 6
                });
                g.computeBoundingBox();
                var b = g.boundingBox;
                var c = [(b.min.x + b.max.x) / 2, (b.min.y + b.max.y) / 2];
                g.translate(-c[0], -c[1], -EX.depth / 2);
                g.scale(U, -U, -U);                 // y dole → y hore, zrkadlo z drží orientáciu plôch
                g = toCreasedNormals(g, 0.6);
                flatCaps(g);
                return { geo: g, c: c, size: [b.max.x - b.min.x, b.max.y - b.min.y] };
            }
            /* Čelá musia byť dokonale rovné. Vyhladenie normál by ich spojilo so
               skosením a cez dlhé trojuholníky by po čele bežali pruhy. */
            function flatCaps(g) {
                var pos = g.attributes.position, nor = g.attributes.normal;
                var a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
                g.groups.forEach(function (gr) {
                    if (gr.materialIndex !== 0) return;
                    for (var i = gr.start; i < gr.start + gr.count; i += 3) {
                        a.fromBufferAttribute(pos, i);
                        b.fromBufferAttribute(pos, i + 1);
                        c.fromBufferAttribute(pos, i + 2);
                        c.sub(b); a.sub(b); c.cross(a).normalize();
                        for (var j = 0; j < 3; j++) nor.setXYZ(i + j, c.x, c.y, c.z);
                    }
                });
                nor.needsUpdate = true;
            }
            function material(hex, extra) {
                var m = new THREE.MeshPhysicalMaterial({
                    color: new THREE.Color(hex),
                    roughness: 0.42, metalness: 0.0,
                    clearcoat: 1, clearcoatRoughness: 0.06,
                    transparent: true, opacity: 0
                });
                if (extra) m.setValues(extra);
                return m;
            }

            stage = new THREE.Group();
            markGroup = new THREE.Group();
            textGroup = new THREE.Group();
            stage.add(markGroup, textGroup);
            scene.add(stage);

            // Premena modelu na značku: vodorovná rovina ide zdola nahor, model
            // ostáva nad ňou, plochá značka pod ňou.
            renderer.localClippingEnabled = true;
            _v = new THREE.Vector3();
            modelClip = new THREE.Plane(new THREE.Vector3(0, 1, 0), 1e3);
            markClip = new THREE.Plane(new THREE.Vector3(0, -1, 0), -1e3);

            var mx0 = Infinity, mx1 = -Infinity;
            DATA.mark.forEach(function (p) {
                var x = extrude(p.d, 22);
                // Farby webu: lakovaný lesný oblúk #263E33, olejovaná dubová strecha #806447.
                var mesh = new THREE.Mesh(x.geo, p.part === 'roof'
                    ? material('#806447', { roughness: 0.5, clearcoat: 0.45, clearcoatRoughness: 0.2, clippingPlanes: [markClip] })
                    : material('#263E33', { roughness: 0.4, clearcoat: 0.8, clearcoatRoughness: 0.1, clippingPlanes: [markClip] }));
                mesh.userData.home = new THREE.Vector3((x.c[0] - MARK_C[0]) * U, -(x.c[1] - MARK_C[1]) * U, 0);
                // Strecha prilieta zhora, oblúk zdola.
                mesh.userData.sign = p.part === 'roof' ? 1 : -1;
                mesh.position.copy(mesh.userData.home);
                markGroup.add(mesh);
                pieces.push(mesh);
                mx0 = Math.min(mx0, x.c[0] - x.size[0] / 2);
                mx1 = Math.max(mx1, x.c[0] + x.size[0] / 2);
            });
            MARK_W = mx1 - mx0;

            colLight = new THREE.Color('#f1f4f2');
            colDark  = new THREE.Color('#0d0f0e');
            DATA.letters.forEach(function (g, i) {
                var x = extrude(g.d, 12);
                // Lakované písmená vo farbách nápisu na webe: „DomOrava“ lesná,
                // „.sk“ dubová. Vlastná envMap, aby sa dala ladiť zvlášť.
                var m = material(g.tone === 'domain' ? '#806447' : '#263E33',
                    { metalness: 0, roughness: 0.38, clearcoat: 0.6, clearcoatRoughness: 0.12 });
                m.envMap = envTex;
                m.envMapIntensity = 0;
                m.emissive = new THREE.Color('#e8cfa4');
                m.emissiveIntensity = 0;
                chrome.push(m);
                var mesh = new THREE.Mesh(x.geo, m);
                mesh.userData.home = new THREE.Vector3((x.c[0] - TEXT_C[0]) * U, -(x.c[1] - TEXT_C[1]) * U, 0);
                mesh.userData.right = (g.bbox[2] - TEXT_C[0]) * U;
                mesh.userData.left  = (g.bbox[0] - TEXT_C[0]) * U;
                mesh.position.copy(mesh.userData.home);
                textGroup.add(mesh);
                letters.push(mesh);
            });

            /* lockup: značka vľavo, nápis vpravo, celok v strede */
            var lx0 = MARK_C[0] - MARK_W / 2, lx1 = TB[2];
            LOCK_C = [(lx0 + lx1) / 2, MARK_C[1]];
            LOCK_W = lx1 - lx0;
            markGroup.userData.home = new THREE.Vector3((MARK_C[0] - LOCK_C[0]) * U, 0, 0);
            textGroup.userData.home = new THREE.Vector3((TEXT_C[0] - LOCK_C[0]) * U, -(TEXT_C[1] - LOCK_C[1]) * U, 0);
            textGroup.position.copy(textGroup.userData.home);

            /* kurzor */
            caret = new THREE.Mesh(
                new THREE.BoxGeometry(0.07, (DATA.cap[1] - DATA.cap[0]) * 1.18 * U, 0.07),
                new THREE.MeshBasicMaterial({ color: new THREE.Color('#806447'), transparent: true, opacity: 0, toneMapped: false })
            );
            caret.position.set(0, -((DATA.cap[0] + DATA.cap[1]) / 2 - TEXT_C[1]) * U, 0.12);
            caretGlow = new THREE.Sprite(new THREE.SpriteMaterial({
                map: softTexture(128, [[0, 'rgba(233,213,177,.75)'], [0.35, 'rgba(233,213,177,.25)'], [1, 'rgba(233,213,177,0)']]),
                transparent: true, opacity: 0, depthWrite: false, blending: THREE.NormalBlending
            }));
            caretGlow.scale.set(0.9, 2.2, 1);
            caret.add(caretGlow);
            textGroup.add(caret);

            /* žiara za značkou a anamorfné prúžky */
            glow = new THREE.Sprite(new THREE.SpriteMaterial({
                map: softTexture(256, [[0, 'rgba(236,219,186,.7)'], [0.3, 'rgba(236,219,186,.32)'], [0.7, 'rgba(236,219,186,.06)'], [1, 'rgba(236,219,186,0)']]),
                transparent: true, opacity: 0, depthWrite: false, blending: THREE.NormalBlending
            }));
            glow.position.set(0, 0, -0.6);
            glow.scale.set(7.5, 7.5, 1);
            markGroup.add(glow);

            var stex = streakTexture();
            function streak(color) {
                var m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({
                    map: stex, color: new THREE.Color(color), transparent: true, opacity: 0,
                    depthWrite: false, depthTest: false, blending: THREE.NormalBlending, toneMapped: false
                }));
                m.renderOrder = 10;
                return m;
            }
            streakThin = streak('#b38a5c');
            streakWide = streak('#e9d5b1');
            streakThin.position.set(0, 0, 0.6);
            streakWide.position.set(0, 0, 0.55);
            markGroup.add(streakThin, streakWide);

            /* model altánku, v metroch, osadený presne na značku */
            var ms = MARK_H / (PORTAL.markBox[3] - PORTAL.markBox[1]);   // px predlohy → lockup
            MK = PORTAL.pxPerM * ms * U;                                  // meter modelu → svet
            var MX = ((PORTAL.x0 - PORTAL.markBox[0]) * ms - MARK_C[0]) * U;
            var MY = -((PORTAL.ground - PORTAL.markBox[1]) * ms - MARK_C[1]) * U;

            var src = {};
            lib.gltf.scene.children.slice().forEach(function (n) { src[n.name] = n; });
            roof = src.Roof; frameNode = src.Frame; pedestals = src.Pedestals;
            plants = [src.PlantsL, src.PlantsR];
            if (!roof || !frameNode || !pedestals || !plants[0] || !plants[1]) throw new Error('model nemá očakávané diely');

            var rb = new THREE.Box3().setFromObject(roof);
            plants.forEach(function (p) {
                var b = new THREE.Box3().setFromObject(p);
                p.userData.half = (b.max.y - b.min.y) / 2;
            });

            model = new THREE.Group();
            model.scale.setScalar(MK);
            // Hĺbka sa centruje podľa strechy, čelo modelu je tak tesne pri čele značky.
            model.position.set(MX, MY, -MK * (rb.min.z + rb.max.z) / 2);

            // Spodok (rám s pätkami) letí ako jeden diel a otáča sa okolo svojho stredu.
            base = new THREE.Group();
            base.position.set(0, 1.9, frameNode.position.z);
            [frameNode, pedestals].forEach(function (n) { n.position.sub(base.position); base.add(n); });
            model.add(base, roof, plants[0], plants[1]);
            [base, roof, pedestals].concat(plants).forEach(function (n) { n.userData.home = n.position.clone(); });

            [roof, frameNode, pedestals].concat(plants).forEach(function (node) {
                var mats = [];
                node.traverse(function (o) {
                    if (!o.isMesh) return;
                    var m = o.material = o.material.clone();
                    m.transparent = true;
                    m.opacity = 0;
                    m.clippingPlanes = [modelClip];
                    // Čelo nesie maľbu predlohy aj s jej svetlom, nech ostane farebne verná.
                    if (m.isMeshBasicMaterial) m.toneMapped = false;
                    mats.push(m);
                });
                node.userData.mats = mats;
            });

            // Mäkký tieň pod pätkami, aby model nevisel vo vzduchu.
            shadow = new THREE.Sprite(new THREE.SpriteMaterial({
                map: softTexture(128, [[0, 'rgba(58,46,32,.5)'], [0.45, 'rgba(58,46,32,.2)'], [1, 'rgba(58,46,32,0)']]),
                transparent: true, opacity: 0, depthWrite: false
            }));
            shadow.position.set(0, 0.05, base.position.z);
            shadow.scale.set(6.6, 0.8, 1);
            model.add(shadow);
            markGroup.add(model);

            MODEL_H = MK * rb.max.y;
            MODEL_LIFT = -(MY + MODEL_H / 2);          // celý model od zeme po hrebeň v strede
            SCAN_LO = -MARK_H * U / 2 - 0.02;
            SCAN_HI = MY + MK * rb.max.y + 0.03;
            // záblesk dopadu je v medzere medzi strechou a rámom
            streakThin.position.y = streakWide.position.y = MY + MK * PORTAL.joint;

            scanCore = streak('#a8783f');
            scanGlow = streak('#f3dfb6');
            markGroup.add(scanCore, scanGlow);

            /* prach vo vzduchu */
            var N = 260, pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
            for (var i = 0; i < N; i++) {
                pos[i * 3]     = (Math.random() * 2 - 1) * 13;
                pos[i * 3 + 1] = (Math.random() * 2 - 1) * 8;
                pos[i * 3 + 2] = -9 + Math.random() * 13;
                var b = 0.25 + Math.random() * 0.75;
                col[i * 3] = 0.5 + 0.2 * b; col[i * 3 + 1] = 0.39 + 0.16 * b; col[i * 3 + 2] = 0.28 + 0.1 * b;
            }
            var dg = new THREE.BufferGeometry();
            dg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
            dg.setAttribute('color', new THREE.BufferAttribute(col, 3));
            dust = new THREE.Points(dg, new THREE.PointsMaterial({
                size: 0.07, map: softTexture(64, [[0, 'rgba(255,255,255,1)'], [0.4, 'rgba(255,255,255,.35)'], [1, 'rgba(255,255,255,0)']]),
                vertexColors: true, transparent: true, opacity: 0, depthWrite: false, blending: THREE.NormalBlending
            }));
            scene.add(dust);

            renderer.domElement.addEventListener('webglcontextlost', function (e) {
                e.preventDefault();
                fail('WebGL kontext sa stratil');
            });

            layout();
            // Shadery sa kompilujú vopred pre všetko, aj pre zatiaľ neviditeľné
            // písmená, inak by prvé objavenie dielu trhlo. Robí sa to na pozadí
            // (compileAsync), na Windows to pri prvom spustení trvá aj sekundy.
            scene.traverse(function (o) { o.visible = true; });
        }

        /* Rozloženie podľa okna: veľkosť lockupu a prevod pixelov na svet. */
        function layout() {
            var W = innerWidth, H = innerHeight;
            renderer.setSize(W, H, false);
            camera.aspect = W / H;
            camera.updateProjectionMatrix();

            L.D = 18;
            L.visH = 2 * L.D * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
            L.visW = L.visH * camera.aspect;
            L.wpp = L.visH / H;                     // jednotiek sveta na pixel v rovine z = 0
            var narrow = W < 700;
            L.scale = Math.min(L.visW * (narrow ? 0.8 : 0.6) / (LOCK_W * U), L.visH * 0.32 / (MARK_H * U), 1.2);
            L.solo = narrow ? 1.9 : 1.3;           // značka sama v strede je väčšia
            // Model altánku je na začiatku ešte väčší, najviac na 60 % výšky okna.
            L.hero = Math.max(L.solo, Math.min(narrow ? 2.6 : 1.95, L.visH * 0.6 / (MODEL_H * L.scale)));
            layoutCurtains();
            TGT = null;
        }

        function onResize() {
            if (!renderer) { layoutCurtains(); return; }
            layout();
        }
        addEventListener('resize', onResize);

        /* Kam má logo doletieť: obrázky značky a nápisu v hlavičke. */
        function measureTargets() {
            var m = doc.querySelector('.brand-mark');
            var x = doc.querySelector('.brand-text');
            function box(node, w, h, align) {
                if (!node) return null;
                var r = node.getBoundingClientRect();
                if (r.width < 2 || r.height < 2) return null;
                // obrázok je na pozadí s background-size: contain
                var k = Math.min(r.width / w, r.height / h);
                var cx = align === 'left' ? r.left + w * k / 2 : r.left + r.width / 2;
                return { cx: cx, cy: r.top + r.height / 2, k: k };
            }
            return {
                mark: box(m, MARK_W, MARK_H, 'center'),
                text: box(x, TB[2] - TB[0], TB[3] - TB[1], 'center'),
                dark: true
            };
        }

        /* Pixel obrazovky → poloha v skupine stage. */
        function screenToStage(px, py) {
            return new THREE.Vector3((px - innerWidth / 2) * L.wpp / L.scale, -(py - innerHeight / 2) * L.wpp / L.scale, 0);
        }

        /* ------------------------------------------------------------ snímka */

        var landed = false;

        /* Priehľadnosť celého dielu modelu. */
        function fade(node, a) {
            node.userData.mats.forEach(function (m) { m.opacity = a; });
            node.visible = a > 0.001;
        }

        function frame(t) {
            var S = L.scale;

            /* kamera: pomalý nájazd, na konci presne v základnej polohe */
            var cam = E_SOFT(prog(t, 0, 5.4));
            camera.position.set(lerp(0.35, 0, cam), lerp(-0.2, 0, cam), lerp(L.D * 1.07, L.D, cam));
            camera.lookAt(0, 0, 0);

            stage.scale.setScalar(S);

            /* svetlo a prostredie sa rozsvecujú s príchodom dielov */
            var lit = smooth(prog(t, 0.25, 1.9));
            // Počas letu do hlavičky svetlo stíchne na ploché farby značky, aby
            // prelínanie s obrázkom v hlavičke nebolo vidieť.
            var flat = smooth(prog(t, T.fly0, T.fly1 - 0.15));
            scene.environmentIntensity = lerp(lerp(0.03, 0.42, lit), 0.1, flat);
            // Otáčanie prostredia ide so značkou: kým stojí čelom v strede, lak
            // nesmie odrážať svetlý panel miestnosti, inak značka vybledne.
            scene.environmentRotation.set(0.1, lerp(-0.9, 0.55, E_INOUT(prog(t, 1.1, 8.1))), 0);
            chrome.forEach(function (m) {
                m.envMapIntensity = lerp(1.0 * lit, 0.55, flat);
                m.envMapRotation.copy(scene.environmentRotation);
                m.roughness = lerp(0.38, 0.6, flat);   // v hlavičke je nápis plochý, bez odleskov
            });
            key.intensity  = lerp(3.1 * lit, 3.5, flat);
            fill.intensity = 0.45 * lit * (1 - flat);
            var pc = pulse(t, tContact, 0.05, 0.5);
            rimL.intensity = (7 + 45 * pc) * lit * S * S * (1 - flat);
            rimR.intensity = (5 + 30 * pc) * lit * S * S * (1 - flat);

            /* -------- model: spodok zdola, strecha zhora, kríky vyrastú */
            var pinB = prog(t, T.in0 - 0.1, T.in1 - 0.45);
            var kB = 1 - E_IN(pinB), bh = base.userData.home;
            base.position.set(bh.x - 0.3 * kB / MK, bh.y - 4.6 * kB / MK, bh.z - 1.4 * kB / MK);
            base.rotation.set(1.1 * kB, -0.5 * kB, -0.15 * kB);

            var pinR = prog(t, T.in0 + 0.35, T.in1);
            var kR = 1 - E_IN(pinR), rh = roof.userData.home;
            // Po dotyku strecha o pár centimetrov dosadne a vráti sa.
            var dc = t - tContact;
            var settle = dc > 0 ? Math.exp(-dc / 0.1) * Math.sin(dc * 30) : 0;
            roof.position.set(rh.x + 0.2 * kR / MK, rh.y + 4.4 * kR / MK - 0.045 * settle, rh.z + 0.9 * kR / MK);
            roof.rotation.set(-0.55 * kR, 0.22 * kR, -0.14 * kR);

            var hide = smooth(prog(t, T.hide0, T.hide1));
            var aB = smooth(prog(pinB, 0.02, 0.32));
            fade(frameNode, aB);
            fade(roof, smooth(prog(pinR, 0.02, 0.32)));
            fade(pedestals, aB * (1 - hide));
            pedestals.position.y = pedestals.userData.home.y - 0.45 * hide;
            plants.forEach(function (p, i) {
                var up = backOut(prog(t, tContact - 0.3 + i * 0.09, tContact + 0.45 + i * 0.09));
                var s = Math.max(0.001, up * (1 - smooth(prog(t, T.hide0 - 0.05 + i * 0.05, T.hide1 - 0.12 + i * 0.05))));
                p.scale.setScalar(s);
                p.position.y = p.userData.home.y - (1 - s) * p.userData.half;
                fade(p, s > 0.002 ? 1 : 0);
            });
            shadow.material.opacity = 0.55 * aB * (1 - hide);
            shadow.visible = shadow.material.opacity > 0.002;
            model.visible = t < T.scan1;

            /* plochá značka sa objaví až pod pásom svetla */
            var sc = prog(t, T.scan0, T.scan1);
            var sOn = Math.sin(Math.PI * sc);
            pieces.forEach(function (m) {
                m.position.copy(m.userData.home);
                m.rotation.set(0, 0, 0);
                m.material.opacity = 1;
                m.visible = sc > 0;
            });

            /* -------- značka: dotočenie, záblesk, posun doľava */
            var turn = E_INOUT(prog(t, T.in0, T.turn1));
            var sl = E_INOUT(prog(t, T.slide0, T.slide1));
            var bump = Math.sin(Math.PI * sl) * 0.22;
            var click = 1 + 0.022 * pulse(t, tContact + 0.04, 0.05, 0.22);
            var mh = markGroup.userData.home;

            // Kým stojí celý model aj s pätkami, je v strede on, potom značka.
            markGroup.position.set(mh.x * sl, MODEL_LIFT * (1 - smooth(prog(t, T.hide0, T.scan0 + 0.25))), 0);
            markGroup.rotation.set(lerp(0.2, 0, turn), lerp(-0.62, 0, turn) + bump, lerp(0.05, 0, turn));
            markGroup.scale.setScalar(lerp(lerp(L.hero, L.solo, smooth(prog(t, T.hide0, T.scan1))), 1, sl) * click);
            textGroup.position.copy(textGroup.userData.home);
            textGroup.rotation.set(0, 0, 0);
            textGroup.scale.setScalar(1);

            var fxOut = 1 - smooth(prog(t, T.fly0 - 0.15, T.fly0 + 0.35));
            glow.material.opacity = (0.55 * smooth(prog(t, 1.0, 2.3)) + 0.9 * pc + 0.45 * sOn) * fxOut;
            glow.scale.setScalar(7.5 * (1 + 0.25 * pc));

            var pst = pulse(t, tContact, 0.04, 0.42);
            streakThin.material.opacity = 0.7 * pst;
            streakWide.material.opacity = 0.5 * pst;
            var sx = lerp(2, 15, E_SOFT(prog(t, tContact - 0.05, tContact + 0.6)));
            streakThin.scale.set(sx, 0.07, 1);
            streakWide.scale.set(sx * 0.75, 0.75, 1);
            streakThin.visible = streakWide.visible = pst > 0.003;

            /* -------- nápis: písací stroj zľava doprava */
            letters.forEach(function (m, i) {
                var p = prog(t, T.type0 + i * T.step, T.type0 + i * T.step + T.ldur);
                var q = E_LET(p), r = 1 - q, h = m.userData.home;
                m.position.set(h.x - 0.32 * r, h.y - 0.04 * r, h.z - 0.7 * r);
                m.rotation.set(0.12 * r, 0.75 * r, 0);
                m.scale.setScalar(lerp(0.78, 1, q));
                m.material.opacity = smooth(prog(p, 0, 0.32));
                m.material.emissiveIntensity = 0.3 * Math.pow(1 - smooth(prog(p, 0.1, 0.9)), 2) * (p > 0 ? 1 : 0);
                m.visible = m.material.opacity > 0.001;
            });

            /* kurzor kĺže za posledným písmenom */
            var start = letters[0].userData.left - 0.12;
            // Kurzor je pri písmene v okamihu, keď sa písmeno objaví, a k
            // ďalšiemu preskočí rýchlo. Písmená sú široké, pomalý
            // kurzor by za nimi viditeľne zaostával.
            var f = (t - T.type0 + 0.03) / T.step;
            var cx;
            if (f <= 0) {
                cx = start;
            } else {
                var i = Math.min(Math.floor(f), letters.length - 1);
                var fr = f >= letters.length ? 1 : E_SOFT(clamp01((f - i) * 1.9));
                var from = i === 0 ? start : letters[i - 1].userData.right + 0.1;
                cx = lerp(from, letters[i].userData.right + 0.1, fr);
            }
            caret.position.x = cx;
            var typed = T.type0 + letters.length * T.step + 0.25;
            var cOn = smooth(prog(t, T.caret0, T.caret0 + 0.25));
            if (t > typed) cOn *= 0.5 + 0.5 * Math.cos((t - typed) * Math.PI * 2 / 0.95);
            cOn *= 1 - smooth(prog(t, typed + 0.75, typed + 1.05));
            caret.material.opacity = cOn;
            caretGlow.material.opacity = 0.7 * cOn;
            caret.visible = cOn > 0.002;

            /* -------- pás svetla cez celé logo */
            var sw = prog(t, T.sweep0, T.sweep1);
            sweep.intensity = 34 * Math.sin(Math.PI * sw) * S * S;
            sweep.position.set(lerp(-8, 8, E_INOUT(sw)) * Math.max(S, 0.4), 0.4, 2.4 * Math.max(S, 0.4));

            /* jemné dýchanie počas státia */
            var breathe = smooth(prog(t, T.slide1, T.fly0));
            stage.rotation.set(0, Math.sin(t * 0.7) * 0.025 * breathe * (1 - smooth(prog(t, T.fly0 - 0.2, T.fly0 + 0.2))), 0);

            /* -------- pás svetla: model sa zdola nahor mení na značku */
            var band = lerp(SCAN_LO, SCAN_HI, E_INOUT(sc));
            if (sc <= 0) {
                modelClip.constant = 1e3;
                markClip.constant = -1e3;
            } else if (sc >= 1) {
                modelClip.constant = -1e3;
                markClip.constant = 1e3;
            } else {
                // Roviny orezania sú vo svete, pás je v súradniciach značky.
                markGroup.updateWorldMatrix(true, false);
                var wy = _v.set(0, band, 0).applyMatrix4(markGroup.matrixWorld).y;
                modelClip.constant = -wy;
                markClip.constant = wy;
            }
            scanCore.position.set(0, band, 0.5);
            scanGlow.position.set(0, band, 0.45);
            scanCore.scale.set(3.4, 0.05, 1);
            scanGlow.scale.set(3.9, 0.7, 1);
            scanCore.material.opacity = Math.sqrt(sOn);
            scanGlow.material.opacity = 0.75 * sOn;
            scanCore.visible = scanGlow.visible = sOn > 0.003;

            /* -------- let do hlavičky */
            if (t >= T.fly0 - 0.05 && !TGT) TGT = measureTargets();
            var fl = E_FLY(prog(t, T.fly0, T.fly1));
            if (TGT && fl > 0) {
                var thin = lerp(1, 0.25, fl);
                if (TGT.mark) {
                    var to = screenToStage(TGT.mark.cx, TGT.mark.cy);
                    var ks = TGT.mark.k * L.wpp / (U * S);
                    markGroup.position.lerpVectors(mh, to, fl);
                    markGroup.scale.set(lerp(1, ks, fl), lerp(1, ks, fl), lerp(1, ks, fl) * thin);
                } else {
                    markGroup.scale.multiplyScalar(1 - fl * 0.6);
                }
                if (TGT.text) {
                    var tt = screenToStage(TGT.text.cx, TGT.text.cy);
                    var kt = TGT.text.k * L.wpp / (U * S);
                    textGroup.position.lerpVectors(textGroup.userData.home, tt, fl);
                    textGroup.scale.set(lerp(1, kt, fl), lerp(1, kt, fl), lerp(1, kt, fl) * thin);
                } else {
                    textGroup.scale.multiplyScalar(1 - fl * 0.6);
                }
                matLCK.forEach(function (m) {
                    m.color.lerpColors(colLight, TGT.dark ? colLight : colDark, smooth(prog(fl, 0.15, 0.85)));
                });
                if (!TGT.mark && !TGT.text) {
                    pieces.concat(letters).forEach(function (m) { m.material.opacity *= 1 - fl; });
                }
            }

            /* -------- prach */
            var dOn = smooth(prog(t, 0.1, 1.6)) * fxOut;
            dust.material.opacity = 0.4 * dOn;
            dust.visible = dOn > 0.002;
            dust.position.set(0, t * 0.09, 0);
            dust.rotation.set(0, t * 0.025, 0);

            /* -------- opony */
            frameCurtains(t);

            if (t >= T.crack0) el.classList.add('si-final');
            if (t >= T.split0 && FREEZE === null) reveal();
            if (t >= T.land && !landed) {
                landed = true;
                html.classList.add('si-land');
                el.classList.add('si-landed');
            }
        }

        /* ------------------------------------------------------------ chod */

        function load() {
            return Promise.all([loadThree(), modelBytes]).then(function (res) {
                var lib = res[0];
                return new Promise(function (resolve, reject) {
                    var loader = new lib.GLTFLoader();
                    // Textúry z GLB idú cez <img> s blob: adresou. Predvolený
                    // ImageBitmapLoader ich číta cez fetch, ten CSP (connect-src) zakazuje.
                    loader.register(function (parser) {
                        parser.textureLoader = new lib.THREE.TextureLoader(parser.options.manager);
                        return { name: 'domorava_img_textures' };
                    });
                    loader.parse(res[1], '', function (gltf) { lib.gltf = gltf; resolve(lib); }, reject);
                });
            });
        }

        function webglOk() {
            try {
                var c = doc.createElement('canvas');
                return !!(window.WebGL2RenderingContext && c.getContext('webgl2'));
            } catch (e) { return false; }
        }

        function fail(why) {
            if (finished) return;   // napr. strata kontextu pri vlastnom upratovaní na konci
            if (window.console) console.warn('DomOrava intro: idem rovno na stránku.', why);
            if (el.classList.contains('si-final')) {
                // Opona sa už otvára, preskočenie by nič nespravilo, tak koniec hneď.
                html.classList.add('si-land');
                finish(true);
            } else {
                skip();
            }
        }

        if (!webglOk()) { fail('WebGL2 nie je k dispozícii'); return; }

        // Keď príprava trvá dlhšie, ukáže sa tenký indikátor, nech čierna
        // nevyzerá ako zamrznutá stránka. Po 15 s to vzdáme úplne.
        var hint = setTimeout(function () { el.classList.add('si-wait'); }, 1200);
        var giveUp = FREEZE === null ? setTimeout(function () { fail('príprava trvala pridlho'); }, 15000) : 0;

        load().then(function (lib) {
            if (finished || el.classList.contains('si-skip-out')) return null;
            build(lib);
            return renderer.compileAsync ? renderer.compileAsync(scene, camera) : renderer.compile(scene, camera);
        }).then(function () {
            if (finished || el.classList.contains('si-skip-out') || !renderer) return;
            clearTimeout(hint);
            clearTimeout(giveUp);
            el.classList.remove('si-wait');

            var t = FREEZE !== null ? FREEZE : 0;
            var last = performance.now();
            var slow = 0, counted = 0, lowered = false;

            frame(t);

            // Ladenie: pri ?t= sa dá skočiť na ľubovoľnú snímku bez nového načítania.
            if (FREEZE !== null) window.__siSeek = function (x) { t = x; frame(t); renderer.render(scene, camera); };

            function tick(now) {
                // Pomalý počítač: čas beží ďalej (max 0,1 s na snímku), aby
                // sa intro nespomalilo. Skrytá karta nič nepreskočí.
                var dt = Math.min((now - last) / 1000, 0.1);
                last = now;

                // Keď prvé snímky idú ťažko, znížime rozlíšenie plátna.
                if (!lowered && counted < 45) {
                    counted++;
                    if (dt > 0.034) slow++;
                    if (slow > 18 && renderer.getPixelRatio() > 1) {
                        lowered = true;
                        renderer.setPixelRatio(1);
                        layout();
                    }
                }

                if (FREEZE === null) t += dt * SPEED;
                try {
                    frame(t);
                    renderer.render(scene, camera);
                } catch (err) {
                    fail(err);
                    return;
                }
                if (FREEZE === null && !HOLD && t >= T.end) { finish(false); return; }
                rafId = requestAnimationFrame(tick);
            }
            rafId = requestAnimationFrame(tick);
        }).catch(fail);
    }

}
