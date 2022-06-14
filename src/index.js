import { initGlobalApi } from './globalApi'
import { initMixin } from './init'
import { initLifeCycle } from './lifeCycle'
import Watcher, { nextTick } from './observe/watcher'

function Vue(options) {
	this._init(options) //默认调用init初始化
}

Vue.prototype.$nextTick = nextTick

initMixin(Vue)

initLifeCycle(Vue)

initGlobalApi(Vue)


//  所有watch 最终调用的都是这个方法
Vue.prototype.$watch = function(exprOrFn, cb){
	new Watcher(this, exprOrFn, {user: true}, cb)
}




export default Vue
