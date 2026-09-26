export default defineEventHandler(async (event) => {
  const body = await readJson(event)
  if (!body) return needsJson(event)
  return relay(event, await callReader(event, 'sign-in', pick(body, ['email', 'password'])))
})
