import { asset } from "../staticDemo";
import type { ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  X,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Mail,
  Play,
  CalendarDays,
  QrCode,
  ChartNoAxesColumnIncreasing,
  Network,
  LoaderCircle,
  Info,
} from "lucide-react";
import { number } from "../api";
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className={"dialog-content " + (wide ? "wide" : "")}>
          <div className="dialog-heading">
            <Dialog.Title>{title}</Dialog.Title>
            <Dialog.Close className="icon-button" aria-label="Schliessen">
              <X size={20} />
            </Dialog.Close>
          </div>
          <Dialog.Description className={description ? "muted" : "sr-only"}>
            {description || title}
          </Dialog.Description>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
const icons: Record<string, typeof Search> = {
  google_ads: Search,
  analytics: ChartNoAxesColumnIncreasing,
  linkedin: Network,
  linkedin_organic: Network,
  mailchimp: Mail,
  youtube: Play,
  events: CalendarDays,
  qr: QrCode,
};
const channelLogos: Record<string, string> = {
  linkedin: "linkedin",
  linkedin_organic: "linkedin",
  youtube: "youtube",
  google_ads: "googleads",
  analytics: "googleanalytics",
  mailchimp: "mailchimp",
};
export function ChannelIcon({ id, size = 18 }: { id: string; size?: number }) {
  const Icon = icons[id] || ChartNoAxesColumnIncreasing;
  return (
    <span className={"channel-icon " + id} aria-hidden="true">
      {channelLogos[id] ? (
        <img
          src={asset(`brand/channels/${channelLogos[id]}.svg`)}
          width={size}
          height={size}
          alt=""
        />
      ) : (
        <Icon size={size} strokeWidth={1.8} />
      )}
    </span>
  );
}
export function Change({ value }: { value: number | null }) {
  return value === null ? (
    <span className="muted small">Kein Vergleich</span>
  ) : (
    <span className={"change " + (value < 0 ? "negative" : "positive")}>
      {value < 0 ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}{" "}
      {value > 0 ? "+" : ""}
      {number(value, "%")} %
    </span>
  );
}
export function Loading() {
  return (
    <div className="empty" role="status" aria-live="polite">
      <LoaderCircle className="spin" size={24} />
      <h3>Daten werden geladen</h3>
      <p>Einen Moment bitte.</p>
    </div>
  );
}
export function Empty({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="empty">
      <Info size={26} />
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}
