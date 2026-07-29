<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/index.js'
import { TeamOutlined, KeyOutlined, ToolOutlined, FolderOutlined } from '@ant-design/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const selectedKeys = computed(() => [route.path])

const menuItems = [
  { key: '/admin/users', label: '用户管理', icon: TeamOutlined },
  { key: '/admin/invite-code', label: '注册码设置', icon: KeyOutlined },
  { key: '/admin/data-directory', label: '数据文件夹配置', icon: FolderOutlined },
]

const onMenuClick = ({ key }) => {
  router.push(key)
}
</script>

<template>
  <div v-if="userStore?.user?.username === 'dogpose'" class="admin-layout">
    <!-- 左侧菜单 -->
    <div class="admin-sidebar">
      <div class="sidebar-header">
        <ToolOutlined class="sidebar-icon" />
        <span class="sidebar-title">系统管理</span>
      </div>
      <a-menu :selected-keys="selectedKeys" mode="inline" class="admin-menu" @click="onMenuClick">
        <a-menu-item v-for="item in menuItems" :key="item.key">
          <template #icon>
            <component :is="item.icon" />
          </template>
          {{ item.label }}
        </a-menu-item>
      </a-menu>
    </div>

    <!-- 右侧内容区 -->
    <div class="admin-content">
      <router-view />
    </div>
  </div>
  <div v-else class="no-permission">
    <div class="no-permission-card">
      <h2>无权限访问</h2>
      <p>您没有权限访问系统管理页面</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.admin-layout {
  display: flex;
  gap: 20px;
  padding: 8px 4px 20px;
  max-width: 1280px;
  margin: 0 auto;
  height: calc(100vh - 130px);
}

.admin-sidebar {
  width: 220px;
  flex-shrink: 0;
  background: #ffffff;
  border: 1px solid #dcdfe6;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.sidebar-icon {
  font-size: 18px;
  color: #1890ff;
}

.sidebar-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.admin-menu {
  border-right: none !important;

  :deep(.ant-menu-item) {
    color: #606266;
    font-size: 14px;
    margin: 4px 8px;
    border-radius: 8px;
    height: 42px;
    line-height: 42px;

    .anticon {
      font-size: 15px;
    }

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

    .anticon {
      color: #1890ff;
    }
  }
}

.admin-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.no-permission {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 130px);
}

.no-permission-card {
  background: #ffffff;
  border: 1px solid #dcdfe6;
  border-radius: 12px;
  padding: 48px 64px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  h2 {
    margin: 0 0 8px;
    font-size: 20px;
    color: #303133;
  }

  p {
    margin: 0;
    font-size: 14px;
    color: #909399;
  }
}

@media (max-width: 768px) {
  .admin-layout {
    flex-direction: column;
  }

  .admin-sidebar {
    width: 100%;
  }
}
</style>
