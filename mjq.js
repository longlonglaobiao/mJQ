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
      arg = arg.trim();
      // 对应于 jQ 使用方式一
      // 如果不考虑兼容可以直接使用，否则区分 class id dom

      // 如果传递的是标签字符串【那就创建】
      let tempDiv = document.createElement("div"); // 一个临时的 div
      tempDiv.innerHTML = arg;
      let elem = null;
      if (tempDiv.firstChild.nodeType === 1) {
        // 那说明就是标签【创建标签】
        elem = tempDiv.childNodes;
        tempDiv.remove(); // 临时标签用完了
      } else if (tempDiv.firstChild.nodeType === 3) {
        // 那说明就是文本【进行选择】
        elem = document.querySelectorAll(arg);
      }
      // console.dir(elem);
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
    this.that = this;
  }

  // html
  html(shtml) {
    // 如果有值就设置
    if (shtml) {
      if (typeof shtml === "string") {
        this[0].innerHTML = shtml;
      } else if (typeof shtml === "object") {
        this[0].appendChild(shtml[0]);
      }
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
  addElem = function (elem) {
    // 按照 jQ 的思想，所有的节点其实都是挂在到当前选择的实例中的。
    // 这里还是需要注意箭头函数的 this
    elem.forEach((el, idx) => {
      // 挂在到当前实例中
      this[idx] = el;
    });
    this.length = elem.length;
  };

  // this.that(...).ready 函数
  ready = function (arg) {
    // 直接监听DOM加载完毕
    window.addEventListener("DOMContentLoaded", arg, false);
  };

  // 当然不仅仅是点击事件
  click(fn) {
    for (let i = 0; i < this.length; i++) {
      // false 阻止冒泡
      this[i].addEventListener("click", fn, false);
    }
    // fn();
  }

  /**扩展属性 */
  cssHooks = function (attr) {
    this.that.cssHooks[attr] = {
      get() {
        return;
      },
      set(value) {},
    };
  };

  // 仿 this.that(...).on("click     dbclick")....
  on(eve, fn) {
    let reg = /\s+/g;
    // 将多个空格匹配为 一个空格
    eve = eve.replace(reg, " ");
    let arr = eve.split(" ");

    for (let i = 0; i < this.length; i++) {
      for (let j = 0; j < arr.length; j++) {
        this[i].addEventListener(arr[j], fn, false);
        // console.log("..", this[i]);
      }
    }
  }

  /**
   * 跟 jquery 的ajax 使用方式一致，可以采用 jsonp 跨域
   */
  /*
  ajax({
        url: "/aj",
        data: {
          name: "小明",
          age: 13,
        },
        datatype: "jsonp",
        jsonp: "cb", // 当然这个 cb 名称需要跟后端配合，协同
        success: (res) => {
          console.log(res);
        },
  });
  */
  ajax = function (options) {
    // 通过对象合并，将数据传入 ajax
    let opts = Object.assign(
      {
        url: "",
        method: "get",
        data: "",
        async: true,
        success: function () {},
      },
      options
    );

    function obj_url(obj) {
      let keys = Object.keys(obj);
      let values = Object.values(obj);
      return keys.map((v, k) => `${v}=${values[k]}`).join("&");
    }

    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.status === 200 && xhr.readyState === 4) {
        if (opts.datatype === "json") {
          try {
            opts.success(JSON.parse(xhr.responseText));
          } catch {
            opts.success(xhr.responseText);
          }
        } else {
          opts.success(xhr.responseText);
        }
      }
    };

    if (opts.method.toLowerCase() === "get") {
      let query = !!opts.data ? obj_url(opts.data) : "";

      if (opts.datatype === "jsonp") {
        let fnName = "bi_" + Math.random().toString().substr(2);
        // 让最终执行的回调又回到 success
        window[fnName] = opts.success;
        query = !!query ? query + "&" : query;
        let path = opts.url + "?" + query + opts.jsonp + "=" + fnName;
        let sci = document.createElement("script");
        sci.src = path;
        document.querySelector("head").appendChild(sci);

        // 临时标签用完了 就删了
        sci.parentNode.removeChild(sci);
      } else {
        xhr.open(opts.method, opts.url + "?" + query, opts.async);
        xhr.send(null);
      }
    } else if (opts.method.toLowerCase() === "post") {
      xhr.open(opts.method, opts.url, opts.async);
      xhr.send(opts.data);
    }
  };

  // 仿 css
  css(...args) {
    if (args.length === 1) {
      if (typeof args[0] === "string") {
        // 类似于 this.that(...).("width")
        if (args[0] in this.that.cssHooks) {
          return this.that.cssHooks[args[0]].get(this[0]);
        }
        let res = this.getStyle(this[0], args[0]);

        return res;
      } else {
        // 类似于 this.that(...).({"width":"200px"})
        for (let i = 0; i < this.length; i++) {
          // 因为传入的只有一个对象，而且是数组形式（...args）
          // 接下来就是遍历这个对象的属性
          for (let key in args[0]) {
            this.setStyle(this[i], key, args[0][key]);
          }
        }
      }
    } else {
      // 类似于 this.that(...).("width","100px")
      for (let i = 0; i < this.length; i++) {
        this.setStyle(this[i], args[0], args[1]);
      }
    }
    return this;
  }

  setStyle(elem, style, value) {
    // 容错处理 可以查看 this.that.cssNumer 看看 jquery 针对哪些属性需要加单位

    if (typeof value === "number" && !(style in this.that.cssNumer)) {
      value += "px";
    }

    if (style in this.that.cssHooks) {
      /**如果这里写了扩展，那么就调用样式扩展里面的方法 */
      this.that.cssHooks[style].set(elem, value);
    } else {
      /** 如果样式扩展里面没有定义这个属性，那就一般性处理 */
      elem.style[style] = value;
    }
  }

  // 设置元素是否可以被拖动
  dragable(flag) {
    let elem = this[0];
    let isDown = false; // 是否已经按下

    let translate = elem.style.transform;

    let cx = null; // 鼠标点击时距离左侧距离
    let cy = null; // 鼠标点击时距离顶部距离
    let [offX, offY] = [0, 0];
    let [tempX, tempY] = [0, 0];

    elem.addEventListener("mousedown", function (e) {
      cx = e.clientX;
      cy = e.clientY;
      isDown = true;
    });
    window.addEventListener("mousemove", function (e) {
      if (isDown) {
        let nx = e.clientX;
        let ny = e.clientY;
        [tempX, tempY] = [offX + nx - cx, offY + ny - cy];

        elem.style.transform =
          !flag && translate ? translate : `translate(${tempX}px,${tempY}px)`;
      }
    });
    window.addEventListener("mouseup", function (e) {
      isDown = false;
      [offX, offY] = [tempX, tempY];
    });
  }

  // 样式的设置
  getStyle(elem, style) {
    // 没有 伪类 所以是 null
    // 依然没有考虑兼容
    let res = window.getComputedStyle(elem, null)[style]; // 这是设置在 style 中的样式
    return res;
  }

  // 创建随机范围整数值
  randomInt = function (min = 0, max = 1) {
    // 采取的是四舍五入原则
    return Math.round(Math.random() * (max - min)) + min;
  };

  // 节流
  // 三个参数分别是 经过节流处理的函数，延迟时间，是否立即执行，希望传递给 fn 的参数列表
  throttle = function (fn, delay = 300, start = true, ...arg) {
    if (typeof fn !== "function") {
      return;
    }

    let timer = 0;

    return function () {
      let that = this;
      if (timer) {
        return;
      }

      timer = setTimeout(
        () => {
          fn.apply(that, [...arg]);
          start = false;
          timer = false;
        },
        start ? 0 : delay
      );
    };
  };

  // 防抖
  // 三个参数分别是 经过防抖处理的函数，延迟时间，是否立即执行，希望传递给 fn 的参数列表
  debounce = function (fn, delay = 300, start = true, ...arg) {
    if (typeof fn !== "function") {
      return;
    }

    let timer = null;
    return function () {
      let that = this;
      clearTimeout(timer);
      timer = setTimeout(
        () => {
          fn.apply(that, [...arg]);
          start = false;
        },
        start ? 0 : delay
      );
    };
  };

  // jquery 扩展
  extend = {
    /* 扩展属性，可以重写样式，也可以自己定义新样式 */
    cssHooks: {
      /**例如这里重写 opacity 样式 */
      opacity: {
        get: function (elem) {
          console.log("扩展属性中提取 opacity");
          this.that.getStyle(elem, "opacity");
        },
        set: function (elem, value) {
          console.log("扩展属性中设置 opacity");
          this.that.setStyle(elem, "opacity", value);
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
  };
  // 混入模式
  static util = {
    // 将 obj2 中的方法搬运到 obj1 中
    // 一般可以将 类 中原型上的方法混入
    extends(obj1, obj2) {
      for (let key in obj2) {
        obj1[key] = obj2[key];
      }
    },

    createInstance(Context, arg) {
      // 创建实例的工厂函数
      let context = new Context(arg); // 类的实例化
      let instance = {}; // 最终要实例化的对象
      // 方法属性的混入【类中定义的方法会自动放置到原型中】
      this.extends(instance, context);
      // 返回实例
      return instance;
    },
  };
}

function biao(arg) {
  (function () {
    let instance = JQ.util.createInstance(JQ, arg);
    biao.__proto__ = instance;
  })();
  return arg instanceof JQ ? arg : new JQ(arg);
}
