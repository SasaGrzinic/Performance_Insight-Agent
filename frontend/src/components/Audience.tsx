import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { api, number, monthName } from "../api";
import { Loading } from "./ui";

type AudienceData = {
  status: string;
  message: string;
  current: { value: number; observed_at: string } | null;
  months: {
    month: string;
    followers_organic: number | null;
    followers_paid: number | null;
    followers_gained: number | null;
    total: number | null;
    observed_at: string | null;
  }[];
};
const dateLabel = (d: string) =>
  new Intl.DateTimeFormat("de-CH", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(d));

export function Audience({ month, demo }: { month: string; demo: boolean }) {
  const q = useQuery({
    queryKey: ["linkedin-audience", demo, month],
    queryFn: () => api<AudienceData>(`/linkedin/audience?month=${month}`),
    enabled: !demo,
    refetchInterval: 60000,
  });
  if (demo)
    return (
      <section className="panel post-section">
        <h2>Follower-Entwicklung</h2>
        <p>Diese Ansicht benötigt eine verbundene Unternehmensseite.</p>
      </section>
    );
  if (q.isPending) return <Loading />;
  if (q.isError)
    return (
      <section className="panel post-section" role="alert">
        <p>Follower konnten nicht geladen werden.</p>
        <button className="button" onClick={() => q.refetch()}>
          Erneut laden
        </button>
      </section>
    );
  return (
    <section className="panel post-section">
      <div className="panel-heading">
        <div>
          <h2>Follower-Entwicklung</h2>
          <p>Neue Follower pro Monat – organisch und bezahlt.</p>
        </div>
        <div className="follower-current">
          <strong>{number(q.data.current?.value)}</strong>
          <span>Follower aktuell</span>
          {q.data.current && (
            <small>Stand {dateLabel(q.data.current.observed_at)}</small>
          )}
        </div>
      </div>
      {q.data.status !== "connected" && (
        <p className="form-error">{q.data.message}</p>
      )}
      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={q.data.months}
            margin={{ top: 15, right: 10, bottom: 5, left: -10 }}
          >
            <XAxis
              dataKey="month"
              tickFormatter={(m) =>
                new Intl.DateTimeFormat("de-CH", {
                  month: "short",
                  timeZone: "UTC",
                }).format(new Date(m + "-01"))
              }
            />
            <YAxis />
            <Tooltip
              labelFormatter={(m) => monthName(String(m))}
              formatter={(value, name) => [number(Number(value)), name]}
            />
            <Bar
              dataKey="followers_organic"
              name="Organisch"
              stackId="gains"
              fill="#0075d9"
              isAnimationActive={false}
            />
            <Bar
              dataKey="followers_paid"
              name="Bezahlt"
              stackId="gains"
              fill="#9164b7"
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="table-scroll">
        <table className="audience-table">
          <thead>
            <tr>
              <th>Monat</th>
              <th>Organisch neu</th>
              <th>Bezahlt neu</th>
              <th>Neue Follower</th>
              <th>Beobachteter Bestand</th>
            </tr>
          </thead>
          <tbody>
            {q.data.months.map((m) => (
              <tr key={m.month}>
                <th>
                  {monthName(m.month)}
                  {m.month === new Date().toISOString().slice(0, 7) && (
                    <small> · laufend</small>
                  )}
                </th>
                <td>{number(m.followers_organic)}</td>
                <td>{number(m.followers_paid)}</td>
                <td>
                  <strong>{number(m.followers_gained)}</strong>
                </td>
                <td>
                  {number(m.total)}
                  {m.observed_at && (
                    <small> · {dateLabel(m.observed_at)}</small>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="data-explanation">
        Neue Follower sind Zugewinne, keine Nettoveränderung nach Entfolgen.
        Historische Bestände werden ab der ersten Messung gespeichert und nicht
        rückwirkend geschätzt. „—“ bedeutet, dass kein Messwert vorliegt.
      </p>
    </section>
  );
}
