import { mount, type Component } from "svelte";
import "../src/app.css";
import "../src/design-system/theme/tokens.css";
import "../src/design-system/theme/components.css";
import "../src/design-system/custom/theme-toggle/theme-toggle.css";

/** Applies the saved color scheme before the first paint (extension pages allow no inline script), then mounts. */
export function boot(App: Component) {
  let scheme = "dark";
  try {
    scheme = localStorage.getItem("color-scheme") ?? scheme;
  } catch {
    // Storage can be unavailable; keep the default.
  }
  document.documentElement.setAttribute("data-color-scheme", scheme);
  mount(App, { target: document.getElementById("app")! });
}
