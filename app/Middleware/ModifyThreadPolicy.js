'use strict'
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Thread = use('App/Models/Thread')

class ModifyThreadPolicy {
  async handle ({ params, auth, response }, next) {
    const thread = await Thread.findOrFail(params.id)
    if (auth.user.isModerator()) {
      return next()
    }

    if (thread.user_id === auth.user.id) {
      return next()
    }

    return response.forbidden()  
  }
}

module.exports = ModifyThreadPolicy
