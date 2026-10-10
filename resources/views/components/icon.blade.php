@props(['name' => 'arrow-up-right'])
<svg {{ $attributes->merge(['class' => 'icon']) }} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
    @switch($name)
        @case('arrow-up-right')
            <path d="M5 19 19 5M5 5h14v14" />
            @break
        @case('arrow-right')
            <path d="M4 12h16m-6-6 6 6-6 6" />
            @break
        @case('arrow-down')
            <path d="M12 4v16m-6-6 6 6 6-6" />
            @break
        @case('arrow-up')
            <path d="M12 20V4m-6 6 6-6 6 6" />
            @break
        @case('arrow-left')
            <path d="M20 12H4m6-6-6 6 6 6" />
            @break
        @case('menu')
            <path d="M4 8h16M4 16h16" />
            @break
        @case('close')
            <path d="m6 6 12 12M18 6 6 18" />
            @break
        @case('plus')
            <path d="M12 5v14M5 12h14" />
            @break
        @case('download')
            <path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" />
            @break
        @case('check')
            <path d="m5 12 4 4L19 6" />
            @break
        @case('gazebo')
            <path d="m2 10 10-7 10 7M4 10h16M6 10v11M18 10v11M6 17h12M3 21h18M12 3v7" />
            @break
        @case('pergola')
            <path d="M3 6h18M5 6v15M19 6v15M8 3v6M12 3v6M16 3v6M5 12l5-6M19 12l-5-6" />
            @break
        @case('shelter')
            <path d="M2 7 22 4M5 7v14M19 5v16M5 15l7-9M19 13l-5-7M3 21h18" />
            @break
        @case('mail')
            <rect x="3" y="5" width="18" height="14" rx="1" /><path d="m3 6 9 7 9-7" />
            @break
        @case('phone')
            <path d="m7 3 3 5-3 3a15 15 0 0 0 6 6l3-3 5 3-1 4C11 22 2 13 3 4z" />
            @break
    @endswitch
</svg>
