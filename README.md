# Work EXCEL Space

> Веб-приложение для совместной работы с Excel-файлами в облаке: загрузка, просмотр, редактирование и экспорт таблиц прямо в браузере.

---

## 📌 О продукте

**Work EXCEL Space** — это платформа для командной работы с Excel-файлами без необходимости устанавливать Microsoft Office. Пользователи могут загружать `.xlsx`-файлы, просматривать и редактировать их онлайн, делиться с коллегами и экспортировать обратно.

### Ключевые возможности (MVP)

- 🔐 Авторизация / регистрация пользователей (JWT)
- 📁 Загрузка и хранение Excel-файлов
- 👁 Просмотр таблиц в браузере
- ✏️ Базовое редактирование ячеек
- 📤 Экспорт в `.xlsx`
- 👥 Совместный доступ к файлам

---

## 🛠 Стек технологий

| Слой       | Технологии                                        |
|------------|---------------------------------------------------|
| Frontend   | Vite, React 18, TypeScript, Tailwind CSS, Vitest  |
| Backend    | Node.js, Express, TypeScript, Prisma ORM, Vitest  |
| База данных| PostgreSQL                                        |
| CI/CD      | GitHub Actions                                    |
| Деплой     | Vercel (frontend), Railway (backend + PostgreSQL) |

---

## 📂 Структура проекта

```
work-excel-space/
├── frontend/                  # Vite + React + TypeScript
│   ├── src/
│   │   ├── api/               # HTTP-клиент и запросы к API
│   │   ├── components/        # UI-компоненты
│   │   ├── hooks/             # Кастомные React-хуки
│   │   ├── pages/             # Страницы приложения
│   │   ├── types/             # TypeScript-типы и интерфейсы
│   │   └── utils/             # Вспомогательные функции
│   ├── .eslintrc.cjs
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
npm run dev
```

### Backend

```bash
cd backend
npm install
cp .env.example .env   # заполните DATABASE_URL и JWT_SECRET
npx prisma migrate dev
npm run dev
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
4. Добавьте переменную `VITE_API_URL` → URL вашего backend.

### Backend → Railway

1. Создайте новый проект на [railway.app](https://railway.app).
2. Добавьте сервис PostgreSQL.
3. Подключите репозиторий, укажите Root Directory: `backend`.
4. Добавьте переменные: `DATABASE_URL`, `JWT_SECRET`, `PORT`.

---

## 🔄 CI/CD

GitHub Actions запускается при каждом Pull Request и пуше в `main`:

- Линтинг фронтенда и бэкенда
- Запуск тестов (Vitest)
- Проверка типов TypeScript

---

## 📋 Conventional Commits

Формат коммитов в проекте:

```
feat:     новая функциональность
fix:      исправление бага
chore:    инфраструктурные изменения
docs:     изменения документации
test:     добавление/изменение тестов
refactor: рефакторинг без изменения поведения
```

---

## 📄 Лицензия

MIT
