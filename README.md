# IVPOL — magazyn-frontend

Фронтенд для учёта товаров магазина и склада: приёмка по штрихкоду, сроки годности, уценка и списание, ревизии, аналитический отчёт.

Интерфейс на трёх языках (PL / EN / RU), адаптирован под телефон, планшет и десктоп.

## Стек

- [Next.js 16](https://nextjs.org/) (App Router, Turbopack), React 19, TypeScript
- [next-intl](https://next-intl.dev/) — переводы
- CSS Modules + Tailwind CSS 4 (в основном для базовых стилей)
- axios — запросы к API
- html5-qrcode — сканер штрихкодов через камеру
- lucide-react — иконки
- Шрифт Roboto через `next/font/google` (latin, latin-ext, cyrillic)

## Быстрый старт

Требуется Node.js 20+ (проверено на 22).

```bash
npm install
# создайте файл .env в корне проекта (см. «Переменные окружения»)
npm run dev
```

Приложение откроется на http://localhost:3000. Главная страница — `/sprzedawca`.

### Переменные окружения

| Переменная | Пример | Назначение |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3000` | Адрес самого Next.js-приложения. Браузер ходит на `<NEXT_PUBLIC_API_URL>/api/...` |
| `NEXT_PUBLIC_BACKEND_API_URL` | `http://localhost:3030` | Адрес бэкенда (Node.js / Express). На него обращаются только серверные API-маршруты Next.js |

### Скрипты

| Команда | Что делает |
|---|---|
| `npm run dev` | Dev-сервер с hot reload |
| `npm run build` | Продакшен-сборка |
| `npm run start` | Запуск собранного приложения |
| `npm run lint` | ESLint |

## Как устроены запросы к бэкенду

Браузер **не обращается к бэкенду напрямую**. Все запросы идут через API-маршруты Next.js (`app/api/...`), которые пересылают их на бэкенд вместе с cookie:

```
Браузер ──► /api/... (Next.js, app/api) ──► NEXT_PUBLIC_BACKEND_API_URL
```

- `lib/api/api.ts` — axios-клиент браузера (`NEXT_PUBLIC_API_URL + /api`)
- `lib/api/clientApi.ts` — функции запросов для компонентов
- `app/api/api.ts` — axios-клиент сервера (`NEXT_PUBLIC_BACKEND_API_URL`)

| Маршрут Next.js | Бэкенд | Назначение |
|---|---|---|
| `GET /api/products/barcode/[barcode]` | `GET /products/barcode/:barcode` | Поиск товара по штрихкоду (база, затем Open Food Facts) |
| `PATCH /api/products/barcode/[barcode]` | `PATCH /products/barcode/:barcode` | Категория и/или цена на полке |
| `POST /api/products/manual` | `POST /manual` | Ручное создание товара (multipart, фото в поле `imageUrl` → Cloudinary) |
| `GET /api/inventory/intake` | `GET /inventory/intake` | Список партий (фильтры `year`, `month`, `productId`, `expirationDate`) |
| `POST /api/inventory/intake` | `POST /inventory/intake` | Приёмка партии |
| `GET /api/inventory/[intakeId]` | `GET /inventory/intake/:id` | Одна партия (с категорией и ценой товара) |
| `PATCH /api/inventory/[intakeId]` | `PATCH /inventory/intake/:id` | Уценка / списание |
| `PATCH /api/inventory/[intakeId]/price` | `PATCH /inventory/intake/:id/price` | Цена нетто партии (брутто = нетто + VAT% категории, считает бэкенд) |
| `GET`, `POST /api/inventory/[intakeId]/audits` | `/inventory/intake/:id/audits` | Ревизии партии |
| `POST /api/auth/login` | `POST /auth/login` | Вход по имени, фамилии и коду; cookie сессии выставляет Next.js |
| `POST /api/auth/logout` | `POST /auth/logout` | Выход |
| `POST /api/auth/change-password` | `POST /auth/change-password` | Смена своего кода |
| `GET /api/users/me` | `GET /users/me` | Текущий пользователь (имя в шапке, роль) |
| `GET`, `POST /api/users` | `/users` | Список / создание пользователя с автоматическим кодом (только администратор) |
| `POST /api/users/[userId]/reset-password` | `POST /users/:userId/reset-password` | Новый код для пользователя (только администратор) |
| `POST /api/invoices/recognize` | `POST /invoices/recognize` | Фото фактуры (поле `invoice`) → строки товаров (Tesseract) |
| `GET /api/products/match?q=&source=db|off` | `GET /products/match` | Кандидаты для строки фактуры: своя база / Open Food Facts |
| `GET /api/audit-logs` | `GET /audit-logs` | Журнал действий с фильтрами (только администратор) |
| `GET /api/categories` | `GET /categories` | Справочник категорий (фильтр в «Raporty») |
| `GET /api/reports/inventory` | несколько запросов, см. ниже | Строки отчёта «Raporty» |

**Отчёт `/api/reports/inventory`** собирается на стороне Next.js: берётся список партий, затем для каждой партии параллельно (не больше 8 одновременно) запрашиваются её детали и ревизии. Это 2 доп. запроса на партию — при большом числе партий отчёт стоит перенести в один эндпоинт бэкенда. Формат строки — `types/report.ts`.

