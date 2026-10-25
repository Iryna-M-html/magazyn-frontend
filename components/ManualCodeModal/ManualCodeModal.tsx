"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import styles from "./ManualCodeModal.module.css";

interface ManualCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (barcode: string) => void;
}

export const ManualCodeModal: React.FC<ManualCodeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [barcode, setBarcode] = useState("");
  const [error, setError] = useState("");
  const t = useTranslations("ManualCode");
  const tCommon = useTranslations("Common");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const barcodeRegex = /^\d{8,14}$/;

    if (!barcodeRegex.test(barcode)) {
      setError(t("invalid"));
      return;
    }

    setError("");
    onSubmit(barcode);
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3>{t("title")}</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className={styles.input}
            placeholder={t("placeholder")}
            value={barcode}
            onChange={(e) => {
              setBarcode(e.target.value);
              if (error) setError("");
            }}
            autoFocus
          />
          {error && <span className={styles.errorMessage}>{error}</span>}

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
            >
              {tCommon("cancel")}
            </button>
            <button type="submit" className={styles.submitBtn}>
              {t("submit")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
