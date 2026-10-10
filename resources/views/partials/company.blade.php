@php
    // Only filled-in facts are shown; nothing is invented for missing ones.
    $business = $content['business'];
    $rows = array_filter([
        'Obchodné meno' => $business['legal_name'],
        'Sídlo alebo miesto podnikania' => $business['address'],
        'IČO' => $business['ico'],
        'DIČ' => $business['dic'],
        'IČ DPH' => $business['ic_dph'],
        'Zápis v registri' => $business['registry'],
    ]);
@endphp
<dl class="legal-company">
    <div><dt>Značka</dt><dd>{{ $business['name'] ?: $business['descriptor'] }}</dd></div>
    @foreach ($rows as $label => $value)
        <div><dt>{{ $label }}</dt><dd>{{ $value }}</dd></div>
    @endforeach
    @if ($business['email'])
        <div><dt>E-mail</dt><dd><a href="mailto:{{ $business['email'] }}">{{ $business['email'] }}</a></dd></div>
    @endif
    @if ($business['phone'])
        <div><dt>Telefón</dt><dd><a href="tel:{{ preg_replace('/[^+0-9]/', '', $business['phone']) }}">{{ $business['phone'] }}</a></dd></div>
    @endif
</dl>
@unless ($business['legal_name'] && $business['ico'] && $business['address'])
    <p class="legal-pending">Úplné identifikačné údaje (obchodné meno, sídlo a IČO) doplníme pred začatím poskytovania služieb.</p>
@endunless
