import { nextTick } from 'vue'
import ParentTestComponent from './ParentTestComponent.vue'
import { beforeEachHooks, afterEachHooks, buildShallow, mount } from 'src'

describe('shallow rendering TestComponent', () => {
  beforeEach(beforeEachHooks)
  afterEach(afterEachHooks)

  let root, child

  function registerSelectors (vm) {
    root = $(vm.$el)
    child = $('test-component')
  }

  const shallow = buildShallow(ParentTestComponent, registerSelectors)

  it('has a shallow rendered child', () => {
    shallow({ message: 'World' })
    expect(root).to.have.html('<test-component message="World"></test-component>')
  })

  it('conditionally renders the child', () => {
    const options = ({ props: { message: 'World' }})
    const vm = shallow(options)
    expect(child).to.exist
    vm.message = null
    return nextTick().then(() => expect($(child.selector)).not.to.exist)
  })

  it('can still be fully rendered', () => {
    mount(ParentTestComponent, { message: 'World' }, registerSelectors)
    expect(root).to.have.descendants('.test-component > .greeting')
      .and.to.contain('Hello World')
    expect(child).not.to.exist
  })
})
