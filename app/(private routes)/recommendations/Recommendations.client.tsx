"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  Package,
  Search,
  TrendingUp,
} from "lucide-react";

import { getAllIntakes } from "@/lib/api/clientApi";
import { formatDate, getDaysUntil } from "@/lib/utils/date";

import styles from "./Recommendations.module.css";

/* =========================================================
   TYPES
========================================================= */

interface IntakeResponseItem {
  _id: string;
  batch?: string;
  expirationDate?: string | null;
  quantity: number;
  discountedQuantity?: number;
  writtenOffQuantity?: number;
  remainingQuantity?: number;
  productId: {
    _id: string;
    name: string;
    barcode: string;
    brand?: string;
    imageUrl?: string;
    productQuantity?: number | null;
    productQuantityUnit?: string;
  } | null;
}

interface Batch {
  id: string;
  batch: string;
  expirationDate: string | null;
  daysLeft: number | null;
  remaining: number;
}

interface ProductGroup {
  product: NonNullable<IntakeResponseItem["productId"]>;
  /** Партии с остатком, от ближайшего срока к дальнему */
  batches: Batch[];
  /** Ближайшая непросроченная партия — её продаём первой */
  sellFirst: Batch | null;
  expired: Batch[];
}

/* =========================================================
   DATA
========================================================= */

// Сравнение по сроку: без даты — в конце
const compareByExpiration = (a: Batch, b: Batch) =>
  (a.expirationDate ?? "9999").localeCompare(b.expirationDate ?? "9999");

