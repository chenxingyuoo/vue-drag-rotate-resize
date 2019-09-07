<template>
  <div class="element-item"
    :style="elementItemStyle"
    @mousedown="onMousedown"
    @contextmenu="onContextmenu">
    <img :src="data.src" >
  </div>
</template>

<script>
export default {
  props: {
    // 元素数据
    data: {
      type: Object,
      required: true
    },
    // 数组索引
    index: {
      type: Number,
      required: true
    }
  },
  computed: {
    // 元素盒子样式
    elementItemStyle () {
      const { x, y, width, height, rotate, zIndex } = this.data

      return {
        position: 'absolute',
        top: `${y || 0}px`,
        left: `${x || 0}px`,
        width: `${width}px`,
        height: `${height}px`,
        'z-index': `${zIndex}`,
        transform: `rotate(${rotate}deg)`
      }
    }
  },
  methods: {
    // 监听鼠标按下事件、判断是左键还是右键
    onMousedown (e) {
      if (e.buttons === 1) {
        this.$emit('onMousedown', e, this.data, this.index)
      } else if (e.buttons === 2) {
        this.$emit('onContextmenu', e, this.data, this.index)
      }
    },
    onContextmenu (e) {
      e.preventDefault()
      return false
    }
  }
}
</script>

<style lang="less">
.element-item{
  img{
    width: 100%;
    height: 100%;
    display: block;
  }
}
</style>
