import { initExtend } from './init'

//  Vue 构造函数
//  用户传入的配置项
function Vue(options) {
    this._init(options)
}

initExtend(Vue)

export default Vue