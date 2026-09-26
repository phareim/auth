<template>
  <hr class="hairline" :class="{ 'hairline--strong': strong }" />
</template>

<script setup lang="ts">
// Tufte primitive, from do-web/components/tufte (Tailwind classes turned into scoped CSS).
defineProps<{ strong?: boolean }>()
</script>

<style scoped>
.hairline {
  border: 0;
  border-top: 1px solid var(--border-rule);
  margin: 0;
}
.hairline--strong { border-top-color: var(--border-strong); }
</style>
