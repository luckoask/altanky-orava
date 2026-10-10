# Overenie frontendu

## Safari, Firefox, produkčné spevnenie a právne stránky: 10. októbra 2026

Celá sada prešla vo **Firefoxe 28/28**. Vo **WebKite** (jadro Safari) prešlo 24/28: kontrola obrázkov na 360 a 390 px čakala na lenivý obrázok v kôpke kariet, ktorý WebKit začne načítavať neskoro; galéria teraz načíta všetky fotografie kariet, keď je obrazovku od nej, a test potom prešiel na všetkých šírkach. Test FAQ prešiel pri samostatnom opakovaní 2/2 a test bez JavaScriptu pri opakovaní, išlo o výkyvy pri záťaži. Windows build WebKitu nevykresľuje `backdrop-filter` ani v jednoduchom príklade, preto blur pod hlavičkou treba overiť na skutočnom iPhone a Macu.

Opravené chyby: panel mobilného menu a stmavenie mali po úprave blur iba šírku obsahu (teraz 0 až 390 px v Chrome aj WebKite) a na PC Lenis pri štarte prerušil skok na `/#kontakt` pri otvorení z inej stránky (teraz sekcia skončí 104 px pod vrchom, na mobile 84 px).

Domovská stránka, právne stránky, sitemap, robots aj 404 nenastavujú cookies a posielajú verejnú cache s ETag, CSP a ďalšie bezpečnostné hlavičky. Prešlo **12 PHP testov s 228 assertions** (nové: hlavičky a cookies, právne stránky s chýbajúcimi aj doplnenými údajmi, 404), Pint, skúšobný export s právnymi stránkami a `404.html` a **29 z 30 testov v Chrome**; zlyhal len test stiahnutia na `EPERM`. Nové testy právnych stránok, rozloženia a kôpky prešli aj vo WebKite a Firefoxe. V konzole sa pri prechode stránkami neobjavilo porušenie CSP.

## Kôpka kariet v galérii a oprava farby hlavičky: 10. októbra 2026

Galéria 04 je kôpka sticky kariet. Meranie v Chrome na 1440 × 900 a 390 × 844 px: karty sa ukladajú na 104, 118 a 132 px (mobil 78, 92, 106 px), karty pod kôpkou majú mierku 0,88, 0,93 a 0,98 a stmavenie do 0,62; na konci odchádza celá kôpka spolu, bez pretekania a chýb konzoly. Popis je hore na karte. Karta s fokusom vyskočí nad kôpku. Test morphingu výrezu galérie bol nahradený testom kôpky (sticky poloha, zmenšenie, stmavenie, dialóg klávesnicou); test bez JavaScriptu sa pred klikom vráti na začiatok galérie, lebo karty sa pri ďalšom scrolle zámerne prekrývajú.

Farba hlavičky sa predtým zisťovala len pri udalosti scrollovania, takže po obnovení stránky alebo počas dobehu scrubovaných animácií mohla zostať nesprávna (zachytené: mobil, obnovenie pri 700 px, „Menu“ tmavé nad tmavou fotografiou). Teraz sa po každom podnete overuje 1,2 s každý snímok, poistne raz za 0,7 s a po spustení či prepočítaní animácií. Kontrola 32 polôh (scroll po krokoch a obnovenie stránky na 8 miestach, PC aj mobil) bola bez chyby. Prešli **9 PHP testov** a **27 z 28 testov v Chrome**; zlyhal iba test stiahnutia na `EPERM`.

## Priehľadná hlavička a SEO: 10. októbra 2026

Hlavička je bez pozadia a prepína farbu podľa podkladu; úvodná scéna na PC sa pripína od vrchu a fotografia sa rozvinie na celú obrazovku. Kontrola v Chrome na 1440 a 390 px: tmavé písmo nad svetlým úvodom, svetlé nad rozvinutou fotografiou, sekciou Materiály a mobilnou fotografiou, svetlé pozadie pri otvorenom menu, ostré logo nad blurom a žiadne pretekanie ani chyby konzoly. Test pripnutia teraz overuje scénu cez celý viewport a svetlé písmo hlavičky nad fotografiou.

