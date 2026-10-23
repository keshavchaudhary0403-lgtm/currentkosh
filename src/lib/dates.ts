/** Calendar date in India (UTC+5:30), which is what "today's current affairs" means to users. */
export function istDate(d: Date = new Date()): string {
  return new Date(d.getTime() + 330 * 60_000).toISOString().slice(0, 10);
}

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Whole days from today (IST) until `date`; negative once it has passed. */
export function daysUntil(date: string): number {
  return Math.round((new Date(`${date}T00:00:00Z`).getTime() - new Date(`${istDate()}T00:00:00Z`).getTime()) / 86400_000);
}
