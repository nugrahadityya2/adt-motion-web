const STORAGE_KEY = "adt_motion_export_quota";

interface QuotaRecord {
  date: string;
  count: number;
}

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function isExportLimitEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_EXPORT_LIMIT === "true";
}

export function getDailyExportLimit(): number {
  const raw = Number(process.env.NEXT_PUBLIC_DAILY_EXPORT_LIMIT);
  return Number.isFinite(raw) && raw > 0 ? raw : 3;
}

export function getUpgradeUrl(): string {
  return process.env.NEXT_PUBLIC_UPGRADE_URL || "";
}

export function getRemainingExports(): number {
  if (!isExportLimitEnabled()) return Infinity;
  if (typeof window === "undefined") return getDailyExportLimit();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDailyExportLimit();
    const parsed = JSON.parse(raw) as QuotaRecord;
    const today = getTodayKey();
    if (parsed.date !== today) return getDailyExportLimit();
    return Math.max(0, getDailyExportLimit() - (parsed.count || 0));
  } catch {
    return getDailyExportLimit();
  }
}

export function recordExportUsage(): void {
  if (!isExportLimitEnabled() || typeof window === "undefined") return;

  const today = getTodayKey();
  let count = 0;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as QuotaRecord;
      if (parsed.date === today) count = parsed.count || 0;
    }
  } catch {
    count = 0;
  }

  const next: QuotaRecord = { date: today, count: count + 1 };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}