Päta: vodoznak bol zdvihnutý (spodný presah z 0,2 na 0,09 em, na telefóne nad okraj) a od 1440 px má päta 24 px navyše hore, aby sa písmeno „k“ pri 1920 px neorezalo. Navigácia v päte sú zaoblené tlačidlá a „Späť na začiatok“ okrúhle tlačidlo. Kontrola na 390, 768, 1024, 1440 a 1920 px bez pretekania, hover tlačidla v Chrome a blur hlavičky nad tmavou sekciou Kontakt. Prešli **9 PHP testov** a **27 z 28 testov v Chrome** (opäť len `EPERM` pri teste stiahnutia).

Dorovnanie sekcie 03: na 1440 × 900 px kolieskom pri 80 % sekcie zhora aj zdola skončil vrch sekcie na 0 px, pri 60 % zostal na 360 px. Na 390 × 844 px s dotykom sa počas držania prsta nič nehlo; po pustení pri 78 % sekcia dosadla na 0 px, pri 55 % zostala. Prešli **9 PHP testov** a **28 z 28 testov v Chrome** vrátane testu stiahnutia podkladov.

SEO: nový titulok (51 znakov), popis (145 znakov), H1 s kľúčovými slovami, schema.org graf, `sitemap.xml` s fotografiami, generovaný `robots.txt`, náhľad 1200 × 630, logo a ikona. Živá doména pri overení presmerovávala http aj www na https://domorava.sk (301), mala `noindex`, chýbala sitemap a firma nebola nájdená vo vyhľadávaní. Prešli **9 PHP testov so 182 assertions** (nový test štruktúrovaných dát, sitemap, robots a obrázkov), Pint, skúšobný export s `--url=https://domorava.sk` a **27 z 28 testov v Chrome**; zlyhal opäť iba test stiahnutia podkladov na `EPERM`.

## Mobilné rozloženie a animácie: 10. októbra 2026

Telefóny dostali nižšiu hlavičku, čitateľnejšie písmo (popisky 10 až 11 px, text 14 až 15 px), kompaktné karty služieb a krokov postupu, posúvateľné filtre a menší lightbox bez prázdnych pruhov. Pribudlo animované mobilné menu so stmavením stránky, plynulé rozbalenia v Materiáloch, službách a pri autoroch fotografií, swipe a prelínanie v galérii, animované otvorenie dialógu, nástup kariet po filtrovaní, fade pri odhaľovaní textov a odozva stlačenia na dotyku. Úvod hero beží v CSS od prvého vykreslenia. Desktopové rozloženie sa nemenilo; nebola pridaná závislosť.

Prešli `npm run check`, produkčný build, **8 PHP testov so 158 assertions** a **27 z 28 testov v Chrome**. Testy FAQ používajú nové atribúty `data-disclosure-*` a pred meraním počkajú na dokončenie nástupu zoznamu. Neúspešný bol test stiahnutia podkladov: súbor sa stiahol bez chyby, ale Node ho v `artifacts` nemohol prečítať (`EPERM`); odkaz ani súbor sa nemenili. Cielená kontrola na 360 × 740 px s dotykom overila priebežné rozvinutie a zbalenie menu, skrytie a návrat hlavičky, 53 medzisnímok výšky pri rozbalení princípu, výlučnosť skupiny, swipe na ďalšiu fotografiu, zatvorenie dialógu, nulové pretekanie a žiadne chyby konzoly. Snímky mobilu na 360 a 390 px aj desktopu na 1440 px boli skontrolované vizuálne. Safari, Firefox a fyzické zariadenia neboli testované; v Safari bez podpory `overlay` sa dialóg zatvára bez animácie.

Doplnené v ten istý deň: značka **DomOrava.sk** v logu, päte, titulku a `og:site_name`, hlavička ako roleta na počítači a vodoznak v päte. Kontrola v Chrome: pri koliesku na 1440 aj 900 px zostala hlavička počas pripnutej úvodnej scény viditeľná, pri scrollovaní nadol sa zasunula a pri posune nahor sa postupne vysunula (spodný okraj 2, 6, 9, 13… px po snímkach); na telefóne 390 px zostala na mieste. Vodoznak má na 390, 768, 1440 a 1920 px šírku 342 až 1540 px v rámci obsahu, písmená pri dosiahnutí päty postupne nadobudnú plnú opacitu a stránka nepreteká. Prešli **8 PHP testov so 158 assertions** a **27 z 28 testov v Chrome**; test stiahnutia podkladov opäť zlyhal iba na `EPERM` pri čítaní súboru.

