"use client";

import { useMemo, useState } from "react";
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

import styles from "./Report.module.css";

/* =========================================================
   TYPES
========================================================= */

export interface InventoryReportRow {
  id: string;
  name: string;
  category: string;
  barcode: string;
  expirationDate: string;
  intakeDate: string;
  daysToExpiration: number;
  discountedQuantity: number;
  writtenOffQuantity: number;
  actualQuantity: number;
  dailyConsumption: number;
  monthlyConsumption: number;
  shelfPrice: number;
  shelfPriceBrutto: number;
  shelfPriceNetto: number;
}

type SortKey = keyof InventoryReportRow;

type SortDirection = "asc" | "desc";

/* =========================================================
   MOCK DATA
========================================================= */

const MOCK_DATA: InventoryReportRow[] = [
  {
    id: "1",
    name: "Ketchup łagodny Pudliszki 480g",
    category: "33 (Vat 8%)",
    barcode: "5900783000424",
    expirationDate: "2026-10-15",
    intakeDate: "2026-09-21",
    daysToExpiration: 10,
    discountedQuantity: 4,
    writtenOffQuantity: 8,
    actualQuantity: 12,
    dailyConsumption: 2.5,
    monthlyConsumption: 75,
    shelfPrice: 7.5,
    shelfPriceBrutto: 8.1,
    shelfPriceNetto: 7.5,
  },
  {
    id: "2",
    name: "Mleko Świeże 3.2% 1L",
    category: "Молочные продукты",
    barcode: "5901234567890",
    expirationDate: "2026-10-08",
    intakeDate: "2026-10-01",
    daysToExpiration: 3,
    discountedQuantity: 2,
    writtenOffQuantity: 0,
    actualQuantity: 18,
    dailyConsumption: 6,
    monthlyConsumption: 180,
    shelfPrice: 4.2,
    shelfPriceBrutto: 4.54,
    shelfPriceNetto: 4.2,
  },
  {
    id: "3",
    name: "Chleb pszenny krojony 500g",
    category: "Выпечка",
    barcode: "5901112223334",
    expirationDate: "2026-10-20",
    intakeDate: "2026-10-03",
    daysToExpiration: 15,
    discountedQuantity: 0,
    writtenOffQuantity: 1,
    actualQuantity: 24,
    dailyConsumption: 4,
    monthlyConsumption: 120,
    shelfPrice: 5.5,
    shelfPriceBrutto: 5.94,
    shelfPriceNetto: 5.5,
  },
  {
    id: "4",
    name: "Ser Gouda Hochland 150g",
    category: "Молочные продукты",
    barcode: "5901234567123",
    expirationDate: "2026-10-06",
    intakeDate: "2026-09-28",
    daysToExpiration: 1,
    discountedQuantity: 6,
    writtenOffQuantity: 2,
    actualQuantity: 9,
    dailyConsumption: 1.8,
    monthlyConsumption: 54,
    shelfPrice: 8.99,
    shelfPriceBrutto: 9.71,
    shelfPriceNetto: 8.99,
  },
  {
    id: "5",
    name: "Bułka pszenna 100g",
    category: "Выпечка",
    barcode: "5909876543210",
    expirationDate: "2026-10-12",
    intakeDate: "2026-10-04",
    daysToExpiration: 7,
    discountedQuantity: 3,
    writtenOffQuantity: 0,
    actualQuantity: 31,
    dailyConsumption: 5.2,
    monthlyConsumption: 156,
    shelfPrice: 1.99,
    shelfPriceBrutto: 2.15,
    shelfPriceNetto: 1.99,
  },
];

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
  const isActive = currentSortKey === sort;

  return (
    <button
      type="button"
      className={styles["report-sort-button"]}
      onClick={() => onSort(sort)}
      title={
        isActive
          ? sortDirection === "asc"
            ? "Сортировка по убыванию"
            : "Сортировка по возрастанию"
          : "Сортировать"
      }
    >
      <span>{label}</span>

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

  const categories = [
    {
      value: "",
      label: t("categories.all"),
    },
    {
      value: "33 (Vat 8%)",
      label: "33 (Vat 8%)",
    },
    {
      value: "Молочные продукты",
      label: t("categories.dairy"),
    },
    {
      value: "Выпечка",
      label: t("categories.bakery"),
    },
  ];

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
    let result = MOCK_DATA.filter((row) => {
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
        !maxDaysToExp || row.daysToExpiration <= Number(maxDaysToExp);

      /* Ревизия */
      const matchesAudit = (() => {
        if (!auditDaysFilter) {
          return true;
        }

        const auditDays = Number(auditDaysFilter);

        if (Number.isNaN(auditDays)) {
          return true;
        }

        /*
         * Пока используется intakeDate.
         * После появления auditDate здесь можно заменить
         * row.intakeDate на row.auditDate.
         */
        const intakeDate = new Date(row.intakeDate);
        const today = new Date();

        const difference =
          Math.abs(today.getTime() - intakeDate.getTime()) /
          (1000 * 60 * 60 * 24);

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

    const rows = filteredData.map((row) => [
      row.name,
      row.category,
      row.barcode,
      row.expirationDate,
      row.intakeDate,
      row.daysToExpiration,
      row.discountedQuantity,
      row.writtenOffQuantity,
      row.actualQuantity,
      row.dailyConsumption,
      row.monthlyConsumption,
      row.shelfPrice.toFixed(2),
      row.shelfPriceBrutto.toFixed(2),
      row.shelfPriceNetto.toFixed(2),
    ]);

    const csv = [headers, ...rows]
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
              {filteredData.length === 0 ? (
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
                  const isCritical = row.daysToExpiration <= 7;

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
                        <span className={styles["report-category"]}>
                          {row.category}
                        </span>
                      </td>

                      {/* 3. Штрихкод */}

                      <td>
                        <span className={styles["report-barcode"]}>
                          {row.barcode}
                        </span>
                      </td>

                      {/* 4. Срок годности */}

                      <td>
                        <span
                          className={
                            isCritical
                              ? `${styles["report-date"]} ${styles["report-date-critical"]}`
                              : styles["report-date"]
                          }
                        >
                          {row.expirationDate}
                        </span>
                      </td>

                      {/* 5. Поступление */}

                      <td>{row.intakeDate}</td>

                      {/* 6. Остаток дней */}

                      <td>
                        {isCritical ? (
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
                        <span className={styles["report-actual-value"]}>
                          {row.actualQuantity} {t("units.pieces")}
                        </span>
                      </td>

                      {/* 10. Расход / день */}

                      <td>{row.dailyConsumption}</td>

                      {/* 11. Расход / месяц */}

                      <td>{row.monthlyConsumption}</td>

                      {/* 12. Цена полка */}

                      <td>
                        <strong>{row.shelfPrice.toFixed(2)} zł</strong>
                      </td>

                      {/* 13. Brutto */}

                      <td>{row.shelfPriceBrutto.toFixed(2)} zł</td>

                      {/* 14. Netto */}

                      <td>{row.shelfPriceNetto.toFixed(2)} zł</td>
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
