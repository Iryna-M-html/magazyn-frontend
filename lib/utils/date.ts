// Единый формат дат в интерфейсе: dd.mm.yyyy (и dd.mm.yyyy HH:mm для даты со временем)

const pad = (value: number) => String(value).padStart(2, "0");

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})/;

/**
 * Дата без времени, например срок годности: «2026-10-15» или «2026-10-15T00:00:00.000Z» → «15.10.2026».
 * Календарная дата берётся из строки как есть, без перевода в часовой пояс браузера,
 * иначе полночь UTC в западных часовых поясах превращалась бы в предыдущий день.
 */
export function formatDate(value?: string | null, fallback = "—"): string {
  if (!value) {
    return fallback;
  }

  const match = DATE_ONLY_PATTERN.exec(value);

  if (match) {
    const [, year, month, day] = match;
    return `${day}.${month}.${year}`;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
}

/** Момент времени, например дата ревизии: «2026-10-05T10:37:36Z» → «05.10.2026 12:37» (местное время). */
export function formatDateTime(value?: string | null, fallback = "—"): string {
  if (!value) {
    return fallback;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
