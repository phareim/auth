<template>
  <span class="mono-label" :class="{ 'mono-label--accent': accent }"><template v-if="dash">&mdash;&nbsp;</template><slot /></span>
</template>

<script setup lang="ts">
// Tufte primitive, from do-web/components/tufte (Tailwind classes turned into scoped CSS).
defineProps<{
  /** Leading em-dash, the Tufte/Almanac section-label convention. */
  dash?: boolean
  /** Promote to the screen's single accent. */
  accent?: boolean
}>()
</script>

<style scoped>
.mono-label {
  font-family: 'SF Mono', ui-monospace, Menlo, Consolas, monospace;
  font-size: 10px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--text-muted);
}
.mono-label--accent { color: var(--text-accent); }
</style>
