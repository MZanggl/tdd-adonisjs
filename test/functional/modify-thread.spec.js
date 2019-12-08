'use strict'

const { test, trait, before, after } = use('Test/Suite')('Thread')
const { ioc } = use('@adonisjs/fold')
const Thread = use('App/Models/Thread')
const Factory = use('Factory')

trait('Test/ApiClient')
trait('Auth/Client')
trait('DatabaseTransactions')

before(() => {
  ioc.fake('App/Services/ProfanityGuard', () => {
    return {
      handle: value => value !== 'jackass'
    }
  })
})

after(() => {
  ioc.restore('App/Services/ProfanityGuard')
})

test('unauthenticated user cannot delete threads', async ({ assert, client }) => {
  const thread = await Factory.model('App/Models/Thread').create()
  const response = await client.delete(thread.url()).send().end()
  response.assertStatus(401)
})

test('authorized user can delete threads', async ({ assert, client }) => {
  const thread = await Factory.model('App/Models/Thread').create()
  const response = await client.delete(thread.url()).send().loginVia(await thread.user().first()).end()
  response.assertStatus(204)

  assert.equal(await Thread.getCount(), 0)
})

test('moderator can delete threads', async ({ assert, client }) => {
  const moderator = await Factory.model('App/Models/User').create({ type: 1 })
  const thread = await Factory.model('App/Models/Thread').create()
  const response = await client.delete(thread.url()).send().loginVia(moderator).end()
  response.assertStatus(204)
  assert.equal(await Thread.getCount(), 0)
})

test('thread can not be deleted by a user who did not create it', async ({ client }) => {
  const thread = await Factory.model('App/Models/Thread').create()
  const notOwner = await Factory.model('App/Models/User').create()
  const response = await client.delete(thread.url()).send().loginVia(notOwner).end()
  response.assertStatus(403)
})

test('thread can not be updated by a user who did not create it', async ({ client }) => {
  const thread = await Factory.model('App/Models/Thread').create()
  const notOwner = await Factory.model('App/Models/User').create()
  const response = await client.put(thread.url()).send().loginVia(notOwner).end()
  response.assertStatus(403)
})

test('unauthenticated user cannot update threads', async ({ assert, client }) => {
  const thread = await Factory.model('App/Models/Thread').create()
  const response = await client.put(thread.url()).send().end()
  response.assertStatus(401)
})

test('authorized user can update title and body of threads', async ({ assert, client }) => {
  const thread = await Factory.model('App/Models/Thread').create()
  const attributes = { title: 'new title', body: 'new body' }

  const response = await client.put(thread.url()).loginVia(await thread.user().first()).send(attributes).end()
  const updatedThreadAttributes = { ...thread.toJSON(), ...attributes }
  await thread.reload()

  response.assertStatus(200)
  response.assertJSON({ thread: thread.toJSON() })
  assert.deepEqual(thread.toJSON(), updatedThreadAttributes)
})

test('moderator can update title and body of threads', async ({ assert, client }) => {
  const thread = await Factory.model('App/Models/Thread').create()
  const moderator = await Factory.model('App/Models/User').create({ type: 1 })
  const attributes = { title: 'new title', body: 'new body' }

  const response = await client.put(thread.url()).loginVia(moderator).send(attributes).end()
  response.assertStatus(200)
})

test('can not update thread with no body or title', async ({ client }) => {
  const thread = await Factory.model('App/Models/Thread').create()
  const user = await thread.user().first()
  const put = () => client.put(thread.url()).header('accept', 'application/json').loginVia(user)

  let response = await put().send({ title: 'test title' }).end()
  response.assertStatus(400)
  response.assertJSONSubset([{ message: 'required validation failed on body' }])
  response = await put().send({ body: 'test body' }).end()
  response.assertStatus(400)
  response.assertJSONSubset([{ message: 'required validation failed on title' }])
})
