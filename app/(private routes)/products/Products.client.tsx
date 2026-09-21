"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowLeft } from "lucide-react";
import { ProductCard, IntakeItem } from "@/components/ProductCard/ProductCard";
import { Pagination } from "@/components/Pagination/Pagination";
import styles from "./Products.module.css";
import { getAllIntakes } from "@/lib/api/clientApi";

const ITEMS_PER_PAGE = 5;

export default function ProductsClient() {
  const router = useRouter();
  const [intakes, setIntakes] = useState<IntakeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Получение данных с сервера
  useEffect(() => {
    const fetchIntakes = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getAllIntakes();

        if (response?.status === "success" && Array.isArray(response.data)) {
          setIntakes(response.data);
        }
      } catch (err) {
        console.error("Ошибка загрузки данных:", err);
        setError("Не удалось загрузить список товаров");
      } finally {
        setLoading(false);
      }
    };

    fetchIntakes();
  }, []);

  // Поисковая фильтрация по названию или штрихкоду
  const filteredProducts = useMemo(() => {
    return intakes.filter((item) => {
      const name = item.productId?.name?.toLowerCase() || "";
      const barcode = item.productId?.barcode || "";
      const query = searchQuery.toLowerCase().trim();

      return name.includes(query) || barcode.includes(query);
    });
  }, [intakes, searchQuery]);

  // Расчет страниц пагинации
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
      {/* Шапка */}
      <header className={styles.header}>
        <button
          className={styles.backButton}
          onClick={() => router.push("/sprzedawca")}
        >
          <ArrowLeft size={22} />
        </button>
        <div>
          <h1 className={styles.title}>Все товары</h1>
          <p className={styles.subtitle}>
            Всего: {filteredProducts.length} позиций
          </p>
        </div>
      </header>

      {/* Поле поиска */}
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

      {/* Контент списка */}
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

      {/* Пагинация */}
      {!loading && !error && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      )}

      {/* Кнопка "ФИЛЬТРЫ" */}
      <div className={styles.bottomBar}>
        <button className={styles.filterButton}>ФИЛЬТРЫ</button>
      </div>
    </div>
  );
}
