// Invite-only: Reader checks inviteCode against its own secret. auth-web
// never sees the phrase, it only carries what the user typed.
export default defineEventHandler(async (event) => {
  const body = await readJson(event)
  if (!body) return needsJson(event)
  return relay(event, await callReader(event, 'sign-up', pick(body, ['email', 'password', 'name', 'inviteCode'])))
})
