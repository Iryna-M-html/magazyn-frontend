"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import styles from "./ProductFoundClient.module.css";

interface IntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    quantity: number;
    batch: string;
    expirationDate: string;
  }) => void;
  isSubmitting: boolean;
}

export function IntakeModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: IntakeModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [batch, setBatch] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const t = useTranslations("Intake");
  const tCommon = useTranslations("Common");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expirationDate) {
      alert(t("selectExpiration"));
      return;
    }

    onSubmit({
      quantity,
      batch: batch.trim(),
      expirationDate,
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
