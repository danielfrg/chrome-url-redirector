import { toDnrRules } from "../../lib/rules.js";
import { loadRules, RULES_KEY } from "../../lib/storage.js";

/** Replaces Chrome's dynamic redirect rules with the saved ones. */
async function syncRules() {
  const dnr = chrome.declarativeNetRequest;
  const wanted = [];
  for (const rule of toDnrRules(await loadRules())) {
    // Skip patterns Chrome's regex engine (RE2) can't run instead of failing them all.
    const { isSupported } = await dnr.isRegexSupported({
      regex: rule.condition.regexFilter,
      isCaseSensitive: true,
    });
    if (isSupported) wanted.push(rule);
  }
  const existing = await dnr.getDynamicRules();
  await dnr.updateDynamicRules({
    removeRuleIds: existing.map((r) => r.id),
    addRules: wanted as chrome.declarativeNetRequest.Rule[],
  });
}

export default defineBackground({
  type: "module",
  main() {
    chrome.runtime.onInstalled.addListener(() => void syncRules());
    chrome.runtime.onStartup.addListener(() => void syncRules());
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === "local" && changes[RULES_KEY]) void syncRules();
    });
    // Also run whenever Chrome starts a fresh worker instance.
    void syncRules();
  },
});
