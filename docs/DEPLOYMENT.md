# FTP nasadenie: 5. októbra 2026

Verejná URL: **https://lcks.eu/altanok/**. Cieľový adresár: **`/public_html/altanok`**.

## Aktuálna verzia: fotografia cez celé pozadie sekcie 03

Fotografia dreva v sekcii Materiály vypĺňa celú šírku a výšku bloku. Sekcia má minimálne výšku viewportu bez hlavičky a podľa otvoreného obsahu môže rásť. Text je položený nad fotografiou s tmavým prekrytím, na PC v pravom stĺpci. Parallax používa existujúci GSAP; znížený pohyb a stránka bez JavaScriptu majú statickú fotografiu. Tlač oddeľuje fotografiu od textu. Pribudli lokálne WebP varianty 1600 a 2200 px z rovnakého zdroja Pexels.

Pred zápisom bolo čerstvo stiahnutých a overených 31 súborov portfólia a 2 súbory hlavného webu. Záloha je v `artifacts/ftp/2026-10-05-altanok-v11/baseline`. Cez FTPS s overeným certifikátom sa nahrali iba `build/assets/app-D-2dIKaC.css`, `images/timber-1600.webp`, `images/timber-2200.webp` a pripravený `index.html`, zverejnený premenovaním po overení assetov. Staršie assety sú zachované a hlavný web zostal nezmenený.

**33/33 súborov** má presnú zhodu SHA-256 po stiahnutí späť; **32/32 verejných súborov cez HTTPS** má stav 200 a správny obsah. `.htaccess` vracia 403 a adresárová URL servíruje nový index. Prenosové reporty sú v `artifacts/ftp/2026-10-05-altanok-v11`.

Prešli syntax, Pint, lokálny aj exportný produkčný build, **8 PHP testov so 158 assertions** a **28/28 testov v Chrome**. Na verejnej URL prešlo **12 cielených kontrol bez chýb stránky, konzoly alebo HTTP**: pokrytie celej sekcie a parallax na PC aj mobile, rozbalenie položiek, klávesnica, znížený pohyb, dostupnosť bez JavaScriptu a tlač. Snímky a reporty sú v `artifacts/material-background`; finálny výrez bol vizuálne skontrolovaný na šírkach 390 a 1440 px. Safari, Firefox a fyzické mobilné zariadenia neboli testované; Lighthouse a výkon hostingu sa nemerali.

## Predchádzajúca verzia: fotografia s parallaxom v sekcii 07

Kontaktný blok uzatvára široká fotografia pergoly s večerným osvetlením. Používa existujúci responzívny WebP, odložené načítanie a GSAP parallax. Rám, popis a obsah kontaktu zostávajú stabilné; mobil má menší rozsah pohybu. Pri zníženom pohybe, tlači alebo bez JavaScriptu zostáva fotografia statická. Zdroj a autor sú uvedení pod fotografiou.

Pred zápisom bolo čerstvo stiahnutých a overených 31 súborov portfólia a 2 súbory hlavného webu. Záloha je v `artifacts/ftp/2026-10-05-altanok-v10/baseline`. Cez FTPS s overeným certifikátom boli nahrané iba `build/assets/app-CnxqtSyb.css` a pripravený `index.html`, ktorý sa zverejnil premenovaním po overení assetov. Staršie assety sú zachované a hlavný web zostal nezmenený.

**31/31 súborov** má presnú zhodu SHA-256 po stiahnutí späť; **30/30 verejných súborov cez HTTPS** má stav 200 a správny obsah. `.htaccess` vracia 403 a adresárová URL servíruje nový index. Prenosové reporty sú v `artifacts/ftp/2026-10-05-altanok-v10`.

Prešli syntax, Pint, lokálny aj exportný produkčný build, **8 PHP testov so 150 assertions** a **28/28 testov prehliadača v Chrome**. Na verejnej URL prešlo **7 cielených kontrol bez chýb stránky, konzoly alebo HTTP**: pohyb a pokrytie rámu na šírkach 390 a 1440 px, prepnutie na statickú fotografiu pri zníženom pohybe, presný obsah stiahnutých podkladov, počiatočný znížený pohyb a dostupnosť bez JavaScriptu. Snímky a funkčné reporty sú v `artifacts/contact-parallax`; snímky kontaktu boli vizuálne skontrolované na oboch šírkach. Safari, Firefox a fyzické mobilné zariadenia neboli testované; Lighthouse a výkon hostingu sa nemerali.

