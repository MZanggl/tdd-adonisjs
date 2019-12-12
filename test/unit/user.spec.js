'use strict'

const { test, trait } = use('Test/Suite')('User')

trait('DatabaseTransactions')

test('can check if user is moderator', async ({ assert }) => {
  const user = await factory('App/Models/User').make({ type: 1 })
  assert.isTrue(user.isModerator())
})

test('can check if user is not a moderator', async ({ assert }) => {
  const user = await factory('App/Models/User').make()
  assert.isFalse(user.isModerator())
})
