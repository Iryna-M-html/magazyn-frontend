"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { useTranslations } from "next-intl";
import {
  getProductByBarcode,
  createInventoryIntake,
} from "@/lib/api/clientApi";
import { IntakeModal } from "./IntakeModal";
import styles from "./ProductFoundClient.module.css";

interface ProductData {
  id: string;
  name: string;
  barcode: string;
  brand?: string;
  imageUrl?: string;
  product_quantity?: number | null;
  product_quantity_unit?: string;
}

export function ProductFoundClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const barcode = searchParams.get("barcode");
  const t = useTranslations("ProductFound");
  const tCommon = useTranslations("Common");

  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isNotFound, setIsNotFound] = useState(false);
  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Получаем данные о товаре при изменении barcode в URL
  useEffect(() => {
    if (!barcode) {
      router.push("/scan");
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");
        setIsNotFound(false);
        const res = await getProductByBarcode(barcode);

        if (res.status === "success" && res.data) {
          setProduct(res.data);
        }
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setError(t("notFoundInDb"));
          setIsNotFound(true);
        } else {
          setError(t("fetchError"));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [barcode, router, t]);

  // Фиксация приёмки на бэкенде (POST /inventory/intake)
  const handleIntakeSubmit = async (data: {
    quantity: number;
    batch: string;
    expirationDate: string;
  }) => {
    if (!product) return;

    try {
      setIsSubmitting(true);

      await createInventoryIntake({
        productId: product.id,
        quantity: data.quantity,
        batch: data.batch,
        expirationDate: data.expirationDate,
      });

      alert(t("intakeSuccess"));
      setIsIntakeModalOpen(false);
      router.push("/sprzedawca"); // Возврат на главную панель после успешной приемки
    } catch (err) {
      console.error(err);
      alert(t("intakeError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.centeredState}>
        <div className={styles.spinner}></div>
        <p>{t("searching")}</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={styles.centeredState}>
        <p className={styles.errorText}>{error || t("notFound")}</p>
        <button
          className={styles.retryButton}
          onClick={() => router.push("/scan")}
        >
          {t("scanAgain")}
        </button>

        {isNotFound && (
          <button
            className={styles.retryButton}
            onClick={() =>
              router.push(
                `/sprzedawca/create?barcode=${encodeURIComponent(barcode ?? "")}`,
              )
            }
          >
            {t("addManually")}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Кнопка Назад */}
      <header className={styles.header}>
        <button
          className={styles.backButton}
          onClick={() => router.push("/scan")}
          aria-label={tCommon("back")}
        >
          ←
        </button>
      </header>

      {/* Статус выполнения */}
      <div className={styles.statusBadge}>
        <div className={styles.checkIcon}>✓</div>
        <span className={styles.statusTitle}>{t("found")}</span>
      </div>

      {/* Карточка найденного товара */}
      <div className={styles.productCard}>
        <div className={styles.imageWrapper}>
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className={styles.productImage}
            />
          ) : (
            <div className={styles.placeholderImage}>
              {t("noImage")}
            </div>
          )}
        </div>

        <h2 className={styles.productName}>{product.name}</h2>

        {product.product_quantity && (
          <p className={styles.productWeight}>
            {product.product_quantity} {product.product_quantity_unit || t("defaultUnit")}
          </p>
        )}

        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>{t("code")}</span>
          <span className={styles.infoValue}>{product.barcode}</span>
        </div>

        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>{t("brand")}</span>
          <span className={styles.infoValue}>
            {product.brand || t("notSpecified")}
          </span>
        </div>
      </div>

      {/* Блок-подсказка */}
      <div className={styles.hintBox}>
        {t("hintWrong")}
        <br />
        {t("hintRescan")}
        <br />
        {t("hintManual")}
      </div>

      {/* Кнопка "ДАЛЕЕ" */}
      <button
        className={styles.nextButton}
        onClick={() => setIsIntakeModalOpen(true)}
      >
        {t("next")}
      </button>

      {/* Модалка приёмки */}
      <IntakeModal
        isOpen={isIntakeModalOpen}
        onClose={() => setIsIntakeModalOpen(false)}
        onSubmit={handleIntakeSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
