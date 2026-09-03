import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const routeSource = readFileSync(
  new URL("../src/modules/rental/routes.tsx", import.meta.url),
  "utf8",
);

const getHandleSource = (routeName: "contracts" | "accruals") => {
  const match = routeSource.match(
    new RegExp(`path: "${routeName}"[\\s\\S]*?handle: \\{([^}]*)\\}`),
  );

  assert.ok(match, `Missing ${routeName} route handle`);
  return match[1];
};

test("rental list routes do not become workspace tabs", () => {
  assert.doesNotMatch(getHandleSource("contracts"), /showBack/);
  assert.doesNotMatch(getHandleSource("accruals"), /showBack/);
});

test("rental document routes keep workspace tab navigation", () => {
  const documentHandles = [
    ...routeSource.matchAll(
      /title: "rental\.(?:contracts\.(?:create|edit|detail)|accruals\.(?:edit|detail))"[\s\S]*?showBack: true/g,
    ),
  ];

  assert.equal(documentHandles.length, 5);
});
