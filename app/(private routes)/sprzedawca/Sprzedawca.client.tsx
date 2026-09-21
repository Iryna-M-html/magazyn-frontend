"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ProductFoundClient } from "@/components/ProductFoundClient/ProductFoundClient";
import {
  QrCode,
  CalendarDays,
  AlertTriangle,
  Package,
  Settings,
  TrendingUp,
  ChevronRight,
  Home,
  BarChart3,
  FileText,
  MoreHorizontal,
} from "lucide-react";

import styles from "./Sprzedawca.module.css";

// SVG Логотип
const Logo = () => (
  <svg
    width="36"
    height="36"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3B82F6" />
        <stop offset="50%" stopColor="#8B5CF6" />
        <stop offset="100%" stopColor="#EC4899" />
      </linearGradient>
    </defs>
    <path
      d="M 50 85 L 15 50 L 32 30 L 50 48 L 68 30 L 85 50 Z"
      stroke="url(#logo-gradient)"
      strokeWidth="10"
      strokeLinejoin="round"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M 33 45 L 50 28 L 67 45"
      stroke="#1E293B"
      strokeWidth="9"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

const SprzedawcaClient = () => {
  const searchParams = useSearchParams();
  const barcode = searchParams.get("barcode");

  // Если в URL передан barcode, отображаем карточку найденного товара "3. ТОВАР НАЙДЕН"
  if (barcode) {
    return <ProductFoundClient />;
  }

  // Если штрихкода нет — показываем главную панель "Статистика магазина"
  return (
    <div className={styles.container}>
      {/* Шапка */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Logo />
          <div>
            <h1 className={styles.title}>Статистика магазина</h1>
            <p className={styles.subtitle}>Учёт сроков годности</p>
          </div>
        </div>
        <button aria-label="Настройки" className={styles.settingsButton}>
          <Settings size={20} />
        </button>
      </header>

      {/* Контент */}
      <div className={styles.content}>
        {/* Карточка статистики склада */}
        <section className={styles.statsCard}>
          <div className={styles.statsHeader}>
            <span
              className={styles.sectionTitle}
              style={{ paddingLeft: 0, marginBottom: 0 }}
            >
              Обзор склада
            </span>
            <span className={styles.badge}>
              <TrendingUp size={12} /> В норме
            </span>
          </div>
          <div className={styles.gridTwoCols}>
            <div className={styles.statBox}>
              <div className={styles.statLabel}>Всего товаров</div>
              <div className={styles.statValue}>230</div>
              <div className={styles.statSubtext}>позиций на складе</div>
            </div>
            <div className={styles.statBoxWarning}>
              <div className={styles.statLabelWarning}>Скоро истекает</div>
              <div className={styles.statValueWarning}>12</div>
              <div className={styles.statSubtextWarning}>
                в ближайшие 7 дней
              </div>
            </div>
          </div>
        </section>

        {/* Главное меню */}
        <section>
          <h2 className={styles.sectionTitle}>Главное меню</h2>

          <div className={styles.menuList}>
            {/* 1. Сканировать товар */}
            <Link
              href="/scan"
              className={`${styles.menuCard} ${styles.btnScan}`}
            >
              <div className={styles.menuCardLeft}>
                <div className={styles.iconWrapper}>
                  <QrCode size={24} />
                </div>
                <div>
                  <div className={styles.menuTitle}>СКАНИРОВАТЬ ТОВАР</div>
                  <div className={styles.menuSubtitle}>
                    Добавить товар по штрихкоду
                  </div>
                </div>
              </div>
              <ChevronRight size={20} opacity={0.7} />
            </Link>

            {/* 2. Сроки по месяцам */}
            <Link
              href="/months"
              className={`${styles.menuCard} ${styles.btnMonths}`}
            >
              <div className={styles.menuCardLeft}>
                <div className={styles.iconWrapper}>
                  <CalendarDays size={24} />
                </div>
                <div>
                  <div className={styles.menuTitle}>СРОКИ ПО МЕСЯЦАМ</div>
                  <div className={styles.menuSubtitle}>Смотреть по месяцам</div>
                </div>
              </div>
              <ChevronRight size={20} opacity={0.7} />
            </Link>

            {/* 3. Скоро истекает */}
            <Link
              href="/expiring"
              className={`${styles.menuCard} ${styles.btnExpiring}`}
            >
              <div className={styles.menuCardLeft}>
                <div className={styles.iconWrapper}>
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <div className={styles.menuTitle}>СКОРО ИСТЕКАЕТ</div>
                  <div className={styles.menuSubtitle}>
                    Товары с критическим сроком
                  </div>
                </div>
              </div>
              <ChevronRight size={20} opacity={0.7} />
            </Link>

            {/* 4. Все товары */}
            <Link
              href="/products"
              className={`${styles.menuCard} ${styles.btnProducts}`}
            >
              <div className={styles.menuCardLeft}>
                <div className={styles.iconWrapper}>
                  <Package size={24} />
                </div>
                <div>
                  <div className={styles.menuTitle}>ВСЕ ТОВАРЫ</div>
                  <div className={styles.menuSubtitle}>
                    Полный список товаров
                  </div>
                </div>
              </div>
              <ChevronRight size={20} opacity={0.7} />
            </Link>
          </div>
        </section>
      </div>

      {/* Нижняя навигация */}
      <nav className={styles.bottomNav}>
        <button className={styles.navTabActive}>
          <Home size={20} />
          <span className={styles.navLabel}>Главная</span>
        </button>
        <button className={styles.navTab}>
          <BarChart3 size={20} />
          <span className={styles.navLabel}>Товары</span>
        </button>
        <button className={styles.navTab}>
          <FileText size={20} />
          <span className={styles.navLabel}>Отчёты</span>
        </button>
        <button className={styles.navTab}>
          <MoreHorizontal size={20} />
          <span className={styles.navLabel}>Ещё</span>
        </button>
      </nav>
    </div>
  );
};

export default SprzedawcaClient;