function groupByProduct(items: IntakeResponseItem[]): ProductGroup[] {
  const groups = new Map<string, ProductGroup>();

  for (const item of items) {
    if (!item.productId) {
      continue;
    }

    const remaining =
      item.remainingQuantity ??
      item.quantity -
        ((item.discountedQuantity ?? 0) + (item.writtenOffQuantity ?? 0));

    if (remaining <= 0) {
      continue;
    }

    const expirationDate = item.expirationDate?.slice(0, 10) ?? null;

    const batch: Batch = {
      id: item._id,
      batch: item.batch ?? "",
      expirationDate,
      daysLeft: getDaysUntil(expirationDate),
      remaining,
    };

    const group = groups.get(item.productId._id) ?? {
      product: item.productId,
      batches: [],
      sellFirst: null,
      expired: [],
    };

    group.batches.push(batch);
    groups.set(item.productId._id, group);
  }

  return Array.from(groups.values())
    .map((group) => {
      const batches = [...group.batches].sort(compareByExpiration);

      return {
        ...group,
        batches,
        sellFirst:
          batches.find(
            (batch) => batch.daysLeft === null || batch.daysLeft >= 0,
          ) ?? null,
        expired: batches.filter(
          (batch) => batch.daysLeft !== null && batch.daysLeft < 0,
        ),
      };
    })
    .sort((a, b) => compareByExpiration(a.batches[0], b.batches[0]));
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function RecommendationsClient() {
  const router = useRouter();
  const t = useTranslations("Recommendations");
  const tCommon = useTranslations("Common");

  const [groups, setGroups] = useState<ProductGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let cancelled = false;

    getAllIntakes()
      .then((response) => {
        if (!cancelled) {
          setGroups(groupByProduct(response?.data ?? []));
        }
      })
      .catch((error) => {
        console.error("Ошибка загрузки партий:", error);

        if (!cancelled) {
          setLoadError(true);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredGroups = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    if (!query) {
      return groups;
    }

    return groups.filter(
      ({ product }) =>
        product.name.toLowerCase().includes(query) ||
        product.barcode.includes(query),
    );
  }, [groups, searchQuery]);

  const bold = (chunks: ReactNode) => <strong>{chunks}</strong>;

  const renderDaysBadge = (batch: Batch) => {
    if (batch.daysLeft === null) {
      return null;
    }

    if (batch.daysLeft < 0) {
      return (
        <span className={`${styles.badge} ${styles.badgeDanger}`}>
          {t("expired")}
        </span>
      );
    }

    return (
      <span
        className={`${styles.badge} ${
          batch.daysLeft <= 7 ? styles.badgeWarning : styles.badgeNeutral
        }`}
      >
        {batch.daysLeft === 0
          ? t("today")
          : t("daysLeft", { count: batch.daysLeft })}
      </span>
    );
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => router.push("/sprzedawca")}
          aria-label={tCommon("back")}
        >
          <ArrowLeft size={22} />
        </button>

        <div className={styles.headerText}>
          <h1 className={styles.title}>{t("title")}</h1>

          <p className={styles.subtitle}>
            {t("subtitle")}
            {!loading && !loadError && (
              <> · {t("productsCount", { count: filteredGroups.length })}</>
            )}
          </p>
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />

          <input
            type="text"
            value={searchQuery}
            placeholder={t("searchPlaceholder")}
            onChange={(event) => setSearchQuery(event.target.value)}
            className={styles.searchInput}
          />
        </div>

        {loading || loadError ? (
          <div className={styles.state}>
            {loading ? t("loading") : t("loadError")}
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className={styles.state}>
            {groups.length === 0 ? t("empty") : t("emptySearch")}
          </div>
        ) : (
          <div className={styles.list}>
            {filteredGroups.map(({ product, batches, sellFirst, expired }) => (
              <article key={product._id} className={styles.card}>
                {/* Товар */}
                <div className={styles.product}>
                  <div className={styles.imageWrapper}>
                    {product.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className={styles.image}
                      />
                    ) : (
                      <div className={styles.noImage}>
                        <Package size={26} />
                        <span>{t("noImage")}</span>
                      </div>
                    )}
                  </div>

                  <div className={styles.productInfo}>
                    <h2 className={styles.productName}>{product.name}</h2>

                    <dl className={styles.details}>
                      <div>
                        <dt>{t("brand")}</dt>
                        <dd>{product.brand || t("noData")}</dd>
                      </div>

                      <div>
                        <dt>{t("weight")}</dt>
                        <dd>
                          {product.productQuantity
                            ? `${product.productQuantity} ${product.productQuantityUnit ?? ""}`.trim()
                            : t("noData")}
                        </dd>
                      </div>

                      <div>
                        <dt>{t("barcode")}</dt>
                        <dd className={styles.barcode}>{product.barcode}</dd>
                      </div>
                    </dl>
                  </div>
                </div>

                {/* Рекомендации */}
                {expired.map((batch) => (
                  <div
                    key={batch.id}
                    className={`${styles.alert} ${styles.alertDanger}`}
                  >
                    <AlertTriangle size={18} />
                    <p>
                      {t.rich("writeOff", {
                        date: formatDate(batch.expirationDate),
                        count: batch.remaining,
                        b: bold,
                      })}
                    </p>
                  </div>
                ))}

                {sellFirst && (
                  <div className={`${styles.alert} ${styles.alertSell}`}>
                    <TrendingUp size={18} />
                    <p>
                      {t.rich("sellFirst", {
                        date: formatDate(sellFirst.expirationDate, t("noData")),
                        count: sellFirst.remaining,
                        b: bold,
                      })}
                    </p>
                  </div>
                )}

                {/* Все партии с остатком */}
                <h3 className={styles.batchesTitle}>
                  {t("batchesTitle", { count: batches.length })}
                </h3>

                <ul className={styles.batchList}>
                  {batches.map((batch) => (
                    <li key={batch.id}>
                      <Link
                        href={`/inventory/${batch.id}`}
                        className={`${styles.batchRow} ${
                          batch.id === sellFirst?.id
                            ? styles.batchRowSellFirst
                            : batch.daysLeft !== null && batch.daysLeft < 0
                              ? styles.batchRowExpired
                              : ""
                        }`}
                      >
                        <div className={styles.batchMain}>
                          <span className={styles.batchDate}>
                            {formatDate(batch.expirationDate, t("noData"))}
                          </span>

                          <span className={styles.batchCode}>
                            {t("batch")}: {batch.batch || "—"}
                          </span>
                        </div>

                        <div className={styles.batchSide}>
                          {batch.id === sellFirst?.id && (
                            <span className={`${styles.badge} ${styles.badgeSell}`}>
                              {t("sellFirstBadge")}
                            </span>
                          )}

                          {renderDaysBadge(batch)}

                          <span className={styles.batchQuantity}>
                            {t("pieces", { count: batch.remaining })}
                          </span>

                          <ChevronRight size={18} className={styles.batchArrow} />
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
