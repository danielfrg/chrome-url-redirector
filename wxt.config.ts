import { defineConfig } from "wxt";

export default defineConfig({
  modules: ["@wxt-dev/module-svelte"],
  manifest: {
    name: "URL Redirector",
    description: "Redirect URLs based on patterns. Open source, no data collected.",
    minimum_chrome_version: "120",
    permissions: ["declarativeNetRequest", "storage"],
    host_permissions: ["<all_urls>"],
    action: { default_title: "URL Redirector" },
    content_security_policy: {
      extension_pages:
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-src 'none'",
    },
  },
});
