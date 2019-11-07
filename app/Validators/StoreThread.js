'use strict'

class StoreThread {
  get rules () {
    return {
      title: 'required|profanity', 
      body: 'required'
    }
  }
}

module.exports = StoreThread
