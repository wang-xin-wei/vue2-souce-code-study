import { initState } from './state'
import { compileToFunction } from './compiler/index'
import { mountComponents, callHook } from './lifeCycle'
import { mergeOptions } from './utils'

export function initMixin(Vue) {
	Vue.prototype._init = function (options) {
		const vm = this
		// 将我们定义的全局指令和过滤器  都挂载在实例上
		vm.$options = mergeOptions(this.constructor.options,options) //将用户的实例挂载到实例（vm）上

		callHook(vm,'beforeCreate')
		
		initState(vm) //初始化状态 初始化计算属性 初始化 watch

		callHook(vm,'created')

		if (options.el) {
			vm.$mount(options.el)
		}
	}

	Vue.prototype.$mount = function (el) {
		const vm = this
		el = document.querySelector(el)
		let opts = vm.$options
		// 检查options上有没有render函数
		if (!opts.render) {
			let templete
			// 检查options上有没有templete
			if (!opts.templete && el) {
				templete = el.outerHTML
			} else {
				if (el) {
					templete = opts.templete
				}
			}

			if (templete) {
				// 对模板进行编译
				const render = compileToFunction(templete)
				opts.render = render
			}
			mountComponents(vm, el) //组件的挂载
		}
	}
}
