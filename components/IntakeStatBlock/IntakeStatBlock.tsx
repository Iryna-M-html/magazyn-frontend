"use client";

import React, { useMemo } from "react";
import styles from "./IntakeStatBlock.module.css";

// Интерфейс одной партии
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
  };
}

interface IntakeStatBlockProps {
  /** Массив партий */
  intakes: IntakeItem[];

  /** Подпись под значением */
  subtext?: string;

  /** Заголовок блока */
  label?: string;
}

const IntakeStatBlock: React.FC<IntakeStatBlockProps> = ({
  intakes = [],
  subtext = "позиций на складе",
  label = "Всего партий (шт)",
}) => {
  const { totalBatches, totalItemsCount } = useMemo(() => {
    const totalBatches = intakes.length;

    const totalItemsCount = intakes.reduce((sum, item) => {
      return sum + (Number(item.quantity) || 0);
    }, 0);

    return {
      totalBatches,
      totalItemsCount,
    };
  }, [intakes]);

  return (
    <div className={styles.statCard}>
      <div className={styles.statLabel}>{label}</div>

      <div className={styles.statValue}>
        {totalBatches}

        <span className={styles.statValueSub}>({totalItemsCount} шт)</span>
      </div>

      <div className={styles.statSubtext}>{subtext}</div>
    </div>
  );
};

export default IntakeStatBlock;
