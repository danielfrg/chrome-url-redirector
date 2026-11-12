<script lang="ts">
  import { onMount } from "svelte";
  import { Button, Checkbox, EmptyState, TextInput, ThemeToggle } from "@kenn-io/kit-ui";
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

<main class="page">
  <header class="page-header">
    <div class="brand">
      <img src="/icon/128.png" alt="" width="28" height="28" />
      <h1>URL Redirector</h1>
    </div>
    <ThemeToggle />
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
            <label class="field">
              <span>URL pattern</span>
              <TextInput placeholder="go/*" autocomplete="off" block bind:value={rule.pattern} />
            </label>
            <label class="field">
              <span>Redirect to</span>
              <TextInput
                placeholder="https://go.example.com/$1"
                autocomplete="off"
                block
                bind:value={rule.redirect}
              />
            </label>
            <Checkbox
              label="Regex"
              checked={rule.regex === true}
              onchange={(checked) => ((rule.regex = checked), (dirty = true), (message = ""))}
            />
            <Button
              tone="danger"
              surface="soft"
              ariaLabel={`Remove rule ${i + 1}`}
              onclick={() => remove(rule.id)}
            >
              Remove
            </Button>
          </li>
        {/each}
      </ul>
    {:else}
      <EmptyState title="No rules yet" description="Add a rule to start redirecting." />
    {/if}

    <div class="actions">
      <Button onclick={add}>Add rule</Button>
      <Button type="submit" tone="info" surface="solid" disabled={!dirty}>Save</Button>
    </div>
  </form>
</main>

<style>
  .page {
    max-width: 760px;
    margin: 0 auto;
    padding: 32px 24px 96px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .page-header,
  .panel-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }
  .panel {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
    background: var(--bg-surface);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-lg);
  }
  h2 {
    font-size: var(--font-size-md);
    font-weight: 600;
  }
  .hint {
    font-size: var(--font-size-sm, 13px);
  }
  .error {
    color: var(--accent-red);
  }
  .rule-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .rule-row {
    display: grid;
    grid-template-columns: 1fr 1fr auto auto;
    align-items: end;
    gap: 12px;
    padding: 10px 0;
    border-bottom: 1px solid var(--border-muted);
  }
  .field {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: var(--font-size-sm, 13px);
    color: var(--text-secondary);
  }
  .actions {
    display: flex;
    justify-content: space-between;
    gap: 8px;
  }
  @media (max-width: 620px) {
    .rule-row {
      grid-template-columns: 1fr;
    }
  }
</style>
