import request from '@/utils/request.js'

// 登录接口
export const userLoginService = ({ username, password }) => {
  return request.post('/auth/login', { username, password })
}

// 注册接口
export const userRegisterService = ({ username, password, confirmPassword, inviteCode }) => {
  return request.post('/auth/register', { username, password, confirmPassword, inviteCode })
}

// 用户登录状态验证
export const userLoginStatusService = () => {
  return request.get('/auth/status', {
    headers: { Authorization: localStorage.getItem('token') },
  })
}

// 修改用户名
export const userUpdateUsernameService = ({ newUsername }) => {
  return request.put('/user/username', { newUsername })
}

// 修改密码
export const userUpdatePasswordService = ({ oldPassword, newPassword, confirmPassword }) => {
  return request.put('/user/password', { oldPassword, newPassword, confirmPassword })
}
