@extends('layouts.app', [
    'title' => 'Stránka sa nenašla | '.(config('portfolio.business.name') ?: config('portfolio.business.descriptor')),
    'robots' => 'noindex, follow',
    'canonical' => false,
    'anchorBase' => url('/'),
])

@section('content')
    <section class="error-page container" aria-labelledby="error-title">
        <p class="section-label"><span class="section-number">404</span><span>Stránka sa nenašla</span></p>
        <h1 id="error-title"><span class="motion-line">Sem cesta</span><span class="motion-line motion-line--accent">nevedie.</span></h1>
        <p class="error-copy">Stránka neexistuje alebo sa presunula. Pokračujte na úvod alebo rovno k inšpiráciám.</p>
        <div class="error-actions">
            <x-button :href="url('/')">Späť na úvod</x-button>
            <a class="text-link" href="{{ url('/') }}#inspiracia">Pozrieť inšpirácie <x-icon name="arrow-right" /></a>
        </div>
    </section>
@endsection
