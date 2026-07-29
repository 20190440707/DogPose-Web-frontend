<script setup>
import { ref, onMounted, computed } from 'vue'
import { userLoginStatusService } from '@/apis/auth.js'
import { useTokenStore, useUserStore } from '@/stores/index.js'
import { useRouter } from 'vue-router'
import { message, Upload, Button, Modal, List, Popconfirm } from 'ant-design-vue'
import {
  UploadOutlined,
  DeleteOutlined,
  FileTextOutlined,
  PlusOutlined,
  SearchOutlined,
  DatabaseOutlined,
  DownloadOutlined,
  FolderOutlined,
  FileOutlined,
} from '@ant-design/icons-vue'
import { pageService } from '@/apis/label.js'
import {
  fileUploadService,
  fileDeleteService,
  fileListService,
  fileTreeService,
  fileDownloadService,
  fileZipDownloadService,
} from '@/apis/file.js'
import {
  getTaskSamplesService,
  exportAnnotationService,
  exportAllAnnotationsService,
} from '@/apis/export.js'

const tokenStore = useTokenStore()
const userStore = useUserStore()
const router = useRouter()
const labelToolUrl = `${window.location.origin}/label`

// 导航到任务详情页面
const navigateToTask = (taskId) => {
  window.location.href = `${window.location.origin}/label/tasks/${taskId}`
}

// 用户登录状态验证
const checkLoginStatus = async () => {
  await userLoginStatusService().catch((res) => {
    if (res.response.status === 401 || res.response.status === 403) {
      message.error('登录过期，请重新登录')
      tokenStore.removeToken()
      userStore.removeUser()
      router.push('/login')
    } else {
      message.error('未知错误')
    }
  })
}
if (!tokenStore.token) {
  message.error('请登录')
  router.replace('/login')
} else {
  checkLoginStatus()
}

// 状态管理
const searchName = ref('')
const mediaType = ref('VIDEO')
const sortType = ref('0')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const labelList = ref([])

// 文件管理相关状态
const fileModalVisible = ref(false)
const currentTaskId = ref('')
const fileList = ref([])
const uploadFileList = ref([])
const isUploading = ref(false)

// 导出数据相关状态
const exportModalVisible = ref(false)
const exportTaskId = ref('')
const fileTreeData = ref([])
const fileTreeLoading = ref(false)
const expandedKeys = ref([])
const packDownloading = ref(false)

// 导出标注数据格式选择相关状态
const exportFormatModalVisible = ref(false)
const exportFormatType = ref('JSON')
const exportingAnnotation = ref(false)

// 导出全部标注相关状态
const exportAllModalVisible = ref(false)
const exportAllFormatType = ref('JSON')
const exportAllProgress = ref(0)
const exportAllLoading = ref(false)
const exportAllStatus = ref('active')

// 递归收集所有节点 key（用于默认全展开）
const collectAllKeys = (nodes) => {
  const keys = []
  const walk = (list) => {
    for (const node of list || []) {
      keys.push(node.key)
      if (node.children && node.children.length > 0) {
        walk(node.children)
      }
    }
  }
  walk(nodes)
  return keys
}

// 分页查询标注
const pageLabel = async (page, pageSize, name, mediaType, sortType) => {
  const res = await pageService(page, pageSize, name, mediaType, sortType)
  if (res.data.code === 0) {
    total.value = res.data.data.total
    labelList.value = res.data.data.records
  } else {
    message.error(res.data.message)
  }
}

const handleSearch = () => {
  currentPage.value = 1
  pageLabel(currentPage.value, pageSize.value, searchName.value, mediaType.value, sortType.value)
}

const handlePageChange = (page, size) => {
  currentPage.value = page
  pageSize.value = size
  pageLabel(currentPage.value, pageSize.value, searchName.value, mediaType.value, sortType.value)
}

const openFileModal = async (taskId) => {
  currentTaskId.value = taskId
  await loadFileList(taskId)
  fileModalVisible.value = true
  uploadFileList.value = []
}

const closeFileModal = () => {
  fileModalVisible.value = false
  currentTaskId.value = ''
  fileList.value = []
  uploadFileList.value = []
}