## Predchádzajúca verzia: stručné označenie fotografií

V `config/portfolio.php` bola požadovaná veta nahradená krátkym označením „Inšpiračné fotografie“. Verejný HTML export bol znovu vygenerovaný s overenými assetmi predchádzajúcej verzie.

Pred zápisom bolo čerstvo stiahnutých a overených 31 súborov portfólia a 2 súbory hlavného webu. Záloha je v `artifacts/ftp/2026-10-05-altanok-v9/baseline`. Cez FTPS s overeným certifikátom bol nahraný iba pripravený `index.html`, zverejnený premenovaním. **31/31 súborov** má presnú zhodu SHA-256 po stiahnutí späť; **30/30 verejných súborov cez HTTPS** má stav 200 a správny obsah. `.htaccess` vracia 403 a hlavný web zostal nezmenený.

Prešli PHP syntax, Pint a **8 PHP testov so 147 assertions**. Dve cielené kontroly v Chrome, lokálne aj na verejnej URL, potvrdili odstránenie vety, stručný text, funkčný rozbalený panel a rozloženie bez pretekania na šírkach 390 a 1440 px. Prenosové reporty sú v `artifacts/ftp/2026-10-05-altanok-v9`; snímky a funkčné reporty v `artifacts/gallery-copy`. Nový Vite build ani celá sada testov animácií sa pri tejto zmene textu neopakovali.

## Predchádzajúca verzia: plynulé otvorenie a zatvorenie FAQ

Odpovede FAQ animujú výšku, jemné zobrazenie textu a otočenie ikony pri otvorení aj zatvorení. Ďalší klik pokračuje z aktuálneho stavu; otvorenie ďalšej otázky zatvorí predchádzajúcu. Klávesnica, natívne zobrazenie bez JavaScriptu a znížený pohyb sú zachované. Rozbehnutý prechod sa dokončí pri zmene šírky alebo preferencie pohybu. Úprava používa existujúci JavaScript a CSS bez novej závislosti.

Pred zápisom bola čerstvo stiahnutá a overená predchádzajúca verzia: 31 súborov portfólia a 2 súbory hlavného webu. Záloha je v `artifacts/ftp/2026-10-05-altanok-v8/baseline`. Cez FTPS s overeným certifikátom boli nahrané iba `build/assets/app-Cs4weBca.css`, `build/assets/app-C2R2bBQy.js` a nakoniec pripravený `index.html` premenovaním. Staršie assety sú zachované a hlavný web zostal nezmenený.

- **31/31 súborov** má presnú zhodu SHA-256 po stiahnutí späť cez FTPS.
- **30/30 verejných súborov cez HTTPS** má stav 200 a presný obsah; `.htaccess` vracia 403 a adresárová URL servíruje nový index.
- Prešli syntax, lokálny aj exportný produkčný build, **28/28 testov prehliadača v Chrome** a **8 PHP testov so 147 assertions**.
- Na verejnej URL prešlo **9 funkčných kontrol v Chrome bez chýb stránky, konzoly alebo HTTP**. Záznamy snímok potvrdili priebežnú zmenu výšky aj opacity v oboch smeroch, pri kliknutí na PC aj dotyku v mobilnom náhľade. Overené sú prechody medzi otázkami, klávesnica, rýchle kliknutia, znížený pohyb, zmena šírky, stránka bez JavaScriptu a chýbajúca podpora animácie.

Reporty, snímky a záznamy `live-faq-{desktop,mobile}-motion.json` sú v ignorovanom lokálnom adresári `artifacts/ftp/2026-10-05-altanok-v8`. Safari, Firefox a fyzické mobilné zariadenia neboli testované; Lighthouse a výkon hostingu sa nemerali.

## Predchádzajúca verzia: podčiarknutie navigácie zo stredu

