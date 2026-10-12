{{-- Plain text part: values are printed unescaped because nothing here is rendered as HTML. --}}
Dopyt z webu {!! config('portfolio.business.name') ?: config('portfolio.business.descriptor') !!}

Meno: {!! $inquiry['name'] !!}
@foreach (array_filter(['Telefón' => $inquiry['phone'], 'E-mail' => $inquiry['email'], 'Typ stavby' => $inquiry['type'], 'Približné rozmery' => $inquiry['size'], 'Miesto stavby' => $inquiry['place']]) as $label => $value)
{!! $label !!}: {!! $value !!}
@endforeach
@if ($inquiry['message'])

Správa:
{!! $inquiry['message'] !!}
@endif

Fotky v prílohe: {!! count($photos) !!}
Odosielateľ súhlasil so spracovaním osobných údajov na prípravu odpovede a ponuky.
