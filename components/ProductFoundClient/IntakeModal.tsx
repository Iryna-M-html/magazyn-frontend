"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { DEFAULT_CATEGORY } from "@/lib/constants/products";
import { useCategoryTitles } from "@/lib/hooks/useCategoryTitles";
import styles from "./ProductFoundClient.module.css";

interface IntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    quantity: number;
    batch: string;
    expirationDate: string;
    priceNetto: number;
    category: string;
  }) => void;
  isSubmitting: boolean;
  /** Текущая категория товара — выбрана в списке по умолчанию */
  initialCategory?: string;
}

export function IntakeModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  initialCategory,
}: IntakeModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [batch, setBatch] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [priceNetto, setPriceNetto] = useState("");
  const [category, setCategory] = useState(
    initialCategory || DEFAULT_CATEGORY,
  );
  const categoryOptions = useCategoryTitles();
  const t = useTranslations("Intake");
  const tCommon = useTranslations("Common");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expirationDate) {
      alert(t("selectExpiration"));
      return;
    }

    // «6,94» → 6.94
    const priceValue = Number(priceNetto.trim().replace(",", "."));

    if (priceNetto.trim() === "" || !(priceValue >= 0)) {
      alert(t("priceNettoInvalid"));
      return;
    }

    onSubmit({
      quantity,
      batch: batch.trim(),
      expirationDate,
      priceNetto: priceValue,
      category,
    });
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3>{t("title")}</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.fieldGroup}>
            <label>{t("quantity")}</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label>{t("batch")}</label>
            <input
              type="text"
              placeholder={t("batchPlaceholder")}
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label>{t("expiration")}</label>
            <input
              type="date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="intake-category">{t("category")}</label>
            <select
              id="intake-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {/* Текущая категория товара могла пропасть из справочника — оставляем её в списке */}
              {(categoryOptions.includes(category)
                ? categoryOptions
                : [category, ...categoryOptions]
              ).map((title) => (
                <option key={title} value={title}>
                  {title === DEFAULT_CATEGORY ? t("otherCategory") : title}
                </option>
              ))}
            </select>
            <span className={styles.fieldHint}>{t("categoryHint")}</span>
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="intake-price-netto">{t("priceNetto")}</label>
            <input
              id="intake-price-netto"
              type="text"
              inputMode="decimal"
              placeholder={t("priceNettoPlaceholder")}
              value={priceNetto}
              onChange={(e) => setPriceNetto(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? tCommon("saving") : t("submit")}
          </button>
        </form>
      </div>
    </div>
  );
}
