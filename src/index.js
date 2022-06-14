import { initGlobalApi } from './globalApi'
import { initMixin } from './init'
import { initLifeCycle } from './lifeCycle'
import { nextTick } from './observe/watcher'

function Vue(options) {
	this._init(options) //默认调用init初始化
}

Vue.prototype.$nextTick = nextTick

initMixin(Vue)

initLifeCycle(Vue)

initGlobalApi(Vue)

export default Vue
