"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  Globe,
  Package,
  RotateCcw,
  Search,
  Trash2,
  ZoomIn,
} from "lucide-react";

import { ImageModal } from "@/components/ImageModal/ImageModal";
import { DEFAULT_CATEGORY } from "@/lib/constants/products";
import { useCategoryTitles } from "@/lib/hooks/useCategoryTitles";
import { parseVatRate } from "@/lib/utils/vat";
import type { ProductCandidate } from "@/types/invoice";

import type { InvoiceLine } from "./invoiceLine";
import styles from "./Invoice.module.css";

interface InvoiceLineCardProps {
  line: InvoiceLine;
  index: number;
  onChange: (patch: Partial<InvoiceLine>) => void;
  onSearch: (source: "db" | "off") => void;
  onConfirm: (candidate: ProductCandidate) => void;
  onSave: () => void;
  onRemove: () => void;
}

// Open Food Facts в поиске отдаёт превью 100/200px — для увеличения берём версию 400px
const getLargeImageUrl = (url: string) =>
  url.replace(/.(100|200).jpg$/, ".400.jpg");

const formatWeight = (candidate: ProductCandidate) =>
  candidate.productQuantity
    ? `${candidate.productQuantity} ${candidate.productQuantityUnit ?? ""}`.trim()
    : null;

