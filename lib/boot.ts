import { mount, type Component } from "svelte";
import { initTheme, setThemeMode } from "@kenn-io/kit-ui";
import "@kenn-io/kit-ui/theme.css";
import "../assets/theme.css";
import "../assets/app.css";
import "../assets/components.css";

const THEME_KEY = "url-redirector-theme";

/** Applies the shared theme (charcoal by default) and mounts a page. */
export function boot(App: Component) {
  initTheme({ storageKey: THEME_KEY });
  try {
    if (!localStorage.getItem(THEME_KEY)) setThemeMode("dark");
  } catch {
    setThemeMode("dark");
  }
  mount(App, { target: document.getElementById("app")! });
}
