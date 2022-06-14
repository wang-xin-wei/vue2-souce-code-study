let id = 0

class Dep {
  constructor(){
    this.id = id ++  //属性的dep要收集watcher
    this.subs = []   //这里存放着当前属性对应的watcher有哪些
  }

  depend(){
    // 我们不希望放重复的watcher 重复收集
    // this.subs.push(Dep.target)  //这种方式可能会重复收集
    Dep.target.addDep(this)
  }
  addSub(watcher){
    this.subs.push(watcher)
  }
  notify(){
    this.subs.forEach((watcher)=>{
      watcher.update()  //高速watcher去更新
    })
  }
}

Dep.target = null


let stack = []

export function pushTarget(watcher) {
  stack.push(watcher)
  Dep.target = watcher
}

export function popTarget() {
  stack.pop()
  Dep.target = stack[stack.length - 1]
}

export default Dep