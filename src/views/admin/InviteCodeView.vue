<script setup>
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { KeyOutlined, SafetyOutlined } from '@ant-design/icons-vue'
import { getInviteCodeService, updateInviteCodeService } from '@/apis/admin.js'

const currentCode = ref('')
const newCode = ref('')
const loading = ref(false)
const saving = ref(false)

const fetchInviteCode = async () => {
  loading.value = true
  try {
    const res = await getInviteCodeService()
    if (res.data.code === 0) {
      currentCode.value = res.data.data || ''
    } else {
      message.error(res.data.message)
    }
  } catch (error) {
    message.error('获取注册码失败')
  } finally {
    loading.value = false
  }
}

const onSave = async () => {
  const code = newCode.value.trim()
  if (!code) {
    message.error('注册码不能为空')
    return
  }

  saving.value = true
  try {
    const res = await updateInviteCodeService(code)
    if (res.data.code === 0) {
      message.success('注册码修改成功')
      currentCode.value = code
      newCode.value = ''
    } else {
      message.error(res.data.message)
    }
  } catch (error) {
    message.error('注册码修改失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchInviteCode()
})
</script>

<template>
  <div class="invite-code-view">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="page-title-wrap">
        <KeyOutlined class="page-icon" />
        <div>
          <h1 class="page-title">注册码设置</h1>
          <p class="page-desc">管理系统用户注册所需的注册码</p>
        </div>
      </div>
    </div>

    <!-- 当前注册码卡片 -->
    <div class="info-card">
      <div class="info-label">
        <SafetyOutlined class="info-icon" />
        当前注册码
      </div>
      <div class="code-display">
        <span v-if="loading" class="code-placeholder">加载中...</span>
        <span v-else-if="currentCode" class="code-text">{{ currentCode }}</span>
        <span v-else class="code-empty">未设置</span>
      </div>
    </div>

    <!-- 修改注册码 -->
    <div class="edit-card">
      <div class="edit-title">修改注册码</div>
      <div class="edit-form">
        <a-input
          v-model:value="newCode"
          placeholder="请输入新的注册码"
          size="large"
          :max-length="128"
          @pressEnter="onSave"
        />
        <a-button
          type="primary"
          size="large"
          :loading="saving"
          @click="onSave"
        >
          保存
        </a-button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.invite-code-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: #ffffff;
  border: 1px solid #dcdfe6;
  border-radius: 14px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.page-title-wrap {
  display: flex;
  align-items: center;
  gap: 14px;
}

.page-icon {
  font-size: 28px;
  color: #1890ff;
}

.page-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #303133;
}

.page-desc {
  margin: 4px 0 0;
  font-size: 13px;
  color: #909399;
}

.info-card {
  background: #ffffff;
  border: 1px solid #dcdfe6;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.info-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #606266;
  margin-bottom: 12px;
}

.info-icon {
  font-size: 16px;
  color: #1890ff;
}

.code-display {
  padding: 16px 20px;
  background: #f5f7fa;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.code-text {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  letter-spacing: 1px;
  font-family: 'Courier New', monospace;
}

.code-placeholder {
  font-size: 14px;
  color: #909399;
}

.code-empty {
  font-size: 14px;
  color: #c0c4cc;
  font-style: italic;
}

.edit-card {
  background: #ffffff;
  border: 1px solid #dcdfe6;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.edit-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
}

.edit-form {
  display: flex;
  gap: 12px;
  align-items: center;

  .ant-input {
    flex: 1;
    height: 46px;
    border-radius: 10px;
    border-color: #dcdfe6;
    color: #303133;
    font-size: 14px;

    &::placeholder {
      color: #c0c4cc;
    }

    &:hover,
    &:focus {
      border-color: #1890ff;
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
    }
  }

  .ant-btn {
    height: 46px;
    border-radius: 10px;
    background: #1890ff;
    border: none;
    font-size: 15px;
    font-weight: 500;
    padding: 0 28px;

    &:hover {
      background: #40a9ff;
    }
  }
}

@media (max-width: 768px) {
  .edit-form {
    flex-direction: column;
    align-items: stretch;

    .ant-btn {
      width: 100%;
    }
  }
}
</style>
