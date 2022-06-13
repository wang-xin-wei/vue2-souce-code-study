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
    console.log("update---------");
		this.get()
	}
}

// 需要给每个属性增加一个dep  目的是收集watcher

export default Watcher
