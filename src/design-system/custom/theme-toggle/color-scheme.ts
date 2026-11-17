import { createColorScheme, createLocalStorage } from "@ui-sdk/core";

// The color scheme every app shares: "light", "dark" or "system", saved under the
// same localStorage key so the choice carries across apps on one origin.
// Pass `defaultValue` to start somewhere other than "system".
export const COLOR_SCHEME_KEY = "color-scheme";

export function createAppColorScheme(options: { defaultValue?: "light" | "dark" | "system" } = {}) {
  return createColorScheme({
    storage: createLocalStorage(COLOR_SCHEME_KEY),
    global: true,
    ...options,
  });
}

export const colorScheme = createAppColorScheme();
