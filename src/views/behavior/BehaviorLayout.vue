<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const selectedKeys = computed(() => [route.path])

const menuItems = [
  { key: '/inference/olfaction', label: '嗅觉' },
  { key: '/inference/courage', label: '胆量' },
  { key: '/inference/aggressiveness', label: '凶猛性' },
  { key: '/inference/retrieving', label: '衔取' },
  { key: '/inference/endurance', label: '耐力' },
]

const onMenuClick = ({ key }) => {
  router.push(key)
}
</script>

<template>
  <div class="behavior-layout">
    <!-- 左侧菜单 -->
    <div class="behavior-sidebar">
      <div class="sidebar-header">
        <span class="sidebar-title">犬行为量化分析</span>
      </div>
      <a-menu :selected-keys="selectedKeys" mode="inline" class="behavior-menu" @click="onMenuClick">
        <a-menu-item v-for="item in menuItems" :key="item.key">
          {{ item.label }}
        </a-menu-item>
      </a-menu>
    </div>

    <!-- 右侧内容区 -->
    <div class="behavior-content">
      <router-view />
    </div>
  </div>
</template>

<style scoped lang="scss">
.behavior-layout {
  display: flex;
  height: calc(100vh - 94px);
}

.behavior-sidebar {
  width: 160px;
  flex-shrink: 0;
  background: #ffffff;
  border-right: 1px solid #dcdfe6;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 12px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.sidebar-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.behavior-menu {
  border-right: none !important;
  flex: 1;

  :deep(.ant-menu-item) {
    color: #606266;
    font-size: 14px;
    margin: 2px 6px;
    border-radius: 0;
    height: 40px;
    line-height: 40px;
    padding-left: 0 !important;
    justify-content: center;
    text-align: center;

    &:hover {
      color: #1890ff;
      background: rgba(24, 144, 255, 0.06);
    }

    &::after {
      display: none;
    }
  }

  :deep(.ant-menu-item-selected) {
    color: #1890ff;
    background: rgba(24, 144, 255, 0.1);
    font-weight: 500;
  }
}

.behavior-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

@media (max-width: 768px) {
  .behavior-layout {
    flex-direction: column;
  }

  .behavior-sidebar {
    width: 100%;
  }
}
</style>
