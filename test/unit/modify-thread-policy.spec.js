'use strict'

const { test, trait, before } = use('Test/Suite')('Modify Thread Policy')

const Route = use('Route')

trait('Test/ApiClient')
trait('Auth/Client')
trait('DatabaseTransactions')

before(() => {
  const action = ({ response }) => response.json({ ok: true })
  Route.post('test/modify-thread-policy/:id', action).middleware(['auth', 'modifyThreadPolicy'])
})

test('non creator of a thread cannot modify it', async ({ client }) => {
  const thread = await factory('App/Models/Thread').create()
  const notOwner = await factory('App/Models/User').create()
  let response = await client.post(`test/modify-thread-policy/${thread.id}`).loginVia(notOwner).send().end()
  response.assertStatus(403)
})

test('creator of a thread can modify it', async ({ client }) => {
  const thread = await factory('App/Models/Thread').create()
  let response = await client.post(`test/modify-thread-policy/${thread.id}`).loginVia(await thread.user().first()).send().end()
  response.assertStatus(200)
})

test('moderator can modify threads', async ({ client }) => {
  const moderator = await factory('App/Models/User').create({ type: 1 })
  const thread = await factory('App/Models/Thread').create()
  let response = await client.post(`test/modify-thread-policy/${thread.id}`).loginVia(moderator).send().end()
  response.assertStatus(200)
})
