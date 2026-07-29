<script setup>
import { computed } from 'vue'

const props = defineProps({
  port: {
    type: Number,
    required: true,
  },
})

const iframeSrc = computed(() => {
  const { protocol, hostname } = window.location
  return `${protocol}//${hostname}:${props.port}`
})
</script>

<template>
  <div class="inference-page">
    <iframe :src="iframeSrc" frameborder="0" class="inference-iframe" allow="fullscreen"></iframe>
  </div>
</template>

<style scoped lang="scss">
.inference-page {
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.inference-iframe {
  width: 100%;
  height: 100%;
  min-height: 0;
  border: none;
  display: block;
}
</style>
