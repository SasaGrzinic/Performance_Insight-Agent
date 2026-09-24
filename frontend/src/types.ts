export type KPI = {
  channel: string;
  key: string;
  label: string;
  target: number | null;
  value: number | null;
  previous: number | null;
  change: number | null;
  unit: string;
};
export type Channel = {
  id: string;
  name: string;
  type: string;
  color: string;
  primary: string;
  fields: Record<string, string>;
  values: Record<string, number>;
  previous: Record<string, number>;
  units: Record<string, string>;
  status: string;
  message: string;
  last_success: string | null;
};
export type Dashboard = {
  month: string;
  comparison_month: string;
  period_start: string;
  period_end: string;
  comparison_end: string;
  partial: boolean;
  demo: boolean;
  kpis: KPI[];
  channels: Channel[];
  series: ({ day: number; date: string } & Record<
    string,
    number | string | null
  >)[];
  definitions_confirmed: boolean;
  notes: string[];
};
export type Recommendation = {
  title: string;
  channel: string;
  priority: "high" | "medium" | "low";
  observation: string;
  action: string;
  caveat: string;
  evidence: string[];
};
export type Analysis = {
  status: string;
  summary: string;
  recommendations: Recommendation[];
  model?: string;
};
export type User = {
  id: string;
  username: string;
  email: string;
  role: string;
  active: boolean;
};
export type Report = {
  id: string;
  month: string;
  created_at: string;
  delivery_status: string;
  analysis_status: string;
};
export type Settings = {
  timezone: string;
  report_day: number;
  report_hour: number;
  sync_interval_minutes: number;
  email_configured: boolean;
  ai_configured: boolean;
  model: string;
  channels: Record<string, boolean>;
};
