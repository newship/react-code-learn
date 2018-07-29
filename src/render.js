import { createElement, updateElement } from './dom'

export function render(component, container) {
    let {type,props} = component
    let element = createElement({type:type})
    for (let key in props) {
        if(key === 'children') {
            if(typeof props[key] === 'object'){
                props[key].forEach(item => {
                    if(typeof item === 'object'){
                        render(item,element)
                    }else {
                        element.appendChild(createElement({type:String,value:item}))
                    }
                })
            } else {
                element.appendChild(createElement({type:String,value:props[key]}))
            }
        } else {
            let attribute = {}
            attribute[key] = props[key]
            updateElement({attributes: attribute}, element)
        }
    }
    container.appendChild(element)  
}