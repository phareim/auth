<template>
  <main class="paper tufte-desk">
    <div class="tufte-sheet-stack paper__stack">
      <CardFrame class="paper__sheet">
        <section aria-labelledby="auth-title">
          <MonoLabel dash>phareim.no</MonoLabel>

          <template v-if="stage === 'form'">
            <h1 id="auth-title" class="paper__title">{{ mode === 'signup' ? 'Create account' : 'Sign in' }}</h1>
            <p class="paper__dest">
              <template v-if="targetHost">Continue to <span class="paper__host">{{ targetHost }}</span></template>
              <template v-else>One account for every phareim.no app.</template>
            </p>
            <HairlineRule class="paper__rule" />

            <form class="paper__form" @submit.prevent="submit">
              <div v-if="mode === 'signup'">
                <label for="name"><MonoLabel>Name, optional</MonoLabel></label>
                <input id="name" v-model="fields.name" class="paper__input" type="text" autocomplete="name" />
              </div>
              <div>
                <label for="email"><MonoLabel>Email</MonoLabel></label>
                <input
                  id="email" v-model="fields.email" class="paper__input" type="email" required
                  autocomplete="email" autocapitalize="off" spellcheck="false"
                />
              </div>
              <div>
                <label for="password"><MonoLabel>Password</MonoLabel></label>
                <input
                  id="password" v-model="fields.password" class="paper__input" type="password" required
                  :minlength="mode === 'signup' ? 12 : undefined"
                  :autocomplete="mode === 'signup' ? 'new-password' : 'current-password'"
                  :aria-describedby="mode === 'signup' ? 'password-hint' : undefined"
                />
                <p v-if="mode === 'signup'" id="password-hint" class="paper__hint">{{ PASSWORD_HINT }}</p>
              </div>
              <div v-if="mode === 'signup'">
                <label for="invite"><MonoLabel>Invite phrase</MonoLabel></label>
                <input
                  id="invite" v-model="fields.inviteCode" class="paper__input" type="text" required
                  autocomplete="off" autocapitalize="off" spellcheck="false" aria-describedby="invite-hint"
                />
                <p id="invite-hint" class="paper__hint">The phrase from your invite.</p>
              </div>

              <p class="paper__error" role="alert">{{ error }}</p>

              <div class="paper__actions">
                <ActionLabel accent type="submit" :disabled="busy">
                  {{ busy ? 'Working…' : mode === 'signup' ? 'Sign up' : 'Sign in' }}
                </ActionLabel>
                <button type="button" class="paper__mono-button" @click="setMode(mode === 'signup' ? 'signin' : 'signup')">
                  {{ mode === 'signup' ? 'Have an account?' : 'New here?' }}
                </button>
              </div>
            </form>
          </template>

          <template v-else-if="stage === 'signed-in'">
            <h1 id="auth-title" class="paper__title">Signed in</h1>
            <HairlineRule class="paper__rule" />
            <p class="paper__who">
              <span class="paper__name">{{ displayName }}</span>
              <span v-if="user?.name && user?.email" class="paper__email">{{ user.email }}</span>
            </p>
            <p class="paper__error" role="alert">{{ error }}</p>
            <div class="paper__actions">
              <ActionLabel :disabled="busy" @click="signOut">{{ busy ? 'Working…' : 'Sign out' }}</ActionLabel>
            </div>
          </template>

          <template v-else>
            <h1 id="auth-title" class="paper__title">Signed in</h1>
            <p class="paper__dest" role="status">
              On the way to <a class="paper__host" :href="target ?? undefined">{{ targetHost }}</a>
            </p>
          </template>
        </section>
      </CardFrame>
    </div>

    <button type="button" class="paper__look" aria-label="Switch to the neon look" @click="toggleTheme">Neon</button>
  </main>
</template>

<script setup lang="ts">
import { PASSWORD_HINT } from '~/composables/useAuthFlow'

const { mode, targetHost, target, stage, user, displayName, error, busy, fields, setMode, toggleTheme, submit, signOut } = useAuthFlow()
</script>

<style scoped>
/* Modelled on Reader's pages/login.vue: a sheet on the desk, ET Book, hairline inputs. */
.paper {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: max(20px, env(safe-area-inset-top)) 20px calc(52px + env(safe-area-inset-bottom));
  font-family: 'et-book', Charter, Palatino, Georgia, serif;
}

.paper__stack {
  width: 100%;
  max-width: 24rem;
}

.paper__sheet {
  padding: 28px 24px;
}

.paper__title {
  margin: 8px 0 0;
  font-size: 30px;
  font-weight: 400;
  line-height: 1.2;
  color: var(--text-strong);
}

.paper__dest {
  margin: 6px 0 0;
  font-size: 17px;
  line-height: 1.45;
  color: var(--text-muted);
  overflow-wrap: anywhere;
}
.paper__host { color: var(--text-strong); }
a.paper__host { text-decoration-color: var(--border-strong); text-underline-offset: 3px; }

.paper__rule { margin: 16px 0 20px; }

.paper__form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.paper__input {
  display: block;
  width: 100%;
  background: transparent;
  border: 0;
  border-bottom: 1px solid var(--border-strong);
  border-radius: 0;
  color: var(--text-strong);
  font-family: 'et-book', Charter, Georgia, serif;
  font-size: 17px;
  line-height: 1.55;
  padding: 6px 0;
  outline: none;
}
.paper__input:focus { border-bottom-color: var(--tufte-accent); }

.paper__hint {
  margin: 4px 0 0;
  font-size: 13px;
  line-height: 1.4;
  color: var(--text-muted);
}

.paper__error {
  margin: 0;
  font-size: 15px;
  color: var(--text-accent);
}
.paper__error:empty { display: none; }

.paper__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 6px;
}

.paper__mono-button {
  position: relative;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
  font-family: 'SF Mono', ui-monospace, Menlo, Consolas, monospace;
  font-size: 10px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--text-muted);
  transition: color 0.15s ease;
}
/* A bigger hit area than the label. */
.paper__mono-button::after { content: ''; position: absolute; inset: -12px -8px; }
.paper__mono-button:hover { color: var(--text-strong); }
.paper__mono-button:focus-visible { outline: 1px solid var(--tufte-accent); outline-offset: 4px; }

.paper__who {
  margin: 0 0 20px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-wrap: anywhere;
}
.paper__name { font-size: 20px; color: var(--text-strong); }
.paper__email { font-size: 15px; color: var(--text-muted); }

/* On the desk, outside the sheet: desk ink. */
.paper__look {
  /* At the foot of the page, not fixed: on a short phone it must not sit on the form. */
  position: absolute;
  right: 14px;
  bottom: calc(8px + env(safe-area-inset-bottom));
  min-height: 32px;
  padding: 6px 10px;
  border: 0;
  background: none;
  cursor: pointer;
  font-family: 'SF Mono', ui-monospace, Menlo, Consolas, monospace;
  font-size: 10px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--desk-text-faint);
}
.paper__look:hover { color: var(--text-on-desk); }
.paper__look:focus-visible { outline: 1px solid var(--desk-text-accent); outline-offset: 2px; }
</style>
