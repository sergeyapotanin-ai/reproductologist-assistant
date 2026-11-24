# Ассистент репродуктолога

Мобильное PWA-приложение для врачей-репродуктологов.

## Возможности

- Картотека пациентов
- Голосовой ввод (Web Speech API + поддержка OpenAI Whisper)
- Протоколы ЭКО с шаблонами и препаратами
- Визуальный календарь стимуляции
- Генерация PDF-выписок
- Экспорт / импорт данных (JSON)
- Напоминания о ближайших событиях
- Тёмная / светлая тема
- Работает как PWA на телефоне

## Локальный запуск

```bash
npm install
npm run dev
```

## Деплой на Netlify

### Способ 1: Через GitHub (рекомендуется)

1. Создай репозиторий на GitHub
2. Залей код:

```bash
git init
git add .
git commit -m "Deploy to Netlify"
git branch -M main
git remote add origin https://github.com/ТВОЙ_ЛОГИН/reproductologist-assistant.git
git push -u origin main
```

3. На [netlify.com](https://netlify.com):
   - **Add new site** → **Import an existing project**
   - Выбери репозиторий
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Нажми **Deploy**

Netlify автоматически подхватит файл `netlify.toml`.

### Способ 2: Drag & Drop

```bash
npm install
npm run build
```

Потом на Netlify → Add new site → Deploy manually → перетащи папку проекта.

## Важно

- Данные хранятся только в браузере устройства
- Используй Экспорт/Импорт для переноса данных между устройствами
- Приложение — вспомогательный инструмент, решения принимает только врач
