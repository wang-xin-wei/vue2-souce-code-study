import { initMixin } from './init'
import { initLifeCycle } from './lifeCycle'

function Vue(options) {
  this._init(options)  //默认调用init初始化
}

initMixin(Vue)

initLifeCycle(Vue)

export default Vue