Štyri odkazy hlavnej navigácie majú tenkú čiaru, ktorá sa pri hoveri rozvinie zo stredu za 0,45 sekundy a po odsunutí kurzora sa stiahne späť. Text ani susedné odkazy sa neposúvajú. Podčiarknutie funguje aj pri klávesnicovom fokuse; znížený pohyb ho zobrazí okamžite. Úprava je iba v `resources/css/app.css`.

Pred zápisom bola čerstvo stiahnutá a overená predchádzajúca verzia: 31 súborov portfólia a 2 súbory hlavného webu. Záloha je v `artifacts/ftp/2026-10-05-altanok-v7/baseline`. Cez FTPS s overeným certifikátom boli nahrané iba `build/assets/app-B8UbfylW.css` a nakoniec pripravený `index.html` premenovaním. Staršie assety sú zachované a hlavný web zostal nezmenený.

- **31/31 súborov** má presnú zhodu SHA-256 po stiahnutí späť cez FTPS.
- **30/30 verejných súborov cez HTTPS** má stav 200 a presný obsah; `.htaccess` vracia 403 a adresárová URL servíruje nový index.
- Prešli `npm run check`, lokálny aj exportný produkčný build a **7 cielených funkčných kontrol v Chrome**, lokálne aj na verejnej URL. Overené je postupné rozvinutie aj návrat všetkých štyroch čiar, pôvod v strede, nezmenené pozície odkazov, klávesnica, znížený pohyb a mobilné menu. Neboli zaznamenané chyby stránky ani HTTP.

Prenosové reporty sú v `artifacts/ftp/2026-10-05-altanok-v7`; funkčné reporty a snímky sú v `artifacts/header-underline`. Tieto adresáre zostávajú lokálne a ignorované. Safari, Firefox a fyzický mobil neboli testované; Lighthouse a výkon hostingu sa nemerali.

## Predchádzajúca verzia: zväčšenie loga

Logo v hlavičke aj päte sa pri hoveri zväčší zo stredu o 5,5 %. Prechod aj návrat trvajú 0,55 sekundy. Rovnaké zvýraznenie dostáva klávesnicový fokus. Dotykové ovládanie, znížený pohyb a tlač zachovávajú pôvodnú veľkosť. Úprava je iba v `resources/css/app.css`, bez novej závislosti.

Pred zápisom bola čerstvo stiahnutá a overená predchádzajúca verzia: 31 súborov portfólia a 2 súbory hlavného webu. Záloha je v `artifacts/ftp/2026-10-05-altanok-v6/baseline`. Cez FTPS s overeným certifikátom boli nahrané iba `build/assets/app-DzjuL0_7.css` a nakoniec pripravený `index.html` premenovaním. Staršie assety sú zachované a hlavný web zostal nezmenený.

- **31/31 súborov** má presnú zhodu SHA-256 po stiahnutí späť cez FTPS.
- **30/30 verejných súborov cez HTTPS** má stav 200 a presný obsah; `.htaccess` vracia 403 a adresárová URL servíruje nový index.
- Prešli `npm run check`, lokálny aj exportný produkčný build a **6 cielených funkčných kontrol v Chrome**, lokálne aj na verejnej URL. Overené je postupné zväčšenie a návrat oboch log, pevný stred, zachované rozmery rozloženia, klávesnica, znížený pohyb, tlač a dotykové ovládanie bez pretekania. Neboli zaznamenané chyby stránky ani HTTP.

Prenosové reporty sú v `artifacts/ftp/2026-10-05-altanok-v6`; funkčné reporty a snímky sú v `artifacts/logo-hover`. Tieto adresáre zostávajú lokálne a ignorované. Safari, Firefox a fyzický mobil neboli testované; Lighthouse a výkon hostingu sa nemerali.

## Predchádzajúca verzia: postupné písanie nadpisu

Text „Zostaňte do večera.“ sa odhaľuje po písmenách s jemným zaostrením a krátkou pauzou medzi dvoma riadkami. Na PC sa spúšťa pri rozvinutí fotografie, na mobile pri vstupe textu do obrazovky. Rozmery riadkov zostávajú stabilné a prístupné znenie obsahuje celú vetu vrátane medzery. Režim zníženého pohybu a stránka bez JavaScriptu ukazujú celý text.

