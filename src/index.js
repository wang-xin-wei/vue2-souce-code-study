import { compileToFunction } from './compiler/index'
import { initGlobalApi } from './globalApi'
import { initMixin } from './init'
import { initLifeCycle } from './lifeCycle'
import { initStateMixin } from './state'
import { createElm, patch } from './vdom/patch'

function Vue(options) {
	this._init(options) //默认调用init初始化
}

// 扩展了init方法
initMixin(Vue)

// vm.update vm._render
initLifeCycle(Vue)

// 全局api的方法
initGlobalApi(Vue)

// 实现了nextTick和$watch
initStateMixin(Vue)

// 为了方便观察前后的虚拟节点  方便测试
let render1 = compileToFunction(`<ul key='e' style='color:red;'>
	
	<li key='a'>a</li>
	<li key='b'>b</li>
	<li key='c'>c</li>
	<li key='d'>d</li>
</ul>`)
let vm1 = new Vue({
	data: { name: '李四' },
})
let prevVNode = render1.call(vm1)

let el = createElm(prevVNode)
document.body.appendChild(el)

let render2 = compileToFunction(`<ul key='e' style='color:red;'>
	<li key='b'>b</li>
	<li key='m'>m</li>
	<li key='a'>a</li>
	<li key='p'>p</li>
	<li key='c'>c</li>
	<li key='q'>q</li>
</ul>`)
let vm2 = new Vue({
	data: { name: '李四' },
})
let nextVNode = render2.call(vm2)

setTimeout(() => {
	// let newEl = createElm(nextVNode)
	// el.parentNode.replaceChild(newEl, el)
	patch(prevVNode, nextVNode)
}, 1000)

export default Vue
