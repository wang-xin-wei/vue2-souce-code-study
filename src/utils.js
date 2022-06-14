const strats = {}

const LIFECYCLE = ['beforeCreated', 'created']

LIFECYCLE.forEach(hook => {
	strats[hook] = function (p, c) {
		if (c) {
			//如果儿子有 父亲有 把父亲和儿子拼在一起
			if (p) {
				return p.concat(c)
			} else {
				return [c] //如果儿子有父亲没有 则将儿子包装成数组
			}
		} else {
			return p //如果儿子没有  则用父亲即可
		}
	}
})

export function mergeOptions(parent, child) {
	const options = {}

	for (const key in parent) {
		mergeFiled(key)
	}

	for (const key in child) {
		if (!parent.hasOwnProperty(key)) {
			mergeFiled(key)
		}
	}

	function mergeFiled(key) {
		// 策略模式 使用策略模式减少使用if/else
		if (strats[key]) {
			options[key] = strats[key](parent[key], child[key])
		} else {
			options[key] = child[key] || parent[key]
		}
	}

	return options
}
