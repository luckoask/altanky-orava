# DomOrava.sk — frontend portfólia

Slovenská jednostránková prezentácia: hero, úvod, prehľad drevených stavieb, materiály, filtrovaná galéria s prístupným dialógom, postup plánovania, FAQ, kontakt s formulárom na dopyty a päta. Laravel renderuje Blade a prijíma formulár, ktorý posiela dopyt e-mailom; stránka nemá autentifikáciu ani databázu.

## Spustenie

Aktuálny `composer.lock` vyžaduje **PHP 8.4.1+**. Overené na PHP 8.5.5, Composer 2.9.5 a Node 22.19.0 / npm 10.9.3. Laravel 13, Tailwind CSS 4, Vite 7, vanilla JS a GSAP so ScrollTrigger; presné verzie sú v lock súboroch.

```powershell
composer setup
composer dev
```

Prvý príkaz nainštaluje závislosti, pripraví `.env` a aplikačný kľúč a zostaví assety. Existujúce `.env` neprepíše. Druhý spustí Laravel a Vite na vývoj. Stránka: http://127.0.0.1:8000.

Na náhľad zostavených produkčných assetov stačí:

```powershell
npm run build
php artisan serve --host=127.0.0.1 --port=8000
```

Databázu ani migrácie netreba. Session sa nepoužíva, cache (limit pokusov formulára) používa lokálne súbory; worker sa nespúšťa. `public/build`, `vendor`, `node_modules`, `.env` a `artifacts` sú ignorované Gitom.

## Obsah a firemné údaje

Všetky hlavné texty, navigácia, kategórie, FAQ, obrazové metadáta a informácie o kontaktoch sú v **`config/portfolio.php`**. Nadpisy s kurzívou majú dva textové riadky. Obchodný názov a verejné kontakty doplňte do `.env` cez:

```dotenv
BUSINESS_NAME=
BUSINESS_EMAIL=
BUSINESS_PHONE=
BUSINESS_ADDRESS=
BUSINESS_AREA=
PORTFOLIO_INDEXABLE=false
```

Názov **DomOrava.sk** je predvolený v `config/portfolio.php` a zobrazuje sa v logu, päte, titulku a vodoznaku päty; `BUSINESS_NAME` ho môže prepísať. Názov v tvare domény má koncovku „.sk“ v logu zvýraznenú kurzívou. Ostatné prázdne hodnoty sa nevydávajú za skutočné údaje. Bez telefónu/e-mailu sa zobrazuje pravdivé oznámenie o pripravovaných kontaktoch a funguje stiahnutie podkladov pre projekt. Po doplnení vzniknú skutočné `mailto:` a `tel:` odkazy.

Po zmene `.env` alebo konfigurácie:

```powershell
php artisan config:clear
```

Položky v `services` upravte podľa skutočnej ponuky. Nie sú doplnené ceny, záruky, referencie, roky skúseností ani recenzie.

## Formulár na dopyty

Formulár je v sekcii Kontakt (`resources/views/components/inquiry-form.blade.php`, kotva `#dopyt`) a zobrazí sa, až keď je v `.env` vyplnené `INQUIRY_TO`. V produkcii (`APP_ENV=production`) sa nezobrazí ani vtedy, ak `MAIL_MAILER` zostal `log` alebo `array`; dopyty by sa inak stratili v logu, kým návštevník vidí poďakovanie. Texty, typy stavieb a limity sú v `inquiry` v `config/portfolio.php`.

