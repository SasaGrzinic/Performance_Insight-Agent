import type { Dashboard } from "./types";

export type IdentificationState = "available" | "partial" | "open";

type IdentificationRule = {
  identifier: string;
  state: IdentificationState;
  basis: string;
  missing: string;
};

export type CampaignMeasure = {
  id: string;
  label: string;
  category: "paid" | "content" | "owned" | "offline" | "event";
  channelId: string;
  channelName: string;
  connectionStatus: string;
  identifier: string;
  matching: string;
  expectedResults: string[];
  state: IdentificationState;
};

const rules: Record<string, IdentificationRule> = {
  google_ads: {
    identifier: "Kampagnen-ID",
    state: "available",
    basis: "Google Ads liefert jede Kampagne mit einer stabilen ID.",
    missing: "Die Verbindung zu anderen Kanälen muss bestätigt werden.",
  },
  analytics: {
    identifier: "Bereinigter Seitenpfad",
    state: "partial",
    basis: "Website-Inhalte werden über den exakten Sonio-Seitenpfad erkannt.",
    missing: "Für den Kampagnenbezug fehlen bestätigte UTM-Regeln oder eine manuelle Zuordnung.",
  },
  linkedin: {
    identifier: "Kampagnen-URN",
    state: "available",
    basis: "LinkedIn Ads führt Kampagnen mit einer eindeutigen Provider-Kennung.",
    missing: "Die Verbindung zu Inhalten, Landingpages und Events muss bestätigt werden.",
  },
  linkedin_organic: {
    identifier: "Beitrags-URN",
    state: "available",
    basis: "LinkedIn-Beiträge werden mit ihrer eindeutigen Veröffentlichungskennung geführt.",
    missing: "Ein ähnlicher Titel oder dasselbe Datum genügt nicht für eine Kampagnenzuordnung.",
  },
  mailchimp: {
    identifier: "Mailchimp-Kampagnen-ID",
    state: "available",
    basis: "Jedes importierte Mailing besitzt eine eindeutige Kampagnen-ID.",
    missing: "Newsletter-Gruppen und Betreffzeilen werden nicht automatisch als Kampagne interpretiert.",
  },
  youtube: {
    identifier: "Video-ID",
    state: "available",
    basis: "YouTube-Videos werden über ihre eindeutige Video-ID geführt.",
    missing: "Playlist, Thema oder Veröffentlichungsmonat belegen allein keine Kampagnenzugehörigkeit.",
  },
  events: {
    identifier: "Event-ID und Quelle",
    state: "available",
    basis: "Events werden mit interner ID und bestätigter Quelle auseinandergehalten.",
    missing: "Die Verbindung zu Einladungen, Beiträgen und Landingpages muss bestätigt werden.",
  },
  qr: {
    identifier: "Tracking-ID noch offen",
    state: "open",
    basis: "Für QR-Tracking ist noch kein Anbieter und kein verbindliches ID-Schema festgelegt.",
    missing: "Vor einer Zuordnung müssen Anbieter, Exportformat und stabile Kennung bestätigt sein.",
  },
};

export function campaignIdentification(dashboard: Dashboard) {
  return dashboard.channels.map((channel) => ({
    channel,
    ...(rules[channel.id] ?? {
      identifier: "Identifikator noch offen",
      state: "open" as const,
      basis: "Für diesen Kanal ist noch keine geprüfte Zuordnungsregel hinterlegt.",
      missing: "Vor einer Auswertung muss eine stabile, nachvollziehbare Kennung definiert werden.",
    }),
  }));
}

const measureDefinitions: Omit<
  CampaignMeasure,
  "channelName" | "connectionStatus" | "state"
