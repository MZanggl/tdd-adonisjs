'use strict'

const { test, trait } = use('Test/Suite')('Thread')
const Factory = use('Factory')

trait('DatabaseTransactions')

test('can access url', async ({ assert }) => {
  const thread = await Factory.model('App/Models/Thread').create()
  assert.equal(thread.url(), `threads/${thread.id}`)
})
