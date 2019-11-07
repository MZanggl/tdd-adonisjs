'use strict'

class ProfanityGuard {
    constructor() {
        this.fetch = use('node-fetch')
    }
    async handle(value) {
        const response = await this.fetch('https://www.purgomalum.com/service/containsprofanity?text=' + value)
        return (await response.text()) === 'false'
    }
}

module.exports = ProfanityGuard