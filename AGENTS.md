# URL Redirector Chrome extension

Chrome extension to redirect URLs by wildcard pattern. Uses WXT with Svelte 5 and ui-sdk.

- `lib/rules.js`: pure rule to declarativeNetRequest conversion (tested in `tests/`).
- `entrypoints/background`: syncs saved rules into Chrome dynamic redirect rules.
- `lib/storage.js`: rules in `chrome.storage.local`.
- `entrypoints/`: background worker, popup, options page.
- `src/design-system/` is synced from the shared design system (`pnpm sync` in that repo); never edit it by hand. App-specific styles live in `src/app.css`.
- `lib/boot.ts` (shared by the popup and options entrypoints) imports the synced design-system CSS first, then `src/app.css` last, so app rules win ties with the theme; prefer tokens and class selectors over `!important`. `src/app.css` keeps `@layer ui-sdk;` as its first statement.
- Commands: `pnpm test`, `pnpm check`, `pnpm lint`, `pnpm build`.