## Fotografia cez celé pozadie sekcie 03: 5. októbra 2026

Fotografia dreva je samostatná vrstva cez celú plochu sekcie Materiály. Nemá orezanie pôvodného rámu; nadpis, text a natívne rozbalenia sú nad tmavým prekrytím. Výška bloku sa prispôsobuje viewportu aj otvorenému obsahu. Responzívne varianty 1000, 1600 a 2200 px sa načítavajú lokálne cez existujúci `x-image`. Jemný parallax, natívne ovládanie a autor fotografie zostávajú dostupní. Nebola pridaná závislosť ani zmenený JavaScript.

Prešli `npm run check`, PHP syntax, Pint, lokálny aj exportný produkčný build, **8 PHP testov so 158 assertions** a **28/28 testov v Chrome**. Celá sada overila rozloženie na šírkach 360, 390, 768, 1024, 1440 a 1920 px, fotografie bez prázdnych okrajov, galériu, FAQ, smooth scroll, kotvy, sťahovanie a režimy bez JavaScriptu či so zníženým pohybom.

Lokálne aj na verejnej URL prešlo **12 cielených kontrol**. Na rozmeroch 390 × 844, 390 × 640 a 1440 × 1000 px boli porovnané okraje fotografie a celej sekcie pred aj po rozbalení položky. Odchýlka bola 0 px; na krátkom mobilnom viewporte narástol otvorený blok približne na 681 px a fotografia ho stále pokrývala. Text nekoliduje s popisom fotografie. Overený je skutočný posun parallaxu, natívne otvorenie kliknutím, zatvorenie klávesnicou, znížený pohyb, stránka bez JavaScriptu a samostatné rozloženie pre tlač.

Neboli zaznamenané chyby stránky, konzoly ani HTTP. Snímky uzatvoreného a otvoreného bloku na PC a mobilnej šírke sú v `artifacts/material-background`; pri snímkovaní sa dočasne skryla fixná hlavička a zapol statický režim. Finálny výrez aj čitateľnosť boli vizuálne skontrolované lokálne a na verejnej URL. Nasadenie je v [DEPLOYMENT.md](DEPLOYMENT.md). Safari, Firefox a fyzické mobilné zariadenia neboli testované; Lighthouse ani výkon hostingu sa po tejto úprave nemerali.

## Fotografia s parallaxom v sekcii 07: 5. októbra 2026

Pod kontaktným obsahom pribudol široký záber pergoly s večerným osvetlením. Používa existujúci `x-image`, lokálne WebP varianty, rezervovaný rám a spoločný GSAP parallax. Nebola pridaná závislosť ani zmenený JavaScript. Rám má výšku 250 až 410 px a pri pohybe zostáva stabilný. Mobil používa menší rozsah; znížený pohyb, tlač a stránka bez JavaScriptu majú statickú fotografiu.

Prešli `npm run check`, PHP syntax, Pint, lokálny aj exportný produkčný build, **8 PHP testov so 150 assertions** a **28/28 testov v Chrome**. Existujúce kontroly rozloženia overili všetkých sedem fotografií na šírkach 360, 390, 768, 1024, 1440 a 1920 px; kontroly parallaxu zahŕňajú aj nový rám. Galéria, FAQ, kotvy, smooth scroll a sťahovanie zostávajú funkčné.

Lokálne aj na verejnej URL prešlo **7 cielených kontrol**. Nová fotografia sa medzi dvoma polohami scrollu posunula približne o 11 px na mobile a 33 px na PC bez odkrytých okrajov alebo zmeny výšky. Overené sú prepnutie na znížený pohyb, počiatočný znížený pohyb, kontakt bez JavaScriptu a presný obsah stiahnutých podkladov. Neboli zaznamenané chyby stránky, konzoly ani HTTP. Snímky boli vizuálne skontrolované na šírkach 390 a 1440 px; pre čistý záber sekcie sa pri snímkovaní dočasne skryla fixná hlavička a zapol statický režim.