const loadFileList = async (taskId) => {
  try {
    const res = await fileListService(taskId)
    if (res.data.code === 0) {
      fileList.value = (res.data.data || []).map((filename) => ({
        id: filename,
        name: filename,
        size: 0,
      }))
    } else {
      message.error(res.data.message)
    }
  } catch (error) {
    message.error('加载文件列表失败')
  }
}

const handleFileUpload = async (file) => {
  isUploading.value = true
  try {
    const realFile = file.file || file
    const res = await fileUploadService(currentTaskId.value, realFile)
    if (res.data.code === 0) {
      message.success('文件上传成功')
      await loadFileList(currentTaskId.value)
    } else {
      message.error(res.data.message)
    }
  } catch (error) {
    message.error('文件上传失败')
  } finally {
    isUploading.value = false
  }
}

const handleFileDelete = async (fileId) => {
  try {
    const res = await fileDeleteService(currentTaskId.value, fileId)
    if (res.data.code === 0) {
      message.success('文件删除成功')
      await loadFileList(currentTaskId.value)
    } else {
      message.error(res.data.message)
    }
  } catch (error) {
    message.error('文件删除失败')
  }
}

// 导出数据相关方法
const openExportModal = async (taskId) => {
  exportTaskId.value = taskId
  fileTreeData.value = []
  exportModalVisible.value = true
  await loadFileTree(taskId)
}

const closeExportModal = () => {
  exportModalVisible.value = false
  exportTaskId.value = ''
  fileTreeData.value = []
}

const loadFileTree = async (taskId) => {
  fileTreeLoading.value = true
  try {
    const res = await fileTreeService(taskId)
    if (res.data.code === 0) {
      fileTreeData.value = res.data.data || []
      expandedKeys.value = collectAllKeys(fileTreeData.value)
    } else {
      message.error(res.data.message)
    }
  } catch (error) {
    message.error('加载文件列表失败')
  } finally {
    fileTreeLoading.value = false
  }
}

const handleFileDownload = async (relativePath) => {
  try {
    const res = await fileDownloadService(exportTaskId.value, relativePath)
    const blob = new Blob([res.data])
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = relativePath.split('/').pop()
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    message.success('下载成功')
  } catch (error) {
    message.error('下载失败')
  }
}

const handlePackDownload = async () => {
  packDownloading.value = true
  try {
    const res = await fileZipDownloadService(exportTaskId.value)
    const blob = new Blob([res.data])
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `task_${exportTaskId.value}.zip`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    message.success('打包下载成功')
  } catch (error) {
    message.error('打包下载失败')
  } finally {
    packDownloading.value = false
  }
}

// 导出标注数据相关方法
const openExportFormatModal = () => {
  exportFormatType.value = 'JSON'
  exportFormatModalVisible.value = true
}

const closeExportFormatModal = () => {
  exportFormatModalVisible.value = false
}

const handleExportAnnotation = async () => {
  exportingAnnotation.value = true
  try {
    // 1. 获取所有样本
    const samplesRes = await getTaskSamplesService(exportTaskId.value)
    const samples = samplesRes.data?.data || []
    const sampleIds = samples.map((s) => s.id).filter((id) => id !== undefined && id !== null)

    if (sampleIds.length === 0) {
      message.error('该任务暂无样本数据')
      return
    }

    // 2. 调用导出接口
    const exportRes = await exportAnnotationService(
      exportTaskId.value,
      sampleIds,
      exportFormatType.value,
    )

    // 3. 处理下载
    let blob, filename
    if (exportFormatType.value === 'JSON') {
      blob = new Blob([JSON.stringify(exportRes.data)])
      filename = `task_${exportTaskId.value}.json`
    } else {
      blob = exportRes.data
      filename = `task_${exportTaskId.value}.xml`
    }

    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    message.success('导出成功')
    closeExportFormatModal()
  } catch (error) {
    message.error('导出失败')
  } finally {
    exportingAnnotation.value = false
  }
}

// 导出全部标注相关方法
const openExportAllModal = () => {
  exportAllFormatType.value = 'JSON'
  exportAllProgress.value = 0
  exportAllModalVisible.value = true
}

