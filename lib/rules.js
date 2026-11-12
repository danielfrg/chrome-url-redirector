/**
 * Pure redirect-rule logic shared by the background worker and the UI.
 * A rule is { pattern, redirect, regex? }: a wildcard pattern (`*` captures) or,
 * with `regex: true`, a regular expression used as written (add ^ and $ yourself),
 * plus a redirect template (`$1`..`$9` insert captures).
 *
 * Chrome performs the redirects (declarativeNetRequest), so regular expressions
 * use Chrome's RE2 syntax: no lookahead and no backreferences.
 */

/** Keeps only well-formed rules with both fields filled in. */
export function normalizeRules(value) {
  if (!Array.isArray(value)) return [];
  const rules = [];
  for (const item of value) {
    if (!item || typeof item.pattern !== "string" || typeof item.redirect !== "string") continue;
    const pattern = item.pattern.trim();
    const redirect = item.redirect.trim();
    if (!pattern || !redirect) continue;
    rules.push(item.regex === true ? { pattern, redirect, regex: true } : { pattern, redirect });
  }
  return rules;
}

/** The regular expression (RE2 source) that a rule matches full URLs against. */
export function ruleRegex(rule) {
  if (rule.regex) return rule.pattern;
  const escaped = rule.pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, "(.+)");
  // The http(s):// prefix is optional in wildcard patterns.
  return `^(?:https?://)?${escaped}$`;
}

/** Converts a redirect template to Chrome's substitution syntax ($1 -> \1). */
export function ruleSubstitution(rule) {
  // In wildcard rules `*` in the template is shorthand for `$1`.
  const template = rule.regex ? rule.redirect : rule.redirect.replace(/\*/g, "$1");
  return template.replace(/\\/g, "\\\\").replace(/\$(\d)/g, "\\$1");
}

/** Builds Chrome declarativeNetRequest rules; earlier rules take priority. */
export function toDnrRules(rules) {
  return rules.map((rule, i) => ({
    id: i + 1,
    priority: rules.length - i,
    action: { type: "redirect", redirect: { regexSubstitution: ruleSubstitution(rule) } },
    condition: { regexFilter: ruleRegex(rule), resourceTypes: ["main_frame"] },
  }));
}
