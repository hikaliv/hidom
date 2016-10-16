HTML DOM BDD Test Involves React, CSS and AJAX
==============================================
utilities, facilities, easy for Front-end test

> **Caution Caution Caution —— Important de Thing Say Three Times: This English version document is translated from [Sino](https://github.com/hikaliv/hidom#readme) version by ‘GOOGLE Translate’, in consideration of the ‘power’ of ‘GOOGLE Translate’. To have a fun with the ‘power’ of ‘GOOGLE Translate’.**

Such as [jasmine](http://jasmine.github.io), [Mocha](https://mochajs.org) today at the front end of the test, [karma](http://karma-runner.github.io/1.0/index.html) used to run JavaScript in the browser, the adaptation situation, and better combined with the popular testing frameworks. As karma, good test means, should be easy to combine existing testing framework, to achieve high-speed and high quality production.

And [React](https://facebook.github.io/react) to make web applications even DOM tree level are stirred into the finite state automata cycle, the output of the automaton will be reflected in the DOM tree changes. And a complete state cycle is not real-time, but asynchronous, such as the ajax/fetch involved in the cycle process. Therefore, the test of the DOM state changes need to take into account the case of asynchronous process.

**[HiDOM](https://github.com/hikaliv/hidom)** is not a test environment, or a platform, whose purpose is to provide the necessary **API** for the operation of the DOM tree of finite state automata, and it can be naturally integrated into the existing popular testing framework. Test process will cover the entire life of the front-end presentation, from the successful application of the page to load and create, change, until the final destruction.

The version 1.0.x of __HiDOM__'s aim is to be only as a quiet observer.
+ As an observer of the __HiDOM__ does not interfere with the operation of the web application, it is not active and web application interaction, the requirements of its feedback.
+ As an observer of the __HiDOM__ will not be disguised as an entity, such as [sinon](http://sinonjs.org) mock and stub, etc..

From the 1.1.x version of the web site for the observation of the virtual form to add the **event BDD test method**, to capture web applications running dynamic data. __BDD AJAX__, for example.

install
-------
```sh
npm install --save hidom
```

usage
-----
```javascript
'use strict'

const hidom = require('hidom')

const app = hidom.get('https://www.npmjs.com/package/sinonumber')

app.title.then(console.log) // => sinonumber
app.DOM('p.package-description').text().then(console.log) // => Number of Chinese characters
app.DOM('p.package-description').attr('class').then(console.log) // => package-description
...
app.DOM('#readme').css('some_property').... // Testing CSS
...

app.close()
```

Or **a combination of testing framework**, such as [Mocha](https://mochajs.org)/[Chai](http://chaijs.com) and need to [chai-as-promised](http://chaijs.com/plugins/chai-as-promised) plug in:
```javascript
'use strict'

const hidom = require('hidom')
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised)

...
describe('HiDOM test under Mocha', function(){
  before('Page loading ready', function(){
    this.app = hidom.get('https://www.npmjs.com/package/sinonumber')
  })
  after('Test completed, close the form', function(){
    this.app.close()
  })
  it('Test the Title Properties of the sinonumber page', function(){
    return this.app.title.should.become('sinonumber')
  })
  it('Test title content', function(){
    return this.app.Dom('p.package-description').text().should.become('Number of Chinese characters')
  })
})
...
```

__HiDOM__ based on [jsdom](https://www.npmjs.com/package/jsdom), after calling the __get__ method, the internal maintenance of a complete page to read and all the resources to load the virtual window. As front-end operating experience, window.document to like, and its properties and the DOM node, and can be used [jqurey methods with the same name](http://api.jquery.com) the operation of, So you can, of course, **use HiDOM to test CSS**; and the difference between the jQuery is, method returns the same results are not immediate values, but __promise to like__. Using [chai-as-promised](http://chaijs.com/plugins/chai-as-promised) plug in [Mocha](https://mochajs.org)/[Chai](http://chaijs.com) framework, test __promise and immediate value as natural and comfortable__.  

> Network operation is asynchronous, compared to the previous written nested callback function, Promise can provide the process of programming experience. Promise also got the support of v4+ node.

DOM nodes through the **React** in the page rendering content, it may also capture.  
Sometimes, the web application will request data in the background, the results will be presented after a certain amount of time consumption. Test is subject to speed conditions, time consuming. __HiDOM__ provides the __wait__ method, allows the program to wait for the specified length (MS), and then check the results.  
```javascript
...
hidom.get('https://www.npmjs.com/package/sinonumber')
  .wait(500)
  .dom('#readme')
  ...
...
```

__It is very important to make good use of the wait/delay method.__ Because of the use of Promise, the test is __asynchronous__ implementation; if the test results before the output, you perform the app.close () method to stop the test, you can see nothing. At this time in the close () before using wait/delay plus a period of waiting, in order to complete the implementation of asynchronous. Of course, for the small problem of this asynchronous experience, you can simply solve the __async/await__ by ES7. This small problem does not exist when you combine __HiDOM__ in the [Mocha](http://chaijs.com)/[Chai](https://mochajs.org) test framework, and the test framework will ensure that the asynchronous walk is done.

BDD AJAX
--------

__WHY BDD AJAX__ —— first, you do not need to add additional code in the source code, you want to listen to the AJAX action on the web application is scheduled to run, and whether the data is valid or not. In addition, you want to test the BDD method. Therefore, __HiDOM__ from the 1.1 edition began to gradually provide AJAX BDD test means.

Capture __AJAX request is expected to send__ the message:
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

Capture __AJAX to receive data when the__ message:
```javascript
...
app.event.ajax.receive.value.then(dataList => {
  assert(data.status, 200)
  assert(data.request, { method: 'GET', url: '...', ... })
  assert(data.response, { some: thing, you: should, receive: ..., ... })
})
...
```

As is shown in the code, the data property returns the Promise to the list of all the captured AJAX event related data.

In __HiDOM__, The operation of the event listener can be __naturally incorporated into the test framework__, such as [Mocha](https://mochajs.org)/[Chai](http://chaijs.com).
```javascript
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised)

const app = hidom.open('http://your.webapp')

...
it('Listener AJAX event', function(){
  return Promise.all([
    app.event.ajax.send.value.should.eventually.have.deep.property('[0].method', 'GET'),
    app.event.ajax.receive.data.should.eventually.have.deep.property('[0].status', 200)
  ])
})
...
```

As you have noticed, the event listener's syntax, beginning with the event attribute, ending with data/value, captures the event data. Returned by data/value, just like a Promise.

**Note**, habit, when you are with configuration callbacks to monitor events, you will write the configuration process before the event, so that when the event occurs, the callback function is registered to successfully received the message. While in __HiDOM__, you should write a sentence with event **after** the event. By reason, it is the human brain circuit that is written in the same way as __HiDOM__. Clearly, it is the first thing to happen, and then to observe the progress and results of the event. What happens if it doesn't happen? Of course, there's nothing.

Combined with Mocha/Chai test
-----------------------------

Need to install [chai-as-promised](http://chaijs.com/plugins/chai-as-promised) plug-in.

Interface >> Method
---------

### var app = hidom.get(url, [options])
parameter:
+ url, type string table.
+ options, optional, type for the true value or array, the decision whether the page is loaded by the `<script src='...' />`、`<img src='...' />`、`<link href='...' />` specified external resources.

If the options argument is an array, the array elements should be as a combination of a `'script', 'frame', 'iframe', 'link', 'img'`, an empty array is equivalent to false incoming; if the options parameter to true value, if set false, said don't load any external resources, if set to true, said all the resources of the load. If the default options parameter is equal to the incoming true.

> I believe that you have the resources needed to load the test project. However, if you are not sure of the words, you should set the options parameters.

### var app = hidom.open(url, [options])
hidom.get alias.

### var app = hidom.fetch(url, [options])
hidom.get alias.

### var app = app.wait(timeSpan)
parameter:
+ timeSpan, type is an integer, the number of the table waiting for the number of milliseconds.

Let the test program app wait for the number of milliseconds specified by the timeSpan to prepare the completion of the background data. As to how much timeSpan is set, depending on your test environment and mood.

### var app = app.delay(timeSpan)
app.wait alias.

### var dom = app.dom(selector)
parameter:
+ selector, type of string, with the usage of jQuery selector.

The return value is a virtual DOM to the image, you can then do something similar to the jQuery operation, that is, you can call the jQuery on the same name as the DOM method of the same name method. the value of the return value is Promise to the image, rather than the immediate value.

### var dom = app.Dom(selector)
app.dom alias.

### var dom = app.DOM(selector)
app.dom alias.

### app.close() method
Test off.

> Please make sure that the app created by hidom.get is closed after the test is completed.

Interface >> Properties
-----------

### app.title property
Promise containing document.title to image.

### app.window property
**Usage: var dom = app.window**  
Contains DOM on the image of the window like, you can do on the DOM for similar jQuery operation, that is, you can call the jQuery on the same name as the DOM method of the same name method. the return value of the note is Promise to the image, rather than the immediate value.  
For example:
```javascript
...
const dom = app.window
dom.prop('location').then(console.log) // => Read window.location value
...
```

### app.document property
**Usage: var dom = app.document**  
Contains DOM on the image of the window.docuemnt like, you can do on the DOM for similar jQuery operation, that is, you can call the jQuery on the same name as the DOM method of the same name method. the return value of the note is Promise to the image, rather than the immediate value.  
For example:
```javascript
...
const dom = app.document
dom.prop('title').then(console.log) // => Read window.document.title value
...
```

Interface >> events
----------

### app.event property

> #### ajax.send sub property
>> __var event = app.event.ajax.send__  
>> Capture AJAX request for web application running. After extracting the data through the data/value property, the data contains method, URL, send, async, user, password and other attributes

> #### ajax.receive sub property
>> __var event = app.event.ajax.receive__  
>> Captures the AJAX request to send the web application to receive the reply, through the data/value property to extract data, the data contains status, response, request properties. Among them, the request attribute is the data package including method, URL and so on. It is the configuration of ajax.send, and the response attribute is the received data packet.

### event.data property
Extract event data. The return value is Promise to the image.

### event.value property
event.data alias.

JQuery method of the same name DOM
----------------------------------

App.dom returned by the DOM to the image, you can [jqurey method of the same name](http://api.jquery.com) operation.  
__Note__ that the value returned by the method of the same name is not immediately value, but rather Promise.

[Version update description](https://github.com/hikaliv/hidom/blob/master/CHANGELOG.md)
----------------------------