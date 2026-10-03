"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import { useTranslations } from "next-intl";

import styles from "./IntakeDetails.module.css";
import { IntakeItem } from "@/components/ProductCard/ProductCard";

interface ApiResponse {
  data?: IntakeItem;
}

export default function IntakeDetailsPage({
  params,
}: {
  params: Promise<{ intakeId: string }>;
}) {
  const { intakeId } = use(params);

  const router = useRouter();
  const t = useTranslations("IntakeDetails");

  const [intake, setIntake] = useState<IntakeItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchIntake() {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get<ApiResponse>(
          `/api/inventory/${intakeId}`,
        );
        const data = response.data?.data;

        if (data) {
          setIntake(data);
        } else {
          setIntake(response.data as unknown as IntakeItem);
        }
      } catch (err) {
        console.error("Ошибка загрузки партии:", err);

        if (axios.isAxiosError(err)) {
          console.error("Ответ сервера:", err.response?.data);
        }

        setError(t("error"));
      } finally {
        setLoading(false);
      }
    }

    fetchIntake();
  }, [intakeId, t]);

  /*
   * Формат даты:
   */
  const formatDate = (dateStr?: string): string => {
    if (!dateStr) {
      return "—";
    }

    const date = new Date(dateStr);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    const day = String(date.getDate()).padStart(2, "0");

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const year = date.getFullYear();

    return `${day}.${month}.${year}`;
  };

  /*
   * Формат даты + времени:
   *
   * 25.03.2026 14:35
   */
  const formatDateTime = (dateStr?: string): string => {
    if (!dateStr) {
      return "—";
    }

    const date = new Date(dateStr);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    const day = String(date.getDate()).padStart(2, "0");

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const year = date.getFullYear();

    const hours = String(date.getHours()).padStart(2, "0");

    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}.${month}.${year} ${hours}:${minutes}`;
  };

  /*
   * Загрузка
   */

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loader}>{t("loading")}</div>
      </div>
    );
  }

  /*
   * Ошибка / партия не найдена
   */

  if (error || !intake) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error || t("notFound")}</div>

        <button
          type="button"
          className={styles.backErrorBtn}
          onClick={() => router.back()}
        >
          {t("backButton")}
        </button>
      </div>
    );
  }

  const product = intake.productId;

  const remainingQuantity =
    intake.quantity -
    (intake.discountedQuantity ?? 0) -
    (intake.writtenOffQuantity ?? 0);

  const expirationTimestamp = intake.expirationDate
    ? new Date(intake.expirationDate).getTime()
    : null;

  const isExpirationCritical =
    expirationTimestamp !== null &&
    !Number.isNaN(expirationTimestamp) &&
    expirationTimestamp <= Date.now() + 7 * 24 * 60 * 60 * 1000;

  return (
    <div className={styles.container}>
      {/* HEADER */}

      <header className={styles.header}>
        <button
          type="button"
          className={styles.backBtn}
          onClick={() => router.back()}
          aria-label={t("back")}
        >
          ‹
        </button>

        <h1 className={styles.headerTitle}>{t("title")}</h1>
      </header>

      {/* PRODUCT */}

      <section className={styles.productHeader}>
        <div className={styles.imageContainer}>
          {product?.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name || t("noName")}
              width={64}
              height={64}
              className={styles.image}
            />
          ) : (
            <div className={styles.noImage}>{t("noImage")}</div>
          )}
        </div>

        <div className={styles.productMainInfo}>
          <h2 className={styles.productTitle}>
            {product?.name || t("noName")}
          </h2>

          {product?.productQuantity && product?.productQuantityUnit ? (
            <div className={styles.productQuantity}>
              {product.productQuantity} {product.productQuantityUnit}
            </div>
          ) : null}

          <p className={styles.barcode}>{product?.barcode || "—"}</p>
        </div>
      </section>

      {/* INFORMATION */}

      <section className={styles.infoList}>
        {/* Срок годности */}

        <div className={styles.infoRow}>
          <span className={styles.label}>{t("expirationDate")}</span>

          <span
            className={
              isExpirationCritical ? styles.valueCritical : styles.value
            }
          >
            {formatDate(intake.expirationDate)}
          </span>
        </div>

        {/* Приёмка */}

        <div className={styles.infoRow}>
          <span className={styles.label}>{t("receivedQuantity")}</span>

          <span className={styles.value}>
            {intake.quantity} {t("units.pieces")}
          </span>
        </div>

        {/* Уценено */}

        <div className={styles.infoRow}>
          <span className={styles.label}>{t("discounted")}</span>

          <span className={styles.value}>
            {intake.discountedQuantity ?? 0} {t("units.pieces")}
          </span>
        </div>

        {/* Списано */}

        <div className={styles.infoRow}>
          <span className={styles.label}>{t("writtenOff")}</span>

          <span className={styles.value}>
            {intake.writtenOffQuantity ?? 0} {t("units.pieces")}
          </span>
        </div>

        {/* Остаток */}

        <div className={styles.infoRow}>
          <span className={styles.label}>{t("remaining")}</span>

          <span className={styles.valueBold}>
            {remainingQuantity} {t("units.pieces")}
          </span>
        </div>

        {/* Дата добавления */}

        <div className={styles.infoRow}>
          <span className={styles.label}>{t("addedDate")}</span>

          <span className={styles.value}>
            {formatDateTime(intake.scannedAt || intake.createdAt)}
          </span>
        </div>

        {/* Партия */}

        <div className={styles.infoRow}>
          <span className={styles.label}>{t("batch")}</span>

          <span className={styles.value}>{intake.batch || "—"}</span>
        </div>

        {/* Категория */}

        <div className={styles.infoRow}>
          <span className={styles.label}>{t("category")}</span>

          <span className={styles.value}>{product?.category || "—"}</span>
        </div>

        {/* Цена */}

        <div className={styles.infoRow}>
          <span className={styles.label}>{t("shelfPrice")}</span>

          <span className={styles.value}>
            {product?.shelfPrice !== undefined
              ? `${product.shelfPrice} zł`
              : "—"}
          </span>
        </div>
      </section>

      {/* ACTIONS */}

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.editBtn}
          onClick={() => {
            console.log(t("editLog"), intake._id);
          }}
        >
          {t("edit")}
        </button>

        <button
          type="button"
          className={styles.deleteBtn}
          onClick={() => {
            console.log(t("deleteLog"), intake._id);
          }}
        >
          {t("delete")}
        </button>
      </div>
    </div>
  );
}
