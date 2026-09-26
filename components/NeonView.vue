<template>
  <div class="neon">
    <NeonHorizon />

    <main class="neon__main">
      <section class="nd-card neon__card" aria-labelledby="auth-title">
        <p class="nd-lab neon__brand">phareim.no</p>

        <template v-if="stage === 'form'">
          <h1 id="auth-title" class="nd-over-title neon__title">{{ mode === 'signup' ? 'Sign up' : 'Sign in' }}</h1>
          <p class="neon__dest">
            <template v-if="targetHost">Continue to <span class="neon__host">{{ targetHost }}</span></template>
            <template v-else>One account for every phareim.no app</template>
          </p>

          <form class="neon__form" @submit.prevent="submit">
            <div v-if="mode === 'signup'" class="nd-field">
              <label for="name" class="nd-lab">Name <span class="neon__optional">· optional</span></label>
              <input id="name" v-model="fields.name" class="nd-input" type="text" autocomplete="name" />
            </div>

            <div class="nd-field">
              <label for="email" class="nd-lab">Email</label>
              <input
                id="email" v-model="fields.email" class="nd-input" type="email" required
                autocomplete="email" autocapitalize="off" spellcheck="false"
              />
            </div>

            <div class="nd-field">
              <label for="password" class="nd-lab">Password</label>
              <input
                id="password" v-model="fields.password" class="nd-input" type="password" required
                :minlength="mode === 'signup' ? 12 : undefined"
                :autocomplete="mode === 'signup' ? 'new-password' : 'current-password'"
                :aria-describedby="mode === 'signup' ? 'password-hint' : undefined"
              />
              <p v-if="mode === 'signup'" id="password-hint" class="neon__hint">{{ PASSWORD_HINT }}</p>
            </div>

            <div v-if="mode === 'signup'" class="nd-field">
              <label for="invite" class="nd-lab">Invite phrase</label>
              <input
                id="invite" v-model="fields.inviteCode" class="nd-input" type="text" required
                autocomplete="off" autocapitalize="off" spellcheck="false" aria-describedby="invite-hint"
              />
              <p id="invite-hint" class="neon__hint">The phrase from your invite.</p>
            </div>

            <p class="nd-hint neon__error" role="alert">{{ error }}</p>

            <button type="submit" class="nd-button neon__submit" :disabled="busy">
              <template v-if="busy">Working…</template>
              <template v-else>
                <span aria-hidden="true">▶</span>{{ mode === 'signup' ? 'Create account' : 'Sign in' }}<span aria-hidden="true">◀</span>
              </template>
            </button>
          </form>

          <button
            type="button" class="nd-button nd-button--primary nd-button--ghost nd-button--sm neon__switch"
            @click="setMode(mode === 'signup' ? 'signin' : 'signup')"
          >
            {{ mode === 'signup' ? 'Have an account? Sign in' : 'New here? Sign up' }}
          </button>
        </template>

        <template v-else-if="stage === 'signed-in'">
          <h1 id="auth-title" class="nd-over-title neon__title">Signed in</h1>
          <p class="neon__who">
            <span class="neon__name">{{ displayName }}</span>
            <span v-if="user?.name && user?.email" class="neon__email">{{ user.email }}</span>
          </p>
          <p class="nd-hint neon__error" role="alert">{{ error }}</p>
          <button type="button" class="nd-button nd-button--primary neon__submit" :disabled="busy" @click="signOut">
            {{ busy ? 'Working…' : 'Sign out' }}
          </button>
        </template>

        <template v-else>
          <h1 id="auth-title" class="nd-over-title neon__title">Signed in</h1>
          <p class="neon__dest" role="status">
            On the way to <a class="neon__host" :href="target ?? undefined">{{ targetHost }}</a>
          </p>
        </template>
      </section>
    </main>

    <button
      type="button" class="nd-button nd-button--primary nd-button--ghost nd-button--sm neon__look"
      aria-label="Switch to the paper look" @click="toggleTheme"
    >
      Paper
    </button>
  </div>
</template>

<script setup lang="ts">
import { PASSWORD_HINT } from '~/composables/useAuthFlow'

const { mode, targetHost, target, stage, user, displayName, error, busy, fields, setMode, toggleTheme, submit, signOut } = useAuthFlow()
</script>

<style scoped>
.neon {
  position: relative;
  min-height: 100vh;
  min-height: 100dvh;
}

.neon__main {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: max(12px, env(safe-area-inset-top)) 16px calc(52px + env(safe-area-inset-bottom));
}

.neon__card {
  width: 100%;
  max-width: 380px;
  padding: 20px 18px 14px;
}
@media (min-width: 600px) {
  .neon__card { padding: 24px 22px 18px; }
}

.neon__brand { margin: 0; }

.neon__title {
  margin: 10px 0 0;
  font-size: 28px;
}

.neon__dest {
  margin: 8px 0 0;
  font-size: 15px;
  line-height: 1.45;
  color: var(--text-muted);
  overflow-wrap: anywhere;
}
.neon__host {
  font-family: var(--font-mono);
  font-size: 14px;
  color: var(--neon-primary);
  text-decoration: none;
}
a.neon__host:hover { text-decoration: underline; }

.neon__form {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.neon__optional { color: var(--text-subtle); }

.neon__hint {
  margin: 0;
  font-size: 13px;
  line-height: 1.4;
  color: var(--text-muted);
}

.neon__error {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
}
.neon__error:empty { display: none; }

.neon__submit {
  width: 100%;
  margin-top: 4px;
}

.neon__switch {
  display: flex;
  width: 100%;
  margin-top: 10px;
}

.neon__who {
  margin: 16px 0 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-wrap: anywhere;
}
.neon__name { font-size: 20px; font-weight: 400; }
.neon__email { font-family: var(--font-mono); font-size: 13px; color: var(--text-muted); }

.neon__look {
  /* At the foot of the page, not fixed: on a short phone it must not sit on the form. */
  position: absolute;
  z-index: 2;
  right: 12px;
  bottom: calc(8px + env(safe-area-inset-bottom));
  opacity: .6;
}
.neon__look:hover,
.neon__look:focus-visible { opacity: 1; }
</style>
