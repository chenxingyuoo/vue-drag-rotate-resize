import DragRotateResize from './vue-drag-rotate-resize/index.vue'

DragRotateResize.install = function (Vue) {
  Vue.component(DragRotateResize.name, DragRotateResize)
}

/* istanbul ignore if */
if (typeof window !== 'undefined' && window.Vue) {
  DragRotateResize.install(window.Vue)
}

export default DragRotateResize
