# Landing Static Builder

Инструмент для сборки лендингов с внешними шаблонами.

## 🚀 Быстрый старт

### 1. Настройка путей

Скопируйте `.env.example` в `.env` и укажите пути к вашим проектам:

```bash
cp .env.example .env
```

Отредактируйте `.env` файл:

### Локальная разработка (.env)

```bash
LANDING_PAGE_PATH=../../vite-landing-project  # Путь к вашему проекту
TEMPLATES_PATH=../../templates                # Путь к шаблонам
```

### Продакшн сервер

```bash
LANDING_PAGE_PATH=./app/landing-project       # Внутри app/
TEMPLATES_PATH=./app/templates                # Внутри app/
```

### 2. Запуск

```bash
# Установка зависимостей
npm install

# Локальная разработка
npm run dev

# Сборка проекта
npm run build

# Предварительный просмотр
npm run preview
```

## 📁 Структура проекта

```
landing-builder/
├── .env                 ← Ваши локальные пути
├── .env.example         ← Пример конфигурации
├── app/                 ← Папка для проектов на сервере
│   ├── landing-project/
│   └── templates/
├── dist/                ← Результат сборки
├── src/                 ← Исходный код билдера и плагинов
│   ├── config/          ← Конфигурация Vite и путей
│   ├── constants/       ← Константы для шаблонов
│   ├── plugins/         ← Плагины для Vite
│   ├── scripts/         ← Скрипты запуска, сборки, превью
│   └── utils/           ← Вспомогательные утилиты
└── ...
```

## 🧩 Особенности

- Поддержка внешних шаблонов (HTML, SCSS, JS)
- Автоматическое обновление шаблонов при изменениях
- Гибкая структура src и templates
- Конфигурируемые плагины для Vite
- Использование .env для путей
- Проверка и установка зависимостей для landing page

## 💡 Примечания

- **HTML-файлы landing page, имя которых начинается с символа `_`, не попадают в build.**

## 📦 Пример структуры template.json для шаблона

```json
{
  "name": "header",
  "entry": "template/index.html",
  "styles": ["template/css/index.scss"],
  "_comments": {
    "scripts": {
      "file": "template/js/*.js",
      "container": "head | body",
      "position": "start | end | comment",
      "targetComment": "if position is comment, specify the target comment"
    }
  },
  "scripts": [
    {
      "file": "template/js/index.js",
      "container": "body",
      "position": "end"
    },
    {
      "file": "template/js/cookies.js",
      "position": "comment",
      "targetComment": "cookie-modal"
    }
  ]
}
```

**Пояснения к полям:**

- `name` — название шаблона (уникально)
- `entry` — путь к основному HTML-файлу шаблона
- `styles` — массив SCSS/стилевых файлов
- `scripts` — массив JS-скриптов с параметрами:
  - `file` — путь к JS-файлу
  - `container` — куда вставлять скрипт (`head`, `body`)
  - `position` — позиция вставки (`start`, `end`, `comment`)
  - `targetComment` — если `position` = `comment`, указывается целевой комментарий
- `_comments.scripts` — пояснения для конфигурирования вставки скриптов
