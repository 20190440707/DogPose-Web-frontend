<script setup>
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { FolderOutlined, FileOutlined, FolderOpenOutlined, SaveOutlined } from '@ant-design/icons-vue'
import {
  getDataDirectoryService,
  updateDataDirectoryService,
  listFileSystemService,
} from '@/apis/admin.js'

const currentPath = ref('')
const selectedPath = ref('')
const treeData = ref([])
const expandedKeys = ref([])
const loading = ref(false)
const saving = ref(false)
const treeLoading = ref(false)

const fetchDataDirectory = async () => {
  loading.value = true
  try {
    const res = await getDataDirectoryService()
    if (res.data.code === 0) {
      currentPath.value = res.data.data || ''
    } else {
      message.error(res.data.message)
    }
  } catch (error) {
    message.error('获取数据文件夹配置失败')
  } finally {
    loading.value = false
  }
}

const onLoadData = (treeNode) => {
  return new Promise((resolve) => {
    if (treeNode.dataRef.children) {
      resolve()
      return
    }
    listFileSystemService(treeNode.dataRef.key)
      .then((res) => {
        if (res.data.code === 0) {
          const children = (res.data.data || []).map((item) => ({
            ...item,
            title: item.title || item.key,
          }))
          treeNode.dataRef.children = children
          treeData.value = [...treeData.value]
        } else {
          message.error(res.data.message)
        }
        resolve()
      })
      .catch(() => {
        message.error('加载目录失败')
        resolve()
      })
  })
}

const onSelect = (selectedKeys, info) => {
  if (selectedKeys.length > 0) {
    selectedPath.value = selectedKeys[0]
  } else {
    selectedPath.value = ''
  }
}

const onSave = async () => {
  const path = selectedPath.value
  saving.value = true
  try {
    const res = await updateDataDirectoryService(path)
    if (res.data.code === 0) {
      message.success('数据文件夹配置保存成功')
      currentPath.value = path
    } else {
      message.error(res.data.message)
    }
  } catch (error) {
    message.error('保存失败')
  } finally {
    saving.value = false
  }
}

const initRoot = async () => {
  treeLoading.value = true
  try {
    const res = await listFileSystemService('/')
    if (res.data.code === 0) {
      treeData.value = [
        {
          title: '/',
          key: '/',
          path: '/',
          directory: true,
          isLeaf: false,
          children: (res.data.data || []).map((item) => ({
            ...item,
            title: item.title || item.key,
          })),
        },
      ]
      expandedKeys.value = ['/']
    } else {
      message.error(res.data.message)
    }
  } catch (error) {
    message.error('加载根目录失败')
  } finally {
    treeLoading.value = false
  }
}

onMounted(() => {
  fetchDataDirectory()
  initRoot()
})
</script>

<template>
  <div class="data-directory-view">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="page-title-wrap">
        <FolderOpenOutlined class="page-icon" />
        <div>
          <h1 class="page-title">数据文件夹配置</h1>
          <p class="page-desc">配置服务器数据文件夹路径，用于后续功能的数据存储定位</p>
        </div>
      </div>
    </div>

    <!-- 当前路径卡片 -->
    <div class="info-card">
      <div class="info-label">
        <FolderOutlined class="info-icon" />
        当前配置路径
      </div>
      <div class="code-display">
        <span v-if="loading" class="code-placeholder">加载中...</span>
        <span v-else-if="currentPath" class="code-text">{{ currentPath }}</span>
        <span v-else class="code-empty">未设置</span>
      </div>
    </div>

    <!-- 目录树卡片 -->
    <div class="tree-card">
      <div class="tree-header">
        <div class="tree-title">选择数据文件夹</div>
        <div v-if="selectedPath" class="tree-selected">
          <span class="selected-label">已选择：</span>
          <span class="selected-path">{{ selectedPath }}</span>
        </div>
      </div>

      <div class="tree-body">
        <a-spin :spinning="treeLoading">
          <div class="tree-wrap">
            <a-tree
              :tree-data="treeData"
              :load-data="onLoadData"
              :expanded-keys="expandedKeys"
              show-icon
              class="file-tree"
              @select="onSelect"
              @expand="(keys) => (expandedKeys = keys)"
            >
              <template #icon="{ dataRef }">
                <FolderOutlined v-if="dataRef.directory" style="color: #faad14" />
                <FileOutlined v-else style="color: #1890ff" />
              </template>
            </a-tree>
          </div>
        </a-spin>
      </div>

      <div class="tree-footer">
        <a-button
          type="primary"
          size="large"
          :loading="saving"
          :disabled="!selectedPath"
          @click="onSave"
        >
          <SaveOutlined />
          保存为数据文件夹
        </a-button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.data-directory-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;
  min-height: 0;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
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
  font-size: 16px;
  font-weight: 600;
  color: #303133;
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

.tree-card {
  background: #ffffff;
  border: 1px solid #dcdfe6;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.tree-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}

.tree-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.tree-selected {
  font-size: 14px;
}

.selected-label {
  color: #606266;
}

.selected-path {
  color: #303133;
  font-weight: 600;
  font-family: 'Courier New', monospace;
}

.tree-body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  :deep(.ant-spin-nested-loading) {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  :deep(.ant-spin-container) {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
}

.tree-wrap {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  border: 1px solid #f0f0f0;
  border-radius: 10px;
  padding: 12px 16px;
  background: #fafafa;
}

.file-tree {
  background: transparent;

  :deep(.ant-tree-node-content-wrapper) {
    padding: 4px 6px;
    border-radius: 6px;
  }

  :deep(.ant-tree-node-content-wrapper:hover) {
    background: rgba(24, 144, 255, 0.06);
  }

  :deep(.ant-tree-node-selected) {
    background: rgba(24, 144, 255, 0.1) !important;
    color: #1890ff;
  }
}

.tree-footer {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;

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

    &:disabled {
      background: #bfbfbf;
      color: #ffffff;
    }
  }
}

@media (max-width: 768px) {
  .tree-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .tree-footer {
    justify-content: stretch;

    .ant-btn {
      width: 100%;
    }
  }
}
</style>
