import { test } from "node:test";
import assert from "node:assert/strict";
import {
  campaignIdentification,
  campaignMeasurementPlan,
} from "../src/campaignIdentification.ts";

const channel = (id, status = "connected") => ({ id, name: id, status });

test("campaign identification accounts for every dashboard channel", () => {
  const dashboard = {
    channels: [
      channel("google_ads"),
      channel("analytics"),
      channel("linkedin"),
      channel("linkedin_organic"),
      channel("mailchimp"),
      channel("youtube"),
      channel("events"),
      channel("qr", "not_configured"),
    ],
  };

  const result = campaignIdentification(dashboard);

  assert.equal(result.length, dashboard.channels.length);
  assert.equal(result.find((item) => item.channel.id === "google_ads").identifier, "Kampagnen-ID");
  assert.equal(result.find((item) => item.channel.id === "analytics").state, "partial");
  assert.equal(result.find((item) => item.channel.id === "qr").state, "open");
});

test("a new channel remains visible until its identifier is defined", () => {
  const [result] = campaignIdentification({ channels: [channel("new_channel")] });

  assert.equal(result.state, "open");
  assert.match(result.identifier, /offen/);
});

test("campaign measurement plan separates direct mailing and article QR origins", () => {
  const dashboard = {
    channels: [channel("analytics"), channel("qr", "not_configured")],
  };
  const plan = campaignMeasurementPlan(dashboard);
  const directMail = plan.find((item) => item.id === "direct_mail");
  const article = plan.find((item) => item.id === "fachartikel");

  assert.equal(directMail.state, "open");
  assert.equal(article.state, "open");
  assert.match(directMail.matching, /utm_source=direct_mail/);
  assert.match(article.matching, /utm_source=fachartikel/);
  assert.notEqual(directMail.identifier, article.identifier);
});

test("campaign measurement plan keeps provider identifiers and expected results visible", () => {
  const dashboard = {
    channels: [
      channel("google_ads"),
      channel("linkedin"),
      channel("linkedin_organic"),
      channel("analytics"),
      channel("mailchimp"),
      channel("youtube"),
      channel("events"),
      channel("qr", "not_configured"),
    ],
  };
  const plan = campaignMeasurementPlan(dashboard);

  assert.equal(plan.length, 9);
  assert.match(plan.find((item) => item.id === "google_ads").identifier, /Kampagnen-ID/);
  assert.deepEqual(
    plan.find((item) => item.id === "landingpage").expectedResults,
    ["Sitzungen", "Engagierte Sitzungen", "Zielaktionen"],
  );
  assert.ok(plan.every((item) => item.identifier && item.matching && item.expectedResults.length));
});
