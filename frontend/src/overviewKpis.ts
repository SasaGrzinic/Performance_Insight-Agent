import type { Dashboard } from "./types";

export function overviewKpis(dashboard: Dashboard) {
  return dashboard.kpis.flatMap((kpi) => {
    const channel = dashboard.channels.find((item) => item.id === kpi.channel);
    if (!channel) return [];
    const change =
      typeof kpi.change === "number" && Number.isFinite(kpi.change)
        ? kpi.change
        : null;
    return [
      {
        channel,
        key: kpi.key,
        label: kpi.label,
        value: kpi.value,
        previous: kpi.previous,
        change,
        positive: change !== null && change > 0,
        target: kpi.target,
        unit: kpi.unit,
        comparison: kpi.comparison ?? channel.comparisons?.[kpi.key],
      },
    ];
  });
}
