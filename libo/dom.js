'use strict'

const jsdom = require('jsdom')
const jquery = require('jquery')

function Dom(dom) { this.dom = dom }

/**
 * 对 DOM 对像原型添加所有 $.fn 下的方法
 */
Object.keys(jquery(jsdom.jsdom().defaultView).fn).forEach(func => Dom.prototype[func] = function () { return this.dom.then(dom => dom[func].apply(dom, arguments)) })

module.exports = Dom