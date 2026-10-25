"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { ProductCard, IntakeItem } from "@/components/ProductCard/ProductCard";
import { Pagination } from "@/components/Pagination/Pagination";
import styles from "./Products.module.css";
import { getAllIntakes } from "@/lib/api/clientApi";

const ITEMS_PER_PAGE = 5;

const MONTH_KEYS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
] as const;

export default function ProductsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("Products");
  const tMonths = useTranslations("Months.months");

  const yearParam = searchParams.get("year");
  const monthParam = searchParams.get("month");
  const filterParam = searchParams.get("filter");

  const [intakes, setIntakes] = useState<IntakeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // ============================================================
  // ЗАГРУЗКА ТОВАРОВ
  // ============================================================

  useEffect(() => {
    const fetchIntakes = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getAllIntakes({
          year: yearParam || undefined,
          month: monthParam || undefined,
        });

        if (response?.status === "success" && Array.isArray(response.data)) {
          let data: IntakeItem[] = response.data;

          const now = new Date();

          if (filterParam === "expired") {
            data = data.filter((item) => {
              if (!item.expirationDate) return false;

              return new Date(item.expirationDate) < now;
            });
          }

          if (filterParam === "later") {
            const startOfLater = new Date(
              now.getFullYear(),
              now.getMonth() + 5,
              1,
            );

            data = data.filter((item) => {
              if (!item.expirationDate) return false;

              return new Date(item.expirationDate) >= startOfLater;
            });
          }

          setIntakes(data);
        } else {
          setIntakes([]);
        }
      } catch (err) {
        console.error("Ошибка загрузки данных:", err);
        setError(t("loadError"));
        setIntakes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchIntakes();
  }, [yearParam, monthParam, filterParam, t]);

  // ============================================================
  // ЗАГОЛОВОК СТРАНИЦЫ
  // ============================================================

  const pageTitle = useMemo(() => {
    if (yearParam && monthParam) {
      const monthIndex = Number(monthParam) - 1;
      const monthKey = MONTH_KEYS[monthIndex];
      const monthName = monthKey ? tMonths(monthKey) : monthParam;

      return t("monthTitle", { month: monthName, year: yearParam });
    }

    if (filterParam === "expired") {
      return t("expiredTitle");
    }

    if (filterParam === "later") {
      return t("laterTitle");
    }

    return t("allTitle");
  }, [yearParam, monthParam, filterParam, t, tMonths]);

  // ============================================================
  // ПОИСК
  // ============================================================

  const filteredProducts = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return intakes.filter((item) => {
      const name = item.productId?.name?.toLowerCase() || "";

      const barcode = item.productId?.barcode || "";

      return name.includes(query) || barcode.includes(query);
    });
  }, [intakes, searchQuery]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;

    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  // ============================================================
  // ⭐ ИЗМЕНЕНИЕ №1
  // Определяем, куда должна вести кнопка "Назад"
  // ============================================================

  const handleBack = () => {
    // Если товары открыты из раздела "Сроки по месяцам",
    // возвращаем пользователя обратно на страницу месяцев.
    if (
      (yearParam && monthParam) ||
      filterParam === "expired" ||
      filterParam === "later"
    ) {
      router.push("/months");
      return;
    }

    // Если это обычная страница "Все товары",
    // возвращаемся на главную страницу продавца.
    router.push("/sprzedawca");
  };

  return (
    <div className={styles.container}>
      {/* ========================================================
          HEADER
      ======================================================== */}

      <header className={styles.header}>
        <button
          type="button"
          className={styles.backButton}
          // ⭐ ИЗМЕНЕНИЕ №2
          // Вместо router.push("/sprzedawca")
          // используем нашу функцию handleBack
          onClick={handleBack}
        >
          <ArrowLeft size={22} />
        </button>

        <div>
          <h1 className={styles.title}>{pageTitle}</h1>

          <p className={styles.subtitle}>
            {t("total", { count: filteredProducts.length })}
          </p>
        </div>
      </header>

      {/* ========================================================
          ПОИСК
      ======================================================== */}

      <div className={styles.searchBox}>
        <Search size={18} className={styles.searchIcon} />

        <input
          type="text"
          placeholder={t("searchPlaceholder")}
          value={searchQuery}
          onChange={handleSearchChange}
          className={styles.searchInput}
        />
      </div>

      {/* ========================================================
          СПИСОК ТОВАРОВ
      ======================================================== */}

      {loading ? (
        <div className={styles.emptyState}>{t("loading")}</div>
      ) : error ? (
        <div className={styles.errorState}>{error}</div>
      ) : (
        <div className={styles.productList}>
          {paginatedProducts.length > 0 ? (
            paginatedProducts.map((item) => (
              <ProductCard key={item._id} item={item} />
            ))
          ) : (
            <div className={styles.emptyState}>{t("empty")}</div>
          )}
        </div>
      )}

      {/* ========================================================
          ПАГИНАЦИЯ
      ======================================================== */}

      {!loading && !error && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* ========================================================
          НИЖНЯЯ ПАНЕЛЬ
      ======================================================== */}

      <div className={styles.bottomBar}>
        <button className={styles.filterButton}>{t("filters")}</button>
      </div>
    </div>
  );
}
