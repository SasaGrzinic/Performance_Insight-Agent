import { test } from "node:test";
import assert from "node:assert/strict";
import { comparisonSeries } from "../src/comparison.ts";

test("calendar day alignment preserves zeros, missing days and different month lengths", () => {
  const points = comparisonSeries(
    ["2024-02", "2024-03"],
    [
      {
        series: [
          { day: 1, clicks: 0 },
          { day: 29, clicks: 8 },
        ],
      },
      {
        series: [
          { day: 1, clicks: 3 },
          { day: 31, clicks: 12 },
        ],
      },
    ],
    "clicks",
  );
  assert.equal(points.length, 31);
  assert.equal(points[0]["2024-02"], 0);
  assert.equal(points[28]["2024-02"], 8);
  assert.equal(points[30]["2024-02"], null);
  assert.equal(points[30]["2024-03"], 12);
  assert.equal(points[1]["2024-03"], null);
});
test("unloaded comparison and unavailable metrics never become zero", () => {
  assert.deepEqual(
    comparisonSeries(
      ["2026-08", "2026-07"],
      [{ series: [{ day: 1, impressions: 20 }] }, undefined],
      "clicks",
    ),
    [{ day: 1, "2026-08": null, "2026-07": null }],
  );
});

import { averageWatchSeconds, postsOnDay } from "../src/comparison.ts";
test("average viewing duration uses milliseconds per qualifying view, never viewers", () => {
  assert.equal(
    averageWatchSeconds({
      watch_time_ms: 12000,
      video_views: 4,
      video_viewers: 2,
    }),
    3,
  );
  assert.equal(averageWatchSeconds({ watch_time_ms: 0, video_views: 4 }), 0);
  assert.equal(
    averageWatchSeconds({ watch_time_ms: 12000, video_views: 0 }),
    undefined,
  );
  assert.equal(averageWatchSeconds({ video_views: 4 }), undefined);
});
test("hover associates all posts by exact publication date across compared months", () => {
  const posts = [
    { published_at: "2026-08-06T12:00:00Z", title: "A" },
    { published_at: "2026-08-06T13:00:00Z", title: "B" },
    { published_at: "2026-07-06T12:00:00Z", title: "C" },
  ];
  assert.deepEqual(
    postsOnDay(posts, "2026-08", 6).map((p) => p.title),
    ["A", "B"],
  );
  assert.equal(postsOnDay(posts, "2026-08", 7).length, 0);
});

import { readablePostTitle } from "../src/comparison.ts";
test("readable titles normalize decorative alphabets without changing accents, emoji or ordinary content", () => {
  assert.equal(
    readablePostTitle("𝐒𝐨𝐧𝐢𝐨 – für Zürich 🚀"),
    "Sonio – für Zürich 🚀",
  );
  assert.equal(readablePostTitle("CO₂ & ½ – français"), "CO₂ & ½ – français");
});

import { multiMetricSeries, relativeSeries } from "../src/comparison.ts";
test("multiple metrics align every month without mixing zero, absent metrics or units", () => {
  const rows = multiMetricSeries(
    ["2026-08", "2026-07"],
    [
      {
        series: [
          { day: 1, "linkedin.impressions": 100, "linkedin.clicks": 0 },
          { day: 3, "linkedin.clicks": 12 },
        ],
      },
      {
        series: [{ day: 1, "linkedin.impressions": 50, "linkedin.clicks": 5 }],
      },
    ],
    "linkedin",
    ["impressions", "clicks"],
  );
  assert.deepEqual(rows[0], {
    day: 1,
    "2026-08|impressions": 100,
    "2026-07|impressions": 50,
    "2026-08|clicks": 0,
    "2026-07|clicks": 5,
  });
  assert.equal(rows[1]["2026-08|impressions"], null);
  assert.equal(rows[2]["2026-07|clicks"], null);
  assert.equal(rows[2]["2026-08|clicks"], 12);
});
test("relative curves preserve missing observations, all-zero lines and original values", () => {
  const rows = [
    { day: 1, a: 50, b: 0, c: null },
    { day: 2, a: 100, b: 0, c: null },
  ];
  assert.deepEqual(relativeSeries(rows, ["a", "b", "c"]), [
    { day: 1, a: 50, b: 0, c: null },
    { day: 2, a: 100, b: 0, c: null },
  ]);
  assert.equal(rows[0].a, 50);
});

import { currentReportingMonth } from "../src/comparison.ts";
test("overview current month follows reporting timezone across month and year boundaries", () => {
  assert.equal(
    currentReportingMonth(new Date("2026-09-30T22:30:00Z")),
    "2026-10",
  );
  assert.equal(
    currentReportingMonth(
      new Date("2026-09-30T22:30:00Z"),
      "America/Los_Angeles",
    ),
    "2026-09",
  );
  assert.equal(
    currentReportingMonth(new Date("2026-12-31T23:30:00Z")),
    "2027-01",
  );
});
