<script lang="ts">
  import type { ColorSchemeValue } from "@ui-sdk/core";
  import { Button } from "@ui-sdk/svelte/button";
  import { usePreference } from "@ui-sdk/svelte/preferences";
  import { Monitor, Moon, Sun } from "@lucide/svelte";
  import { colorScheme as shared } from "./color-scheme";

  interface Props {
    // The app's color scheme; defaults to the shared one from ./color-scheme.
    colorScheme?: typeof shared;
  }

  let { colorScheme = shared }: Props = $props();

  // The scheme is fixed for the life of the app.
  // svelte-ignore state_referenced_locally
  const scheme = usePreference(colorScheme);
  const order: ColorSchemeValue[] = ["light", "dark", "system"];
  const current = $derived(scheme.current.value);
  const next = $derived(order[(order.indexOf(current) + 1) % order.length] ?? "system");

  function change() {
    colorScheme.set(next);
  }
</script>

<Button
  class="theme-toggle"
  data-variant="ghost"
  aria-label={`Color scheme: ${current}. Switch to ${next}`}
  title={`Color scheme: ${current}`}
  onclick={change}
>
  {#if current === "light"}<Sun aria-hidden="true" />
  {:else if current === "dark"}<Moon aria-hidden="true" />
  {:else}<Monitor aria-hidden="true" />{/if}
</Button>
