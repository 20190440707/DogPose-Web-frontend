<script setup>
import GlobalHeader from '@/components/GlobalHeader.vue'
</script>

<template>
  <div id="basic-layout">
    <div class="header">
      <GlobalHeader />
    </div>
    <div class="content">
      <router-view />
    </div>
    <div class="footer">
      <div class="footer-content">
        <span class="footer-dot"></span>
        本土犬警用性能多模态智能评估系统
        <span class="footer-dot"></span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
#basic-layout {
  position: relative;
  min-height: 100vh;
  background: #f5f7fa;
  overflow: hidden;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  width: 100%;
}

.content {
  position: relative;
  z-index: 10;
  margin-top: 58px;
  margin-bottom: 36px;
  min-height: calc(100vh - 94px);
  box-sizing: border-box;
}

.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: 36px;
  background: #ffffff;
  border-top: 1px solid #dcdfe6;
  display: flex;
  align-items: center;
  justify-content: center;

  .footer-content {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #606266;
    font-size: 12px;
    letter-spacing: 1px;
  }

  .footer-dot {
    display: none;
  }
}
</style>
