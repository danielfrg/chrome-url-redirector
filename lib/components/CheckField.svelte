<script lang="ts">
  import type { Snippet } from "svelte";
  import { CheckIcon } from "@lucide/svelte";
  import { Checkbox, CheckboxIndicator } from "@ui-sdk/svelte/checkbox";

  interface Props {
    checked: boolean;
    onchange: (checked: boolean) => void;
    disabled?: boolean;
    /** Names the checkbox when there is no visible label. */
    ariaLabel?: string;
    children?: Snippet;
  }
  let { checked, onchange, disabled = false, ariaLabel, children }: Props = $props();
</script>

<label data-slot="label" class="check-field">
  <Checkbox
    {checked}
    {disabled}
    aria-label={ariaLabel}
    onCheckedChange={(next) => onchange(next === true)}
  >
    <CheckboxIndicator><CheckIcon aria-hidden="true" /></CheckboxIndicator>
  </Checkbox>
  {@render children?.()}
</label>
