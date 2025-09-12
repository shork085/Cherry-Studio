<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  console.log('Vue数据可视化应用已挂载')
})
</script>

<style>
#app {
  height: 100vh;
  width: 100%;
  overflow: hidden;
}

* {
  box-sizing: border-box;
}
</style>
