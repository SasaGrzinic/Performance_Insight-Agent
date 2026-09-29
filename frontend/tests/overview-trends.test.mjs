import { test } from "node:test";
import assert from "node:assert/strict";
import { overviewTrends } from "../src/overviewTrends.ts";
const c = (id, v, p, key = "views") => ({
  id,
  primary: key,
  values: { [key]: v },
  previous: { [key]: p },
});
test("overview excludes missing, nonfinite and zero baselines without inventing declines", () => {
  const result = overviewTrends([
    c("missing", undefined, 10),
    c("zero", 3, 0),
    c("nan", NaN, 3),
    c("spend", 20, 10, "spend"),
    c("up", 15, 10),
  ]);
  assert.deepEqual(
    result.map((t) => t.c.id),
    ["up"],
  );
  assert.equal(result[0].change, 50);
});
test("overview balances available directions and preserves a real zero result", () => {
  const result = overviewTrends([
    c("a", 15, 10),
    c("b", 12, 10),
    c("c", 13, 10),
    c("d", 14, 10),
    c("down", 0, 10),
  ]);
  assert.deepEqual(
    result.map((t) => t.c.id),
    ["a", "b", "c", "down"],
  );
  assert.equal(result[3].change, -100);
});