const closeExportAllModal = () => {
  if (exportAllLoading.value) return
  exportAllModalVisible.value = false
}

const handleExportAll = async () => {
  exportAllLoading.value = true
  exportAllProgress.value = 0
  exportAllStatus.value = 'active'
  try {
    const res = await exportAllAnnotationsService(exportAllFormatType.value, (progressEvent) => {
      if (progressEvent.total) {
        exportAllProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      }
    })
    const blob = new Blob([res.data])
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `annotations_export_${Date.now()}.zip`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    exportAllStatus.value = 'success'
    message.success('导出成功')
    setTimeout(() => {
      exportAllModalVisible.value = false
      exportAllLoading.value = false
      exportAllProgress.value = 0
    }, 800)
  } catch (error) {
    message.error('导出失败')
    exportAllLoading.value = false
  }
}

onMounted(() => {
  pageLabel(currentPage.value, pageSize.value, searchName.value, mediaType.value, sortType.value)
})

// 媒体类型标签颜色
const mediaTagMap = {
  VIDEO: {
    label: '视频',
    color: '#1890ff',
    bg: 'rgba(24,144,255,0.08)',
    border: 'rgba(24,144,255,0.3)',
  },
  IMAGE: {
    label: '图片',
    color: '#13c2c2',
    bg: 'rgba(19,194,194,0.08)',
    border: 'rgba(19,194,194,0.3)',
  },
  AUDIO: {
    label: '音频',
    color: '#722ed1',
    bg: 'rgba(114,46,209,0.08)',
    border: 'rgba(114,46,209,0.3)',
  },
  DRAFT: {
    label: '草稿',
    color: '#fa8c16',
    bg: 'rgba(250,140,22,0.08)',
    border: 'rgba(250,140,22,0.3)',
  },
}

const getTagInfo = (item) => {
  if (item.status === 'DRAFT') return mediaTagMap.DRAFT
  return (
    mediaTagMap[item.mediaType] || {
      label: item.mediaType,
      color: '#999',
      bg: 'rgba(150,150,150,0.06)',
      border: 'rgba(150,150,150,0.25)',
    }
  )
}

// 格式化标注者
const formatUpdaters = (updaters) => {
  if (!updaters || updaters.length === 0) return '暂无'
  const names = updaters.map((u) => u.username).filter(Boolean)
  if (names.length === 0) return '暂无'
  if (names.length <= 3) return names.join('、')
  return names.slice(0, 3).join('、') + ' 等'
}

// 格式化标注进度
const formatProgress = (stats, status) => {
  if (status === 'DRAFT' || status === 'IMPORTED') return '-'
  if (!stats) return '-'
  const done = (stats.doneCount || 0) + (stats.skippedCount || 0)
  const total = done + (stats.newCount || 0)
  if (total === 0) return '-'
  if (done === total) return '已完成'
  return `${done}/${total}`
}

// 格式化标签数量
const formatLabelCounts = (labelCounts) => {
  if (!labelCounts || labelCounts.length === 0) return '-'
  const display = labelCounts.slice(0, 4).join('/')
  if (labelCounts.length > 4) return display + ' ...'
  return display
}
</script>

