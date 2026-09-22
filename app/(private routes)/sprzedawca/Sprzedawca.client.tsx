"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { ProductFoundClient } from "@/components/ProductFoundClient/ProductFoundClient";
import IntakeStatBlock, {
  IntakeItem,
} from "@/components/IntakeStatBlock/IntakeStatBlock";

import { getAllIntakes, IntakesListResponse } from "@/lib/api/clientApi";

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

  // Все партии товаров
  const [items, setItems] = useState<IntakeItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Загрузка партий
  useEffect(() => {
    let cancelled = false;

    const fetchIntakes = async () => {
      try {
        setLoading(true);

        const res: IntakesListResponse = await getAllIntakes();

        if (cancelled) return;

        if (res && res.status === "success" && Array.isArray(res.data)) {
          setItems(res.data as IntakeItem[]);
        } else {
          setItems([]);
        }
      } catch (error) {
        console.error("Ошибка загрузки партий:", error);

        if (!cancelled) {
          setItems([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchIntakes();

    return () => {
      cancelled = true;
    };
  }, []);

  // Если в URL есть barcode,
  // показываем страницу найденного товара
  if (barcode) {
    return <ProductFoundClient />;
  }

  return (
    <div className={styles.container}>
      {/* ================= ШАПКА ================= */}

      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Logo />

          <div>
            <h1 className={styles.title}>Статистика магазина</h1>

            <p className={styles.subtitle}>Учёт сроков годности</p>
          </div>
        </div>

        <button
          type="button"
          aria-label="Настройки"
          className={styles.settingsButton}
        >
          <Settings size={20} />
        </button>
      </header>

      {/* ================= КОНТЕНТ ================= */}

      <div className={styles.content}>
        {/* ================= ОБЗОР СКЛАДА ================= */}

        <section className={styles.statsCard}>
          <div className={styles.statsHeader}>
            <span
              className={styles.sectionTitle}
              style={{
                paddingLeft: 0,
                marginBottom: 0,
              }}
            >
              Обзор склада
            </span>

            <span className={styles.badge}>
              <TrendingUp size={12} />В норме
            </span>
          </div>

          <div className={styles.gridTwoCols}>
            {/* Всего партий */}

            <div className={styles.statBox}>
              {loading ? (
                <>
                  <div className={styles.statLabel}>Всего партий (шт)</div>

                  <div className={styles.statValue}>...</div>

                  <div className={styles.statSubtext}>позиций на складе</div>
                </>
              ) : (
                <IntakeStatBlock
                  intakes={items}
                  label="Всего партий (шт)"
                  subtext="позиций на складе"
                />
              )}
            </div>

            {/* Скоро истекает */}

            <div className={styles.statBoxWarning}>
              <div className={styles.statLabelWarning}>Скоро истекает</div>

              <div className={styles.statValueWarning}>12</div>

              <div className={styles.statSubtextWarning}>
                в ближайшие 7 дней
              </div>
            </div>
          </div>
        </section>

        {/* ================= ГЛАВНОЕ МЕНЮ ================= */}

        <section>
          <h2 className={styles.sectionTitle}>Главное меню</h2>

          <div className={styles.menuList}>
            {/* Сканировать товар */}

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

            {/* Сроки по месяцам */}

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

            {/* Скоро истекает */}

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

            {/* Все товары */}

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

      {/* ================= НИЖНЯЯ НАВИГАЦИЯ ================= */}

      <nav className={styles.bottomNav} aria-label="Основная навигация">
        <Link href="/" className={styles.navTabActive}>
          <Home size={20} />

          <span className={styles.navLabel}>Главная</span>
        </Link>

        <Link href="/products" className={styles.navTab}>
          <BarChart3 size={20} />

          <span className={styles.navLabel}>Товары</span>
        </Link>

        <Link href="/reports" className={styles.navTab}>
          <FileText size={20} />

          <span className={styles.navLabel}>Отчёты</span>
        </Link>

        <Link href="/more" className={styles.navTab}>
          <MoreHorizontal size={20} />

          <span className={styles.navLabel}>Ещё</span>
        </Link>
      </nav>
    </div>
  );
};

export default SprzedawcaClient;
