import { mergeOptions } from './utils'

export function initGlobalApi(Vue) {
	Vue.options = {}

	Vue.mixin = function (mixin) {
		// 我们期望将用户的选项和全局的options进行合并
		this.options = mergeOptions(Vue.options, mixin)
	}
}
