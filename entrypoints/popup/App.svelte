<script lang="ts">
  import { onMount } from "svelte";
  import { Button } from "@ui-sdk/svelte/button";
  import { Preferences } from "@ui-sdk/svelte/preferences";
  import { ThemeToggle } from "../../src/design-system/custom/theme-toggle";
  import { colorScheme } from "../../lib/color-scheme";
  import { loadRules, RULES_KEY } from "../../lib/storage.js";

  let count = $state(0);

  const refresh = async () => (count = (await loadRules()).length);

  onMount(() => {
    void refresh();
    const onChanged = (changes: Record<string, unknown>, area: string) => {
      if (area === "local" && changes[RULES_KEY]) void refresh();
    };
    chrome.storage.onChanged.addListener(onChanged);
    return () => chrome.storage.onChanged.removeListener(onChanged);
  });
</script>

<Preferences preferences={[colorScheme]}>
  <main class="popup">
    <header class="popup-top">
      <div class="brand">
        <img src="/icon/32.png" alt="" width="24" height="24" />
        <h1>URL Redirector</h1>
      </div>
      <ThemeToggle {colorScheme} />
    </header>

    <p class="muted" role="status" aria-live="polite">
      {count === 0 ? "No redirect rules yet" : `${count} active ${count === 1 ? "rule" : "rules"}`}
    </p>

    <Button class="full" onclick={() => chrome.runtime.openOptionsPage()}>Manage rules</Button>
  </main>
</Preferences>
