<template>
  <NeonView v-if="theme === 'neon'" />
  <PaperView v-else />
</template>

<script setup lang="ts">
// One page. The theme is picked on the server (lib/theme.ts) and set as a
// class on <html>, so the first paint is already the right look.
const { theme, mode, stage, checkSession } = useAuthFlow()

useHead(() => {
  const paper = theme.value === 'paper'
  const title = stage.value !== 'form' ? 'Signed in' : mode.value === 'signup' ? 'Create account' : 'Sign in'
  return {
    title: `${title} · phareim.no`,
    htmlAttrs: { class: paper ? 'theme-paper tufte-tactile' : 'theme-neon' },
    meta: paper
      ? [
          { name: 'color-scheme', content: 'light dark' },
          // The desk, not the paper: the tactile layer's page ground.
          { name: 'theme-color', content: '#7a7062', media: '(prefers-color-scheme: light)' },
          { name: 'theme-color', content: '#2a2622', media: '(prefers-color-scheme: dark)' },
        ]
      : [
          { name: 'color-scheme', content: 'dark' },
          { name: 'theme-color', content: '#0b0616' },
        ],
  }
})

onMounted(checkSession)
</script>
