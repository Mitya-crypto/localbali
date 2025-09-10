# CryptoBali — Notes / Roadmap (локально)
- Основные роуты: `/home`, `/profile`, `/settings/security`, `/settings/language`, `/pin`, `/verify`, `/dev/overview`, `/dev/sim`.
- Фичи: PIN (локально), скрытие баланса (глобальный флаг), таб-бар на страницах, профиль с KYC/Email/Рефералы/Язык/Устройства, Security (тумблеры), язык (ru/en/id/es/de, флаги).
- API (моки): `/api/auth/verify`, `/api/new-pairs`, `/api/payment/notify`, `/api/referral/link`, `/api/user/verify-level`.
- Интеграции: Telegram WebApp initData проверка (сервер), TON (manifest), Vercel деплой.

## TODO (шаги)
1) Камера для QR (PWA/`getUserMedia`) + экран сканера.
2) Реферальные выплаты (настоящая БД + кошелёк).
3) KYC/Email — реальные флоу.
4) Стейт (Context/Store) для тем/языка/скрытого баланса, sync с сервером.
5) E2E-навигация и защита маршрутов (PIN/Verify → Home).
