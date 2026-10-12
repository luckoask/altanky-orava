@php
    $rows = array_filter([
        'Meno' => $inquiry['name'],
        'Telefón' => $inquiry['phone'],
        'E-mail' => $inquiry['email'],
        'Typ stavby' => $inquiry['type'],
        'Približné rozmery' => $inquiry['size'],
        'Miesto stavby' => $inquiry['place'],
    ]);
    $photoCount = count($photos);
@endphp
<!DOCTYPE html>
<html lang="sk">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Dopyt z webu</title>
</head>
<body style="margin:0;padding:24px;background:#f6f3ed;color:#292e29;font:15px/1.6 Arial,Helvetica,sans-serif;">
    <div style="max-width:620px;margin:0 auto;padding:28px;background:#ffffff;border-radius:12px;">
        <p style="margin:0;color:#806447;font-size:11px;letter-spacing:.12em;text-transform:uppercase;">Dopyt z webu {{ config('portfolio.business.name') ?: config('portfolio.business.descriptor') }}</p>
        <h1 style="margin:8px 0 20px;color:#263e33;font:400 30px/1.15 Georgia,serif;">{{ $inquiry['name'] }}</h1>
        <table role="presentation" style="width:100%;border-collapse:collapse;">
            @foreach ($rows as $label => $value)
                <tr>
                    <th scope="row" style="width:38%;padding:9px 12px 9px 0;border-top:1px solid #e3e1d8;color:#62695b;font-weight:400;text-align:left;vertical-align:top;">{{ $label }}</th>
                    <td style="padding:9px 0;border-top:1px solid #e3e1d8;vertical-align:top;">
                        @if ($label === 'Telefón')<a href="tel:{{ preg_replace('/[^+0-9]/', '', $value) }}" style="color:#263e33;">{{ $value }}</a>
                        @elseif ($label === 'E-mail')<a href="mailto:{{ $value }}" style="color:#263e33;">{{ $value }}</a>
                        @else{{ $value }}@endif
                    </td>
                </tr>
            @endforeach
        </table>
        @if ($inquiry['message'])
            <h2 style="margin:24px 0 8px;color:#263e33;font:400 20px/1.2 Georgia,serif;">Správa</h2>
            <p style="margin:0;white-space:pre-line;">{{ $inquiry['message'] }}</p>
        @endif
        <p style="margin:24px 0 0;color:#62695b;font-size:13px;">
            @if ($photoCount)Fotky v prílohe: {{ $photoCount }}.@else Bez fotiek.@endif
            @if ($inquiry['email']) Odpoveď na tento e-mail pôjde priamo na {{ $inquiry['email'] }}.@endif
            Odosielateľ súhlasil so spracovaním osobných údajov na prípravu odpovede a ponuky.
        </p>
    </div>
</body>
</html>
