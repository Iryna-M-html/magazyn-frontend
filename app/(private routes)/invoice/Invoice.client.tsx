"use client";

import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslations } from "next-intl";
import { Camera, FilePlus2, RefreshCw } from "lucide-react";

import { useAuth } from "@/components/Auth/AuthProvider";
import {
  createInventoryIntake,
  getProductByBarcode,
  matchProducts,
  recognizeInvoice,
  updateProductByBarcode,
} from "@/lib/api/clientApi";
import { DEFAULT_CATEGORY } from "@/lib/constants/products";
import { makeBatchCode } from "@/lib/utils/batch";
import { downscaleImage } from "@/lib/utils/image";
import type { ProductCandidate } from "@/types/invoice";

import { InvoiceLineCard } from "./InvoiceLineCard";
import { createLine, type InvoiceLine } from "./invoiceLine";
import styles from "./Invoice.module.css";

// Состояние приёмки переживает переход на «новый продукт» и обратно (в пределах вкладки)
const STORAGE_KEY = "invoice-intake-v1";

// Ниже этого сходства из своей базы — дополнительно ищем в Open Food Facts
const GOOD_MATCH_SCORE = 70;

interface InvoiceState {
  invoiceNumber: string;
  confidence: number;
  text: string;
  lines: InvoiceLine[];
}

const loadState = (): InvoiceState | null => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as InvoiceState) : null;
  } catch {
    return null;
  }
};

const saveState = (state: InvoiceState | null) => {
  try {
    if (state) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Хранилище недоступно (приватный режим) — приёмка работает и без него
  }
};

const parseDecimal = (value: string) => Number(value.trim().replace(",", "."));

