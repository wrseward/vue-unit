import Vue from 'vue'
import { mount, beforeEachHooks, afterEachHooks } from 'src'

describe('mount', () => {
  beforeEach(beforeEachHooks)
  afterEach(afterEachHooks)

  it('mounts a basic component', () => {
    const BasicComponent = { template: '<div>Hello</div>' }
    const vm = mount(BasicComponent)
    expect(vm.$el.textContent).to.equal('Hello')
  })

  it('mounts a component with props', () => {
    const ComponentWithProps = {
      template: '<div>Hello {{ message }}</div>',
      props: ['message']
    }
    const vm = mount(ComponentWithProps, { message: 'World' })
    expect(vm.$el.textContent).to.equal('Hello World')
    expect(vm.message).to.equal('World')
    vm.message = 'Test'
    return Vue.nextTick().then(() => expect(vm.$el.textContent).to.equal('Hello Test'))
  })

  it('mounts a component and listens for events', () => {
    const ComponentWithEvent = { template: `<button @click="$emit('foo', 'bar')"></button>` }
    const listener = sinon.spy()
    const vm = mount(ComponentWithEvent, {}, { foo: listener })
    vm.$el.click()
    expect(listener).to.have.been.calledOnce.and.calledWith('bar')
  })

  it('mounts a component with a slot', () => {
    const ComponentWithSlot = { template: '<div><slot></slot></div>' }

    const vm = mount(ComponentWithSlot, {}, {}, '<p>Hello</p>')
    expect(vm.$el.innerHTML).to.equal('<p>Hello</p>')
  })

  it('mounts a component with a default and named slots', () => {
    const ComponentWithNamedAndDefaultSlots = { template: '<div><slot></slot>Test<slot name="foo"></slot></div>' }

    const vm = mount(ComponentWithNamedAndDefaultSlots, {}, {}, { default: '<p>Hello World</p>', foo: '<p>Bar</p>' })
    expect(vm.$el.innerHTML).to.equal('<p>Hello World</p>Test<p>Bar</p>')
  })

  it('mounts a component with a default slot only with a text node', () => {
    const ComponentWithNamedAndDefaultSlots = { template: '<div>Text<slot name="foo"></slot><slot></slot></div>' }

    const vm = mount(ComponentWithNamedAndDefaultSlots, {}, {}, { default: 'Hello World', foo: '<p>Bar</p>' })
    expect(vm.$el.innerHTML).to.equal('Text<p>Bar</p>Hello World')
  })

  it('throws an Error when named slots are not parsed', () => {
    const ComponentWithNamedAndDefaultSlots = { template: '<div><p>Text</p><slot></slot><slot name="foo"></slot></div>' }

    const callMount = function () {
      const originalError = console.error
      console.error = function () {}
      mount(ComponentWithNamedAndDefaultSlots, {}, {}, { default: 'Hello World', foo: 'Bar' })
      console.error = originalError
    }
    expect(callMount).to.throw(Error, 'Error when rendering named slot "foo"')
  })

  it('throws an Error for defaults slots which are not related to text node rendering', () => {
    const ComponentWithNamedAndDefaultSlots = { template: '<div><p>Text</p><slot></slot><slot name="foo"></slot></div>' }

    const callMount = function () {
      const originalError = console.error
      console.error = function () {}
      mount(ComponentWithNamedAndDefaultSlots, {}, {}, { default: '<p></p><span></span>Hello World', foo: '<p>Bar</p>' })
      console.error = originalError
    }
    expect(callMount).to.throw(Error, 'Error when rendering default slot')
  })

  it('mounts a component with provided dependencies', () => {
      const ComponentWithInjects = {
        template: '<div>Hello {{ valueFromInject }}</div>',
        inject: ['providedValue'],
        data () {
          return {
            valueFromInject: this.providedValue
          }
        }
      }
      const vm = mount(ComponentWithInjects, { provide: { providedValue: 'World' } })
      expect(vm.$el.textContent).to.equal('Hello World')
      expect(vm.providedValue).to.equal('World')
  })

  it('receives an optional callback which is passed the vm after mounting', () => {
    const mounted = sinon.spy()
    const callback = sinon.spy()
    const ComponentWithMountedHook = { template: '<div>Hello</div>', mounted }
    const vm = mount(ComponentWithMountedHook, {}, {}, {}, callback)
    expect(callback).to.have.been.calledOnce
      .and.calledAfter(mounted)
      .and.calledWith(vm)
  })

  it('receives an optional callback without any options', () => {
    const mounted = sinon.spy()
    const callback = sinon.spy()
    const ComponentWithMountedHook = { template: '<div>Hello</div>', mounted }
    mount(ComponentWithMountedHook, callback)
    expect(callback).to.have.been.calledOnce.and.calledAfter(mounted)
  })

  it('can also take an options object', () => {
    const click = sinon.spy()
    const ComponentWithAllOptions = {
      template: `<div @click="$emit('foo')">{{ message }}<slot></slot></div>`,
      props: ['message']
    }
    const options = {
      props: { message: 'Hello ' },
      on: { click },
      slots: { default: '<span>World</span>' },
      provide: { injectedValue: 'test' }
    }
    const vm = mount(ComponentWithAllOptions, options)
    expect(vm.$el.innerHTML).to.equal('Hello <span>World</span>')
  })

  it('can take an options object with a callback as well', () => {
    const mounted = sinon.spy()
    const callback = sinon.spy()
    const ComponentWithMountedHook = { template: '<div>Hello</div>', mounted }
    mount(ComponentWithMountedHook, {}, callback)
    expect(callback).to.have.been.calledOnce.and.calledAfter(mounted)
  })
})
