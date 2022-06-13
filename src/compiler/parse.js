const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`
const qnameCapture = `((?:${ncname}\\:)?${ncname})`
const startTagOpen = new RegExp(`^<${qnameCapture}`) //匹配到的分组是一个开始标签名
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`) //匹配到的分组是一个结束标签名
const attribute =
	/^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/ //匹配属性
const startTagClose = /^\s*(\/?)>/

export function parseHTML(html) {
	const ELEMENT_TYPE = 1 //元素类型
	const TEXT_TYPE = 3 //文本类型
	const stack = [] //用于存放元素
	let currentParent //指向栈中的最后一个
	let root

	function createASTElement(tag, attrs) {
		return {
			tag,
			type: ELEMENT_TYPE,
			children: [],
			attrs,
			parent: null,
		}
	}

	// 最终需要将html转成一颗ast语法书  利用栈型结构构造一棵树
	function start(tag, attrs) {
		let node = createASTElement(tag, attrs) //创建一个ast节点
		if (!root) {
			//看一下是否是空树
			root = node //如果为空则是当前树的根节点
		}

		if (currentParent) {
			node.parent = currentParent
      currentParent.children.push(node)
		}

		stack.push(node)
		currentParent = node //currentParent为栈中的最后一个
	}
	function chars(text) {
		text = text.replace(/\s/g, '')
		// 文本直接放到当前指向的节点中
		text && currentParent.children.push({
			type: TEXT_TYPE,
			text,
			parent: currentParent,
		})
	}
	function end(tag) {
		let node = stack.pop() //弹出最后一个
		currentParent = stack[stack.length - 1]
	}
	function advance(n) {
		html = html.substring(n)
	}

	function parseStartTag() {
		let start = html.match(startTagOpen)

		if (start) {
			const match = {
				tagName: start[1], //标签名
				attrs: [], //属性
			}
			advance(start[0].length)

			// 如果不是开始标签的结束 就一直匹配
			let attr, end
			while (
				!(end = html.match(startTagClose)) &&
				(attr = html.match(attribute))
			) {
				advance(attr[0].length)
				match.attrs.push({
					name: attr[1],
					value: attr[3] || attr[4] || attr[5] || true,
				})
			}

			if (end) {
				advance(end[0].length)
			}

			return match
		}

		return false
	}

	while (html) {
		let textEnd = html.indexOf('<')

		if (textEnd == 0) {
			const startTagMatch = parseStartTag()

			if (startTagMatch) {
				//解析到的开始标签
				start(startTagMatch.tagName, startTagMatch.attrs)
				continue
			}

			let endTageMatch = html.match(endTag)

			if (endTageMatch) {
				advance(endTageMatch[0].length)
				end(endTageMatch[1])
				continue
			}
		}

		if (textEnd > 0) {
			let text = html.substring(0, textEnd) //截取文本
			if (text) {
				chars(text)
				advance(text.length) //解析到的文本
			}
		}
	}

	return root;
}