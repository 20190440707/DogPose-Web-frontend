import request from '@/utils/request.js'

// 获取当前注册邀请码
export const getInviteCodeService = () => {
  return request.get('/admin/invite-code')
}

// 更新注册邀请码
export const updateInviteCodeService = (configValue) => {
  return request.put('/admin/invite-code', { configValue })
}

// 分页查询用户列表
export const getUserListService = (page, pageSize, username) => {
  return request.get('/admin/users', {
    params: { page, pageSize, username },
  })
}

// 管理员创建用户
export const createUserService = ({ username, password, confirmPassword }) => {
  return request.post('/admin/users', { username, password, confirmPassword })
}

// 管理员修改用户密码
export const updateUserPasswordService = (id, { newPassword, confirmPassword }) => {
  return request.put(`/admin/users/${id}/password`, { newPassword, confirmPassword })
}

// 管理员修改用户用户名
export const updateUserUsernameService = (id, { newUsername }) => {
  return request.put(`/admin/users/${id}/username`, { newUsername })
}

// 管理员修改用户状态
export const updateUserStatusService = (id, status) => {
  return request.put(`/admin/users/${id}/status?status=${status}`)
}

// 获取数据文件夹路径
export const getDataDirectoryService = () => {
  return request.get('/admin/data-directory')
}

// 更新数据文件夹路径
export const updateDataDirectoryService = (configValue) => {
  return request.put('/admin/data-directory', { configValue })
}

// 获取指定路径下的文件系统节点列表
export const listFileSystemService = (path) => {
  return request.get('/admin/file-system', {
    params: { path },
  })
}
