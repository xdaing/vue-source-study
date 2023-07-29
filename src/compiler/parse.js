const tagName = '[a-zA-Z_][\\-\\.0-9_a-zA-Z]*'
// <xxx 匹配到开始标签的打开
const startTagOpenReg = new RegExp(`^<((?:${tagName}\\:)?${tagName})`)
// 开始标签的结束
const startTagCloseReg = /^\s*(\/?)>/
// </xxx> 最终匹配到的分组就是结束标签的名字
const endTagReg = new RegExp(`^<\\/((?:${tagName}\\:)?${tagName})[^>]*>`)
// 匹配属性，第1个分组就是属性的key,分组2为=，分组3，4，5为值 
const attributeReg = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/

export const NODE_TYPE = {
    ELEMENT: 1,
    TEXT: 3
}

export function parseTemplate(template) {
    template = template.trim()
    // 用于存放解析节点的栈
    const nodeStack = []
    // 根节点
    let rootNode = null
    // 当前父节点
    let currentParentNode = null
    // 创建一个 ast 元素
    function createASTElement(tag, attributes) {
        return {
            tag,
            attributes,
            type: NODE_TYPE.ELEMENT,
            children: [],
            parent: null
        }
    }
    // 创建一个ast文本
    function createASTText(text) {
        return {
            text,
            type: NODE_TYPE.TEXT,
            parent: currentParentNode
        }
    }
    // 处理开始标签
    function handlerStart(tagInfo, selfEnd) {
        const { tagName, attributes } = tagInfo
        const node = createASTElement(tagName, attributes)
        if (!rootNode) rootNode = node
        if (currentParentNode) {
            node.parent = currentParentNode
            currentParentNode.children.push(node)
        }
        // 不是自结束标签将当前节点加入栈中并更新父节点
        if (!selfEnd) {
            nodeStack.push(node)
            currentParentNode = node
        }
    }
    // 处理文本
    function handlerText(text) {
        advance(text.length)
        text = text.trim()
        if (text === '') return
        const node = createASTText(text)
        currentParentNode.children.push(node)
    }
    // 处理结束标签
    const handlerEnd = (endTag) => {
        advance(endTag.length)
        nodeStack.pop()
        currentParentNode = nodeStack[nodeStack.length - 1]
    }
    function parseStartTag() {
        const result = template.match(startTagOpenReg)
        // 没有匹配到，则不是开始标签,解析失败
        if (result === null) return false
        // 解析出的标签信息
        const tagInfo = {
            // 标签名
            tagName: result[1],
            // 属性
            attributes: []
        }
        // 将已经匹配的内容删除
        advance(result[0].length)
        // 开始标签的打开部分匹配完毕，继续匹配标签属性
        // 没有匹配到开始标签的结束则继续匹配
        let attribute, tagClose
        while ((tagClose = template.match(startTagCloseReg)) === null && (attribute = template.match(attributeReg)) !== null) {
            advance(attribute[0].length)
            tagInfo.attributes.push({
                key: attribute[1],
                value: attribute[3] ?? attribute[4] ?? arguments[5] ?? true
            })
        }
        // 将开始标签的结束部分也删除
        advance(tagClose[0].length)
        // 匹配到可能是一个自结束标签
        const selfEndTag = tagClose[0].match(/^\s*\/>\s*/)
        selfEndTag ? handlerStart(tagInfo, true) : handlerStart(tagInfo, false)
        return true
    }
    function advance(step) {
        template = template.slice(step)
    }
    // vue2 中必须有一个跟标签
    while (template) {
        // textEnd为0则说明是一个开始标签或者结束标签
        // 如果大于0则说明为文本结束的位置
        const textEnd = template.indexOf('<')
        if (textEnd === 0) {
            // 可能是开始标签或结束标签
            // 尝试当作开始标签解析
            const startTagMatchResult = parseStartTag(template)
            // 解析开始标签成功
            if (startTagMatchResult) continue
            else {
                // 否则是一个结束标签
                const endTagMatchResult = template.match(endTagReg)
                handlerEnd(endTagMatchResult[0])
                continue
            }
        } else if (textEnd > 0) {
            // 有文本内容
            let text = template.slice(0, textEnd)
            handlerText(text)
        }
    }
    return rootNode
}