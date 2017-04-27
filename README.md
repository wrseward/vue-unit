# VueUnit

> A library for Vue.js that makes it easier to create and unit test components.

* Easily test props, events, and slots (including named slots)
* Optionally shallow render components
* Simulate simple DOM events (click, input, etc.)
* Use any test runner / assertion library

Unlike other component testing libraries, VueUnit does not focus on DOM traversal. Instead it focuses on making programmatic manipulation of your components much easier. For DOM traversal and assertions it's strongly recommended to use a library such as [`chai-jquery`](https://github.com/chaijs/chai-jquery) or [`jasmine-jquery`](https://github.com/velesin/jasmine-jquery).

* [Installation](#installation)
* [Usage](#usage)
  * [Hooks](#hooks)
  * [`mount()`](#mount)
    * [Basic Component](#basic-component)
    * [Component with props](#component-with-props)
    * [Component with events](#component-with-events)
    * [Component with default slot](#component-with-default-slot)
    * [Component with multiple slots](#component-with-multiple-slots)
  * [Options Object](#options-object)
  * [`shallow()`](#shallow)
  * [`build()` and `buildShallow()`](#build-and-build-shallow)
  * [`simulate(element, event)`](#simulate)
  * [`Vuex testing`](#vuex-testing)
    * [`fakeGetters()`](#fake-getters)
    * [`fakeActions()`](#fake-actions)
  * [Examples](#examples)
* [License](#license)

## <a name="installation"></a>Installation

`npm install --save-dev vue-unit`

VueUnit requires `"vue": "2.*"` to be installed, using the [standalone build](https://vuejs.org/v2/guide/installation.html#Standalone-vs-Runtime-only-Build).

## <a name="usage"></a>Usage

Examples shown are using mocha, chai, sinon, and chai-jquery but you should be able to extrapolate to your framework of choice.

### <a name="hooks"></a>Hooks

VueUnit renders all components in the DOM and needs to handle setup and tear down. VueUnit provides two helpers for this: `beforeEachHooks()` and `afterEachHooks()` when need to be called before and after each test, respectively.

For example with mocha this would look like:

```js
import { beforeEachHooks, afterEachHooks } from 'vue-unit'

describe('My test', () => {
  beforeEach(beforeEachHooks)

  it('tests something', () => {
    // test code
  })

  afterEach(afterEachHooks)
})
```

You should assume all example tests shown are using these hooks.

### <a name="mount"></a>`mount()`

The `mount()` function renders components and allows setting prop data, listen for events, or put content into slots.

```js
import { mount } from 'vue-unit'
```


#### <a name="basic-component"></a>Basic Component

```js
const BasicComponent = {
  template: `<div class="component">Hello</div>`
}

it('mounts a basic component', () => {
  mount(BasicComponent)
  expect($('.component')).to.contain('Hello')
})
```

The first argument `mount()` expects is a component options object.

#### <a name="component-with-props"></a>Component with props

```js
const ComponentWithProps = {
  template: `
    <div class="component">
      Hello {{ message }}
    </div>
  `,
  props: ['message']
}

it('sets props', () => {
  mount(ComponentWithProps, { message: 'World' })
  expect($('.component')).to.have.text('Hello World')
})
```

An object representing the data for props, can be passed the second argument.

#### <a name="component-with-events"></a>Component with events

```js
const ComponentWithEvent = {
  template: `
    <button @click="$emit('foo', 'bar')">Click</button>
  `
}

it('listens for events', () => {
  const listener = sinon.spy()
  mount(ComponentWithEvent, {}, { foo: listener })
  simulate($('button'), 'click')
  expect(listener).to.have.been.calledWith('bar')
})
```

The 3rd argument `mount()` accepts is an object with listener functions for events to emit. Here we are use the `simulate()` function to fire a click event.

#### <a name="component-with-default-slot"></a>Component with default slot

```js
const ComponentWithSlot = {
  template: `
    <div class="component">
      <slot></slot>
    </div>
  `
}

it('sets content for a default slot', () => {
  mount(ComponentWithSlot, {}, {}, '<p>Hello</p>')
  expect($('.component')).to.have.html('<p>Hello</p>')
})
```

#### <a name="component-with-multiple-slots"></a>Component with multiple slots

```js
const ComponentWithMultipleSlots = {
  template: `
    <div class="component">
      <slot></slot>
      <slot name="foo"></slot>
    </div>
  `
}
  
it('sets content for multiple slots', () => {
  mount(ComponentWithMultipleSlots, {}, {}, { default: 'Hello World', foo: '<p>Bar</p>' })
  expect($('.component')).to.have.html('Hello World <p>Bar</p>')
})
```

### <a name="options-object"></a>Options Object

```js
const ComponentWithAllOptions = {
  template: `
    <div class="component" @click="$emit('foo', message)">
      <slot></slot>
      <slot name="foo"></slot>
    </div>
  `,
  props: ['message']
}
  
it('uses an options object', () => {
  const listener = sinon.spy()
  const options = {
    props: { message: 'bar' },
    on: { foo: listener },
    slots: { default: 'Hello World', foo: '<p>Bar</p>' }
  }
  mount(ComponentWithAllOptions, options)
  expect($('.component')).to.have.html('Hello World <p>Bar</p>')
  simulate($('.component'), 'click')
  expect(listener).to.have.been.calledWith('bar')
})
```

| Option | Default | Type | Description |
| --- | :---: | :---: | --- |
| `props` | `{}` | `Object` | An object containing camelCased props to be passed to the component |
| `on` | `{}` | `Object` | An object containing listeners to be called when an event is trigger by the component |
| `slots` | `{}` | `Object` or `String` | String containing the template for the `default` slot of the component. Objects containing templates for slots (should be keyed by the slot name).

### <a name="shallow"></a>`shallow()`

The `shallow()` function has the same signature as the `mount()` function, however it will shallow render the component by replacing any **locally registered** child components with an empty kebab-cased tag of their name.

This enables you to test higher-level components without the concern of the required props or dependencies of nested child components. 

For example:

```js
const ChildComponent = {
  name: 'child',
  template: '<span>World</span>'
}
const ComponentWithChild = {
  template: '<div>Hello <child></child></div>',
  components: { ChildComponent }
}

shallow(ComponentWithChild)
```

Would render:
```html
<div>Hello <child></child></div>
```

Instead of the actual child component.

### <a name="build-and-build-shallow"></a>`build()` and `buildShallow()`

When testing components using `mount()` or `shallow()` it can be repetitive to list the component and select DOM elements. The `build()` and `buildShallow()` functions allow you to remove some of this repetitive by creating your own `mount()` or `shallow()` function with some default arguments and a callback.

For example given this component:

```js
const SomeComponent = {
  template: '<p>{{ message }}</p>',
  props: { foo: { default: 'default message' }}
}
```

and this test:

```js
it('renders a default message', () => {
  mount(SomeComponent)
  expect($('p')).to.have.text('default message')
})

it('renders a message', () => {
  mount(SomeComponent, { foo: 'bar' })
  expect($('p')).to.have.text('bar')  
})
```

We could use `build()` like so:

```js
let paragraph
const mount = build(SomeComponent, () => { paragraph = $('p') })

it('renders a default message', () => {
  mount()
  expect(paragraph).to.have.text('default message')
})

it('renders a message', () => {
  mount({ foo: 'bar' })
  expect(paragraph).to.have.text('bar')  
})
```

This can be helpful when your components has many selectors you want to test.

### <a name="simulate"></a>`simulate(element, event)`

The `simulate()` function will trigger an HTML event on given DOM element. It can accept an DOM node or jQuery object.

For example, triggering a click event on a button would look like so:
```js
const button1 = $('button')
simulate(button1, 'click')

const button2 = document.querySelector('button')
simulate(button2, 'click')
```


### Vuex Testing

VueUnit also provides helpers for isolating components from vuex getters and actions in form of `fakeGetters()` and `fakeActions()`. These functions must be called **before** mounting your component.

#### <a name="fake-getters"></a>`fakeGetters()`

The `fakeGetters()` returns a sinon stub which can be used to (optionally) control the value which the getter returns.

For example given this component:
```js
const Component = {
  template: '<p></p>',
  computed: {
    someValue () { return this.$store.getters.foo },
    otherValue () { return this.$store.getters.bar }
  }
}
```
We might test it like so:

```js
it('fakes a getter', () => {
  const foo = fakeGetters('foo').returns(1234)
  const component = mount(Component)
  expect(component.someValue).to.equal(1234)
})

it('fakes a getter in a different way', () => {
  fakeGetters('foo', 1234)
  const component = mount(Component)
  expect(component.someValue).to.equal(1234)
})

it('fakes multiple getters', () => {
  fakeGetters({
    foo: 1234,
    bar: 5678
  })
  const component = mount(Component)
  expect(component.someValue).to.equal(1234)
  expect(component.otherValue).to.equal(5678)
})
```

#### <a name="fake-actions"></a>`fakeActions()`

The `fakeAction()` returns a sinon stub which can be used to spy on the action and control what it returns.

For example given this component:

```js
const Component = {
  template: '<p></p>',
  methods: {
    someMethod (payload) { return this.$store.dispatch('foo', payload) },
  }
}
```
We might test it like so:

```js
it ('dispatches an action', () => {
  const fooAction = fakeActions('foo').returns('bar')
  const component = mount(Component)
  return component.someMethod(1234).then(value => {
    expect(fooAction).to.have.been.calledOnce.and.calledWith(1234)
    expect(value).to.equal('bar')
  })
})
```

### <a name="examples"></a>Examples

More sample usage can be found in the [examples/](https://github.com/wrseward/vue-unit/tree/master/examples) directory.

## <a name="license"></a>License

[MIT](https://github.com/wrseward/vue-unit/blob/master/LICENSE.md)