- **Polia:** meno, telefón alebo e-mail (stačí jedno), typ stavby (Altánok, Pergola, Prístrešok, Iné), približné rozmery, obec, správa, najviac 6 fotiek a povinný súhlas s odkazom na ochranu osobných údajov.
- **Fotky:** prehliadač ich ukáže ako náhľady (dajú sa odobrať, na PC aj pretiahnuť) a pred odoslaním ich prekreslí na JPEG s dlhšou stranou najviac 2000 px. Tým odpadnú aj údaje z fotoaparátu vrátane polohy. Formát, ktorý prehliadač nevie otvoriť (HEIC mimo Safari), ide nezmenený. Server prijme JPG, PNG, WebP a HEIC, najviac 10 MB na fotku a 20 MB spolu.
- **Odoslanie:** na pozadí s priebehom v tlačidle („Odosielam 45 %“). Chyby sa ukážu pri poliach a prvé chybné pole dostane fokus; po odoslaní karta ukáže poďakovanie. Bez JavaScriptu formulár odošle stránku: pri chybe ju server vykreslí znova s chybami a vyplnenými hodnotami (fotky treba vybrať znova), po odoslaní presmeruje na `/dopyt-odoslany` (`noindex`).
- **E-mail:** `App\Mail\InquiryReceived` (HTML aj textová časť, `resources/views/mail`) ide na `INQUIRY_TO` s `Reply-To` na zákazníka, ak zadal e-mail. Fotky sú prílohy `fotka-1.jpg` atď. priamo z dočasného nahratia; web nič neukladá. Ak odoslanie zlyhá, chyba sa zapíše do logu a návštevník dostane výzvu skúsiť to znova s ponechanými údajmi.
- **Ochrana bez cookies:** formulár nemá session, takže ani CSRF token. Namiesto neho server odmietne požiadavku s cudzím `Origin` (403), skryté pole `website` a odoslanie do 3 sekúnd od načítania prezradí robota (dostane bežnú odpoveď, ale nič sa nepošle) a z jednej IP adresy prejde najviac 10 pokusov za hodinu (v cache je len HMAC odtlačok adresy). Logika je v `App\Http\Controllers\InquiryController`.
- **Cloudflare:** IP návštevníka a HTTPS sa berú z preposlaných hlavičiek iba od rozsahov Cloudflare (`trusted_proxies` v `config/app.php`, nastavené v `AppServiceProvider`). Inak by limit pokusov zdieľali všetci návštevníci jedného uzla Cloudflare. Iný proxy server: `TRUSTED_PROXIES` (IP oddelené čiarkou alebo `*`).
- **CSP** povoľuje obrázky z `blob:` kvôli náhľadom a zmenšovaniu fotiek. Statický export formulár vynecháva, lebo FTP hosting ho nevie prijať.
- **Rozloženie:** na telefóne je karta pod úvodom sekcie, na tablete pod úvodom a zoznamom, od 1024 px v pravom stĺpci vedľa nadpisu a zoznamu. Karta je pre hlavičku svetlý podklad (`data-surface="light"`). Nemá nábehovú animáciu: posun takej vysokej karty vo WebKite posunul aj stránku, keď bol návštevník na jej konci.

Nastavenie odosielania v `.env` (príklady; odosielateľ musí byť na doméne overenej u poskytovateľa, inak maily padajú do spamu):

```dotenv
INQUIRY_TO=adresa@pre-dopyty.sk
MAIL_FROM_ADDRESS=web@domorava.sk
MAIL_FROM_NAME="DomOrava.sk"
MAIL_MAILER=smtp
# SMTP hostingu: údaje od hostingu, zvyčajne port 465 (MAIL_SCHEME=smtps) alebo 587
# Brevo: MAIL_HOST=smtp-relay.brevo.com, MAIL_PORT=587, prihlasovacie meno a SMTP kľúč z účtu Brevo
# Resend: MAIL_HOST=smtp.resend.com, MAIL_PORT=465, MAIL_SCHEME=smtps, MAIL_USERNAME=resend, MAIL_PASSWORD=API kľúč
MAIL_HOST=
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=
```

