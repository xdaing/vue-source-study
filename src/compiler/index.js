import { parseTemplate, NODE_TYPE } from './parse'

const mustache = /\{\{((?:.|\r?\n)+?)\}\}/g

// 将模板编译成渲染函数
export function compileToFunction(template) {
    // 将模板解析成抽象语法树
    const ast = parseTemplate(template)
    // 将抽象语法树转换成字符串拼接函数
    const code = generateCode(ast)
    console.log(code)
    // 将转换成的字符串拼接函数转换成渲染函数
    return new Function(`with(this){return ${code}}`)
}

// 处理抽象语法树节点，最开始从根节点处理（vue2中必须有一个根节点，因此根节点是一个ast元素节点类型）
function generateCode(node) {
    const { children, tag, attributes } = node
    return `_element("${tag}",${generateAttributes(attributes)}${generateChildren(children)})`
}

// 生成属性字符串对象
function generateAttributes(attributes) {
    if (attributes.length === 0) return '{}'
    let attributesString = ''
    attributes.forEach(attribute => {
        let { key, value } = attribute
        // 如果是style需要特殊处理
        // color:red;background-color:red => {color:'red','background-color':'red'}
        if (key === 'style') value = generateStyle(value)
        attributesString += `"${key}":${JSON.stringify(value)},`
    })
    return `{${attributesString.slice(0, -1)}}`
}

// 处理style属性
function generateStyle(styleString) {
    const style = {}
    styleString.split(';').filter(item => item.trim() !== '').forEach(item => {
        const [key, value] = item.split(':').map(item => item.trim())
        style[key] = value
    })
    return style
}

// 处理节点的子节点，转换成参数拼接
function generateChildren(children) {
    if (children.length === 0) return ',[]'
    return `,${children.map(child => generateChild(child)).join(',')}`
}

// 继续处理子节点
function generateChild(node) {
    // 子节点为一个元素节点
    if (node.type === NODE_TYPE.ELEMENT) return generateCode(node)
    // 文本节点可能是纯文字，也可能是{{}}语法c
    const { text } = node
    if (!mustache.test(text)) return `_text("${text}")`
    const tokens = []
    let matched, lastIndex = 0
    mustache.lastIndex = 0
    while (matched = mustache.exec(text)) {
        // 当前匹配到的位置
        const index = matched.index
        // 有纯文本内容
        if (index > lastIndex) tokens.push(`"${text.slice(lastIndex, index)}"`)
        // 双括号内部的变量
        tokens.push(`_value(${matched[1].trim()})`)
        lastIndex = index + matched[0].length
    }
    if (lastIndex < text.length) tokens.push(`"${text.slice(lastIndex)}"`)
    return `_text(${tokens.join('+')})`
}