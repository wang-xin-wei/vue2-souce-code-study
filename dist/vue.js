(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

	var strats = {};
	var LIFECYCLE = ['beforeCreated', 'created'];
	LIFECYCLE.forEach(function (hook) {
	  strats[hook] = function (p, c) {
	    if (c) {
	      //如果儿子有 父亲有 把父亲和儿子拼在一起
	      if (p) {
	        return p.concat(c);
	      } else {
	        return [c]; //如果儿子有父亲没有 则将儿子包装成数组
	      }
	    } else {
	      return p; //如果儿子没有  则用父亲即可
	    }
	  };
	});
	function mergeOptions(parent, child) {
	  var options = {};

	  for (var key in parent) {
	    mergeFiled(key);
	  }

	  for (var _key in child) {
	    if (!parent.hasOwnProperty(_key)) {
	      mergeFiled(_key);
	    }
	  }

	  function mergeFiled(key) {
	    // 策略模式 使用策略模式减少使用if/else
	    if (strats[key]) {
	      options[key] = strats[key](parent[key], child[key]);
	    } else {
	      options[key] = child[key] || parent[key];
	    }
	  }

	  return options;
	}

	function initGlobalApi(Vue) {
	  Vue.options = {};

	  Vue.mixin = function (mixin) {
	    // 我们期望将用户的选项和全局的options进行合并
	    this.options = mergeOptions(Vue.options, mixin);
	  };
	}

	function _typeof(obj) {
	  "@babel/helpers - typeof";

	  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
	    return typeof obj;
	  } : function (obj) {
	    return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
	  }, _typeof(obj);
	}

	function _classCallCheck(instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	}

	function _defineProperties(target, props) {
	  for (var i = 0; i < props.length; i++) {
	    var descriptor = props[i];
	    descriptor.enumerable = descriptor.enumerable || false;
	    descriptor.configurable = true;
	    if ("value" in descriptor) descriptor.writable = true;
	    Object.defineProperty(target, descriptor.key, descriptor);
	  }
	}

	function _createClass(Constructor, protoProps, staticProps) {
	  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
	  if (staticProps) _defineProperties(Constructor, staticProps);
	  Object.defineProperty(Constructor, "prototype", {
	    writable: false
	  });
	  return Constructor;
	}

	function _slicedToArray(arr, i) {
	  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
	}

	function _arrayWithHoles(arr) {
	  if (Array.isArray(arr)) return arr;
	}

	function _iterableToArrayLimit(arr, i) {
	  var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

	  if (_i == null) return;
	  var _arr = [];
	  var _n = true;
	  var _d = false;

	  var _s, _e;

	  try {
	    for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
	      _arr.push(_s.value);

	      if (i && _arr.length === i) break;
	    }
	  } catch (err) {
	    _d = true;
	    _e = err;
	  } finally {
	    try {
	      if (!_n && _i["return"] != null) _i["return"]();
	    } finally {
	      if (_d) throw _e;
	    }
	  }

	  return _arr;
	}

	function _unsupportedIterableToArray(o, minLen) {
	  if (!o) return;
	  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
	  var n = Object.prototype.toString.call(o).slice(8, -1);
	  if (n === "Object" && o.constructor) n = o.constructor.name;
	  if (n === "Map" || n === "Set") return Array.from(o);
	  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
	}

	function _arrayLikeToArray(arr, len) {
	  if (len == null || len > arr.length) len = arr.length;

	  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

	  return arr2;
	}

	function _nonIterableRest() {
	  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
	}

	var id$1 = 0;

	var Dep = /*#__PURE__*/function () {
	  function Dep() {
	    _classCallCheck(this, Dep);

	    this.id = id$1++; //属性的dep要收集watcher

	    this.subs = []; //这里存放着当前属性对应的watcher有哪些
	  }

	  _createClass(Dep, [{
	    key: "depend",
	    value: function depend() {
	      // 我们不希望放重复的watcher 重复收集
	      // this.subs.push(Dep.target)  //这种方式可能会重复收集
	      Dep.target.addDep(this);
	    }
	  }, {
	    key: "addSub",
	    value: function addSub(watcher) {
	      this.subs.push(watcher);
	    }
	  }, {
	    key: "notify",
	    value: function notify() {
	      this.subs.forEach(function (watcher) {
	        watcher.update(); //高速watcher去更新
	      });
	    }
	  }]);

	  return Dep;
	}();

	Dep.target = null;
	var stack = [];
	function pushTarget(watcher) {
	  stack.push(watcher);
	  Dep.target = watcher;
	}
	function popTarget() {
	  stack.pop();
	  Dep.target = stack[stack.length - 1];
	}

	// 保存旧的数组原型方法
	var oldArrProto = Array.prototype; // 创建新的数组方法 在新的方法上操作数组  不改变原先的方法

	var newArrProto = Object.create(oldArrProto); // 定义可以修改原数组的方法  其他方法不会改变原数组

	var methods = ['pop', 'push', 'shift', 'unshift', 'sort', 'reverse', 'splice']; // 重写定义的新方法

	methods.forEach(function (method) {
	  newArrProto[method] = function () {
	    var _oldArrProto$method;

	    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }

	    // 内部还是调用原来的方法 劫持函数 当前this指向的是调用该方法的对象
	    var result = (_oldArrProto$method = oldArrProto[method]).call.apply(_oldArrProto$method, [this].concat(args)); // 如果新增的值还是个对象的话  需要对新对象继续进行观测


	    var inserted;
	    var ob = this.__ob__;

	    switch (method) {
	      case 'push':
	      case 'unshift':
	        inserted = args;
	        break;

	      case 'splice':
	        inserted = args.slice(2);
	        break;
	    }

	    if (inserted) {
	      ob.observeArray(inserted);
	    } // 更新数组


	    ob.dep.notify(); //数组变化了 通知对应的watcher更新

	    return result;
	  };
	});

	var Observe = /*#__PURE__*/function () {
	  function Observe(data) {
	    _classCallCheck(this, Observe);

	    // 给每个对象都添加收集功能
	    this.dep = new Dep(); //将__ob__变成不可枚举，循环的时候无法获取

	    Object.defineProperty(data, '__ob__', {
	      value: this,
	      enumerable: false
	    }); // object.definePropty 只能劫持已经存在的数据 新增和删除的数据不会被检测到

	    if (Array.isArray(data)) {
	      // 对于数组
	      data.__proto__ = newArrProto;
	      this.observeArray(data);
	    } else {
	      // 对于对象
	      this.walk(data);
	    }
	  }

	  _createClass(Observe, [{
	    key: "walk",
	    value: function walk(data) {
	      // 循环data 对其中的属性进行劫持 重新定义属性
	      // vue2性能比较差的原因
	      Object.keys(data).forEach(function (key) {
	        return defineReactive(data, key, data[key]);
	      });
	    }
	  }, {
	    key: "observeArray",
	    value: function observeArray(data) {
	      // 对数组的监测 如果数组中含有对象或者其他的内容 则递归数据
	      // 直到最底层 对象使用 object.definePropty 添加get 和 set
	      data.forEach(function (item) {
	        return observe(item);
	      });
	    }
	  }]);

	  return Observe;
	}(); // 递归收集数组的依赖


	function dependArray(value) {
	  for (var i = 0; i < value.length; i++) {
	    var current = value[i];
	    current.__ob__ && current.__ob__.dep.depend();

	    if (Array.isArray(current)) {
	      dependArray(current);
	    }
	  }
	} // 传入 源数据、key、value
	// 此处产生了闭包 因为set方法可以访问 defineReactive 的 value


	function defineReactive(target, key, value) {
	  // 如果当前的value还是一个对象 递归执行observe
	  var childOb = observe(value); // 每个属性都创建一个dep

	  var dep = new Dep();
	  Object.defineProperty(target, key, {
	    // 获取值
	    get: function get() {
	      if (Dep.target) {
	        dep.depend(); //让这个属性的收集器记住当前的watcher

	        if (childOb) {
	          childOb.dep.depend(); //让对象和数组本身也实现依赖收集

	          if (Array.isArray(value)) {
	            dependArray(value);
	          }
	        }
	      }

	      return value;
	    },
	    // 设置值
	    set: function set(newValue) {
	      // 如果传入的值也是个对象 也进行递归操作
	      if (value === newValue) return;
	      observe(newValue);
	      value = newValue;
	      dep.notify(); //通知更新
	    }
	  });
	}
	function observe(data) {
	  // 对象劫持
	  if (_typeof(data) !== 'object' || data === null) {
	    return;
	  }

	  if (data.__ob__ instanceof Observe) {
	    // 如果__ob__是Observe的实例  说明这个对象被代理过了
	    return data.__ob__;
	  }

	  return new Observe(data);
	}

	var id = 0;
	/**
	 * 1：当我们创建渲染watcher的时候我们会把当前渲染的watcher放到dep.target上
	 * 2：调用render会取值 走到get上
	 * 注意：每个属性有一个dep （属性就是被观察者），watcher就是观察者
	 * 属性变化了会通知观察者来更新 -->观察者模式
	 */
	// 依赖收集 不同的组件有不同的watcher

	var Watcher = /*#__PURE__*/function () {
	  function Watcher(vm, exprOrFn, options, cb) {
	    _classCallCheck(this, Watcher);

	    this.id = id++;
	    this.renderWatcher = options;

	    if (typeof exprOrFn === 'string') {
	      this.getter = function () {
	        return vm[exprOrFn];
	      };
	    } else {
	      this.getter = exprOrFn; //getter意味着调用这个函数可以发生取值操作
	    }

	    this.deps = []; //后续我们实现计算属性和一些清理工作需要用到

	    this.depsId = new Set();
	    this.lazy = options.lazy;
	    this.cb = cb;
	    this.dirty = this.lazy;
	    this.vm = vm;
	    this.user = options.user; //标识是否是用户自己的watcher

	    this.value = this.lazy ? undefined : this.get();
	  }

	  _createClass(Watcher, [{
	    key: "addDep",
	    value: function addDep(dep) {
	      // 一个组件对应着多个属性  重复的属性也不用记录
	      var id = dep.id;

	      if (!this.depsId.has(id)) {
	        this.deps.push(dep);
	        this.depsId.add(id);
	        dep.addSub(this); //watcher已经记住dep而且去重了 此时dep也记住watcher
	      }
	    }
	  }, {
	    key: "evaluete",
	    value: function evaluete() {
	      //获取到用户函数的返回值 并表示为脏
	      this.value = this.get();
	      this.dirty = false;
	    }
	  }, {
	    key: "get",
	    value: function get() {
	      pushTarget(this);
	      var value = this.getter.call(this.vm); //去vm上取值

	      popTarget();
	      return value;
	    }
	  }, {
	    key: "depend",
	    value: function depend() {
	      var i = this.deps.length;

	      while (i--) {
	        // 让计算属性watcher 也收集渲染watcher
	        this.deps[i].depend();
	      }
	    }
	  }, {
	    key: "update",
	    value: function update() {
	      if (this.lazy) {
	        // 如果是计算属性 依赖的值变化了 就表示计算属性是脏值
	        this.dirty = true;
	      } else {
	        queenWatcher(this); //吧当前的watcher暂存起来
	      }
	    }
	  }, {
	    key: "run",
	    value: function run() {
	      var oldValue = this.value;
	      var newValue = this.get();

	      if (this.user) {
	        this.cb.call(this.vm, newValue, oldValue);
	      }
	    }
	  }]);

	  return Watcher;
	}();

	var queen = [];
	var has = {};
	var pending = false;

	function flushSchedulerQueen() {
	  var flushQueen = queen.slice(0);
	  queen = [];
	  has = {};
	  pending = false;
	  flushQueen.forEach(function (q) {
	    q.run();
	  });
	}

	function queenWatcher(watcher) {
	  var id = watcher.id;

	  if (!has[id]) {
	    queen.push(watcher);
	    has[id] = true; // 不管update 执行多少次 但是最终只执行一轮 刷新操作

	    if (!pending) {
	      setTimeout(flushSchedulerQueen, 0);
	      pending = true;
	    }
	  }
	}

	var callbacks = [];
	var waiting = false;

	function flushCallbacks() {
	  var cbs = callbacks.slice(0);
	  waiting = false;
	  callbacks = [];
	  cbs.forEach(function (cb) {
	    return cb();
	  });
	} // nextTick 不是创建了一个异步任务  而是将这个任务维护到了队列中
	// nextTick 没有直接使用某个api  而是采用优雅降级的方式


	var timerFunc;

	if (Promise) {
	  timerFunc = function timerFunc() {
	    Promise.resolve().then(function () {
	    });
	  };
	} else if (MutationObserver) {
	  //这里传入的回调是异步的
	  var observer = new MutationObserver(flushCallbacks);
	  var textNode = document.createTextNode(1);
	  observer.observe(textNode, {
	    characterData: true
	  });

	  timerFunc = function timerFunc() {
	    textNode.textContent = 2;
	  };
	} else if (setImmediate) {
	  timerFunc = function timerFunc() {
	    setImmediate(flushCallbacks);
	  };
	} else {
	  timerFunc = function timerFunc() {
	    setTimeout(flushCallbacks);
	  };
	}

	function nextTick(cb) {
	  callbacks.push(cb); //维护nextTick中的callback方法

	  if (!waiting) {
	    timerFunc();
	    waiting = true;
	  }
	} // 需要给每个属性增加一个dep  目的是收集watcher

	function initState(vm) {
	  var opt = vm.$options;

	  if (opt.data) {
	    initData(vm);
	  }

	  if (opt.computed) {
	    initComputed(vm);
	  }

	  if (opt.watch) {
	    initWatch(vm);
	  }
	} // 初始化watch

	function initWatch(vm) {
	  var watch = vm.$options.watch;

	  for (var key in watch) {
	    // 拿到值  判断是什么情况
	    var handler = watch[key];

	    if (Array.isArray(handler)) {
	      for (var i = 0; i < handler.length; i++) {
	        createWatcher(vm, key, handler[i]);
	      }
	    } else {
	      createWatcher(vm, key, handler);
	    }
	  }
	}

	function createWatcher(vm, key, handler) {
	  // handler可能是字符串 函数 对象（不考虑）
	  if (typeof handler === 'string') {
	    handler = vm[handler];
	  }

	  return vm.$watch(key, handler);
	} // 代理数据 get set时触发 返回指定数据


	function proxy(vm, target, key) {
	  Object.defineProperty(vm, key, {
	    get: function get() {
	      // 从vm上取数据的时候 从vm._data中取数据
	      return vm[target][key];
	    },
	    set: function set(newValue) {
	      // 使用vm赋值的时候  修改vm._data中的数据
	      vm[target][key] = newValue;
	    }
	  });
	} // 初始化data


	function initData(vm) {
	  var data = vm.$options.data; //data可能是object/function

	  data = typeof data === 'function' ? data.call(vm) : data; //将data赋值给_data

	  vm._data = data; // 对数据进行劫持

	  observe(data); // 将vm._data代理到vm上

	  for (var key in data) {
	    proxy(vm, '_data', key);
	  }
	} // 初始化computed


	function initComputed(vm) {
	  var computed = vm.$options.computed; // 将计算属性watcher保存到vm上

	  var watchers = vm._computedWatchers = {};

	  for (var key in computed) {
	    var userDefine = computed[key]; // 我们需要监控计算属性中get的变化

	    var fn = typeof userDefine === 'function' ? userDefine : userDefine.get; // 将属性和watcher对应起来

	    watchers[key] = new Watcher(vm, fn, {
	      lazy: true
	    });
	    defineComputed(vm, key, userDefine);
	  }
	} // 将computed中的方法 添加 Object.defineProperty


	function defineComputed(target, key, userDefine) {
	  // const getter = typeof userDefine === 'function' ? userDefine : userDefine.get
	  var setter = userDefine.set || function () {}; // 可以通过实例访问相应的属性


	  Object.defineProperty(target, key, {
	    get: createComputedGetter(key),
	    set: setter
	  });
	} // 计算属性根本不会收集依赖 只会让自己的依赖属性去收集依赖


	function createComputedGetter(key) {
	  // 检测一下是否执行这个getter
	  return function () {
	    var watcher = this._computedWatchers[key];

	    if (watcher.dirty) {
	      // 如果是脏的  就去执行用户传入的函数
	      watcher.evaluete(); //求值后 下次就成false了
	    }

	    if (Dep.target) {
	      // 计算属性出栈后还要渲染watcher
	      // 应该让计算属性watcher里面的属性去收集上一层watcher
	      watcher.depend();
	    }

	    return watcher.value; //最后返回的是watcher上的value
	  };
	}

	var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*";
	var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")");
	var startTagOpen = new RegExp("^<".concat(qnameCapture)); //匹配到的分组是一个开始标签名

	var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); //匹配到的分组是一个结束标签名

	var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; //匹配属性

	var startTagClose = /^\s*(\/?)>/;
	function parseHTML(html) {
	  var ELEMENT_TYPE = 1; //元素类型

	  var TEXT_TYPE = 3; //文本类型

	  var stack = []; //用于存放元素

	  var currentParent; //指向栈中的最后一个

	  var root;

	  function createASTElement(tag, attrs) {
	    return {
	      tag: tag,
	      type: ELEMENT_TYPE,
	      children: [],
	      attrs: attrs,
	      parent: null
	    };
	  } // 最终需要将html转成一颗ast语法书  利用栈型结构构造一棵树


	  function start(tag, attrs) {
	    var node = createASTElement(tag, attrs); //创建一个ast节点

	    if (!root) {
	      //看一下是否是空树
	      root = node; //如果为空则是当前树的根节点
	    }

	    if (currentParent) {
	      node.parent = currentParent;
	      currentParent.children.push(node);
	    }

	    stack.push(node);
	    currentParent = node; //currentParent为栈中的最后一个
	  }

	  function chars(text) {
	    text = text.replace(/\s/g, ''); // 文本直接放到当前指向的节点中

	    text && currentParent.children.push({
	      type: TEXT_TYPE,
	      text: text,
	      parent: currentParent
	    });
	  }

	  function end(tag) {
	    stack.pop(); //弹出最后一个

	    currentParent = stack[stack.length - 1];
	  }

	  function advance(n) {
	    html = html.substring(n);
	  }

	  function parseStartTag() {
	    var start = html.match(startTagOpen);

	    if (start) {
	      var match = {
	        tagName: start[1],
	        //标签名
	        attrs: [] //属性

	      };
	      advance(start[0].length); // 如果不是开始标签的结束 就一直匹配

	      var attr, _end;

	      while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
	        advance(attr[0].length);
	        match.attrs.push({
	          name: attr[1],
	          value: attr[3] || attr[4] || attr[5] || true
	        });
	      }

	      if (_end) {
	        advance(_end[0].length);
	      }

	      return match;
	    }

	    return false;
	  }

	  while (html) {
	    var textEnd = html.indexOf('<');

	    if (textEnd == 0) {
	      var startTagMatch = parseStartTag();

	      if (startTagMatch) {
	        //解析到的开始标签
	        start(startTagMatch.tagName, startTagMatch.attrs);
	        continue;
	      }

	      var endTageMatch = html.match(endTag);

	      if (endTageMatch) {
	        advance(endTageMatch[0].length);
	        end(endTageMatch[1]);
	        continue;
	      }
	    }

	    if (textEnd > 0) {
	      var text = html.substring(0, textEnd); //截取文本

	      if (text) {
	        chars(text);
	        advance(text.length); //解析到的文本
	      }
	    }
	  }

	  return root;
	}

	function genProps(attrs) {
	  var str = '';

	  for (var i = 0; i < attrs.length; i++) {
	    var attr = attrs[i];

	    if (attr.name === 'style') {
	      (function () {
	        var obj = {};
	        attr.value.split(';').forEach(function (item) {
	          var _item$split = item.split(':'),
	              _item$split2 = _slicedToArray(_item$split, 2),
	              key = _item$split2[0],
	              value = _item$split2[1];

	          obj[key] = value;
	        });
	        attr.value = obj;
	      })();
	    }

	    str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ",");
	  }

	  return "{".concat(str.slice(0, -1), "}");
	}

	var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; //匹配双花括号 表达式变量等

	function gen(node) {
	  if (node.type === 1) {
	    return codeGen(node);
	  } else {
	    // 文本 使用双花括号表达式匹配不上 说明是纯文本
	    var text = node.text;

	    if (!defaultTagRE.test(text)) {
	      return "_v(".concat(JSON.stringify(text), ")");
	    } else {
	      // 说明是变量
	      var tokens = [];
	      var match;
	      defaultTagRE.lastIndex = 0;
	      var lastIndex = 0;

	      while (match = defaultTagRE.exec(text)) {
	        var index = match.index;

	        if (index > lastIndex) {
	          tokens.push(JSON.stringify(text.slice(lastIndex, index)));
	        }

	        tokens.push("_s(".concat(match[1].trim(), ")"));
	        lastIndex = index + match[0].length;
	      }

	      if (lastIndex < text.length) {
	        tokens.push(JSON.stringify(text.slice(lastIndex)));
	      }

	      return "_v(".concat(tokens.join('+'), ")");
	    }
	  }
	}

	function genChildren(children) {
	  if (children) {
	    return children.map(function (child) {
	      return gen(child);
	    }).join(',');
	  }
	}

	function codeGen(ast) {
	  var children = genChildren(ast.children);
	  var code = "_c('".concat(ast.tag, "',").concat(ast.attrs.length > 0 ? genProps(ast.attrs) : 'null').concat(ast.children.length ? ",".concat(children) : '', ")");
	  return code;
	}

	function compileToFunction(templete) {
	  var ast = parseHTML(templete);
	  var code = codeGen(ast);
	  code = "with(this){return ".concat(code, "}");
	  var render = new Function(code); //根据代码生成render函数

	  return render;
	}

	// h() _c()
	function createElementVNode(vm, tag, data) {
	  if (data == null) {
	    data = {};
	  }

	  var key = data.key;

	  if (key) {
	    delete data.key;
	  }

	  for (var _len = arguments.length, children = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
	    children[_key - 3] = arguments[_key];
	  }

	  return vnode(vm, tag, key, data, children);
	} // _v()

	function createTextVNode(vm, text) {
	  return vnode(vm, undefined, undefined, undefined, undefined, text);
	}

	function vnode(vm, tag, key, data, children, text) {
	  return {
	    vm: vm,
	    tag: tag,
	    key: key,
	    data: data,
	    children: children,
	    text: text // ...

	  };
	}

	function createElm(vnode) {
	  var tag = vnode.tag,
	      data = vnode.data,
	      children = vnode.children,
	      text = vnode.text;

	  if (typeof tag === 'string') {
	    vnode.el = document.createElement(tag); //将真实节点和虚拟节点对应起来

	    patchProps(vnode.el, data);
	    children.forEach(function (child) {
	      vnode.el.appendChild(createElm(child));
	    });
	  } else {
	    vnode.el = document.createTextNode(text);
	  }

	  return vnode.el;
	}

	function patchProps(el, props) {
	  for (var key in props) {
	    if (key === 'style') {
	      for (var styleName in props.style) {
	        el.style[styleName] = props.style[styleName];
	      }
	    } else {
	      el.setAttribute(key, props[key]);
	    }
	  }
	}

	function patch(oldVNode, vnode) {
	  var isEealElement = oldVNode.nodeType;

	  if (isEealElement) {
	    var elm = oldVNode; //获取真实元素

	    var parentElm = elm.parentNode;
	    var newElm = createElm(vnode);
	    parentElm.insertBefore(newElm, elm.nextSibling); //插入新的节点

	    parentElm.removeChild(elm); //删除旧的节点

	    return newElm;
	  }
	}

	function initLifeCycle(Vue) {
	  Vue.prototype._update = function (vnode) {
	    var vm = this;
	    var el = vm.$el; // 将虚拟dom变成真实dom
	    //patch既有初始化的功能  又有更新的逻辑

	    vm.$el = patch(el, vnode);
	  }; // _c()


	  Vue.prototype._c = function () {
	    return createElementVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
	  }; // _v()


	  Vue.prototype._v = function () {
	    return createTextVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
	  };

	  Vue.prototype._s = function (value) {
	    if (_typeof(value) !== 'object') {
	      return value;
	    }

	    return JSON.stringify(value);
	  };

	  Vue.prototype._render = function () {
	    // 让with中的this指向vm   渲染的时候会去实例中取值  就可以将属性和视图绑定在一起
	    return this.$options.render.call(this); //通过ast语法转义后生成的render方法
	  };
	}
	function mountComponents(vm, el) {
	  vm.$el = el;

	  var updateComponents = function updateComponents() {
	    vm._update(vm._render());
	  }; // true用于标识是一个渲染watcher


	  new Watcher(vm, updateComponents, true); // 调用render方法 产生虚拟dom
	  // 根据虚拟dom产生真实dom
	  // 插入到el元素中
	}
	/**
	 * vue的核心流程
	 * 1：创造了响应式数据
	 * 2：模板转成ast语法树
	 * 3：将ast语法树转成render函数
	 * 4：后续每次数据更新都可以只执行render函数 无需再次执行ast转化过程
	 */

	/**
	 * render函数会去产生虚拟节点 使用响应式数据
	 * 根据生成的虚拟节点创造真实的dom
	 */
	// 执行hook方法

	function callHook(vm, hook) {
	  var handlers = vm.$options[hook];

	  if (handlers) {
	    handlers.forEach(function (handler) {
	      handler.call(vm);
	    });
	  }
	}

	function initMixin(Vue) {
	  Vue.prototype._init = function (options) {
	    var vm = this; // 将我们定义的全局指令和过滤器  都挂载在实例上

	    vm.$options = mergeOptions(this.constructor.options, options); //将用户的实例挂载到实例（vm）上

	    callHook(vm, 'beforeCreate');
	    initState(vm); //初始化状态 初始化计算属性 初始化 watch

	    callHook(vm, 'created');

	    if (options.el) {
	      vm.$mount(options.el);
	    }
	  };

	  Vue.prototype.$mount = function (el) {
	    var vm = this;
	    el = document.querySelector(el);
	    var opts = vm.$options; // 检查options上有没有render函数

	    if (!opts.render) {
	      var templete; // 检查options上有没有templete

	      if (!opts.templete && el) {
	        templete = el.outerHTML;
	      } else {
	        if (el) {
	          templete = opts.templete;
	        }
	      }

	      if (templete) {
	        // 对模板进行编译
	        var render = compileToFunction(templete);
	        opts.render = render;
	      }

	      mountComponents(vm, el); //组件的挂载
	    }
	  };
	}

	function Vue(options) {
	  this._init(options); //默认调用init初始化

	}

	Vue.prototype.$nextTick = nextTick;
	initMixin(Vue);
	initLifeCycle(Vue);
	initGlobalApi(Vue); //  所有watch 最终调用的都是这个方法

	Vue.prototype.$watch = function (exprOrFn, cb) {
	  new Watcher(this, exprOrFn, {
	    user: true
	  }, cb);
	};

	return Vue;

}));
//# sourceMappingURL=vue.js.map
