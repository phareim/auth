<template>
  <button :type="type" class="action-label" :class="{ 'action-label--accent': accent }" :disabled="disabled">
    &mdash;&nbsp;<slot />
  </button>
</template>

<script setup lang="ts">
// Tufte primitive, from do-web/components/tufte (Tailwind classes turned into
// scoped CSS; takes a `type` so it can submit a form).
withDefaults(defineProps<{ accent?: boolean; disabled?: boolean; type?: 'button' | 'submit' }>(), {
  type: 'button',
})
</script>

<style scoped>
.action-label {
  min-height: 36px;
  padding: 6px 12px;
  font-family: 'SF Mono', ui-monospace, Menlo, Consolas, monospace;
  font-size: 10px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  border: 1px solid var(--border-rule);
  border-radius: 0;
  background: var(--surface-button, transparent);
  color: var(--text-muted);
  box-shadow: var(--press-secondary, none);
  cursor: pointer;
  user-select: none;
  transition: color 150ms, border-color 150ms;
}
.action-label:hover:not(:disabled) { border-color: var(--border-strong); color: var(--text-strong); }
.action-label--accent { border-color: var(--tufte-accent); color: var(--text-accent); }
.action-label--accent:hover:not(:disabled) { border-color: var(--tufte-accent); color: var(--text-accent); }
.action-label:focus-visible { outline: 1px solid var(--tufte-accent); outline-offset: 2px; }
.action-label:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
