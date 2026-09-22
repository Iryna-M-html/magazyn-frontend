"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getAllIntakes,
  IntakeItem,
  IntakesListResponse,
} from "@/lib/api/clientApi";

import {
  XCircle,
  Clock,
  Calendar,
  AlertTriangle,
  SlidersHorizontal,
  Home,
  Search,
  FileText,
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

import { ProductCard } from "@/components/ProductCard/ProductCard";

import styles from "./ExpiringSoon.module.css";

const PERIOD_COLORS = {
  expired: {
    bg: "#FEE2E2",
    text: "#991B1B",
    icon: "#EF4444",
  },

  days3: {
    bg: "#FFEDD5",
    text: "#9A3412",
    icon: "#F97316",
  },

  days7: {
    bg: "#FEF3C7",
    text: "#92400E",
    icon: "#F59E0B",
  },

  days30: {
    bg: "#E0F2FE",
    text: "#075985",
    icon: "#0EA5E9",
  },

  later: {
    bg: "#F1F5F9",
    text: "#334155",
    icon: "#64748B",
  },
};

type PeriodRangeKey =
  | "all"
  | "expired"
  | "3days"
  | "7days"
  | "30days"
  | "later";

interface PeriodGroup {
  id: Exclude<PeriodRangeKey, "all">;
  label: string;
  count: number;

  colorScheme: {
    bg: string;
    text: string;
    icon: string;
  };
}

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

export default function ExpiringDaysPage() {
  const router = useRouter();
  const [items, setItems] = useState<IntakeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openPeriod, setOpenPeriod] = useState<PeriodRangeKey | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        setLoading(true);
        const res: IntakesListResponse = await getAllIntakes();
        if (cancelled) {
          return;
        }
        if (res && res.status === "success" && Array.isArray(res.data)) {
          setItems(res.data);
        } else {
          setItems([]);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Ошибка при загрузке товаров:", error);

          setItems([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, []);
  const dateLimits = useMemo(() => {
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

    const endOf3Days = new Date(startOfToday);
    endOf3Days.setDate(endOf3Days.getDate() + 3);
    const endOf7Days = new Date(startOfToday);
    endOf7Days.setDate(endOf7Days.getDate() + 7);
    const endOf30Days = new Date(startOfToday);
    endOf30Days.setDate(endOf30Days.getDate() + 30);
    return {
      startOfToday,
      endOf3Days,
      endOf7Days,
      endOf30Days,
    };
  }, []);

  const periods = useMemo<PeriodGroup[]>(() => {
    const { startOfToday, endOf3Days, endOf7Days, endOf30Days } = dateLimits;

    const list: PeriodGroup[] = [
      {
        id: "expired",
        label: "Просрочено",
        count: 0,
        colorScheme: PERIOD_COLORS.expired,
      },
      {
        id: "3days",
        label: "До 3 дней",
        count: 0,
        colorScheme: PERIOD_COLORS.days3,
      },
      {
        id: "7days",
        label: "До 7 дней",
        count: 0,
        colorScheme: PERIOD_COLORS.days7,
      },
      {
        id: "30days",
        label: "До 30 дней",
        count: 0,
        colorScheme: PERIOD_COLORS.days30,
      },
      {
        id: "later",
        label: "Более 30 дней",
        count: 0,
        colorScheme: PERIOD_COLORS.later,
      },
    ];
    items.forEach((item) => {
      const expirationDate = parseExpirationDate(item.expirationDate);
      if (!expirationDate) {
        return;
      }
      if (expirationDate < startOfToday) {
        list[0].count += 1;
        return;
      }
      // До 3 дней
      if (expirationDate < endOf3Days) {
        list[1].count += 1;
        return;
      }
      // До 7 дней
      if (expirationDate < endOf7Days) {
        list[2].count += 1;
        return;
      }
      // До 30 дней
      if (expirationDate < endOf30Days) {
        list[3].count += 1;
        return;
      }
      // Более 30 дней
      list[4].count += 1;
    });

    return list;
  }, [items, dateLimits]);
  const getItemsForPeriod = (periodId: PeriodRangeKey): IntakeItem[] => {
    const { startOfToday, endOf3Days, endOf7Days, endOf30Days } = dateLimits;

    return items.filter((item) => {
      const expirationDate = parseExpirationDate(item.expirationDate);

      if (!expirationDate) {
        return false;
      }
      switch (periodId) {
        case "expired":
          return expirationDate < startOfToday;
        case "3days":
          return expirationDate >= startOfToday && expirationDate < endOf3Days;
        case "7days":
          return expirationDate >= endOf3Days && expirationDate < endOf7Days;
        case "30days":
          return expirationDate >= endOf7Days && expirationDate < endOf30Days;
        case "later":
          return expirationDate >= endOf30Days;
        default:
          return items;
      }
    });
  };

  const handleGroupClick = (periodId: PeriodRangeKey) => {
    setOpenPeriod((current) => (current === periodId ? null : periodId));
  };
  const getPeriodIcon = (id: PeriodRangeKey) => {
    const iconProps = {
      size: 18,
      strokeWidth: 2,
      "aria-hidden": true,
    };
    switch (id) {
      case "expired":
        return <XCircle {...iconProps} />;
      case "3days":
        return <AlertTriangle {...iconProps} />;
      case "7days":
        return <Clock {...iconProps} />;
      case "30days":
        return <Calendar {...iconProps} />;
      case "later":
        return <Calendar {...iconProps} />;
      default:
        return <Calendar {...iconProps} />;
    }
  };
  const goHome = () => {
    router.push("/");
  };
  const goProducts = () => {
    router.push("/products");
  };
  const goReports = () => {
    router.push("/reports");
  };
  const goMore = () => {
    router.push("/more");
  };
  const handleOpenFilters = () => {
    console.log("Открыть фильтры");
  };

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <button
          type="button"
          className={styles.headerBack}
          onClick={goProducts}
          aria-label="Вернуться к товарам"
        >
          <ChevronRight
            size={20}
            className={styles.backIcon}
            aria-hidden="true"
          />
        </button>
        <h1 className={styles.title}>Скоро истекает</h1>
        <button
          type="button"
          className={styles.filterButton}
          onClick={handleOpenFilters}
          aria-label="Фильтры"
        >
          <SlidersHorizontal size={20} aria-hidden="true" />
        </button>
      </header>
      <section className={styles.content}>
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.loadingSpinner} />

            <span>Загрузка данных...</span>
          </div>
        ) : (
          <div className={styles.periodList}>
            {periods.map((period) => {
              const isOpen = openPeriod === period.id;

              const periodItems = isOpen ? getItemsForPeriod(period.id) : [];

              return (
                <div key={period.id} className={styles.periodWrapper}>
                  <button
                    type="button"
                    className={`
                      ${styles.periodCard}
                      ${isOpen ? styles.activePeriod : ""}
                    `}
                    onClick={() => handleGroupClick(period.id)}
                    style={{
                      backgroundColor: period.colorScheme.bg,

                      color: period.colorScheme.text,
                    }}
                    aria-expanded={isOpen}
                  >
                    <div
                      className={styles.periodIcon}
                      style={{
                        color: period.colorScheme.icon,
                      }}
                    >
                      {getPeriodIcon(period.id)}
                    </div>
                    <div className={styles.periodInfo}>
                      <span className={styles.periodLabel}>{period.label}</span>
                      <span className={styles.periodCount}>{period.count}</span>
                    </div>
                    {isOpen ? (
                      <ChevronDown
                        size={18}
                        className={styles.periodArrow}
                        aria-hidden="true"
                      />
                    ) : (
                      <ChevronRight
                        size={18}
                        className={styles.periodArrow}
                        aria-hidden="true"
                      />
                    )}
                  </button>
                  {isOpen && (
                    <div className={styles.dropdown}>
                      {periodItems.length > 0 ? (
                        <div className={styles.productList}>
                          {periodItems.map((item) => (
                            <ProductCard key={item._id} item={item} />
                          ))}
                        </div>
                      ) : (
                        <div className={styles.emptyState}>
                          <Calendar
                            size={28}
                            strokeWidth={1.5}
                            aria-hidden="true"
                          />
                          <span>Товаров в этом периоде нет</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
      <nav className={styles.bottomNav} aria-label="Основная навигация">
        <button type="button" className={styles.navItem} onClick={goHome}>
          <Home size={21} aria-hidden="true" />
          <span>Главная</span>
        </button>
        <button type="button" className={styles.navItem} onClick={goProducts}>
          <Search size={21} aria-hidden="true" />
          <span>Поиск</span>
        </button>
        <button type="button" className={styles.navItem} onClick={goReports}>
          <FileText size={21} aria-hidden="true" />
          <span>Отчёты</span>
        </button>
        <button type="button" className={styles.navItem} onClick={goMore}>
          <MoreHorizontal size={21} aria-hidden="true" />
          <span>Ещё</span>
        </button>
      </nav>
    </main>
  );
}
