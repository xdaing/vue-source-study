import { observe } from '../observe'

export function initState(vm) {
    const options = vm.$options
    if (options.data) initData(vm)
}

function initData(vm) {
    const optionData = vm.$options.data
    // vue2 中 data 是函数或者对象
    const data = typeof optionData === 'function' ? optionData.call(this) : optionData
    vm._data = data
    // 将 data 中的数据处理成响应式的
    observe(data)
    proxy(vm, vm._data)
}

// 将 _data 中的响应式数据代理到实例上，方便取值
function proxy(vm, target) {
    Object.keys(target).forEach(key => {
        Object.defineProperty(vm, key, {
            get() {
                return target[key]
            },
            set(newValue) {
                target[key] = newValue
            }
        })
    })
}