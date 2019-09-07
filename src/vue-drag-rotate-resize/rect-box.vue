<template>
  <div class="rect-box" :style="divStyle" ref="rectBox" @mousedown="startDrag">
    <div v-for="(item, i) in direction" class="scale" :class="zoomableMap[item]" @mousedown.stop="(e) => startResize(e, zoomableMap[item])" :style="[{cursor: getCursorStyle(item)}, reverseScaleStyle]" :key="i"></div>

    <div class="rotate" ref="rotate" @mousedown.stop="startRotate" v-show="rotatable">
      <slot name="rotate">
        <div class="rotate-icon"></div>
      </slot>
    </div>

    <slot />
  </div>
</template>

<script>
'use strict'
import { getLength, getAngle, getCursor } from './utils'

export default {
  props: {
    styles: {
      type: Object,
      default () {
        return {}
      }
    },
    zoom: {
      type: Number
    },
    zoomable: {
      type: String
    },
    rotatable: {
      type: Boolean
    },
    parentRotateAngle: {
      type: Number
    },
    parentScaleNum: {
      type: Number
    },
    onRotateStart: {
      type: Function
    },
    onRotate: {
      type: Function
    },
    onRotateEnd: {
      type: Function
    },
    onResizeStart: {
      type: Function
    },
    onResize: {
      type: Function
    },
    onResizeEnd: {
      type: Function
    },
    onDragStart: {
      type: Function
    },
    onDrag: {
      type: Function
    },
    onDragEnd: {
      type: Function
    }

  },
  name: 'rect-box',
  data () {
    return {
      locals: 1,
      cursor: [],
      zoomableMap: {
        'n': 't',
        's': 'b',
        'e': 'r',
        'w': 'l',
        'ne': 'tr',
        'nw': 'tl',
        'se': 'br',
        'sw': 'bl'
      },
      direction: this.zoomable.split(',').map(d => d.trim()).filter(d => d)
    }
  },
  watch: {
    zoomable (z) {
      this.direction = z.split(',').map(d => d.trim()).filter(d => d)
    }
  },
  components: {},
  computed: {
    reverseScaleStyle () {
      return {
        transform: `scale(${1 / this.parentScaleNum})`
      }
    },
    divStyle () {
      let { position, size, transform } = this.styles

      let style = {
        width: Math.abs(size.width) + 'px',
        height: Math.abs(size.height) + 'px',
        transform: `rotate(${transform.rotateAngle}deg)`,
        left: position.centerX - Math.abs(size.width) / 2 + 'px',
        top: position.centerY - Math.abs(size.height) / 2 + 'px'
      }

      return style
    }
  },
  beforeMount () {
  },
  mounted () {
    this.setElementRef(this.$refs.rectBox)
  },
  filters: {

  },
  methods: {
    setElementRef (ref) {
      this.$element = ref
    },
    getCursorStyle (d) {
      let { transform } = this.styles
      const cursor = `${getCursor(transform.rotateAngle + this.parentRotateAngle, d)}-resize`
      return cursor
    },
    // Drag
    startDrag  (e) {
      if (e.which !== 1) return true
      if (e.stopPropagation) e.stopPropagation()
      if (e.preventDefault) e.preventDefault()
      let { clientX: startX, clientY: startY } = e
      this.onDragStart && this.onDragStart(e)
      this._isMouseDown = true
      const onMove = (e) => {
        if (!this._isMouseDown) return // patch: fix windows press win key during mouseup issue
        e.stopImmediatePropagation()
        if (e.stopPropagation) e.stopPropagation()
        if (e.preventDefault) e.preventDefault()
        window.requestAnimationFrame(() => {
          const { clientX, clientY } = e
          const deltaX = (clientX - startX) / this.zoom
          const deltaY = (clientY - startY) / this.zoom
          this.onDrag(e, deltaX, deltaY)
          startX = clientX
          startY = clientY
        })
      }
      const onUp = (e) => {
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onUp)
        if (!this._isMouseDown) return
        this._isMouseDown = false
        this.onDragEnd && this.onDragEnd(e)
      }
      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseup', onUp)
    },

    // Rotate
    startRotate  (e) {
      if (e.button !== 0) return
      if (e.stopPropagation) e.stopPropagation()
      if (e.preventDefault) e.preventDefault()
      const { clientX, clientY } = e
      const { styles: { transform: { rotateAngle: startAngle } } } = this
      const rect = this.$element.getBoundingClientRect()
      const center = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      }
      const startVector = {
        x: clientX - center.x,
        y: clientY - center.y
      }
      this.onRotateStart && this.onRotateStart(e)
      this._isMouseDown = true
      const onMove = (e) => {
        if (!this._isMouseDown) return // patch: fix windows press win key during mouseup issue
        if (e.stopPropagation) e.stopPropagation()
        if (e.preventDefault) e.preventDefault()
        e.stopImmediatePropagation()
        window.requestAnimationFrame(() => {
          const { clientX, clientY } = e
          const rotateVector = {
            x: clientX - center.x,
            y: clientY - center.y
          }
          const angle = getAngle(startVector, rotateVector)
          this.onRotate(e, angle, startAngle)
        })
      }
      const onUp = (e) => {
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onUp)
        if (!this._isMouseDown) return
        this._isMouseDown = false
        this.onRotateEnd && this.onRotateEnd(e)
      }
      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseup', onUp)
    },

    // Resize
    startResize (e, type, cursor) {
      if (e.button !== 0) return
      // document.body.style.cursor = cursor
      const styles = this.styles
      const { centerX, centerY } = styles.position
      const { width, height } = styles.size
      const { rotateAngle } = styles.transform
      // const { styles: { position: { centerX, centerY }, size: { width, height }, transform: { rotateAngle } } } = this
      // const { clientX: startX, clientY: startY } = e
      const startX = e.clientX
      const startY = e.clientY
      const rect = { width, height, centerX, centerY, rotateAngle }
      // const type = e.target.getAttribute('class').split(' ')[ 0 ]
      this.onResizeStart && this.onResizeStart(e)
      this._isMouseDown = true

      const onMove = (e) => {
        if (!this._isMouseDown) return // patch: fix windows press win key during mouseup issue
        e.stopImmediatePropagation()
        window.requestAnimationFrame(() => {
          const { clientX, clientY } = e
          const deltaX = (clientX - startX) / this.zoom
          const deltaY = (clientY - startY) / this.zoom
          const alpha = Math.atan2(deltaY, deltaX)
          const deltaL = getLength(deltaX, deltaY)
          const isShiftKey = e.shiftKey
          this.onResize(e, deltaL, alpha, rect, type, isShiftKey)
        })
      }

      const onUp = (e) => {
        document.body.style.cursor = 'auto'
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onUp)
        if (!this._isMouseDown) return
        this._isMouseDown = false
        this.onResizeEnd && this.onResizeEnd(e)
      }
      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseup', onUp)
    }
  }
}
</script>