export default function InvoiceClient() {
  const t = useTranslations("Invoice");
  const { user } = useAuth();

  const [state, setState] = useState<InvoiceState | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [recognizeError, setRecognizeError] = useState("");
  const [isRestored, setIsRestored] = useState(false);

  const photoPreview = useMemo(
    () => (photo ? URL.createObjectURL(photo) : null),
    [photo],
  );

  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  // Open Food Facts ограничивает частоту запросов — поиск там идёт строго по очереди
  const offQueueRef = useRef<Promise<void>>(Promise.resolve());

  const updateLine = useCallback((id: string, patch: Partial<InvoiceLine>) => {
    setState((current) =>
      current
        ? {
            ...current,
            lines: current.lines.map((line) =>
              line.id === id ? { ...line, ...patch } : line,
            ),
          }
        : current,
    );
  }, []);

  const searchOff = useCallback(
    (id: string, query: string) => {
      updateLine(id, { offStatus: "queued" });

      offQueueRef.current = offQueueRef.current.then(async () => {
        updateLine(id, { offStatus: "loading" });

        try {
          const candidates = await matchProducts(query, "off");
          updateLine(id, { offCandidates: candidates, offStatus: "done" });
        } catch {
          updateLine(id, { offStatus: "error" });
        }
      });
    },
    [updateLine],
  );

  /** Поиск в своей базе; EAN с фактуры — точное совпадение. Слабый результат → очередь в OFF */
  const searchDb = useCallback(
    async (id: string, query: string, ean: string | null, autoOff: boolean) => {
      updateLine(id, { dbStatus: "loading", error: "" });

      const candidates: ProductCandidate[] = [];

      if (ean) {
        try {
          const { data } = await getProductByBarcode(ean);

          if (data) {
            candidates.push({
              source: "db",
              productId: data.id,
              barcode: data.barcode,
              name: data.name,
              brand: data.brand,
              imageUrl: data.imageUrl,
              productQuantity: data.product_quantity,
              productQuantityUnit: data.product_quantity_unit,
              category: data.category,
              score: 100,
            });
          }
        } catch {
          // Товара с таким EAN нет ни в базе, ни в OFF — ищем по названию
        }
      }

      if (query.trim().length >= 2) {
        try {
          const byName = await matchProducts(query, "db");
          candidates.push(
            ...byName.filter((candidate) =>
              candidates.every((existing) => existing.barcode !== candidate.barcode),
            ),
          );
        } catch {
          updateLine(id, { dbStatus: "error" });
          return;
        }
      }

      updateLine(id, { dbCandidates: candidates, dbStatus: "done" });

      const best = candidates[0]?.score ?? 0;

      if (autoOff && best < GOOD_MATCH_SCORE && query.trim().length >= 2) {
        searchOff(id, query);
      }
    },
    [searchOff, updateLine],
  );

  // Восстановление после возврата со страницы нового продукта: поиск в базе запускается заново
  useEffect(() => {
    const restored = loadState();

    if (restored) {
      const lines = restored.lines.map((line) => ({
        ...line,
        confirming: false,
        status: line.status === "saving" ? ("pending" as const) : line.status,
        offStatus:
          line.offStatus === "queued" || line.offStatus === "loading"
            ? ("idle" as const)
            : line.offStatus,
      }));

      setState({ ...restored, lines });

      lines
        .filter((line) => line.status === "pending" && !line.selected)
        .forEach((line) => searchDb(line.id, line.query, line.ean, false));
    }

    setIsRestored(true);
    // Восстановление — один раз при открытии страницы
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isRestored) {
      saveState(state);
    }
  }, [state, isRestored]);

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setRecognizeError(t("photoNotImage"));
      return;
    }

    setRecognizeError("");
    setPhoto(file);
  };

  const handleRecognize = async () => {
    if (!photo) {
      return;
    }

    setIsRecognizing(true);
    setRecognizeError("");

    try {
      const image = await downscaleImage(photo);
      const result = await recognizeInvoice(image);

      const lines = result.items.map((item) => createLine(item, DEFAULT_CATEGORY));

      setState({
        invoiceNumber: result.invoiceNumber,
        confidence: result.confidence,
        text: result.text,
        lines,
      });
      setPhoto(null);

      lines.forEach((line) => searchDb(line.id, line.query, line.ean, true));
    } catch (error) {
      console.error("Ошибка распознавания фактуры:", error);
      setRecognizeError(t("recognizeError"));
    } finally {
      setIsRecognizing(false);
    }
  };

  const handleConfirm = async (line: InvoiceLine, candidate: ProductCandidate) => {
    updateLine(line.id, { confirming: true, error: "" });

    try {
      let productId = candidate.productId;
      let category = candidate.category;

      // Товар из Open Food Facts: запрос по штрихкоду сохраняет его в нашей базе
      if (!productId) {
        const { data } = await getProductByBarcode(candidate.barcode);

        if (!data) {
          throw new Error("Product not found");
        }

        productId = data.id;
        category = data.category;
      }

      const productCategory = category || DEFAULT_CATEGORY;

      updateLine(line.id, {
        confirming: false,
        selected: { ...candidate, productId, category: productCategory },
        category: productCategory,
      });
    } catch (error) {
      console.error("Ошибка выбора товара:", error);
      updateLine(line.id, { confirming: false, error: t("selectError") });
    }
  };

  const handleSave = async (line: InvoiceLine) => {
    if (!line.selected) {
      return;
    }

    const quantity = Number(line.quantity.trim());
    const priceNetto = parseDecimal(line.priceNetto);

    const error = !Number.isInteger(quantity) || quantity < 1
      ? t("quantityInvalid")
      : !line.expirationDate
        ? t("expirationRequired")
        : line.priceNetto.trim() === "" || !(priceNetto >= 0)
          ? t("priceInvalid")
          : "";

    if (error) {
      updateLine(line.id, { error });
      return;
    }

    const batch = makeBatchCode(user);

    updateLine(line.id, { status: "saving", error: "" });

    try {
      // Категория (ставка VAT) хранится у товара — обновляем, если выбрали другую
      if (line.category !== line.selected.category) {
        await updateProductByBarcode(line.selected.barcode, {
          category: line.category,
        });
      }

      await createInventoryIntake({
        productId: line.selected.productId,
        quantity,
        batch,
        expirationDate: line.expirationDate,
        priceNetto,
      });

      updateLine(line.id, {
        status: "done",
        batch,
        selected: { ...line.selected, category: line.category },
      });
    } catch (saveError) {
      console.error("Ошибка приёмки партии:", saveError);
      updateLine(line.id, { status: "pending", error: t("saveError") });
    }
  };

  const handleAddLine = () => {
    setState((current) =>
      current
        ? {
            ...current,
            lines: [...current.lines, { ...createLine(null, DEFAULT_CATEGORY), dbStatus: "done", dbCandidates: [] }],
          }
        : current,
    );
  };

  const handleNewInvoice = () => {
    const hasPending = state?.lines.some((line) => line.status === "pending");

    if (hasPending && !window.confirm(t("newInvoiceConfirm"))) {
      return;
    }

    setState(null);
    setPhoto(null);
  };

  const doneCount = state?.lines.filter((line) => line.status === "done").length ?? 0;
  const activeCount = state?.lines.filter((line) => line.status !== "skipped").length ?? 0;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t("title")}</h1>
        <p className={styles.subtitle}>{t("subtitle")}</p>
      </header>

      <div className={styles.content}>
        {!state ? (
          /* ---------- Шаг 1: фото фактуры ---------- */
          <section className={styles.uploadCard}>
            <h2 className={styles.cardTitle}>{t("uploadTitle")}</h2>
            <p className={styles.muted}>{t("uploadHint")}</p>

            {photoPreview ? (
              <div className={styles.photoPreview}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photoPreview} alt={t("uploadTitle")} />
              </div>
            ) : null}

            <label className={styles.photoButton}>
              <Camera size={22} />
              {photo ? t("changePhoto") : t("takePhoto")}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoChange}
                hidden
                disabled={isRecognizing}
              />
            </label>

            {recognizeError && (
              <div className={styles.error} role="alert">
                {recognizeError}
              </div>
            )}

            <button
              type="button"
              className={styles.primaryButton}
              onClick={handleRecognize}
              disabled={!photo || isRecognizing}
            >
              {isRecognizing ? t("recognizing") : t("recognize")}
            </button>
          </section>
        ) : (
          /* ---------- Шаг 2: позиции фактуры ---------- */
          <>
            <section className={styles.summary}>
              <div className={styles.summaryInfo}>
                <span className={styles.summaryTitle}>
                  {state.invoiceNumber
                    ? t("invoiceNumber", { number: state.invoiceNumber })
                    : t("noInvoiceNumber")}
                </span>
                <span className={styles.summaryMeta}>
                  {t("progress", { done: doneCount, total: activeCount })} ·{" "}
                  {t("batchInfo", { batch: makeBatchCode(user) })}
                </span>
              </div>

              <button
                type="button"
                className={styles.secondaryButton}
                onClick={handleNewInvoice}
              >
                <RefreshCw size={15} />
                {t("newInvoice")}
              </button>
            </section>

            {state.confidence < 60 && (
              <div className={styles.warningBox}>{t("lowConfidence")}</div>
            )}

            {state.lines.length === 0 && (
              <div className={styles.warningBox}>{t("noItems")}</div>
            )}

            <div className={styles.lines}>
              {state.lines.map((line, index) => (
                <InvoiceLineCard
                  key={line.id}
                  line={line}
                  index={index}
                  onChange={(patch) => updateLine(line.id, patch)}
                  onSearch={(source) =>
                    source === "db"
                      ? searchDb(line.id, line.query, null, false)
                      : searchOff(line.id, line.query)
                  }
                  onConfirm={(candidate) => handleConfirm(line, candidate)}
                  onSave={() => handleSave(line)}
                  onRemove={() =>
                    setState((current) =>
                      current
                        ? {
                            ...current,
                            lines: current.lines.filter((item) => item.id !== line.id),
                          }
                        : current,
                    )
                  }
                />
              ))}
            </div>

            <button
              type="button"
              className={styles.secondaryButton}
              onClick={handleAddLine}
            >
              <FilePlus2 size={15} />
              {t("addLine")}
            </button>

            <details className={styles.rawText}>
              <summary>{t("showText")}</summary>
              <pre>{state.text}</pre>
            </details>
          </>
        )}
      </div>
    </div>
  );
}
