"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Camera, Search } from "lucide-react";
import { getProductByBarcode } from "@/app/lib/api/clientApi";
import styles from "./SprzedawcaClient.module.css";

export default function SprzedawcaClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [barcodeInput, setBarcodeInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [product, setProduct] = useState<any>(null);

  // 1. Отслеживаем появление параметра `barcode` в URL после сканирования
  useEffect(() => {
    const barcodeFromUrl = searchParams.get("barcode");
    if (barcodeFromUrl) {
      setBarcodeInput(barcodeFromUrl);
      fetchProduct(barcodeFromUrl);
    }
  }, [searchParams]);

  // Функция запроса данных товара
  const fetchProduct = async (code: string) => {
    setLoading(true);
    setErrorMessage("");
    try {
      const result = await getProductByBarcode(code);
      if (result.status === "success" && result.data) {
        setProduct(result.data);
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        if (
          confirm(
            `Товар со штрихкодом ${code} не найден. Добавить его вручную?`,
          )
        ) {
          router.push(`/(private routes)/sprzedawca/create?barcode=${code}`);
        }
      } else {
        setErrorMessage(
          error.response?.data?.message || "Ошибка при поиске товара",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Переход на экран сканирования
  const handleOpenScanner = () => {
    router.push("/scan");
  };

  // Ручной поиск по кнопке/Enter
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (barcodeInput.trim()) {
      fetchProduct(barcodeInput.trim());
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Панель продавца</h1>
      </header>

      <main className={styles.mainContent}>
        {/* Блок сканирования и поиска */}
        <div className={styles.searchSection}>
          <button
            type="button"
            className={styles.scanButton}
            onClick={handleOpenScanner}
          >
            <Camera size={24} />
            <span>Сканировать штрихкод</span>
          </button>

          <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Или введите штрихкод..."
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
            />
            <button
              type="submit"
              className={styles.searchBtn}
              disabled={loading}
            >
              <Search size={20} />
            </button>
          </form>
        </div>

        {/* Статусы загрузки и ошибок */}
        {loading && (
          <div className={styles.loading}>Загрузка информации о товаре...</div>
        )}
        {errorMessage && <div className={styles.error}>{errorMessage}</div>}

        {/* Карточка найденного товара */}
        {product && (
          <div className={styles.productCard}>
            <h2>{product.name}</h2>
            <p>
              <strong>Штрихкод:</strong> {product.barcode}
            </p>
            {product.brand && (
              <p>
                <strong>Бренд:</strong> {product.brand}
              </p>
            )}
            {product.product_quantity && (
              <p>
                <strong>Объем/Вес:</strong> {product.product_quantity}{" "}
                {product.product_quantity_unit}
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
