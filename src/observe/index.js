import { newArrProto } from './array'
import Dep from './dep'

class Observe {
	constructor(data) {
		// 给每个对象都添加收集功能
		this.dep = new Dep()

		//将__ob__变成不可枚举，循环的时候无法获取
		Object.defineProperty(data, '__ob__', {
			value: this,
			enumerable: false,
		})
		// object.definePropty 只能劫持已经存在的数据 新增和删除的数据不会被检测到
		if (Array.isArray(data)) {
			// 对于数组
			data.__proto__ = newArrProto
			this.observeArray(data)
		} else {
			// 对于对象
			this.walk(data)
		}
	}
	walk(data) {
		// 循环data 对其中的属性进行劫持 重新定义属性
		// vue2性能比较差的原因
		Object.keys(data).forEach(key => defineReactive(data, key, data[key]))
	}
	observeArray(data) {
		// 对数组的监测 如果数组中含有对象或者其他的内容 则递归数据
		// 直到最底层 对象使用 object.definePropty 添加get 和 set
		data.forEach(item => observe(item))
	}
}


// 递归收集数组的依赖
function dependArray(value){
	for (let i = 0; i < value.length; i++) {
		let current = value[i]
		current.__ob__ && current.__ob__.dep.depend()
		if(Array.isArray(current)){
			dependArray(current)
		}
	}
}


// 传入 源数据、key、value
// 此处产生了闭包 因为set方法可以访问 defineReactive 的 value
export function defineReactive(target, key, value) {
	// 如果当前的value还是一个对象 递归执行observe
	let childOb = observe(value)
	// 每个属性都创建一个dep
	let dep = new Dep()
	Object.defineProperty(target, key, {
		// 获取值
		get() {
			if (Dep.target) {
				dep.depend() //让这个属性的收集器记住当前的watcher
				if (childOb) {
					childOb.dep.depend() //让对象和数组本身也实现依赖收集
					if(Array.isArray(value)){
						dependArray(value)
					}
				}
			}
			return value
		},
		// 设置值
		set(newValue) {
			// 如果传入的值也是个对象 也进行递归操作
			if (value === newValue) return
			observe(newValue)
			value = newValue
			dep.notify() //通知更新
		},
	})
}

export function observe(data) {
	// 对象劫持
	if (typeof data !== 'object' || data === null) {
		return
	}

	if (data.__ob__ instanceof Observe) {
		// 如果__ob__是Observe的实例  说明这个对象被代理过了
		return data.__ob__
	}

	return new Observe(data)
}
