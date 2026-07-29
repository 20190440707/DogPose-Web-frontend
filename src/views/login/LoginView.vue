<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { userLoginService } from '@/apis/auth.js'
import { message } from 'ant-design-vue'
import { useTokenStore, useUserStore } from '@/stores/index.js'
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'

const tokenStore = useTokenStore()
const userStore = useUserStore()
const router = useRouter()

const form = reactive({ username: '', password: '' })
const onRegister = () => {
  router.push('/register')
}
const onLogin = () => {
  if (form.username === '' || form.password === '') {
    message.error('用户名或密码不能为空')
    return
  }
  requestLogin()
}

const loading = ref(false)
const requestLogin = async () => {
  loading.value = true
  const res = await userLoginService(form)
  loading.value = false

  if (res?.data?.code === 0) {
    tokenStore.setToken('Bearer ' + res.data.data.token)
    userStore.setUser(res.data.data)
    await router.replace('/')
    message.success('登录成功')
  } else message.error(res?.data?.message)
}
</script>

<template>
  <div id="login-view">
    <a-spin :spinning="loading" tip="登录中...">
      <div class="form-wrapper">
        <!-- 系统标题 -->
        <div class="brand">
          <div class="brand-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="#1890ff"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <div class="brand-text">
            <div class="brand-name">本土犬警用性能<br />多模态智能评估系统</div>
          </div>
        </div>

        <h2 class="login-heading">欢迎登录</h2>

        <a-form class="form" :model="form">
          <a-form-item>
            <a-input
              v-model:value="form.username"
              placeholder="请输入用户名"
              size="large"
              @pressEnter="onLogin"
            >
              <template #prefix>
                <UserOutlined class="input-icon" />
              </template>
            </a-input>
          </a-form-item>
          <a-form-item>
            <a-input-password
              v-model:value="form.password"
              placeholder="请输入密码"
              size="large"
              @keydown.enter="onLogin"
            >
              <template #prefix>
                <LockOutlined class="input-icon" />
              </template>
            </a-input-password>
          </a-form-item>
          <a-form-item>
            <button class="login-btn" :disabled="loading" @click="onLogin">登录</button>
          </a-form-item>
          <div class="form-footer">
            <span class="register-link" @click="onRegister">没有账号？立即注册</span>
          </div>
        </a-form>
      </div>
    </a-spin>
  </div>
</template>

<style scoped lang="scss">
#login-view {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f5f7fa;
  overflow: hidden;
}

// 卡片
.form-wrapper {
  position: relative;
  z-index: 10;
  width: 420px;
  background: #ffffff;
  border: 1px solid #dcdfe6;
  border-radius: 12px;
  padding: 40px 40px 32px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

// 品牌区域
.brand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin-bottom: 28px;
}

.brand-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: #f5f7fa;
  border: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1;
}

.brand-name {
  font-size: 22px;
  font-weight: 700;
  color: #303133;
  letter-spacing: 1px;
}

.brand-sub {
  font-size: 12px;
  color: #606266;
  letter-spacing: 1px;
  margin-top: 4px;
}

.login-heading {
  text-align: center;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 6px;
}

.login-desc {
  text-align: center;
  font-size: 14px;
  color: #909399;
  margin: 0 0 28px;
}

.form {
  :deep(.ant-form-item) {
    margin-bottom: 18px;
  }

  :deep(.ant-input-affix-wrapper) {
    background: #ffffff !important;
    border: 1px solid #dcdfe6 !important;
    border-radius: 10px !important;
    color: #303133 !important;
    height: 46px;
    transition: all 0.3s ease;

    &:hover,
    &.ant-input-affix-wrapper-focused {
      border-color: #1890ff !important;
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.12) !important;
      background: #ffffff !important;
    }

    input {
      background: transparent !important;
      color: #303133 !important;
      font-size: 14px;
      border: none !important;
      box-shadow: none !important;

      &::placeholder {
        color: #c0c4cc !important;
      }
    }

    .anticon {
      color: #909399 !important;
      font-size: 15px;
    }
  }
}

.input-icon {
  color: #909399;
}

// 登录按钮
.login-btn {
  width: 100%;
  height: 46px;
  border: none;
  border-radius: 10px;
  background: #1890ff;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 2px;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover:not(:disabled) {
    background: #40a9ff;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

// 底部
.form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
}

.register-link {
  color: #1890ff;
  font-size: 13px;
  cursor: pointer;
  font-weight: 500;
  transition: color 0.2s;

  &:hover {
    color: #40a9ff;
    text-decoration: underline;
  }
}
</style>
