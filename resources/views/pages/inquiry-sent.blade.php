@extends('layouts.app', [
    'title' => 'Dopyt odoslaný | '.($content['business']['name'] ?: $content['business']['descriptor']),
    'robots' => 'noindex, follow',
    'canonical' => false,
    'anchorBase' => url('/'),
])

{{-- Thank-you page for the form sent without JavaScript; the enhanced form confirms in place.
     The redirect keeps the form's #dopyt fragment, so the section carries that id. --}}
@section('content')
    <section class="error-page container" id="dopyt" aria-labelledby="sent-title">
        <p class="section-label"><span class="section-number">Dopyt</span><span>Odoslaný</span></p>
        <h1 id="sent-title"><span class="motion-line">{{ $content['inquiry']['sent_heading'] }}</span></h1>
        <p class="error-copy">{{ $content['inquiry']['sent_description'] }}</p>
        <div class="error-actions">
            <x-button :href="url('/')">Späť na úvod</x-button>
            <a class="text-link" href="{{ url('/') }}#inspiracia">Pozrieť inšpirácie <x-icon name="arrow-right" /></a>
        </div>
    </section>
@endsection
