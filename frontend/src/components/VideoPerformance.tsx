import type { Dashboard } from "../types";
import { monthName, number } from "../api";
import { ChannelIcon } from "./ui";
import { PostCollection } from "./PerformanceExplorer";

export function VideoPerformance({
  data,
  demo,
}: {
  data: Dashboard;
  demo: boolean;
}) {
  const youtube = data.channels.find((c) => c.id === "youtube");
  return (
    <div className="video-workspace">
      <p className="video-context">
        {monthName(data.month)} · Jede Plattform wird separat ausgewertet.
        Aufrufe und Betrachtungsdauer haben unterschiedliche Messdefinitionen
        und werden nicht zu einem gemeinsamen Ergebnis addiert.
      </p>
      <section
        aria-label="LinkedIn Video Performance"
        className="video-platform"
      >
        <div className="video-platform-heading">
          <ChannelIcon id="linkedin_organic" size={38} />
          <div>
            <h2>LinkedIn</h2>
            <p>Videos der Sonio-Unternehmensseite</p>
          </div>
        </div>
        <PostCollection
          key={data.month}
          month={data.month}
          demo={demo}
          videosOnly
          highlight="video_views"
        />
      </section>
      <section
        aria-label="YouTube Video Performance"
        className="video-platform"
      >
        <div className="video-platform-heading">
          <ChannelIcon id="youtube" size={38} />
          <div>
            <h2>YouTube</h2>
            <p>Sonio Channel · Monatskennzahlen</p>
          </div>
        </div>
        {youtube &&
        Object.values(youtube.values).some((value) => value != null) ? (
          <div className="panel youtube-video-summary">
            {demo && <p>Illustrative Beispieldaten</p>}
            <dl>
              {Object.entries(youtube.fields).map(([key, label]) => (
                <div key={key}>
                  <dt>{label}</dt>
                  <dd>{number(youtube.values[key], youtube.units[key])}</dd>
                </div>
              ))}
            </dl>
            <p>
              {youtube.last_success
                ? `Letzter erfolgreicher Abruf: ${new Date(youtube.last_success).toLocaleString("de-CH", { timeZone: "Europe/Zurich" })}`
                : "Kein bestätigter Live-Abruf"}
            </p>
            <p>
              Detaildaten pro Video und durchschnittliche Betrachtungsdauer
              erscheinen nach Anbindung der YouTube-Analyse.
            </p>
          </div>
        ) : (
          <div className="panel youtube-video-pending">
            <h3>
              {youtube?.status === "connected"
                ? "Keine YouTube-Kennzahlen für diesen Monat"
                : "YouTube wartet auf die Verbindung"}
            </h3>
            <p>
              Hier werden die YouTube-Videozahlen separat von LinkedIn
              angezeigt. Die vorbereitete Anmeldung bleibt pausiert, bis du sie
              fortsetzt.
            </p>
            <div className="video-metric-preview">
              <span>
                Aufrufe <strong>—</strong>
              </span>
              <span>
                Wiedergabezeit <strong>—</strong>
              </span>
              <span>
                Ø Betrachtungsdauer <strong>—</strong>
              </span>
            </div>
            <small>Keine Daten verfügbar</small>
          </div>
        )}
      </section>
    </div>
  );
}
