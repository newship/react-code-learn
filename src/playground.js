import { render } from './render'

const user = { name: 'test' }

//debugger
const App = () => {
  return <div class="one" id="two">{user.name}<p>hello</p>ww</div>
}

//调试playground.js，看看jsx编译后的结果是什么。
//jsx编译的结果如下：
/*
const App = () => {
  return createElement(
    "div", 
    {"class": "one"}, 
    user.name, 
    createElement("p", null, "hello"));
};
*/

//实现一个数据结构，把jsx编译后的结构以嵌套形式保存在数据结构对象中。
/*
假设jsx编译后数据为：(type, props, ...children)
实现的数据结构如下：
{
  type,
  props: {
    props,
    children: children.length>1?children:children[0]
  }  
}

举例：
<div class='content'>China</div>的数据结构：
{
  type: 'div',
  {class: 'content'},
  'China'
}


<div class='head'>
  <p>helloworld</p>
  <div class='hello'>I love react</div>
</div>
的数据结构：
{
  type: 'div',
  props: {class: 'head'},
  children: [
      {
        type: 'p',
        props: null,
        children: 'helloworld'
      },
      {
         type: 'div',
         props: {class: 'hello'},
         children: 'I love react'
      },
  ]
}

*/
function Element (type,props) {
  this.type = type
  this.props = props
}
function createElement(type,props,...children){
  if(children.length === 1) children = children[0]
  return new Element(type,{...props,children:children})
}

//实现render，解析这个嵌套对象，并且把解析结果渲染到页面上。
//见render.js文件

render(App(), document.getElementById('root'));
