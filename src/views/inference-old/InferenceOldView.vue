<script setup>
// 在线推理与分析页面 - 嵌入外部demo_viewer
const iframeSrc = `${window.location.origin}/canbea`
</script>

<template>
  <div id="inference-view">
    <iframe :src="iframeSrc" frameborder="0" class="inference-iframe" allow="fullscreen"></iframe>
  </div>
</template>

<style scoped lang="scss">
#inference-view {
  width: 100%;
  height: calc(100vh - 100px);
  background: #f5f7fa;
}

.inference-iframe {
  width: 100%;
  height: 100%;
  border: none;
}
</style>
