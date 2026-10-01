"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { ProductFoundClient } from "@/components/ProductFoundClient/ProductFoundClient";

import IntakeStatBlock, {
  IntakeItem,
} from "@/components/IntakeStatBlock/IntakeStatBlock";

import { getAllIntakes, IntakesListResponse } from "@/lib/api/clientApi";

import { LanguageSwitcher } from "@/components/LanguageSwitcher/LanguageSwitcher";

import {
  QrCode,
  CalendarDays,
  AlertTriangle,
  Package,
  TrendingUp,
  ChevronRight,
  Home,
  BarChart3,
  FileText,
  MoreHorizontal,
} from "lucide-react";

import styles from "./Sprzedawca.module.css";
const Logo = () => (
  <svg
    width="36"
    height="36"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
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

function parseExpirationDate(dateStr?: string | null): Date | null {
  if (!dateStr) {
    return null;
  }

  const cleanDate = dateStr.split("T")[0];
  const parts = cleanDate.split("-");

  if (parts.length === 3) {
    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);

    if (
      Number.isInteger(year) &&
      Number.isInteger(month) &&
      Number.isInteger(day)
    ) {
      const date = new Date(year, month - 1, day, 0, 0, 0, 0);

      if (!Number.isNaN(date.getTime())) {
        return date;
      }
    }
  }

  const fallbackDate = new Date(dateStr);

  if (Number.isNaN(fallbackDate.getTime())) {
    return null;
  }
  return fallbackDate;
}

