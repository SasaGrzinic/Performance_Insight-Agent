export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

let authenticated = false;
let returningToLogin = false;

function handleUnauthorized(path: string) {
  const pathname = path.split("?")[0];
  const isPublic =
    pathname === "/auth/login" ||
    pathname === "/auth/invite/accept" ||
    pathname === "/config/public" ||
    pathname.startsWith("/demo/");
  if (isPublic || (pathname === "/auth/me" && !authenticated)) return;
  if (returningToLogin) return;
  returningToLogin = true;
  // A new document drops cached private data and all pending requests together.
  const url = new URL(window.location.href);
  url.searchParams.set("session", "expired");
  window.location.replace(url.toString());
}

export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const isForm = options.body instanceof FormData;
  const response = await fetch("/api" + path, {
    ...options,
    credentials: "same-origin",
    headers: {
      ...(!isForm ? { "Content-Type": "application/json" } : {}),
      "X-Sonio-Request": "1",
      ...options.headers,
    },
  });
  if (!response.ok) {
    if (response.status === 401) handleUnauthorized(path);
    let message = "Die Anfrage ist fehlgeschlagen. Bitte erneut versuchen.";
    try {
      const data = await response.json();
      message =
        typeof data.detail === "string"
          ? data.detail
          : response.status === 422
            ? "Bitte die eingegebenen Werte prüfen."
            : message;
    } catch {
      /* Preserve readable error for proxy failures. */
    }
    throw new ApiError(message, response.status);
  }
  if (path === "/auth/me" || path === "/auth/login") authenticated = true;
  if (path === "/auth/logout") authenticated = false;
  return response.json();
}
export const number = (value: number | null | undefined, unit = "count") =>
  value == null
    ? "—"
    : new Intl.NumberFormat("de-CH", {
        maximumFractionDigits: 2,
        ...(/^[A-Z]{3}$/.test(unit)
          ? { style: "currency" as const, currency: unit }
          : {}),
      }).format(value);
export const monthName = (month: string) =>
  new Intl.DateTimeFormat("de-CH", { month: "long", year: "numeric" }).format(
    new Date(month + "-01T12:00:00"),
  );
export function previousMonth() {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
