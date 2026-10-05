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
   CATEGORIES
========================================================= */

const CATEGORIES = [
  "Все категории",
  "33 (Vat 8%)",
  "Молочные продукты",
  "Выпечка",
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
  /* -------------------------------------------------------
     FILTERS
  ------------------------------------------------------- */

  const [searchName, setSearchName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchBarcode, setSearchBarcode] = useState("");
  const [maxDaysToExp, setMaxDaysToExp] = useState("");
  const [auditDaysFilter, setAuditDaysFilter] = useState("");

  /* -------------------------------------------------------
     SORT
  ------------------------------------------------------- */

  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

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
      const matchesName = row.name
        .toLowerCase()
        .includes(searchName.toLowerCase().trim());

      const matchesCategory =
        !selectedCategory || row.category === selectedCategory;

      const matchesBarcode = row.barcode
        .toLowerCase()
        .includes(searchBarcode.toLowerCase().trim());

      const matchesExpiration =
        !maxDaysToExp || row.daysToExpiration <= Number(maxDaysToExp);

      const matchesAudit = (() => {
        if (!auditDaysFilter) {
          return true;
        }

        const auditDays = Number(auditDaysFilter);

        if (Number.isNaN(auditDays)) {
          return true;
        }

        /*
         * Сейчас вместо auditDate используется intakeDate.
         * Когда появится auditDate, этот блок можно заменить.
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
      "Товар",
      "Категория",
      "Штрихкод",
      "Срок годности",
      "Поступление",
      "Остаток (дни)",
      "Уценено",
      "Списано",
      "Факт (ревизия)",
      "Расход/день",
      "Расход/мес",
      "Цена полка",
      "Brutto",
      "Netto",
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
            <h1 className={styles["report-title"]}>
              Аналитика и инвентаризация
            </h1>

            <p className={styles["report-subtitle"]}>
              Учет остатков, сроков годности, списаний и финансовых показателей
            </p>
          </div>
        </div>

        <div className={styles["report-header-actions"]}>
          <button
            type="button"
            className={`${styles["report-button"]} ${styles["report-button-secondary"]}`}
            onClick={handleResetFilters}
          >
            <RotateCcw size={16} />
            Сбросить
          </button>

          <button
            type="button"
            className={`${styles["report-button"]} ${styles["report-button-primary"]}`}
            onClick={exportCSV}
          >
            <Download size={16} />
            Экспорт CSV
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

            <h2>Фильтрация данных</h2>
          </div>

          <span className={styles["report-results-badge"]}>
            {filteredData.length} записей
          </span>
        </div>

        <div className={styles["report-filters"]}>
          {/* NAME */}

          <div
            className={`${styles["report-filter-field"]} ${styles["report-filter-field-wide"]}`}
          >
            <label htmlFor="search-name">Название товара</label>

            <div className={styles["report-input-wrapper"]}>
              <Search size={16} />

              <input
                id="search-name"
                type="text"
                value={searchName}
                placeholder="Поиск товара..."
                onChange={(event) => setSearchName(event.target.value)}
              />
            </div>
          </div>

          {/* CATEGORY */}

          <div className={styles["report-filter-field"]}>
            <label htmlFor="category">Категория</label>

            <select
              id="category"
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
            >
              {CATEGORIES.map((category) => (
                <option
                  key={category}
                  value={category === "Все категории" ? "" : category}
                >
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* BARCODE */}

          <div className={styles["report-filter-field"]}>
            <label htmlFor="barcode">Штрихкод</label>

            <input
              id="barcode"
              type="text"
              value={searchBarcode}
              placeholder="Введите штрихкод"
              onChange={(event) => setSearchBarcode(event.target.value)}
            />
          </div>

          {/* EXPIRATION */}

          <div className={styles["report-filter-field"]}>
            <label htmlFor="expiration">Срок годности (дней ≤)</label>

            <input
              id="expiration"
              type="number"
              min="0"
              value={maxDaysToExp}
              placeholder="Например, 7"
              onChange={(event) => setMaxDaysToExp(event.target.value)}
            />
          </div>

          {/* AUDIT */}

          <div className={styles["report-filter-field"]}>
            <label htmlFor="audit">Ревизия за последние (дней)</label>

            <input
              id="audit"
              type="number"
              min="0"
              value={auditDaysFilter}
              placeholder="Например, 30"
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
                {/* 1. Товар */}

                <th>
                  <SortableHeader
                    label="Товар"
                    sort="name"
                    currentSortKey={sortKey}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                </th>

                {/* 2. Категория */}

                <th>
                  <SortableHeader
                    label="Категория"
                    sort="category"
                    currentSortKey={sortKey}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                </th>

                {/* 3. Штрихкод */}

                <th>
                  <SortableHeader
                    label="Штрихкод"
                    sort="barcode"
                    currentSortKey={sortKey}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                </th>

                {/* 4. Срок годности */}

                <th>
                  <SortableHeader
                    label="Срок годности"
                    sort="expirationDate"
                    currentSortKey={sortKey}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                </th>

                {/* 5. Поступление */}

                <th>
                  <SortableHeader
                    label="Поступление"
                    sort="intakeDate"
                    currentSortKey={sortKey}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                </th>

                {/* 6. Остаток */}

                <th>
                  <SortableHeader
                    label="Остаток (дни)"
                    sort="daysToExpiration"
                    currentSortKey={sortKey}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                </th>

                {/* 7. Уценено */}

                <th>
                  <SortableHeader
                    label="Уценено"
                    sort="discountedQuantity"
                    currentSortKey={sortKey}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                </th>

                {/* 8. Списано */}

                <th>
                  <SortableHeader
                    label="Списано"
                    sort="writtenOffQuantity"
                    currentSortKey={sortKey}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                </th>

                {/* 9. Факт ревизии */}

                <th className={styles["report-th-audit"]}>
                  <SortableHeader
                    label="Факт (ревизия)"
                    sort="actualQuantity"
                    currentSortKey={sortKey}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                </th>

                {/* 10. Расход / день */}

                <th>
                  <SortableHeader
                    label="Расход/день"
                    sort="dailyConsumption"
                    currentSortKey={sortKey}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                </th>

                {/* 11. Расход / месяц */}

                <th>
                  <SortableHeader
                    label="Расход/мес"
                    sort="monthlyConsumption"
                    currentSortKey={sortKey}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                </th>

                {/* 12. Цена полка */}

                <th>
                  <SortableHeader
                    label="Цена полка"
                    sort="shelfPrice"
                    currentSortKey={sortKey}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                </th>

                {/* 13. Brutto */}

                <th>
                  <SortableHeader
                    label="Brutto"
                    sort="shelfPriceBrutto"
                    currentSortKey={sortKey}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                </th>

                {/* 14. Netto */}

                <th>
                  <SortableHeader
                    label="Netto"
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

                      <strong>Данные не найдены</strong>

                      <span>Попробуйте изменить параметры фильтрации</span>
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
                            {row.daysToExpiration} дн.
                          </span>
                        ) : (
                          <span className={styles["report-days-normal"]}>
                            {row.daysToExpiration} дн.
                          </span>
                        )}
                      </td>

                      {/* 7. Уценено */}

                      <td>
                        {row.discountedQuantity > 0 ? (
                          <span className={styles["report-discounted"]}>
                            {row.discountedQuantity} шт.
                          </span>
                        ) : (
                          <span className={styles["report-muted"]}>—</span>
                        )}
                      </td>

                      {/* 8. Списано */}

                      <td>
                        {row.writtenOffQuantity > 0 ? (
                          <span className={styles["report-written-off"]}>
                            {row.writtenOffQuantity} шт.
                          </span>
                        ) : (
                          <span className={styles["report-muted"]}>—</span>
                        )}
                      </td>

                      {/* 9. Факт ревизии */}

                      <td className={styles["report-actual-cell"]}>
                        <span className={styles["report-actual-value"]}>
                          {row.actualQuantity} шт.
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
            Отображено{" "}
            <strong>
              {filteredData.length > 0 ? `1 - ${filteredData.length}` : "0"}
            </strong>{" "}
            из <strong>{filteredData.length}</strong> записей
          </div>

          <div className={styles["report-pagination"]}>
            <button
              type="button"
              disabled
              className={styles["report-page-button"]}
            >
              Назад
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
              Вперед
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
