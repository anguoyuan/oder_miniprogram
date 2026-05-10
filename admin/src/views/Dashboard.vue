<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon pending">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.pendingOrders }}</div>
              <div class="stat-label">待处理订单</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon preparing">
              <el-icon><Timer /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.preparingOrders }}</div>
              <div class="stat-label">制作中订单</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon completed">
              <el-icon><CircleCheck /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.completedOrders }}</div>
              <div class="stat-label">今日完成</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon revenue">
              <el-icon><Money /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">${{ stats.todayRevenue }}</div>
              <div class="stat-label">今日营业额</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-card class="recent-orders" style="margin-top: 20px">
      <template #header>
        <span>最新订单</span>
      </template>
      <el-table :data="recentOrders" style="width: 100%">
        <el-table-column prop="orderNo" label="订单号" width="180" />
        <el-table-column prop="userNickname" label="用户" width="120" />
        <el-table-column prop="totalPrice" label="金额" width="100">
          <template #default="scope">
            ${{ scope.row.totalPrice }}
          </template>
        </el-table-column>
        <el-table-column prop="orderType" label="类型" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.orderType === 'takeaway'" type="success">外卖</el-tag>
            <el-tag v-else type="info">自取</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="下单时间" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAllOrders } from '@/api/index'

const stats = ref({
  pendingOrders: 0,
  preparingOrders: 0,
  completedOrders: 0,
  todayRevenue: 0
})

const recentOrders = ref([])

const getStatusType = (status) => {
  const map = {
    pending: 'warning',
    preparing: 'primary',
    ready: 'success',
    completed: 'info',
    cancelled: 'danger'
  }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = {
    pending: '待处理',
    preparing: '制作中',
    ready: '待取餐',
    completed: '已完成',
    cancelled: '已取消'
  }
  return map[status] || '未知'
}

const loadData = async () => {
  try {
    // 加载最新订单
    const res = await getAllOrders({ page: 1, pageSize: 10 })
    recentOrders.value = res.data.records
    
    // 统计数据
    stats.value.pendingOrders = recentOrders.value.filter(o => o.status === 'pending').length
    stats.value.preparingOrders = recentOrders.value.filter(o => o.status === 'preparing').length
    stats.value.completedOrders = recentOrders.value.filter(o => o.status === 'completed').length
    stats.value.todayRevenue = recentOrders.value
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + parseFloat(o.totalPrice), 0)
      .toFixed(2)
  } catch (error) {
    console.error('加载数据失败', error)
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.dashboard {
  width: 100%;
}

.stat-card {
  cursor: pointer;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: white;
}

.stat-icon.pending {
  background: linear-gradient(135deg, #F093FB 0%, #F5576C 100%);
}

.stat-icon.preparing {
  background: linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%);
}

.stat-icon.completed {
  background: linear-gradient(135deg, #43E97B 0%, #38F9D7 100%);
}

.stat-icon.revenue {
  background: linear-gradient(135deg, #FA709A 0%, #FEE140 100%);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #333;
}

.stat-label {
  font-size: 14px;
  color: #999;
  margin-top: 5px;
}
</style>

