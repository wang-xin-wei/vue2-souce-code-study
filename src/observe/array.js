// 保存旧的数组原型方法
let oldArrProto = Array.prototype

// 创建新的数组方法 在新的方法上操作数组  不改变原先的方法
export let newArrProto = Object.create(oldArrProto)

// 定义可以修改原数组的方法  其他方法不会改变原数组
let methods = ['pop','push','shift','unshift','sort','reverse','splice']

// 重写定义的新方法
methods.forEach((method)=>{
  newArrProto[method] = function(...args){
    // 内部还是调用原来的方法 劫持函数 当前this指向的是调用该方法的对象
    const result = oldArrProto[method].call(this,...args)
    
    // 如果新增的值还是个对象的话  需要对新对象继续进行观测
    let inserted;
    let ob = this.__ob__;
    switch(method){
      case 'push':
      case 'unshift':
        inserted = args
        break;
      case 'splice':
        inserted = args.slice(2)
        break;
      default:
        break;
    }

    if(inserted){
      ob.observeArray(inserted)
    }

    // 更新数组
    ob.dep.notify()  //数组变化了 通知对应的watcher更新
    return result
  }
})