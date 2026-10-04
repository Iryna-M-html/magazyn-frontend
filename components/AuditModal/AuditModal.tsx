"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import styles from "./AuditModal.module.css";

interface AuditModalProps {
  isOpen: boolean;
  expectedQuantity: number;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (countedQuantity: number, note: string) => void;
}

export function AuditModal({
  isOpen,
  expectedQuantity,
  loading,
  error,
  onClose,
  onSubmit,
}: AuditModalProps) {
  const t = useTranslations("IntakeDetails.audit");

  const [countedQuantity, setCountedQuantity] = useState(
    String(expectedQuantity),
  );

  const [note, setNote] = useState("");

  if (!isOpen) {
    return null;
  }

  const handleSubmit = () => {
    const trimmedQuantity = countedQuantity.trim();
    const quantity = Number(trimmedQuantity);

    if (
      trimmedQuantity === "" ||
      !Number.isFinite(quantity) ||
      quantity < 0 ||
      !Number.isInteger(quantity)
    ) {
      return;
    }

    onSubmit(quantity, note.trim());
  };

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && !loading) {
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="audit-modal-title"
      >
        {/* HEADER */}

        <div className={styles.header}>
          <h2 id="audit-modal-title" className={styles.title}>
            {t("modalTitle")}
          </h2>

          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            disabled={loading}
            aria-label={t("cancel")}
          >
            ×
          </button>
        </div>

        {/* РАСЧЁТНЫЙ ОСТАТОК */}

        <div className={styles.expectedBox}>
          <span className={styles.expectedLabel}>{t("expected")}</span>

          <strong className={styles.expectedValue}>
            {expectedQuantity} {t("expectedUnit")}
          </strong>
        </div>

        {/* ФАКТИЧЕСКОЕ КОЛИЧЕСТВО */}

        <div className={styles.field}>
          <label htmlFor="countedQuantity" className={styles.label}>
            {t("actual")}
          </label>

          <div className={styles.inputWrapper}>
            <input
              id="countedQuantity"
              type="number"
              min="0"
              step="1"
              value={countedQuantity}
              onChange={(event) => setCountedQuantity(event.target.value)}
              className={styles.input}
              disabled={loading}
              autoFocus
            />

            <span className={styles.inputUnit}>{t("expectedUnit")}</span>
          </div>
        </div>

        {/* КОММЕНТАРИЙ */}

        <div className={styles.field}>
          <label htmlFor="auditNote" className={styles.label}>
            {t("note")}
          </label>

          <textarea
            id="auditNote"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className={styles.textarea}
            rows={3}
            placeholder={t("notePlaceholder")}
            disabled={loading}
          />
        </div>

        {/* ОШИБКА */}

        {error ? <div className={styles.error}>{error}</div> : null}

        {/* КНОПКИ */}

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onClose}
            disabled={loading}
          >
            {t("cancel")}
          </button>

          <button
            type="button"
            className={styles.saveButton}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? t("saving") : t("save")}
          </button>
        </div>
      </div>
    </div>
  );
}
