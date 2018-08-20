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

  it('allows rendering 1 level deep', () => {
    const GrandchildComponent = { template: '<span>grandchild</span>' }
    const ChildComponent = {
      template: '<div><grandchild-component></grandchild-component></div>',
      components: { GrandchildComponent }
    }
    const ParentComponent = {
      template: '<div>Parent<child-component></child-component></div>',
      components: { ChildComponent }
    }

    const shallow = buildShallow(ParentComponent, 1)
    const vm = shallow()
    expect(vm.$el.outerHTML).to.equal('<div>Parent<div><grandchild-component></grandchild-component></div></div>')
    expect(ParentComponent.components).to.deep.equal({ ChildComponent })
  })

  it('allows rendering 2 levels deep', () => {
    const GreatGrandchildComponent = { template: '<span>Great Grandchild</span>' }
    const GrandchildComponent = {
      template: '<div><great-grandchild-component></great-grandchild-component></div>',
      components: { GreatGrandchildComponent }
    }
    const ChildComponent = {
      template: '<div><grandchild-component></grandchild-component></div>',
      components: { GrandchildComponent }
    }
    const ParentComponent = {
      template: '<div>Parent<child-component></child-component></div>',
      components: { ChildComponent }
    }

    const shallow = buildShallow(ParentComponent, 2)
    const vm = shallow()
    expect(vm.$el.outerHTML).to.equal('<div>Parent<div><div><great-grandchild-component></great-grandchild-component></div></div></div>')
    expect(ParentComponent.components).to.deep.equal({ ChildComponent })
  })
})
