'use strict'

const Thread = use('App/Models/Thread')

class ThreadController {
    async index({ response }) {
        const threads = await Thread.all()
        return response.json({ threads })
    }

    async show({ params, response }) {
        const thread = await Thread.findOrFail(params.id)
        return response.json({ thread })
    }

    async store({ request, auth, response }) {
        const thread = await auth.user.threads().create(request.only(['title', 'body']))
        return response.json({ thread })
    }

    async update({ request, params, response }) {
        const thread = await Thread.findOrFail(params.id)
        thread.merge(request.only(['title', 'body']))
        await thread.save()
        return response.json({ thread })
    }

    async destroy({ params }) {
        await Thread.query().where('id', params.id).delete()
    }
}

module.exports = ThreadController