Pred zápisom bola čerstvo stiahnutá a overená predchádzajúca verzia: 31 súborov portfólia a 2 súbory hlavného webu. Záloha je v `artifacts/ftp/2026-10-05-altanok-v5/baseline`. Cez FTPS s overeným certifikátom boli nahrané iba `build/assets/app-B8kUDnZy.css`, `build/assets/app-BvGAC0I4.js` a nakoniec pripravený `index.html` premenovaním. Staršie assety sú zachované; oba súbory hlavného webu zostali nezmenené.

- **31/31 súborov** má presnú zhodu SHA-256 po stiahnutí späť cez FTPS.
- **30/30 verejných súborov cez HTTPS** má stav 200 a presný obsah; `.htaccess` vracia 403 a adresárová URL servíruje nový index.
- Prešli syntax, lokálny aj exportný produkčný build, kompilácia Blade, **24/24 testov prehliadača v Chrome** a **8 PHP testov so 147 assertions**.
- Na verejnej URL prešlo **11 funkčných kontrol v Chrome bez chýb konzoly alebo HTTP**. Záznamy jednotlivých snímok potvrdili postupné zobrazenie písmen, pauzu medzi riadkami a stabilné rozmery na PC; odhalenie funguje aj na mobilnej šírke. Overené zostali smooth scroll, morphing, pôdorys, fotografie, kotvy, galéria, mobilné menu a znížený pohyb.

Reporty, snímky a záznamy `live-typewriter-desktop.json` a `live-typewriter-mobile.json` sú v ignorovanom lokálnom adresári `artifacts/ftp/2026-10-05-altanok-v5`. Lighthouse a výkon hostingu sa po tejto úprave nemerali. Safari, Firefox a fyzické mobilné zariadenia neboli testované. Firemné údaje, vlastné fotografie a indexovanie čakajú na doplnenie ako v predchádzajúcej verzii.

## Predchádzajúca verzia: texty a pôdorys posedenia

Nadpisy, popisy a názvy fotografií hovoria konkrétne o stole, sedení, streche a dreve. Dlhé pomlčky a opakované slogany boli odstránené. Pribudol vlastný SVG pôdorys posedenia so štyrmi stoličkami a vyznačeným priechodom; jeho línie sa pri scrollovaní vykresľujú cez existujúci GSAP. Morphing, parallax aj plynulý dobeh na PC zostávajú zachované.

Pred nasadením bolo čerstvo stiahnutých a overených 31 súborov predchádzajúceho balíka a 2 súbory hlavného webu. Záloha je v `artifacts/ftp/2026-10-05-altanok-v4/baseline`. Po opätovnej kontrole cieľa boli cez FTPS s overeným certifikátom nahrané iba tieto súbory:

- `build/assets/app-COYSg9Wh.js`
- `build/assets/app-lGw-EpYC.css`
- `downloads/podklady-pre-drevenu-stavbu.txt`
- `index.html`, zverejnený premenovaním pripraveného súboru ako posledný.

Staršie hashované assety boli zachované. `public_html/index.php` a `public_html/.htaccess` zostali nezmenené.

- **31/31 súborov balíka** má presnú zhodu SHA-256 po stiahnutí späť cez FTPS.
- **30/30 verejných súborov cez HTTPS** má stav 200 a presnú zhodu obsahu. `.htaccess` vracia 403; adresárová URL servíruje nový index.
- Lokálne prešli syntax, produkčný aj exportný build, kompilácia Blade, Pint, **22/22 testov prehliadača** a **8 PHP testov so 147 assertions**. Po oprave prístupného názvu fotografie prešli znovu tri príslušné testy galérie a všetky PHP testy.
- Lokálny Lighthouse na desktope aj mobile má Accessibility, Best Practices a Agentic Browsing po **100**. SEO je **66** kvôli úmyselnému `noindex`. Kontrola zhody názvu s viditeľným štítkom má v oboch reportoch skóre 1.
- Na verejnej URL prešlo **9 funkčných kontrol v Chrome bez chýb konzoly alebo HTTP**. Overené sú skutočné wheel udalosti a dobeh, morphing, dokreslenie pôdorysu na PC aj mobile, text bez pomlčiek, fotografie, kotvy s fokusom, klávesnica galérie, pozastavenie Lenis, mobilné menu a režim zníženého pohybu. Úvod a pôdorys boli na PC aj mobilnej šírke vizuálne skontrolované.

