"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("IntakeDetails.inventoryAction");
  const tCommon = useTranslations("Common");

  if (!isOpen) {
    return null;
  }

  const isDiscount = type === "discount";

  const title = isDiscount ? t("discountTitle") : t("writeOffTitle");

  const description = isDiscount
    ? t("discountDescription")
    : t("writeOffDescription");

  const buttonText = isDiscount ? t("discountSubmit") : t("writeOffSubmit");

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
            aria-label={tCommon("close")}
          >
            ×
          </button>
        </div>

        <div className={styles.available}>
          <span className={styles.availableLabel}>{t("available")}</span>

          <strong className={styles.availableValue}>
            {tCommon("pieces", { count: maxQuantity })}
          </strong>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="inventory-action-quantity">{t("quantity")}</label>

            <input
              id="inventory-action-quantity"
              type="number"
              min={1}
              max={maxQuantity}
              step={1}
              value={quantity}
              onChange={handleQuantityChange}
              placeholder={t("quantityPlaceholder")}
              disabled={loading || maxQuantity <= 0}
              autoFocus
            />

            {quantity !== "" && numericQuantity > maxQuantity ? (
              <div className={styles.fieldError}>
                {t("exceedsAvailable", { quantity: maxQuantity })}
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
              {t("cancel")}
            </button>

            <button
              type="submit"
              className={`${styles.submitButton} ${
                isDiscount ? styles.submitDiscount : styles.submitWriteOff
              }`}
              disabled={!isValid || loading || maxQuantity <= 0}
            >
              {loading ? t("saving") : buttonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
