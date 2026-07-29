<script setup>
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  TeamOutlined,
  SearchOutlined,
  PlusOutlined,
  KeyOutlined,
  EditOutlined,
  LockOutlined,
  UnlockOutlined,
} from '@ant-design/icons-vue'
import {
  getUserListService,
  createUserService,
  updateUserPasswordService,
  updateUserUsernameService,
  updateUserStatusService,
} from '@/apis/admin.js'

// 状态管理
const searchUsername = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const userList = ref([])
const loading = ref(false)

// 新建用户模态框
const createModalVisible = ref(false)
const createLoading = ref(false)
const createFormRef = ref()
const createForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
})

// 修改密码模态框
const passwordModalVisible = ref(false)
const passwordLoading = ref(false)
const passwordFormRef = ref()
const passwordForm = reactive({
  userId: null,
  newPassword: '',
  confirmPassword: '',
})

// 修改用户名模态框
const usernameModalVisible = ref(false)
const usernameLoading = ref(false)
const usernameFormRef = ref()
const usernameForm = reactive({
  userId: null,
  newUsername: '',
})

// 用户名校验规则
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

// 密码校验规则
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

const createRules = {
  username: [{ validator: validateUsername, trigger: 'change' }],
  password: [{ validator: validatePassword, trigger: 'change' }],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'change' },
    {
      validator: (_, value) => {
        if (value !== createForm.password) {
          return Promise.reject(new Error('两次输入的密码不一致'))
        }
        return Promise.resolve()
      },
      trigger: 'change',
    },
  ],
}

