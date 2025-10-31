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

## ⚙️ Конфигурация проекта

В файле `app/config.json` хранятся настройки проекта, например:

```json
{
  "gtmId": "GTM-XXXXXXX"
}
```

Если этого файла нету - вы можете его создать с минимальным содержимым:

```json
{}
```

Свойства config.json:

`gtmId`: в HTML автоматически добавляется скрипт и все необходимое для работы Google Tag Manager на странице.

## 📁 Структура проекта

```
landing-builder/
├── .env                 ← Ваши локальные пути
├── .env.example         ← Пример конфигурации
├── app/                 ← Папка с проектами на сервере + файл config
│   ├── landing-project/
│   ├── config.json      ← Конфиг с настройками проекта
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
- Интеграция Google Tag Manager: если в `app/config.json` указан `gtmId`, в HTML автоматически добавляется весь необходимый код для работы GTM.

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

## 🏷️ Использование data-атрибутов для шаблонов

- Для подключения шаблона используйте элемент с атрибутом:
  ```html
  <div data-template="templateName" ...></div>
  ```
  где `templateName` — уникальное имя шаблона, соответствующее полю `name` в `template.json`.
- Все дополнительные data-атрибуты (например, `data-title`, `data-button`) будут доступны как переменные для подстановки в шаблон: в шаблонном HTML используйте плейсхолдеры вида `{{title}}`, `{{button}}`.
- Атрибут `data-template` обязателен для корректной работы билдерa.
- Пример:
  ```html
  <div data-template="header" data-title="Заголовок" data-button="Подробнее"></div>
  ```
  Использование в шаблоне:
  ```html
  <h1>{{title}}</h1>
  <button>{{button}}</button>
  ```

## Сборка для WebContainer (build:app)

Команда `npm run build:app` предназначена для подготовки специальной структуры проекта, необходимой для запуска в WebContainer.

### Основная цель

- Получить файл `webcontainer-structure.js`, который содержит описание файловой структуры приложения и используется для инициализации среды WebContainer.

### Этапы сборки

1. **Очистка папки build**
   - Скрипт `clean:build-app` удаляет предыдущую сборку.
2. **Компиляция исходного кода**
   - TypeScript компилирует файлы из `src` (кроме служебных скриптов сборки) в `build`.
3. **Копирование статических файлов**
   - Скрипт `copy-files:build-app` переносит необходимые статические файлы.
4. **Удаление пустых служебных папок**
   - Скрипт `remove-empty-folders:build-app` удаляет пустые папки, созданные TypeScript.
5. **Экспорт структуры для WebContainer**
   - Скрипт `webcontainer:export` формирует JS-модуль с описанием файловой структуры и добавляет `.env`.

**Результат:**

- В папке `build` появляется файл `webcontainer-structure.js`, скомпилированные файлы из папки src и package.json с только необходимыми скриптами для запуска проекта в WebContainer.
- В build не попадают служебные скрипты для запуска команды `npm run build:app`, которые находятся в папке `src/scripts/build-app`.
- Итоговая структура полностью готова для инициализации среды WebContainer.

**Пример запуска:**

```sh
npm run build:app
```

**Преимущества:**

- Автоматизация всех этапов подготовки среды для WebContainer.
- Чистая структура без лишних файлов.
- Быстрая интеграция с облачными средами и WebContainer.
