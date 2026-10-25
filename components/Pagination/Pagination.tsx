"use client";

import { useTranslations } from "next-intl";
import styles from "./Pagination.module.css";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const t = useTranslations("Pagination");

  if (totalPages <= 1) return null;

  return (
    <div className={styles.pagination}>
      <button
        className={styles.pageBtn}
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        ‹
      </button>

      <span className={styles.pageInfo}>
        {t("pageOf", { current: currentPage, total: totalPages })}
      </span>

      <button
        className={styles.pageBtn}
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        ›
      </button>
    </div>
  );
}
