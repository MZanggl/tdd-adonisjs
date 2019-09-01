'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Thread extends Model {
    url() {
        return `threads/${this.id}`
    }
}

module.exports = Thread
