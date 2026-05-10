<template>
  <div class="banners-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>轮播图管理</span>
          <el-button type="primary" @click="openDialog(null)">
            <el-icon><Plus /></el-icon>
            添加轮播图
          </el-button>
        </div>
      </template>

      <!-- 轮播图表格 -->
      <el-table :data="bannerList" border stripe>
        <el-table-column label="ID" prop="id" width="80" />
        
        <el-table-column label="图片" width="200">
          <template #default="{ row }">
            <el-image
              :src="row.image"
              :preview-src-list="[row.image]"
              fit="cover"
              style="width: 150px; height: 80px"
            />
          </template>
        </el-table-column>
        
        <el-table-column label="标题" prop="title" />
        
        <el-table-column label="链接类型" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.linkType === 'product'">商品</el-tag>
            <el-tag v-else-if="row.linkType === 'category'" type="success">分类</el-tag>
            <el-tag v-else type="info">无</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="链接ID" prop="linkId" width="100" />
        
        <el-table-column label="排序" prop="sort" width="100" />
        
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="toggleStatus(row)"
            />
          </template>
        </el-table-column>
        
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="openDialog(row)">编辑</el-button>
            <el-button type="danger" size="small" @click="deleteBanner(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑轮播图' : '添加轮播图'"
      width="600px"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入标题" />
        </el-form-item>
        
        <el-form-item label="图片" prop="image">
          <el-upload
            class="banner-uploader"
            :show-file-list="false"
            :before-upload="beforeImageUpload"
            :http-request="handleImageUpload"
            accept="image/*"
          >
            <el-image
              v-if="form.image"
              :src="getImageUrl(form.image)"
              fit="cover"
              style="width: 100%; height: 200px; cursor: pointer"
            >
              <template #error>
                <div class="image-slot">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
            <div v-else class="upload-placeholder">
              <el-icon class="upload-icon"><Plus /></el-icon>
              <div class="upload-text">点击上传图片</div>
            </div>
          </el-upload>
          <div class="upload-tip">建议尺寸：750x400像素，支持jpg、png格式，大小不超过2MB</div>
        </el-form-item>
        
        <el-form-item label="链接类型" prop="linkType">
          <el-select v-model="form.linkType" placeholder="请选择链接类型">
            <el-option label="无" value="none" />
            <el-option label="商品" value="product" />
            <el-option label="分类" value="category" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="链接ID" prop="linkId" v-if="form.linkType !== 'none'">
          <el-input-number v-model="form.linkId" :min="1" placeholder="请输入链接ID" />
        </el-form-item>
        
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" placeholder="请输入排序" />
        </el-form-item>
        
        <el-form-item label="状态" prop="status">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Plus, Picture } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getBannerList, addBanner, updateBanner, deleteBanner as deleteBannerApi, toggleBannerStatus, uploadFile } from '@/api/index'

const bannerList = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const uploading = ref(false)

const form = reactive({
  id: null,
  title: '',
  image: '',
  linkType: 'none',
  linkId: null,
  sort: 0,
  status: 1
})

const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  image: [{ required: true, message: '请上传图片', trigger: 'blur' }],
  linkType: [{ required: true, message: '请选择链接类型', trigger: 'change' }],
  sort: [{ required: true, message: '请输入排序', trigger: 'blur' }]
}

// 获取图片完整URL
const getImageUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  // 如果是相对路径，直接使用（因为文件服务和API在同一个服务器）
  return url
}

// 加载轮播图列表
const loadBannerList = async () => {
  try {
    const res = await getBannerList()
    bannerList.value = res.data || []
  } catch (error) {
    ElMessage.error('加载失败')
  }
}

// 打开对话框
const openDialog = (row) => {
  if (row) {
    isEdit.value = true
    Object.assign(form, row)
  } else {
    isEdit.value = false
    Object.assign(form, {
      id: null,
      title: '',
      image: '',
      linkType: 'none',
      linkId: null,
      sort: 0,
      status: 1
    })
  }
  dialogVisible.value = true
}

// 图片上传前验证
const beforeImageUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 10

  if (!isImage) {
    ElMessage.error('只能上传图片文件！')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB！')
    return false
  }
  return true
}

// 自定义图片上传
const handleImageUpload = async ({ file }) => {
  uploading.value = true
  try {
    const result = await uploadFile(file)
    form.image = result.data.url
    ElMessage.success('图片上传成功')
  } catch (error) {
    ElMessage.error('图片上传失败')
  } finally {
    uploading.value = false
  }
}

// 提交表单
const submitForm = async () => {
  if (!form.image) {
    ElMessage.error('请上传轮播图图片')
    return
  }
  
  if (!formRef.value) {
    ElMessage.error('表单未初始化')
    return
  }
  
  try {
    await formRef.value.validate()
  } catch (error) {
    return
  }
  
  try {
    if (isEdit.value) {
      await updateBanner(form)
      ElMessage.success('更新成功')
    } else {
      await addBanner(form)
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    loadBannerList()
  } catch (error) {
    ElMessage.error(isEdit.value ? '更新失败' : '添加失败')
  }
}

// 切换状态
const toggleStatus = async (row) => {
  try {
    await toggleBannerStatus(row.id)
    ElMessage.success('状态更新成功')
  } catch (error) {
    ElMessage.error('状态更新失败')
    row.status = row.status === 1 ? 0 : 1
  }
}

// 删除轮播图
const deleteBanner = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这个轮播图吗？', '提示', {
      type: 'warning'
    })
    
    await deleteBannerApi(id)
    ElMessage.success('删除成功')
    loadBannerList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-CN')
}

onMounted(() => {
  loadBannerList()
})
</script>

<style scoped>
.banners-page {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.banner-uploader {
  width: 100%;
}

.upload-placeholder {
  width: 100%;
  height: 200px;
  border: 2px dashed #d9d9d9;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: border-color 0.3s;
}

.upload-placeholder:hover {
  border-color: #409eff;
}

.upload-icon {
  font-size: 48px;
  color: #8c939d;
  margin-bottom: 16px;
}

.upload-text {
  font-size: 14px;
  color: #8c939d;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  color: #909399;
  font-size: 48px;
}

.upload-tip {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
  line-height: 1.5;
}
</style>