<style lang="less" scoped>
  .rect-box {
    position: fixed;
    cursor: move;
    z-index: 999;
    user-select: none;
    // pointer-events: none;
    &.locked {
      > div {
        display: none;
      }
      &:before {
        outline-color: #ff3d67;
      }
      &:after {
        outline-color: #ff3d67;
      }
    }
    &:before {
      content: "";
      position: absolute;
      left: 0;
      top: 0;
      right: 0;
      bottom: 0;
      outline: 1px solid hsla(0,0%,100%,.67);
    }
    &:after {
      content: "";
      position: absolute;
      left: 0;
      top: 0;
      right: 0;
      bottom: 0;
      outline: 1px dashed rgba(0,0,0,.5);
    }
  }
  .rotate {
    cursor: alias !important;
    .rotate-icon {
      position: absolute;
      pointer-events: all;
      width: 14px;
      height: 14px;
      left: 50%;
      top: -32px;
      margin-left: -7px;
      border: 1px solid #409EFF;
      border-radius: 50%;
      box-sizing: border-box;
    }
  }
  .scale {
    pointer-events: all;
    position: absolute;
    width: 8px;
    height: 8px;
    cursor: se-resize;
    z-index: 110;
    transform: none;
    border: 1px solid #409EFF;
    background-color: #fff;
    border-radius: 50%;
    box-sizing: border-box;
  }
  .t,
  .tl,
  .tr {
    top: -4px;
  }

  .b,
  .bl,
  .br {
    bottom: -4px;
  }

  .r,
  .tr,
  .br {
    right: -4px;
  }

  .tl,
  .l,
  .bl {
    left: -4px;
  }

  .l,
  .r {
    top: 50%;
    margin-top: -4px;
  }

  .t,
  .b {
    left: 50%;
    margin-left: -4px;
  }
</style>
