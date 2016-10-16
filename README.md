HTML DOM BDD Test Involves React, CSS and AJAX
==============================================
utilities, facilities, easy for Front-end test

> **This is Sino document. [For English, please strike here bangbangly](https://github.com/hikaliv/hidom/blob/master/doc/README_EN.md).**

现今的前端测试，有 [karma](http://karma-runner.github.io/1.0/index.html) 用来跑 javascript 脚本在浏览器里的适配情况，并且较好地结合了流行的测试框架，如 [jasmine](http://jasmine.github.io)、[Mocha](https://mochajs.org) 等。正如 karma，良好的测试手段，应可易于结合既有测试框架，实现高速高质生产。

而 [React](https://facebook.github.io/react) 使网页应用连 DOM 树层面都被搅进了有限状态自动机循环，自动机的输出会反映到 DOM 树的变化上。而一次完整的状态循环有时并非实时，而是异步的，例如有 ajax/fetch 参与的循环过程。因此，对 DOM 状态变化的测试需要考虑到异步过程的情况。

**[HiDOM](https://github.com/hikaliv/hidom)** 并非测试环境，或平台，其宗旨是为检测 DOM 树的有限状态自动机的运行情况提供必要的接口，且能自然地结合到既有流行测试框架。测试过程会涵盖前端呈现的整个生命期，从页面应用的成功加载并创建，变化，直到最后的销毁。

1.0.x 版的 __HiDOM__ 的宗旨是仅作为一个安静的观察者。
+ 作为观察者的 __HiDOM__ 不干预网页应用的运行，也即不会主动与网页应用交互，要求其给予反馈。
+ 作为观察者的 __HiDOM__ 自然也不会伪装成实体，如 [sinon](http://sinonjs.org) 的 mock 和 stub 等。

从 1.1.x 版起，为观察网页的虚拟窗体添加**事件 BDD 测试手段**，用以捕获网页应用运行的动态数据。例如 BDD AJAX 请求。

安装
---
```sh
npm install --save hidom
```

用法
---
```javascript
'use strict'

const hidom = require('hidom')

const app = hidom.get('https://www.npmjs.com/package/sinonumber')

app.title.then(console.log) // => sinonumber
app.DOM('p.package-description').text().then(console.log) // => 汉字数
app.DOM('p.package-description').attr('class').then(console.log) // => package-description
...
app.DOM('#readme').css('some_property').... // 测试 CSS
...

app.close()
```

或**结合测试框架**，比如 [Mocha](https://mochajs.org)/[Chai](http://chaijs.com)，需要 [chai-as-promised](http://chaijs.com/plugins/chai-as-promised) 插件：
```javascript
'use strict'

const hidom = require('hidom')
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised)

...
describe('Mocha 下的 HiDOM 测试', function(){
  before('页面加载准备', function(){
    this.app = hidom.get('https://www.npmjs.com/package/sinonumber')
  })
  after('测试完成，关闭窗体', function(){
    this.app.close()
  })
  it('测试 sinonumber 页面的 title 属性', function(){
    return this.app.title.should.become('sinonumber')
  })
  it('测试标题内容', function(){
    return this.app.Dom('p.package-description').text().should.become('汉字数')
  })
})
...
```

__HiDOM__ 基于 [jsdom](https://www.npmjs.com/package/jsdom)，在调用 __get__ 方法后，内部维护着一个完成页面读取和各资源加载的虚 window 对像。一如前端的操作体验，window.document 对像，及其属性和各 DOM 结点，均可使用 [jqurey 同名方法](http://api.jquery.com)操作，因此你当然可以**使用 HiDOM 测试 CSS**；而与 jquery 的区别是，同名方法返回的结果并非立即值，而是 __Promise 对像__。使用 [chai-as-promised](http://chaijs.com/plugins/chai-as-promised) 插件，在 [Mocha](https://mochajs.org)/[Chai](http://chaijs.com) 框架下，测试 __Promise 和立即值一样自然，惬意__。  

> 网络操作是异步的，相比以往的回调函数的嵌套写法，Promise 能提供流程化的编程体验。Promise 也得到 node v4+ 的支持。

经由 **React** 在页面渲染中变更的 DOM 节点内容，也可能捕捉到。  
有时，网页程序会在后台请求数据，结果会经过一定的时耗后呈现。测试时受制于网速条件，耗时不定。__HiDOM__ 提供 __wait__ 方法，允许程序等待指定时长（毫秒），然后检查结果。  
```javascript
...
hidom.get('https://www.npmjs.com/package/sinonumber')
  .wait(500)
  .dom('#readme')
  ...
...
```

**善用 wait/delay 方法的思路很重要**。由于采用 Promise，各项测试都是**异步**执行的；如果在测试结果输出之前，你就执行了 app.close() 方法把测试停了，就什么都看不到了。此时适时在 close() 之前用 wait/delay 加上一段等待，以便异步执行完成。当然，针对这个异步体验带来的小问题，你可以简单的通过 ES7 的 __async/await__ 解决。这一小问题在当你结合 __HiDOM__ 于 [Mocha](https://mochajs.org)/[Chai](http://chaijs.com) 测试框架时不存在，测试框架会保证异步走完。

BDD AJAX
--------

**前言：BDD AJAX 的用意**——首先，不用在源程序上添加额外的代码，你就想监听网页应用的 AJAX 动作是否按期运行，以及收发的数据是否合法。再者，你希望以 BDD 的方法进行测试。因此，__HiDOM__ 从 1.1 版起开始逐步提供 BDD AJAX 测试手段。

捕获 **AJAX 请求是否按预期发送**的消息：
```javascript
...
const app = hidom.open('http://your.webapp')

app.event.ajax.send.data.then(dataList => {
  const data = dataList[0]
  assert(data.method, 'GET')
  assert(data.url, '...')
  ...
})
...
```

捕获 **AJAX 接收数据时**的消息:
```javascript
...
app.event.ajax.receive.value.then(dataList => {
  assert(data.status, 200)
  assert(data.request, { method: 'GET', url: '...', ... })
  assert(data.response, { some: thing, you: should, receive: ..., ... })
})
...
```

如代码所示，data 属性返回的是所有捕获的 AJAX 事件相关数据的列表的 Promise 对像。

__HiDOM__ 的事件监听的操作可以**很自然地结合进测试框架**，比如 [Mocha](https://mochajs.org)/[Chai](http://chaijs.com)。
```javascript
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised)

const app = hidom.open('http://your.webapp')

...
it('监听 AJAX 事件', function(){
  return Promise.all([
    app.event.ajax.send.value.should.eventually.have.deep.property('[0].method', 'GET'),
    app.event.ajax.receive.data.should.eventually.have.deep.property('[0].status', 200)
  ])
})
...
```

正如你所注意到的，事件监听的语法，从 event 属性开始，由 data/value 收尾，捕获到事件数据。由 data/value 所返回的，俨然是个 Promise。

**请注意**，习惯上，当你是用配置回调函数的方法去监听事件时，你会将这一配置过程写在事件发生之前，以便事件发生时，回调函数是已被注册的，从而能成功收到消息。而在 __HiDOM__，你却应该把带有 event 的句子写在事件发生**之后**。按道理来说，像 __HiDOM__ 一样写在之后才符合人类的大脑回路。显然地，是先有事件发生，然后再去观察事情发生的进展和结果。如果事件没发生呢？那当然就什么都没有咯。

结合 Mocha/Chai 测试
------------------

需安装 [chai-as-promised](http://chaijs.com/plugins/chai-as-promised) 插件。

接口 >> 方法
-----------

### var app = hidom.get(url, [options])
参数：
+ url，类型为字串，表网址。
+ options，可选，类型为真值或数组，决定页面是否加载由 `<script src='...' />`、`<img src='...' />`、`<link href='...' />` 所指定的外部资源。

若 options 参数为数组时，数组元素应为 `'script'、'frame'、'iframe'、'link'、'img'` 的组合，空数组相当于传入 false；若 options 参数为真值时，若置 false，表示不加载任何外部资源，若置 true，表示加载全部资源。若缺省 options 参数，等于传入 true。

> 我相信，你对于被测的前端工程所需要加载的资源是信任的。然而，如果你居然是拿不准的话，你应设置 options 参数。

### var app = hidom.open(url, [options])
hidom.get 的别名。

### var app = hidom.fetch(url, [options])
hidom.get 的别名。

### var app = app.wait(timeSpan)
参数：
+ timeSpan，类型为整型，表等待毫秒数。

让测试程序 app 等待由 timeSpan 指定的毫秒数，以备后台数据读取完成。至于 timeSpan 设多少，取决于你的测试环境和心情。

### var app = app.delay(timeSpan)
app.wait 的别名。

### var dom = app.dom(selector)
参数：
+ selector，类型为字串，同 jquery 选择器用法。

返回值是虚拟 DOM 对像，你可以接下来对其作类似 jquery 的操作，也即你可以对 dom 对像调用 jquery 同名方法。注意操作的返回值是 Promise 对像，而非立即值。

### var dom = app.Dom(selector)
app.dom 的别名。

### var dom = app.DOM(selector)
app.dom 的别名。

### app.close() 方法
测试关闭。

> 请确保每个由 hidom.get 创建的 app 在测试完成后，都被关闭。

接口 >> 属性
-----------

### app.title 属性
包含 document.title 的 Promise 对像。

### app.window 属性
**用法：var dom = app.window**  
包含 window 对像的 dom 对像，你可以对该 dom 对像作类似 jquery 的操作，也即你可以对 dom 对像调用 jquery 同名方法。注意操作的返回值是 Promise 对像，而非立即值。  
例如：
```javascript
...
const dom = app.window
dom.prop('location').then(console.log) // => 读取 window.location 值
...
```

### app.document 属性
**用法：var dom = app.document**  
包含 window.docuemnt 对像的 dom 对像，你可以对该 dom 对像作类似 jquery 的操作，也即你可以对 dom 对像调用 jquery 同名方法。注意操作的返回值是 Promise 对像，而非立即值。  
例如：
```javascript
...
const dom = app.document
dom.prop('title').then(console.log) // => 读取 window.document.title 值
...
```

接口 >> 事件
----------

### app.event 属性

> #### ajax.send 子属性
>> __var event = app.event.ajax.send__  
>> 捕获网页应用运行时对外发送的 AJAX 请求。通过 data/value 属性提取数据后，数据包含 method、url、send、async、user、password 等属性

> #### ajax.receive 子属性
>> __var event = app.event.ajax.receive__  
>> 捕获网页应用运行时发送的 AJAX 请求收到的回复，通过 data/value 属性提取数据后，数据包含 status、response、request 属性。其中 request 属性就是包含 method、url 等的数据包，是 ajax.send 的配置，response 属性就是接收到的数据包。

### event.data 属性
提取事件数据。返回值是 Promise 对像。

### event.value 属性
event.data 的别名。

jquery 同名方法操作 dom
---------------------

由 app.dom 返回的 dom 对像，可以 [jqurey 同名方法](http://api.jquery.com)操作。  
__注意__，由同名方法操作后返回的值非立即值，而是 Promise 对像。

[版本更新说明](https://github.com/hikaliv/hidom/blob/master/CHANGELOG.md)
------------