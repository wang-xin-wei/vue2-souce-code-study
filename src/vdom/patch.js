import { isSameVNode } from './index'

export function createElm(vnode) {
	let { tag, data, children, text } = vnode
	if (typeof tag === 'string') {
		vnode.el = document.createElement(tag) //将真实节点和虚拟节点对应起来

		patchProps(vnode.el, {}, data)

		children.forEach(child => {
			vnode.el.appendChild(createElm(child))
		})
	} else {
		vnode.el = document.createTextNode(text)
	}

	return vnode.el
}

export function patchProps(el, oldProps = {}, props = {}) {
	// 老的属性中有  新的属性中没有  要删除老的
	let oldStyles = oldProps.style || {}
	let newStyles = props.style || {}

	// 老的样式中有 新的没有 删除老的
	for (const key in oldStyles) {
		if (!newStyles[key]) {
			el.style[key] = ''
		}
	}

	for (const key in oldProps) {
		if (!props[key]) {
			el.removeAttribute(key)
		}
	}

	for (const key in props) {
		if (key === 'style') {
			for (const styleName in props.style) {
				el.style[styleName] = props.style[styleName]
			}
		} else {
			el.setAttribute(key, props[key])
		}
	}
}

export function patch(oldVNode, vnode) {
	const isEealElement = oldVNode.nodeType

	if (isEealElement) {
		const elm = oldVNode //获取真实元素

		const parentElm = elm.parentNode
		let newElm = createElm(vnode)
		parentElm.insertBefore(newElm, elm.nextSibling) //插入新的节点
		parentElm.removeChild(elm) //删除旧的节点

		return newElm
	} else {
		// diff算法
		return patchVNode(oldVNode, vnode)
	}
}

function patchVNode(oldVNode, vnode) {
	/**
	 * 1:两个节点不是同一个节点 直接删除老的节点换上新的节点
	 * 2：两个节点是同一个节点 (判断节点的tag和节点的key)比较两个节点的属性是否有差异 复用老的节点  将差异的节点更新
	 */
	if (!isSameVNode(oldVNode, vnode)) {
		// 如果两个节点不是同一个节点
		let el = createElm(vnode)
		oldVNode.el.parentNode.replaceChild(el, oldVNode.el)
	}

	//复用老节点的元素
	let el = (vnode.el = oldVNode.el)

	// 比较文本 比较一下文本的内容
	if (!oldVNode.tag) {
		if (oldVNode.text !== vnode.text) {
			// 用新的文本覆盖掉久的文本
			el.textContent = vnode.text
		}
	}

	// 比较标签  需要比对标签的属性
	patchProps(el, oldVNode.data, vnode.data)

	// 比较子节点 比较一下子节点是否相同
	let oldChildren = oldVNode.children || []
	let newChildren = vnode.children || []

	if (oldChildren.length > 0 && newChildren.length > 0) {
		// 完整的diff算法  需要比较两个子节点
		updateChildren(el, oldChildren, newChildren)
	} else if (newChildren.length > 0) {
		// 没有老的  有新的
		mountChildren(el, newChildren)
	} else if (oldChildren.length > 0) {
		// 新的没有  老的有 要删除老的
		el.innerHTML = ''
	}

	return el
}

// 挂载新节点
function mountChildren(el, newChildren) {
	for (let i = 0; i < newChildren.length; i++) {
		let child = newChildren[i]
		el.appendChild(createElm(child))
	}
}

function updateChildren(el, oldChildren, newChildren) {
	// 为了比较两个子节点的时候提高性能 会有一些优化手段

	// vue2中使用双指针的方式 比较两个节点

	// 定义子节点的开始索引和开始VNode
	let oldStartIndex = 0
	let newStartIndex = 0
	let oldStartVNode = oldChildren[0]
	let newStartVNode = newChildren[0]

	// 定义子节点的结束索引和结束VNode
	let oldEndIndex = oldChildren.length - 1
	let newEndIndex = newChildren.length - 1
	let oldEndVNode = oldChildren[oldEndIndex]
	let newEndVNode = newChildren[newEndIndex]

	// 创建一个映射表
	function makeIndexByKey(children) {
		let map = {}
		children.forEach((child, index) => {
			map[child.key] = index
		})
		return map
	}
	let map = makeIndexByKey(oldChildren)


	// 双方有一方头指针大于尾部指针 则停止循环  有一个不满足则停止
	// 如果是相同节点 则递归比较子节点
	while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
		if (!oldStartVNode) {
			oldStartVNode = oldChildren[++oldStartIndex]
		} else if (!oldEndVNode) {
			oldEndVNode = oldChildren[--oldEndIndex]
		} else if (isSameVNode(oldStartVNode, newStartVNode)) {
			// 头部比对
			patchVNode(oldStartVNode, newStartVNode)
			oldStartVNode = oldChildren[++oldStartIndex]
			newStartVNode = newChildren[++newStartIndex]
		} else if (isSameVNode(oldEndVNode, newEndVNode)) {
			// 尾部比对
			patchVNode(oldEndVNode, newEndVNode)
			oldEndVNode = oldChildren[--oldEndIndex]
			newEndVNode = newChildren[--newEndIndex]
		} else if (isSameVNode(oldEndVNode, newStartVNode)) {
			// 交叉比对
			patchVNode(oldEndVNode, newStartVNode)

			// 将老的尾巴移动到老的前面去
			el.insertBefore(oldEndVNode.el, oldStartVNode.el)

			oldEndVNode = oldChildren[--oldEndIndex]
			newStartVNode = newChildren[++newStartIndex]
		} else if (isSameVNode(oldStartVNode, newEndVNode)) {
			patchVNode(oldStartVNode, newEndVNode)

			el.insertBefore(oldStartVNode.el, oldEndVNode.el.nextSibling)

			oldStartVNode = oldChildren[++oldStartIndex]
			newEndVNode = oldChildren[--newEndIndex]
		} else {
			// 乱序比对 根据老的列表做一个映射关系  用新的去找 找到则移动 找不到则添加 最后多余的则删除
			let moveIndex = map[newStartVNode.key] //如果找到说明是我要移动的
			if (moveIndex !== undefined) {
				let moveVNode = oldChildren[moveIndex] //找到对应的虚拟节点
				el.insertBefore(moveVNode.el, oldStartVNode.el)
				oldChildren[moveIndex] = undefined
				patchVNode(moveVNode, newStartVNode)
			} else {
				el.insertBefore(createElm(newStartVNode), oldStartVNode.el)
			}

			newStartVNode = newChildren[++newStartIndex]
		}

		// 使用v-for给动态列表添加key的时候 要避免使用索引
		// 因为所以前后都是从0开始的 可能会发生错误复用
	}

	// 新节点比老节点多  将新节点中多的插入到老节点
	if (newStartIndex <= newEndIndex) {
		for (let i = newStartIndex; i <= newEndIndex; i++) {
			let childEl = createElm(newChildren[i])
			let anchor = newChildren[newEndIndex + 1]
				? newChildren[newEndIndex + 1].el
				: null
			el.insertBefore(childEl, anchor)
		}
	}

	// 老的节点比新的节点多  将老节点中多的删除
	if (oldStartIndex <= oldEndIndex) {
		for (let i = oldStartIndex; i <= oldEndIndex; i++) {
			if (oldChildren[i]) {
				let childEl = oldChildren[i].el
				el.removeChild(childEl)
			}
		}
	}
}
