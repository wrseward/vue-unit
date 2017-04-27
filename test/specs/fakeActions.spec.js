import Vue from 'vue'
import Vuex from 'vuex'
import { fakeActions, mount, beforeEachHooks, afterEachHooks } from 'src'

Vue.use(Vuex)

describe('fakeActions', () => {
  beforeEach(beforeEachHooks)
  afterEach(afterEachHooks)

  const ComponentWithActions = {
    template: '<p></p>',
    methods: {
      foo (...args) { return this.$store.dispatch('bar', ...args) },
      qux (...args) { return this.$store.dispatch('qaz', ...args) }
    }
  }

  it('returns a sinon stub for a given action', () => {
    const bar = fakeActions('bar')
    const component = mount(ComponentWithActions)

    component.foo()

    expect(bar).to.have.been.calledOnce
  })

  it('can assert against what arguments an action was dispatched with', () => {
    const bar = fakeActions('bar')
    const component = mount(ComponentWithActions)

    component.foo({ one: 1, two: 2 })

    expect(bar).to.have.been.calledOnce.and.calledWith({ one: 1, two: 2 })
  })

  it('can stub what the action returns using sinon', () => {
    const action = fakeActions('bar').returns(Promise.resolve('baz'))

    const component = mount(ComponentWithActions)

    return component.foo().then(message => {
      expect(action).to.have.been.calledOnce
      expect(message).to.equal('baz')
    })
  })

  it('takes an object to stub multiple actions', () => {
    fakeActions({
      bar: Promise.resolve(1),
      qaz: Promise.resolve(2)
    })

    const component = mount(ComponentWithActions)

    return component.foo().then(message => {
      expect(message).to.equal(1)
      return component.qux().then(message => {
        expect(message).to.equal(2)
      })
    })
  })
})
