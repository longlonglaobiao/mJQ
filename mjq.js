// jQ 使用方式一（传入节点选择）
/* $(".box") */

// jQ 使用方式二 （等待dom 加载完毕）
/* $(function(){}) */

// jQ 方式三 （DOM节点转成jQ对象）
/* $(document.querySelector(".box")) */

class JQ {
  constructor(arg, root) {
    if (typeof root === "undefined") {
      // 第一次获取到 jQ 的时候，它没有上一次的操作节点，
      // 那么就假定它上一次的操作节点定义为 document
      this["prevObject"] = [document];
    } else {
      this["prevObject"] = root;
    }
    if (typeof arg === "string") {
      // 对应于 jQ 使用方式一
      // 如果不考虑兼容可以直接使用，否则区分 class id dom
      let elem = document.querySelectorAll(arg);
      this.addElem(elem);
    }

    // 对应于 jQ 使用方式二
    if (typeof arg === "function") {
      // dom 节点加载完毕后执行
      this.ready(arg);
    }

    // 对应于 jQ 使用方式三
    if (typeof arg === "object") {
      // 只选取一个节点的情况

      if (!arg.length) {
        this[0] = arg;
        this.length = 1;
      } else if (arg.length === 1) {
      } else {
        // 选择了多个节点
        this.addElem(arg);
      }
    }
  }

  // html
  html(shtml) {
    // 如果有值就设置
    if (shtml) {
      this[0].innerHTML = shtml;
    } else {
      return this[0].innerHTML;
    }
  }

  // 获取上次操作的节点对象
  end() {
    return this.prevObject;
  }

  // 仿 eq 函数
  eq(idx) {
    // 如果通过了 eq 操作，那么上一次的操作节点传入
    return new JQ(this[idx], this);
  }

  // 返还原生节点，不需要链式操作
  get(idx) {
    return this[idx];
  }

  // 将节点添加到当前实例
  addElem(elem) {
    // 按照 jQ 的思想，所有的节点其实都是挂在到当前选择的实例中的。
    // 这里还是需要注意箭头函数的 this
    elem.forEach((el, idx) => {
      // 挂在到当前实例中
      this[idx] = el;
    });
    this.length = elem.length;
  }

  // $(...).ready 函数
  ready(arg) {
    // 直接监听DOM加载完毕
    window.addEventListener("DOMContentLoaded", arg, false);
  }

  // 当然不仅仅是点击事件
  click(fn) {
    for (let i = 0; i < this.length; i++) {
      // false 阻止冒泡
      this[i].addEventListener("click", fn, false);
    }
    // fn();
  }

  /**扩展属性 */
  cssHooks(attr) {
    $.cssHooks[attr] = {
      get() {
        return;
      },
      set(value) {},
    };
  }

  // 仿 $(...).on("click     dbclick")....
  on(eve, fn) {
    let reg = /\s+/g;
    // 将多个空格匹配为 一个空格
    eve = eve.replace(reg, " ");
    let arr = eve.split(" ");

    for (let i = 0; i < this.length; i++) {
      for (let j = 0; j < arr.length; j++) {
        this[i].addEventListener(arr[j], fn, false);
        console.log("..", this[i]);
      }
    }
  }

  // 仿 css
  css(...args) {
    if (args.length === 1) {
      if (typeof args[0] === "string") {
        // 类似于 $(...).("width")
        if (args[0] in $.cssHooks) {
          return $.cssHooks[args[0]].get(this[0]);
        }

        let res = this.getStyle(this[0], args[0]);

        return res;
      } else {
        // 类似于 $(...).({"width":"200px"})
        for (let i = 0; i < this.length; i++) {
          // 因为传入的只有一个对象，而且是数组形式（...args）
          // 接下来就是遍历这个对象的属性
          for (let key in args[0]) {
            this.setStyle(this[i], key, args[0][key]);
          }
        }
      }
    } else {
      // 类似于 $(...).("width","100px")
      for (let i = 0; i < this.length; i++) {
        this.setStyle(this[i], args[0], args[1]);
      }
    }
    return this;
  }

  setStyle(elem, style, value) {
    // 容错处理 可以查看 $.cssNumer 看看 jquery 针对哪些属性需要加单位

    if (typeof value === "number" && !(style in $.cssNumer)) {
      value += "px";
    }

    if (style in $.cssHooks) {
      /**如果这里写了扩展，那么就调用样式扩展里面的方法 */
      $.cssHooks[style].set(elem, value);
    } else {
      /** 如果样式扩展里面没有定义这个属性，那就一般性处理 */
      elem.style[style] = value;
    }
  }
  extend(obj) {
    for (let key in obj) {
      this[key] = obj[key];
    }
  }
  // 样式的设置
  getStyle(elem, style) {
    // 没有 伪类 所以是 null
    // 依然没有考虑兼容
    let res = window.getComputedStyle(elem, null)[style]; // 这是设置在 style 中的样式
    return res;
  }
}

function $(arg) {
  return arg instanceof JQ ? arg : new JQ(arg);
}

$.extend = {
  /* 扩展属性，可以重写样式，也可以自己定义新样式 */
  cssHooks: {
    /**例如这里重写 opacity 样式 */
    opacity: {
      get: function (elem) {
        console.log("扩展属性中提取 opacity");
        $.getStyle(elem, "opacity");
      },
      set: function (elem, value) {
        console.log("扩展属性中设置 opacity");
        $.setStyle(elem, "opacity", value);
      },
    },
  },

  /** jquery 中已经定义好了哪些属性不需要 px */
  cssNumer: {
    columnCount: true,
    fillOpacity: true,
    flexGrow: true,
    flexShrink: true,
    fontWeight: true,
    gridArea: true,
    gridColumn: true,
    gridColumnEnd: true,
    gridColumnStart: true,
    gridRow: true,
    gridRowEnd: true,
    gridRowStart: true,
    lineHeight: true,
    opacity: true,
    order: true,
    orphans: true,
    widows: true,
    zIndex: true,
    zoom: true,
  },

  // 创建随机范围整数值
  randomInt: (min = 0, max = 1) => {
    // 采取的是四舍五入原则
    return Math.round(Math.random() * (max - min)) + min;
  },
};

function initJQ() {
  for (let key in $.extend) {
    $[key] = $.extend[key];
  }
}

initJQ();
