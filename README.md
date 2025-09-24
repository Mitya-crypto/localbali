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
Для работы серверных эндпоинтов `/api/email/verification/*` необходимо настроить SMTP.
Добавьте переменные в `.env.local`:

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false # true для 465
SMTP_USER=no-reply@example.com
SMTP_PASS=your_password
# Поле From (можно указать в формате "Имя <email@example.com>")
SMTP_FROM="CryptoBali <no-reply@example.com>"

# альтернативно можно использовать готовую строку подключения
# SMTP_URL=smtp://user:pass@smtp.example.com:587

# В разработке можно вывести код в лог, не отправляя письмо
# EMAIL_DEBUG=1
```

После изменения переменных перезапустите dev-сервер. Если SMTP недоступен,
эндпоинт вернёт ошибку `smtp-not-configured`.
