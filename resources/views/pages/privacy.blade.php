@extends('layouts.app', [
    'title' => 'Ochrana osobných údajov | '.($content['business']['name'] ?: $content['business']['descriptor']),
    'description' => 'Ako spracúvame osobné údaje z dopytov, zmlúv a návštevy webu a aké práva máte podľa GDPR.',
    'robots' => 'noindex, follow',
    'canonical' => false,
    'anchorBase' => url('/'),
])

@php($name = $content['business']['name'] ?: $content['business']['descriptor'])

@section('content')
    <article class="legal container" aria-labelledby="legal-title">
        <header class="legal-head">
            <p class="section-label"><span>Právne informácie</span></p>
            <h1 id="legal-title">Ochrana osobných údajov</h1>
            <p class="legal-updated">Účinné od {{ \Illuminate\Support\Carbon::parse($content['legal']['updated'])->format('j. n. Y') }}</p>
            <p class="legal-lead">Tieto informácie vysvetľujú, ako {{ $name }} spracúva osobné údaje ľudí, ktorí navštívia web, pošlú dopyt alebo s nami uzavrú zmluvu. Postupujeme podľa nariadenia (EÚ) 2016/679 (GDPR) a zákona č. 18/2018 Z. z. o ochrane osobných údajov.</p>
        </header>

        <div class="legal-body">
            <section>
                <h2>1. Prevádzkovateľ</h2>
                @include('partials.company')
                <p>Vo všetkých otázkach týkajúcich sa osobných údajov nás kontaktujte na uvedených kontaktoch.</p>
            </section>

            <section>
                <h2>2. Aké údaje spracúvame</h2>
                <ul>
                    <li><strong>Údaje z dopytu:</strong> meno, e-mail alebo telefón, miesto stavby, rozmery, fotografie pozemku a ďalšie informácie, ktoré nám pošlete formulárom na webe, e-mailom alebo telefonicky.</li>
                    <li><strong>Údaje zo zmluvy:</strong> fakturačné údaje, adresa realizácie, vzájomná komunikácia a údaje o platbách.</li>
                    <li><strong>Technické údaje:</strong> pri návšteve webu poskytovateľ hostingu a Cloudflare krátkodobo spracúvajú IP adresu a technické údaje o požiadavke v serverových záznamoch, aby web zabezpečili a chránili.</li>
                </ul>
                <p>Formulár na webe pošle vyplnené údaje a fotografie e-mailom priamo nám. Web ich neukladá do databázy ani do súborov. Na ochranu formulára pred zneužitím si web najviac na jednu hodinu pamätá zakódovanú podobu IP adresy, z ktorej prišiel dopyt.</p>
            </section>

            <section>
                <h2>3. Účely a právne základy</h2>
                <ul>
                    <li><strong>Odpoveď na dopyt a príprava cenovej ponuky:</strong> opatrenia pred uzavretím zmluvy na vašu žiadosť, čl. 6 ods. 1 písm. b) GDPR.</li>
                    <li><strong>Uzavretie a plnenie zmluvy</strong> vrátane návrhu, výroby, montáže, odovzdania a reklamácií: čl. 6 ods. 1 písm. b) GDPR.</li>
                    <li><strong>Účtovníctvo a dane:</strong> plnenie zákonných povinností, najmä podľa zákona č. 431/2002 Z. z. o účtovníctve, čl. 6 ods. 1 písm. c) GDPR.</li>
                    <li><strong>Bezpečnosť webu a ochrana právnych nárokov:</strong> oprávnený záujem, čl. 6 ods. 1 písm. f) GDPR.</li>
                    <li><strong>Fotografie vašej realizácie na webe:</strong> len s vaším súhlasom, čl. 6 ods. 1 písm. a) GDPR. Súhlas môžete kedykoľvek odvolať.</li>
                </ul>
            </section>

            <section>
                <h2>4. Ako dlho údaje uchovávame</h2>
                <ul>
                    <li>Dopyty, z ktorých nevznikne zmluva: najviac 12 mesiacov od poslednej komunikácie.</li>
                    <li>Zmluvy a súvisiaca komunikácia: počas trvania zmluvy a záručnej doby a potom počas premlčacích lehôt na uplatnenie nárokov.</li>
                    <li>Účtovné doklady: 10 rokov podľa zákona o účtovníctve.</li>
                    <li>Zakódovaná IP adresa pri odoslaní formulára: najviac jednu hodinu.</li>
                    <li>Serverové záznamy: krátkodobo, podľa nastavení poskytovateľa hostingu.</li>
                </ul>
            </section>

            <section>
                <h2>5. Komu údaje poskytujeme</h2>
                <ul>
                    <li>poskytovateľovi webhostingu a e-mailových služieb,</li>
                    <li>Cloudflare, Inc., ktorý zabezpečuje doručovanie a ochranu webu,</li>
                    <li>externému účtovníkovi alebo účtovnej firme,</li>
                    <li>orgánom verejnej moci, ak to vyžaduje zákon.</li>
                </ul>
                <p>Údaje nepredávame a nepoužívame ich na reklamné profilovanie.</p>
            </section>

            <section>
                <h2>6. Prenos mimo Európskej únie</h2>
                <p>Cloudflare, Inc. so sídlom v USA je certifikovaná podľa rámca ochrany údajov medzi EÚ a USA (EU-US Data Privacy Framework). Prenos sa opiera o rozhodnutie Európskej komisie o primeranosti ochrany.</p>
            </section>

            <section>
                <h2>7. Cookies a meranie návštevnosti</h2>
                <p>Web sám nenastavuje cookies, ani pri odoslaní formulára, a nepoužíva nástroje na sledovanie návštevníkov. Písma a obrázky sa načítavajú z nášho servera. Cloudflare môže na ochranu pred škodlivou prevádzkou použiť nevyhnutný technický súbor cookie. Odkazy na zdroje fotografií vedú na cudzie weby, ktoré majú vlastné pravidlá.</p>
            </section>

            <section>
                <h2>8. Vaše práva</h2>
                <p>Máte právo na prístup k údajom, ich opravu, vymazanie a obmedzenie spracúvania, na prenosnosť údajov, právo namietať proti spracúvaniu na základe oprávneného záujmu a právo kedykoľvek odvolať súhlas. Žiadosť vybavíme bez zbytočného odkladu, najneskôr do jedného mesiaca.</p>
                <p>Ak sa domnievate, že spracúvanie porušuje predpisy, môžete podať návrh na začatie konania Úradu na ochranu osobných údajov Slovenskej republiky, Hraničná 12, 820 07 Bratislava 27, <a href="https://dataprotection.gov.sk" target="_blank" rel="noopener noreferrer">dataprotection.gov.sk<span class="sr-only"> (otvorí sa v novom okne)</span></a>.</p>
            </section>

            <section>
                <h2>9. Povinnosť poskytnúť údaje a automatizované rozhodovanie</h2>
                <p>Poskytnutie údajov je dobrovoľné. Bez kontaktných údajov však na dopyt nevieme odpovedať a bez údajov potrebných na zmluvu ju nemôžeme uzavrieť. Nepoužívame automatizované rozhodovanie ani profilovanie.</p>
            </section>

            <section>
                <h2>10. Zmeny</h2>
                <p>Tieto informácie môžeme aktualizovať. Platné znenie je vždy na tejto stránke. Súvisiace pravidlá zmlúv nájdete v <a href="{{ route('terms') }}">obchodných podmienkach</a>.</p>
            </section>
        </div>
    </article>
@endsection
