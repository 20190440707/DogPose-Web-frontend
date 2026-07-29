import { defineStore } from 'pinia'
import { ref } from 'vue'

// token 模块
export const useTokenStore = defineStore(
  'token',
  () => {
    const token = ref(null)
    const removeToken = async () => {
      token.value = null
      localStorage.removeItem('token')
    }
    const setToken = (newToken) => {
      token.value = newToken
    }

    return {
      token,
      removeToken,
      setToken,
    }
  },
  {
    persist: {
      key: 'token',
      storage: {
        getItem: (key) => {
          // 从 localStorage 中获取字符串 token
          const token = localStorage.getItem(key)
          // 返回 Pinia 期望的格式
          return JSON.stringify({ token })
        },
        setItem: (key, value) => {
          // 解析 value 并只存储 token 的值
          const parsedValue = JSON.parse(value)
          localStorage.setItem(key, parsedValue.token)
        },
        removeItem: (key) => localStorage.removeItem(key),
      },
    },
  },
)
