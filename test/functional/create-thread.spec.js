'use strict'

const { test, trait, before, after } = use('Test/Suite')('Thread')
const { ioc } = use('@adonisjs/fold')
const Thread = use('App/Models/Thread')

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
  const user = await factory('App/Models/User').create();
  const attributes = {
    title: 'test title',
    body: 'body',
  };
  const response = await client.post('/threads').loginVia(user).send(attributes).end();
  response.assertStatus(200);
  const thread = await Thread.firstOrFail();
  response.assertJSON({ thread: thread.toJSON() });
  response.assertJSONSubset({ thread: { ...attributes, user_id: user.id } });
})

test('user can not create thread where title contains profanities', async ({ client }) => {
  const user = await factory('App/Models/User').create();
  const attributes = { title: 'jackass', body: 'body' };
  const response = await client.post('/threads').loginVia(user).send(attributes).end();
  response.assertStatus(400);
})

test('unauthenticated user cannot create threads', async ({ client }) => {
  const response = await client.post('/threads').send({
    title: 'test title',
    body: 'body',
  }).end();
  response.assertStatus(401);
})

test('can not create thread with no body or title', async ({ client }) => {
  const user = await factory('App/Models/User').create();
  let response = await client.post('/threads').header('accept', 'application/json').loginVia(user).send({ title: 'test title' }).end();
  response.assertStatus(400);
  response.assertJSONSubset([{ message: 'required validation failed on body' }]);
  response = await client.post('/threads').header('accept', 'application/json').loginVia(user).send({ body: 'test body' }).end();
  response.assertStatus(400);
  response.assertJSONSubset([{ message: 'required validation failed on title' }]);
})
