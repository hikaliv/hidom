'use strict'

const Dom = require('./dom')
const event = require('./event')

function App(window) { this.prowin = window }

App.prototype.wait = App.prototype.delay = function (timeSpan) {
  if (!Number.isInteger(timeSpan) || timeSpan <= 0) throw new Error(`时长参数应为正整数，却传入 ${timeSpan}。`)
  /**
   * resolve 似是深复制
   */
  const window = this.prowin
  this.prowin = new Promise(resolve => setTimeout(() => window.then(resolve), timeSpan))
  return this
}

Object.defineProperties(App.prototype, {
  title: { get() { return this.prowin.then(window => window.document.title) } },
  document: { get() { return new Dom(this.prowin.then(window => window.$(window.document))) } },
  window: { get() { return new Dom(this.prowin.then(window => window.$(window))) } },
  event: { get() { return new event.Event(this.prowin) } }
})

App.prototype.DOM = App.prototype.Dom = App.prototype.dom = function (selector) { return new Dom(this.prowin.then(window => window.$(selector))) }

App.prototype.close = function () { this.prowin.then(window => window.close()) }

module.exports = App