Po zmene spustite `php artisan config:clear` (v produkcii `php artisan optimize`) a `php artisan portfolio:mail-test`, ktorý pošle skúšobný e-mail na `INQUIRY_TO` a vypíše chybu, ak spojenie zlyhá. Server musí prijať nahraté fotky: v PHP `upload_max_filesize = 10M` a `post_max_size = 25M` alebo viac, pri nginx `client_max_body_size 25m`. Lokálne stačí `MAIL_MAILER=log`; dopyty sa potom zapíšu do `storage/logs/laravel.log`.

## Vlastné fotografie

Aktuálna galéria je viditeľne označená ako **inšpirácia z cudzích stavieb**. Zdroj a licencia každej fotografie sú v [docs/ASSETS.md](docs/ASSETS.md); autorov možno otvoriť aj na stránke. Úvodná fotografia a fotografia v sekcii Kontakt nemajú na sebe štítok „Inšpirácia · Foto“; je to ten istý záber ako prvá karta galérie, ktorej autor je v zozname Autori a licencie. Licencia Unsplash uvedenie autora nevyžaduje.

1. Vlastné obrázky exportujte do `public/images` ako WebP s názvom `nazov-640.webp`, `nazov-1000.webp`, `nazov-1600.webp`. Pre hero pripravte aj `nazov-2200.webp`.
2. Pridajte správne pôvodné rozmery a dostupné varianty do `media` v konfigurácii. Komponent obrázka z nich tvorí `srcset` a rezervuje rozmery.
3. Upravte `gallery.items`: názov, kategóriu, opis, presný alt text, autora/zdroj a `image` bez prípony a veľkosti. `is_reference` nastavte na `true` len pri skutočnej firemnej realizácii s právami na zverejnenie.
4. Upravte aj galériový nadpis a `notice`, aby presne popisovali aktuálny obsah. Inšpiráciu a firemné realizácie musia naďalej rozlišovať štítky.
5. Pri náhrade hero upravte `hero.image`, `alt`, `credit`, `source` a `is_reference`; `credit` a `source` sa nezobrazujú, sú záznamom pôvodu fotografie. Lokálne fonty a ich licencie sú oddelené od fotografií.

Stránka pred potvrdením obsahu používa `noindex, nofollow`. Pri verejnom spustení nastavte skutočné `APP_URL`, `APP_ENV=production`, `APP_DEBUG=false`, doplňte SEO texty a až potom `PORTFOLIO_INDEXABLE=true`. Canonical sa zapne spolu s indexovaním. Webroot musí smerovať na `public`.

## Export pre FTP hosting

Živá stránka: **https://domorava.sk/** (pôvodný náhľad bol na lcks.eu/altanok). Nasadený frontend vzniká z rovnakých Blade šablón ako lokálny náhľad. Pri ďalších zmenách textov alebo fotografií export znovu vytvorte:

```powershell
npm run build -- --base=./ --outDir=artifacts/ftp-export/build
php artisan portfolio:export --url=https://domorava.sk --output=artifacts/ftp-export
```

Export neobsahuje formulár na dopyty, lebo statický hosting ho nevie prijať. Do cieľového FTP adresára patrí obsah `artifacts/ftp-export`: `index.html`, `.htaccess`, favicon a adresáre `build/assets`, `images`, `fonts`, `downloads`. `build/manifest.json` slúži iba pri exporte. Relatívny Vite base umožňuje načítať fonty a GSAP moduly aj z podadresára. Lokálny Laravel build zostáva samostatný v `public/build`.

Pred nahratím stiahnite existujúce cieľové súbory do zálohy, nahrajte assety a nakoniec `index.html`; po nahratí overte SHA-256 stiahnutím späť a skontrolujte verejnú URL. Prihlasovacie údaje patria do prostredia FTP klienta. Výsledok prvého nasadenia je v `docs/DEPLOYMENT.md`.

## Zdrojové súbory

