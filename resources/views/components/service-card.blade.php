@props(['service'])
<article class="service-card" data-reveal>
    <div class="service-card-top"><span class="service-number">{{ $service['number'] }}</span><x-icon :name="$service['icon']" class="service-drawing" /></div>
    <h3>{{ $service['title'] }}</h3>
    <p class="service-subtitle">{{ $service['subtitle'] }}</p>
    <details class="service-detail">
        <summary>Čím sa líši <x-icon name="plus" /></summary>
        <p class="service-description">{{ $service['description'] }}</p>
    </details>
    <a class="text-link" href="#inspiracia">Pozrieť fotografie <x-icon name="arrow-right" /></a>
</article>
