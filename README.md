
# React源码学习记录
### 编译阶段
> react代码需要经过一次预编译阶段，把jsx编译成js解析引擎能识别的js，有两部分需要编译
#### 第一部分：创建组件
先创建一个组件如下：
```javascript
var ExampleApplication = React.createClass({
    render: function () {
        var elapsed = Math.round(this.props.elapsed / 100);
        var seconds = elapsed / 10 + (elapsed % 10 ? '' : '.0');
        var message =
            'React has been successfully running for ' + seconds + ' seconds.';
        return <p>{message}</p>; // {7}
    }
});
```
第{7}行就是一段jsx代码，需要编译。编译结果如下：
```javascript
var ExampleApplication = React.createClass({
    render: function () {
        var elapsed = Math.round(this.props.elapsed / 100);
        var seconds = elapsed / 10 + (elapsed % 10 ? '' : '.0');
        var message =
            'React has been successfully running for ' + seconds + ' seconds.';
        return React.DOM.p(null, message); // {7}
    }
});
```
#### 第二部分：渲染组件
渲染一个组件：
```javascript
var start = new Date().getTime();
setInterval(function () {
    React.renderComponent(
        <ExampleApplication elapsed={new Date().getTime() - start} />,{4}
        document.getElementById('container')
    );
}, 50);
```
第{4}行就是段jsx代码，需要被编译，编译结果如下：
```javascript
var start = new Date().getTime();
setInterval(function () {
    React.renderComponent(
        ExampleApplication({ elapsed: new Date().getTime() - start }, null),{4}
        document.getElementById('container')
    );
}, 50);
```
### 组件创建阶段
jsx最终都会被编译成`createClass()`函数执行返回的结果。对比react-16会被编译成`createElement()`函数执行返回的结果。那么就来看看`createClass`函数都做了些什么吧。
```javascript
    createClass: function (spec) {
        var Constructor = function (initialProps, children) {
            this.constructor(initialProps, children);
        }
        Constructor.prototype = new ReactCompositeComponentBase();
        Constructor.prototype.constructor = Constructor;
        mixSpecIntoComponent(Constructor, spec);
        invariant(
            Constructor.prototype.render,
            'createClass(...):Class specification must implement a `render`method'
        )
        var ConvenienceConstructor = function (props, children) {
            return new Constructor(props, children);
        }
        ConvenienceConstructor.componentConstructor = Constructor;
        ConvenienceConstructor.originalSpec = spec;
        return ConvenienceConstructor;
    }
```
这个函数调用了Constructor，传入了props,children两
个参数，也就是编译时生成ExampleApplication传入的参数。然后把spec和Constructor分别挂载到ConvenienceConstructor函
数上。
Constuctor是每个React组件的原型函数，原型指向ReactCompositeComponentBase，又把构造器指向Constructor自己。然后
把消费者声明配置spec合并到Constructor.prototype中。判断合并后的结果有没有render，如果没有 render，抛出一个异常
。
### 组件初始化阶段
组件渲染阶段做了这么几件事情：

1、将初始属性挂载到实例上

2、将children挂载到实例的属性上

3、在属性上挂载OWNER属性，值为该组件的父组件。

4、将该组件的生命周期状态置为UNMOUNTED。

这个阶段对应到编译阶段中的第一部分。
### 组件渲染阶段
组件渲染流程比较复杂。如果组件渲染过，就更新组件属性，如果组件没有渲染过，挂载组件事件，并把虚拟组件渲染成真实组件插入container内。通常很少去调用两次
renderComponent，所以大多数情况下不会更新组件属性而是新创建dom节点并插入到container中。

##### 1、 ReactComponent.mountComponentIntoNode：
- 开启一个事务
- 调用ReactComponent._mountComponentIntoNode去更新容器的innerHTML.
##### 2、ReactComponent._mountComponentIntoNode方法调用了ReactCompositeComponent.mountComponent去更新容器的innerHTML.
##### 3、ReactCompositeComponent.mountComponent：
- 挂载组件ref到this.refs上，设置生命周期状态和rootID
- 设置组件生命周期状态
- 如果组件声明了props，执行校验
- 为组件事件函数绑定this
- 初始化state，如果组件声明componentWillMount函数，那就执行，并且把setState的结果更新到this.state上
- 如果组件声明componentDidMount函数，把该函数加入到ReactOnDOMReady队列
- 调用组件声明的render函数，返回ReactComponent抽象类实例，调用响应的mountComponent函数
- 调用相应的mountComponent函数并返回给最终函数
