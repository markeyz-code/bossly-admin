export function formatNaira(kobo: number | null | undefined, compact = false): string {
  const value = (Number(kobo) || 0) / 100;
  return `₦${new Intl.NumberFormat('en-NG', { notation: compact ? 'compact' : 'standard', maximumFractionDigits: compact ? 1 : Number.isInteger(value) ? 0 : 2 }).format(value)}`;
}
export function formatCompactNaira(kobo: number): string {
  return formatNaira(kobo, true);
}
export function formatNumber(value: number | null | undefined): string {
  return new Intl.NumberFormat('en-NG', { notation: 'compact', maximumFractionDigits: 1 }).format(Number(value) || 0);
}
export function formatDate(value?: string | null, withTime = false): string {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-NG', { day: 'numeric', month: 'short', year: 'numeric', ...(withTime ? { hour: 'numeric', minute: '2-digit' } : {}) }).format(new Date(value));
}
export function titleCase(value?: string | null): string {
  return (value || '').replace(/[_-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
