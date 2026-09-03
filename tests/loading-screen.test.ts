import { readFile } from "node:fs/promises";
import { test } from "node:test";
import assert from "node:assert/strict";

const loadingScreenSource = await readFile(
  new URL("../src/components/LoadingScreen.tsx", import.meta.url),
  "utf8",
);

test("loading screen uses the centered logo-only composition", () => {
  assert.match(loadingScreenSource, /@\/assets\/images\/logo\/logo\.svg/);
  assert.match(loadingScreenSource, /alt="Artel Accounting logo"/);
  assert.doesNotMatch(loadingScreenSource, />\s*ERP\s*</);
  assert.doesNotMatch(loadingScreenSource, /Tizim yuklanmoqda/);
  assert.doesNotMatch(loadingScreenSource, /lucide-react/);
  assert.doesNotMatch(loadingScreenSource, /scale: 0\.78/);
  assert.match(loadingScreenSource, /h-28 w-28/);
  assert.doesNotMatch(loadingScreenSource, /drop-shadow\(/);
});
