/**
 * formatters.ts
 * Human-readable formatting utilities for simulation metrics.
 */

/** Format minutes into "Xh Ym" or "X min" */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes.toFixed(1)} min`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

/** Format a decimal 0-1 as a percentage string */
export function formatPercent(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/** Format a raw percentage number (0-100) */
export function formatPct(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/** Format bytes to KB / MB string */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

/** Format a simulation timestamp (minutes) to HH:MM */
export function formatSimTime(minutes: number, baseHour = 8): string {
  const totalMinutes = baseHour * 60 + minutes;
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = Math.floor(totalMinutes % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Format a delta value with sign */
export function formatDelta(value: number, unit = '%'): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}${unit}`;
}

/** Round to n decimal places */
export function round(value: number, decimals = 2): number {
  return Math.round(value * 10 ** decimals) / 10 ** decimals;
}

/** Format a simulation run ID for display */
export function formatRunId(id: string): string {
  return id.toUpperCase().slice(0, 10);
}

/** Format date to "Today HH:MM" or "Yesterday" or date string */
export function formatRunDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const oneDay = 86400000;
  if (diff < oneDay && now.getDate() === date.getDate()) {
    return `Today ${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')}`;
  }
  if (diff < 2 * oneDay) return 'Yesterday';
  return date.toLocaleDateString();
}

/** Format elapsed time from ms */
export function formatElapsed(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(1)}s`;
  const m = Math.floor(s / 60);
  const rem = Math.round(s % 60);
  return `${m}m ${rem}s`;
}
