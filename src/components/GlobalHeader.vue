<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useTokenStore, useUserStore } from '@/stores/index.js'
import {
  DatabaseOutlined,
  PlayCircleOutlined,
  LineChartOutlined,
  SettingOutlined,
  AreaChartOutlined,
  ToolOutlined,
} from '@ant-design/icons-vue'

const tokenStore = useTokenStore()
const userStore = useUserStore()
const route = useRoute()
const router = useRouter()

const onMenuClick = (e) => {
  router.push({
    path: e.key,
  })
}

const logout = () => {
  tokenStore.removeToken()
  userStore.removeUser()
  router.replace('/login')
}
</script>

<template>
  <div id="global-header">
    <a-row class="grid-header" align="middle" justify="space-between" :wrap="false">
      <!-- Logo + 导航菜单 -->
      <a-col flex="auto">
        <div class="header-left">
          <!-- Logo区域 -->
          <div class="logo-area" @click="router.push('/')">
            <div class="logo-icon">
              <div class="logo-ring"></div>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                  stroke="#1890ff"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <div class="logo-text">
              <span class="logo-main">本土犬警用性能多模态智能评估系统</span>
            </div>
          </div>

          <!-- 导航菜单 -->
          <nav class="nav-menu">
            <div
              class="nav-item"
              :class="{ active: route.path === '/labels' }"
              @click="router.push('/labels')"
            >
              <DatabaseOutlined class="nav-icon" />
              <span>全部数据集</span>
            </div>
            <div
              class="nav-item"
              :class="{ active: route.path === '/inference-old' }"
              @click="router.push('/inference-old')"
            >
              <AreaChartOutlined class="nav-icon" />
              <span>犬行为量化分析1.0</span>
            </div>
            <div
              class="nav-item"
              :class="{
                active: route.path.startsWith('/inference') && route.path !== '/inference-old',
              }"
              @click="router.push('/inference')"
            >
              <LineChartOutlined class="nav-icon" />
              <span>犬行为量化分析2.0</span>
            </div>
            <div
              class="nav-item"
              :class="{ active: route.path === '/profile' }"
              @click="router.push('/profile')"
            >
              <SettingOutlined class="nav-icon" />
              <span>账号设置</span>
            </div>
            <div
              v-if="userStore?.user?.username === 'dogpose'"
              class="nav-item"
              :class="{ active: route.path.startsWith('/admin') }"
              @click="router.push('/admin/users')"
            >
              <ToolOutlined class="nav-icon" />
              <span>系统管理</span>
            </div>
          </nav>
        </div>
      </a-col>

      <!-- 用户区域 -->
      <a-col flex="280px" class="user-area">
        <div v-if="!userStore.user" class="auth-links">
          <span class="auth-link" @click="router.push('/login')">登录</span>
          <span class="auth-divider">/</span>
          <span class="auth-link" @click="router.push('/register')">注册</span>
        </div>
        <div v-else class="user-info">
          <div class="user-avatar">{{ userStore?.user?.username?.charAt(0)?.toUpperCase() }}</div>
          <span class="user-name" @click="router.push('/profile')">{{
            userStore?.user?.username
          }}</span>
          <a-popconfirm @confirm="logout" ok-text="确定退出" cancel-text="取消">
            <template #description>
              <p style="color: #303133">确定退出登录吗？</p>
            </template>
            <a-button class="logout-btn" type="text" danger size="small">退出</a-button>
          </a-popconfirm>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<style scoped lang="scss">
#global-header {
  background: #ffffff;
  border-bottom: 1px solid #dcdfe6;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  height: 58px;

  .grid-header {
    height: 58px;
    padding: 0 24px;
  }
}

// ---- 左侧区域 ----
.header-left {
  display: flex;
  align-items: center;
  gap: 32px;
  height: 58px;
}

