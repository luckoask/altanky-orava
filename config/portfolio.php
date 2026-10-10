<?php

return [
    // Unknown business facts stay empty; the descriptor is not a company name.
    'business' => [
        'name' => env('BUSINESS_NAME') ?: 'DomOrava.sk',
        'descriptor' => 'Drevené stavby',
        'email' => env('BUSINESS_EMAIL'),
        'phone' => env('BUSINESS_PHONE'),
        'address' => env('BUSINESS_ADDRESS'),
        'area' => env('BUSINESS_AREA'),
        // Legal identification shown in the footer and on the legal pages; empty values are left out.
        'legal_name' => env('BUSINESS_LEGAL_NAME'),
        'ico' => env('BUSINESS_ICO'),
        'dic' => env('BUSINESS_DIC'),
        'ic_dph' => env('BUSINESS_IC_DPH'),
        'registry' => env('BUSINESS_REGISTRY'),
    ],

    // Date from which the privacy policy and terms apply; change it whenever their text changes.
    'legal' => ['updated' => '2026-10-10'],

    // Keyword first, brand last; BUSINESS_AREA adds the served region once it is confirmed.
    'seo' => [
        'title' => 'Drevené altánky, pergoly a prístrešky'.(env('BUSINESS_AREA') ? ', '.env('BUSINESS_AREA') : '').' | DomOrava.sk',
        'description' => 'Drevené altánky, pergoly a prístrešky do záhrady aj k domu. Inšpirácie, drevo a spoje zblízka a podklady na návrh stavby zdarma, bez registrácie.',
        'indexable' => (bool) env('PORTFOLIO_INDEXABLE', true),
        // 1200 × 630 preview for links shared on social networks and messengers.
        'image' => ['path' => 'images/og-domorava.jpg', 'width' => 1200, 'height' => 630, 'alt' => 'DomOrava.sk: drevená pergola so sedením a večerným osvetlením.'],
        'logo' => 'images/logo-512.png',
    ],

    'navigation' => [
        ['label' => 'Možnosti', 'href' => '#moznosti'],
        ['label' => 'Inšpirácia', 'href' => '#inspiracia'],
        ['label' => 'Materiály', 'href' => '#materialy'],
        ['label' => 'Ako začať', 'href' => '#postup'],
    ],

    // surface: overall tone of the photograph, so the transparent header picks readable ink above it.
    'media' => [
        'evening' => ['width' => 1600, 'height' => 1068, 'variants' => [640, 1000, 1600, 2200], 'surface' => 'dark'],
        'terrace' => ['width' => 1600, 'height' => 1067, 'variants' => [640, 1000, 1600]],
        'pavilion' => ['width' => 1600, 'height' => 2400, 'variants' => [640, 1000, 1600]],
        'garden' => ['width' => 1600, 'height' => 1067, 'variants' => [640, 1000, 1600]],
        'timber' => ['width' => 2200, 'height' => 1467, 'variants' => [1000, 1600, 2200], 'surface' => 'dark'],
    ],

    'hero' => [
        'eyebrow' => 'Drevené altánky, pergoly a prístrešky',
        'heading' => ['Stôl v tieni.', 'Dlhý večer.'],
        'description' => 'Strecha nad sedením. Záhrada všade okolo.',
        'scene_heading' => ['Zostaňte', 'do večera.'],
        'image' => 'evening',
        'alt' => 'Drevená pergola so sedením a večerným osvetlením. Inšpiračná fotografia.',
        'caption' => 'Sedenie pod drevenou pergolou.',
        'is_reference' => false,
        'credit' => 'Randy Fath / Unsplash',
        'source' => 'https://unsplash.com/photos/photo-of-gazebo-with-curtain-and-string-lights-csK5XPO87lI',
    ],

    'introduction' => [
        'eyebrow' => 'Miesto v záhrade',
        'heading' => ['Najprv stôl.', 'Potom strecha.'],
        'description' => 'Počítajte aj s odsunutou stoličkou a voľným priechodom okolo stola.',
    ],

    // These are informative content candidates, not a verified service catalogue.
    'services_confirmed' => false,
    'services_intro' => [
        'eyebrow' => 'Altánok, pergola alebo prístrešok',
        'heading' => ['Tri typy.', 'Podľa miesta.'],
        'description' => 'Samostatne v záhrade alebo hneď pri dome.',
        'notice' => 'Prehľad typov stavieb. Konkrétna ponuka zatiaľ nie je potvrdená.',
    ],
    'services' => [
        [
            'number' => '01', 'title' => 'Altánky', 'subtitle' => 'Samostatne v záhrade', 'icon' => 'gazebo',
            'description' => 'Samostatný priestor s pevnou strechou. Jeho tvar a umiestnenie nadväzujú na záhradu.',
        ],
        [
            'number' => '02', 'title' => 'Pergoly', 'subtitle' => 'Otvorený rám pre svetlo a tieň', 'icon' => 'pergola',
            'description' => 'Otvorený rám s priečnikmi pre svetlo a tieň. Ochranu pred dažďom poskytne až vhodné zastrešenie.',
        ],
        [
            'number' => '03', 'title' => 'Prístrešky', 'subtitle' => 'Krytá plocha pri dome', 'icon' => 'shelter',
            'description' => 'Krytý priestor pri dome alebo v záhrade. Rozmery a kotvenie závisia od účelu a podkladu.',
        ],
    ],

    'craft' => [
        'eyebrow' => 'Materiál a konštrukcia',
        'heading' => ['Drevo', 'zblízka.'],
        'description' => 'Druh dreva, spoje a odvod vody patria do návrhu už od začiatku.',
        'image' => 'timber',
        'alt' => 'Detail kresby dreva a suku. Ilustračná fotografia materiálu.',
        'credit' => 'Engin Akyurt / Pexels',
        'source' => 'https://www.pexels.com/photo/brown-wooden-surface-in-close-up-photography-9996436/',
        'principles' => [
            ['title' => 'Drevina a trieda', 'text' => 'Druh, trieda a ochranná úprava sa volia podľa zaťaženia a vystavenia vlhkosti.'],
            ['title' => 'Spoje a kotvenie', 'text' => 'Kotvenie závisí od podkladu a zaťaženia. Spoje majú umožniť kontrolu a vysychanie dreva.'],
            ['title' => 'Voda a náter', 'text' => 'Dôležité sú odvodnenie a ochrana čelných rezov. Náter sa obnovuje podľa expozície a pokynov výrobcu.'],
        ],
    ],

    'gallery' => [
        'eyebrow' => 'Inšpirácie',
        'title' => 'Ako to môže vyzerať.',
        'description' => 'Pozrite si strechu, otvorené boky a miesto na sedenie.',
        'notice' => 'Inšpiračné fotografie',
        'filters' => ['all' => 'Všetko', 'pergola' => 'Pergoly', 'gazebo' => 'Altánky', 'terrace' => 'Terasy'],
        'items' => [
            [
                'id' => 'vecer-v-zahrade', 'category' => 'pergola', 'label' => 'Pergola',
                'title' => 'Pergola so závesmi', 'image' => 'evening',
                'alt' => 'Drevená pergola s krémovými závesmi a rozsvietenou svetelnou reťazou.',
                'description' => 'Drevený rám, krémové závesy a svetelná reťaz nad sedením.',
                'is_reference' => false, 'credit' => 'Randy Fath',
                'source' => 'https://unsplash.com/photos/photo-of-gazebo-with-curtain-and-string-lights-csK5XPO87lI',
            ],
            [
                'id' => 'terasa-pri-dome', 'category' => 'terrace', 'label' => 'Terasa',
                'title' => 'Sedenie pri dome', 'image' => 'terrace',
                'alt' => 'Terasa pri bielom dome so zastrešeným sedením, stolom a červenými stoličkami.',
                'description' => 'Stôl a červené stoličky pod strechou pri bielom dome.',
                'is_reference' => false, 'credit' => 'Axel Pereira',
                'source' => 'https://unsplash.com/photos/a-white-house-with-a-red-table-and-chairs-sI96O3A1JrA',
            ],
            [
                'id' => 'altanok-v-zeleni', 'category' => 'gazebo', 'label' => 'Altánok',
                'title' => 'Altánok medzi stromami', 'image' => 'pavilion',
                'alt' => 'Drevený zastrešený pavilón obklopený zeleňou v otvorenej záhrade.',
                'description' => 'Samostatný pavilón s otvorenými bokmi a zeleňou okolo.',
                'is_reference' => false, 'credit' => 'Farhan Abas',
                'source' => 'https://unsplash.com/photos/brown-wooden-gazebo-near-green-trees-during-daytime-AiXcJM_wt0U',
            ],
            [
                'id' => 'otvoreny-priestor', 'category' => 'pergola', 'label' => 'Pergola',
                'title' => 'Otvorená pergola', 'image' => 'garden',
                'alt' => 'Drevené priečniky pergoly pri budove vytvárajú tieň a geometrický rytmus.',
                'description' => 'Drevené priečniky pri budove. Medzi nimi prechádza svetlo.',
                'is_reference' => false, 'credit' => 'Gordon Plant',
                'source' => 'https://unsplash.com/photos/landscape-photography-of-wooden-pergola-vNkqIC6YXfI',
            ],
        ],
    ],

    'process' => [
        'eyebrow' => 'Zadanie',
        'heading' => ['Pred návrhom.'],
        'description' => 'Podklady, ktoré pomôžu určiť rozsah.',
        'steps' => [
            ['title' => 'Miesto', 'text' => 'Fotka záhrady, rozmery a typ podkladu.'],
            ['title' => 'Využitie', 'text' => 'Na sedenie, státie alebo odkladanie.'],
            ['title' => 'Rozsah', 'text' => 'Predstava rozpočtu a termínu.'],
        ],
    ],

    'faq_intro' => [
        'eyebrow' => 'Otázky',
        'heading' => ['Otázky', 'pred stavbou.'],
        'description' => 'Príprava, údržba a cena.',
    ],
    'faq' => [
        ['question' => 'Čo si pripraviť na začiatok?', 'answer' => 'Fotografie miesta, približné rozmery a predstavu využitia. Pomôže aj informácia o podklade a orientačnom rozpočte.'],
        ['question' => 'Potrebuje drevo údržbu?', 'answer' => 'Áno. Kontrolujú sa nátery, spoje a miesta zadržiavajúce vodu. Obnova náteru závisí od expozície a pokynov výrobcu.'],
        ['question' => 'Ako sa určí cena a termín?', 'answer' => 'Podľa rozmerov, materiálu, strechy, podkladu a rozsahu prác. Obe treba potvrdiť pre konkrétne zadanie.'],
        ['question' => 'Aký je rozdiel medzi altánkom, pergolou a prístreškom?', 'answer' => 'Altánok je samostatný priestor s pevnou strechou. Pergola je otvorený rám s priečnikmi pre svetlo a tieň; pred dažďom chráni až so zastrešením. Prístrešok kryje plochu pri dome alebo v záhrade, napríklad nad sedením alebo autom.'],
        ['question' => 'Aké drevo sa hodí na altánok alebo pergolu?', 'answer' => 'Bežne sa používa smrek, borovica alebo smrekovec. Voľba závisí od zaťaženia, vystavenia vlhkosti a želanej údržby. Rovnako dôležitá je ochrana dreva, spoje a odvod vody.'],
        ['question' => 'Treba na altánok alebo prístrešok povolenie?', 'answer' => 'Závisí od rozmerov, výšky, umiestnenia na pozemku a od toho, či stavba nadväzuje na dom. Pred návrhom to overte na stavebnom úrade svojej obce; podklady pomôžu stavbu presne opísať.'],
    ],

    'contact' => [
        'eyebrow' => 'Podklady pre návrh',
        'heading' => ['Začnite', 'fotkou miesta.'],
        'description' => 'Rozmery, podklad a to, na čo chcete stavbu používať.',
        'image' => 'evening',
        'alt' => 'Večerné sedenie pod drevenou pergolou so závesmi a teplým osvetlením. Inšpiračná fotografia.',
        'credit' => 'Randy Fath / Unsplash',
        'source' => 'https://unsplash.com/photos/photo-of-gazebo-with-curtain-and-string-lights-csK5XPO87lI',
        'checklist' => ['Fotografia, rozmery a podklad', 'Účel, inšpirácie a rozpočet'],
        'download' => 'downloads/podklady-pre-drevenu-stavbu.txt',
        'pending_title' => 'Kontaktné údaje pripravujeme',
        'pending_description' => 'Telefón a email doplníme po potvrdení.',
    ],
];
