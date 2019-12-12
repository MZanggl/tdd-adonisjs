'use strict'

const { test, trait, before, after } = use('Test/Suite')('Thread')
const { ioc } = use('@adonisjs/fold')
const Thread = use('App/Models/Thread')

trait('Test/ApiClient')
trait('Auth/Client')
trait('DatabaseTransactions')

test('can access single resource', async ({ client }) => {
    const thread = await factory('App/Models/Thread').create()
    const response = await client.get(thread.url()).send().end()
    response.assertStatus(200)
    response.assertJSON({ thread: thread.toJSON() })
})

test('can access all resources', async ({ client }) => {
    const threads = await factory('App/Models/Thread').createMany(3)
    const response = await client.get('threads').send().end()
    response.assertStatus(200)
    response.assertJSON({ threads: threads.map(thread => thread.toJSON()).sort((a, b) => a.id - b.id) })
})
