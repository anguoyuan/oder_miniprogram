<template>
  <div class="users-page">
    <el-card class="toolbar">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索用户昵称或手机号"
            clearable
            @clear="loadUsers"
          >
            <template #append>
              <el-button @click="loadUsers">
                <el-icon><Search /></el-icon>
              </el-button>
            </template>
          </el-input>
        </el-col>
      </el-row>
    </el-card>

    <el-card style="margin-top: 20px">
      <el-table :data="users" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="头像" width="80">
          <template #default="scope">
            <el-avatar :src="scope.row.avatar" />
          </template>
        </el-table-column>
        <el-table-column prop="nickname" label="昵称" />
        <el-table-column prop="phone" label="手机号" width="150" />
        <el-table-column prop="openid" label="OpenID" width="200" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="注册时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button 
              size="small" 
              :type="scope.row.status === 1 ? 'warning' : 'success'"
              @click="toggleUserStatus(scope.row)"
            >
              {{ scope.row.status === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-button size="small" @click="viewUserDetail(scope.row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        layout="total, prev, pager, next, jumper"
        style="margin-top: 20px; text-align: right"
        @current-change="loadUsers"
      />
    </el-card>

    <!-- 用户详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="用户详情" width="600px">
      <div v-if="selectedUser" class="user-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="用户ID">{{ selectedUser.id }}</el-descriptions-item>
          <el-descriptions-item label="昵称">{{ selectedUser.nickname }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ selectedUser.phone || '未绑定' }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="selectedUser.status === 1 ? 'success' : 'danger'">
              {{ selectedUser.status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="OpenID" :span="2">
            {{ selectedUser.openid }}
          </el-descriptions-item>
          <el-descriptions-item label="注册时间" :span="2">
            {{ selectedUser.createTime }}
          </el-descriptions-item>
          <el-descriptions-item label="最后更新" :span="2">
            {{ selectedUser.updateTime }}
          </el-descriptions-item>
        </el-descriptions>

        <div style="margin-top: 20px">
          <h4>用户统计</h4>
          <el-row :gutter="20" style="margin-top: 10px">
            <el-col :span="8">
              <el-statistic title="订单总数" :value="userStats.orderCount" />
            </el-col>
            <el-col :span="8">
              <el-statistic title="消费总额" :value="userStats.totalSpent" prefix="$" />
            </el-col>
            <el-col :span="8">
              <el-statistic title="平均订单" :value="userStats.avgOrder" prefix="$" />
            </el-col>
          </el-row>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const loading = ref(false)
const searchKeyword = ref('')
const users = ref([])
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const detailDialogVisible = ref(false)
const selectedUser = ref(null)
const userStats = reactive({
  orderCount: 0,
  totalSpent: 0,
  avgOrder: 0
})

// 加载用户列表
const loadUsers = async () => {
  loading.value = true
  try {
    // 这里需要后端添加用户列表接口
    const res = await request({
      url: '/user/list',
      method: 'get',
      params: {
        keyword: searchKeyword.value,
        page: pagination.page,
        pageSize: pagination.pageSize
      }
    })
    users.value = res.data.records || []
    pagination.total = res.data.total || 0
  } catch (error) {
    // 如果接口未实现，使用模拟数据
    ElMessage.warning('用户列表接口暂未实现，显示模拟数据')
    users.value = []
  } finally {
    loading.value = false
  }
}

// 切换用户状态
const toggleUserStatus = (user) => {
  const action = user.status === 1 ? '禁用' : '启用'
  ElMessageBox.confirm(`确定要${action}该用户吗？`, '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await request({
        url: '/user/update-status',
        method: 'put',
        data: {
          id: user.id,
          status: user.status === 1 ? 0 : 1
        }
      })
      ElMessage.success(`${action}成功`)
      loadUsers()
    } catch (error) {
      ElMessage.error(`${action}失败`)
    }
  })
}

// 查看用户详情
const viewUserDetail = async (user) => {
  selectedUser.value = user
  detailDialogVisible.value = true
  
  // 加载用户统计数据
  try {
    const res = await request({
      url: `/user/stats/${user.id}`,
      method: 'get'
    })
    Object.assign(userStats, res.data)
  } catch (error) {
    // 模拟数据
    userStats.orderCount = 0
    userStats.totalSpent = 0
    userStats.avgOrder = 0
  }
}

onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.users-page {
  width: 100%;
}

.user-detail {
  padding: 10px;
}
</style>
