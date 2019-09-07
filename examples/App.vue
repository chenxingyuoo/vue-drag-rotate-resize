<template>
  <div id="app">
    <stage></stage>
  </div>
</template>

<script>
import stage from './components/stage.vue'
export default {
  components: {
    stage
  }
}
</script>

<style>
*{
  margin: 0;
  box-sizing: border-box;
}
html,body,#app{
  width: 100%;
  height: 100%;
}
</style>
