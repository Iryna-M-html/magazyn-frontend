"use client";

import React, { useState } from "react";
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

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const barcodeRegex = /^\d{8,14}$/;

    if (!barcodeRegex.test(barcode)) {
      setError("Штрихкод должен содержать только цифры (от 8 до 14 символов)");
      return;
    }

    setError("");
    onSubmit(barcode);
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3>Ввести код вручную</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className={styles.input}
            placeholder="Введите штрихкод..."
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
              Отмена
            </button>
            <button type="submit" className={styles.submitBtn}>
              Найти
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
