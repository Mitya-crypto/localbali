# CRYPTOBALI Ocean (web)

## Запуск
```bash
npm i
cp .env.local.example .env.local
# отредактируй NEXT_PUBLIC_WEBAPP_URL и AML_PROVIDER (+ ключи)
npm run dev
```

Открой http://localhost:3000. В манифесте TonConnect используется тот же URL.

## Вкладки
- **TON** — отправка монет (TonConnect + deeplink)
- **Jetton** — отправка токенов TIP-3 (TonConnect + Tonkeeper deeplink)
- **Запрос** — генерация платёжного QR (TON/Jetton)
- **QR-сканер** — автоподстановка адреса/суммы/коммента
- **AML** — проверка адреса через выбранного провайдера

## Prefill из URL
- `?asset=ton&to=EQ...&amount=1.2&comment=Coffee`
- `?asset=jetton&jetton=kQ...&to=EQ...&amount=5&comment=tip`

## SMTP для подтверждения e-mail
Для отправки кода подтверждения по почте настрой переменные окружения (см. `.env.local`):

```
EMAIL_FROM="LocalBali <no-reply@example.com>"
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=api@example.com
SMTP_PASS=super-secret
# опционально:
# SMTP_SECURE=true
# или единая строка подключения:
# EMAIL_TRANSPORT_URL="smtps://user:pass@smtp.example.com:465"
```

API `POST /api/email/send-code` использует эти значения и отправляет код подтверждения на указанный адрес.
