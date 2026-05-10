<template>
  <div class="layout-container">
    <el-container>
      <el-aside width="200px">
        <div class="logo">
          <h3>奶茶店管理</h3>
        </div>
        <el-menu
          :default-active="route.path"
          router
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
        >
          <el-menu-item index="/dashboard">
            <el-icon><House /></el-icon>
            <span>首页</span>
          </el-menu-item>
          <el-menu-item index="/orders">
            <el-icon><List /></el-icon>
            <span>订单管理</span>
          </el-menu-item>
          <el-menu-item index="/products">
            <el-icon><ShoppingBag /></el-icon>
            <span>商品管理</span>
          </el-menu-item>
          <el-menu-item index="/categories">
            <el-icon><Menu /></el-icon>
            <span>分类管理</span>
          </el-menu-item>
          <el-menu-item index="/users">
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
          <el-menu-item index="/reviews">
            <el-icon><ChatDotRound /></el-icon>
            <span>评价管理</span>
          </el-menu-item>
          <el-menu-item index="/banners">
            <el-icon><Picture /></el-icon>
            <span>轮播图管理</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-container>
        <el-header>
          <div class="header-content">
            <span class="page-title">{{ route.meta.title }}</span>
            <div class="user-info">
              <span>{{ authStore.admin?.name || '管理员' }}</span>
              <el-button type="text" @click="handleLogout">退出登录</el-button>
            </div>
          </div>
        </el-header>
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗?', '提示', {
    type: 'warning'
  }).then(() => {
    authStore.clearAuth()
    router.push('/login')
  })
}
</script>

<style scoped>
.layout-container {
  width: 100%;
  height: 100%;
}

.el-aside {
  background-color: #304156;
  height: 100vh;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.el-header {
  background-color: white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  padding: 0 20px;
}

.header-content {
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.el-main {
  background-color: #f0f2f5;
  padding: 20px;
}
</style>

