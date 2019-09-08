'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Thread extends Model {
    url() {
        return `threads/${this.id}`
    }

    user() {
        return this.belongsTo('App/Models/User')
    }
}

module.exports = Thread
