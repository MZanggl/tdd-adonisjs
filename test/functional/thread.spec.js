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

test('authorized user can create threads', async ({ client }) => {
  const user = await Factory.model('App/Models/User').create()
  const attributes = {
    title: 'test title',
    body: 'body',
  }

  const response = await client.post('/threads').loginVia(user).send(attributes).end()
  response.assertStatus(200)
  const thread = await Thread.firstOrFail()
  response.assertJSON({ thread: thread.toJSON() })
  response.assertJSONSubset({ thread: { ...attributes, user_id: user.id } })
})

test('user can not create thread where title contains profanities', async ({ client }) => {
  const user = await Factory.model('App/Models/User').create()
  const attributes = { title: 'jackass', body: 'body' }
  const response = await client.post('/threads').loginVia(user).send(attributes).end()
  response.assertStatus(400)
})

test('unauthenticated user cannot create threads', async ({ client }) => {
  const response = await client.post('/threads').send({
    title: 'test title',
    body: 'body',
  }).end()

  response.assertStatus(401)
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
  const moderator = await Factory.model('App/Models/User').create({ type: 1})
  const attributes = { title: 'new title', body: 'new body' }

  const response = await client.put(thread.url()).loginVia(moderator).send(attributes).end()
  response.assertStatus(200)
})

test('can not create thread with no body or title', async ({ client }) => {
  const user = await Factory.model('App/Models/User').create()
  let response = await client.post('/threads').header('accept', 'application/json').loginVia(user).send({ title: 'test title' }).end()
  response.assertStatus(400)
  response.assertJSONSubset([{ message: 'required validation failed on body' }])
  response = await client.post('/threads').header('accept', 'application/json').loginVia(user).send({ body: 'test body' }).end()
  response.assertStatus(400)
  response.assertJSONSubset([{ message: 'required validation failed on title' }])
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

test('can access single resource', async ({ client }) => {
  const thread = await Factory.model('App/Models/Thread').create()
  const response = await client.get(thread.url()).send().end()
  response.assertStatus(200)
  response.assertJSON({ thread: thread.toJSON() })
})

test('can access all resources', async ({ client }) => {
  const threads = await Factory.model('App/Models/Thread').createMany(3)
  const response = await client.get('threads').send().end()
  response.assertStatus(200)
  response.assertJSON({ threads: threads.map(thread => thread.toJSON()).sort((a, b) => a.id - b.id) })
})
