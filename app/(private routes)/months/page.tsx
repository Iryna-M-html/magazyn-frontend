"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import {
  getAllIntakes,
  IntakeItem,
  IntakesListResponse,
} from "@/lib/api/clientApi";

import {
  XCircle,
  Calendar,
  SlidersHorizontal,
  Home,
  Search,
  FileText,
  MoreHorizontal,
  ChevronRight,
  ArrowLeft, // ⭐ ИЗМЕНЕНИЕ: добавили стрелку назад
} from "lucide-react";

import styles from "./Months.module.css";
const PERIOD_COLORS = [
  { bg: "#FEE2E2", text: "#991B1B", icon: "#EF4444" },
  { bg: "#FFEDD5", text: "#9A3412", icon: "#F97316" },
  { bg: "#FEF3C7", text: "#92400E", icon: "#F59E0B" },
  { bg: "#DCFCE7", text: "#166534", icon: "#22C55E" },
  { bg: "#E0F2FE", text: "#075985", icon: "#0EA5E9" },
  { bg: "#F3E8FF", text: "#6B21A8", icon: "#A855F7" },
  { bg: "#F1F5F9", text: "#334155", icon: "#64748B" },
];
interface PeriodGroup {
  id: string;
  label: string;
  year?: number;
  month?: number;
  count: number;
  colorScheme: (typeof PERIOD_COLORS)[0];
  isExpired?: boolean;
  isLater?: boolean;
}
export default function MonthsPage() {
  const router = useRouter();
  const t = useTranslations("Months");
  const [items, setItems] = useState<IntakeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const monthNames = [
    t("months.january"),
    t("months.february"),
    t("months.march"),
    t("months.april"),
    t("months.may"),
    t("months.june"),
    t("months.july"),
    t("months.august"),
    t("months.september"),
    t("months.october"),
    t("months.november"),
    t("months.december"),
  ];

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);

        const res: IntakesListResponse = await getAllIntakes();

        if (cancelled) return;

        if (res && res.status === "success" && Array.isArray(res.data)) {
          setItems(res.data);
        } else {
          setItems([]);
        }
      } catch (err) {
        console.error("Ошибка при загрузке данных:", err);

        if (!cancelled) {
          setItems([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();
    const interval = setInterval(() => {
      fetchData();
    }, 5000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // ============================================================
  // ФОРМИРОВАНИЕ ПЕРИОДОВ
  // ============================================================

  const periods = useMemo<PeriodGroup[]>(() => {
    const now = new Date();

    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const list: PeriodGroup[] = [];

    // ==========================================================
    // ПРОСРОЧЕНО
    // ==========================================================

    list.push({
      id: "expired",
      label: t("expired"),
      count: 0,
      colorScheme: PERIOD_COLORS[0],
      isExpired: true,
    });

    // ==========================================================
    // ТЕКУЩИЙ МЕСЯЦ + СЛЕДУЮЩИЕ 4 МЕСЯЦА
    // ==========================================================

    for (let i = 0; i < 5; i++) {
      const date = new Date(currentYear, currentMonth + i, 1);

      const year = date.getFullYear();
      const month = date.getMonth();

      const colorIndex = Math.min(i + 1, PERIOD_COLORS.length - 2);

      list.push({
        id: `${year}-${month}`,
        label: `${monthNames[month]} ${year}`,
        year,
        month,
        count: 0,
        colorScheme: PERIOD_COLORS[colorIndex],
      });
    }

    // ==========================================================
    // ПОЗЖЕ
    // ==========================================================

    list.push({
      id: "later",
      label: t("later"),
      count: 0,
      colorScheme: PERIOD_COLORS[PERIOD_COLORS.length - 1],
      isLater: true,
    });

    // ==========================================================
    // НАЧАЛО ТЕКУЩЕГО МЕСЯЦА
    // ==========================================================

    const startOfCurrentMonth = new Date(currentYear, currentMonth, 1);

    // ==========================================================
    // НАЧАЛО ПЕРИОДА "ПОЗЖЕ"
    // ==========================================================

    const startOfLater = new Date(currentYear, currentMonth + 5, 1);

    // ==========================================================
    // РАСПРЕДЕЛЯЕМ ТОВАРЫ
    // ==========================================================

    items.forEach((item) => {
      if (!item.expirationDate) {
        return;
      }

      const expDate = new Date(item.expirationDate);

      if (Number.isNaN(expDate.getTime())) {
        return;
      }

      const expYear = expDate.getFullYear();
      const expMonth = expDate.getMonth();

      // Просрочено
      if (expDate < startOfCurrentMonth) {
        list[0].count += 1;
        return;
      }

      // Текущий месяц + 4 следующих
      let matched = false;

      for (let i = 1; i <= 5; i++) {
        const period = list[i];

        if (period.year === expYear && period.month === expMonth) {
          period.count += 1;
          matched = true;
          break;
        }
      }

      // Позже
      if (!matched && expDate >= startOfLater) {
        list[list.length - 1].count += 1;
      }
    });

    return list;
  }, [items, t, monthNames]);
  const handleGroupClick = (period: PeriodGroup) => {
    if (period.isExpired) {
      router.push("/products?filter=expired");
      return;
    }
    if (period.year !== undefined && period.month !== undefined) {
      router.push(`/products?year=${period.year}&month=${period.month + 1}`);
      return;
    }
    if (period.isLater) {
      router.push("/products?filter=later");
    }
  };
  const handleBackToHome = () => {
    router.push("/sprzedawca");
  };
  const getPeriodIcon = (period: PeriodGroup) => {
    if (period.isExpired) {
      return <XCircle size={18} />;
    }
    if (period.isLater) {
      return <MoreHorizontal size={20} />;
    }

    return <Calendar size={18} />;
  };
  return (
    <div className={styles.container}>
      {/* ================= ВЕРХНЯЯ ШАПКА ================= */}

      <header className={styles.header}>
        {/* ⭐ ИЗМЕНЕНИЕ: кнопка со стрелкой */}
        <button
          type="button"
          className={styles.backButton}
          onClick={handleBackToHome}
          aria-label={t("backToHome")}
        >
          <ArrowLeft size={22} />
        </button>

        {/* Заголовок */}
        <h1 className={styles.title}>{t("title")}</h1>

        {/* Кнопка фильтра */}
        <button
          type="button"
          className={styles.filterBtn}
          aria-label={t("filter")}
          onClick={() => router.push("/products")}
        >
          <SlidersHorizontal size={22} />
        </button>
      </header>

      {/* ================= ОСНОВНОЙ КОНТЕНТ ================= */}

      <main className={styles.content}>
        {loading ? (
          <div className={styles.loader}>{t("loading")}</div>
        ) : (
          <div className={styles.list}>
            {periods.map((period) => (
              <button
                key={period.id}
                type="button"
                className={styles.card}
                onClick={() => handleGroupClick(period)}
                style={{
                  backgroundColor: period.colorScheme.bg,
                  color: period.colorScheme.text,
                }}
              >
                <div className={styles.cardLeft}>
                  <div
                    className={styles.iconCircle}
                    style={{
                      backgroundColor: `${period.colorScheme.icon}20`,
                      color: period.colorScheme.icon,
                    }}
                  >
                    {getPeriodIcon(period)}
                  </div>

                  <span className={styles.cardLabel}>{period.label}</span>
                </div>

                <div className={styles.cardRight}>
                  <span className={styles.badgeCount}>{period.count}</span>

                  <ChevronRight size={20} />
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      {/* ================= НИЖНЯЯ НАВИГАЦИЯ ================= */}

      <nav className={styles.bottomNav}>
        <button
          type="button"
          className={styles.navTab}
          onClick={() => router.push("/")}
        >
          <Home size={20} />
          <span>{t("home")}</span>
        </button>

        <button
          type="button"
          className={styles.navTab}
          onClick={() => router.push("/products")}
        >
          <Search size={20} />
          <span>{t("search")}</span>
        </button>

        <button
          type="button"
          className={styles.navTab}
          onClick={() => router.push("/reports")}
        >
          <FileText size={20} />
          <span>{t("reports")}</span>
        </button>

        <button
          type="button"
          className={styles.navTab}
          onClick={() => router.push("/more")}
        >
          <MoreHorizontal size={20} />
          <span>{t("more")}</span>
        </button>
      </nav>
    </div>
  );
}
