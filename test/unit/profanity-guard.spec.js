'use strict'

const { test, trait, before, after } = use('Test/Suite')('ProfanityGuard')
const { ioc } = use('@adonisjs/fold')
const ProfanityGuard = use('App/Services/ProfanityGuard')

before(() => {
  ioc.fake('node-fetch', () => {
    return async () => ({
      text: async value => {
        return (value === 'jackass').toString()
      }
    })
  })
})

after(() => {
  ioc.restore('node-fetch')
})


test('can verify that passed value is a profanity', async ({ assert }) => {
  const profanityGuard = new ProfanityGuard()
  assert.isTrue(await profanityGuard.handle('jackass'))
})

test('can verify that passed value is not a profanity', async ({ assert }) => {
  const profanityGuard = new ProfanityGuard()
  assert.isTrue(await profanityGuard.handle('test'))
})