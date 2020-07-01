## DOM 篇

- 等待 DOM 加载完成 【 内部是监听 DOMContentLoaded 事件 】

```js
biao(function () {
  /* DOM加载完毕之后的处理函数 */
});
```

- or

```js
biao(document).ready(function () {
  console.log("DOM已加载");
});
```

- 创建节点

```js
biao("<h1>一级标题</h1>");
```

- 获取元素

```js
biao("#de");
```

- 一个案例

```js
biao(document).ready(function () {
  let h1 = biao("<h1>一级标题</h1>"); // 创建节点
  biao("#de").html(h1); // 将节点接入 id="de" 的元素内部
  // 或者你也可以直接传入 dom string
  // biao("#de").html("<h1>一级标题</h1>");
});
```

- dom 插值

```js
biao("#de").html("<h4>4级标题</h4>");
```

- or

```js
let h2 = biao("<h2>二级标题</h2>");
biao("#de").html(h2);
```

- 返回子节点字符串

```js
let res = biao("#de").html();
console.log(res);
```

- 返回上一个操作节点

```js
let lastDOM = biao("#de").end();
```

- 仿 eq 函数，用于选取第几个子节点

```js
let res = biao("div").eq(1); // res  是 mjq 对象
console.log(res.html());
```

- 返还原生节点，不需要链式操作【包含操作节点本身在内】

```js
let res = biao("div").get(1);
console.log(res);
```

## 事件篇（后续添加更多事件处理）

- 点击事件

```js
biao("div").click(function () {
  console.log(this); // dom 对象
  console.log(biao(this)); // mjq 对象
});
```

- 事件监听

```js
biao("div").on("dblclick", function () {
  console.log(this); // dom 对象
  console.log(biao(this)); // mjq 对象
});
```

## ajax

```js
// 默认是 get 方式
biao().ajax({
  url: "", // 接口
  method: "get", // 请求方式
  data: "", // 传输的数据
  async: true, // 异步还是同步
  datatype: "", // 数据的返回格式
  jsonp: "", // jsonp 处理函数
  success: function (res) {},
});
```

| 可选项   | 说明                                                 |
| -------- | ---------------------------------------------------- |
| url      | 接口                                                 |
| method   | 请求方式                                             |
| data     | 传输的数据                                           |
| async    | 异步还是同步                                         |
| datatype | 数据的返回格式【如果是 jsonp 还需要配置 josnp 选项】 |
| jsonp    | jsonp 处理函数                                       |
| success  | 请求回调函数                                         |

## 样式

```js
// 单样式设置
biao("#de").css("color", "red");
```

- or

```js
// 多样式设置
biao("#de").css({ color: "red", "font-size": "32px" });
```

- or

```js
// 样式的获取
let v1 = biao("#de").css("font-size");
console.log(v1);
```

## 功能函数

- 元素可拖动

```js
biao("#de").dragable(true);

// 禁止元素拖动
// biao("#de").dragable(false);
```

- 随机范围整数值（ 采用四舍五入法 ）

```js
// 产生 100 ~ 200 之间的随机整数
let res = biao().randomInt(100, 200);
console.log(res);
```

- 防抖处理

```js
// 参数分别是 经过防抖处理的函数，延迟时间，是否立即执行，希望传递给 fn 的参数列表

//【 默认延迟是 300ms 】
//【 默认是立即执行的 】
function handle(a, b) {
  console.log("hello");
  console.log(a, b);
}

document.onmousemove = biao().debounce(handle, 300, true, 1, 2);
```

- 节流处理

```js
// 三个参数分别是 经过节流处理的函数，延迟时间，是否立即执行，希望传递给 fn 的参数列表

function handle(a, b) {
  console.log("hello");
  console.log(a, b);
}

document.onmousemove = biao().throttle(handle, 300, true, 1, 2);
```
