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
    const quantity = Number(countedQuantity);

    if (
      countedQuantity.trim() === "" ||
      !Number.isFinite(quantity) ||
      quantity < 0
    ) {
      return;
    }

    onSubmit(quantity, note.trim());
  };

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
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

        {/* Расчётный остаток */}

        <div className={styles.expectedBox}>
          <span>{t("expected")}</span>

          <strong>
            {expectedQuantity} {t("../units.pieces")}
          </strong>
        </div>

        {/* Фактическое количество */}

        <label htmlFor="countedQuantity" className={styles.label}>
          {t("actual")}
        </label>

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

        {/* Комментарий */}

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

        {/* Ошибка */}

        {error ? <div className={styles.error}>{error}</div> : null}

        {/* Кнопки */}

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
