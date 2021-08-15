# 这是一个在控制台快速获取牛客网面经的脚本，默认只获取前端工程师，可以自己修改

> 本来想做一个web界面出来的，结果被跨域问题搞得头疼，怎么把牛客网的cookie放到本地的localhost域呢？
>
> 然后发送请求的时候再带上这个cookie

* java工程师: 639
* c++工程师 640

# 功能截图

![image-20210815173245755](.\image-20210815173245755.png)

![image-20210815173408828](.\image-20210815173408828.png)

# 使用方法

1. 需要先登录牛客网
2. 在牛客网的首页 https://www.nowcoder.com/ 打开控制台，把代码粘贴进去
3. 用 new Composed() 创建一个对象
4. 调用对象上的 init() 方法
5. 看到提示初始化成功后，调用 next() 方法
6. 重复第5步

# 需要修复

部分面经会出现这种情况

![image-20210815192140320](.\image-20210815192140320.png)

查看DOM结构发现是这样的

![image-20210815192334973](.\image-20210815192334973.png)

问题出在 DocumentHandler.parseHtml() 这个函数：

我的思路是递归每个 div, 然后解析每层的文字，放入数组里，最后在`parseHtml` 外面把`result`再放最顶层数组里

这样最外层的数组的格式就是这样

![image-20210815193203119](.\image-20210815193203119.png)

然而个别面经的分段标记是 p、br 等等

```js
parseHtml(node, result) {
    // 这个函数只能解析 div 分段的面经，请大佬们想出一个通用函数
  if (node.tagName !== 'DIV' || node.firstElementChild === null || node.firstElementChild.tagName !== 'DIV') {
    let text = this.parseText(node);
    if (text !== '') {
      result.push(text);
    }
    return;
  }
  Array.from(node.children).forEach(child => {
    this.parseHtml(child, result);
  })
}
```

