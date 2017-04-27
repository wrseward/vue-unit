import Vue from 'vue'
import { beforeEachHooks, afterEachHooks, mount, shallow } from 'src'

describe('hooks', () => {
  describe('beforeEachHooks', () => {
    afterEach(() => document.querySelector('#vue-unit').remove())

    it('appends a div element to body for mounting components', () => {
      beforeEachHooks()
      const div = document.querySelector('#vue-unit')
      expect(div).not.to.be.null
      expect(div.parentNode).to.equal(document.body)
      expect(div.innerHTML).to.equal('')
    })

    it('creates a wrapper div to which components are append when mounted', () => {
      beforeEachHooks()
      const vm1 = mount({ template: '<p>hello</p>' })
      const mountedIn1 = vm1.$el.parentNode
      expect(mountedIn1.id).to.equal('vue-unit')

      const vm2 = mount({ template: '<p>hello</p>' })
      const mountedIn2 = vm2.$el.parentNode
      expect(mountedIn2).to.equal(mountedIn1)
    })
  })

  describe('afterEachHooks', () => {
    it('removes the div element created by beforeEachHooks only if one exists', () => {
      expect(afterEachHooks).not.to.throw(TypeError)
      beforeEachHooks()
      expect(document.querySelector('#vue-unit')).not.to.be.null
      afterEachHooks()
      expect(document.querySelector('#vue-unit')).to.be.null
    })

    it('destroys mounted Vue instances only when they exists', () => {
      beforeEachHooks()
      const destroyed = sinon.spy()
      const destroyed2 = sinon.spy()
      mount({ template: '<p></p>', destroyed })
      mount({ template: '<p></p>', destroyed: destroyed2 })
      afterEachHooks()
      expect(destroyed).to.have.been.calledOnce
      expect(destroyed2).to.have.been.calledOnce
      expect(afterEachHooks).not.to.throw(TypeError)
    })

    it('resets Vue.config.ignoredElements from shallow rendering', () => {
      Vue.config.ignoredElements = ['foo']
      beforeEachHooks()
      const ChildComponent = { template: '<div>child</div>' }
      const ParentComponent = {
        template: '<div>Parent<child-component></child-component></div>',
        components: { ChildComponent }
      }
      shallow(ParentComponent)
      expect(Vue.config.ignoredElements).to.deep.equal(['foo', 'child-component'])
      afterEachHooks()
      expect(Vue.config.ignoredElements).to.deep.equal(['foo'])
      Vue.config.ignoredElements = []
    })
  })
})
