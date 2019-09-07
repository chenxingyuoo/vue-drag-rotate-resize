<template>
  <rectBox
    :styles="styles"
    :zoom="zoom"
    :zoomable="zoomable"
    :rotatable="rotatable"
    :parentScaleNum="parentScaleNum"
    :parentRotateAngle="parentRotateAngle"
    :onDragStart="onDragStart"
    :onDrag="handleDrag"
    :onDragEnd="onDragEnd"
    :onResizeStart="onResizeStart"
    :onResize="handleResize"
    :onResizeEnd="onResizeEnd"
    :onRotateStart="onRotateStart"
    :onRotate="handleRotate"
    :onRotateEnd="onRotateEnd"
  >
    <slot></slot>

    <template slot="rotate">
      <slot name="rotate"></slot>
    </template>
  </rectBox>
</template>

<script>
'use strict'
import { centerToTL, tLToCenter, getNewStyle, degToRadian, getRect2CenterTranslate } from './utils'
import rectBox from './rect-box.vue'

export default {
  name: 'vue-drag-rotate-resize',
  props: {
    // 缩放比例
    zoom: {
      type: Number,
      default: 1
    },
    top: {
      type: Number,
      required: true
    },
    left: {
      type: Number,
      required: true
    },
    width: {
      type: Number,
      required: true
    },
    height: {
      type: Number,
      required: true
    },
    // 旋转角度
    rotateAngle: {
      type: Number,
      default: 0
    },
    // 缩放位置
    zoomable: {
      type: String,
      default: 'n, w, s, e, nw, ne, se, sw'
    },
    // 是否可旋转
    rotatable: {
      type: Boolean,
      default: true
    },
    // 父元素旋转角度
    parentRotateAngle: {
      type: Number,
      default: 0
    },
    // 父元素缩放比例
    parentScaleNum: {
      type: Number,
      default: 1
    },
    // 设置最小宽度
    minWidth: {
      type: Number,
      default: -Infinity
    },
    // 设置最小高度
    minHeight: {
      type: Number,
      default: -Infinity
    },
    // 自定宽高比
    aspectRatio: {
      type: Number
    },
    // 是否中心缩放
    isCenterZoom: {
      type: Boolean,
      default: false
    },
    // 中心缩放目标矩形
    centerZoomTargetRect: {
      type: Object,
      default () {
        return {
          width: 100,
          height: 100
        }
      }
    },
    // 旋转开始回调
    onRotateStart: {
      type: Function
    },
    // 旋转回调
    onRotate: {
      type: Function
    },
    // 旋转结束回调
    onRotateEnd: {
      type: Function
    },
    // 调整大小开始回调
    onResizeStart: {
      type: Function
    },
    // 调整大小回调
    onResize: {
      type: Function
    },
    // 调整大小结束回调
    onResizeEnd: {
      type: Function
    },
    // 拖动开始回调
    onDragStart: {
      type: Function
    },
    // 拖动回调
    onDrag: {
      type: Function
    },
    // 拖动结束回调
    onDragEnd: {
      type: Function
    }
  },
  data () {
    return {

    }
  },
  components: {
    rectBox
  },
  computed: {
    styles () {
      return tLToCenter({ top: this.top, left: this.left, width: this.width, height: this.height, rotateAngle: this.rotateAngle })
    }
  },
  methods: {
    handleDrag (e, deltaX, deltaY) {
      this.onDrag && this.onDrag(e, deltaX, deltaY)
    },
    handleRotate (e, angle, startAngle) {
      if (!this.onRotate) return
      let rotateAngle = Math.round(startAngle + angle)
      if (rotateAngle >= 360) {
        rotateAngle -= 360
      } else if (rotateAngle < 0) {
        rotateAngle += 360
      }
      if (rotateAngle > 356 || rotateAngle < 4) {
        rotateAngle = 0
      } else if (rotateAngle > 86 && rotateAngle < 94) {
        rotateAngle = 90
      } else if (rotateAngle > 176 && rotateAngle < 184) {
        rotateAngle = 180
      } else if (rotateAngle > 266 && rotateAngle < 274) {
        rotateAngle = 270
      }
      this.onRotate(e, rotateAngle)
    },
    handleResize (e, length, alpha, rect, type, isShiftKey) {
      if (!this.onResize) return
      const { rotateAngle, aspectRatio, minWidth, minHeight, parentRotateAngle } = this
      const beta = alpha - degToRadian(rotateAngle + parentRotateAngle)
      const deltaW = length * Math.cos(beta)
      const deltaH = length * Math.sin(beta)
      const ratio = isShiftKey && !aspectRatio ? rect.width / rect.height : aspectRatio
      const newStyle = getNewStyle(type, { ...rect, rotateAngle }, deltaW, deltaH, ratio, minWidth, minHeight)
      const { centerX, centerY } = newStyle.position
      const { width, height } = newStyle.size

      const result = centerToTL({ centerX, centerY, width, height, rotateAngle })

      if (this.isCenterZoom) {
        // 居中信息
        const centerInfo = getRect2CenterTranslate(result, {
          width: this.centerZoomTargetRect.width,
          height: this.centerZoomTargetRect.height
        })

        result.left = centerInfo.left
        result.top = centerInfo.top
      }

      this.onResize(e, result, isShiftKey, type)
    }
  }
}
</script>
