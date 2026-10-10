@extends('layouts.app', [
    'title' => 'Obchodné podmienky | '.($content['business']['name'] ?: $content['business']['descriptor']),
    'description' => 'Podmienky dopytu, cenovej ponuky, zmluvy o dielo, platieb, montáže, reklamácií a odstúpenia pri drevených stavbách.',
    'robots' => 'noindex, follow',
    'canonical' => false,
    'anchorBase' => url('/'),
])

@php($name = $content['business']['name'] ?: $content['business']['descriptor'])

@section('content')
    <article class="legal container" aria-labelledby="legal-title">
        <header class="legal-head">
            <p class="section-label"><span>Právne informácie</span></p>
            <h1 id="legal-title">Obchodné podmienky</h1>
            <p class="legal-updated">Účinné od {{ \Illuminate\Support\Carbon::parse($content['legal']['updated'])->format('j. n. Y') }}</p>
            <p class="legal-lead">Tieto podmienky upravujú vzťahy medzi zhotoviteľom {{ $name }} a objednávateľom pri návrhu, výrobe a montáži drevených altánkov, pergol, prístreškov a podobných stavieb (ďalej „dielo“).</p>
        </header>

        <div class="legal-body">
            <section>
                <h2>1. Zhotoviteľ</h2>
                @include('partials.company')
            </section>

            <section>
                <h2>2. Rozsah a použité predpisy</h2>
                <p>Objednávateľom je spotrebiteľ, teda fyzická osoba, ktorá nekoná v rámci podnikania, alebo podnikateľ. Vzťahy so spotrebiteľmi sa riadia Občianskym zákonníkom a predpismi na ochranu spotrebiteľa, vzťahy s podnikateľmi Obchodným zákonníkom.</p>
                <p>Ak sa zmluva a tieto podmienky líšia, prednosť má zmluva. Voči spotrebiteľovi však nemožno dojednať menej výhodné podmienky, než aké ustanovuje zákon.</p>
            </section>

            <section>
                <h2>3. Informácie na webe a dopyt</h2>
                <p>Fotografie a texty na webe sú informatívne a nie sú návrhom na uzavretie zmluvy. Fotografie označené ako inšpirácia zobrazujú cudzie stavby. Dopyt je nezáväzný a bezplatný.</p>
            </section>

            <section>
                <h2>4. Cenová ponuka a uzavretie zmluvy</h2>
                <p>Na základe podkladov pripravíme cenovú ponuku s opisom diela, cenou, predpokladaným termínom a platobnými podmienkami. Platnosť ponuky je v nej uvedená.</p>
                <p>Zmluva o dielo vzniká podpisom písomnej zmluvy alebo potvrdením ponuky e-mailom, ak sa tak dohodneme. Ponuka môže vychádzať z rozmerov a fotografií od objednávateľa; pred výrobou si vyhradzujeme kontrolné zameranie na mieste. Ak zameranie odhalí podstatný rozdiel, ponuku upravíme a zmenu spolu dohodneme.</p>
            </section>

            <section>
                <h2>5. Cena a platby</h2>
                <p>Cena je uvedená v ponuke alebo v zmluve. Ak je dohodnutá záloha, jej výška a splatnosť sú uvedené v ponuke; výrobu spravidla začíname po jej úhrade. Práce nad rámec dohodnutého rozsahu vykonávame len po vzájomnej dohode a účtujeme podľa nej.</p>
            </section>

            <section>
                <h2>6. Termín a súčinnosť objednávateľa</h2>
                <p>Termín je uvedený v zmluve. Montáž závisí od počasia; pri nepriaznivom počasí alebo nedostatočnej súčinnosti sa termín primerane posúva a o posune objednávateľa bez zbytočného odkladu informujeme.</p>
                <p>Objednávateľ zabezpečí prístup na miesto stavby, označenie podzemných vedení a pripravený podklad, ak je to dohodnuté. Ak stavba podlieha ohláseniu alebo povoleniu, zabezpečuje ho objednávateľ, pokiaľ sa nedohodneme inak.</p>
            </section>

            <section>
                <h2>7. Odovzdanie diela</h2>
                <p>Dielo odovzdávame na mieste stavby; o odovzdaní môžeme spísať preberací protokol. Drobné vady, ktoré nebránia užívaniu, nie sú dôvodom na odmietnutie prevzatia a odstránime ich v dohodnutom termíne.</p>
            </section>

            <section>
                <h2>8. Drevo ako prírodný materiál</h2>
                <p>Praskliny pozdĺž vlákien, zmeny farby, výron živice, suky a mierne zmeny rozmerov pri zmene vlhkosti sú prirodzené vlastnosti dreva a nie sú vadou, ak neohrozujú pevnosť a funkciu diela. Životnosť ovplyvňuje aj údržba vrátane obnovy náterov podľa pokynov výrobcu.</p>
            </section>

            <section>
                <h2>9. Zodpovednosť za vady a reklamácie</h2>
                <p>Za vady diela zodpovedáme podľa Občianskeho zákonníka a predpisov na ochranu spotrebiteľa, pri podnikateľoch podľa Obchodného zákonníka. Záručná doba je uvedená v zmluve; voči spotrebiteľovi nie je kratšia, než ustanovuje zákon.</p>
                <p>Reklamáciu uplatníte e-mailom alebo písomne s opisom vady a fotografiami. Reklamáciu vybavíme bez zbytočného odkladu v lehotách podľa platných predpisov. Záruka sa nevzťahuje na vady spôsobené nesprávnym užívaním, zanedbaním údržby, živelnou udalosťou alebo zásahom tretej osoby.</p>
            </section>

            <section>
                <h2>10. Odstúpenie od zmluvy</h2>
                <p>Spotrebiteľ, ktorý uzavrie zmluvu na diaľku, napríklad e-mailom, alebo mimo prevádzkových priestorov, môže od nej spravidla odstúpiť do 14 dní. Toto právo zákon neposkytuje pri tovare alebo diele zhotovenom podľa osobitných požiadaviek spotrebiteľa, čo je väčšina stavieb na mieru; pred uzavretím zmluvy na to výslovne upozorníme.</p>
                <p>Ak spotrebiteľ požiada o začatie prác pred uplynutím lehoty na odstúpenie a potom odstúpi, uhradí cenu plnenia poskytnutého do odstúpenia.</p>
            </section>

            <section>
                <h2>11. Riešenie sporov a dozor</h2>
                <p>So sťažnosťou alebo reklamáciou sa obráťte najprv priamo na nás. Ak spotrebiteľ nie je spokojný s vybavením alebo nedostane odpoveď do 30 dní, môže podať návrh na alternatívne riešenie sporu Slovenskej obchodnej inšpekcii alebo inému oprávnenému subjektu zo zoznamu Ministerstva hospodárstva SR. Dozor nad ochranou spotrebiteľa vykonáva <a href="https://www.soi.sk" target="_blank" rel="noopener noreferrer">Slovenská obchodná inšpekcia<span class="sr-only"> (otvorí sa v novom okne)</span></a>.</p>
            </section>

            <section>
                <h2>12. Osobné údaje a záverečné ustanovenia</h2>
                <p>Spracúvanie osobných údajov opisuje stránka <a href="{{ route('privacy') }}">Ochrana osobných údajov</a>. Tieto podmienky platia od uvedeného dátumu; pre zmluvu platí znenie účinné v čase jej uzavretia.</p>
            </section>
        </div>
    </article>
@endsection
