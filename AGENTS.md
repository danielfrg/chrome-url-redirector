# URL Redirector Chrome extension

Chrome extension to redirect URLs by wildcard pattern. Uses WXT with Svelte 5 and kit-ui.

- `lib/rules.js`: pure rule to declarativeNetRequest conversion (tested in `tests/`).
- `entrypoints/background`: syncs saved rules into Chrome dynamic redirect rules.
- `lib/storage.js`: rules in `chrome.storage.local`.
- `entrypoints/`: background worker, popup, options page.
- `assets/theme.css` and `assets/components.css` are copied byte-identical from the design system; do not edit.
- Commands: `pnpm test`, `pnpm check`, `pnpm lint`, `pnpm build`.
