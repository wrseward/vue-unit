import Vue from 'vue'
import Vuex from 'vuex'
import { fakeGetters, mount, beforeEachHooks, afterEachHooks } from 'src'

Vue.use(Vuex)

describe('fakeGetters', () => {
  beforeEach(beforeEachHooks)
  afterEach(afterEachHooks)

  const ComponentWithGetters = {
    template: '<p></p>',
    computed: {
      foo () { return this.$store.getters.bar },
      qux () { return this.$store.getters.qaz }
    }
  }

  it('returns a sinon stub for a given getter', () => {
    fakeGetters('bar').returns(1)
    const vm = mount(ComponentWithGetters)

    expect(vm.foo).to.equal(1)
  })

  it('takes an object to stub multiple getters', () => {
    fakeGetters({
      bar: 1,
      qaz: 2
    })
    const vm = mount(ComponentWithGetters)

    expect(vm.foo).to.equal(1)
    expect(vm.qux).to.equal(2)
  })
})
