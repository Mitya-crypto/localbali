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

## Консолидация репозитория в одну ветку
В репозитории есть скрипт `scripts/consolidate-branches.sh`, который помогает оставить только одну ветку как локально, так и на удалённом репозитории.

```bash
# оставляем только ветку main и чистим остальные ветки локально и на origin
scripts/consolidate-branches.sh main origin
```

Скрипт:

1. Проверяет, что рабочее дерево чистое и указанные ветка и remote существуют.
2. Переключается на целевую ветку и подтягивает актуальные изменения с удалённого репозитория.
3. Удаляет все остальные локальные ветки.
4. Удаляет все остальные ветки на удалённом репозитории.

Операция необратима, поэтому перед удалением скрипт запросит подтверждение.
