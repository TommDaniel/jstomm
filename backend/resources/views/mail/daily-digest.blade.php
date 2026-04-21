<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Resumo de Locações</title>
</head>
<body style="font-family: Georgia, 'Times New Roman', serif; background: #F5EFE6; color: #1F3A2E; margin: 0; padding: 24px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #FFFFFF; border: 1px solid #C9A961; border-radius: 8px;">
        <tr>
            <td style="padding: 32px 28px 16px; border-bottom: 2px dashed #C9A961;">
                <p style="margin: 0 0 4px; color: #C9A961; font-family: 'Brush Script MT', cursive; font-size: 22px;">Bom dia, Vó Jacinta!</p>
                <h1 style="margin: 0; color: #1F3A2E; font-size: 26px;">Resumo de Locações</h1>
                <p style="margin: 8px 0 0; color: #8B7355; font-size: 13px;">{{ \Carbon\Carbon::now()->locale('pt_BR')->isoFormat('dddd, D [de] MMMM [de] YYYY') }}</p>
            </td>
        </tr>

        <tr>
            <td style="padding: 24px 28px;">

                {{-- HOJE --}}
                <h2 style="margin: 0 0 12px; color: #C9A961; font-size: 18px;">Hoje</h2>
                @if (empty($checkInsToday) && empty($checkOutsToday))
                    <p style="margin: 0 0 24px; color: #8B7355;">Nenhuma entrada ou saída programada para hoje.</p>
                @else
                    @foreach ($checkInsToday as $b)
                        <p style="margin: 4px 0;">✅ <strong>Entrada:</strong> {{ $b['tenant_name'] }} — <em>{{ $b['apartment'] }}</em></p>
                    @endforeach
                    @foreach ($checkOutsToday as $b)
                        <p style="margin: 4px 0;">👋 <strong>Saída:</strong> {{ $b['tenant_name'] }} — <em>{{ $b['apartment'] }}</em></p>
                    @endforeach
                    <div style="height: 16px;"></div>
                @endif

                {{-- PAGAMENTOS ATRASADOS --}}
                <h2 style="margin: 0 0 12px; color: #B4452A; font-size: 18px;">Pagamentos atrasados</h2>
                @if (empty($overduePayments))
                    <p style="margin: 0 0 24px; color: #8B7355;">Tudo em dia. 🌟</p>
                @else
                    <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse: collapse; margin-bottom: 24px;">
                        <tr style="background: #F5EFE6;">
                            <th align="left" style="border-bottom: 1px solid #C9A961;">Inquilino</th>
                            <th align="left" style="border-bottom: 1px solid #C9A961;">Apartamento</th>
                            <th align="left" style="border-bottom: 1px solid #C9A961;">Último pagamento</th>
                        </tr>
                        @foreach ($overduePayments as $b)
                            <tr>
                                <td style="border-bottom: 1px solid #E8E0CC;">{{ $b['tenant_name'] }}</td>
                                <td style="border-bottom: 1px solid #E8E0CC;">{{ $b['apartment'] }}</td>
                                <td style="border-bottom: 1px solid #E8E0CC;">{{ $b['last_paid'] ?? 'nenhum' }}</td>
                            </tr>
                        @endforeach
                    </table>
                @endif

                {{-- PRÓXIMOS 7 DIAS --}}
                <h2 style="margin: 0 0 12px; color: #C9A961; font-size: 18px;">Próximos 7 dias</h2>
                @if (empty($upcomingCheckIns))
                    <p style="margin: 0; color: #8B7355;">Nenhuma reserva agendada.</p>
                @else
                    @foreach ($upcomingCheckIns as $b)
                        <p style="margin: 4px 0;">📅 {{ $b['check_in'] }} — {{ $b['tenant_name'] }} em <em>{{ $b['apartment'] }}</em></p>
                    @endforeach
                @endif
            </td>
        </tr>

        <tr>
            <td style="padding: 16px 28px 28px; border-top: 1px solid #E8E0CC;">
                <p style="margin: 0; color: #8B7355; font-size: 12px; text-align: center;">
                    Enviado automaticamente por jstomm.com · 70 anos da Vó
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
