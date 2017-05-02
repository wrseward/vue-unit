import { waitForUpdate, mount, beforeEachHooks, afterEachHooks } from 'src'

describe('waitForUpdate', () => {
  beforeEach(beforeEachHooks)
  afterEach(afterEachHooks)

  const Component = {
    template: '<p>{{ message }}</p>',
    props: ['message']
  }

  it('tests message updates', done => {
    const vm = mount(Component, { message: 'Hello' })

    expect(vm.$el.textContent).to.equal('Hello')
    vm.message = 'World'
    waitForUpdate(() => {
      expect(vm.$el.textContent).to.equal('World')
      vm.message = 'VueUnit'
    }).then(() => {
      expect(vm.$el.textContent).to.equal('VueUnit')
    }).end(done)
  })
})