export function InvoiceLineCard({
  line,
  index,
  onChange,
  onSearch,
  onConfirm,
  onSave,
  onRemove,
}: InvoiceLineCardProps) {
  const t = useTranslations("Invoice");
  const categoryTitles = useCategoryTitles();
  const [zoomed, setZoomed] = useState<ProductCandidate | null>(null);

  const isDone = line.status === "done";
  const isSkipped = line.status === "skipped";
  const isSaving = line.status === "saving";

  const categoryVat = parseVatRate(line.category);
  const vatMismatch =
    line.vatRate !== null && categoryVat !== null && categoryVat !== line.vatRate;

  // Фото товара: по клику открывается крупно — чтобы сверить упаковку перед подтверждением
  const renderImage = (candidate: ProductCandidate) =>
    candidate.imageUrl ? (
      <button
        type="button"
        className={styles.candidateImage}
        onClick={() => setZoomed(candidate)}
        title={t("zoomPhoto")}
        aria-label={t("zoomPhoto")}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={candidate.imageUrl} alt={candidate.name} />
        <span className={styles.zoomBadge} aria-hidden="true">
          <ZoomIn size={12} />
        </span>
      </button>
    ) : (
      <div className={styles.candidateImage}>
        <Package size={20} />
      </div>
    );

  const renderCandidates = (
    candidates: ProductCandidate[] | null,
    status: InvoiceLine["dbStatus"],
  ) => {
    if (status === "loading") {
      return <p className={styles.muted}>{t("searching")}</p>;
    }

    if (status === "queued") {
      return <p className={styles.muted}>{t("offQueued")}</p>;
    }

    if (status === "error") {
      return <p className={styles.warningText}>{t("offError")}</p>;
    }

    if (!candidates) {
      return null;
    }

    if (candidates.length === 0) {
      return <p className={styles.muted}>{t("noCandidates")}</p>;
    }

    return (
      <ul className={styles.candidateList}>
        {candidates.map((candidate) => (
          <li key={`${candidate.source}-${candidate.barcode}`} className={styles.candidate}>
            {renderImage(candidate)}

            <div className={styles.candidateInfo}>
              <span className={styles.candidateName}>{candidate.name}</span>
              <span className={styles.candidateMeta}>
                {[candidate.brand, formatWeight(candidate), candidate.barcode]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
              <span
                className={`${styles.score} ${
                  candidate.score >= 70
                    ? styles.scoreHigh
                    : candidate.score >= 50
                      ? styles.scoreMedium
                      : styles.scoreLow
                }`}
              >
                {t("match", { score: candidate.score })}
              </span>
            </div>

            <button
              type="button"
              className={styles.confirmButton}
              onClick={() => onConfirm(candidate)}
              disabled={line.confirming}
            >
              {t("confirm")}
            </button>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <article
      className={`${styles.lineCard} ${isDone ? styles.lineDone : ""} ${
        isSkipped ? styles.lineSkipped : ""
      }`}
    >
      <header className={styles.lineHeader}>
        <span className={styles.lineIndex}>{index + 1}</span>

        <div className={styles.lineSource}>
          {line.sourceLine ? (
            <>
              <span className={styles.lineLabel}>{t("fromInvoice")}</span>
              <code className={styles.sourceLine}>{line.sourceLine}</code>
            </>
          ) : (
            <span className={styles.lineLabel}>{t("manualLine")}</span>
          )}
        </div>

        {!isDone && (
          <button
            type="button"
            className={styles.iconButton}
            onClick={() => onChange({ status: isSkipped ? "pending" : "skipped" })}
            title={isSkipped ? t("restore") : t("skip")}
            aria-label={isSkipped ? t("restore") : t("skip")}
          >
            {isSkipped ? <RotateCcw size={16} /> : <Trash2 size={16} />}
          </button>
        )}

        {isSkipped && !line.sourceLine && (
          <button type="button" className={styles.linkButton} onClick={onRemove}>
            {t("remove")}
          </button>
        )}
      </header>

      {isSkipped ? (
        <p className={styles.muted}>{t("skipped")}</p>
      ) : isDone ? (
        <div className={styles.doneBox}>
          <CheckCircle2 size={20} />
          <div>
            <strong>{line.selected?.name}</strong>
            <span>
              {t("done", {
                quantity: line.quantity,
                batch: line.batch,
              })}
            </span>
          </div>
        </div>
      ) : line.selected ? (
        /* ---------- Товар подтверждён: данные партии ---------- */
        <div className={styles.intakeForm}>
          <div className={styles.selectedProduct}>
            {renderImage(line.selected)}

            <div className={styles.candidateInfo}>
              <span className={styles.candidateName}>{line.selected.name}</span>
              <span className={styles.candidateMeta}>
                {[line.selected.brand, formatWeight(line.selected), line.selected.barcode]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </div>

            <button
              type="button"
              className={styles.linkButton}
              onClick={() => onChange({ selected: null, error: "" })}
              disabled={isSaving}
            >
              {t("change")}
            </button>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label htmlFor={`qty-${line.id}`}>{t("quantity")}</label>
              <input
                id={`qty-${line.id}`}
                type="text"
                inputMode="numeric"
                value={line.quantity}
                onChange={(event) => onChange({ quantity: event.target.value })}
                disabled={isSaving}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor={`exp-${line.id}`}>{t("expirationDate")}</label>
              <input
                id={`exp-${line.id}`}
                type="date"
                value={line.expirationDate}
                onChange={(event) => onChange({ expirationDate: event.target.value })}
                disabled={isSaving}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor={`price-${line.id}`}>{t("priceNetto")}</label>
              <input
                id={`price-${line.id}`}
                type="text"
                inputMode="decimal"
                value={line.priceNetto}
                onChange={(event) => onChange({ priceNetto: event.target.value })}
                disabled={isSaving}
              />
              {line.priceUnverified && (
                <span className={styles.fieldHint}>{t("priceUnverified")}</span>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor={`cat-${line.id}`}>{t("category")}</label>
              <select
                id={`cat-${line.id}`}
                value={line.category}
                onChange={(event) => onChange({ category: event.target.value })}
                disabled={isSaving}
              >
                {(categoryTitles.includes(line.category)
                  ? categoryTitles
                  : [line.category, ...categoryTitles]
                ).map((title) => (
                  <option key={title} value={title}>
                    {title === DEFAULT_CATEGORY ? t("otherCategory") : title}
                  </option>
                ))}
              </select>
              {line.vatRate !== null && (
                <span className={vatMismatch ? styles.warningText : styles.fieldHint}>
                  {vatMismatch
                    ? t("vatMismatch", { category: categoryVat ?? 0, invoice: line.vatRate })
                    : t("invoiceVat", { rate: line.vatRate })}
                </span>
              )}
            </div>
          </div>

          {line.error && (
            <div className={styles.error} role="alert">
              {line.error}
            </div>
          )}

          <button
            type="button"
            className={styles.primaryButton}
            onClick={onSave}
            disabled={isSaving}
          >
            {isSaving ? t("saving") : t("accept")}
          </button>
        </div>
      ) : (
        /* ---------- Подбор товара ---------- */
        <div className={styles.matching}>
          <div className={styles.searchRow}>
            <input
              type="text"
              value={line.query}
              placeholder={t("searchPlaceholder")}
              aria-label={t("searchPlaceholder")}
              onChange={(event) => onChange({ query: event.target.value })}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  onSearch("db");
                }
              }}
            />
            <button
              type="button"
              className={styles.iconButton}
              onClick={() => onSearch("db")}
              title={t("search")}
              aria-label={t("search")}
            >
              <Search size={16} />
            </button>
          </div>

          <section className={styles.sourceBlock}>
            <h4 className={styles.sourceTitle}>
              <Database size={14} />
              {t("dbTitle")}
            </h4>
            {renderCandidates(line.dbCandidates, line.dbStatus)}
          </section>

          <section className={styles.sourceBlock}>
            <h4 className={styles.sourceTitle}>
              <Globe size={14} />
              {t("offTitle")}
            </h4>
            {line.offStatus === "idle" ? (
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => onSearch("off")}
              >
                {t("searchOff")}
              </button>
            ) : (
              renderCandidates(line.offCandidates, line.offStatus)
            )}
            {line.offStatus === "error" && (
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => onSearch("off")}
              >
                {t("retry")}
              </button>
            )}
          </section>

          {line.error && (
            <div className={styles.error} role="alert">
              <AlertTriangle size={16} />
              {line.error}
            </div>
          )}

          <Link
            href={`/sprzedawca/create?name=${encodeURIComponent(line.query)}&returnTo=/invoice`}
            className={styles.addNewLink}
          >
            {t("notFoundAddNew")}
          </Link>
        </div>
      )}

      {zoomed?.imageUrl && (
        <ImageModal
          imageUrl={getLargeImageUrl(zoomed.imageUrl)}
          altText={zoomed.name}
          onClose={() => setZoomed(null)}
        />
      )}
    </article>
  );
}
