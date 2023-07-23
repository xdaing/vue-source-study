const originArrayProto = Array.prototype

export const rewriteArrayProto = Object.create(originArrayProto)

// 数组中的变异方法
const mutationMethod = ['push', 'pop', 'shift', 'unshift', 'reverse', 'sort', 'splice']

mutationMethod.forEach(method => {
    // 重写数组的变异方法
    rewriteArrayProto[method] = function (...args) {
        console.log('调用重写方法', method);
        // 调用原数组方法
        const result = originArrayProto[method].apply(this, args)
        // 如果向数组中添加了新数据，对新添加的数据继续进行响应式劫持
        const inserted = method === 'splice' ? args.slice(2) : (method === 'push' || method === 'unshift') ? args : []
        // 插入了新的元素
        if (inserted.length) {
            console.log(22222);
            this.__observer__.observerArray(inserted)
            // this 的值为当前调用该方法的数组
            // 且该数组在上层已经被 Observer 处理过，在当前的数组上存在 Observer 的实例对象 
        }
        return result
    }
})