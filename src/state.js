import { observe } from "./observe/index"

// 初始化状态
export function initState(vm){
  const opt = vm.$options
  if(opt.data){
    initData(vm)
  }
}

// 代理数据 get set时触发 返回指定数据
function proxy(vm,target,key){
  Object.defineProperty(vm,key,{
    get(){
      // 从vm上取数据的时候 从vm._data中取数据
      return vm[target][key]
    },
    set(newValue){
      // 使用vm赋值的时候  修改vm._data中的数据
      vm[target][key] = newValue
    }
  })
}

// 初始化data
function initData(vm) {
  let data = vm.$options.data   //data可能是object/function
  data = typeof data === 'function' ? data.call(vm) : data
  //将data赋值给_data
  vm._data = data  
  // 对数据进行劫持
  observe(data)

  // 将vm._data代理到vm上
  for (const key in data) {
    proxy(vm,'_data',key)
  }
}