Reporty a snímky sú v `artifacts/contact-parallax`. Nasadenie a overenie súborov sú v [DEPLOYMENT.md](DEPLOYMENT.md). Safari, Firefox a fyzické mobilné zariadenia neboli testované; Lighthouse ani výkon verejného hostingu sa po tejto úprave nemerali.

## Stručné označenie fotografií: 5. októbra 2026

Požadovaná veta bola v konfigurácii nahradená označením „Inšpiračné fotografie“. Prešli PHP syntax, Pint a **8 PHP testov so 147 assertions**. Dve cielené kontroly v Chrome, lokálne aj na verejnej URL, overili odstránenie vety, nový text, rozbalenie panelu a rozloženie bez pretekania na šírkach 390 a 1440 px. Reporty a snímky sú v `artifacts/gallery-copy`; nasadenie jediného HTML súboru a overenie obsahu sú v [DEPLOYMENT.md](DEPLOYMENT.md).

## Plynulé otvorenie a zatvorenie FAQ: 5. októbra 2026

FAQ používa animáciu výšky a opacity v oboch smeroch. Rýchly klik pokračuje z aktuálneho stavu, otvorenie ďalšej otázky zatvorí predchádzajúcu a po dokončení zostáva prirodzená výška obsahu. Rozbalenia používajú natívne `details` a zachovávajú klávesnicu; bez JavaScriptu či podpory animácie fungujú pôvodné natívne otázky. Pri zníženom pohybe sa stav prepne okamžite.

Prešli `npm run check`, lokálny aj exportný produkčný build, **8 PHP testov so 147 assertions** a **28/28 testov prehliadača v Chrome**. Nové kontroly zaznamenali priebežné výšky a opacity pri otvorení aj zatvorení na šírkach 390 a 1440 px. Overené sú rýchle reverzie, prechody medzi otázkami, zmena šírky a preferencie pohybu, chýbajúca podpora animácie, klávesnica a stránka bez JavaScriptu. Vizuálna kontrola otvorenej odpovede prebehla na PC aj mobilnej šírke.

Na verejnej URL prešlo **9 funkčných kontrol** vrátane skutočných kliknutí a emulovaného dotyku. Reporty a snímky sú v `artifacts/ftp/2026-10-05-altanok-v8`; nasadenie a kontrola súborov sú zaznamenané v [DEPLOYMENT.md](DEPLOYMENT.md). Safari, Firefox a fyzické mobilné zariadenia neboli testované.

## Podčiarknutie navigácie: 5. októbra 2026

Štyri odkazy hlavnej navigácie používajú CSS čiaru s pôvodom v strede a prechodom 0,45 sekundy. Hover aj klávesnicový fokus ju rozvinú na šírku textu bez zmeny rozloženia. Režim zníženého pohybu vynechá animáciu a mobilné menu zachováva pôvodné ovládanie.

Prešli `npm run check`, lokálny aj exportný produkčný build a **7 cielených kontrol v Chrome**, lokálne aj na verejnej URL. Overená bola priebežná zmena mierky čiar pri rozvinutí aj návrate, pôvod v strede, nezmenené pozície všetkých odkazov, klávesnicový fokus, znížený pohyb a mobilné menu na šírke 390 px bez pretekania. Reporty a snímky sú v `artifacts/header-underline`. Nasadenie je zaznamenané v [DEPLOYMENT.md](DEPLOYMENT.md). Safari, Firefox a fyzické mobilné zariadenia neboli testované.

## Zväčšenie loga: 5. októbra 2026

Logo používa CSS `scale(1.055)` s pôvodom v strede a prechodom 0,55 sekundy. Efekt sa vzťahuje na logo v hlavičke aj päte, vrátane klávesnicového fokusu. Hover sa zapína iba pre jemný ukazovateľ; pri zníženom pohybe a tlači zostáva pôvodná veľkosť.

