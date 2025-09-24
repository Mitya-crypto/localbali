# Поток подтверждения e-mail

Новая реализация использует серверные эндпоинты Next.js и in-memory стор `memdb`.

## Настройка SMTP

Укажите переменные окружения (например, в `.env.local`):

```
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=secret
SMTP_SECURE=false
SMTP_FROM="LocalBali <no-reply@example.com>"
# опционально
EMAIL_VERIFICATION_SUBJECT="Подтверждение e-mail"
EMAIL_VERIFICATION_TTL=600
```

Если `SMTP_HOST` не задан, приложение продолжит работу в демо-режиме: код будет
записан в серверный лог (без отображения на клиенте).

## Проверка потока

1. Запустите dev-сервер: `npm run dev`.
2. Перейдите на `/email`, введите адрес и нажмите «Отправить код».
   - Сервер вызовет `POST /api/email/verification` и отправит письмо через
     настроенный SMTP.
3. Введите код из письма (или из серверного лога, если SMTP не настроен) и
   подтвердите — вызывается `POST /api/email/verification/confirm`.
4. После успеха статус синхронизируется с клиентом. На страницах профиля и
   безопасности отобразится «Подтверждён», а в разделе кошельков появится доступ
   к привязке адресов.

API можно тестировать напрямую:

- `GET /api/email/verification` — текущий статус.
- `POST /api/email/verification { "email": "user@example.com" }` — запуск
  подтверждения.
- `POST /api/email/verification/confirm { "code": "123456" }` — проверка кода.

Для ручного тестирования без интерфейса используйте `curl` и смотрите ответы
JSON (поле `status` отражает состояние e-mail).
