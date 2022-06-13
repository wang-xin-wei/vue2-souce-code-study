import babel from 'rollup-plugin-babel'

// rollup默认可以导出一个对象作为打包的配置文件
export default {
	input: './src/index.js', //入口
	output: {
		//出口
		file: './dist/vue.js', //打包位置
		name: 'Vue', //在全局挂载一个vue变量
		format: 'umd', //esm:es6模块  commonjs模块 iife自执行函数  umd:commonjs and amd
		sourcemap: true,
	},
	plugins: [
		babel({
			exclude: 'node_modules/**',    //排除node_modules模块
		}),
	],
}
