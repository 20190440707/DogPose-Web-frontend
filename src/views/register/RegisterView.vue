<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { userRegisterService } from '@/apis/auth.js'
import { useTokenStore, useUserStore } from '@/stores/index.js'
import { UserOutlined, LockOutlined, KeyOutlined } from '@ant-design/icons-vue'

const tokenStore = useTokenStore()
const userStore = useUserStore()
const router = useRouter()

const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  inviteCode: '',
})
const rules = {
  username: [
    { required: true, message: '用户名不能为空', trigger: 'change' },
    {
      validator: (_, value) => {
        if (!value || value.trim() === '') {
          return Promise.reject(new Error('用户名不能为空'))
        }
        if (value.length > 50) {
          return Promise.reject(new Error('用户名长度需要为 1-50 个字符'))
        }
        if (!/^\S+$/.test(value)) {
          return Promise.reject(new Error('用户名不能包含空白字符'))
        }
        return Promise.resolve()
      },
      trigger: 'change',
    },
  ],
  password: [
    { required: true, message: '密码不能为空', trigger: 'change' },
    {
      validator: (_, value) => {
        if (value.length < 6 || value.length > 18) {
          return Promise.reject(new Error('密码长度需要为 6-18 个字符'))
        }
        if (!/^\S+$/.test(value)) {
          return Promise.reject(new Error('密码不能包含空白字符'))
        }
        return Promise.resolve()
      },
      trigger: 'change',
    },
  ],
  confirmPassword: [
    { required: true, message: '确认密码不能为空', trigger: 'change' },
    {
      validator: (_, value) => {
        if (value !== form.password) {
          return Promise.reject(new Error('两次输入的密码不一致'))
        }
        return Promise.resolve()
      },
      trigger: 'change',
    },
  ],
  inviteCode: [
    { required: true, message: '注册码不能为空', trigger: 'change' },
    {
      validator: (_, value) => {
        if (!value || value.trim() === '') {
          return Promise.reject(new Error('注册码不能为空'))
        }
        return Promise.resolve()
      },
      trigger: 'change',
    },
  ],
}

const loading = ref(false)
const formRef = ref()
const tip = ref('注册中')
const onRegister = async () => {
  try {
    await formRef.value.validate()
  } catch (error) {
    return
  }

  loading.value = true
  tip.value = '注册中'

  const res = await userRegisterService(form)

  if (res.data.code === 0) {
    tip.value = '登录中'
    tokenStore.setToken('Bearer ' + res.data.data.token)
    userStore.setUser(res.data.data)
    await router.replace('/')
    message.success('注册成功')
  } else message.error(res.data.message)

  loading.value = false
}
</script>

<template>
  <div id="register-view">
    <a-spin :spinning="loading" :tip="tip">
      <div class="form-wrapper">
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

        <h2 class="register-heading">创建账号</h2>

        <a-form class="form" ref="formRef" :model="form" :rules="rules">
          <a-form-item name="username">
            <a-input
              v-model:value="form.username"
              placeholder="请输入用户名（1-50个字符）"
              size="large"
              @blur="(e) => (form.username = e.target.value.trim())"
            >
              <template #prefix><UserOutlined /></template>
            </a-input>
          </a-form-item>
          <a-form-item name="password">
            <a-input-password
              v-model:value="form.password"
              placeholder="设置密码（6-18位）"
              size="large"
            >
              <template #prefix><LockOutlined /></template>
            </a-input-password>
          </a-form-item>
          <a-form-item name="confirmPassword">
            <a-input-password
              v-model:value="form.confirmPassword"
              placeholder="确认密码"
              size="large"
            >
              <template #prefix><LockOutlined /></template>
            </a-input-password>
          </a-form-item>
          <a-form-item name="inviteCode">
            <a-input
              v-model:value="form.inviteCode"
              placeholder="请输入注册码"
              size="large"
              @blur="(e) => (form.inviteCode = e.target.value.trim())"
              @keydown.enter="onRegister"
            >
              <template #prefix><KeyOutlined /></template>
            </a-input>
          </a-form-item>
          <a-form-item>
            <button class="register-btn" :disabled="loading" @click="onRegister">注册</button>
          </a-form-item>
          <div class="form-footer">
            <span class="login-link" @click="router.replace('/login')">
              已有账号？<em>立即登录</em>
            </span>
          </div>
        </a-form>
      </div>
    </a-spin>
  </div>
</template>

<style scoped lang="scss">
#register-view {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f5f7fa;
  overflow: hidden;
}

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

.brand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin-bottom: 24px;
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

.register-heading {
  text-align: center;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 6px;
}

.register-desc {
  text-align: center;
  font-size: 14px;
  color: #909399;
  margin: 0 0 24px;
}

.form {
  :deep(.ant-form-item) {
    margin-bottom: 16px;
  }

  :deep(.ant-form-item-explain-error) {
    font-size: 12px;
    color: #ff4d4f !important;
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

.register-btn {
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

.form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
}

.login-link {
  color: #606266;
  font-size: 13px;
  cursor: pointer;

  em {
    font-style: normal;
    color: #1890ff;
    font-weight: 500;
    transition: color 0.2s;

    &:hover {
      color: #40a9ff;
      text-decoration: underline;
    }
  }
}
</style>
