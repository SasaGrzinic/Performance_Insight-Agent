import { test } from "node:test";
import assert from "node:assert/strict";
import { overviewKpis } from "../src/overviewKpis.ts";

const channel = (id, name) => ({
  id,
  name,
  fields: { clicks: "Standardbezeichnung" },
  comparisons: { clicks: { status: "comparable" } },
});

test("overview uses the saved KPI order, labels and targets", () => {
  const dashboard = {
    channels: [channel("ads", "Ads"), channel("organic", "Organic")],
    kpis: [
      {
        channel: "organic",
        key: "clicks",
        label: "Gewählte Klicks",
        value: 12,
        previous: 10,
        change: 20,
        target: 25,
        unit: "count",
      },
      {
        channel: "ads",
        key: "clicks",
        label: "Anzeigenklicks",
        value: null,
        previous: null,
        change: null,
        target: null,
        unit: "count",
      },
    ],
  };

  const result = overviewKpis(dashboard);

  assert.deepEqual(
    result.map((item) => [item.channel.id, item.label, item.target]),
    [
      ["organic", "Gewählte Klicks", 25],
      ["ads", "Anzeigenklicks", null],
    ],
  );
  assert.equal(result[0].positive, true);
  assert.equal(result[1].value, null);
});

test("overview ignores a stale KPI definition without a matching channel", () => {
  const result = overviewKpis({
    channels: [channel("ads", "Ads")],
    kpis: [
      {
        channel: "removed",
        key: "clicks",
        label: "Alt",
        value: 1,
        previous: 1,
        change: 0,
        target: null,
        unit: "count",
      },
    ],
  });

  assert.deepEqual(result, []);
});
