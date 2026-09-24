import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { api, monthName } from "../api";
import type { Dashboard } from "../types";
import { postMetricLabels, type PostsResponse } from "./PerformanceExplorer";
import { averageWatchSeconds } from "../comparison";
import { saveCSV } from "../csv";

export function CSVExport({ data, demo }: { data: Dashboard; demo: boolean }) {
  const [kind, setKind] = useState("monthly");
  const [channel, setChannel] = useState("linkedin_organic");
  const [chosen, setChosen] = useState<string[] | null>(null);
  const [message, setMessage] = useState("");
  const isPosts = kind === "posts" || kind === "videos";
  const c = data.channels.find((c) => c.id === channel) || data.channels[0];
  const fields = isPosts ? postMetricLabels : c.fields;
  const selected = (chosen || Object.keys(fields)).filter((k) => k in fields);
  const [opened, setOpened] = useState(false);
  const q = useQuery({
    queryKey: ["linkedin-posts", demo, data.month],
    queryFn: () => api<PostsResponse>(`/linkedin/posts?month=${data.month}`),
    enabled: opened && isPosts && !demo,
  });
  const posts = (q.data?.posts || []).filter(
    (p) => kind !== "videos" || p.kind === "video",
  );
  const rows: (string | number | null | undefined)[][] = [];
  if (isPosts && !demo)
    for (const post of posts)
      for (const key of selected) {
        if (
          post.kind !== "video" &&
          (key.startsWith("video_") ||
            key === "watch_time_ms" ||
            key === "average_watch_seconds")
        )
          continue;
        rows.push([
          post.published_at,
          "LinkedIn Organic",
          post.title,
          post.url,
          fields[key],
          key === "average_watch_seconds"
            ? averageWatchSeconds(post.metrics)
            : post.metrics[key],
          key === "watch_time_ms"
            ? "ms"
            : key === "average_watch_seconds"
              ? "Sekunden"
              : "Anzahl",
          "Seit Veröffentlichung",
          post.updated_at,
        ]);
      }
  else if (!isPosts)
    for (const key of selected) {
      if (kind === "daily")
        for (const point of data.series)
          rows.push([
            point.date,
            c.name,
            "",
            "",
            fields[key],
            point[`${c.id}.${key}`],
            c.units[key],
            "Tageswert",
            c.last_success,
          ]);
      else
        rows.push([
          data.month,
          c.name,
          "",
          "",
          fields[key],
          c.values[key],
          c.units[key],
          data.partial ? `Monatswert bis ${data.period_end}` : "Monatswert",
          c.last_success,
        ]);
    }
  return (
    <details
      className="csv-export"
      onToggle={(e) => setOpened(e.currentTarget.open)}
    >
      <summary>
        <Download size={17} /> CSV herunterladen{" "}
        <span>{monthName(data.month)}</span>
      </summary>
      <div className="csv-export-body">
        <div className="export-controls">
          <label>
            Datenbereich
            <select
              value={kind}
              onChange={(e) => {
                setKind(e.target.value);
                setChosen(null);
                setMessage("");
              }}
            >
              <option value="monthly">Monatskennzahlen</option>
              <option value="daily">Tageskennzahlen</option>
              <option value="posts">LinkedIn-Posts</option>
              <option value="videos">LinkedIn-Videos</option>
            </select>
          </label>
          {!isPosts && (
            <label>
              Kanal
              <select
                value={c.id}
                onChange={(e) => {
                  setChannel(e.target.value);
                  setChosen(null);
                  setMessage("");
                }}
              >
                {data.channels.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
        <fieldset>
          <legend>Kennzahlen auswählen</legend>
          <div className="export-field-actions">
            <button
              type="button"
              onClick={() => setChosen(Object.keys(fields))}
            >
              Alle auswählen
            </button>
            <button type="button" onClick={() => setChosen([])}>
              Auswahl aufheben
            </button>
          </div>
          <div className="export-fields">
            {Object.entries(fields).map(([key, label]) => (
              <label key={key}>
                <input
                  type="checkbox"
                  checked={selected.includes(key)}
                  onChange={(e) =>
                    setChosen(
                      e.target.checked
                        ? [...selected, key]
                        : selected.filter((k) => k !== key),
                    )
                  }
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
        <p>
          Zeitraum: {monthName(data.month)}
          {isPosts
            ? " · Beiträge dieses Monats, Kennzahlen seit Veröffentlichung."
            : " · Follower-Zugewinne sind unter LinkedIn Organic auswählbar."}{" "}
          Leere Werte bleiben leer.
        </p>
        {isPosts &&
          (demo ? (
            <p>Die Demo enthält keine echten Posts.</p>
          ) : q.isPending ? (
            <p role="status">Beiträge werden geladen …</p>
          ) : q.isError ? (
            <p role="alert">
              Beiträge konnten nicht geladen werden.{" "}
              <button onClick={() => q.refetch()}>Erneut laden</button>
            </p>
          ) : q.data?.status !== "connected" ? (
            <p role="status">
              {q.data?.message} Export enthält den letzten gespeicherten Stand.
            </p>
          ) : null)}
        <button
          className="button primary"
          disabled={
            !selected.length ||
            !rows.length ||
            (isPosts && (demo || q.isPending || q.isError))
          }
          onClick={() => {
            saveCSV(`sonio-${kind}-${data.month}${demo ? "-demo" : ""}.csv`, [
              [
                "Datum",
                "Kanal",
                "Beitrag",
                "URL",
                "Kennzahl",
                "Wert",
                "Einheit",
                "Bezug",
                "Datenstand",
                "Datenmodus",
              ],
              ...rows.map((r) => [...r, demo ? "DEMO" : "Live"]),
            ]);
            setMessage(`${rows.length} Datenzeilen heruntergeladen.`);
          }}
        >
          <Download size={16} /> Auswahl herunterladen
        </button>
        <span role="status">
          {message ||
            `${rows.length} Datenzeilen · ${selected.length} Kennzahlen`}
        </span>
      </div>
    </details>
  );
}
