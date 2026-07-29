import request from '@/utils/request.js'
import { httpAddr } from '@/apis/backendAddr.js'

// 获取任务样本列表
export const getTaskSamplesService = (taskId) => {
  return request.get(`/v1/tasks/${taskId}/samples`, {
    baseURL: httpAddr + '/api',
    params: {
      page: 0,
      size: 100000,
    },
    headers: { Authorization: localStorage.getItem('token') },
  })
}

// 导出标注数据
export const exportAnnotationService = (taskId, sampleIds, exportType) => {
  const isBlob = ['XML', 'MASK', 'LABEL_ME', 'YOLO', 'CSV', 'TF_RECORD', 'PASCAL_VOC'].includes(exportType)

  return request.post(
    `/v1/tasks/${taskId}/samples/export`,
    {
      sample_ids: sampleIds,
    },
    {
      baseURL: httpAddr + '/api',
      params: {
        task_id: taskId,
        export_type: exportType,
      },
      responseType: isBlob ? 'blob' : 'json',
      headers: { Authorization: localStorage.getItem('token') },
    }
  )
}

// 导出全部标注数据
export const exportAllAnnotationsService = (exportType, onDownloadProgress) => {
  return request.post(
    `/export/all`,
    {},
    {
      baseURL: httpAddr + '/api/management',
      params: {
        exportType: exportType,
      },
      responseType: 'blob',
      headers: { Authorization: localStorage.getItem('token') },
      onDownloadProgress,
    }
  )
}
