/**
 * Centralized Date & Time Utility for Asia/Kolkata (IST, UTC+05:30)
 * All website timestamps are generated or formatted through these functions.
 */

export const TIMEZONE_IST = 'Asia/Kolkata';

/**
 * Returns the current Date object in Asia/Kolkata timezone context
 */
export function getNowIST(): Date {
  return new Date();
}

/**
 * Formats a Date or timestamp string to a full localized IST date string
 * Example: "12 Sep 2026, 08:30 PM"
 */
export function formatFullIST(dateInput?: Date | string | number | null): string {
  if (!dateInput) return 'Just now';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);

  return new Intl.DateTimeFormat('en-IN', {
    timeZone: TIMEZONE_IST,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(d);
}

/**
 * Formats a Date or timestamp string to a short IST date string
 * Example: "Sep 12, 2026"
 */
export function formatShortDateIST(dateInput?: Date | string | number | null): string {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);

  return new Intl.DateTimeFormat('en-IN', {
    timeZone: TIMEZONE_IST,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

/**
 * Formats a Date or timestamp string to time-only IST string
 * Example: "08:30 PM"
 */
export function formatTimeIST(dateInput?: Date | string | number | null): string {
  if (!dateInput) return 'Upcoming';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);

  return new Intl.DateTimeFormat('en-IN', {
    timeZone: TIMEZONE_IST,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(d);
}

/**
 * Returns current month and year string in IST
 * Example: "September 2026"
 */
export function getCurrentMonthYearIST(): string {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: TIMEZONE_IST,
    month: 'long',
    year: 'numeric',
  }).format(new Date());
}

/**
 * Calculates human-readable relative time string (e.g. "Just now", "2 mins ago", "1 hour ago", "Yesterday")
 */
export function formatRelativeTimeIST(dateInput?: Date | string | number | null): string {
  if (!dateInput) return 'Just now';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);

  const now = new Date();
  const diffSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffSeconds < 60) return 'Just now';
  if (diffSeconds < 3600) {
    const mins = Math.floor(diffSeconds / 60);
    return `${mins} min${mins > 1 ? 's' : ''} ago`;
  }
  if (diffSeconds < 86400) {
    const hours = Math.floor(diffSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  if (diffSeconds < 172800) {
    return 'Yesterday';
  }
  const days = Math.floor(diffSeconds / 86400);
  if (days < 7) {
    return `${days} days ago`;
  }

  return formatShortDateIST(d);
}

/**
 * Creates dynamic historical timestamps offset by given hours from NOW (in IST)
 */
export function getRelativeISOString(hoursOffset: number): string {
  const d = new Date();
  d.setTime(d.getTime() + hoursOffset * 3600 * 1000);
  return d.toISOString();
}