Prešli `npm run check`, lokálny aj exportný produkčný build a **6 cielených kontrol v Chrome**, lokálne aj na verejnej URL. Kontroly potvrdili priebežnú zmenu mierky pri zväčšení aj návrate, pevný stred, nezmenené rozmery rozloženia, klávesnicový fokus, znížený pohyb, tlač a dotykové ovládanie na šírke 390 px bez pretekania. Reporty a snímky sú v `artifacts/logo-hover`. Nasadenie a jeho overenie sú v [DEPLOYMENT.md](DEPLOYMENT.md). Safari, Firefox a fyzické mobilné zariadenia neboli testované.

## Postupné písanie nadpisu: 5. októbra 2026

Nadpis vo fotografii používa odhalenie jednotlivých písmen cez existujúci GSAP, bez novej závislosti. Písmená majú rezervované miesto a medzi riadkami je krátka pauza. Prístupné znenie zostáva „Zostaňte do večera.“. Zmena šírky alebo preferencie pohybu obnoví pôvodný text a nový štart nevytvorí vnorené písmená.

Prešli `npm run check`, lokálny aj exportný produkčný build, kompilácia Blade, **8 PHP testov so 147 assertions** a **24/24 testov prehliadača v Chrome**. Dve nové kontroly zaznamenali jednotlivé snímky animácie na šírkach 390 a 1440 px: čiastočné odhalenie písmen, dokončenie prvého riadka pred druhým a nezmenené rozmery. Overené je aj opätovné spustenie a zrušenie animácie pri zmene preferencie, úplný text bez JavaScriptu a vynechanie animácie pri počiatočnom zníženom pohybe. Snímky PC a mobilnej šírky boli skontrolované vizuálne.

Verejná verzia má **11 úspešných funkčných kontrol**, záznamy písania na PC aj mobilnej šírke a samostatné overenie súborov cez FTPS a HTTPS v [DEPLOYMENT.md](DEPLOYMENT.md). Lighthouse, výkon hostingu, Safari, Firefox a fyzické mobilné zariadenia sa po tejto úprave neoverovali.

## Texty a vlastný náčrt: 5. októbra 2026

Upravené boli nadpisy, popisy a názvy fotografií. Text sa sústreďuje na stôl, sedenie, strechu, drevo a prípravu zadania. Opakované slogany v navigácii a päte boli odstránené. Pribudol vlastný inline SVG pôdorys posedenia so štyrmi stoličkami a vyznačeným priechodom, ktorý sa pri scrollovaní vykresľuje cez existujúci GSAP. Firemné údaje, označenia pôvodu fotografií a existujúce funkcie sú zachované.

Prešli syntax, produkčný aj exportný build, kompilácia Blade, Pint a **8 PHP testov so 147 assertions**. Celá sada **22 testov prehliadača** prešla na šiestich šírkach vrátane dobehu scrollu, morphingu, klávesnice, galérie, sťahovania a režimov bez JS či s obmedzeným pohybom. Po oprave prístupného názvu fotografie sa opäť overili tri príslušné testy galérie a všetky PHP testy.

Nový Lighthouse na desktope aj mobile má Accessibility, Best Practices a Agentic Browsing po **100**, SEO zostáva **66** kvôli úmyselnému `noindex`. Opravená bola nezhoda čítaného názvu so štítkom fotografie; príslušná kontrola má v oboch reportoch skóre 1. Reporty sú v `artifacts/copy-design/lighthouse-{desktop,mobile}.{json,html}`. Úvod a náčrt boli skontrolované vizuálne na PC aj mobilnej šírke. Viditeľný text, titulok, alt texty a prístupné názvy boli preverené na pomlčky. Verejné nasadenie má samostatný záznam v [DEPLOYMENT.md](DEPLOYMENT.md).

## Výraznejší smooth scroll na PC – 5. októbra 2026

Pre počítače od 1024 px s jemným ukazovateľom bol pridaný odložene načítaný Lenis 1.3.26. Koliesko má dlhší plynulý dobeh, kotvy prechod 1,5 sekundy. GSAP a Lenis používajú spoločný ticker; scrub desktopových premien je kratší, aby sa oneskorenia nesčítavali. Pribudla jediná runtime závislosť, bez ďalších runtime závislostí Lenis; npm audit po inštalácii nehlásil zraniteľnosti.

