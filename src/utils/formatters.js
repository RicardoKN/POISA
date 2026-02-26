/**
 * Format a number as BWP currency.
 * Always use this — never format money inline.
 */
export function formatCurrency(amount) {
  return `BWP ${Number(amount).toLocaleString('en-BW', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

/**
 * Format a date string for display.
 */
export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-BW', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Format a date string with time.
 */
export function formatDateTime(dateString) {
  return new Date(dateString).toLocaleString('en-BW', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