>[] = [
  {
    id: "google_ads",
    label: "Google Ads",
    category: "paid",
    channelId: "google_ads",
    identifier: "Kampagnen-ID + Kampagnenschlüssel",
    matching: "Provider-ID und einheitliches utm_campaign verbinden Anzeige und Landingpage.",
    expectedResults: ["Impressionen", "Klicks", "Kosten", "Zielaktionen"],
  },
  {
    id: "linkedin_ads",
    label: "LinkedIn Ads",
    category: "paid",
    channelId: "linkedin",
    identifier: "Kampagnen-URN + Kampagnenschlüssel",
    matching: "Die Kampagnen-URN bleibt die Quelle; utm_campaign verbindet den Website-Besuch.",
    expectedResults: ["Impressionen", "Klicks", "Kosten", "Zielaktionen"],
  },
  {
    id: "linkedin_organic",
    label: "LinkedIn Organic",
    category: "content",
    channelId: "linkedin_organic",
    identifier: "Beitrags-URN + getaggter Link",
    matching: "Der Beitrag bleibt über seine URN eindeutig; der Link benötigt utm_campaign.",
    expectedResults: ["Impressionen", "Interaktionen", "Beitragsklicks", "Website-Sitzungen"],
  },
  {
    id: "landingpage",
    label: "Landingpage",
    category: "owned",
    channelId: "analytics",
    identifier: "Seitenpfad + UTM-Kampagnenschlüssel",
    matching: "Exakter Pfad und utm_campaign trennen Kampagnenzugriffe vom übrigen Website-Traffic.",
    expectedResults: ["Sitzungen", "Engagierte Sitzungen", "Zielaktionen"],
  },
  {
    id: "mailchimp",
    label: "E-Mail-Mailing",
    category: "owned",
    channelId: "mailchimp",
    identifier: "Mailchimp-ID + getaggte Links",
    matching: "Mailchimp-ID und utm_campaign verbinden Versand, Linkklick und Website-Nutzung.",
    expectedResults: ["Zustellungen", "Öffnungen", "Klicker", "Website-Sitzungen"],
  },
  {
    id: "youtube",
    label: "YouTube-Video",
    category: "content",
    channelId: "youtube",
    identifier: "Video-ID + getaggter Link",
    matching: "Die Video-ID identifiziert das Video; der Link stellt den Kampagnenbezug her.",
    expectedResults: ["Aufrufe", "Wiedergabezeit", "Website-Sitzungen"],
  },
  {
    id: "direct_mail",
    label: "Direct Mailing",
    category: "offline",
    channelId: "qr",
    identifier: "Eigene QR-/Redirect-ID",
    matching: "utm_source=direct_mail und ein eigener utm_content-Wert kennzeichnen die Herkunft.",
    expectedResults: ["QR-Weiterleitungen", "Landingpage-Sitzungen", "Zielaktionen"],
  },
  {
    id: "fachartikel",
    label: "Fachartikel",
    category: "content",
    channelId: "qr",
    identifier: "Eigene QR- oder Link-ID",
    matching: "utm_source=fachartikel und ein eigener utm_content-Wert bleiben vom Direct Mailing getrennt.",
    expectedResults: ["QR-/Link-Weiterleitungen", "Landingpage-Sitzungen", "Zielaktionen"],
  },
  {
    id: "event",
    label: "Event oder Webinar",
    category: "event",
    channelId: "events",
    identifier: "Event-ID + getaggte Anmeldung",
    matching: "Event-ID und Kampagnenschlüssel verbinden Einladung, Anmeldung und Folgemassnahmen.",
    expectedResults: ["Anmeldungen", "Teilnahmen", "Website-Sitzungen"],
  },
];

export function campaignMeasurementPlan(dashboard: Dashboard): CampaignMeasure[] {
  const channels = new Map(dashboard.channels.map((channel) => [channel.id, channel]));
  return measureDefinitions.map((definition) => {
    const channel = channels.get(definition.channelId);
    const rule = rules[definition.channelId];
    return {
      ...definition,
      channelName: channel?.name ?? "Datenquelle noch offen",
      connectionStatus: channel?.status ?? "not_configured",
      state: definition.channelId === "qr" ? "open" : rule?.state ?? "open",
    };
  });
}
