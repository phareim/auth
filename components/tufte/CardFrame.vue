<template>
  <div class="card-frame tufte-sheet">
    <slot />
  </div>
</template>

<script setup lang="ts">
// Tufte primitive, from do-web/components/tufte (Tailwind classes turned into scoped CSS).
</script>

<style scoped>
.card-frame {
  border: 1px solid var(--border-strong);
  background: var(--paper-raised);
  overflow: hidden;
}
</style>
