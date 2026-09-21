"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { BarcodeScanner } from "@/components/BarcodeScanner/BarcodeScanner";
import { ManualCodeModal } from "@/components/ManualCodeModal/ManualCodeModal";
import { getProductByBarcode } from "@/lib/api/clientApi";
import styles from "./Scan.module.css";

export default function ScanClient() {
  const router = useRouter();
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleBarcodeSubmit = async (barcode: string) => {
    setIsManualModalOpen(false);
    setLoading(true);
    setErrorMessage("");

    try {
      const result = await getProductByBarcode(barcode);

      if (result.status === "success" && result.data) {
        // Перенаправляем на страницу товара
        router.push(`/sprzedawca?barcode=${barcode}`);
      }
    } catch (error: unknown) {
      // ИСПРАВЛЕНИЕ: Безопасная проверка ошибки Axios вместо any
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          if (confirm("Товар не найден. Желаете добавить его вручную?")) {
            router.push(`/sprzedawca/create?barcode=${barcode}`);
          }
        } else {
          setErrorMessage(
            error.response?.data?.message || "Ошибка поиска товара",
          );
        }
      } else {
        setErrorMessage("Произошла неизвестная ошибка");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => router.back()}>
          ←
        </button>
        <span className={styles.headerTitle}>2. СКАНИРОВАНИЕ ШТРИХКОДА</span>
      </header>

      <main className={styles.scannerArea}>
        <BarcodeScanner onScanSuccess={handleBarcodeSubmit} />
        <div className={styles.instructionOverlay}>
          <p className={styles.instructionText}>
            Наведите камеру
            <br />
            на штрихкод товара
          </p>
        </div>
      </main>

      {loading && <div className={styles.statusToast}>Поиск товара...</div>}
      {errorMessage && <div className={styles.errorToast}>{errorMessage}</div>}

      <footer className={styles.footer}>
        <button
          className={styles.manualButton}
          onClick={() => setIsManualModalOpen(true)}
        >
          <span className={styles.keyboardIcon}>⌨</span>
          Ввести код вручную
        </button>
      </footer>

      <ManualCodeModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onSubmit={handleBarcodeSubmit}
      />
    </div>
  );
}
