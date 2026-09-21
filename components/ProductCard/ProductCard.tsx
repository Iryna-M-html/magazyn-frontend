"use client";

import styles from "./ProductCard.module.css";

export interface IntakeItem {
  _id: string;
  quantity: number;
  batch?: string;
  expirationDate: string;
  productId: {
    _id: string;
    name: string;
    barcode: string;
    brand?: string;
    imageUrl?: string;
    unit?: string;

    productQuantity?: string;
  };
}

interface ProductCardProps {
  item: IntakeItem;
}

export function ProductCard({ item }: ProductCardProps) {
  const { productId, expirationDate, quantity } = item;

  // Форматирование даты в DD.MM.YYYY
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Проверка критического срока (например, меньше 7 дней до просрочки)
  const isCritical = () => {
    if (!expirationDate) return false;
    const today = new Date();
    const exp = new Date(expirationDate);
    const diffDays = Math.ceil(
      (exp.getTime() - today.getTime()) / (1000 * 3600 * 24),
    );
    return diffDays <= 7;
  };

  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        {productId?.imageUrl ? (
          <img
            src={productId.imageUrl}
            alt={productId.name}
            className={styles.image}
          />
        ) : (
          <div className={styles.placeholder}>Нет фото</div>
        )}
      </div>

      <div className={styles.info}>
        <h3 className={styles.title}>{productId?.name || "Без названия"}</h3>
        <p className={styles.barcode}>{productId?.barcode || "—"}</p>
        <p className={styles.barcode}>
          {productId?.brand || "Бренд не указан"}
        </p>
        {/* <p className={styles.barcode}>
          {productId?.productQuantity || "Не указано"}
        </p> */}
        <span
          className={`${styles.date} ${
            isCritical() ? styles.dateCritical : styles.dateNormal
          }`}
        >
          {formatDate(expirationDate)}
        </span>
      </div>

      <div className={styles.quantity}>{quantity} шт.</div>
    </div>
  );
}
