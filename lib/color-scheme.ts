import { createAppColorScheme } from "../src/design-system/custom/theme-toggle/color-scheme.ts";

// Shared color-scheme key, but start in dark mode; a saved choice always wins.
export const colorScheme = createAppColorScheme({ defaultValue: "dark" });
