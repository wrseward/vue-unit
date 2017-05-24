import Vue from 'vue'
import Vuex from 'vuex'
import { exposeState, mount, beforeEachHooks, afterEachHooks } from 'src'

Vue.use(Vuex)

describe('fakeState', () => {
  beforeEach(beforeEachHooks)
  afterEach(afterEachHooks)

  const ComponentWithState = {
    template: '<p></p>',
    computed: {
      localComputed () {
        return this.$store.state.someItem
      }
    },
    data () {
      return {
        localState: this.$store.state.someItem
      }
    }
  }

  it('allows state to be manipulated', () => {
    const state = exposeState()
    state.someItem = 'foobar'
    const vm = mount(ComponentWithState)

    expect(vm.localState).to.equal('foobar')
    expect(vm.localComputed).to.equal('foobar')

    state.someItem = 'barbaz'

    expect(vm.localState).to.equal('foobar')
    expect(vm.localComputed).to.equal('barbaz')
  })
})
