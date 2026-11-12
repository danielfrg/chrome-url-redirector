<script lang="ts">
  import { onMount } from "svelte";
  import { Button, ThemeToggle } from "@kenn-io/kit-ui";
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

<main class="popup">
  <header class="top">
    <div class="brand">
      <img src="/icon/32.png" alt="" width="24" height="24" />
      <h1>URL Redirector</h1>
    </div>
    <ThemeToggle />
  </header>

  <p class="muted" role="status" aria-live="polite">
    {count === 0 ? "No redirect rules yet" : `${count} active ${count === 1 ? "rule" : "rules"}`}
  </p>

  <Button class="full" onclick={() => chrome.runtime.openOptionsPage()}>Manage rules</Button>
</main>

<style>
  .popup {
    width: 300px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .top {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  :global(.full) {
    width: 100%;
  }
</style>
