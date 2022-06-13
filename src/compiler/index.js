import { parseHTML } from './parse'


function genProps(attrs) {
	let str = ''
	for (let i = 0; i < attrs.length; i++) {
		let attr = attrs[i]

		if (attr.name === 'style') {
			let obj = {}

			attr.value.split(';').forEach(item => {
				let [key, value] = item.split(':')
				obj[key] = value
			})

			attr.value = obj
		}

		str += `${attr.name}:${JSON.stringify(attr.value)},`
	}

	return `{${str.slice(0, -1)}}`
}



const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; //匹配双花括号 表达式变量等

function gen(node){
  if(node.type === 1){
    return codeGen(node)
  }else{
    // 文本 使用双花括号表达式匹配不上 说明是纯文本
    let text = node.text
    if(!defaultTagRE.test(text)){
      return `_v(${JSON.stringify(text)})`
    }else {
      // 说明是变量
      let tokens = []
      let match;
      defaultTagRE.lastIndex = 0

      let lastIndex = 0
      while(match = defaultTagRE.exec(text)){
        let index = match.index

        if(index > lastIndex){
          tokens.push(JSON.stringify(text.slice(lastIndex,index)))
        }

        tokens.push(`_s(${match[1].trim()})`)

        lastIndex = index + match[0].length
      }

      if(lastIndex < text.length) {
        tokens.push(JSON.stringify(text.slice(lastIndex)))
      }

      return `_v(${tokens.join('+')})`
    }
  }
}

function genChildren(children) {
	if (children) {
		return children.map(child => gen(child)).join(',')
	}
}

function codeGen(ast) {
	let children = genChildren(ast.children)
	let code = `_c('${ast.tag}',${
		ast.attrs.length > 0 ? genProps(ast.attrs) : 'null'
	}${ast.children.length ? `,${children}` : ''})`
	return code
}

export function compileToFunction(templete) {
	let ast = parseHTML(templete)
	let code = codeGen(ast)
  code = `with(this){return ${code}}`


  let render = new Function(code)    //根据代码生成render函数

  return render

}
 