Prešli `npm run check`, lokálny aj exportný produkčný build, **8 PHP testov so 147 assertions** a **22/22 Playwright testov v Chrome**. Päť nových testov overuje reálne wheel udalosti a postupný dobeh až na správnu vzdialenosť, kotvy s fokusom a históriou, Home/End s prerušením zotrvačnosti, posúvanie obsahu dialógu pri zastavenej stránke, odstránenie a opätovné spustenie Lenis pri zmene šírky alebo preferencie a oneskorený import po zapnutí zníženého pohybu. Mobilný náhľad ani počiatočný znížený pohyb modul Lenis nenačítajú.

Záznam skutočného kolieska v `artifacts/browser-tests` má po jednom vstupe 600 px prvý pohyb 15 px a konečný posun 630 px podľa nastaveného násobiča; medzi nimi sa pozícia postupne mení. Ide o funkčné lokálne overenie dobehu, nie o meranie výkonu hostingu. Lokálne kotvy boli skontrolované aj v otvorenom Chrome. Výsledky verejného nasadenia sú samostatne v [DEPLOYMENT.md](DEPLOYMENT.md). Lighthouse a staršie meranie výkonu uvedené nižšie sa po tejto úprave neopakovali. Safari, Firefox a fyzické mobilné zariadenia zostávajú neoverené.

## Vizuálna úprava a morphing – 5. októbra 2026

Desktopový úvod mení fotografiu z oblúkového výrezu na celú scénu počas natívneho scrollovania. Obsahuje prechod medzi nadpismi, odhalenie slov, pohyb výrezu a mierne priblíženie fotografie. Menšie šírky používajú kratšiu premenu bez pripnutia. Galéria a materiálová fotografia majú animované výrezy a parallax; ikony služieb sa vykresľujú a tlačidlá reagujú na kurzor. Viditeľný text v predvolenom zatvorenom stave sa znížil z približne 590 na 290 slov.

Prešli syntax JavaScriptu, produkčný Vite build, kompilácia Blade, PHP štýl a **8 PHP testov so 147 assertions**. V Chrome prešlo **17/17 Playwright testov** vrátane všetkých šiestich šírok, pohybu fotografií bez odkrytých okrajov, premeny hero a galérie, odstránenia pripnutia na mobile, zmeny preferencie pohybu, klávesnice a režimu bez JS. Test zmeny na znížený pohyb odhalil ponechaný transform nadpisu; oprava obnovuje bežné rozloženie a test prešiel aj po opätovnom zapnutí animácií.

Úvod, galéria a služby boli vizuálne skontrolované na desktope; úvod a galéria tiež pri mobilnej šírke 390 px. Nový Lighthouse audit na lokálnom builde má na mobile aj desktope **Accessibility 100, Best Practices 100 a Agentic Browsing 100**. SEO zostáva 66 kvôli úmyselnému `noindex`. Reporty sú v `artifacts/design-v2/lighthouse-{desktop,mobile}.{json,html}`. Audit nemeria výkon; staršie meranie LCP nižšie sa na túto úpravu nevzťahuje. Verejné nasadenie a jeho samostatné overenie uvádza [DEPLOYMENT.md](DEPLOYMENT.md).

## Parallax – 5. októbra 2026

Jemný posun fotografií je doplnený v hero, detaile dreva a galérii cez existujúci GSAP ScrollTrigger. Na mobile má menší rozsah. Popisy a rámy sa neposúvajú; hover galérie používa samostatnú vrstvu. Zmena šírky, filtrovanie a rozbalenie obsahu obnovia merania animácií. Režim zníženého pohybu a tlač ponechávajú fotografie statické.

Po zmene prešli `npm run check`, produkčný build bez upozornení, Blade kompilácia, **8 PHP testov so 147 assertions** a **15 testov prehliadača v Chrome**. Nové kontroly overili skutočný posun všetkých šiestich fotografií pri natívnom scrollovaní na šírkach 390 a 1440 px, úplné zakrytie rámov bez prázdnych okrajov a nemennú výšku rámov. Existujúce kontroly všetkých šiestich šírok, galérie, klávesnice, režimu bez JS a zníženého pohybu zostali úspešné; overilo sa aj opätovné zapnutie pohybu po zmene preferencie. Desktopový hero a mobilná galéria boli vizuálne skontrolované. Lighthouse a meranie rýchlosti uvedené nižšie pochádzajú zo 4. októbra a po tejto úprave neboli opakované.

