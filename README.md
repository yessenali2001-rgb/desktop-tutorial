# WhatsApp-бот на Claude

Чат-бот для WhatsApp на официальном **WhatsApp Cloud API** (Meta). На каждое
текстовое сообщение отвечает Claude (`claude-opus-5-5`) и помнит последние
сообщения диалога с каждым пользователем.

## Возможности

- ответы через Claude с памятью диалога (по умолчанию 20 последних сообщений);
- команда `/reset` — начать разговор заново;
- отметка «прочитано» и индикатор «печатает…», пока Claude думает;
- проверка подписи вебхука (`X-Hub-Signature-256`);
- защита от повторной доставки одного сообщения и обработка сообщений одного
  пользователя строго по очереди;
- длинные ответы разбиваются на части по 4096 символов (лимит WhatsApp).

## Структура

```
src/
  server.ts    Express-сервер: вебхук GET/POST, очередь сообщений
  claude.ts    запрос к Claude API
  whatsapp.ts  отправка сообщений и проверка подписи (Graph API)
  history.ts   история диалогов в памяти
  config.ts    переменные окружения
```

## Установка

Нужен Node.js 20+.

```bash
npm install
cp .env.example .env   # и заполните значения
npm run dev            # разработка с автоперезапуском
# или
npm run build && npm start
```

## Настройка WhatsApp Cloud API

1. Зайдите на <https://developers.facebook.com/apps>, создайте приложение
   типа **Business** и добавьте продукт **WhatsApp**.
2. В **WhatsApp → API Setup** скопируйте:
   - временный **Access token** → `WHATSAPP_TOKEN`
     (для продакшена создайте постоянный токен системного пользователя в Business Manager);
   - **Phone number ID** → `WHATSAPP_PHONE_NUMBER_ID`.
   Там же добавьте свой номер в список получателей тестового номера.
3. **App settings → Basic → App secret** → `WHATSAPP_APP_SECRET`.
4. Получите ключ на <https://console.anthropic.com> → `ANTHROPIC_API_KEY`.
5. Сервер должен быть доступен по HTTPS. Для локальной разработки:
   ```bash
   npx ngrok http 3000
   ```
6. В **WhatsApp → Configuration → Webhook** укажите:
   - Callback URL: `https://<ваш-домен>/webhook`
   - Verify token: значение `WHATSAPP_VERIFY_TOKEN` из `.env`

   Нажмите **Verify and save**, затем подпишитесь на поле **messages**.
7. Напишите на тестовый номер в WhatsApp — бот ответит.

## Настройки (`.env`)

| Переменная | Описание |
|---|---|
| `ANTHROPIC_API_KEY` | ключ Claude API |
| `WHATSAPP_TOKEN` | токен доступа WhatsApp Cloud API |
| `WHATSAPP_PHONE_NUMBER_ID` | ID номера, с которого отвечает бот |
| `WHATSAPP_VERIFY_TOKEN` | любая строка для подтверждения вебхука |
| `WHATSAPP_APP_SECRET` | секрет приложения для проверки подписи (пусто — проверка выключена) |
| `PORT` | порт сервера, по умолчанию `3000` |
| `GRAPH_API_VERSION` | версия Graph API, по умолчанию `v23.0` |
| `HISTORY_LIMIT` | сколько последних сообщений помнить |
| `SYSTEM_PROMPT` | системный промпт — характер и правила бота |

## Замечания

- История хранится в памяти и сбрасывается при перезапуске. Для продакшена
  замените `src/history.ts` на Redis или базу данных.
- Ответить пользователю свободным текстом можно только в течение 24 часов
  после его последнего сообщения — это правило WhatsApp.
- Если Claude отклоняет запрос по соображениям безопасности, API автоматически
  повторяет его на рекомендованной резервной модели (`fallbacks: "default"`).
