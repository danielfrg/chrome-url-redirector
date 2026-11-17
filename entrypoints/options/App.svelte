<script lang="ts">
  import { onMount } from "svelte";
  import { Button } from "@ui-sdk/svelte/button";
  import { Field, FieldLabel } from "@ui-sdk/svelte/field";
  import { Input } from "@ui-sdk/svelte/input";
  import { Preferences } from "@ui-sdk/svelte/preferences";
  import { ThemeToggle } from "../../src/design-system/custom/theme-toggle";
  import { colorScheme } from "../../lib/color-scheme";
  import CheckField from "../../lib/components/CheckField.svelte";
  import { ruleRegex } from "../../lib/rules.js";
  import { loadRules, saveRules, RULES_KEY } from "../../lib/storage.js";

  interface Rule {
    id: number;
    pattern: string;
    redirect: string;
    regex?: boolean;
  }

  let nextId = 0;
  let rules = $state<Rule[]>([]);
  let dirty = $state(false);
  let message = $state("");
  let error = $state("");

  const toDraft = (list: { pattern: string; redirect: string; regex?: boolean }[]): Rule[] =>
    list.map((r) => ({ ...r, id: nextId++ }));

  async function load() {
    rules = toDraft(await loadRules());
    dirty = false;
  }

  onMount(() => {
    void load();
    // Pick up changes from another window unless there are unsaved edits.
    const onChanged = (changes: Record<string, unknown>, area: string) => {
      if (area === "local" && changes[RULES_KEY] && !dirty) void load();
    };
    chrome.storage.onChanged.addListener(onChanged);
    return () => chrome.storage.onChanged.removeListener(onChanged);
  });

  function add() {
    rules.push({ id: nextId++, pattern: "", redirect: "", regex: false });
    dirty = true;
    message = "";
  }
  function remove(id: number) {
    rules = rules.filter((r) => r.id !== id);
    dirty = true;
    message = "";
  }
  async function save(event: Event) {
    event.preventDefault();
    error = "";
    for (const [i, r] of rules.entries()) {
      if (!r.pattern.trim() || !r.redirect.trim()) continue;
      const check = await chrome.declarativeNetRequest.isRegexSupported({
        regex: ruleRegex({ ...r, pattern: r.pattern.trim() }),
        isCaseSensitive: true,
      });
      if (!check.isSupported) {
        error = `Rule ${i + 1}: Chrome can't use this pattern (${check.reason ?? "invalid"}). Lookahead and backreferences aren't supported.`;
        return;
      }
    }
    try {
      const saved = await saveRules(
        rules.map(({ pattern, redirect, regex }) => ({ pattern, redirect, regex })),
      );
      rules = toDraft(saved);
      dirty = false;
      message = "Saved";
      setTimeout(() => (message = ""), 2000);
    } catch (e) {
      error = (e as Error).message || "Could not save rules.";
    }
  }
</script>

<Preferences preferences={[colorScheme]}>
  <main class="page">
    <header class="page-header">
      <div class="brand">
        <img src="/icon/128.png" alt="" width="28" height="28" />
        <h1>URL Redirector</h1>
      </div>
      <ThemeToggle {colorScheme} />
    </header>

    {#if error}
      <p class="error" role="alert">{error}</p>
    {/if}

    <form class="panel" onsubmit={save} oninput={() => ((dirty = true), (message = ""))}>
      <div class="panel-head">
        <h2>Redirect rules</h2>
        <span class="feedback" role="status" aria-live="polite" hidden={!message}>{message}</span>
      </div>
      <p class="muted hint">
        Use <code>*</code> in the pattern to capture text, and <code>$1</code>, <code>$2</code>… in
        the redirect to insert it. With Regex on, the pattern is a regular expression and its
        capture groups feed <code>$1</code>… The first matching rule wins.
      </p>

      {#if rules.length}
        <ul class="rule-list">
          {#each rules as rule, i (rule.id)}
            <li class="rule-row">
              <Field name={`pattern-${rule.id}`}>
                <FieldLabel>URL pattern</FieldLabel>
                <Input placeholder="go/*" autocomplete="off" bind:value={rule.pattern} />
              </Field>
              <Field name={`redirect-${rule.id}`}>
                <FieldLabel>Redirect to</FieldLabel>
                <Input
                  placeholder="https://go.example.com/$1"
                  autocomplete="off"
                  bind:value={rule.redirect}
                />
              </Field>
              <CheckField
                checked={rule.regex === true}
                onchange={(checked) => ((rule.regex = checked), (dirty = true), (message = ""))}
              >
                Regex
              </CheckField>
              <Button
                data-variant="destructive"
                aria-label={`Remove rule ${i + 1}`}
                onclick={() => remove(rule.id)}
              >
                Remove
              </Button>
            </li>
          {/each}
        </ul>
      {:else}
        <div class="empty muted">
          <strong>No rules yet</strong>
          Add a rule to start redirecting.
        </div>
      {/if}

      <div class="actions">
        <Button onclick={add}>Add rule</Button>
        <Button type="submit" data-variant="solid" disabled={!dirty}>Save</Button>
      </div>
    </form>
  </main>
</Preferences>