Záznamy `verification.json`, `http-verification.json`, `browser-verification.json`, `live-wheel-motion.json` a snímky sú v ignorovanom lokálnom adresári `artifacts/ftp/2026-10-05-altanok-v4`. Na FTP sa preniesli iba verejné súbory exportu. Firemné údaje a vlastné fotografie stále chýbajú; označenia inšpirácie a `noindex, nofollow` sú zachované. Výkon verejného hostingu, Safari, Firefox a fyzické mobilné zariadenia neboli overené.

## Predchádzajúca verzia: výraznejší smooth scroll na PC

Pre počítače od 1024 px s jemným ukazovateľom je nasadený plynulý dobeh kolieska cez Lenis 1.3.26. Kotvy prechádzajú medzi sekciami 1,5 sekundy a zachovávajú fragment URL, históriu aj fokus. Scroll a morphing používajú spoločný GSAP ticker; kratší scrub zabraňuje sčítaniu ich dobehov. Mobil a znížený pohyb používajú natívne posúvanie bez načítania Lenis. Otvorená galéria pozastaví pohyb stránky.

Pred nasadením bola čerstvo stiahnutá a overená celá aktuálna verzia z predchádzajúceho balíka: 30 súborov portfólia a 2 súbory hlavného webu. Záloha sa nachádza v `artifacts/ftp/2026-10-05-altanok-v3/baseline`. Po opätovnej kontrole cieľa boli cez FTPS nahrané iba nové CSS, JavaScript a Lenis modul a nakoniec bol premenovaním zverejnený pripravený HTML súbor. Staršie hashované assety boli zachované, hlavný web sa nezmenil.

- **4 nahrané súbory**, **31/31 súborov nového balíka** overených stiahnutím späť cez SHA-256.
- **30/30 verejných súborov cez HTTPS** má stav 200 a presnú zhodu obsahu. `.htaccess` vracia 403; adresárová URL servíruje nový index.
- Lokálne prešli syntax, produkčný aj exportný build, **22/22 testov prehliadača** a **8 PHP testov so 147 assertions**.
- Na verejnej URL prešlo **8 funkčných kontrol v Chrome bez chýb konzoly alebo HTTP**. Skutočné wheel udalosti potvrdili plynulý dobeh a správnu vzdialenosť; overené sú tiež morphing, všetky fotografie, kotvy s fokusom a odsadením hlavičky, galéria s pozastavením Lenis, zmena preferencie pohybu, mobilné menu a vynechanie Lenis na mobile aj pri zníženom pohybe.

Reporty `verification.json`, `http-verification.json`, `browser-verification.json`, záznam reálneho kolieska `live-wheel-motion.json` a snímky sú v ignorovanom lokálnom adresári `artifacts/ftp/2026-10-05-altanok-v3`. Na FTP boli nahrané iba verejné súbory exportu. Lighthouse ani výkon hostingu sa po tejto úprave nemerali; Safari, Firefox a fyzické mobilné zariadenia nie sú overené. Firemné údaje, fotografie a `noindex` zostávajú v stave opísanom nižšie.

## Predchádzajúca verzia: morphing

Po vizuálnej úprave bol 5. októbra nasadený nový statický export s oblúkovou fotografiou, jej rozvinutím na celú scénu, animovanými nadpismi a výrezmi galérie. Viditeľný text je približne o polovicu kratší. Mobil používa kratšiu premenu bez pripnutia úvodu.

Pred úpravou bolo čerstvo stiahnutých a zálohovaných všetkých 30 súborov pôvodného balíka aj `public_html/index.php` a `public_html/.htaccess`. Hash každého súboru portfólia zodpovedal predchádzajúcemu overenému nasadeniu. Cieľové súbory sa opätovne kontrolovali pred zápisom; nahrané boli iba nové CSS a JavaScript a nakoniec pripravený HTML súbor cez premenovanie. Staré dva hashované assety zostali zachované. Existujúci hlavný web sa nezmenil.

