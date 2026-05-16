# Work EXCEL Space

> Персональный аналитический стол для работы с Excel-файлами в браузере: загрузка, просмотр, фильтрация, сортировка, визуализации и экспорт данных — всё в одном месте.

---

## 📌 О продукте

**Work EXCEL Space** — это персональное веб-приложение для дата-аналитика. Позволяет загружать `.xlsx`-файлы, исследовать данные, строить графики и экспортировать результаты, не выходя из браузера. Никаких командных функций — только вы и ваши данные.

### Ключевые возможности (MVP)

- 🔐 Личная учётная запись (JWT-авторизация)
- 📁 Загрузка и хранение Excel-файлов (`.xlsx`)
- 📊 Табличный просмотр данных с фильтрацией и сортировкой
- 📈 Базовые визуализации (столбчатая диаграмма, линейный график)
- ✏️ Редактирование отдельных ячеек
- 📤 Экспорт результатов обратно в `.xlsx`
- 🗂 Личная история загрузок

---

## 🛠 Стек технологий

| Слой        | Технологии                                          |
|-------------|-----------------------------------------------------|
| Frontend    | Vite, React 18, TypeScript, Tailwind CSS, Vitest    |
| Backend     | Node.js, Express, TypeScript, Prisma ORM, Vitest    |
| База данных | PostgreSQL                                          |
| CI/CD       | GitHub Actions                                      |
| Деплой      | Vercel (frontend) · Railway (backend + PostgreSQL)  |

---

## 📂 Структура проекта

```
work-excel-space/
├── frontend/                  # Vite + React + TypeScript
│   ├── src/
│   │   ├── api/               # HTTP-клиент и вызовы API
│   │   ├── components/        # Переиспользуемые UI-компоненты
│   │   ├── hooks/             # Кастомные React-хуки
│   │   ├── pages/             # Страницы приложения
│   │   ├── types/             # TypeScript-типы и интерфейсы
│   │   └── utils/             # Вспомогательные функции
│   ├── eslint.config.js
│   ├── .prettierrc
│   ├── vite.config.ts
│   └── package.json
│
├── backend/                   # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── routes/            # Express-роуты
│   │   ├── controllers/       # Обработчики запросов
│   │   ├── services/          # Бизнес-логика
│   │   ├── middlewares/       # Middleware (auth, errors)
│   │   └── utils/             # Вспомогательные утилиты
│   ├── prisma/
│   │   └── schema.prisma      # Схема базы данных
│   ├── .eslintrc.cjs
│   ├── .prettierrc
│   ├── tsconfig.json
│   └── package.json
│
├── .github/
│   └── workflows/
│       └── ci.yml             # GitHub Actions CI
│
└── README.md
```

---

## 🚀 Быстрый старт

### Требования

- Node.js >= 20
- PostgreSQL >= 15
- npm >= 10

### Frontend

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

### Backend

```bash
cd backend
npm install
cp .env.example .env   # заполните DATABASE_URL и JWT_SECRET
npx prisma migrate dev
npm run dev        # http://localhost:3000
```

---

## 🧪 Тесты и линтинг

```bash
# Frontend
cd frontend
npm run lint
npm run test

# Backend
cd backend
npm run lint
npm run test
```

---

## 📦 Деплой

### Frontend → Vercel

1. Подключите репозиторий к [vercel.com](https://vercel.com).
2. Root Directory: `frontend`.
3. Framework Preset: `Vite`.
4. Переменная окружения: `VITE_API_URL` → URL вашего backend.

### Backend → Railway

1. Создайте новый проект на [railway.app](https://railway.app).
2. Добавьте сервис PostgreSQL.
3. Подключите репозиторий, Root Directory: `backend`.
4. Переменные: `DATABASE_URL`, `JWT_SECRET`, `PORT`.

---

## 🔄 CI/CD

GitHub Actions запускает при каждом Pull Request и пуше в `main`:

- Линтинг frontend и backend
- Запуск тестов (Vitest)
- Проверка типов TypeScript

---

## ✅ Production-ready checklist

1. Создайте production `.env` на backend на основе `backend/.env.example`:
   - `DATABASE_URL` с параметрами production БД (обычно с SSL),
   - сильный `JWT_SECRET`,
   - `NODE_ENV=production`.
2. Примените миграции на целевой БД:
   ```bash
   cd backend
   npx prisma migrate deploy
   ```
3. Выполните smoke-test ключевого сценария:
   - login
   - upload `.xlsx`
   - выбор листа
   - edit cell
   - chart tab
   - export `.xlsx`

---

## 🗺 Roadmap

- [x] MVP: auth, upload, table view, charts, cell edit, export
- [ ] API-level фильтрация/сортировка + серверная пагинация на чтении листа
  - `GET /api/files/:id/sheets/:sheetName?page=1&pageSize=50&search=alice&sortBy=2&sortDir=desc`

---

## 📋 Conventional Commits

```
feat:     новая функциональность
fix:      исправление бага
chore:    инфраструктура и настройки
docs:     изменения документации
test:     добавление / изменение тестов
refactor: рефакторинг без изменения поведения
```

---

## 📄 Лицензия

MIT
