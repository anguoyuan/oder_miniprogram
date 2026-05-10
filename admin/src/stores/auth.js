import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  const admin = ref(JSON.parse(localStorage.getItem('admin') || 'null'))

  const isLoggedIn = ref(!!token.value)

  function setAuth(authToken, adminInfo) {
    token.value = authToken
    admin.value = adminInfo
    isLoggedIn.value = true
    localStorage.setItem('token', authToken)
    localStorage.setItem('admin', JSON.stringify(adminInfo))
  }

  function clearAuth() {
    token.value = ''
    admin.value = null
    isLoggedIn.value = false
    localStorage.removeItem('token')
    localStorage.removeItem('admin')
  }

  return {
    token,
    admin,
    isLoggedIn,
    setAuth,
    clearAuth
  }
})

