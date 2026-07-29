<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { userUpdateUsernameService, userUpdatePasswordService } from '@/apis/auth.js'
import { useUserStore } from '@/stores/index.js'
import { UserOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons-vue'

const userStore = useUserStore()
const router = useRouter()

// 用户名表单
const usernameForm = reactive({
  newUsername: '',
})

// 密码表单
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// 用户名校验规则（与后端保持一致）
const validateUsername = (_, value) => {
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
}

// 密码校验规则（与后端保持一致）
const validatePassword = (_, value) => {
  if (!value || value.trim() === '') {
    return Promise.reject(new Error('密码不能为空'))
  }
  if (value.length < 6 || value.length > 18) {
    return Promise.reject(new Error('密码长度需要为 6-18 个字符'))
  }
  if (!/^\S+$/.test(value)) {
    return Promise.reject(new Error('密码不能包含空白字符'))
  }
  return Promise.resolve()
}

const usernameRules = {
  newUsername: [{ validator: validateUsername, trigger: 'change' }],
}

const passwordRules = {
  oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'change' }],
  newPassword: [{ validator: validatePassword, trigger: 'change' }],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'change' },
    {
      validator: (_, value) => {
        if (value !== passwordForm.newPassword) {
          return Promise.reject(new Error('两次输入的密码不一致'))
        }
        return Promise.resolve()
      },
      trigger: 'change',
    },
  ],
}

const usernameFormRef = ref()
const passwordFormRef = ref()
const usernameLoading = ref(false)
const passwordLoading = ref(false)

// 修改用户名
const onUpdateUsername = async () => {
  try {
    await usernameFormRef.value.validate()
  } catch (error) {
    return
  }

  usernameLoading.value = true

  const res = await userUpdateUsernameService(usernameForm)

  if (res.data.code === 0) {
    // 更新本地存储的用户信息
    const updatedUser = { ...userStore.user, username: res.data.data.username }
    userStore.setUser(updatedUser)
    message.success('用户名修改成功')
    usernameForm.newUsername = ''
  } else {
    message.error(res.data.message)
  }

  usernameLoading.value = false
}

// 修改密码
const onUpdatePassword = async () => {
  try {
    await passwordFormRef.value.validate()
  } catch (error) {
    return
  }

  passwordLoading.value = true

  const res = await userUpdatePasswordService(passwordForm)

  if (res.data.code === 0) {
    message.success('密码修改成功')
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } else {
    message.error(res.data.message)
  }

  passwordLoading.value = false
}

// 返回首页
const goBack = () => {
  router.push('/')
}
</script>

