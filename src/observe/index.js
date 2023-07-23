export function observe(data) {
    // 对 data 对象进行劫持
    if (typeof data !== 'object' || data === null) return
    // 如果一个对象被劫持过了，就不需要再劫持了，（要判断一个对象是否被劫持过，可以选择添加一个实例，用实例来判断是否被劫持过）
    return new Observer(data)
}

function Observer(data) {
    // data 也可能是数数组
    if (Array.isArray(data)) {

    } else this.reactiveProperties(data)
}

Observer.prototype.reactiveProperties = function (data) {
    // 将数据对象中的所有属性全都重新定义
    Object.keys(data).forEach(key => defineReactive(data, key, data[key]))
}

// 用于定义响应式的数据,响应式的核心
// 闭包中存储着 value 的值
function defineReactive(target, key, value) {
    // value 的值可能是对象，继续进行响应式处理
    // observe 中判断是否为对象
    observe(value)
    Object.defineProperty(target, key, {
        get() {
            console.log('取值', key)
            return value
        },
        set(newValue) {
            console.log('设置值', key)
            if (newValue === value) return
            // 设置的新值也可能是对象
            observe(newValue)
            value = newValue
        }
    })
}