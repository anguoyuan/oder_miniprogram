<template>
  <div class="login-container">
    <div class="login-box">
      <h2 class="title">奶茶店订单管理系统</h2>
      <el-form :model="loginForm" :rules="rules" ref="loginFormRef">
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            prefix-icon="User"
            placeholder="请输入用户名"
            size="large"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            prefix-icon="Lock"
            placeholder="请输入密码"
            size="large"
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            style="width: 100%"
            :loading="loading"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
      <div class="tips">
        <p>默认账号：admin</p>
        <p>默认密码：123456</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { login } from '@/api/index'

const router = useRouter()
const authStore = useAuthStore()

const loginFormRef = ref()
const loading = ref(false)

const loginForm = reactive({
  username: 'admin',
  password: '123456'
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  await loginFormRef.value.validate()
  
  loading.value = true
  try {
    const res = await login(loginForm)
    authStore.setAuth(res.data.token, res.data.admin)
    ElMessage.success('登录成功')
    router.push('/')
  } catch (error) {
    ElMessage.error(error.message || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  width: 100%;
  height: 100%;
  background-image: url('https://images.unsplash.com/photo-1556881286-fc6915169721?q=80&w=2070&auto=format&fit=crop');
  background-size: cover;
  background-position: center;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.login-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1;
}

.login-box {
  width: 400px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 2;
}

.title {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-size: 26px;
  font-weight: bold;
}

.tips {
  text-align: center;
  margin-top: 20px;
  color: #666;
  font-size: 12px;
}

.tips p {
  margin: 5px 0;
}
</style>

