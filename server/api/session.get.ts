// { user } only: Reader's `features` are Reader's business.
export default defineEventHandler(async (event) => {
  return relay(event, await callReader(event, 'session'), (data) => ({ user: data?.user ?? null }))
})
