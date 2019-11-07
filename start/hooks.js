const { hooks } = require('@adonisjs/ignitor')
const { ioc } = use('@adonisjs/fold')

hooks.after.providersRegistered(() => {
    use('Validator').extend('profanity', async (data, field, message) => {
        const profanityGuard = ioc.make('App/Services/ProfanityGuard')
        if (!data[field]) return
      
        const isClean = await profanityGuard.handle(data[field])
        if (!isClean) throw message
    })
})
