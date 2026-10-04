"use client";

import { FormEvent, useState } from "react";

import styles from "./InventoryActionModal.module.css";

export type InventoryActionType = "discount" | "writeOff";

interface InventoryActionModalProps {
  isOpen: boolean;
  type: InventoryActionType;

  maxQuantity: number;

  loading?: boolean;
  error?: string | null;

  onClose: () => void;
  onSubmit: (quantity: number) => void;
}

export function InventoryActionModal({
  isOpen,
  type,
  maxQuantity,
  loading = false,
  error = null,
  onClose,
  onSubmit,
}: InventoryActionModalProps) {
  const [quantity, setQuantity] = useState("");

  if (!isOpen) {
    return null;
  }

  const isDiscount = type === "discount";

  const title = isDiscount ? "Уценка товара" : "Списание товара";

  const description = isDiscount
    ? "Укажите количество товара, которое необходимо уценить."
    : "Укажите количество товара, которое необходимо списать.";

  const buttonText = isDiscount ? "Уценить" : "Списать";

  const numericQuantity = Number(quantity);

  const isValid =
    quantity !== "" &&
    Number.isInteger(numericQuantity) &&
    numericQuantity > 0 &&
    numericQuantity <= maxQuantity;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isValid || loading) {
      return;
    }

    onSubmit(numericQuantity);
  };

  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    if (value === "") {
      setQuantity("");
      return;
    }

    const parsed = Number(value);

    if (!Number.isInteger(parsed) || parsed < 0) {
      return;
    }

    setQuantity(value);
  };

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="inventory-action-title"
    >
      <div className={styles.modal}>
        <div className={styles.header}>
          <div>
            <h2 id="inventory-action-title" className={styles.title}>
              {title}
            </h2>

            <p className={styles.description}>{description}</p>
          </div>

          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            disabled={loading}
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>

        <div className={styles.available}>
          <span className={styles.availableLabel}>Доступно для обработки</span>

          <strong className={styles.availableValue}>{maxQuantity} шт.</strong>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="inventory-action-quantity">Количество, шт.</label>

            <input
              id="inventory-action-quantity"
              type="number"
              min={1}
              max={maxQuantity}
              step={1}
              value={quantity}
              onChange={handleQuantityChange}
              placeholder="Введите количество"
              disabled={loading || maxQuantity <= 0}
              autoFocus
            />

            {quantity !== "" && numericQuantity > maxQuantity ? (
              <div className={styles.fieldError}>
                Нельзя обработать больше {maxQuantity} шт.
              </div>
            ) : null}
          </div>

          {error ? (
            <div className={styles.error} role="alert">
              {error}
            </div>
          ) : null}

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
              disabled={loading}
            >
              Отмена
            </button>

            <button
              type="submit"
              className={`${styles.submitButton} ${
                isDiscount ? styles.submitDiscount : styles.submitWriteOff
              }`}
              disabled={!isValid || loading || maxQuantity <= 0}
            >
              {loading ? "Сохранение..." : buttonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
