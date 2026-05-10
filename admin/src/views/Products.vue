<template>
  <div class="products-page">
    <el-card class="toolbar">
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon> 添加商品
      </el-button>
    </el-card>

    <el-card style="margin-top: 20px">
      <el-table :data="products" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="商品图片" width="100">
          <template #default="scope">
            <el-image :src="scope.row.image" style="width: 60px; height: 60px" fit="cover" />
          </template>
        </el-table-column>
        <el-table-column prop="name" label="商品名称" />
        <el-table-column label="分类" width="120">
          <template #default="scope">
            {{ getCategoryName(scope.row.categoryId) }}
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格" width="100">
          <template #default="scope">
            ${{ scope.row.price }}
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="100" />
        <el-table-column prop="sales" label="销量" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '上架' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        layout="total, prev, pager, next"
        style="margin-top: 20px; text-align: right"
        @current-change="loadProducts"
      />
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="商品名称">
          <el-input v-model="form.name" />
        </el-form-item>
        
        <el-form-item label="商品分类" required>
          <el-select v-model="form.categoryId" placeholder="请选择分类" style="width: 100%">
            <el-option
              v-for="category in categories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="商品图片">
          <el-upload
            class="image-uploader"
            :show-file-list="false"
            :before-upload="beforeImageUpload"
            :http-request="handleImageUpload"
            accept="image/*"
          >
            <el-image v-if="form.image" :src="getImageUrl(form.image)" class="uploaded-image" fit="cover">
              <template #error>
                <div class="image-slot">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
            <el-icon v-else class="image-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">支持jpg、png格式，大小不超过2MB</div>
        </el-form-item>
        
        <el-form-item label="商品描述">
          <el-input v-model="form.description" type="textarea" :rows="3" />
        </el-form-item>
        
        <el-form-item label="价格">
          <el-input-number v-model="form.price" :min="0" :precision="2" :step="0.1" />
        </el-form-item>
        
        <el-form-item label="库存">
          <el-input-number v-model="form.stock" :min="0" />
        </el-form-item>
        
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">上架</el-radio>
            <el-radio :label="0">下架</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="uploading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Plus, Picture } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getProductPage, addProduct, updateProduct, deleteProduct, uploadFile, getAllCategories } from '@/api/index'

const loading = ref(false)
const uploading = ref(false)
const products = ref([])
const categories = ref([])
const pagination = ref({ page: 1, pageSize: 10, total: 0 })

const dialogVisible = ref(false)
const dialogTitle = ref('添加商品')
const form = ref({
  name: '',
  categoryId: null,
  description: '',
  image: '',
  price: 0,
  stock: 0,
  status: 1
})

// 获取图片完整URL
const getImageUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  // 如果是相对路径，直接使用（因为文件服务和API在同一个服务器）
  return url
}

// 加载分类列表
const loadCategories = async () => {
  try {
    const res = await getAllCategories()
    categories.value = res.data || []
  } catch (error) {
    ElMessage.error('加载分类失败')
  }
}

// 获取分类名称
const getCategoryName = (categoryId) => {
  const category = categories.value.find(c => c.id === categoryId)
  return category ? category.name : '未分类'
}

const loadProducts = async () => {
  loading.value = true
  try {
    const res = await getProductPage({ page: pagination.value.page, pageSize: pagination.value.pageSize })
    products.value = res.data.records
    pagination.value.total = res.data.total
  } catch (error) {
    ElMessage.error('加载商品失败')
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  dialogTitle.value = '添加商品'
  form.value = { name: '', categoryId: null, description: '', image: '', price: 0, stock: 0, status: 1 }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑商品'
  form.value = { ...row }
  dialogVisible.value = true
}

// 图片上传前验证
const beforeImageUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

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
    form.value.image = result.data.url
    ElMessage.success('图片上传成功')
  } catch (error) {
    ElMessage.error('图片上传失败')
  } finally {
    uploading.value = false
  }
}

const handleSubmit = async () => {
  if (!form.value.name) {
    ElMessage.error('请输入商品名称')
    return
  }
  if (!form.value.categoryId) {
    ElMessage.error('请选择商品分类')
    return
  }
  if (!form.value.image) {
    ElMessage.error('请上传商品图片')
    return
  }
  if (!form.value.price || form.value.price <= 0) {
    ElMessage.error('请输入正确的价格')
    return
  }
  
  try {
    if (form.value.id) {
      await updateProduct(form.value)
      ElMessage.success('更新成功')
    } else {
      await addProduct(form.value)
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    loadProducts()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleDelete = (id) => {
  ElMessageBox.confirm('确定要删除该商品吗？', '提示', { type: 'warning' })
    .then(async () => {
      await deleteProduct(id)
      ElMessage.success('删除成功')
      loadProducts()
    })
}

onMounted(() => {
  loadCategories()
  loadProducts()
})
</script>

<style scoped>
.products-page {
  width: 100%;
}

.image-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color 0.3s;
}

.image-uploader:hover {
  border-color: #409eff;
}

.image-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 148px;
  height: 148px;
  text-align: center;
  line-height: 148px;
}

.uploaded-image {
  width: 148px;
  height: 148px;
  display: block;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  color: #909399;
  font-size: 30px;
}

.upload-tip {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}
</style>

