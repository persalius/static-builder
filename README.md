# Landing Builder

Инструмент для сборки лендингов с внешними шаблонами.

## 🚀 Быстрый старт

### 1. Настройка путей

Скопируйте `.env.example` в `.env` и укажите пути к вашим проектам:

```bash
cp .env.example .env
```

Отредактируйте `.env` файл:

```bash
# Пути к проектам (измените на свои)
LANDING_PAGE_PATH=../../vite-landing-project
TEMPLATES_PATH=../../templates
```

### 2. Запуск

```bash
# Установка зависимостей (только один раз)
npm install

# Локальная разработка
npm run dev

# Сборка для локальной разработки
npm run build

# Предварительный просмотр
npm run preview
```

### 3. Для продакшн сервера

```bash
# Разработка на сервере
npm run dev:server

# Сборка на сервере
npm run build:server

# Предварительный просмотр на сервере
npm run preview:server
```

## 📁 Структура проекта

```
landing-builder/
├── .env                  ← Ваши локальные пути (не в git)
├── .env.example         ← Пример конфигурации
├── .env.server          ← Серверная конфигурация
├── app/                 ← Папка для проектов на сервере
│   ├── vite-landing-project/
│   └── templates/
├── dist/                ← Результат сборки
└── ...
```

## ⚙️ Настройка окружений

### Локальная разработка (.env)

```bash
LANDING_PAGE_PATH=../../vite-landing-project  # Путь к вашему проекту
TEMPLATES_PATH=../../templates                # Путь к шаблонам
```

### Продакшн сервер (.env.server)

```bash
LANDING_PAGE_PATH=./app/vite-landing-project  # Внутри app/
TEMPLATES_PATH=./app/templates                # Внутри app/
```

## 🔒 Безопасность

- `.env` файл не попадает в git (добавлен в .gitignore)
- Каждый разработчик может использовать свои пути локально
- Серверная конфигурация общая для всех

## 💡 Преимущества

- ✅ Простая настройка через .env файлы
- ✅ Разные конфигурации для разработки и сервера
- ✅ Нет конфликтов в git из-за разных путей
- ✅ Стандартный подход с .env файлами

## 🚀 Использование

### Локальная разработка (проекты в соседних папках)

```bash
npm run dev              # разработка
npm run build            # сборка
```

### Продакшн сервер (проекты в папке app/)

```bash
npm run dev:server       # разработка на сервере
npm run build:server     # сборка на сервере
```

### Кастомные пути

```bash
# Указать пути вручную
npm run dev -- --landing=../my-landing --templates=../my-templates
npm run build -- --landing=./projects/landing --templates=./projects/templates

# Абсолютные пути
npm run dev -- --landing=/path/to/landing --templates=/path/to/templates
```

### Предварительный просмотр

```bash
npm run preview          # после сборки
```

## 📁 Структура проекта

### Локальная разработка:

```
Projects/
├── landing-builder/     ← этот проект
├── vite-landing-project/
└── templates/
```

### На сервере:

```
landing-builder/
├── app/
│   ├── vite-landing-project/
│   └── templates/
└── ...
```
