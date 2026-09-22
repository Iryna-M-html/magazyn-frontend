"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, ArrowLeft } from "lucide-react";
import { ProductCard, IntakeItem } from "@/components/ProductCard/ProductCard";
import { Pagination } from "@/components/Pagination/Pagination";
import styles from "./Products.module.css";
import { getAllIntakes } from "@/lib/api/clientApi";

const ITEMS_PER_PAGE = 5;

const MONTH_NAMES = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

export default function ProductsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const yearParam = searchParams.get("year");
  const monthParam = searchParams.get("month");
  const filterParam = searchParams.get("filter");

  const [intakes, setIntakes] = useState<IntakeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

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
        setError("Не удалось загрузить список товаров");
        setIntakes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchIntakes();
  }, [yearParam, monthParam, filterParam]);

  const pageTitle = useMemo(() => {
    if (yearParam && monthParam) {
      const monthIndex = Number(monthParam) - 1;
      const monthName = MONTH_NAMES[monthIndex] || monthParam;

      return `Товары: ${monthName} ${yearParam}`;
    }

    if (filterParam === "expired") {
      return "Просроченные товары";
    }

    if (filterParam === "later") {
      return "Товары со сроком позже";
    }

    return "Все товары";
  }, [yearParam, monthParam, filterParam]);

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

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button
          className={styles.backButton}
          onClick={() => router.push("/sprzedawca")}
        >
          <ArrowLeft size={22} />
        </button>

        <div>
          <h1 className={styles.title}>{pageTitle}</h1>

          <p className={styles.subtitle}>
            Всего: {filteredProducts.length} позиций
          </p>
        </div>
      </header>

      <div className={styles.searchBox}>
        <Search size={18} className={styles.searchIcon} />

        <input
          type="text"
          placeholder="Поиск по названию или коду"
          value={searchQuery}
          onChange={handleSearchChange}
          className={styles.searchInput}
        />
      </div>

      {loading ? (
        <div className={styles.emptyState}>Загрузка товаров...</div>
      ) : error ? (
        <div className={styles.errorState}>{error}</div>
      ) : (
        <div className={styles.productList}>
          {paginatedProducts.length > 0 ? (
            paginatedProducts.map((item) => (
              <ProductCard key={item._id} item={item} />
            ))
          ) : (
            <div className={styles.emptyState}>Товары не найдены</div>
          )}
        </div>
      )}

      {!loading && !error && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      <div className={styles.bottomBar}>
        <button className={styles.filterButton}>ФИЛЬТРЫ</button>
      </div>
    </div>
  );
}
