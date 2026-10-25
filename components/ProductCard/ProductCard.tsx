"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { formatDate } from "@/lib/utils/date";
import styles from "./ProductCard.module.css";
import { ImageModal } from "../ImageModal/ImageModal";

export interface IntakeItem {
  _id: string;
  quantity: number;
  batch?: string;
  expirationDate: string;
  scannedAt?: string;
  createdAt?: string;
  discountedQuantity?: number;
  writtenOffQuantity?: number;

  productId: {
    _id: string;
    name: string;
    barcode: string;
    brand?: string;
    imageUrl?: string;
    category?: string;
    shelfPrice?: number;
    productQuantity?: number;
    productQuantityUnit?: string;
  };
}

interface ProductCardProps {
  item: IntakeItem;
}

export function ProductCard({ item }: ProductCardProps) {
  const { _id, productId, expirationDate, quantity } = item;

  const t = useTranslations("ProductCard");
  const tCommon = useTranslations("Common");

  const [isModalOpen, setIsModalOpen] = useState(false);

  const isCritical = () => {
    if (!expirationDate) {
      return false;
    }

    const today = new Date();
    const exp = new Date(expirationDate);

    if (Number.isNaN(exp.getTime())) {
      return false;
    }

    const diffDays = Math.ceil(
      (exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    return diffDays <= 7;
  };

  return (
    <>
      <article className={styles.card}>
        {/* Фото */}
        <div className={styles.imageContainer}>
          {productId?.imageUrl ? (
            <button
              type="button"
              className={styles.imageButton}
              onClick={() => setIsModalOpen(true)}
              aria-label={t("openImage")}
            >
              <img
                src={productId.imageUrl}
                alt={productId.name || t("productAlt")}
                className={styles.image}
              />
            </button>
          ) : (
            <div className={styles.noImage}>{t("noPhoto")}</div>
          )}
        </div>

        {/* Информация о товаре */}
        <div className={styles.info}>
          <h3 className={styles.name}>{productId?.name || t("noName")}</h3>

          <p className={styles.barcode}>{productId?.barcode || "—"}</p>

          <p className={styles.brand}>
            {productId?.brand || t("noBrand")}
          </p>

          <div className={styles.details}>
            <div>
              <span className={styles.label}>{t("expiration")}</span>{" "}
              <span className={isCritical() ? styles.criticalDate : undefined}>
                {formatDate(expirationDate)}
              </span>
            </div>

            <div>
              <span className={styles.label}>{t("quantity")}</span>{" "}
              {tCommon("pieces", { count: quantity })}
            </div>
          </div>
        </div>

        {/* Действия */}
        <div className={styles.actions}>
          <Link href={`/inventory/${_id}`} className={styles.detailsBtn}>
            {t("details")}
          </Link>
        </div>
      </article>

      {/* Модальное окно */}
      {isModalOpen && productId?.imageUrl && (
        <ImageModal
          imageUrl={productId.imageUrl}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
