import Vue from 'vue'
import sinon from 'sinon'
import kebabCase from 'lodash.kebabcase'

export { default as waitForUpdate } from './wait-for-update'

let originalIgnoredElements
let mountedInstances = []
let actions = {}
let getters = {}
let mutations = {}

export function mount (component, props = {}, on = {}, slots = {}, provide = {}, callback) {
  if (arguments.length === 2 && typeof props === 'function') {
    return mount(component, {}, {}, {}, {}, props)
  }

  if (arguments.length <= 3 && isOptions(props)) {
    const cb = typeof on === 'function' ? on : undefined
    return mount(component, props.props, props.on, props.slots, props.provide, cb)
  }

  if (!isOptions(props) && arguments.length < 6 && typeof arguments[arguments.length - 1] === 'function') {
    if (typeof on === 'function') {
      return mount(component, props, {}, {}, {}, on)
    }
    /* istanbul ignore else */
    if (typeof slots === 'function') {
      return mount(component, props, on, {}, {}, slots)
    }
    /* istanbul ignore else */
    if (typeof provide === 'function') {
      return mount(component, props, on, slots, {}, provide)
    }
  }

  const mountOnto = document.createElement('div')
  document.querySelector('#vue-unit').appendChild(mountOnto)

  const vueOptions = {
    render: h => h(
      component,
      { props, on },
      createSlots(slots, h)),
    provide: provide
  }
  const store = buildFakeStore()

  if (store) {
    vueOptions.store = store
  }

  const vm = new Vue(vueOptions)

  mountedInstances.push(vm)
  vm.$mount(mountOnto)

  // Disable direct prop mutation warnings from Vue by setting the $parent instance to null
  // See https://github.com/vuejs/vue/blob/2b67eeca4d7ae14838982b5f0163fb562ea51bdd/src/core/instance/state.js#L57-L64
  // noinspection JSAnnotator
  vm.$children[0].$parent = null

  if (callback) callback(vm.$children[0])

  return vm.$children[0]
}

function isOptions (object) {
  return ('props' in object || 'on' in object || 'slots' in object || 'provide' in object)
}

function createSlots (slots, h) {
  if (typeof slots === 'string') {
    slots = { default: slots }
  }

  return Object.keys(slots).map(
    name => {
      const originalError = window.console.error
      try {
        window.console.error = function () { throw new Error(...arguments) }
        return h(Vue.compile(slots[name]), { slot: name })
      } catch (error) {
        if (name !== 'default') {
          throw new Error(`[VueUnit]: Error when rendering named slot "${name}":\n\n${error.message}`)
        }
        if (!error.message.match(/\[Vue parser\]: Component template requires a root element, rather than just text/)) {
          throw new Error(`[VueUnit]: Error when rendering default slot:\n\n${error.message}`)
        }
        return Vue.prototype._v(slots[name])
      } finally {
        window.console.error = originalError
      }
    }
  )
}

export function shallow (component, ...args) {
  const c = { ...component }
  c.components = { ...component.components }
  shallowRenderComponents(c)
  return mount(c, ...args)
}

function shallowRenderComponents (component) {
  /* istanbul ignore if */
  if (!component.components) return
  Object.keys(component.components).forEach(c => {
    const tag = kebabCase(c)
    component.components[c] = { template: `<${tag}></${tag}>` }
    Vue.config.ignoredElements.push(tag)
  })
}

export function build (component, defaultCallback) {
  return (...args) => {
    const lastArg = args[args.length - 1]

    if (typeof lastArg !== 'function' && typeof defaultCallback === 'function') {
      args.push(defaultCallback)
    }

    return mount(component, ...args)
  }
}

export function buildShallow (component, ...args) {
  const c = { ...component }
  c.components = { ...component.components }
  shallowRenderComponents(c)
  return build(c, ...args)
}

export function beforeEachHooks () {
  const div = document.createElement('div')
  div.setAttribute('id', 'vue-unit')
  document.body.appendChild(div)
  /* istanbul ignore else */
  if (Vue.config.ignoredElements) {
    originalIgnoredElements = Vue.config.ignoredElements.slice()
  }
}

export function afterEachHooks () {
  mountedInstances.forEach(vm => vm.$destroy())
  mountedInstances = []
  actions = {}
  getters = {}
  mutations = {}
  const div = document.querySelector('#vue-unit')
  if (div) div.remove()
  /* istanbul ignore else */
  if (originalIgnoredElements) {
    Vue.config.ignoredElements = originalIgnoredElements
  }
}

export function simulate (el, event) {
  const e = document.createEvent('HTMLEvents')
  e.initEvent(event, true, true)
  /* istanbul ignore else */
  if ('get' in el && '0' in el && el.get(0)) {
    el = el.get(0)
  }
  el.dispatchEvent(e)
}

export function fakeActions (actionName, returns) {
  if (typeof actionName === 'object') {
    Object.keys(actionName).forEach(key => {
      fakeActions(key, actionName[key])
    })
  }
  const stub = sinon.stub()
  if (returns) stub.returns(returns)
  actions[actionName] = (context, ...args) => stub(...args)
  return stub
}

export function fakeGetters (getterName, returns) {
  if (typeof getterName === 'object') {
    Object.keys(getterName).forEach(key => {
      fakeGetters(key, getterName[key])
    })
    return
  }
  const stub = sinon.stub()
  if (returns) stub.returns(returns)
  getters[getterName] = () => stub()
  return stub
}

export function fakeMutations (mutationName, returns) {
  if (typeof mutationName === 'object') {
    Object.keys(mutationName).forEach(key => {
      fakeMutations(key, mutationName[key])
    })
  }
  const stub = sinon.stub()
  if (returns) stub.returns(returns)
  mutations[mutationName] = (context, ...args) => stub(...args)
  return stub
}

function buildFakeStore () {
  let Vuex

  try {
    Vuex = require('vuex')
  } catch (e) {
    /* istanbul ignore next */
    return null
  }

  if (!Object.keys(actions).length && !Object.keys(getters).length && !Object.keys(mutations).length) {
    return null
  }

  return new Vuex.Store({
    actions,
    getters,
    mutations
  })
}
