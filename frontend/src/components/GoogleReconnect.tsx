import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, refreshChannelDetails } from "../api";
import "./google-reconnect.css";

type Connection = { id: string; status: string; message: string; last_success: string | null };
type Operation = { id: string; channel: string; status: string; message: string; job_id: string | null };
type Status = { available: boolean; channels: Connection[]; operation: Operation | null };
const names: Record<string, string> = { analytics: "Google Analytics", youtube: "YouTube" };

export function GoogleReconnect({ isAdmin, showAll }: { isAdmin: boolean; showAll: boolean }) {
  const client = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [link, setLink] = useState<{ id: string; url: string } | null>(null);
  const handled = useRef("");
  const q = useQuery({
    queryKey: ["google-connections"],
    queryFn: () => api<Status>("/connections/google"),
    refetchInterval: query => ["waiting", "syncing"].includes(query.state.data?.operation?.status || "") ? 2000 : 60000,
    refetchOnWindowFocus: true,
  });
  const operation = q.data?.operation;
  useEffect(() => {
    if (!operation || !["completed", "sync_failed"].includes(operation.status) || handled.current === operation.id) return;
    handled.current = operation.id;
    refreshChannelDetails();
    client.invalidateQueries({ predicate: query => !["google-connections", "me", "public", "job"].includes(String(query.queryKey[0])) });
  }, [operation, client]);

  async function connect(channel: string) {
    setBusy(true);
    setError("");
    setLink(null);
    try {
      const result = await api<{ id: string; url: string }>("/connections/google/start", { method: "POST", body: JSON.stringify({ channel }) });
      setLink(result);
      await q.refetch();
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }
  async function cancel() {
    setBusy(true);
    try { await api("/connections/google/cancel", { method: "POST" }); setLink(null); await q.refetch(); }
    catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }

  const channels = q.data?.channels.filter(c => showAll || c.status === "error" || operation?.channel === c.id && operation.status !== "completed") || [];
  if (!showAll && !channels.length && !error && !operation) return null;
  const active = ["waiting", "syncing"].includes(operation?.status || "");
  return <section className="google-reconnect" aria-label="Google-Verbindungen">
    <div className="google-reconnect-heading"><strong>Google-Verbindungen</strong><span>Testbetrieb · Bestehende Zahlen bleiben bei Verbindungsproblemen erhalten.</span></div>
    {q.isError && showAll && <p role="alert">Verbindungsstatus nicht erreichbar. <button onClick={() => q.refetch()}>Erneut prüfen</button></p>}
    {channels.map(c => <div className="google-reconnect-row" key={c.id}>
      <div><strong>{names[c.id]}</strong><p>{c.status === "error" ? c.message : c.status === "connected" ? "Automatische Aktualisierung verbunden." : "Noch nicht verbunden."}</p>
        <small>{c.last_success ? `Letzter erfolgreicher Abruf: ${new Date(c.last_success.endsWith("Z") || /[+-]\d\d:\d\d$/.test(c.last_success) ? c.last_success : c.last_success + "Z").toLocaleString("de-CH", { timeZone: "Europe/Zurich" })} (Schweizer Zeit)` : "Noch kein erfolgreicher Abruf."}</small></div>
      {isAdmin && q.data?.available ? <button className="button" disabled={busy || active} onClick={() => connect(c.id)}>Google erneut verbinden</button> : c.status === "error" && <span>{isAdmin ? "Lokaler Anmeldeassistent nicht verfügbar." : "Der Administrator kann die Verbindung erneuern."}</span>}
    </div>)}
    {operation && <div className="google-reconnect-progress" role="status">
      <p><strong>{names[operation.channel]}: </strong>{operation.message}</p>
      {operation.status === "waiting" && <div className="google-reconnect-actions">
        {link?.id === operation.id ? <a className="button primary" href={link.url} target="_blank" rel="noreferrer">Google-Anmeldung öffnen ↗</a> : <span>Die Anmeldung im geöffneten Google-Fenster abschliessen oder neu starten.</span>}
        <button className="button" disabled={busy} onClick={cancel}>Anmeldung abbrechen</button>
      </div>}
      {operation.status === "waiting" && <small>Mit dem berechtigten Sonio-Google-Konto anmelden. Nach der Freigabe hierher zurückkehren – die Aktualisierung startet automatisch.</small>}
    </div>}
    {error && <p role="alert">{error}</p>}
    {(showAll || channels.length > 0) && <small>Im Google-Testmodus kann nach sieben Tagen eine erneute Freigabe nötig sein. Die Anwendung erneuert gültige Zugänge automatisch; eine Google-Bestätigung lässt sich nicht automatisieren.</small>}
  </section>;
}
