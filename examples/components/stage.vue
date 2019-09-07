<template>
  <div id="stage-box">
    <!-- element -->
    <element-item
      v-for="(item, index) in data"
      ref="element-item"
      :data="item"
      :index="index"
      :key="index"
      @onMousedown="handleMousedown"
      ></element-item>

      <!-- resize -->
      <vue-drag-rotate-resize
        v-show="Object.keys(resizeObject).length"
        :top="resizeObject.y || 0"
        :left="resizeObject.x || 0"
        :width="resizeObject.width || 0"
        :height="resizeObject.height || 0"
        :rotateAngle="resizeObject.rotate || 0"
        :rotatable="!isMultiple"
        :aspectRatio="isMultiple ? resizeObject.width / resizeObject.height : 0"
        :onDragStart="handleDragStart"
        :onDrag="handleDrag"
        :onDragEnd="handleDragEnd"
        :onResizeStart="handleResizeStart"
        :onResize="handleResize"
        :onResizeEnd="hanlderResizeEnd"
        :onRotate="handleRotate"
      >
      <template slot="rotate">
        <div class="rotate-btn"></div>
      </template>
      </vue-drag-rotate-resize>
  </div>
</template>

<script>
import { getRect2WHRatio } from '../lib/utils/'
import cloneDeep from 'lodash/cloneDeep'
import elementItem from './common/element'

import bg from '../assets/bg.jpg'
import btn from '../assets/btn.png'

export default {
  data () {
    return {
      resizeObject: {},
      activeElement: null,
      activedElements: [],
      data: [
        {
          x: 100,
          y: 60,
          width: 200,
          height: 100,
          rotate: 0,
          zIndex: 100,
          src: bg
        },
        {
          x: 120,
          y: 180,
          width: 162.5,
          height: 39,
          rotate: 0,
          zIndex: 101,
          src: btn
        }
      ]
    }
  },
  components: {
    elementItem
  },
  computed: {
    isMultiple () {
      return this.activedElements.length > 1
    }
  },
  created () {
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#stage-box')) {
        this.hideEdit()
      }
    }, false)
  },
  methods: {
    hideEdit () {
      this.resizeObject = {}
    },
    getRect () {
      let object = {
        x: [],
        y: [],
        width: [],
        height: []
      }

      // get x、y
      this.activedElements.map((element, index) => {
        object.x.push(element.x)
        object.y.push(element.y)
      })
      const minX = Math.min(...object.x)
      const minY = Math.min(...object.y)

      // get width、height
      this.activedElements.map((element, index) => {
        const { right, bottom } = this.$refs['element-item'][index]['$el'].getBoundingClientRect()
        object.width.push(right - minX)
        object.height.push(bottom - minY)
      })

      return {
        x: minX,
        y: minY,
        width: Math.max(...object.width),
        height: Math.max(...object.height)
      }
    },
    handleMousedown (e, data, index) {
      if (e.metaKey || e.ctrlKey) {
        this.activedElements.push(data)
        if (this.activedElements.length === 1) {
          this.resizeObject = cloneDeep(data)
        } else {
          const rect = this.getRect()
          this.resizeObject = rect
        }
      } else {
        this.resizeObject = cloneDeep(data)
        this.activedElements = [data]
      }
    },
    handleDragStart () {

    },
    handleDrag (e, deltaX, deltaY) {
      this.resizeObject.x += deltaX
      this.resizeObject.y += deltaY

      this.activedElements.map((element, index) => {
        element.x += deltaX
        element.y += deltaY
      })
    },
    handleDragEnd () {

    },
    handleResizeStart () {
      this.oldResizeObject = cloneDeep(this.resizeObject)
      this.oldActivedElements = cloneDeep(this.activedElements)
    },
    handleResize (e, { top, left, width, height }, isShiftKey, type) {
      const options = {
        y: Math.round(top),
        x: Math.round(left),
        width: Math.round(width),
        height: Math.round(height)
      }

      this.resizeRatioObject = getRect2WHRatio(options, this.oldResizeObject)

      const { widthRatio, heightRatio } = this.resizeRatioObject

      const diffX = options.x - this.oldResizeObject.x
      const diffY = options.y - this.oldResizeObject.y

      const rect = this.getRect()

      this.activedElements.map((element, index) => {
        const oldElement = this.oldActivedElements[index]

        const width = Math.round(oldElement.width / widthRatio)
        const height = Math.round(oldElement.height / heightRatio)

        const xRatio = (oldElement.x - this.oldResizeObject.x) / this.oldResizeObject.width
        const yRatio = (oldElement.y - this.oldResizeObject.y) / this.oldResizeObject.height

        const x = diffX + this.oldResizeObject.x + Math.round(options.width * xRatio)
        const y = diffY + this.oldResizeObject.y + Math.round(rect.height * yRatio)

        Object.assign(element, {
          x,
          y,
          width,
          height
        })
      })

      Object.assign(this.resizeObject, options)
    },
    hanlderResizeEnd () {
      const rect = this.getRect()

      this.resizeObject = rect
    },

    handleRotate (e, rotateAngle) {
      this.resizeObject.rotate = rotateAngle
      this.activedElements.map((element, index) => {
        element.rotate = rotateAngle
      })
    }
  }
}
</script>

<style lang="less">

.stage-box{
  position: relative;
  width: 100%;
  height: 100%;
}
.rotate-btn {
  position: absolute;
  width: 14px;
  height: 14px;
  left: 50%;
  top: -32px;
  margin-left: -7px;
  border: 1px solid #409EFF;
  border-radius: 50%;
  box-sizing: border-box;
}
</style>