<template>
  <div class="label-view">
    <!-- 页面标题区 -->
    <div class="page-header">
      <div class="page-title-wrap">
        <DatabaseOutlined class="page-icon" />
        <div>
          <h1 class="page-title">全部数据集</h1>
          <p class="page-desc">管理所有标注任务与多模态数据资源</p>
        </div>
      </div>
      <div class="header-stat">
        <span class="stat-num">{{ total }}</span>
        <span class="stat-label">个数据集</span>
      </div>
    </div>

    <!-- 搜索和筛选栏 -->
    <div class="search-bar">
      <div class="search-input-wrap">
        <a-input
          v-model:value="searchName"
          placeholder="搜索数据集名称..."
          allow-clear
          @pressEnter="handleSearch"
        >
          <template #prefix><SearchOutlined /></template>
        </a-input>
      </div>
      <a-select v-model:value="mediaType" placeholder="数据类型" @change="handleSearch">
        <a-select-option value="">全部数据</a-select-option>
        <a-select-option value="VIDEO">视频</a-select-option>
        <a-select-option value="IMAGE">图片</a-select-option>
        <a-select-option value="AUDIO">音频</a-select-option>
      </a-select>
      <a-select v-model:value="sortType" placeholder="排序方式" @change="handleSearch">
        <a-select-option value="0">更新时间↓</a-select-option>
        <a-select-option value="1">更新时间↑</a-select-option>
        <a-select-option value="2">上传时间↓</a-select-option>
        <a-select-option value="3">上传时间↑</a-select-option>
        <a-select-option value="4">名称↓</a-select-option>
        <a-select-option value="5">名称↑</a-select-option>
      </a-select>
      <a-button type="primary" @click="handleSearch" class="search-btn">搜索</a-button>
      <a-button class="export-all-btn" @click="openExportAllModal">
        <DownloadOutlined /> 导出全部标注
      </a-button>
      <a-button class="tool-btn" :href="labelToolUrl" target="_self">前往标注工具</a-button>
    </div>

    <!-- 卡片列表 -->
    <div class="label-list">
      <div
        v-for="item in labelList"
        :key="item.id"
        class="label-card"
        @click="navigateToTask(item.id)"
      >
        <!-- 标题行 -->
        <div class="card-header">
          <span class="card-name">{{ item.name }}</span>
          <span
            class="media-tag"
            :style="{
              color: getTagInfo(item).color,
              background: getTagInfo(item).bg,
              borderColor: getTagInfo(item).border,
            }"
            >{{ getTagInfo(item).label }}</span
          >
        </div>

        <!-- 信息行 -->
        <div class="card-body">
          <div class="info-row">
            <span class="info-label">创建者</span>
            <span class="info-value">{{ item.creator }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">创建时间</span>
            <span class="info-value">{{ new Date(item.createdAt).toLocaleString() }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">标注者</span>
            <span class="info-value">{{ formatUpdaters(item.updaters) }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">标注进度</span>
            <span class="info-value">{{ formatProgress(item.stats, item.status) }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">标签数量</span>
            <span class="info-value">{{ formatLabelCounts(item.labelCounts) }}</span>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="card-actions" @click.stop>
          <button class="action-btn" @click="navigateToTask(item.id)">预览</button>
          <button class="action-btn action-btn-upload" @click.stop="openFileModal(item.id)">
            <UploadOutlined /> 多模态数据
          </button>
          <button class="action-btn action-btn-export" @click.stop="openExportModal(item.id)">
            <DownloadOutlined /> 导出数据
          </button>
        </div>
      </div>
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

    <!-- 文件管理模态框 -->
    <a-modal
      v-model:visible="fileModalVisible"
      title="多模态数据管理"
      width="600px"
      @ok="closeFileModal"
      ok-text="关闭"
    >
      <div class="upload-section">
        <h4 class="modal-section-title">上传文件</h4>
        <a-upload
          :file-list="uploadFileList"
          :custom-request="handleFileUpload"
          :disabled="isUploading"
          :show-upload-list="false"
          accept="*"
          multiple
        >
          <a-button :loading="isUploading" type="primary">
            <UploadOutlined /> {{ isUploading ? '上传中...' : '点击上传' }}
          </a-button>
          <span class="upload-hint">支持 CSV 等多模态文件</span>
        </a-upload>
      </div>

      <div class="file-list-section">
        <h4 class="modal-section-title">已上传文件</h4>
        <a-list v-if="fileList.length > 0" item-layout="horizontal" :data-source="fileList">
          <template #renderItem="{ item }">
            <a-list-item>
              <a-list-item-meta :title="item.name">
                <template #avatar>
                  <FileTextOutlined style="color: #1890ff; font-size: 18px" />
                </template>
              </a-list-item-meta>
              <a-popconfirm
                title="确定要删除这个文件吗？"
                @confirm="handleFileDelete(item.id)"
                ok-text="确定"
                cancel-text="取消"
              >
                <a-button danger type="text"><DeleteOutlined /></a-button>
              </a-popconfirm>
            </a-list-item>
          </template>
        </a-list>
        <div v-else class="empty-files">暂无上传文件</div>
      </div>

      <template #footer>
        <a-button type="primary" @click="closeFileModal">关闭</a-button>
      </template>
    </a-modal>

    <!-- 导出数据模态框 -->
    <a-modal
      v-model:visible="exportModalVisible"
      title="导出数据"
      width="700px"
      :footer="null"
      @cancel="closeExportModal"
    >
      <a-spin :spinning="fileTreeLoading">
        <div v-if="fileTreeData.length === 0 && !fileTreeLoading" class="empty-files">暂无文件</div>
        <template v-else>
          <div class="pack-download-bar">
            <a-button size="small" class="export-annotation-btn" @click="openExportFormatModal">
              <FileTextOutlined /> 导出标注数据
            </a-button>
            <a-button
              type="primary"
              size="small"
              class="pack-download-btn"
              :loading="packDownloading"
              @click="handlePackDownload"
            >
              <DownloadOutlined /> {{ packDownloading ? '打包中...' : '打包下载' }}
            </a-button>
          </div>
          <a-tree
            :tree-data="fileTreeData"
            :expanded-keys="expandedKeys"
            show-icon
            class="file-tree"
          >
            <template #title="{ dataRef }">
              <span class="tree-node-title">
                <span class="node-label">
                  <FolderOutlined
                    v-if="dataRef.directory"
                    style="color: #faad14; margin-right: 6px"
                  />
                  <FileOutlined v-else style="color: #1890ff; margin-right: 6px" />
                  {{ dataRef.title }}
                </span>
                <span v-if="!dataRef.directory" class="node-meta">
                  <span class="node-size">{{ dataRef.displaySize }}</span>
                  <a-button
                    type="text"
                    size="small"
                    class="node-download-btn"
                    @click.stop="handleFileDownload(dataRef.path)"
                  >
                    <DownloadOutlined /> 下载
                  </a-button>
                </span>
              </span>
            </template>
          </a-tree>
        </template>
      </a-spin>
    </a-modal>

    <!-- 选择导出格式模态框 -->
    <a-modal
      v-model:visible="exportFormatModalVisible"
      title="选择导出格式"
      width="400px"
      ok-text="导出"
      cancel-text="取消"
      :confirm-loading="exportingAnnotation"
      @ok="handleExportAnnotation"
      @cancel="closeExportFormatModal"
    >
      <div class="export-format-content">
        <div class="export-format-row">
          <span class="export-format-label">导出格式</span>
          <a-select v-model:value="exportFormatType" style="width: 200px">
            <a-select-option value="JSON">JSON</a-select-option>
            <a-select-option value="XML">XML</a-select-option>
          </a-select>
        </div>
      </div>
    </a-modal>

    <!-- 导出全部标注模态框 -->
    <a-modal
      v-model:visible="exportAllModalVisible"
      title="导出全部标注"
      width="420px"
      :closable="!exportAllLoading"
      :maskClosable="!exportAllLoading"
      :footer="null"
    >
      <div class="export-all-content">
        <div class="export-format-row">
          <span class="export-format-label">导出格式</span>
          <a-select
            v-model:value="exportAllFormatType"
            style="width: 200px"
            :disabled="exportAllLoading"
          >
            <a-select-option value="JSON">JSON</a-select-option>
            <a-select-option value="XML">XML</a-select-option>
          </a-select>
        </div>
        <div v-if="exportAllLoading" class="progress-section">
          <a-progress :percent="exportAllProgress" :status="exportAllStatus" />
          <p class="progress-text">
            {{ exportAllProgress < 5 ? '正在准备导出数据...' : '正在下载...' }}
          </p>
        </div>
        <div class="export-all-actions">
          <a-button @click="closeExportAllModal" :disabled="exportAllLoading">取消</a-button>
          <a-button type="primary" :loading="exportAllLoading" @click="handleExportAll">
            开始导出
          </a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<style scoped lang="scss">
.label-view {
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

:deep(.ant-select-selector) {
  height: 36px !important;
  background: #ffffff !important;
  border-color: #dcdfe6 !important;
  border-radius: 8px !important;

  .ant-select-selection-item {
    line-height: 34px !important;
    color: #606266 !important;
  }
}

.search-btn {
  height: 36px !important;
  border-radius: 8px !important;
  background: #1890ff !important;
  border: none !important;
}

.tool-btn {
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

.export-all-btn {
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

// 导出全部标注模态框
.export-all-content {
  padding: 12px 0;
}

.progress-section {
  margin-top: 20px;
  margin-bottom: 20px;
}

.progress-text {
  margin: 8px 0 0;
  font-size: 12px;
  color: #909399;
  text-align: center;
}

.export-all-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
}

// 卡片列表
.label-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 18px;
  flex: 1;
  margin-bottom: 20px;
}

.label-card {
  position: relative;
  background: #ffffff;
  border: 1px solid #dcdfe6;
  border-radius: 12px;
  padding: 14px 0;
  cursor: pointer;
  transition: box-shadow 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  }
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px 10px;
  gap: 8px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 10px;
}

.card-name {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.media-tag {
  flex-shrink: 0;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid;
}

.card-body {
  padding: 0 16px 10px;
}

.info-row {
  display: flex;
  gap: 8px;
  margin-bottom: 4px;

  .info-label {
    font-size: 12px;
    color: #909399;
    min-width: 36px;
  }

  .info-value {
    font-size: 12px;
    color: #606266;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.card-actions {
  display: flex;
  gap: 8px;
  padding: 10px 16px 0;
}

.action-btn {
  flex: 1;
  height: 28px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  background: #ffffff;
  color: #606266;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  white-space: nowrap;
  overflow: hidden;

  &:hover {
    border-color: #1890ff;
    color: #1890ff;
  }
}

.action-btn-upload {
  &:hover {
    border-color: #52c41a;
    color: #52c41a;
  }
}

.action-btn-export {
  &:hover {
    border-color: #faad14;
    color: #faad14;
  }
}

// 打包下载
.pack-download-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

.pack-download-btn {
  border-radius: 6px !important;
  background: #1890ff !important;
  border: none !important;
  font-size: 13px;
}

.export-annotation-btn {
  border-radius: 6px !important;
  font-size: 13px;
  border-color: #dcdfe6 !important;
  color: #606266 !important;
  background: #ffffff !important;

  &:hover {
    border-color: #1890ff !important;
    color: #1890ff !important;
  }
}

// 导出格式选择
.export-format-content {
  padding: 12px 0;
}

.export-format-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.export-format-label {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
}

// 文件树
.file-tree {
  background: transparent;

  :deep(.ant-tree-treenode) {
    width: 100%;
  }

  :deep(.ant-tree-node-content-wrapper) {
    flex: 1;
    overflow: hidden;
  }
}

.tree-node-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 12px;
}

.node-label {
  display: flex;
  align-items: center;
  color: #606266;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.node-size {
  font-size: 11px;
  color: #909399;
  white-space: nowrap;
}

.node-download-btn {
  color: #1890ff !important;
  font-size: 12px;
  padding: 0 6px !important;

  &:hover {
    color: #40a9ff !important;
    background: rgba(24, 144, 255, 0.06) !important;
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

// 模态框内容
.modal-section-title {
  font-size: 14px;
  font-weight: 600;
  color: #606266;
  margin: 0 0 12px;
  padding-left: 8px;
  border-left: 3px solid #1890ff;
}

.upload-section {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;

  :deep(.ant-btn) {
    border-radius: 8px !important;
  }
}

.upload-hint {
  margin-left: 12px;
  font-size: 12px;
  color: #909399;
}

.file-list-section {
  :deep(.ant-list-item-meta-title) {
    color: #606266 !important;
    font-size: 13px !important;
  }
}

.empty-files {
  text-align: center;
  padding: 30px;
  color: #c0c4cc;
  font-size: 13px;
}

@media (max-width: 768px) {
  .search-bar {
    flex-direction: column;
    align-items: stretch;
  }
  .search-input-wrap {
    min-width: unset;
  }
  .label-list {
    grid-template-columns: 1fr;
  }
}
</style>