<template>
  <div id="profile-view">
    <div class="profile-wrapper">
      <div class="profile-content">
        <!-- 左侧：当前用户信息 -->
        <div class="user-info-card">
          <div class="user-avatar-large">
            {{ userStore?.user?.username?.charAt(0)?.toUpperCase() }}
          </div>
          <div class="user-details">
            <div class="detail-item">
              <span class="detail-label">当前用户名</span>
              <span class="detail-value">{{ userStore?.user?.username }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">用户ID</span>
              <span class="detail-value id">{{ userStore?.user?.id }}</span>
            </div>
          </div>
        </div>

        <!-- 右侧：修改表单 -->
        <div class="forms-section">
          <!-- 修改用户名 -->
          <div v-if="userStore?.user?.username !== 'dogpose'" class="form-card">
            <div class="form-header">
              <div class="form-icon">
                <UserOutlined />
              </div>
              <div class="form-title">
                <h3>修改用户名</h3>
                <p>更改您在系统中的显示名称</p>
              </div>
            </div>

            <a-form
              class="form"
              ref="usernameFormRef"
              :model="usernameForm"
              :rules="usernameRules"
              layout="vertical"
            >
              <a-form-item name="newUsername" label="新用户名">
                <a-input
                  v-model:value="usernameForm.newUsername"
                  placeholder="请输入新用户名（1-50个字符）"
                  size="large"
                  @blur="(e) => (usernameForm.newUsername = e.target.value.trim())"
                >
                  <template #prefix><UserOutlined /></template>
                </a-input>
              </a-form-item>
              <a-form-item>
                <button class="submit-btn" :disabled="usernameLoading" @click="onUpdateUsername">
                  <a-spin v-if="usernameLoading" size="small" />
                  <span v-else>保存修改</span>
                </button>
              </a-form-item>
            </a-form>
          </div>

          <!-- 修改密码 -->
          <div class="form-card">
            <div class="form-header">
              <div class="form-icon">
                <SafetyOutlined />
              </div>
              <div class="form-title">
                <h3>修改密码</h3>
                <p>定期更换密码可以保护账号安全</p>
              </div>
            </div>

            <a-form
              class="form"
              ref="passwordFormRef"
              :model="passwordForm"
              :rules="passwordRules"
              layout="vertical"
            >
              <a-form-item name="oldPassword" label="当前密码">
                <a-input-password
                  v-model:value="passwordForm.oldPassword"
                  placeholder="请输入当前密码"
                  size="large"
                >
                  <template #prefix><LockOutlined /></template>
                </a-input-password>
              </a-form-item>
              <a-form-item name="newPassword" label="新密码">
                <a-input-password
                  v-model:value="passwordForm.newPassword"
                  placeholder="请输入新密码（6-18个字符）"
                  size="large"
                >
                  <template #prefix><LockOutlined /></template>
                </a-input-password>
              </a-form-item>
              <a-form-item name="confirmPassword" label="确认新密码">
                <a-input-password
                  v-model:value="passwordForm.confirmPassword"
                  placeholder="请再次输入新密码"
                  size="large"
                  @keydown.enter="onUpdatePassword"
                >
                  <template #prefix><LockOutlined /></template>
                </a-input-password>
              </a-form-item>
              <a-form-item>
                <button
                  class="submit-btn blue"
                  :disabled="passwordLoading"
                  @click="onUpdatePassword"
                >
                  <a-spin v-if="passwordLoading" size="small" />
                  <span v-else>修改密码</span>
                </button>
              </a-form-item>
            </a-form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
#profile-view {
  min-height: calc(100vh - 94px);
  background: #f5f7fa;
  padding: 24px;
}

.profile-wrapper {
  max-width: 1200px;
  margin: 0 auto;
}

// 内容区域
.profile-content {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 24px;
}

// 左侧用户卡片
.user-info-card {
  position: relative;
  background: #ffffff;
  border: 1px solid #dcdfe6;
  border-radius: 16px;
  padding: 32px 24px;
  height: fit-content;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.user-avatar-large {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #1890ff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 24px;
}

.user-details {
  width: 100%;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px 0;
  border-bottom: 1px solid #ebeef5;

  &:last-child {
    border-bottom: none;
  }
}

.detail-label {
  font-size: 12px;
  color: #909399;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.detail-value {
  font-size: 15px;
  color: #303133;
  font-weight: 500;

  &.id {
    font-family: 'Consolas', monospace;
    color: #606266;
    font-size: 13px;
  }
}

// 右侧表单区域
.forms-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-card {
  position: relative;
  background: #ffffff;
  border: 1px solid #dcdfe6;
  border-radius: 12px;
  padding: 28px;
}

.form-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.form-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: #f5f7fa;
  border: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #606266;
  font-size: 22px;

  &.blue {
    background: #f5f7fa;
    border-color: #e4e7ed;
    color: #606266;
  }
}

.form-title {
  h3 {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 4px 0;
  }

  p {
    font-size: 13px;
    color: #909399;
    margin: 0;
  }
}

// 表单样式
.form {
  :deep(.ant-form-item-label) {
    label {
      color: #606266;
      font-size: 13px;
    }
  }

  :deep(.ant-form-item) {
    margin-bottom: 20px;

    &:last-child {
      margin-bottom: 0;
      margin-top: 8px;
    }
  }

  :deep(.ant-form-item-explain-error) {
    font-size: 12px;
    color: #ff4d4f !important;
    margin-top: 4px;
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
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1) !important;
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

.submit-btn {
  width: 100%;
  height: 46px;
  border: none;
  border-radius: 10px;
  background: #1890ff;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 1px;
  cursor: pointer;
  transition: background 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover:not(:disabled) {
    background: #40a9ff;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &.blue {
    background: #1890ff;

    &:hover:not(:disabled) {
      background: #40a9ff;
    }
  }
}

// 响应式
@media (max-width: 900px) {
  .profile-content {
    grid-template-columns: 1fr;
  }

  .user-info-card {
    flex-direction: row;
    gap: 24px;
    align-items: center;

    .user-avatar-large {
      margin-bottom: 0;
    }

    .user-details {
      flex: 1;
    }
  }
}
</style>
