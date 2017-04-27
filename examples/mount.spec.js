import { nextTick } from 'vue'
import TestComponent from './TestComponent.vue'
import { beforeEachHooks, afterEachHooks, build, simulate } from 'src'

describe('mounting TestComponent', () => {
  beforeEach(beforeEachHooks)
  afterEach(afterEachHooks)

  let root, greeting, button, defaultSlot, testSlot

  function registerSelectors (vm) {
    root = $(vm.$el)
    greeting = $('.greeting')
    button = $('button')
    defaultSlot = $('.default-slot')
    testSlot = $('.test-slot')
  }
  const mount = build(TestComponent, registerSelectors)

  it('sets and changes props', () => {
    const vm = mount({ message: 'World' })
    expect(greeting).to.have.text('Hello World')
    vm.message = 'Test'
    return nextTick().then(() => expect(greeting).to.have.text('Hello Test'))
  })

  it('listens for events', () => {
    const listener = sinon.spy()
    mount({}, { 'button-click': listener })
    simulate(button, 'click')
    expect(listener).to.have.been.calledOnce
  })

  it('renders slots', () => {
    mount({}, {}, { default: 'Default Slot', named: '<span>Named Slot</span>' })
    expect(defaultSlot).to.have.text('Default Slot')
    expect(testSlot).to.have.html('<span>Named Slot</span>')
  })

  it('does all three', () => {
    const listener = sinon.spy()
    const props = { message: 'World' }
    const on = { 'button-click': listener }
    const slots = { default: 'Default Slot', named: '<span>Named Slot</span>' }

    const vm = mount({ props, on, slots })

    // props
    expect(greeting).to.have.text('Hello World')

    // events
    simulate(button, 'click')
    expect(listener).to.have.been.calledOnce

    // slots
    expect(defaultSlot).to.have.text('Default Slot')
    expect(testSlot).to.have.html('<span>Named Slot</span>')

    // callback
    expect(root).to.deep.equal($(vm.$el))
  })
})
