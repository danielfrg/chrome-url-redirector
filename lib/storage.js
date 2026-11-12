import { normalizeRules } from "./rules.js";

const KEY = "redirectPatterns";

/**
 * Rules live in local storage only; nothing is synced. Rules saved by older
 * versions in sync storage are copied over once.
 */
export async function loadRules(area = chrome.storage) {
  const local = await area.local.get(KEY);
  if (Array.isArray(local[KEY])) return normalizeRules(local[KEY]);
  let legacy = [];
  try {
    legacy = normalizeRules((await area.sync.get(KEY))[KEY]);
  } catch {
    /* Sync storage is optional. */
  }
  if (legacy.length) await area.local.set({ [KEY]: legacy });
  return legacy;
}

export async function saveRules(rules, area = chrome.storage) {
  const clean = normalizeRules(rules);
  await area.local.set({ [KEY]: clean });
  return clean;
}

export const RULES_KEY = KEY;
