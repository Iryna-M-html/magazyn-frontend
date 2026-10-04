"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import { useTranslations } from "next-intl";

import styles from "./IntakeDetails.module.css";

import { IntakeItem } from "@/components/ProductCard/ProductCard";
import { AuditModal } from "@/components/AuditModal/AuditModal";
import { InventoryActionModal } from "@/components/InventoryActionModal/InventoryActionModal";

interface IntakeResponse {
  data?: IntakeItem;
  intake?: IntakeItem;
}

export interface InventoryAudit {
  _id: string;
  intakeId: string;

  expectedQuantity: number;
  countedQuantity: number;
  difference: number;

  countedAt: string;

  note?: string;

  createdAt?: string;
  updatedAt?: string;
}

interface AuditsResponse {
  data?: InventoryAudit[];
}

interface UpdateIntakeResponse {
  message?: string;
  intake?: IntakeItem;
}
type InventoryAction = "discount" | "writeOff";
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
  const [audits, setAudits] = useState<InventoryAudit[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [auditSaving, setAuditSaving] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);

  const [inventoryAction, setInventoryAction] =
    useState<InventoryAction | null>(null);
  const [inventoryActionSaving, setInventoryActionSaving] = useState(false);
  const [inventoryActionError, setInventoryActionError] = useState<
    string | null
  >(null);

  useEffect(() => {
    async function fetchIntake() {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get<IntakeResponse>(
          `/api/inventory/${intakeId}`,
        );

        const data = response.data?.data ?? response.data?.intake;

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

  useEffect(() => {
    async function fetchAudits() {
      try {
        setAuditLoading(true);

        const response = await axios.get<AuditsResponse>(
          `/api/inventory/${intakeId}/audits`,
        );

        setAudits(response.data?.data ?? []);
      } catch (err) {
        console.error("Ошибка загрузки ревизий:", err);
      } finally {
        setAuditLoading(false);
      }
    }

    fetchAudits();
  }, [intakeId]);

  const formatDate = (dateStr?: string): string => {
    if (!dateStr) {
      return "—";
    }
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) {
      return "—";
    }
    return date.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };
  const formatDateTime = (dateStr?: string): string => {
    if (!dateStr) {
      return "—";
    }

    const date = new Date(dateStr);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    const datePart = date.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const timePart = date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });

    return `${datePart} ${timePart}`;
  };
  const handleOpenDiscount = () => {
    setInventoryActionError(null);
    setInventoryAction("discount");
  };

  const handleOpenWriteOff = () => {
    setInventoryActionError(null);
    setInventoryAction("writeOff");
  };
  const handleCloseInventoryAction = () => {
    if (inventoryActionSaving) {
      return;
    }

    setInventoryActionError(null);
    setInventoryAction(null);
  };

  const handleSaveInventoryAction = async (quantity: number) => {
    if (!intake) {
      return;
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      setInventoryActionError(t("inventoryAction.updateError"));

      return;
    }
    const discountedQuantity = intake.discountedQuantity ?? 0;
    const writtenOffQuantity = intake.writtenOffQuantity ?? 0;
    const remainingQuantity =
      intake.quantity - discountedQuantity - writtenOffQuantity;
    if (quantity > remainingQuantity) {
      setInventoryActionError(
        t("inventoryAction.exceedsAvailable", {
          quantity: remainingQuantity,
        }),
      );

      return;
    }

    if (!inventoryAction) {
      return;
    }

    try {
      setInventoryActionSaving(true);
      setInventoryActionError(null);

      const body =
        inventoryAction === "discount"
          ? {
              discountedQuantity: quantity,
            }
          : {
              writtenOffQuantity: quantity,
            };

      const response = await axios.patch<UpdateIntakeResponse>(
        `/api/inventory/${intakeId}`,
        body,
      );

      const updatedIntake = response.data?.intake;

      if (updatedIntake) {
        setIntake(updatedIntake);
      } else {
        setIntake((prev) => {
          if (!prev) {
            return prev;
          }

          if (inventoryAction === "discount") {
            return {
              ...prev,

              discountedQuantity: (prev.discountedQuantity ?? 0) + quantity,
            };
          }

          return {
            ...prev,

            writtenOffQuantity: (prev.writtenOffQuantity ?? 0) + quantity,
          };
        });
      }

      setInventoryActionError(null);
      setInventoryAction(null);
    } catch (err) {
      console.error("Ошибка обновления партии:", err);

      if (axios.isAxiosError(err)) {
        console.error("Ответ backend:", err.response?.data);

        const backendMessage = err.response?.data?.message;

        const backendRemaining = err.response?.data?.remainingQuantity;

        if (typeof backendRemaining === "number") {
          setInventoryActionError(
            t("inventoryAction.exceedsAvailable", {
              quantity: backendRemaining,
            }),
          );
        } else if (typeof backendMessage === "string") {
          setInventoryActionError(backendMessage);
        } else {
          setInventoryActionError(t("inventoryAction.updateError"));
        }
      } else {
        setInventoryActionError(t("inventoryAction.updateError"));
      }
    } finally {
      setInventoryActionSaving(false);
    }
  };
  const handleSaveAudit = async (countedQuantity: number, note: string) => {
    try {
      setAuditSaving(true);
      setAuditError(null);

      const response = await axios.post(`/api/inventory/${intakeId}/audits`, {
        countedQuantity,
        note,
      });

      const newAudit = response.data?.data;

      if (newAudit) {
        setAudits((prev) => [newAudit, ...prev]);
      }

      setIsAuditModalOpen(false);
    } catch (err) {
      console.error("Ошибка сохранения ревизии:", err);

      if (axios.isAxiosError(err)) {
        console.error("Ответ:", err.response?.data);
      }

      setAuditError(t("audit.saveError"));
    } finally {
      setAuditSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loader}>{t("loading")}</div>
      </div>
    );
  }

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

  const discountedQuantity = intake.discountedQuantity ?? 0;

  const writtenOffQuantity = intake.writtenOffQuantity ?? 0;

  const remainingQuantity =
    intake.quantity - discountedQuantity - writtenOffQuantity;

  const expirationTimestamp = intake.expirationDate
    ? new Date(intake.expirationDate).getTime()
    : null;

  const isExpirationCritical =
    expirationTimestamp !== null &&
    !Number.isNaN(expirationTimestamp) &&
    expirationTimestamp <= Date.now() + 7 * 24 * 60 * 60 * 1000;

  const lastAudit = audits.length > 0 ? audits[0] : null;

  return (
    <div className={styles.container}>
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
      <section className={styles.infoList}>
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

        <div className={styles.infoRow}>
          <span className={styles.label}>{t("receivedQuantity")}</span>

          <span className={styles.value}>
            {intake.quantity} {t("units.pieces")}
          </span>
        </div>

        <div className={styles.infoRow}>
          <span className={styles.label}>{t("discounted")}</span>

          <span className={styles.value}>
            {discountedQuantity} {t("units.pieces")}
          </span>
        </div>

        <div className={styles.infoRow}>
          <span className={styles.label}>{t("writtenOff")}</span>

          <span className={styles.value}>
            {writtenOffQuantity} {t("units.pieces")}
          </span>
        </div>

        <div className={styles.infoRow}>
          <span className={styles.label}>{t("remaining")}</span>

          <span className={styles.valueBold}>
            {remainingQuantity} {t("units.pieces")}
          </span>
        </div>

        <div className={styles.infoRow}>
          <span className={styles.label}>{t("addedDate")}</span>

          <span className={styles.value}>
            {formatDateTime(intake.scannedAt || intake.createdAt)}
          </span>
        </div>

        <div className={styles.infoRow}>
          <span className={styles.label}>{t("batch")}</span>

          <span className={styles.value}>{intake.batch || "—"}</span>
        </div>

        <div className={styles.infoRow}>
          <span className={styles.label}>{t("category")}</span>

          <span className={styles.value}>{product?.category || "—"}</span>
        </div>

        <div className={styles.infoRow}>
          <span className={styles.label}>{t("shelfPrice")}</span>

          <span className={styles.value}>
            {product?.shelfPrice !== undefined
              ? `${product.shelfPrice} zł`
              : "—"}
          </span>
        </div>
      </section>

      {/* ===================================================
       * INVENTORY ACTIONS
       * =================================================== */}

      <section className={styles.inventoryActions}>
        <div className={styles.inventoryActionsHeader}>
          <h2 className={styles.inventoryActionsTitle}>
            {t("inventoryAction.title")}
          </h2>

          <span className={styles.inventoryActionsRemaining}>
            {t("inventoryAction.remaining")}: {remainingQuantity}{" "}
            {t("units.pieces")}
          </span>
        </div>

        <div className={styles.inventoryButtons}>
          <button
            type="button"
            className={styles.discountButton}
            onClick={handleOpenDiscount}
            disabled={remainingQuantity <= 0}
          >
            {t("inventoryAction.discount")}
          </button>

          <button
            type="button"
            className={styles.writeOffButton}
            onClick={handleOpenWriteOff}
            disabled={remainingQuantity <= 0}
          >
            {t("inventoryAction.writeOff")}
          </button>
        </div>

        {remainingQuantity <= 0 ? (
          <div className={styles.noRemaining}>
            {t("inventoryAction.noRemaining")}
          </div>
        ) : null}
      </section>

      {/* ===================================================
       * AUDIT
       * =================================================== */}

      <section className={styles.auditSection}>
        <div className={styles.auditHeader}>
          <h2 className={styles.auditTitle}>{t("audit.title")}</h2>

          <button
            type="button"
            className={styles.auditAddBtn}
            onClick={() => {
              setAuditError(null);
              setIsAuditModalOpen(true);
            }}
          >
            {t("audit.create")}
          </button>
        </div>

        {auditLoading ? (
          <div className={styles.auditLoading}>{t("loading")}</div>
        ) : lastAudit ? (
          <div className={styles.lastAudit}>
            <div className={styles.auditRow}>
              <span className={styles.auditLabel}>{t("audit.lastAudit")}</span>

              <span className={styles.auditValue}>
                {formatDateTime(lastAudit.countedAt)}
              </span>
            </div>

            <div className={styles.auditRow}>
              <span className={styles.auditLabel}>{t("audit.expected")}</span>

              <span className={styles.auditValue}>
                {lastAudit.expectedQuantity} {t("units.pieces")}
              </span>
            </div>

            <div className={styles.auditRow}>
              <span className={styles.auditLabel}>{t("audit.actual")}</span>

              <strong className={styles.auditValueBold}>
                {lastAudit.countedQuantity} {t("units.pieces")}
              </strong>
            </div>

            <div className={styles.auditRow}>
              <span className={styles.auditLabel}>{t("audit.difference")}</span>

              <span
                className={
                  lastAudit.difference === 0
                    ? styles.auditOk
                    : lastAudit.difference < 0
                      ? styles.auditNegative
                      : styles.auditPositive
                }
              >
                {lastAudit.difference > 0 ? "+" : ""}
                {lastAudit.difference} {t("units.pieces")}
              </span>
            </div>

            {lastAudit.note ? (
              <div className={styles.auditNote}>{lastAudit.note}</div>
            ) : null}
          </div>
        ) : (
          <div className={styles.noAudits}>{t("audit.noAudits")}</div>
        )}

        {/* =================================================
         * HISTORY
         * ================================================= */}

        {audits.length > 0 ? (
          <div className={styles.auditHistory}>
            <h3 className={styles.auditHistoryTitle}>{t("audit.history")}</h3>

            {audits.map((audit) => (
              <div key={audit._id} className={styles.auditHistoryItem}>
                <div className={styles.auditHistoryDate}>
                  {formatDateTime(audit.countedAt)}
                </div>

                <div className={styles.auditHistoryInfo}>
                  <span>
                    {t("audit.expected")}: {audit.expectedQuantity}{" "}
                    {t("units.pieces")}
                  </span>

                  <span>
                    {t("audit.actual")}: {audit.countedQuantity}{" "}
                    {t("units.pieces")}
                  </span>

                  <span
                    className={
                      audit.difference === 0
                        ? styles.auditOk
                        : audit.difference < 0
                          ? styles.auditNegative
                          : styles.auditPositive
                    }
                  >
                    {t("audit.difference")}: {audit.difference > 0 ? "+" : ""}
                    {audit.difference} {t("units.pieces")}
                  </span>
                </div>

                {audit.note ? (
                  <div className={styles.auditHistoryNote}>{audit.note}</div>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
      </section>

      {/* ===================================================
       * ACTIONS
       * =================================================== */}

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.editBtn}
          onClick={() => {
            console.log("Редактировать:", intake._id);
          }}
        >
          {t("edit")}
        </button>

        <button
          type="button"
          className={styles.deleteBtn}
          onClick={() => {
            console.log("Удалить:", intake._id);
          }}
        >
          {t("delete")}
        </button>
      </div>

      {/* ===================================================
       * INVENTORY ACTION MODAL
       * =================================================== */}

      <InventoryActionModal
        isOpen={inventoryAction !== null}
        type={inventoryAction ?? "discount"}
        maxQuantity={remainingQuantity}
        loading={inventoryActionSaving}
        error={inventoryActionError}
        onClose={handleCloseInventoryAction}
        onSubmit={handleSaveInventoryAction}
      />

      {/* ===================================================
       * AUDIT MODAL
       * =================================================== */}

      <AuditModal
        isOpen={isAuditModalOpen}
        expectedQuantity={remainingQuantity}
        loading={auditSaving}
        error={auditError}
        onClose={() => {
          if (!auditSaving) {
            setIsAuditModalOpen(false);
          }
        }}
        onSubmit={handleSaveAudit}
      />
    </div>
  );
}
