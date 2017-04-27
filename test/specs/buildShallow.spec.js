import { buildShallow, beforeEachHooks, afterEachHooks } from 'src'

describe('buildShallow', () => {
  beforeEach(beforeEachHooks)
  afterEach(afterEachHooks)

  it('returns a partially applied shallow function', () => {
    const ChildComponent = { template: '<div>child</div>' }
    const ParentComponent = {
      template: '<div>Parent<child-component></child-component></div>',
      components: { ChildComponent }
    }

    const shallow = buildShallow(ParentComponent)
    const vm = shallow()
    expect(vm.$el.outerHTML).to.equal('<div>Parent<child-component></child-component></div>')
    expect(ParentComponent.components).to.deep.equal({ ChildComponent })
  })
})