- `resources/views/pages/home.blade.php` a `layouts/app.blade.php`: skladanie stránky a metadáta.
- `app/Http/Controllers/InquiryController.php`, `app/Mail/InquiryReceived.php`, `resources/views/components/inquiry-form.blade.php`, `resources/views/mail`, `pages/inquiry-sent.blade.php`: formulár na dopyty.
- `resources/views/components`: navigácia, značka, tlačidlo, obrázok, služby, galéria, FAQ, päta a SVG ikony.
- `resources/css/app.css`, `fonts.css`, `resources/fonts`: responzívny vizuálny systém a lokálne fonty.
- `resources/js/app.js`: mobilné menu, filtre, dialóg, formulár (`initializeInquiry`, `shrinkPhoto`), scrollové premeny fotografií, animácie nadpisov a parallax cez odložene načítaný GSAP.
- `public/images`, `public/downloads`: lokálne fotografie a reálny textový zoznam podkladov.

Hlavička nemá pozadie ani okraj a leží nad stránkou (`position: fixed`, výška v `--header-h`). Logo, navigácia a akcie si samostatne zisťujú podklad pod sebou (`initializeHeader`, `elementsFromPoint`): nad svetlou plochou majú lesnú farbu, nad prvkami s `data-surface="dark"` slonovinovú. Takto sú označené úvodná fotografia, Materiály, Kontakt a tmavé fotografie galérie (`surface` v `media`). Pri scrollovaní sa pod hlavičkou objaví iba postupný blur bez farby, aby text stránky nekolidoval s logom a navigáciou; ak je pod hlavičkou len fotografia, zostáva úplne čistá.

Galéria (04) je kôpka kariet: každá karta je `position: sticky` o 14 px nižšie ako predchádzajúca, takže pri scrollovaní sa ďalšia vysunie a ľahne na ňu. `initializeGalleryStack` podľa skutočnej polohy kariet zmenšuje (do 0,85) a stmavuje karty pod kôpkou a novú fotografiu jemne dorovnáva z priblíženia. Názov, kategória a číslo sú hore na fotografii, aby zostali viditeľné počas presunu; klik prechádza na fotografiu a otvára dialóg. Filter preradí viditeľné karty v kôpke. Karta s fokusom z klávesnice vyskočí navrch nestmavená. Bez JavaScriptu a pri zníženom pohybe kôpka vzniká len zo sticky polohy, bez zmenšovania; pri tlači sú karty pod sebou.

Sekcia Materiály (`data-snap`) má výšku obrazovky (`100lvh`). Keď scrollovanie skončí a sekcia zaberá aspoň 70 % obrazovky, stránka sa za 0,9 s plynulo dorovná tak, aby ju vyplnila (`initializeSectionSnap`; na PC cez Lenis, inak natívny smooth scroll). Počas dotyku prsta, pri otvorenom menu či galérii a pri zníženom pohybe sa nedorovnáva. Otvorené mobilné menu dostane svetlé pozadie. Na PC sa úvodná scéna pripne od vrchu stránky a fotografia sa pod priehľadnou hlavičkou rozvinie na celú obrazovku. Na telefónoch (do 767 px) má hlavička 66 px.

Úvod hero (štítok, slová nadpisu, text, tlačidlá, fotografia) animuje CSS od prvého vykreslenia, takže nadpis po načítaní GSAP nepreblikne. Pri scrollovaní sa okrem nadpisov postupne objavujú popisy sekcií, karty (v jednom riadku s krátkym odstupom) a položky FAQ, Materiálov a kontaktného zoznamu.

Päta je o niečo vyššia a za textom má veľký vodoznak s názvom firmy. Navigácia v päte sú zaoblené tlačidlá s jemným sklom (pri prejdení myšou sa vyplnia lesnou farbou a ukážu šípku), „Späť na začiatok“ je okrúhle tlačidlo so šípkou nahor, ktorá pri prejdení myšou preletí; na telefóne a pri šírke 1024 až 1279 px zostáva text tlačidla iba pre čítačky. Jeho veľkosť sa riadi šírkou obsahu. Pri scrollovaní k päte vystupujú písmená postupne spoza spodného okraja a dosadnú presne na konci stránky (GSAP scrub). Pri zníženom pohybe a bez JavaScriptu je vodoznak statický, pri tlači sa skryje.

