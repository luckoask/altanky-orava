# Logo DomOrava.sk a 3D intro

## Značka

Dubová strecha nad zeleným oblúkom so stĺpmi, medzi nimi jedna rovnomerná
medzera v tvare oblúka. Návrh vznikol v generátore obrázkov
(`pavilion-source.png`, realistická ilustrácia s textúrou dreva, kameňmi a
kríkmi). Na logo bol prekreslený na čistú geometriu (`geometric.py`): rovné
hrany, polkruhový otvor, strecha so spodkom sústredným s vrchom oblúka.

Farby webu: oblúk lesná `#263E33`, strecha dub `#806447`. V hlavičke sa farby
riadia tokenmi `--ink` a `--ink-accent`, takže nad tmavou fotografiou je oblúk
slonovinový a strecha svetlý dub.

Nápis: „DomOrava“ v Cormorant Garamond 600 a „.sk“ v kurzíve 500 (písma webu),
sledovanie ako v CSS hlavičky (-0,035 em / -0,02 em), kerning z písma. Je
nakreslený ako krivky, aby bol v hlavičke presne taký, ako ho kreslí intro.

## Súbory

| Súbor | Čo je |
| --- | --- |
| `pavilion-source.png` | pôvodný vygenerovaný obrázok |
| `geometric.py` | čistá geometria značky → `mark-geo.json`, `mark.svg` |
| `make_logo_data.py` | značka + nápis → `resources/js/intro/logo-data.js`, `components/brand-mark.blade.php`, `components/brand-wordmark.blade.php`, `lockup.svg` |
| `make_icons.py` | `public/favicon.svg` (+ `logo-512.png`, `apple-touch-icon.png`, `favicon.ico` sa renderujú z neho v Chrome) |

`make_logo_data.py` potrebuje `fontTools` a `brotli` (woff2) a ako argument
cestu k projektu.

## Intro

`resources/js/intro/domorava-intro.js` je to isté intro ako na lcks.eu
(three.js, film ako funkcia času) vo farbách webu: oblúk príde zdola, strecha
dopadne zhora, vypíše sa „DomOrava.sk“, slonovinová plocha sa rozdelí po
oblúku a logo dosadne do hlavičky (`.brand-mark`, `.brand-text`).

Kedy hrá, rozhoduje `initializeIntro()` v `resources/js/app.js`: pri príchode
a znova po 30 minútach bez návštevy (čas je v `localStorage`, nie v cookie),
nikdy pri zníženom pohybe ani pri odkaze na sekciu (`#…`); `?intro=1` ho pustí
vždy. Ladenie: `?intro=1&intro_t=4.2` zastaví na snímke, `&intro_speed=0.3`
spomalí. Three.js (~156 kB gzip) sa sťahuje len vtedy, keď intro hrá.

Pri štarte zakrýva stránku krátko slonovinová `.curtain` (len s JavaScriptom,
poistka ju po 4 s skryje), úvodná animácia hero čaká na otvorenie (`intro-hold`)
a koliesko ani prst stránku pod introm neposúvajú.
