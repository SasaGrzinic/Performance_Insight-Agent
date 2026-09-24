import assert from "node:assert/strict";
import { afterEach, mock, test } from "node:test";

let moduleId = 0;
async function setup() {
  const redirects = [];
  globalThis.window = {
    location: {
      href: "http://localhost:5173/?view=reports",
      replace: (url) => redirects.push(url),
    },
  };
  const client = await import(`../src/api.ts?test=${++moduleId}`);
  return { ...client, redirects };
}
function respond(status, detail = "Bitte anmelden.") {
  return Response.json({ detail }, { status });
}
afterEach(() => {
  mock.restoreAll();
  delete globalThis.window;
});

test("anonymous session checks stay on the login form", async () => {
  const { api, ApiError, redirects } = await setup();
  mock.method(globalThis, "fetch", async () => respond(401));
  await assert.rejects(
    api("/auth/me"),
    (error) => error instanceof ApiError && error.status === 401,
  );
  assert.deepEqual(redirects, []);
});

test("concurrent expired reads and writes return to login only once", async () => {
  const { api, redirects } = await setup();
  mock.method(globalThis, "fetch", async () => respond(401));
  const results = await Promise.allSettled([
    api("/dashboard?month=2026-08"),
    api("/sync", { method: "POST", body: "{}" }),
    api("/admin/users"),
  ]);
  assert.ok(results.every((result) => result.status === "rejected"));
  assert.deepEqual(redirects, [
    "http://localhost:5173/?view=reports&session=expired",
  ]);
});

test("an authenticated session check also detects expiration", async () => {
  const { api, redirects } = await setup();
  let signedIn = true;
  mock.method(globalThis, "fetch", async () =>
    signedIn ? Response.json({ username: "admin" }) : respond(401),
  );
  await api("/auth/me");
  signedIn = false;
  await assert.rejects(api("/auth/me"));
  assert.equal(redirects.length, 1);
});

test("bad login and invite credentials show their error without a reload loop", async () => {
  const { api, redirects } = await setup();
  mock.method(globalThis, "fetch", async (url) =>
    url.endsWith("/auth/me")
      ? Response.json({ username: "admin" })
      : respond(401, "Ungültige Anmeldedaten."),
  );
  await api("/auth/me");
  for (const path of ["/auth/login", "/auth/invite/accept"]) {
    await assert.rejects(api(path, { method: "POST" }), {
      message: "Ungültige Anmeldedaten.",
      status: 401,
    });
  }
  assert.deepEqual(redirects, []);
});

test("permission and server errors retain their status without logging out", async () => {
  const { api, redirects } = await setup();
  let status = 403;
  mock.method(globalThis, "fetch", async () =>
    respond(status, "Nicht verfügbar."),
  );
  for (status of [403, 422, 503]) {
    await assert.rejects(api("/settings"), {
      status,
      message: "Nicht verfügbar.",
    });
  }
  assert.deepEqual(redirects, []);
});

test("demo and public requests cannot expire the live session", async () => {
  const { api, redirects } = await setup();
  mock.method(globalThis, "fetch", async () => respond(401));
  for (const path of ["/demo/dashboard?month=2026-08", "/config/public"]) {
    await assert.rejects(api(path));
  }
  assert.deepEqual(redirects, []);
});
