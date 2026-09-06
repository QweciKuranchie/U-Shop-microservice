/**
 * Format a GHS price amount for display.
 * Matches the formatting convention used throughout UShop.
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a date string or Date object for display.
 */
export function formatDate(
  date: string | Date,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(
    "en-GH",
    options || {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  ).format(d);
}

/**
 * Truncate a string to a given length with an ellipsis.
 */
export function truncate(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}
