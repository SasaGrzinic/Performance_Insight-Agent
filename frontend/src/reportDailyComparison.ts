export function dailyReportChange(current: unknown, previous: unknown, comparable = true): number | null {
 if (!comparable || typeof current !== 'number' || typeof previous !== 'number' || !Number.isFinite(current) || !Number.isFinite(previous) || previous <= 0) return null;
 return (current - previous) / previous * 100;
}
