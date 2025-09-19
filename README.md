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
