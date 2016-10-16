'use strict'

const chai = require('chai')
const hidom = require('..')
const chaiAsPromised = require('chai-as-promised')

chai.should()
chai.use(chaiAsPromised)

describe('Hi DOM 包', function () {
  const url = 'http://li.dao:8341'
  function checkRawDOM(dom) { return dom.text().should.become('光宇广贞日记簿') }
  describe('app 子模块', function () {
    describe('#安全性检查', function () {
      it('wait、delay 参数', function () {
        const list = [undefined, true, false, [], null, '', 0, -1, 0.1, {}, () => { }]
        const app = hidom.open('1', false)
        list.forEach(item => {
          const wait = () => app.wait(item), delay = () => app.delay(item)
          wait.should.throw(`时长参数应为正整数，却传入 ${item}。`)
          delay.should.throw(`时长参数应为正整数，却传入 ${item}。`)
        })
      })
      it('DOM、Dom、dom 参数', function () { })
    })
    describe('#属性检查', function () {
      before('属性检查准备', function () { this.app = hidom.open('1') })
      after('属性检查结束', function () { this.app.close() })
      it('title 属性', function () { return this.app.title.should.become('傻屄了！') })
      it('document 属性', function () { return this.app.document.prop('title').should.become('傻屄了！') })
      it('window 属性', function () { return this.app.window.prop('location').should.eventually.have.property('href', 'about:blank') })
      it('event 属性', function () { })
    })
    describe('#行为检查', function () {
      it('wait、delay 方法', function (done) {
        const app = hidom.get(url, false)
        const watch = (new Date()).getTime()
        app.prowin.then(original => {
          app.wait(500).prowin.then(window => {
            /**
             * 若测试时出现超时，则将 within 的范围放大
             * 这里的超时报错，仅因 should 断言出错
             */
            ((new Date()).getTime() - watch).should.within(500, 600)
            window.should.not.equal(original)
            window.should.eql(original)
            window.close()
            done()
          })
        })
      })
      it('Dom、DOM、dom 方法', function () {
        const app = hidom.get(url, false)
        return Promise.all([
          checkRawDOM(app.dom('#container p')),
          checkRawDOM(app.Dom('#container p')),
          checkRawDOM(app.DOM('#container p'))
        ])
      })
      it('close 方法', function () { })
    })
  })
  describe('dom 子模块', function () {
    describe('#安全性检查', function () { })
    describe('#属性检查', function () { })
    describe('#行为检查', function () { })
  })
  describe('event 子模块', function () {
    describe('#安全性检查', function () { })
    describe('#属性检查', function () { })
    describe('#行为检查', function () { })
  })
  describe('main 子模块', function () {
    describe('#安全性检查', function () {
      it('get、open、fetch 参数', function () {
        const list = [null, '', 0, 1, -1, 0.1, {}, () => { }]
        list.concat([undefined, true, false, []]).forEach(item => {
          const get = () => hidom.get(item), open = () => hidom.open(item), fetch = () => hidom.fetch(item)
          get.should.throw(`路径参数错误，参数应为非空字串，却传入 ${item}。`)
          open.should.throw(`路径参数错误，参数应为非空字串，却传入 ${item}。`)
          fetch.should.throw(`路径参数错误，参数应为非空字串，却传入 ${item}。`)
        })
        list.forEach(item => {
          const get = () => hidom.get('1', item), open = () => hidom.open('1', item), fetch = () => hidom.fetch('1', item)
          get.should.throw(`引用资源执行情况参数错误，参数应为真值或数组，却传入 ${item}。`)
          open.should.throw(`引用资源执行情况参数错误，参数应为真值或数组，却传入 ${item}。`)
          fetch.should.throw(`引用资源执行情况参数错误，参数应为真值或数组，却传入 ${item}。`)
        })
      })
    })
    describe('#属性检查', function () { })
    describe('#行为检查', function () {
      describe('## open、get、fetch ', function () {
        before('open、get、fetch 方法准备', function () {
          this.app1 = hidom.get(url)
          this.app2 = hidom.open(url, ['script'])
          this.app3 = hidom.fetch(url, true)
        })
        after('open、get、fetch 方法结束', function () {
          this.app1.close()
          this.app2.close()
          this.app3.close()
        })
        const timeSpan = 800
        it('禁各种资源，尤其 js', function () {
          return Promise.all([
            checkRawDOM(hidom.get(url, false).delay(timeSpan).dom('#container p')),
            checkRawDOM(hidom.open(url, []).delay(timeSpan).Dom('#container p')),
            checkRawDOM(hidom.fetch(url, ['frame', 'iframe', 'link', 'img']).delay(timeSpan).DOM('#container p')),
          ])
        })
        it('允许 js', function () {
          return Promise.all([
            this.app1.wait(timeSpan).dom('._css_main__name').text().should.become('黄帝历'),
            this.app2.wait(timeSpan).dom('._css_main__name').text().should.become('黄帝历'),
            this.app3.wait(timeSpan).dom('._css_main__name').text().should.become('黄帝历'),
            this.app1.event.ajax.send.data.should.eventually.have.deep.property('[0].method', 'GET'),
            this.app2.event.ajax.send.value.should.eventually.have.deep.property('[0].url').that.have.string('http://hikaliv.dao:8572/sino'),
            this.app1.event.ajax.receive.data.should.eventually.have.deep.property('[0].status', 200),
            this.app2.event.ajax.receive.value.should.eventually.have.deep.property('[0].request.method', 'GET'),
            this.app3.event.ajax.receive.value.should.eventually.have.deep.property('[0].response').that.is.a('string').and.have.string('黄帝历')
          ])
        })
      })
    })
  })
})