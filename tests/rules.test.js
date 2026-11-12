import test from "node:test";
import assert from "node:assert/strict";
import { normalizeRules, ruleRegex, ruleSubstitution, toDnrRules } from "../lib/rules.js";
import { loadRules, saveRules } from "../lib/storage.js";

// Applies a DNR-style rule the way Chrome would, to check the generated regex and template.
function apply(rule, url) {
  const m = new RegExp(rule.condition.regexFilter).exec(url);
  if (!m) return null;
  return rule.action.redirect.regexSubstitution.replace(/\\(\\|\d)/g, (_, c) =>
    c === "\\" ? "\\" : (m[Number(c)] ?? ""),
  );
}
const one = (rule, url) => apply(toDnrRules([rule])[0], url);

const wild = { pattern: "go/*", redirect: "https://go.example.com/$1" };

test("wildcard matches with or without scheme and substitutes captures", () => {
  assert.equal(one(wild, "http://go/docs"), "https://go.example.com/docs");
  assert.equal(one(wild, "https://go/docs/a"), "https://go.example.com/docs/a");
  assert.equal(one(wild, "https://example.net/"), null);
});

test("regex characters in wildcard patterns are literal", () => {
  const r = { pattern: "a.b/*", redirect: "https://x.example.com/$1" };
  assert.equal(one(r, "http://axb/1"), null);
  assert.equal(one(r, "http://a.b/1"), "https://x.example.com/1");
});

test("multiple captures and the * shorthand", () => {
  const r = { pattern: "*.example.net/*", redirect: "https://$2.example.com/$1" };
  assert.equal(one(r, "https://a.example.net/b"), "https://b.example.com/a");
  assert.equal(
    ruleSubstitution({ pattern: "x/*", redirect: "https://e.example.com/*" }),
    "https://e.example.com/\\1",
  );
});

test("regex rules use the pattern as written", () => {
  const r = {
    pattern: "^https:\\/\\/www\\.example\\.com\\/search\\?.*q=go(?:%2F|\\/)([^&]+).*$",
    redirect: "https://go.example.net/$1",
    regex: true,
  };
  assert.equal(ruleRegex(r), r.pattern);
  assert.equal(
    one(r, "https://www.example.com/search?q=go%2Fasdf&oq=go%2Fasdf&ie=UTF-8"),
    "https://go.example.net/asdf",
  );
  assert.equal(one(r, "https://www.example.com/search?q=other"), null);
});

test("backslashes in templates are escaped", () => {
  assert.equal(
    ruleSubstitution({ pattern: "a", redirect: "https://e.example.com/a\\b" }),
    "https://e.example.com/a\\\\b",
  );
});

test("earlier rules get higher priority and unique ids", () => {
  const rules = toDnrRules([wild, { pattern: "x/*", redirect: "https://e.example.com/$1" }]);
  assert.deepEqual(
    rules.map((r) => [r.id, r.priority]),
    [
      [1, 2],
      [2, 1],
    ],
  );
  assert.deepEqual(rules[0].condition.resourceTypes, ["main_frame"]);
});

test("normalizeRules trims and drops incomplete rules", () => {
  assert.deepEqual(
    normalizeRules([{ pattern: " a/* ", redirect: " b " }, { pattern: "", redirect: "x" }, null]),
    [{ pattern: "a/*", redirect: "b" }],
  );
  assert.deepEqual(normalizeRules(undefined), []);
});

function fakeArea(local = {}, sync = {}) {
  const mk = (store) => ({
    get: async (key) => (key in store ? { [key]: store[key] } : {}),
    set: async (obj) => Object.assign(store, obj),
  });
  return { local: mk(local), sync: mk(sync), _local: local };
}

test("migrates legacy sync rules to local once", async () => {
  const area = fakeArea({}, { redirectPatterns: [wild] });
  assert.deepEqual(await loadRules(area), [wild]);
  assert.deepEqual(area._local.redirectPatterns, [wild]);
});

test("saveRules stores cleaned rules locally", async () => {
  const area = fakeArea();
  await saveRules([wild, { pattern: "", redirect: "" }], area);
  assert.deepEqual(area._local.redirectPatterns, [wild]);
});
