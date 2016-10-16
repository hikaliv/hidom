'use strict'

const jsdom = require('jsdom')
const jquery = require('jquery')
const App = require('./app')
const event = require('./event')

const hidom = {}

/**
 * exec 有效值为 true、false、以及包含 'script', 'frame', 'iframe', 'link', 'img' 等项的数组
 */
hidom.open = hidom.get = hidom.fetch = function (url, exec) {
  if (typeof url != 'string' || url == '') throw new Error(`路径参数错误，参数应为非空字串，却传入 ${url}。`)
  if (exec !== undefined && typeof exec != 'boolean' && !Array.isArray(exec)) throw new Error(`引用资源执行情况参数错误，参数应为真值或数组，却传入 ${exec}。`)
  const features = {
    // 默认设置
    // FetchExternalResources: ['script', 'link'],
    // ProcessExternalResources: ['script'],
    // SkipExternalResources: false
  }
  if (exec !== undefined && exec != true) features.FetchExternalResources = exec != [] ? exec : false
  return new App(new Promise(resolve => jsdom.env({
    url, features,
    created(err, window) {
      if (!err) {
        const xhr = window.XMLHttpRequest
        const xhropen = xhr.prototype.open, xhrsend = xhr.prototype.send
        xhr.prototype.open = function () {
          this.xhrParams = { method: arguments[0], url: arguments[1] }
          if (arguments[2] !== undefined) this.xhrParams.async = arguments[2]
          if (arguments[3] !== undefined) this.xhrParams.user = arguments[3]
          if (arguments[4] !== undefined) this.xhrParams.passwd = arguments[4]
          xhropen.apply(this, arguments)
        }
        xhr.prototype.send = function () {
          this.xhrParams.send = arguments[0]
          this.xhrParams.location = window.location
          event.emit(event.AJAX_SEND, { data: this.xhrParams, window })
          xhrsend.apply(this, arguments)
        }
        Object.defineProperty(xhr.prototype, 'onreadystatechange', {
          get() {
            if (this.readyState == this.DONE) event.emit(event.AJAX_RECEIVE, { window, data: { status: this.status, request: this.xhrParams, response: this.response } })
            return this.hikalivOnReadyStateChange
          },
          set(value) { this.hikalivOnReadyStateChange = value }
        })
      }
    },
    done(err, window) {
      if (err) {
        window = jsdom.jsdom(`URL: ${url}\nERR: ${err.message}`).defaultView
        window.document.title = '傻屄了！'
      }
      jquery(window)
      resolve(window)
    }
  })))
}

module.exports = hidom