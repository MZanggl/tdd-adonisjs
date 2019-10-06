'use strict'

/*
|--------------------------------------------------------------------------
| Factory
|--------------------------------------------------------------------------
|
| Factories are used to define blueprints for database tables or Lucid
| models. Later you can use these blueprints to seed your database
| with dummy data.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')

Factory.blueprint('App/Models/User', (faker, i, data) => {
  return {
    username: faker.username(),
    email: faker.email(),
    password: '123456',
    ...data,
  }
})

Factory.blueprint('App/Models/Thread', async (faker, index) => {
  return {
    title: faker.word(),
    body: faker.paragraph(),
    user_id: (await Factory.model('App/Models/User').create()).id
  }
})