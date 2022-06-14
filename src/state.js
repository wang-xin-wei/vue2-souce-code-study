import Dep from './observe/dep'
import { observe } from './observe/index'

import Watcher from './observe/watcher'

// 初始化状态
export function initState(vm) {
	const opt = vm.$options
	if (opt.data) {
		initData(vm)
	}
	if (opt.computed) {
		initComputed(vm)
	}
}

// 代理数据 get set时触发 返回指定数据
function proxy(vm, target, key) {
	Object.defineProperty(vm, key, {
		get() {
			// 从vm上取数据的时候 从vm._data中取数据
			return vm[target][key]
		},
		set(newValue) {
			// 使用vm赋值的时候  修改vm._data中的数据
			vm[target][key] = newValue
		},
	})
}

// 初始化data
function initData(vm) {
	let data = vm.$options.data //data可能是object/function
	data = typeof data === 'function' ? data.call(vm) : data
	//将data赋值给_data
	vm._data = data
	// 对数据进行劫持
	observe(data)

	// 将vm._data代理到vm上
	for (const key in data) {
		proxy(vm, '_data', key)
	}
}

// 初始化computed
function initComputed(vm) {
	const computed = vm.$options.computed
	// 将计算属性watcher保存到vm上
	const watchers = vm._computedWatchers = {}
	for (const key in computed) {
		let userDefine = computed[key]

		// 我们需要监控计算属性中get的变化
		let fn = typeof userDefine === 'function' ? userDefine : userDefine.get
		// 将属性和watcher对应起来
		watchers[key] = new Watcher(vm, fn, { lazy: true })

		defineComputed(vm, key, userDefine)
	}
}

// 将computed中的方法 添加 Object.defineProperty
function defineComputed(target, key, userDefine) {
	// const getter = typeof userDefine === 'function' ? userDefine : userDefine.get
	const setter = userDefine.set || (() => {})

	// 可以通过实例访问相应的属性
	Object.defineProperty(target, key, {
		get: createComputedGetter(key),
		set: setter,
	})
}


// 计算属性根本不会收集依赖 只会让自己的依赖属性去收集依赖
function createComputedGetter(key) {
	// 检测一下是否执行这个getter
	return function () {
		const watcher = this._computedWatchers[key]

		if (watcher.dirty) {
			// 如果是脏的  就去执行用户传入的函数
			watcher.evaluete()   //求值后 下次就成false了
		}
		if(Dep.target){
			// 计算属性出栈后还要渲染watcher
			// 应该让计算属性watcher里面的属性去收集上一层watcher
			watcher.depend()
		}
		return watcher.value  //最后返回的是watcher上的value
	}
}
