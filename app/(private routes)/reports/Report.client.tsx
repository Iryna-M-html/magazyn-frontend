"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowUpDown,
  Download,
  Filter,
  PackageCheck,
  RotateCcw,
  Search,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { getCategories, getInventoryReport } from "@/lib/api/clientApi";
import type { InventoryReportApiRow } from "@/types/report";
import { formatDate } from "@/lib/utils/date";

import styles from "./Report.module.css";

/* =========================================================
   TYPES
========================================================= */

// null — данных нет в базе (в таблице «No data»)
export interface InventoryReportRow {
  id: string;
  name: string;
  category: string | null;
  barcode: string;
  expirationDate: string | null;
  intakeDate: string | null;
  daysToExpiration: number | null;
  discountedQuantity: number;
  writtenOffQuantity: number;
  actualQuantity: number | null;
  lastAuditAt: string | null;
  dailyConsumption: number | null;
  monthlyConsumption: number | null;
  shelfPrice: number | null;
  shelfPriceBrutto: number | null;
  shelfPriceNetto: number | null;
}

type SortKey = keyof InventoryReportRow;

type SortDirection = "asc" | "desc";

/* =========================================================
   DATA
========================================================= */

const MS_PER_DAY = 1000 * 60 * 60 * 24;

// Дней до окончания срока по календарным датам (локальное время)
function getDaysToExpiration(expirationDate: string | null): number | null {
  if (!expirationDate) {
    return null;
  }

  const [year, month, day] = expirationDate.split("-").map(Number);
  const expiration = new Date(year, month - 1, day);

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return Math.round((expiration.getTime() - today.getTime()) / MS_PER_DAY);
}

function toReportRow(row: InventoryReportApiRow): InventoryReportRow {
  return {
    ...row,
    daysToExpiration: getDaysToExpiration(row.expirationDate),
    // Данных о расходе и ставках VAT в базе пока нет
    dailyConsumption: null,
    monthlyConsumption: null,
    shelfPriceBrutto: null,
    shelfPriceNetto: null,
  };
}

/* =========================================================
   SORTABLE HEADER
========================================================= */

interface SortableHeaderProps {
  label: string;
  sort: SortKey;
  currentSortKey: SortKey | null;
  sortDirection: SortDirection;
  onSort: (key: SortKey) => void;
}

