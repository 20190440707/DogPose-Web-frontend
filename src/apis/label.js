import request from '@/utils/request.js'

// 分页查询标注接口
export const pageService = (page, pageSize, name, mediaType, sortType) => {
  return request.get('/label/page', {
    params: {
      page,
      pageSize,
      name,
      mediaType,
      sortType,
    },
    headers: { Authorization: localStorage.getItem('token') },
  })
}