## Pôvodné overenie – 4. októbra 2026

Overené lokálne 4. októbra 2026 na Windows, PHP 8.5.5, Composer 2.9.5, Node 22.19.0 a nainštalovanom Chrome. Náhľad používa zostavené Vite assety a Laravel na `http://127.0.0.1:8000`.

## Výsledky

| Kontrola | Výsledok |
| --- | --- |
| Produkčný build `npm run build` | Úspešný, bez upozornení |
| Syntax JavaScriptu `npm run check` | Úspešná |
| PHP feature testy `php artisan test` | 8 testov, 147 assertions, všetky úspešné |
| Playwright v Chrome | 13 testov, všetky úspešné |
| Laravel Blade kompilácia `php artisan view:cache` | Úspešná |
| Cielená kontrola PHP štýlu cez Pint | Úspešná |
| Composer validácia a požiadavky platformy | Úspešné |
| Lighthouse – mobil aj desktop | Accessibility 100, Best Practices 100, Agentic Browsing 100 |
| Lighthouse – SEO | 66; jediná neúspešná kontrola je úmyselné zakázanie indexovania |

Playwright overil šírky **360, 390, 768, 1024, 1440 a 1920 px**, horizontálne pretekanie, rozmery a načítanie všetkých fotografií, konzolu a chyby HTTP. Overil aj mobilné menu, filtre galérie, šípky v dialógu, Tab/Shift+Tab, Escape, návrat fokusu, natívne FAQ, skutočný obsah stiahnutého súboru, znížený pohyb vrátane zmeny nastavenia a použitie stránky bez JavaScriptu.

PHP testy kontrolujú chýbajúce aj doplnené kontakty, escapovanie HTML a JSON, kotvy, existenciu podkladov, SEO metadáta, prioritné načítanie hero fotografie a platné lokálne WebP varianty so správnymi rozmermi. Všetky galériové fotografie majú zdroj a označenie pôvodu.

Rozloženie a ovládanie boli skontrolované aj vizuálne v Chrome: hero na všetkých uvedených šírkach, celá desktopová stránka, materiály, kontakt, mobilné menu a mobilný aj desktopový dialóg galérie. Snímky sú v `artifacts/browser-tests`; reporty Lighthouse v `artifacts/lighthouse-desktop.html` a `artifacts/lighthouse-mobile.html`. Adresár `artifacts` nie je súčasťou zdrojového kódu a možno ho znovu vytvoriť testami.

Lokálne meranie Chrome pri šírke 1440 px bez spomalenia CPU či siete zaznamenalo **LCP 147 ms, TTFB 24 ms a CLS 0,00**. Ide o meranie na tomto počítači, nie o rýchlosť verejného hostingu alebo používateľské Core Web Vitals. Verejný hosting, kompresia a cache HTTP neboli overené.

## Čo treba doplniť pred zverejnením

- Skutočný názov, kontakty, prípadnú adresu a oblasť pôsobenia v `.env`.
- Potvrdenú ponuku v `config/portfolio.php`; zatiaľ sú zobrazené možné typy stavieb.
- Vlastné fotografie, texty a prípadné skutočné referencie podľa `docs/ASSETS.md` a README. Súčasné fotografie sú jasne označenou inšpiráciou, nie firemnými realizáciami.
- Produkčné prostredie a URL; indexovanie zapnúť až po dokončení obsahu cez `PORTFOLIO_INDEXABLE=true`.

Verejné FTP nasadenie z 5. októbra 2026 a jeho aktuálne overenie sú zdokumentované v [DEPLOYMENT.md](DEPLOYMENT.md). Safari, Firefox ani fyzické mobilné zariadenia neboli testované. Stránka nemá odosielací formulár ani inú backendovú funkcionalitu. Composer lock lokálneho Laravel projektu vyžaduje PHP 8.4.1 alebo novší; na FTP je nasadený statický export.