Bez JavaScriptu fungujú kotvy, menu, FAQ, zdroje a odkazy na fotografie. Pri zníženom pohybe sa GSAP nenačíta a hladké posúvanie sa vypne. Obsah má plnú viditeľnosť aj bez animácií.

FAQ, princípy v sekcii Materiály, rozbalenia služieb a zoznam autorov fotografií animujú výšku pri otvorení aj zatvorení, jemné zobrazenie obsahu a otočenie ikony. Správanie dopĺňa natívne `details` cez `initializeDisclosures`, bez novej závislosti; skupiny a ich obsah sú v konštante `DISCLOSURES`. Rýchly ďalší klik pokračuje z aktuálnej výšky; v skupinách s atribútom `name` (FAQ, Materiály) otvorenie ďalšej položky zatvorí predchádzajúcu. Po dokončení sa výška opäť prispôsobuje obsahu. Zmena veľkosti okna, preferencie pohybu alebo začiatok tlače dokončí rozbehnutý prechod. Bez JavaScriptu či podpory animácie zostávajú natívne zoskupené otázky; pri zníženom pohybe je prepnutie okamžité. Merania scrollových animácií sa obnovia po dokončení rozbalenia.

Text „Zostaňte do večera.“ vo fotografii sa odhaľuje po písmenách s jemným posunom a zaostrením, s krátkou pauzou medzi dvoma riadkami. Na PC sa spustí pri rozvinutí úvodnej fotografie, na mobile pri vstupe textu do obrazovky. Celý text má rezervované miesto a čítačka obrazovky dostáva nezmenenú vetu vrátane medzery. Pri zníženom pohybe, bez JavaScriptu a pri tlači je celý text viditeľný. Zmena podmienok obnoví pôvodné riadky bez vnoreného delenia písmen.

Pri šírke od 1024 px sa úvodná fotografia počas natívneho scrollovania rozvinie z oblúka na celú úvodnú scénu. Nadpis ustúpi a objaví sa text vo fotografii; pripnutie trvá približne jednu výšku obrazovky. Na menších šírkach sa mení zaoblenie a výrez fotografie bez pripnutia. Nadpisy sa odhaľujú po slovách, galéria a detail dreva menia tvar výrezu, SVG ikony sa vykreslia a tlačidlá jemne reagujú na kurzor. Podrobnejšie texty služieb a materiálov sú v natívnych rozbaleniach.

Detail dreva, úvod a kontaktná fotografia zachovávajú parallax; intenzitu určuje `data-parallax` a na mobile sa znižuje. Samostatná obrazová vrstva umožňuje posun bez pohybu popisov. Fotografia mierne presahuje rám, aby nevznikli prázdne okraje. Pri zníženom pohybe, bez JavaScriptu alebo pri tlači zostáva obsah čitateľný bez scrollových premien. Zmena preferencie pohybu alebo šírky odstráni pripnutie a obnoví bežné rozloženie.

