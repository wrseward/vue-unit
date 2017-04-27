import Vue from 'vue'
import { build, beforeEachHooks, afterEachHooks } from 'src'

describe('build', () => {
  beforeEach(beforeEachHooks)
  afterEach(afterEachHooks)

  it('returns a partially applied mount function', () => {
    const callback = sinon.spy()
    const mounted = sinon.spy()
    const ComponentWithPropAndSlot = {
      template: '<p>{{ message }} <slot></slot></p>',
      props: ['message'],
      mounted
    }
    const mount = build(ComponentWithPropAndSlot)
    const vm = mount({ message: 'Hello' }, {}, '<span>World</span>', callback)
    expect(vm).to.be.an.instanceof(Vue)
    expect(vm.$el.outerHTML).to.equal('<p>Hello <span>World</span></p>')
    expect(callback).to.have.been.calledOnce.and.calledAfter(mounted)
  })

  it('returns a partially applied mount function which takes an options object and callback', () => {
    const callback = sinon.spy()
    const mounted = sinon.spy()
    const ComponentWithPropAndSlot = {
      template: '<p>{{ message }} <slot></slot></p>',
      props: ['message'],
      mounted
    }
    const mount = build(ComponentWithPropAndSlot)
    const options = {
      props: { message: 'Hello' },
      slots: '<span>World</span>'
    }
    const vm = mount(options, callback)
    expect(vm.$el.outerHTML).to.equal('<p>Hello <span>World</span></p>')
    expect(callback).to.have.been.calledOnce.and.calledAfter(mounted)
  })

  it('provides a default callback to mount', () => {
    const mounted = sinon.spy()
    const ComponentWithMountedHook = { template: '<div>Hello</div>', mounted }
    const defaultCallback = sinon.spy()
    const mount = build(ComponentWithMountedHook, defaultCallback)

    mount()
    expect(defaultCallback).to.have.been.calledOnce.and.calledAfter(mounted)

    const callback = sinon.spy()
    mount({}, callback)
    expect(callback).to.have.been.calledOnce.and.calledAfter(mounted)
    expect(defaultCallback).not.to.have.been.calledTwice
  })

  it('provides a default callback only when the 2nd argument is a function', () => {
    const ComponentWithProp = { template: '<div>{{ message }}</div>', props: ['message'] }
    const mount = build(ComponentWithProp, { message: 'foo' })
    expect(mount().message).to.be.undefined
  })
})