function SortableHeader({
  label,
  sort,
  currentSortKey,
  sortDirection,
  onSort,
}: SortableHeaderProps) {
  const t = useTranslations("Reports.sorting");
  const isActive = currentSortKey === sort;

  return (
    <button
      type="button"
      className={styles["report-sort-button"]}
      onClick={() => onSort(sort)}
      title={
        isActive
          ? sortDirection === "asc"
            ? t("descending")
            : t("ascending")
          : t("sort")
      }
    >
      {/* Разрешаем перенос после «/», например «Zużycie/dzień» */}
      <span>
        {label.split("/").map((part, index) => (
          <Fragment key={index}>
            {index > 0 && (
              <>
                /<wbr />
              </>
            )}
            {part}
          </Fragment>
        ))}
      </span>

      <ArrowUpDown
        size={14}
        className={
          isActive
            ? `${styles["report-sort-icon"]} ${styles["report-sort-icon-active"]}`
            : styles["report-sort-icon"]
        }
      />
    </button>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function ReportClient() {
  const t = useTranslations("Reports");

  /* =======================================================
     DATA
  ======================================================= */

  const [rows, setRows] = useState<InventoryReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [categoryTitles, setCategoryTitles] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    getInventoryReport()
      .then((response) => {
        if (!cancelled) {
          setRows(response.data.map(toReportRow));
        }
      })
      .catch((error) => {
        console.error("Ошибка загрузки отчёта:", error);

        if (!cancelled) {
          setLoadError(true);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    // Справочник категорий; если не загрузился — список строится из данных отчёта
    getCategories()
      .then((response) => {
        if (!cancelled) {
          setCategoryTitles(
            (response.data ?? []).map((category) => category.title),
          );
        }
      })
      .catch((error) => {
        console.error("Ошибка загрузки категорий:", error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  /* =======================================================
     FILTERS
  ======================================================= */

  const [searchName, setSearchName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchBarcode, setSearchBarcode] = useState("");
  const [maxDaysToExp, setMaxDaysToExp] = useState("");
  const [auditDaysFilter, setAuditDaysFilter] = useState("");

  /* =======================================================
     SORT
  ======================================================= */

  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  /* =======================================================
     CATEGORIES
  ======================================================= */

  // Категории с бэкенда + категории из данных, которых нет в справочнике (например, «Другое»)
  const categories = useMemo(() => {
    const extraTitles = Array.from(
      new Set(
        rows
          .map((row) => row.category)
          .filter((category): category is string => Boolean(category))
          .filter((category) => !categoryTitles.includes(category)),
      ),
    ).sort((a, b) => a.localeCompare(b));

    return [
      {
        value: "",
        label: t("categories.all"),
      },
      ...[...categoryTitles, ...extraTitles].map((title) => ({
        value: title,
        label: title,
      })),
    ];
  }, [categoryTitles, rows, t]);

  /* =======================================================
     RESET FILTERS
  ======================================================= */

  const handleResetFilters = () => {
    setSearchName("");
    setSelectedCategory("");
    setSearchBarcode("");
    setMaxDaysToExp("");
    setAuditDaysFilter("");
  };

  /* =======================================================
     SORT
  ======================================================= */

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));

      return;
    }

    setSortKey(key);
    setSortDirection("asc");
  };

  /* =======================================================
     FILTER + SORT DATA
  ======================================================= */

  const filteredData = useMemo(() => {
    let result = rows.filter((row) => {
      /* Название */
      const matchesName = row.name
        .toLowerCase()
        .includes(searchName.toLowerCase().trim());

      /* Категория */
      const matchesCategory =
        !selectedCategory || row.category === selectedCategory;

      /* Штрихкод */
      const matchesBarcode = row.barcode
        .toLowerCase()
        .includes(searchBarcode.toLowerCase().trim());

      /* Срок годности */
      const matchesExpiration =
        !maxDaysToExp ||
        (row.daysToExpiration !== null &&
          row.daysToExpiration <= Number(maxDaysToExp));

      /* Ревизия */
      const matchesAudit = (() => {
        if (!auditDaysFilter) {
          return true;
        }

        const auditDays = Number(auditDaysFilter);

        if (Number.isNaN(auditDays)) {
          return true;
        }

        // Последняя ревизия не старше N дней
        if (!row.lastAuditAt) {
          return false;
        }

        const difference =
          (Date.now() - new Date(row.lastAuditAt).getTime()) / MS_PER_DAY;

        return difference <= auditDays;
      })();

      return (
        matchesName &&
        matchesCategory &&
        matchesBarcode &&
        matchesExpiration &&
        matchesAudit
      );
    });

    /* =====================================================
       SORT
    ===================================================== */

    if (sortKey) {
      result = [...result].sort((a, b) => {
        const aValue = a[sortKey];
        const bValue = b[sortKey];

        if (aValue === null || bValue === null) {
          return aValue === bValue ? 0 : aValue === null ? 1 : -1;
        }

        let comparison = 0;

        if (typeof aValue === "number" && typeof bValue === "number") {
          comparison = aValue - bValue;
        } else {
          comparison = String(aValue).localeCompare(String(bValue), "ru", {
            numeric: true,
            sensitivity: "base",
          });
        }

        return sortDirection === "asc" ? comparison : -comparison;
      });
    }

    return result;
  }, [
    rows,
    searchName,
    selectedCategory,
    searchBarcode,
    maxDaysToExp,
    auditDaysFilter,
    sortKey,
    sortDirection,
  ]);

  /* =======================================================
     CSV EXPORT
  ======================================================= */

  const exportCSV = () => {
    const headers = [
      t("table.product"),
      t("table.category"),
      t("table.barcode"),
      t("table.expirationDate"),
      t("table.intakeDate"),
      t("table.daysToExpiration"),
      t("table.discounted"),
      t("table.writtenOff"),
      t("table.actual"),
      t("table.dailyConsumption"),
      t("table.monthlyConsumption"),
      t("table.shelfPrice"),
      t("table.brutto"),
      t("table.netto"),
    ];

    const noData = t("noData");

    const csvRows = filteredData.map((row) => [
      row.name,
      row.category ?? noData,
      row.barcode,
      formatDate(row.expirationDate, noData),
      formatDate(row.intakeDate, noData),
      row.daysToExpiration ?? noData,
      row.discountedQuantity,
      row.writtenOffQuantity,
      row.actualQuantity ?? noData,
      row.dailyConsumption ?? "—",
      row.monthlyConsumption ?? "—",
      row.shelfPrice?.toFixed(2) ?? noData,
      row.shelfPriceBrutto?.toFixed(2) ?? noData,
      row.shelfPriceNetto?.toFixed(2) ?? noData,
    ]);

    const csv = [headers, ...csvRows]
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(";"),
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "inventory-report.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  /* =======================================================
     RENDER
  ======================================================= */

  const noDataCell = (
    <span className={styles["report-muted"]}>{t("noData")}</span>
  );

  return (
    <div className={styles["report-page"]}>
      {/* =================================================
          HEADER
      ================================================= */}

      <div className={styles["report-header"]}>
        <div className={styles["report-title-row"]}>
          <div className={styles["report-title-icon"]}>
            <PackageCheck size={21} />
          </div>

          <div>
            <h1 className={styles["report-title"]}>{t("title")}</h1>

            <p className={styles["report-subtitle"]}>{t("subtitle")}</p>
          </div>
        </div>

        <div className={styles["report-header-actions"]}>
          <button
            type="button"
            className={`${styles["report-button"]} ${styles["report-button-secondary"]}`}
            onClick={handleResetFilters}
          >
            <RotateCcw size={16} />
            {t("actions.reset")}
          </button>

          <button
            type="button"
            className={`${styles["report-button"]} ${styles["report-button-primary"]}`}
            onClick={exportCSV}
          >
            <Download size={16} />
            {t("actions.exportCsv")}
          </button>
        </div>
      </div>

      {/* =================================================
          FILTERS
      ================================================= */}

      <section className={styles["report-card"]}>
        <div className={styles["report-card-header"]}>
          <div className={styles["report-card-heading"]}>
            <Filter size={18} />

            <h2>{t("filters.title")}</h2>
          </div>

          <span className={styles["report-results-badge"]}>
            {t("filters.records", {
              count: filteredData.length,
            })}
          </span>
        </div>

        <div className={styles["report-filters"]}>
          {/* NAME */}

          <div
            className={`${styles["report-filter-field"]} ${styles["report-filter-field-wide"]}`}
          >
            <label htmlFor="search-name">{t("filters.productName")}</label>

            <div className={styles["report-input-wrapper"]}>
              <Search size={16} />

              <input
                id="search-name"
                type="text"
                value={searchName}
                placeholder={t("filters.productNamePlaceholder")}
                onChange={(event) => setSearchName(event.target.value)}
              />
            </div>
          </div>

          {/* CATEGORY */}

          <div className={styles["report-filter-field"]}>
            <label htmlFor="category">{t("filters.category")}</label>

            <select
              id="category"
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
            >
              {categories.map((category) => (
                <option key={category.value || "all"} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* BARCODE */}

          <div className={styles["report-filter-field"]}>
            <label htmlFor="barcode">{t("filters.barcode")}</label>

            <input
              id="barcode"
              type="text"
              value={searchBarcode}
              placeholder={t("filters.barcodePlaceholder")}
              onChange={(event) => setSearchBarcode(event.target.value)}
            />
          </div>

          {/* EXPIRATION */}

          <div className={styles["report-filter-field"]}>
            <label htmlFor="expiration">{t("filters.expiration")}</label>

            <input
              id="expiration"
              type="number"
              min="0"
              value={maxDaysToExp}
              placeholder={t("filters.expirationPlaceholder")}
              onChange={(event) => setMaxDaysToExp(event.target.value)}
            />
          </div>

          {/* AUDIT */}

          <div className={styles["report-filter-field"]}>
            <label htmlFor="audit">{t("filters.audit")}</label>

            <input
              id="audit"
              type="number"
              min="0"
              value={auditDaysFilter}
              placeholder={t("filters.auditPlaceholder")}
              onChange={(event) => setAuditDaysFilter(event.target.value)}
            />
          </div>
        </div>
      </section>

      {/* =================================================
          TABLE
      ================================================= */}

      <section
        className={`${styles["report-card"]} ${styles["report-table-card"]}`}
      >
        <div className={styles["report-table-wrapper"]}>
          <table className={styles["report-table"]}>
            <thead>
              <tr>
                {/* 1 */}

                <th>
                  <SortableHeader
                    label={t("table.product")}
                    sort="name"
                    currentSortKey={sortKey}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                </th>

                {/* 2 */}

                <th>
                  <SortableHeader
                    label={t("table.category")}
                    sort="category"
                    currentSortKey={sortKey}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                </th>

                {/* 3 */}

                <th>
                  <SortableHeader
                    label={t("table.barcode")}
                    sort="barcode"
                    currentSortKey={sortKey}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                </th>

                {/* 4 */}

                <th>
                  <SortableHeader
                    label={t("table.expirationDate")}
                    sort="expirationDate"
                    currentSortKey={sortKey}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                </th>

                {/* 5 */}

                <th>
                  <SortableHeader
                    label={t("table.intakeDate")}
                    sort="intakeDate"
                    currentSortKey={sortKey}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                </th>

                {/* 6 */}

                <th>
                  <SortableHeader
                    label={t("table.daysToExpiration")}
                    sort="daysToExpiration"
                    currentSortKey={sortKey}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                </th>

                {/* 7 */}

                <th>
                  <SortableHeader
                    label={t("table.discounted")}
                    sort="discountedQuantity"
                    currentSortKey={sortKey}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                </th>

                {/* 8 */}

                <th>
                  <SortableHeader
                    label={t("table.writtenOff")}
                    sort="writtenOffQuantity"
                    currentSortKey={sortKey}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                </th>

                {/* 9 */}

                <th className={styles["report-th-audit"]}>
                  <SortableHeader
                    label={t("table.actual")}
                    sort="actualQuantity"
                    currentSortKey={sortKey}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                </th>

                {/* 10 */}

                <th>
                  <SortableHeader
                    label={t("table.dailyConsumption")}
                    sort="dailyConsumption"
                    currentSortKey={sortKey}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                </th>

                {/* 11 */}

                <th>
                  <SortableHeader
                    label={t("table.monthlyConsumption")}
                    sort="monthlyConsumption"
                    currentSortKey={sortKey}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                </th>

                {/* 12 */}

                <th>
                  <SortableHeader
                    label={t("table.shelfPrice")}
                    sort="shelfPrice"
                    currentSortKey={sortKey}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                </th>

                {/* 13 */}

                <th>
                  <SortableHeader
                    label={t("table.brutto")}
                    sort="shelfPriceBrutto"
                    currentSortKey={sortKey}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                </th>

                {/* 14 */}

                <th>
                  <SortableHeader
                    label={t("table.netto")}
                    sort="shelfPriceNetto"
                    currentSortKey={sortKey}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                </th>
              </tr>
            </thead>

            <tbody>
              {loading || loadError ? (
                <tr>
                  <td colSpan={14}>
                    <div className={styles["report-empty"]}>
                      <PackageCheck size={32} />

                      <strong>{loading ? t("loading") : t("loadError")}</strong>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={14}>
                    <div className={styles["report-empty"]}>
                      <PackageCheck size={32} />

                      <strong>{t("empty.title")}</strong>

                      <span>{t("empty.description")}</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((row) => {
                  const isCritical =
                    row.daysToExpiration !== null &&
                    row.daysToExpiration <= 7;

                  return (
                    <tr key={row.id}>
                      {/* 1. Товар */}

                      <td>
                        <div className={styles["report-product-name"]}>
                          {row.name}
                        </div>
                      </td>

                      {/* 2. Категория */}

                      <td>
                        {row.category ? (
                          <span className={styles["report-category"]}>
                            {row.category}
                          </span>
                        ) : (
                          noDataCell
                        )}
                      </td>

                      {/* 3. Штрихкод */}

                      <td>
                        <span className={styles["report-barcode"]}>
                          {row.barcode}
                        </span>
                      </td>

                      {/* 4. Срок годности */}

                      <td>
                        {row.expirationDate ? (
                          <span
                            className={
                              isCritical
                                ? `${styles["report-date"]} ${styles["report-date-critical"]}`
                                : styles["report-date"]
                            }
                          >
                            {formatDate(row.expirationDate)}
                          </span>
                        ) : (
                          noDataCell
                        )}
                      </td>

                      {/* 5. Поступление */}

                      <td>
                        {row.intakeDate ? formatDate(row.intakeDate) : noDataCell}
                      </td>

                      {/* 6. Остаток дней */}

                      <td>
                        {row.daysToExpiration === null ? (
                          noDataCell
                        ) : isCritical ? (
                          <span className={styles["report-critical-badge"]}>
                            <AlertTriangle size={13} />
                            {row.daysToExpiration} {t("units.days")}
                          </span>
                        ) : (
                          <span className={styles["report-days-normal"]}>
                            {row.daysToExpiration} {t("units.days")}
                          </span>
                        )}
                      </td>

                      {/* 7. Уценено */}

                      <td>
                        {row.discountedQuantity > 0 ? (
                          <span className={styles["report-discounted"]}>
                            {row.discountedQuantity} {t("units.pieces")}
                          </span>
                        ) : (
                          <span className={styles["report-muted"]}>—</span>
                        )}
                      </td>

                      {/* 8. Списано */}

                      <td>
                        {row.writtenOffQuantity > 0 ? (
                          <span className={styles["report-written-off"]}>
                            {row.writtenOffQuantity} {t("units.pieces")}
                          </span>
                        ) : (
                          <span className={styles["report-muted"]}>—</span>
                        )}
                      </td>

                      {/* 9. Факт ревизии */}

                      <td className={styles["report-actual-cell"]}>
                        {row.actualQuantity !== null ? (
                          <span className={styles["report-actual-value"]}>
                            {row.actualQuantity} {t("units.pieces")}
                          </span>
                        ) : (
                          noDataCell
                        )}
                      </td>

                      {/* 10. Расход / день */}

                      <td>
                        {row.dailyConsumption ?? (
                          <span className={styles["report-muted"]}>—</span>
                        )}
                      </td>

                      {/* 11. Расход / месяц */}

                      <td>
                        {row.monthlyConsumption ?? (
                          <span className={styles["report-muted"]}>—</span>
                        )}
                      </td>

                      {/* 12. Цена полка */}

                      <td>
                        {row.shelfPrice !== null ? (
                          <strong>{row.shelfPrice.toFixed(2)} zł</strong>
                        ) : (
                          noDataCell
                        )}
                      </td>

                      {/* 13. Brutto */}

                      <td>
                        {row.shelfPriceBrutto !== null
                          ? `${row.shelfPriceBrutto.toFixed(2)} zł`
                          : noDataCell}
                      </td>

                      {/* 14. Netto */}

                      <td>
                        {row.shelfPriceNetto !== null
                          ? `${row.shelfPriceNetto.toFixed(2)} zł`
                          : noDataCell}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* =================================================
            TABLE FOOTER
        ================================================= */}

        <div className={styles["report-table-footer"]}>
          <div className={styles["report-pagination-info"]}>
            {t("pagination.displayed")}{" "}
            <strong>
              {filteredData.length > 0 ? `1 - ${filteredData.length}` : "0"}
            </strong>{" "}
            {t("pagination.of")} <strong>{filteredData.length}</strong>{" "}
            {t("pagination.records")}
          </div>

          <div className={styles["report-pagination"]}>
            <button
              type="button"
              disabled
              className={styles["report-page-button"]}
            >
              {t("pagination.previous")}
            </button>

            <button
              type="button"
              className={`${styles["report-page-button"]} ${styles["report-page-button-active"]}`}
            >
              1
            </button>

            <button
              type="button"
              disabled
              className={styles["report-page-button"]}
            >
              {t("pagination.next")}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