Na počítačoch od 1024 px s jemným ukazovateľom sa odložene načíta [Lenis](https://github.com/darkroomengineering/lenis) pre výraznejší plynulý dobeh kolieska. Aktuálne nastavenie v `initializeSmoothScroll` je `lerp: 0.055`, `wheelMultiplier: 1.05`; kotvy majú prechod 1,5 sekundy. Lenis používa ticker GSAP a skutočný čas rámca, pričom aktualizuje ScrollTrigger. Desktopové animácie fotografií majú kratší scrub, aby sa oba dobehy nesčítavali. Natívny scrollbar a skutočné `scrollY` zostávajú zachované.

Kotvy zachovávajú fragment URL, históriu, fokus a odsadenie hlavičky. Klávesy Home/End/PageUp/PageDown a šípky prerušia rozbehnutý dobeh a používajú natívne posúvanie; odkaz na preskočenie na obsah funguje okamžite. Otvorená galéria pozastaví pohyb stránky a jej obsah sa posúva natívne. Na mobile, pri zníženom pohybe a bez JavaScriptu sa Lenis nepoužíva; zmena podmienok odstráni inštanciu, ticker aj poslucháče. Nedostupný voliteľný modul ponechá natívne posúvanie funkčné.

Texty opisujú sedenie, strechu, drevo a prípravu zadania. Úvodný pôdorysný náčrt je vlastné SVG v `resources/views/components/garden-plan.blade.php`; pri scrollovaní sa vykresľuje rovnakým GSAP postupom ako ikony stavieb. Názvy fotografií opisujú ich viditeľný obsah. Text, metadáta a prístupné názvy používajú vety, čiarky, dvojbodky a zátvorky bez pomlčiek. Technické identifikátory a názvy súborov zachovávajú pôvodné pomenovanie.

## SEO

- Titulok, popis a H1 začínajú frázou „Drevené altánky, pergoly a prístrešky“. H1 obsahuje kľúčové slová ako malý štítok nad redakčným nadpisom; vizuál sa nemení. Po doplnení `BUSINESS_AREA` sa oblasť pridá aj do titulku a do `areaServed`.
- Indexovanie je predvolene zapnuté (`PORTFOLIO_INDEXABLE=true`). Pri indexovaní sa vydáva canonical, `max-image-preview:large` a v `robots.txt` odkaz na sitemap.
- `resources/views/partials/structured-data.blade.php` vydáva schema.org graf: WebSite, firma (Organization; s adresou HomeAndConstructionBusiness), stránka s otázkami FAQ. Kontakty a adresa sa pridajú len z `.env`.
- `/sitemap.xml` obsahuje stránku a všetky fotografie (image sitemap), `/robots.txt` sa generuje podľa domény. Statický export zapisuje oba súbory aj `apple-touch-icon.png`.
- Náhľad na zdieľanie `public/images/og-domorava.jpg` (1200 × 630), logo pre vyhľadávače `public/images/logo-512.png` a ikona `public/apple-touch-icon.png` boli vykreslené z fontov, fotografie a značky webu.
- FAQ má šesť otázok vrátane rozdielu medzi typmi stavieb, výberu dreva a povolenia. Google od mája 2026 nezobrazuje FAQ rozšírené výsledky; označenie zostáva pre ostatné vyhľadávače a AI odpovede.

## Právne stránky, cookies a bezpečnosť

- `/ochrana-osobnych-udajov` (GDPR) a `/obchodne-podmienky` (zmluva o dielo, platby, montáž, vady, odstúpenie, riešenie sporov) sú v `resources/views/pages/privacy.blade.php` a `terms.blade.php`. Majú `noindex, follow` a v päte sú na ne odkazy. Dátum účinnosti je `legal.updated` v `config/portfolio.php`. Texty sú vzor pre živnostníka alebo malú firmu; pred spustením ich má skontrolovať právnik.
- Identifikácia firmy (`partials/company.blade.php` a päta) berie `BUSINESS_LEGAL_NAME`, `BUSINESS_ICO`, `BUSINESS_DIC`, `BUSINESS_IC_DPH`, `BUSINESS_REGISTRY`, `BUSINESS_ADDRESS`, e-mail a telefón z `.env`. Zobrazujú sa len vyplnené údaje; kým chýba obchodné meno, IČO alebo sídlo, právne stránky to otvorene uvádzajú.
- Stránky ani formulár nemajú session, preto nenastavujú žiadne cookies (netreba cookie lištu). Stránky posielajú `Cache-Control: public, max-age=60` s ETag, odpovede formulára `no-store`.
- Ochrana osobných údajov opisuje formulár: údaje a fotky idú e-mailom a web ich neukladá, zakódovaná IP adresa sa drží najviac hodinu.
- `App\Http\Middleware\SecurityHeaders` pridáva ku každej odpovedi CSP (len vlastný pôvod, Cloudflare Web Analytics a `blob:` obrázky pre náhľady fotiek), `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` a pri HTTPS aj HSTS. Pri bežiacom Vite dev serveri sa CSP vynecháva.
- Neexistujúce adresy majú vlastnú stránku 404 (`resources/views/errors/404.blade.php`); statický export ju zapisuje ako `404.html`.

## Nasadenie do produkcie

1. `.env` na serveri: `APP_ENV=production`, `APP_DEBUG=false`, `APP_URL=https://domorava.sk`, `PORTFOLIO_INDEXABLE=true`, všetky `BUSINESS_*` údaje vrátane identifikácie firmy a pre formulár `INQUIRY_TO` a `MAIL_*` (časť Formulár na dopyty).
2. `composer install --no-dev --optimize-autoloader`, `npm ci`, `npm run build`, `php artisan optimize`, potom `php artisan portfolio:mail-test` a skúšobný dopyt z webu. Limity PHP a webového servera pre fotky podľa časti Formulár na dopyty.
3. Zmazať starý `public/robots.txt`, ak na serveri zostal; robots a sitemap sa generujú.
4. Cloudflare: Always Use HTTPS, HSTS, pravidlo cache pre HTML (Cache Everything, rešpektovať hlavičky pôvodu) a po nasadení vyčistiť cache. Cloudflare Web Analytics funguje bez cookies a CSP ho povoľuje.
5. Google Search Console: overiť doménu a odoslať `https://domorava.sk/sitemap.xml`.

## Kontroly

```powershell
npm run check
npm run build
php artisan test
php vendor/bin/pint --test config/portfolio.php config/app.php routes/web.php routes/console.php app tests/Feature
composer validate --strict --no-check-publish
composer check-platform-reqs
```

Testy PHP overujú vykreslenie, chýbajúce aj doplnené kontakty, escapovanie HTML/JSON, kotvy, stiahnuteľný súbor, metadáta, rozmery a prítomnosť WebP variantov. Formulár (`tests/Feature/InquiryTest.php`): e-mail s prílohami a `Reply-To`, presmerovanie bez JS, chyby polí, limity fotiek, roboty, cudzí `Origin`, limit pokusov, výpadok pošty a skrytie v produkcii s `log`. Spúšťajte ich po builde.

Pre reprodukovateľné kontroly prehliadača:

```powershell
npx playwright install chromium
npm run test:browser
```

Ak je nainštalovaný Chrome, sťahovanie Chromium možno vynechať:

```powershell
$env:PLAYWRIGHT_CHANNEL = 'chrome'
npm run test:browser
```

Playwright kontroluje šírky 360, 390, 768, 1024, 1440 a 1920 px, pretekanie, obrázky, chyby konzoly, skutočný parallax a morphing pri scrollovaní, odstránenie pripnutia pri zmene šírky alebo preferencie pohybu, menu, filtrovanie, klávesnicu, návrat fokusu, FAQ, stiahnutie podkladov, formulár (chyby, náhľady, zmenšenie fotky, odoslanie cez `log` mailer, výpadok servera) a režim bez JS. Testy formulára potrebujú v lokálnom `.env` vyplnené `INQUIRY_TO` a `MAIL_FROM_ADDRESS` a pred odoslaním vyčistia lokálnu cache (`php artisan cache:clear`), aby ich pri opakovaní nezastavil limit 10 pokusov za hodinu. Ukladá náhľady do `artifacts/browser-tests`. Prehliadač je oddelený od runtime závislostí stránky.

Aktuálny rozsah overenia a obmedzenia sú v [docs/VERIFICATION.md](docs/VERIFICATION.md).
