import { shallow, beforeEachHooks, afterEachHooks } from 'src'

describe('shallow', () => {
  beforeEach(beforeEachHooks)
  afterEach(afterEachHooks)

  it('shallow renders locally registered components', () => {
    const ChildComponent = { template: '<div>child</div>' }
    const ParentComponent = {
      template: '<div>Parent<child-component></child-component></div>',
      components: { ChildComponent }
    }

    const vm = shallow(ParentComponent)
    expect(vm.$el.outerHTML).to.equal('<div>Parent<child-component></child-component></div>')
    expect(ParentComponent.components).to.deep.equal({ ChildComponent })
  })
})
