<template>
  <div class="neon">
    <DuskScene />

    <main class="neon__main">
      <section class="px-box neon__card" aria-labelledby="auth-title">
        <p class="px-text neon__brand">phareim.no</p>

        <template v-if="stage === 'form'">
          <h1 id="auth-title" class="px-text neon__title">{{ mode === 'signup' ? 'New account' : 'Sign in' }}</h1>
          <p class="neon__dest">
            <template v-if="targetHost">Continue to <span class="neon__host">{{ targetHost }}</span></template>
            <template v-else>One account for every phareim.no app</template>
          </p>

          <form class="neon__form" @submit.prevent="submit">
            <div v-if="mode === 'signup'" class="neon__field">
              <label for="name" class="px-text neon__label">Name <span class="neon__optional">optional</span></label>
              <input id="name" v-model="fields.name" class="neon__input" type="text" autocomplete="name" />
            </div>

            <div class="neon__field">
              <label for="email" class="px-text neon__label">Email</label>
              <input
                id="email" v-model="fields.email" class="neon__input" type="email" required
                autocomplete="email" autocapitalize="off" spellcheck="false"
              />
            </div>

            <div class="neon__field">
              <label for="password" class="px-text neon__label">Password</label>
              <input
                id="password" v-model="fields.password" class="neon__input" type="password" required
                :minlength="mode === 'signup' ? 12 : undefined"
                :autocomplete="mode === 'signup' ? 'new-password' : 'current-password'"
                :aria-describedby="mode === 'signup' ? 'password-hint' : undefined"
              />
              <p v-if="mode === 'signup'" id="password-hint" class="neon__hint">{{ PASSWORD_HINT }}</p>
            </div>

            <div v-if="mode === 'signup'" class="neon__field">
              <label for="invite" class="px-text neon__label neon__label--gold">Invite phrase</label>
              <input
                id="invite" v-model="fields.inviteCode" class="neon__input" type="text" required
                autocomplete="off" autocapitalize="off" spellcheck="false" aria-describedby="invite-hint"
              />
              <p id="invite-hint" class="neon__hint">The phrase from your invite.</p>
            </div>

            <p class="neon__error" role="alert">{{ error }}</p>

            <button type="submit" class="px-btn px-btn--pink neon__submit" :disabled="busy">
              <template v-if="busy">Working<span class="neon__cursor" aria-hidden="true">■</span></template>
              <template v-else>▶ {{ mode === 'signup' ? 'Create account' : 'Sign in' }}</template>
            </button>
          </form>

          <button type="button" class="px-btn neon__switch" @click="setMode(mode === 'signup' ? 'signin' : 'signup')">
            {{ mode === 'signup' ? 'Have an account? Sign in' : 'New here? Sign up' }}
          </button>
        </template>

        <template v-else-if="stage === 'signed-in'">
          <h1 id="auth-title" class="px-text neon__title">Signed in</h1>
          <p class="neon__who">
            <span class="px-text neon__name">{{ displayName }}</span>
            <span v-if="user?.name && user?.email" class="neon__email">{{ user.email }}</span>
          </p>
          <p class="neon__error" role="alert">{{ error }}</p>
          <button type="button" class="px-btn neon__submit" :disabled="busy" @click="signOut">
            {{ busy ? 'Working' : 'Sign out' }}
          </button>
        </template>

        <template v-else>
          <h1 id="auth-title" class="px-text neon__title">Signed in</h1>
          <p class="neon__dest" role="status">
            On the way to <a class="neon__host" :href="target ?? undefined">{{ targetHost }}</a><span class="neon__cursor" aria-hidden="true">■</span>
          </p>
        </template>
      </section>
    </main>

    <button type="button" class="px-btn neon__look" aria-label="Switch to the paper look" @click="toggleTheme">
      Paper
    </button>
  </div>
</template>

<script setup lang="ts">
import { PASSWORD_HINT } from '~/composables/useAuthFlow'

const { mode, targetHost, target, stage, user, displayName, error, busy, fields, setMode, toggleTheme, submit, signOut } = useAuthFlow()
</script>

<style scoped>
/*
 * The neon look is phareim.no's pixel look: Neon Shrine's dialog box
 * (.px-box / .px-btn from pixel/pixel.css), its 5×7 font at 16 and 32 px
 * (whole multiples of the font's 8 px em), hard one-pixel edges, no soft
 * corners. Typed text and prose stay in Space Mono: the pixel font has
 * capitals only, and an email address should read as typed.
 */
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
  padding: max(16px, env(safe-area-inset-top)) 16px calc(52px + env(safe-area-inset-bottom));
}

