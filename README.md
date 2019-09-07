## vue-drag-rotate-resize


### Demo
[demo](https://chenxingyuoo.github.io/vue-drag-rotate-resize)

## 安装
```
npm install @yu/vue-drag-rotate-resize
```

## 注册组件
```js
import VueDragRotateResize from '@yu/vue-drag-rotate-resize'
Vue.use(VueDragRotateResize)
```
## 使用组件
```vue
<template>
  <div id="app">
    <!-- resize -->
    <vue-drag-rotate-resize
      v-show="Object.keys(resizeObject).length"
      :top="resizeObject.y || 0"
      :left="resizeObject.x || 0"
      :width="resizeObject.width || 0"
      :height="resizeObject.height || 0"
      :rotateAngle="resizeObject.rotate || 0"
      :rotatable="true"
      :onDrag="handleDrag"
      :onResize="handleResize"
      :onRotate="handleRotate"
    >
      <div>content</div>
      <template slot="rotate">
        <div class="rotate-btn">o</div>
      </template>
    </vue-drag-rotate-resize>
  </div>
</template>

<script>
  import VueDragRotateResize from '@yu/vue-drag-rotate-resize'
  export default {
    data() {
      return {
        resizeObject: {
          x: 100,
          y: 60,
          width: 200,
          height: 100,
          rotate: 0,
        }
      }
    },
    components: {
      VueDragRotateResize
    },
    methods: {
      handleDrag (e, deltaX, deltaY) {
        this.resizeObject.x += deltaX
        this.resizeObject.y += deltaY
      },
      handleResize (e, { top, left, width, height }, isShiftKey, type) {
        Object.assign(this.resizeObject, {
          y: Math.round(top),
          x: Math.round(left),
          width: Math.round(width),
          height: Math.round(height)
        })
      },
      handleRotate (e, rotateAngle) {
        this.resizeObject.rotate = rotateAngle
      }
    }
  }
</script>
```
