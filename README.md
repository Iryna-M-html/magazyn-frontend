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
| `GET /api/products/barcode/[barcode]` | `GET /products/barcode/:barcode` | Поиск товара по штрихкоду |
| `GET /api/inventory/intake` | `GET /inventory/intake` | Список партий (фильтры `year`, `month`, `productId`, `expirationDate`) |
| `POST /api/inventory/intake` | `POST /inventory/intake` | Приёмка партии |
| `GET /api/inventory/[intakeId]` | `GET /inventory/intake/:id` | Одна партия (с категорией и ценой товара) |
| `PATCH /api/inventory/[intakeId]` | `PATCH /inventory/intake/:id` | Уценка / списание |
| `GET`, `POST /api/inventory/[intakeId]/audits` | `/inventory/intake/:id/audits` | Ревизии партии |
| `GET /api/reports/inventory` | несколько запросов, см. ниже | Строки отчёта «Raporty» |

**Отчёт `/api/reports/inventory`** собирается на стороне Next.js: берётся список партий, затем для каждой партии параллельно (не больше 8 одновременно) запрашиваются её детали и ревизии. Это 2 доп. запроса на партию — при большом числе партий отчёт стоит перенести в один эндпоинт бэкенда. Формат строки — `types/report.ts`.

## Страницы

Все страницы приложения лежат в группе `app/(private routes)/` и используют общий layout с Header и Footer.

| Путь | Что на странице |
|---|---|
| `/sprzedawca` | Главная: сводка по складу и меню разделов. С `?barcode=...` показывает экран «Товар найден» и приёмку |
| `/scan` | Сканер штрихкода камерой, ручной ввод кода |
| `/months` | Сроки годности по месяцам |
| `/expiring` | Короткий срок: просроченные, до 3 / 7 / 30 дней, позже |
| `/products` | Список партий с поиском и пагинацией (`?year=&month=`, `?filter=expired\|later`) |
| `/inventory/[intakeId]` | Карточка партии: уценка, списание, ревизии |
| `/reports` | Аналитика и инвентаризация: таблица с фильтрами, сортировкой и экспортом CSV |

`/scan` и экран «Товар найден» — полноэкранные мобильные сценарии, Header и Footer на них скрыты (`components/AppChrome/ChromeGate.tsx`).

## Структура проекта

```
actions/            server actions (смена языка)
app/
  (private routes)/ страницы приложения + общий layout (Header / Footer)
  api/              API-маршруты Next.js — прокси к бэкенду
  globals.css       глобальные стили, токены типографики и брейкпоинты
  layout.tsx        корневой layout: шрифт, переводы
components/         переиспользуемые компоненты (Header, Footer, ProductCard, модалки...)
i18n/request.ts     выбор языка по cookie
lib/api/            axios-клиент и функции запросов для браузера
messages/           переводы: pl.json, en.json, ru.json
types/              общие типы
```

## Переводы

- Языки: `pl` (по умолчанию), `en`, `ru`. Выбранный язык хранится в cookie `locale`, переключается компонентом `LanguageSwitcher` в Header.
- Все тексты интерфейса — в `messages/*.json`; в компонентах используется `useTranslations("Namespace")`.
- **Не пишите текст прямо в компонентах.** Добавляйте ключ сразу во все три файла `messages/pl.json`, `en.json`, `ru.json`.

## Стили

- **CSS Modules** рядом с компонентами (`*.module.css`). Tailwind используется точечно (например, `app/loading.tsx`).
- **Типографика** — токены в `app/globals.css` (`--type-title-*`, `--type-heading-*`, `--type-body-*` и т. д.). Эталон стиля — страница `/sprzedawca`. Используйте токены вместо жёстких размеров шрифта.
- **Брейкпоинты** (mobile-first):

  | Устройство | Ширина | Навигация |
  |---|---|---|
  | Мобилка | 320–767px, резиновая | Нижняя панель |
  | Планшет | `@media (min-width: 768px)` | Нижняя панель |
  | Десктоп | `@media (min-width: 1440px)` | Боковое меню из иконок слева; контент ограничен 1440px |

  Связанные переменные в `globals.css`: `--app-max-width`, `--sidebar-width`, `--mobile-column-width`.

## Известные проблемы

- `npm run build` падает на ошибке TypeScript в `components/BarcodeScanner/BarcodeScanner.tsx` (конструктору `Html5Qrcode` не хватает поля `verbose`). В `npm run dev` приложение работает.
- ESLint ругается на `setState` внутри `useEffect` в том же `BarcodeScanner.tsx`.
- Вкладка «Więcej» ведёт на `/more` — такой страницы пока нет (404).
- В отчёте нет данных о расходе (Zużycie) и ставках VAT (Brutto / Netto) — в базе их пока нет, колонки показывают «—» / «No data».
- `app/api/shope/*` и `components/ServicesGrid`, `components/Hero` — остатки шаблона, в приложении не используются.