.neon__card {
  width: 100%;
  max-width: 384px;
  padding: 18px 16px 16px;
}
@media (min-width: 600px) {
  .neon__card { padding: 22px 22px 20px; }
}

.neon__brand {
  margin: 4px 0 0;
  font-size: 16px;
  line-height: 1;
  color: #b9a8d9;
}

.neon__title {
  margin: 12px 0 0;
  font-size: 32px;
  line-height: 1;
  color: #ff2fa0;
  text-shadow: 4px 4px 0 #0b0616, 0 0 16px rgba(255, 47, 160, 0.45);
}

.neon__dest {
  margin: 12px 0 0;
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.5;
  color: #b9a8d9;
  overflow-wrap: anywhere;
}
.neon__host {
  color: #2ff3ff;
  text-decoration: none;
}
a.neon__host:hover { text-decoration: underline; }

.neon__form {
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.neon__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.neon__label {
  font-size: 16px;
  line-height: 1;
  color: #2ff3ff;
  text-shadow: 2px 2px 0 #0b0616;
}
.neon__label--gold { color: #ffd23f; }
.neon__optional {
  margin-left: 6px;
  font-family: var(--font-mono);
  font-size: 12px;
  text-transform: none;
  text-shadow: none;
  color: #9a8bc0;
}

/* .px-box sets the pixel font's capitals; prose and typed text read as written. */
.neon__dest,
.neon__hint,
.neon__error,
.neon__email,
.neon__input { text-transform: none; }

/* A field is a sunken dialog box: the same notched one-pixel edge. */
.neon__input {
  --px-u: 2px;
  --px-edge: #3b2b62;
  margin: 2px;
  width: calc(100% - 4px);
  padding: 7px 10px;
  border: 0;
  border-radius: 0;
  background: #0b0616;
  color: #f4ecff;
  caret-color: #ff2fa0;
  font-family: var(--font-mono);
  font-size: 16px;
  line-height: 1.4;
  outline: none;
  box-shadow:
    0 calc(-1 * var(--px-u)) 0 0 var(--px-edge),
    0 var(--px-u) 0 0 var(--px-edge),
    calc(-1 * var(--px-u)) 0 0 0 var(--px-edge),
    var(--px-u) 0 0 0 var(--px-edge),
    inset 0 var(--px-u) 0 0 #140b26;
}
.neon__input:focus { --px-edge: #2ff3ff; }
.neon__input:-webkit-autofill {
  -webkit-text-fill-color: #f4ecff;
  -webkit-box-shadow: 0 0 0 40px #0b0616 inset;
}

.neon__hint {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 1.45;
  color: #9a8bc0;
}

.neon__error {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.45;
  color: #ff5ec0;
}
.neon__error:empty { display: none; }

.neon__submit {
  width: calc(100% - 4px);
  margin: 4px 2px 0;
  padding: 12px 8px;
}
.neon__submit:disabled { cursor: default; opacity: 0.7; }

.neon__switch {
  --px-edge: #6f5f96;
  display: block;
  width: calc(100% - 4px);
  margin: 12px 2px 0;
  padding: 10px 8px;
  color: #b9a8d9;
}
.neon__switch:hover,
.neon__switch:focus-visible { --px-edge: #2ff3ff; }

.neon__who {
  margin: 16px 0 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-wrap: anywhere;
}
.neon__name {
  font-size: 16px;
  line-height: 1.25;
  color: #f4ecff;
}
.neon__email {
  font-family: var(--font-mono);
  font-size: 13px;
  color: #b9a8d9;
}

.neon__cursor {
  margin-left: 4px;
  animation: neon-blink 1.1s steps(1) infinite;
}
@keyframes neon-blink { 50% { opacity: 0; } }
@media (prefers-reduced-motion: reduce) {
  .neon__cursor { animation: none; }
}

.neon__look {
  --px-edge: #6f5f96;
  /* At the foot of the page, not fixed: on a short phone it must not sit on the form. */
  position: absolute;
  z-index: 2;
  right: 14px;
  bottom: calc(14px + env(safe-area-inset-bottom));
  color: #b9a8d9;
}
</style>
