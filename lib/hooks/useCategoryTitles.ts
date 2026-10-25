"use client";

import { useEffect, useMemo, useState } from "react";

import { getCategories } from "@/lib/api/clientApi";
import { DEFAULT_CATEGORY } from "@/lib/constants/products";

/**
 * Названия категорий из справочника бэкенда (GET /categories).
 * «Другое» есть всегда — это значение по умолчанию у товара, в справочнике его нет.
 * Если справочник не загрузился, в списке остаётся только «Другое».
 */
export function useCategoryTitles(): string[] {
  const [titles, setTitles] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    getCategories()
      .then((response) => {
        if (!cancelled) {
          setTitles((response.data ?? []).map((category) => category.title));
        }
      })
      .catch((error) => {
        console.error("Ошибка загрузки категорий:", error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return useMemo(
    () =>
      titles.includes(DEFAULT_CATEGORY) ? titles : [...titles, DEFAULT_CATEGORY],
    [titles],
  );
}
