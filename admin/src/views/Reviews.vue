<template>
  <div class="reviews-page">
    <el-card class="toolbar">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-select v-model="filterStatus" placeholder="评价状态" clearable @change="loadReviews">
            <el-option label="全部" value="" />
            <el-option label="显示" :value="1" />
            <el-option label="隐藏" :value="0" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-select v-model="filterRating" placeholder="评分筛选" clearable @change="loadReviews">
            <el-option label="全部评分" value="" />
            <el-option label="5星好评" :value="5" />
            <el-option label="4星" :value="4" />
            <el-option label="3星" :value="3" />
            <el-option label="2星" :value="2" />
            <el-option label="1星差评" :value="1" />
          </el-select>
        </el-col>
      </el-row>
    </el-card>

    <el-card style="margin-top: 20px">
      <el-table :data="reviews" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="订单编号" width="200">
          <template #default="scope">
            <div style="display: flex; align-items: center; gap: 10px">
              <span>{{ scope.row.orderNo }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="用户" width="150">
          <template #default="scope">
            {{ scope.row.userName }}
          </template>
        </el-table-column>
        <el-table-column label="评分" width="150">
          <template #default="scope">
            <el-rate v-model="scope.row.rating" disabled show-score />
          </template>
        </el-table-column>
        <el-table-column prop="content" label="评价内容" min-width="200" show-overflow-tooltip />
        <el-table-column label="图片" width="100">
          <template #default="scope">
            <div v-if="scope.row.images" style="display: flex; gap: 5px">
              <el-image
                v-for="(img, index) in getImages(scope.row.images)"
                :key="index"
                :src="img"
                style="width: 40px; height: 40px"
                fit="cover"
                :preview-src-list="getImages(scope.row.images)"
              />
            </div>
            <span v-else style="color: #999">无</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '显示' : '隐藏' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="评价时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="handleReply(scope.row)">
              {{ scope.row.reply ? '查看回复' : '回复' }}
            </el-button>
            <el-button 
              size="small" 
              :type="scope.row.status === 1 ? 'warning' : 'success'"
              @click="toggleReviewStatus(scope.row)"
            >
              {{ scope.row.status === 1 ? '隐藏' : '显示' }}
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
        @current-change="loadReviews"
      />
    </el-card>

    <!-- 回复对话框 -->
    <el-dialog v-model="replyDialogVisible" title="回复评价" width="600px">
      <div v-if="selectedReview">
        <el-descriptions :column="1" border style="margin-bottom: 20px">
          <el-descriptions-item label="评分">
            <el-rate v-model="selectedReview.rating" disabled />
          </el-descriptions-item>
          <el-descriptions-item label="评价内容">
            {{ selectedReview.content }}
          </el-descriptions-item>
          <el-descriptions-item label="评价时间">
            {{ selectedReview.createTime }}
          </el-descriptions-item>
        </el-descriptions>

        <div v-if="selectedReview.reply" style="margin-bottom: 20px">
          <h4>当前回复</h4>
          <div style="padding: 10px; background-color: #f5f5f5; border-radius: 4px">
            {{ selectedReview.reply }}
          </div>
          <div style="color: #999; font-size: 12px; margin-top: 5px">
            回复时间：{{ selectedReview.replyTime }}
          </div>
        </div>

        <el-form :model="replyForm" :rules="replyRules" ref="replyFormRef">
          <el-form-item label="回复内容" prop="reply">
            <el-input
              v-model="replyForm.reply"
              type="textarea"
              :rows="4"
              placeholder="请输入回复内容"
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="replyDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitReply" :loading="submitting">提交回复</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { replyReview, updateReviewStatus } from '@/api/index'
import request from '@/utils/request'

const loading = ref(false)
const submitting = ref(false)
const filterStatus = ref('')
const filterRating = ref('')
const reviews = ref([])
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const replyDialogVisible = ref(false)
const selectedReview = ref(null)
const replyFormRef = ref()
const replyForm = reactive({
  reply: ''
})

const replyRules = {
  reply: [
    { required: true, message: '请输入回复内容', trigger: 'blur' },
    { min: 5, message: '回复内容至少5个字符', trigger: 'blur' }
  ]
}

// 解析图片
const getImages = (imagesStr) => {
  if (!imagesStr) return []
  return imagesStr.split(',').filter(img => img)
}

// 加载评价列表
const loadReviews = async () => {
  loading.value = true
  try {
    const res = await request({
      url: '/review/all',
      method: 'get',
      params: {
        status: filterStatus.value,
        rating: filterRating.value,
        page: pagination.page,
        pageSize: pagination.pageSize
      }
    })
    reviews.value = res.data.records || []
    pagination.total = res.data.total || 0
  } catch (error) {
    ElMessage.warning('评价列表接口暂未实现，显示模拟数据')
    reviews.value = []
  } finally {
    loading.value = false
  }
}

// 回复评价
const handleReply = (review) => {
  selectedReview.value = review
  replyForm.reply = review.reply || ''
  replyDialogVisible.value = true
}

// 提交回复
const submitReply = async () => {
  await replyFormRef.value.validate()
  
  submitting.value = true
  try {
    await replyReview({
      reviewId: selectedReview.value.id,
      reply: replyForm.reply
    })
    ElMessage.success('回复成功')
    replyDialogVisible.value = false
    loadReviews()
  } catch (error) {
    ElMessage.error('回复失败')
  } finally {
    submitting.value = false
  }
}

// 切换评价状态
const toggleReviewStatus = (review) => {
  const action = review.status === 1 ? '隐藏' : '显示'
  ElMessageBox.confirm(`确定要${action}该评价吗？`, '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await updateReviewStatus({
        reviewId: review.id,
        status: review.status === 1 ? 0 : 1
      })
      ElMessage.success(`${action}成功`)
      loadReviews()
    } catch (error) {
      ElMessage.error(`${action}失败`)
    }
  })
}

onMounted(() => {
  loadReviews()
})
</script>

<style scoped>
.reviews-page {
  width: 100%;
}
</style>
