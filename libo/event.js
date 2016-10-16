'use strict'

const EventEmitter = require('events')
const emitter = new EventEmitter()

const event = {
  emit: emitter.emit.bind(emitter),
  /**
   * { window, data } -> unit
   */
  AJAX_SEND: 'AJAX_SEND',
  /**
   * { window, data } -> unit
   */
  AJAX_RECEIVE: 'AJAX_RECEIVE'
}

const eventStorage = new Map()

const pairEventPath = [
  /**
   * 所有的 path 属性值，最前面都需要带 '.'
   */
  {
    name: event.AJAX_SEND,
    path: '.ajax.send'
  },
  {
    name: event.AJAX_RECEIVE,
    path: '.ajax.receive'
  }
]

pairEventPath.forEach(pair => {
  emitter.on(pair.name, pkg => {
    if (!eventStorage.has(pkg.window)) eventStorage.set(pkg.window, {})
    const window = eventStorage.get(pkg.window)
    const path = pair.path
    if (!window[path]) window[path] = []
    window[path].push(pkg.data)
  })
})

function Event(window) {
  this.events = window.then(window => eventStorage.get(window))
  this.path = ''
}

function addProperty(property) {
  Object.defineProperty(Event.prototype, property, {
    get() {
      this.path = `${this.path}.${property}`
      return this
    }
  })
}

['ajax', 'send', 'receive'].forEach(prop => addProperty(prop))

function addTerminal(property) {
  Object.defineProperty(Event.prototype, property, {
    get() {
      const path = this.path
      return this.events.then(events => events[path])
    }
  })
}

['data', 'value'].forEach(prop => addTerminal(prop))

event.Event = Event
module.exports = event