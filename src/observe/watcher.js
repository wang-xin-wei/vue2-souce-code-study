import Dep from './dep'

let id = 0

/**
 * 1：当我们创建渲染watcher的时候我们会把当前渲染的watcher放到dep.target上
 * 2：调用render会取值 走到get上
 * 注意：每个属性有一个dep （属性就是被观察者），watcher就是观察者
 * 属性变化了会通知观察者来更新 -->观察者模式
 */

// 依赖收集 不同的组件有不同的watcher
class Watcher {
	constructor(vm, fn, options) {
		this.id = id++
		this.renderWatcher = options
		this.getter = fn //getter意味着调用这个函数可以发生取值操作
		this.deps = [] //后续我们实现计算属性和一些清理工作需要用到
		this.depsId = new Set()
		this.get()
	}
	addDep(dep) {
		// 一个组件对应着多个属性  重复的属性也不用记录
		let id = dep.id

		if (!this.depsId.has(id)) {
			this.deps.push(dep)
			this.depsId.add(id)
			dep.addSub(this) //watcher已经记住dep而且去重了 此时dep也记住watcher
		}
	}
	get() {
		Dep.target = this
		this.getter() //去vm上取值
	}
	update() {
		queenWatcher(this) //吧当前的watcher暂存起来
	}
	run() {
		this.get()
	}
}

let queen = []
let has = {}
let pending = false

function flushSchedulerQueen() {
	let flushQueen = queen.slice(0)
	queen = []
	has = {}
	pending = false
	flushQueen.forEach(q => {
		q.run()
	})
}

function queenWatcher(watcher) {
	const id = watcher.id
	if (!has[id]) {
		queen.push(watcher)
		has[id] = true
		// 不管update 执行多少次 但是最终只执行一轮 刷新操作
		if (!pending) {
			setTimeout(flushSchedulerQueen, 0)
			pending = true
		}
	}
}

let callbacks = []
let waiting = false

function flushCallbacks() {
	let cbs = callbacks.slice(0)
	waiting = false
	callbacks = []
	cbs.forEach(cb => cb())
}

// nextTick 不是创建了一个异步任务  而是将这个任务维护到了队列中
// nextTick 没有直接使用某个api  而是采用优雅降级的方式
let timerFunc

if (Promise) {
	timerFunc = () => {
		Promise.resolve().then(() => {
			flushCallbacks
		})
	}
} else if (MutationObserver) {
	//这里传入的回调是异步的
	let observer = new MutationObserver(flushCallbacks)
	let textNode = document.createTextNode(1)
	observer.observe(textNode, {
		characterData: true,
	})
	timerFunc = () => {
		textNode.textContent = 2
	}
} else if (setImmediate) {
	timerFunc = () => {
		setImmediate(flushCallbacks)
	}
} else {
	timerFunc = () => {
		setTimeout(flushCallbacks)
	}
}



export function nextTick(cb) {
	callbacks.push(cb) //维护nextTick中的callback方法
	if (!waiting) {
		timerFunc()
		waiting = true
	}
}

// 需要给每个属性增加一个dep  目的是收集watcher

export default Watcher