- FTPS s overeným certifikátom: **3 nahrané súbory, 30/30 súborov nového balíka overených stiahnutím späť cez SHA-256**.
- HTTPS: **29/29 verejných súborov** má stav 200 a presnú zhodu obsahu; `.htaccess` vracia 403. Adresárová URL servíruje nový `index.html`.
- Lokálne prešlo **17/17 testov prehliadača** a **8 PHP testov so 147 assertions**. Produkčný build, syntax, Blade kompilácia a PHP štýl prešli. Nový lokálny Lighthouse na mobile aj desktope má Accessibility, Best Practices a Agentic Browsing po 100; SEO 66 kvôli `noindex`.
- Na verejnej URL prešlo **6 kontrol v Chrome bez chýb konzoly alebo HTTP**: skutočný morphing úvodu pri scrollovaní, načítanie a dekódovanie všetkých šiestich fotografií, filtre a klávesnicové ovládanie galérie, zmena na znížený pohyb, mobilné menu pri 390 px bez pretekania a vynechanie GSAP pri počiatočnom zníženom pohybe. Desktopový a mobilný úvod boli vizuálne skontrolované.

Nové záznamy sú v `artifacts/ftp/2026-10-05-altanok-v2`: `verification.json`, `http-verification.json`, `browser-verification.json`, snímky `live-hero-morph.png` a `live-mobile.png` a čerstvá záloha `baseline`. Celý adresár je lokálny a ignorovaný; na FTP patria iba verejné súbory z `site` bez `build/manifest.json`. Firemné údaje a vlastné fotografie zostávajú na doplnenie, označenia inšpirácie a `noindex, nofollow` sú zachované. Výkon verejného hostingu, Safari, Firefox a fyzické mobilné zariadenia neboli overené.

## Prvé nasadenie

Adresár pred nasadením neexistoval. Vytvorený bol iba požadovaný podadresár s 30 súbormi: HTML, CSS, JavaScript vrátane GSAP modulov, lokálne fonty a licencie, WebP fotografie, favicon, textové podklady a `.htaccess`. Frontend bol exportovaný z existujúcich Blade šablón príkazom `portfolio:export`; relatívny Vite base zachováva správne načítanie z podadresára. Pre ďalší export sú príkazy v README.

Prenos prebehol cez FTPS s overeným certifikátom servera. Pre každý z **30/30 súborov** bolo vykonané stiahnutie späť a porovnanie SHA-256. Súbory existujúceho hlavného webu `public_html/index.php` a `public_html/.htaccess` boli pred prenosom stiahnuté do lokálnej zálohy a ich hash zostal po nasadení nezmenený.

## Overenie prvého nasadenia

- Exportný Vite build a kontrola PHP štýlu prešli. PHP testy: 8 úspešných, 147 assertions.
- Všetkých 29 verejných súborov bolo načítaných cez HTTPS so stavom 200 a presnou zhodou SHA-256 s nasadeným balíkom. Prístup k `.htaccess` správne vracia 403.
- Na verejnej stránke v Chrome sa načítalo všetkých šesť fotografií, fonty aj odložené GSAP moduly; konzola nemala chyby ani upozornenia.
- Skutočný parallax bol overený pri scrollovaní. Galéria filtrovala dve pergoly, otvorila dialóg, prešla na druhú fotografiu a vrátila sa do zatvoreného stavu.
- Vizuálna kontrola desktopu 1440 px a mobilu 390 px potvrdila správne rozloženie bez horizontálneho pretekania. Mobilné menu otvorilo sekciu inšpirácie, zatvorilo sa a presunulo fokus na cieľ. Posunutá fotografia naďalej zakrývala celý rám.
- Podklady na stiahnutie boli zahrnuté do úspešnej kontroly HTTPS a obsahu súborov.

Podrobné záznamy a záloha sú lokálne v ignorovanom adresári `artifacts/ftp/2026-10-05-altanok`: `verification.json`, `http-verification.json` a `baseline`. Tento adresár sa nenahráva na FTP; verejný obsah je iba v jeho podadresári `site`.

Firemné údaje a vlastné fotografie zostávajú nedoplnené, cudzie fotografie sú označené ako inšpirácia. Meta robots je naďalej `noindex, nofollow`. Lighthouse, meranie rýchlosti, Safari, Firefox a fyzické mobilné zariadenia neboli v rámci tohto nasadenia overované.