const SprzedawcaClient = () => {
  const searchParams = useSearchParams();

  const barcode = searchParams.get("barcode");

  const tHeader = useTranslations("Header");
  const tStats = useTranslations("Stats");
  const tMenu = useTranslations("Menu");
  const tNav = useTranslations("Navigation");

  const [items, setItems] = useState<IntakeItem[]>([]);
  const [loading, setLoading] = useState(true);
  // ==========================================================
  // ЗАГРУЗКА ПАРТИЙ
  // ==========================================================
  useEffect(() => {
    let cancelled = false;

    const fetchIntakes = async () => {
      try {
        const res: IntakesListResponse = await getAllIntakes();

        if (cancelled) {
          return;
        }

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

    // Обновляем данные каждые 5 секунд
    const interval = setInterval(() => {
      fetchIntakes();
    }, 5000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);
  const expiringSoonItems = useMemo(() => {
    const now = new Date();

    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0,
    );
    const endOf7Days = new Date(startOfToday);
    endOf7Days.setDate(endOf7Days.getDate() + 7);
    return items.filter((item) => {
      const expirationDate = parseExpirationDate(item.expirationDate);
      if (!expirationDate) {
        return false;
      }
      return expirationDate >= startOfToday && expirationDate < endOf7Days;
    });
  }, [items]);

  // ==========================================================
  // ЕСЛИ ЕСТЬ BARCODE
  // ==========================================================

  if (barcode) {
    return <ProductFoundClient />;
  }
  return (
    <div className={styles.container}>
      {/* ======================================================
          HEADER
      ====================================================== */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Logo />

          <div>
            <h1 className={styles.title}>{tHeader("title")}</h1>

            <p className={styles.subtitle}>{tHeader("subtitle")}</p>
          </div>
        </div>

        <div className={styles.headerRight}>
          <div className={styles.headerLanguageSwitcher}>
            <LanguageSwitcher />
          </div>
        </div>
      </header>
      <div className={styles.content}>
        {/* ====================================================
            ОБЗОР СКЛАДА
        ==================================================== */}
        <section className={styles.statsCard}>
          <div className={styles.statsHeader}>
            <span
              className={styles.sectionTitle}
              style={{
                paddingLeft: 0,
                marginBottom: 0,
              }}
            >
              {tStats("overview")}
            </span>

            <span className={styles.badge}>
              <TrendingUp size={12} />

              {tStats("inNorm")}
            </span>
          </div>

          <div className={styles.gridTwoCols}>
            {/* ==================================================
                ВСЕГО ПАРТИЙ
            ================================================== */}
            <div className={styles.statBox}>
              {loading ? (
                <>
                  <div className={styles.statLabel}>
                    {tStats("totalBatches")}
                  </div>

                  <div className={styles.statValue}>...</div>

                  <div className={styles.statSubtext}>
                    {tStats("warehouse")}
                  </div>
                </>
              ) : (
                <IntakeStatBlock
                  intakes={items}
                  label={tStats("totalBatches")}
                  subtext={tStats("warehouse")}
                />
              )}
            </div>
            <div className={styles.statBoxWarning}>
              {loading ? (
                <>
                  <div className={styles.statLabelWarning}>
                    {tStats("expiringSoon")}
                  </div>

                  <div className={styles.statValueWarning}>...</div>

                  <div className={styles.statSubtextWarning}>
                    {tStats("nextDays")}
                  </div>
                </>
              ) : (
                <Link href="/expiring" className={styles.expiringStatLink}>
                  <IntakeStatBlock
                    intakes={expiringSoonItems}
                    label={tStats("expiringSoon")}
                    subtext={tStats("nextDays")}
                  />
                </Link>
              )}
            </div>
          </div>
        </section>
        <section>
          <h2 className={styles.sectionTitle}>{tMenu("title")}</h2>

          <div className={styles.menuList}>
            {/* ==================================================
                СКАНИРОВАТЬ ТОВАР
            ================================================== */}

            <Link
              href="/scan"
              className={`${styles.menuCard} ${styles.btnScan}`}
            >
              <div className={styles.menuCardLeft}>
                <div className={styles.iconWrapper}>
                  <QrCode size={24} />
                </div>

                <div>
                  <div className={styles.menuTitle}>{tMenu("scanProduct")}</div>

                  <div className={styles.menuSubtitle}>
                    {tMenu("scanSubtitle")}
                  </div>
                </div>
              </div>

              <ChevronRight size={20} opacity={0.7} />
            </Link>

            {/* ==================================================
                СРОКИ ПО МЕСЯЦАМ
            ================================================== */}

            <Link
              href="/months"
              className={`${styles.menuCard} ${styles.btnMonths}`}
            >
              <div className={styles.menuCardLeft}>
                <div className={styles.iconWrapper}>
                  <CalendarDays size={24} />
                </div>

                <div>
                  <div className={styles.menuTitle}>{tMenu("months")}</div>

                  <div className={styles.menuSubtitle}>
                    {tMenu("monthsSubtitle")}
                  </div>
                </div>
              </div>

              <ChevronRight size={20} opacity={0.7} />
            </Link>

            {/* ==================================================
                СКОРО ИСТЕКАЕТ
            ================================================== */}

            <Link
              href="/expiring"
              className={`${styles.menuCard} ${styles.btnExpiring}`}
            >
              <div className={styles.menuCardLeft}>
                <div className={styles.iconWrapper}>
                  <AlertTriangle size={24} />
                </div>

                <div>
                  <div className={styles.menuTitle}>{tMenu("expiring")}</div>

                  <div className={styles.menuSubtitle}>
                    {tMenu("expiringSubtitle")}
                  </div>
                </div>
              </div>

              <ChevronRight size={20} opacity={0.7} />
            </Link>

            {/* ==================================================
                ВСЕ ТОВАРЫ
            ================================================== */}

            <Link
              href="/products"
              className={`${styles.menuCard} ${styles.btnProducts}`}
            >
              <div className={styles.menuCardLeft}>
                <div className={styles.iconWrapper}>
                  <Package size={24} />
                </div>

                <div>
                  <div className={styles.menuTitle}>{tMenu("allProducts")}</div>

                  <div className={styles.menuSubtitle}>
                    {tMenu("allProductsSubtitle")}
                  </div>
                </div>
              </div>

              <ChevronRight size={20} opacity={0.7} />
            </Link>
          </div>
        </section>
      </div>

      {/* ======================================================
          НИЖНЯЯ НАВИГАЦИЯ
      ====================================================== */}

      <nav className={styles.bottomNav} aria-label={tNav("main")}>
        <Link href="/" className={styles.navTabActive}>
          <Home size={20} />

          <span className={styles.navLabel}>{tNav("main")}</span>
        </Link>

        <Link href="/products" className={styles.navTab}>
          <BarChart3 size={20} />

          <span className={styles.navLabel}>{tNav("products")}</span>
        </Link>

        <Link href="/reports" className={styles.navTab}>
          <FileText size={20} />

          <span className={styles.navLabel}>{tNav("reports")}</span>
        </Link>

        <Link href="/more" className={styles.navTab}>
          <MoreHorizontal size={20} />

          <span className={styles.navLabel}>{tNav("more")}</span>
        </Link>
      </nav>
    </div>
  );
};

export default SprzedawcaClient;
