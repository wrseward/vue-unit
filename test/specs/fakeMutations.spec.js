import Vue from 'vue'
import Vuex from 'vuex'
import { fakeMutations, mount, beforeEachHooks, afterEachHooks } from 'src'

Vue.use(Vuex)

describe('fakeMutations', () => {
  beforeEach(beforeEachHooks)
  afterEach(afterEachHooks)

  const ComponentWithMutations = {
    template: '<p></p>',
    methods: {
      foo (...args) { return this.$store.commit('bar', ...args) },
      qux (...args) { return this.$store.commit('qaz', ...args) }
    }
  }

  it('returns a sinon stub for a given mutation', () => {
    const bar = fakeMutations('bar')
    const vm = mount(ComponentWithMutations)

    vm.foo()

    expect(bar).to.have.been.calledOnce
  })

  it('can assert against what arguments an mutation was committed with', () => {
    const bar = fakeMutations('bar')
    const vm = mount(ComponentWithMutations)

    vm.foo({ one: 1, two: 2 })

    expect(bar).to.have.been.calledOnce.and.calledWith({ one: 1, two: 2 })
  })
})