// Logo
.logo-area {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 0 4px;
  border-radius: 10px;
  transition: all 0.25s ease;

  &:hover {
    .logo-main {
      color: #1890ff;
    }
  }
}

.logo-icon {
  position: relative;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  border-radius: 10px;
  border: 1px solid #e4e7ed;

  svg {
    position: relative;
    z-index: 1;
  }
}

.logo-ring {
  display: none;
}

.logo-text {
  display: flex;
  flex-direction: column;
  line-height: 1;
}

.logo-main {
  font-size: 18px;
  font-weight: 700;
  color: #303133;
  letter-spacing: 0.5px;
  transition: color 0.25s ease;
}

.logo-sub {
  font-size: 11px;
  color: #606266;
  letter-spacing: 0.5px;
  margin-top: 3px;
}

// 导航菜单
.nav-menu {
  display: flex;
  align-items: center;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 7px 14px;
  border-radius: 8px;
  cursor: pointer;
  color: #606266;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.2s ease, background 0.2s ease;
  position: relative;
  white-space: nowrap;

  .nav-icon {
    font-size: 14px;
    transition: color 0.2s ease;
  }

  &:hover {
    color: #1890ff;
    background: rgba(24, 144, 255, 0.06);

    .nav-icon {
      color: #1890ff;
    }
  }

  &.active {
    color: #1890ff;
    background: rgba(24, 144, 255, 0.08);

    .nav-icon {
      color: #1890ff;
    }
  }
}

// ---- 用户区域 ----
.user-area {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 8px;
}

.auth-links {
  display: flex;
  align-items: center;
  gap: 6px;
}

.auth-link {
  color: #606266;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.2s;
  padding: 4px 8px;
  border-radius: 6px;

  &:hover {
    color: #1890ff;
    background: rgba(24, 144, 255, 0.06);
  }
}

.auth-divider {
  color: #dcdfe6;
  font-size: 12px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-right: 50px;
}

.user-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #1890ff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.user-name {
  color: #303133;
  font-size: 13px;
  font-weight: 500;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: #1890ff;
  }
}

.logout-btn {
  color: rgba(255, 77, 79, 0.85) !important;
  font-size: 12px !important;
  padding: 2px 8px !important;
  border-radius: 6px !important;
  border: 1px solid rgba(255, 77, 79, 0.25) !important;
  height: 26px !important;

  &:hover {
    color: #ff4d4f !important;
    border-color: rgba(255, 77, 79, 0.5) !important;
    background: rgba(255, 77, 79, 0.06) !important;
  }
}

// Popconfirm 样式修复
:deep(.ant-popover-inner) {
  background: #ffffff !important;
  border: 1px solid #dcdfe6 !important;
  border-radius: 10px !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1) !important;
  min-width: 220px !important;
}

:deep(.ant-popconfirm-inner-content) {
  padding: 16px 18px !important;
}

:deep(.ant-popconfirm-message) {
  padding: 0 0 12px 0 !important;
}

:deep(.ant-popconfirm-message-title) {
  color: #303133 !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  line-height: 1.5 !important;
}

:deep(.ant-popconfirm-description) {
  color: #606266 !important;
  font-size: 12px !important;
  margin-top: 4px !important;
}

:deep(.ant-popconfirm-buttons) {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 4px;

  .ant-btn {
    height: 30px !important;
    font-size: 13px !important;
    border-radius: 6px !important;
  }

  .ant-btn-default {
    background: #ffffff !important;
    border-color: #dcdfe6 !important;
    color: #606266 !important;

    &:hover {
      border-color: #1890ff !important;
      color: #1890ff !important;
      background: #f5f7fa !important;
    }
  }

  .ant-btn-primary {
    background: #ff4d4f !important;
    border: none !important;

    &:hover {
      background: #ff7875 !important;
    }
  }
}

:deep(.ant-popover-arrow-content) {
  background: #ffffff !important;
  border-color: #dcdfe6 !important;
}
</style>
