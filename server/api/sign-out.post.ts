export default defineEventHandler(async (event) => {
  return relay(event, await callReader(event, 'sign-out'))
})
