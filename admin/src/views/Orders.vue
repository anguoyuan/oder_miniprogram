<template>
  <div class="orders-page">
    <!-- 顶部操作栏 -->
    <el-card class="toolbar">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-radio-group v-model="filterType" @change="loadOrders">
            <el-radio-button label="">全部</el-radio-button>
            <el-radio-button label="unpaid">未付款</el-radio-button>
            <el-radio-button label="preparing">准备中</el-radio-button>
            <el-radio-button label="completed">已完成</el-radio-button>
          </el-radio-group>
        </el-col>
        <el-col :span="12" style="text-align: right">
          <el-switch
            v-model="voiceEnabled"
            active-text="语音播报"
            @change="handleVoiceToggle"
          />
          <el-tag v-if="wsConnected" type="success" style="margin-left: 20px">
            <el-icon><CircleCheck /></el-icon> 实时连接
          </el-tag>
          <el-tag v-else type="danger" style="margin-left: 20px">
            <el-icon><CircleClose /></el-icon> 连接断开
          </el-tag>
        </el-col>
      </el-row>
    </el-card>

    <!-- 订单列表 -->
    <el-card class="orders-list" style="margin-top: 20px">
      <el-table
        :data="orders"
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column prop="orderNo" label="订单号" width="180" />
        <el-table-column label="用户" width="150">
          <template #default="scope">
            <div style="display: flex; align-items: center; gap: 10px">
              <el-avatar :src="scope.row.userAvatar" size="small" />
              <span>{{ scope.row.userNickname }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="商品" width="300">
          <template #default="scope">
            <div v-for="item in scope.row.items" :key="item.productId" class="order-item">
              {{ item.productName }} x{{ item.quantity }}
              <div v-if="item.productDescription" style="color: #909399; font-size: 12px">{{ item.productDescription }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="totalPrice" label="金额" width="100">
          <template #default="scope">
            <span style="color: #F56C6C; font-weight: bold">${{ scope.row.totalPrice }}</span>
          </template>
        </el-table-column>
        <el-table-column label="付款" width="120">
          <template #default="scope">
            <el-tag
              :type="scope.row.paymentStatus === 'paid' ? 'success' : 'danger'"
              style="cursor: pointer"
              @click="togglePaymentStatus(scope.row)"
            >
              {{ scope.row.paymentStatus === 'paid' ? '已付款' : '未付款' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="orderType" label="类型" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.orderType === 'takeaway'" type="success">外卖</el-tag>
            <el-tag v-else type="info">自取</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="地址/电话" width="200">
          <template #default="scope">
            <div v-if="scope.row.orderType === 'takeaway'">
              <div>{{ scope.row.address }}</div>
              <div style="color: #909399">{{ scope.row.phone }}</div>
            </div>
            <div v-else style="color: #909399">到店自取</div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="下单时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button
              v-if="scope.row.status === 'pending'"
              type="primary"
              size="small"
              @click="updateStatus(scope.row.id, 'preparing')"
            >
              开始制作
            </el-button>
            <el-button
              v-if="scope.row.status === 'preparing'"
              type="success"
              size="small"
              @click="updateStatus(scope.row.id, 'ready')"
            >
              制作完成
            </el-button>
            <el-button
              v-if="scope.row.status === 'ready'"
              type="success"
              size="small"
              @click="updateStatus(scope.row.id, 'completed')"
            >
              已取餐
            </el-button>
            <el-button
              type="info"
              size="small"
              @click="viewDetail(scope.row)"
            >
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        layout="total, prev, pager, next, jumper"
        style="margin-top: 20px; text-align: right"
        @current-change="loadOrders"
      />
    </el-card>

    <!-- 订单详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="订单详情" width="600px">
      <div v-if="selectedOrder" class="order-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单号">{{ selectedOrder.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="用户">{{ selectedOrder.userNickname }}</el-descriptions-item>
          <el-descriptions-item label="订单类型">
            {{ selectedOrder.orderType === 'takeaway' ? '外卖' : '自取' }}
          </el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag :type="getStatusType(selectedOrder.status)">
              {{ getStatusText(selectedOrder.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="下单时间" :span="2">
            {{ selectedOrder.createTime }}
          </el-descriptions-item>
          <el-descriptions-item v-if="selectedOrder.orderType === 'takeaway'" label="配送地址" :span="2">
            {{ selectedOrder.address }}
          </el-descriptions-item>
          <el-descriptions-item v-if="selectedOrder.orderType === 'takeaway'" label="联系电话" :span="2">
            {{ selectedOrder.phone }}
          </el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">
            {{ selectedOrder.remark || '无' }}
          </el-descriptions-item>
        </el-descriptions>
        
        <h4 style="margin-top: 20px">商品清单</h4>
        <el-table :data="selectedOrder.items" style="margin-top: 10px">
          <el-table-column prop="productName" label="商品名称" />
          <el-table-column prop="price" label="单价">
            <template #default="scope">
              ${{ scope.row.price }}
            </template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" />
          <el-table-column label="小计">
            <template #default="scope">
              ${{ (scope.row.price * scope.row.quantity).toFixed(2) }}
            </template>
          </el-table-column>
        </el-table>
        
        <div class="total-price">
          订单总额：<span style="color: #F56C6C; font-size: 20px; font-weight: bold">
            ${{ selectedOrder.totalPrice }}
          </span>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElNotification } from 'element-plus'
import { getAllOrders, updateOrderStatus, updatePaymentStatus } from '@/api/index'

const loading = ref(false)
const filterType = ref('')
const orders = ref([])
const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0
})

const voiceEnabled = ref(localStorage.getItem('voiceEnabled') === 'true')
const wsConnected = ref(false)
let ws = null

const detailDialogVisible = ref(false)
const selectedOrder = ref(null)

// WebSocket连接
const connectWebSocket = () => {
  const wsUrl = window.location.hostname === 'localhost'
    ? 'ws://localhost:8080/api/ws/order'
    : 'wss://api.liveasy.solutions/api/ws/order'
  ws = new WebSocket(wsUrl)
  
  ws.onopen = () => {
    console.log('WebSocket连接成功')
    wsConnected.value = true
    ElMessage.success('实时通知已连接')
  }
  
  ws.onmessage = (event) => {
    console.log('收到WebSocket消息:', event.data)
    const message = JSON.parse(event.data)
    
    if (message.type === 'new_order') {
      handleNewOrder(message.data)
    }
  }
  
  ws.onerror = (error) => {
    console.error('WebSocket错误:', error)
    wsConnected.value = false
  }
  
  ws.onclose = () => {
    console.log('WebSocket连接关闭')
    wsConnected.value = false
    // 尝试重连
    setTimeout(() => {
      connectWebSocket()
    }, 5000)
  }
}

// 处理新订单
const handleNewOrder = (order) => {
  ElNotification({
    title: '新订单提醒',
    message: `收到新订单 ${order.orderNo}，金额 $${order.totalPrice}`,
    type: 'success',
    duration: 10000
  })
  
  // 语音播报
  if (voiceEnabled.value) {
    speakOrder(order)
  }
  
  // 刷新订单列表
  loadOrders()
}

// 语音播报
const speakOrder = (order) => {
  if ('speechSynthesis' in window) {
    const speech = new SpeechSynthesisUtterance()
    speech.text = `收到新订单，订单号${order.orderNo}，金额${order.totalPrice}元，${order.orderType === 'takeaway' ? '外卖订单' : '到店自取'}`
    speech.lang = 'zh-CN'
    speech.rate = 1.0
    speech.pitch = 1.0
    window.speechSynthesis.speak(speech)
  } else {
    console.warn('浏览器不支持语音播报')
  }
}

// 切换语音播报
const handleVoiceToggle = (value) => {
  localStorage.setItem('voiceEnabled', value)
  ElMessage.success(value ? '语音播报已开启' : '语音播报已关闭')
}

// 加载订单列表
const loadOrders = async () => {
  loading.value = true
  try {
    const params = { page: pagination.value.page, pageSize: pagination.value.pageSize }
    if (filterType.value === 'unpaid') {
      params.paymentStatus = 'unpaid'
    } else if (filterType.value === 'preparing') {
      params.status = 'active'
    } else if (filterType.value === 'completed') {
      params.status = 'completed'
    }
    const res = await getAllOrders(params)
    orders.value = res.data.records
    pagination.value.total = res.data.total
  } catch (error) {
    ElMessage.error('加载订单失败')
  } finally {
    loading.value = false
  }
}

// 更新订单状态
const updateStatus = async (orderId, status) => {
  try {
    await updateOrderStatus({ orderId, status })
    ElMessage.success('订单状态已更新')
    loadOrders()
  } catch (error) {
    ElMessage.error('更新订单状态失败')
  }
}

// 切换付款状态
const togglePaymentStatus = async (order) => {
  const next = order.paymentStatus === 'paid' ? 'unpaid' : 'paid'
  try {
    await updatePaymentStatus({ orderId: order.id, paymentStatus: next })
    ElMessage.success('付款状态已更新')
    loadOrders()
  } catch {
    ElMessage.error('更新付款状态失败')
  }
}

// 查看详情
const viewDetail = (order) => {
  selectedOrder.value = order
  detailDialogVisible.value = true
}

// 解析规格
const parseSpecs = (specsStr) => {
  try {
    const specs = JSON.parse(specsStr)
    return `${specs.sugar}/${specs.temperature}/${specs.addOn}`
  } catch {
    return specsStr
  }
}

// 获取状态类型
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

// 获取状态文本
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

onMounted(() => {
  loadOrders()
  connectWebSocket()
})

onUnmounted(() => {
  if (ws) {
    ws.close()
  }
})
</script>

<style scoped>
.orders-page {
  width: 100%;
}

.order-item {
  margin: 5px 0;
  font-size: 14px;
}

.order-detail {
  padding: 10px;
}

.total-price {
  margin-top: 20px;
  text-align: right;
  font-size: 16px;
}
</style>

