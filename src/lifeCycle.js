import Watcher from './observe/watcher'
import { createElementVNode, createTextVNode } from './vdom/index'
import { patch } from './vdom/patch'

export function initLifeCycle(Vue) {
	Vue.prototype._update = function (vnode) {
		const vm = this
		const el = vm.$el
		// 将虚拟dom变成真实dom
		//patch既有初始化的功能  又有更新的逻辑
		vm.$el = patch(el, vnode)
	}

	// _c()
	Vue.prototype._c = function () {
		return createElementVNode(this, ...arguments)
	}

	// _v()
	Vue.prototype._v = function () {
		return createTextVNode(this, ...arguments)
	}

	Vue.prototype._s = function (value) {
		if (typeof value !== 'object') {
			return value
		}
		return JSON.stringify(value)
	}

	Vue.prototype._render = function () {
		// 让with中的this指向vm   渲染的时候会去实例中取值  就可以将属性和视图绑定在一起
		return this.$options.render.call(this) //通过ast语法转义后生成的render方法
	}
}

export function mountComponents(vm, el) {
	vm.$el = el

	const updateComponents = () => {
		vm._update(vm._render())
	}
	// true用于标识是一个渲染watcher
	new Watcher(vm, updateComponents, true)

	// 调用render方法 产生虚拟dom

	// 根据虚拟dom产生真实dom

	// 插入到el元素中
}

/**
 * vue的核心流程
 * 1：创造了响应式数据
 * 2：模板转成ast语法树
 * 3：将ast语法树转成render函数
 * 4：后续每次数据更新都可以只执行render函数 无需再次执行ast转化过程
 */

/**
 * render函数会去产生虚拟节点 使用响应式数据
 * 根据生成的虚拟节点创造真实的dom
 */

// 执行hook方法
export function callHook(vm, hook) {
	const handlers = vm.$options[hook]
	if (handlers) {
		handlers.forEach(handler => {
			handler.call(vm)
		})
	}
}
