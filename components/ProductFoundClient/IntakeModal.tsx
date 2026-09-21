"use client";

import { useState } from "react";
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

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expirationDate) {
      alert("Выберите срок годности!");
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
          <h3>Фиксация приёмки</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.fieldGroup}>
            <label>Количество (шт.):</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label>Номер / Серия партии (batch):</label>
            <input
              type="text"
              placeholder="Например: LOT-2026-X"
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label>Срок годности (expirationDate):</label>
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
            {isSubmitting ? "Сохранение..." : "Сохранить приёмку"}
          </button>
        </form>
      </div>
    </div>
  );
}
