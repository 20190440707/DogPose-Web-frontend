import request from '@/utils/request.js'

// 保存多模态数据文件
export const fileUploadService = (taskId, file) => {
  const formData = new FormData()
  formData.append('taskId', taskId)
  formData.append('file', file)
  return request.post('/file/upload', formData, {
    headers: {
      Authorization: localStorage.getItem('token'),
      'Content-Type': 'multipart/form-data',
    },
  })
}

// 删除保存的多模态数据文件
export const fileDeleteService = (taskId, fileName) => {
  return request.delete(`/file/delete/${taskId}`, {
    params: { fileName },
    headers: { Authorization: localStorage.getItem('token') },
  })
}

// 列举保存的多模态数据文件
export const fileListService = (taskId) => {
  return request.get('/file/list', {
    params: { taskId },
    headers: { Authorization: localStorage.getItem('token') },
  })
}

// 获取任务文件树
export const fileTreeService = (taskId) => {
  return request.get('/file/tree', {
    params: { taskId },
    headers: { Authorization: localStorage.getItem('token') },
  })
}

// 下载任务文件
export const fileDownloadService = (taskId, relativePath) => {
  return request.get(`/file/download/${taskId}`, {
    params: { relativePath },
    responseType: 'blob',
    headers: { Authorization: localStorage.getItem('token') },
  })
}

// 打包下载任务文件（ZIP）
export const fileZipDownloadService = (taskId) => {
  return request.get(`/file/download/zip/${taskId}`, {
    responseType: 'blob',
    headers: { Authorization: localStorage.getItem('token') },
  })
}
