import { initState } from '../state'

export function initExtend(Vue) {
    Vue.prototype._init = function (options) {
        this.$options = options
        // 初始化状态
        initState(this)
    }
}