const passwordRules = {
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

const usernameRules = {
  newUsername: [{ validator: validateUsername, trigger: 'change' }],
}

// 查询用户列表
const fetchUserList = async () => {
  loading.value = true
  try {
    const res = await getUserListService(currentPage.value, pageSize.value, searchUsername.value)
    if (res.data.code === 0) {
      total.value = res.data.data.total
      userList.value = res.data.data.records
    } else {
      message.error(res.data.message)
    }
  } catch (error) {
    message.error('加载用户列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchUserList()
}

const handlePageChange = (page, size) => {
  currentPage.value = page
  pageSize.value = size
  fetchUserList()
}

// 新建用户
const openCreateModal = () => {
  createForm.username = ''
  createForm.password = ''
  createForm.confirmPassword = ''
  createModalVisible.value = true
}

const closeCreateModal = () => {
  createModalVisible.value = false
}

const onCreateUser = async () => {
  try {
    await createFormRef.value.validate()
  } catch (error) {
    return
  }

  createLoading.value = true
  try {
    const res = await createUserService({
      username: createForm.username,
      password: createForm.password,
      confirmPassword: createForm.confirmPassword,
    })
    if (res.data.code === 0) {
      message.success('用户创建成功')
      closeCreateModal()
      fetchUserList()
    } else {
      message.error(res.data.message)
    }
  } catch (error) {
    message.error('用户创建失败')
  } finally {
    createLoading.value = false
  }
}

// 修改密码
const openPasswordModal = (record) => {
  passwordForm.userId = record.id
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  passwordModalVisible.value = true
}

const closePasswordModal = () => {
  passwordModalVisible.value = false
}

const onUpdatePassword = async () => {
  try {
    await passwordFormRef.value.validate()
  } catch (error) {
    return
  }

  passwordLoading.value = true
  try {
    const res = await updateUserPasswordService(passwordForm.userId, {
      newPassword: passwordForm.newPassword,
      confirmPassword: passwordForm.confirmPassword,
    })
    if (res.data.code === 0) {
      message.success('密码修改成功')
      closePasswordModal()
    } else {
      message.error(res.data.message)
    }
  } catch (error) {
    message.error('密码修改失败')
  } finally {
    passwordLoading.value = false
  }
}

// 修改用户名
const openUsernameModal = (record) => {
  usernameForm.userId = record.id
  usernameForm.newUsername = ''
  usernameModalVisible.value = true
}

const closeUsernameModal = () => {
  usernameModalVisible.value = false
}

const onUpdateUsername = async () => {
  try {
    await usernameFormRef.value.validate()
  } catch (error) {
    return
  }

  usernameLoading.value = true
  try {
    const res = await updateUserUsernameService(usernameForm.userId, {
      newUsername: usernameForm.newUsername,
    })
    if (res.data.code === 0) {
      message.success('用户名修改成功')
      closeUsernameModal()
      fetchUserList()
    } else {
      message.error(res.data.message)
    }
  } catch (error) {
    message.error('用户名修改失败')
  } finally {
    usernameLoading.value = false
  }
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString()
}

// 切换用户状态（冻结/解冻）
const onToggleStatus = async (record) => {
  const newStatus = record.status === 0 ? 1 : 0
  const actionText = newStatus === 0 ? '冻结' : '解冻'
  try {
    const res = await updateUserStatusService(record.id, newStatus)
    if (res.data.code === 0) {
      message.success(`${actionText}成功`)
      fetchUserList()
    } else {
      message.error(res.data.message)
    }
  } catch (error) {
    message.error(`${actionText}失败`)
  }
}

onMounted(() => {
  fetchUserList()
})
</script>

<template>
  <div class="user-management-view">
    <!-- 页面标题区 -->
    <div class="page-header">
      <div class="page-title-wrap">
        <TeamOutlined class="page-icon" />
        <div>
          <h1 class="page-title">用户管理</h1>
          <p class="page-desc">管理系统中的所有用户账号</p>
        </div>
      </div>
      <div class="header-stat">
        <span class="stat-num">{{ total }}</span>
        <span class="stat-label">位用户</span>
      </div>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <div class="search-input-wrap">
        <a-input
          v-model:value="searchUsername"
          placeholder="搜索用户名..."
          allow-clear
          @pressEnter="handleSearch"
        >
          <template #prefix><SearchOutlined /></template>
        </a-input>
      </div>
      <a-button type="primary" class="search-btn" @click="handleSearch">搜索</a-button>
      <a-button class="create-btn" @click="openCreateModal"> <PlusOutlined /> 新建用户 </a-button>
    </div>

    <!-- 用户列表表格 -->
    <div class="table-card">
      <a-table
        :columns="[
          { title: '用户ID', dataIndex: 'id', key: 'id', width: 100 },
          { title: '用户名', dataIndex: 'username', key: 'username' },
          {
            title: '创建时间',
            dataIndex: 'createdAt',
            key: 'createdAt',
            customRender: ({ text }) => formatDate(text),
          },
          { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
          { title: '操作', key: 'action', width: 200 },
        ]"
        :data-source="userList"
        :loading="loading"
        :pagination="false"
        :scroll="{ y: 'calc(100vh - 500px)' }"
        row-key="id"
        size="middle"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag v-if="record.status === 0" color="error">已冻结</a-tag>
            <a-tag v-else color="success">正常</a-tag>
          </template>
          <template v-if="column.key === 'action'">
            <a-button
              v-if="record.username !== 'dogpose'"
              type="link"
              size="small"
              @click="openUsernameModal(record)"
            >
              <EditOutlined /> 修改用户名
            </a-button>
            <a-button type="link" size="small" @click="openPasswordModal(record)">
              <KeyOutlined /> 修改密码
            </a-button>
            <a-button
              v-if="record.username !== 'dogpose'"
              type="link"
              size="small"
              @click="onToggleStatus(record)"
            >
              <LockOutlined v-if="record.status === 1" />
              <UnlockOutlined v-else />
              {{ record.status === 1 ? '冻结' : '解冻' }}
            </a-button>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 分页 -->
    <div class="pagination">
      <a-pagination
        v-model:current="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :show-size-changer="true"
        :page-size-options="['10', '20', '50', '100']"
        :show-total="(total) => `共 ${total} 条记录`"
        @change="handlePageChange"
        @showSizeChange="handlePageChange"
      />
    </div>

    <!-- 新建用户模态框 -->
    <a-modal
      v-model:visible="createModalVisible"
      title="新建用户"
      width="420px"
      :confirm-loading="createLoading"
      ok-text="创建"
      cancel-text="取消"
      @ok="onCreateUser"
      @cancel="closeCreateModal"
    >
      <a-form ref="createFormRef" :model="createForm" :rules="createRules" layout="vertical">
        <a-form-item name="username" label="用户名">
          <a-input
            v-model:value="createForm.username"
            placeholder="请输入用户名（1-50个字符）"
            size="large"
            @blur="(e) => (createForm.username = e.target.value.trim())"
          />
        </a-form-item>
        <a-form-item name="password" label="密码">
          <a-input-password
            v-model:value="createForm.password"
            placeholder="请输入密码（6-18个字符）"
            size="large"
          />
        </a-form-item>
        <a-form-item name="confirmPassword" label="确认密码">
          <a-input-password
            v-model:value="createForm.confirmPassword"
            placeholder="请再次输入密码"
            size="large"
            @keydown.enter="onCreateUser"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 修改密码模态框 -->
    <a-modal
      v-model:visible="passwordModalVisible"
      title="修改用户密码"
      width="420px"
      :confirm-loading="passwordLoading"
      ok-text="保存"
      cancel-text="取消"
      @ok="onUpdatePassword"
      @cancel="closePasswordModal"
    >
      <a-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" layout="vertical">
        <a-form-item name="newPassword" label="新密码">
          <a-input-password
            v-model:value="passwordForm.newPassword"
            placeholder="请输入新密码（6-18个字符）"
            size="large"
          />
        </a-form-item>
        <a-form-item name="confirmPassword" label="确认新密码">
          <a-input-password
            v-model:value="passwordForm.confirmPassword"
            placeholder="请再次输入新密码"
            size="large"
            @keydown.enter="onUpdatePassword"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 修改用户名模态框 -->
    <a-modal
      v-model:visible="usernameModalVisible"
      title="修改用户名"
      width="420px"
      :confirm-loading="usernameLoading"
      ok-text="保存"
      cancel-text="取消"
      @ok="onUpdateUsername"
      @cancel="closeUsernameModal"
    >
      <a-form ref="usernameFormRef" :model="usernameForm" :rules="usernameRules" layout="vertical">
        <a-form-item name="newUsername" label="新用户名">
          <a-input
            v-model:value="usernameForm.newUsername"
            placeholder="请输入新用户名（1-50个字符）"
            size="large"
            @blur="(e) => (usernameForm.newUsername = e.target.value.trim())"
            @keydown.enter="onUpdateUsername"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<style scoped lang="scss">
.user-management-view {
  padding: 8px 4px 20px;
  max-width: 1280px;
  margin: 0 auto;
  min-height: calc(100vh - 130px);
  display: flex;
  flex-direction: column;
}

// 页面标题
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
  padding: 20px 24px;
  background: #ffffff;
  border: 1px solid #dcdfe6;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
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

.header-stat {
  text-align: right;

  .stat-num {
    display: block;
    font-size: 28px;
    font-weight: 700;
    color: #1890ff;
    line-height: 1;
  }

  .stat-label {
    font-size: 12px;
    color: #909399;
  }
}

// 搜索栏
.search-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  padding: 16px 20px;
  background: #ffffff;
  border: 1px solid #dcdfe6;
  border-radius: 12px;
}

.search-input-wrap {
  flex: 1;
  min-width: 220px;

  :deep(.ant-input-affix-wrapper) {
    background: #ffffff !important;
    border-color: #dcdfe6 !important;
    border-radius: 8px !important;
    color: #303133 !important;
    height: 36px;

    input {
      background: transparent !important;
      color: #303133 !important;
      border: none !important;
      box-shadow: none !important;
      &::placeholder {
        color: #c0c4cc !important;
      }
    }
    .anticon {
      color: #909399 !important;
    }

    &:hover,
    &.ant-input-affix-wrapper-focused {
      border-color: #1890ff !important;
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.08) !important;
    }
  }
}

.search-btn {
  height: 36px !important;
  border-radius: 8px !important;
  background: #1890ff !important;
  border: none !important;
}

.create-btn {
  height: 36px !important;
  border-radius: 8px !important;
  border-color: #dcdfe6 !important;
  color: #606266 !important;
  font-size: 13px;

  &:hover {
    border-color: #1890ff !important;
    color: #1890ff !important;
  }
}

// 表格卡片
.table-card {
  background: #ffffff;
  border: 1px solid #dcdfe6;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  flex: 1;
  overflow: hidden;
  min-height: 300px;

  :deep(.ant-table) {
    color: #303133;
  }

  :deep(.ant-table-thead > tr > th) {
    background: #f5f7fa;
    color: #606266;
    font-weight: 600;
    border-bottom: 1px solid #ebeef5;
  }

  :deep(.ant-table-tbody > tr > td) {
    border-bottom: 1px solid #f0f0f0;
  }

  :deep(.ant-table-tbody > tr:hover > td) {
    background: #f5f7fa;
  }
}

// 分页
.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: auto;
  padding: 16px 20px;
  background: #ffffff;
  border: 1px solid #dcdfe6;
  border-radius: 10px;

  :deep(.ant-pagination-total-text) {
    color: #909399;
    font-size: 13px;
  }
}

// 模态框表单
:deep(.ant-modal-header) {
  border-bottom: 1px solid #f0f0f0;
}

:deep(.ant-modal-title) {
  color: #303133;
  font-weight: 600;
}

:deep(.ant-form-item-label) {
  label {
    color: #606266;
    font-size: 13px;
  }
}

:deep(.ant-input-affix-wrapper) {
  background: #ffffff !important;
  border: 1px solid #dcdfe6 !important;
  border-radius: 10px !important;
  color: #303133 !important;
  height: 46px;

  &:hover,
  &.ant-input-affix-wrapper-focused {
    border-color: #1890ff !important;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1) !important;
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
}

:deep(.ant-form-item-explain-error) {
  font-size: 12px;
  color: #ff4d4f !important;
  margin-top: 4px;
}

@media (max-width: 768px) {
  .search-bar {
    flex-direction: column;
    align-items: stretch;
  }
  .search-input-wrap {
    min-width: unset;
  }
}
</style>
