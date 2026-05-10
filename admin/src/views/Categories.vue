<template>
  <div class="categories-page">
    <el-card class="toolbar">
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon> 添加分类
      </el-button>
    </el-card>

    <el-card style="margin-top: 20px">
      <el-table :data="categories" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="分类图标" width="100">
          <template #default="scope">
            <el-image 
              v-if="scope.row.icon" 
              :src="scope.row.icon" 
              style="width: 50px; height: 50px" 
              fit="cover" 
            />
          </template>
        </el-table-column>
        <el-table-column prop="name" label="分类名称" />
        <el-table-column prop="sort" label="排序" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="分类图标" prop="icon">
          <el-upload
            class="icon-uploader"
            :show-file-list="false"
            :before-upload="beforeIconUpload"
            :http-request="handleIconUpload"
            accept="image/*"
          >
            <el-image v-if="form.icon" :src="form.icon" class="uploaded-icon" fit="cover">
              <template #error>
                <div class="image-slot">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
            <div v-else class="icon-uploader-placeholder">
              <el-icon class="icon-uploader-icon"><Plus /></el-icon>
              <div class="icon-uploader-text">点击上传图标</div>
            </div>
          </el-upload>
          <div style="margin-top: 10px; color: #999; font-size: 12px">
            建议尺寸：100x100像素，支持jpg、png格式，大小不超过1MB
          </div>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">显示</el-radio>
            <el-radio :label="0">隐藏</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Plus, Picture } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAllCategories, addCategory, updateCategory, deleteCategory, uploadFile } from '@/api/index'

const loading = ref(false)
const submitting = ref(false)
const uploading = ref(false)
const categories = ref([])

const dialogVisible = ref(false)
const dialogTitle = ref('添加分类')
const formRef = ref()

const form = ref({
  name: '',
  icon: '',
  sort: 0,
  status: 1
})

const rules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' }
  ],
  icon: [
    { required: true, message: '请输入图标路径', trigger: 'blur' }
  ]
}

const loadCategories = async () => {
  loading.value = true
  try {
    const res = await getAllCategories()
    categories.value = res.data || []
  } catch (error) {
    ElMessage.error('加载分类失败')
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  dialogTitle.value = '添加分类'
  form.value = {
    name: '',
    icon: '',
    sort: 0,
    status: 1
  }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑分类'
  form.value = { ...row }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
  } catch (error) {
    return
  }
  
  submitting.value = true
  try {
    if (form.value.id) {
      await updateCategory(form.value)
      ElMessage.success('更新成功')
    } else {
      await addCategory(form.value)
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    loadCategories()
  } catch (error) {
    ElMessage.error('操作失败')
  } finally {
    submitting.value = false
  }
}

const handleStatusChange = async (row) => {
  try {
    await updateCategory(row)
    ElMessage.success('状态更新成功')
  } catch (error) {
    ElMessage.error('状态更新失败')
    loadCategories()
  }
}

// 图标上传前验证
const beforeIconUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt1M = file.size / 1024 / 1024 < 1

  if (!isImage) {
    ElMessage.error('只能上传图片文件！')
    return false
  }
  if (!isLt1M) {
    ElMessage.error('图片大小不能超过 1MB！')
    return false
  }
  return true
}

// 自定义图标上传
const handleIconUpload = async ({ file }) => {
  uploading.value = true
  try {
    const result = await uploadFile(file)
    form.value.icon = result.data.url
    ElMessage.success('图标上传成功')
  } catch (error) {
    ElMessage.error('图标上传失败')
  } finally {
    uploading.value = false
  }
}

const handleDelete = (id) => {
  ElMessageBox.confirm('确定要删除该分类吗？删除后无法恢复！', '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await deleteCategory(id)
      ElMessage.success('删除成功')
      loadCategories()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}

onMounted(() => {
  loadCategories()
})
</script>

<style scoped>
.categories-page {
  width: 100%;
}

.icon-uploader {
  display: inline-block;
}

.icon-uploader-placeholder {
  width: 100px;
  height: 100px;
  border: 2px dashed #d9d9d9;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.3s;
}

.icon-uploader-placeholder:hover {
  border-color: #409eff;
}

.icon-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  margin-bottom: 8px;
}

.icon-uploader-text {
  font-size: 12px;
  color: #8c939d;
}

.uploaded-icon {
  width: 100px;
  height: 100px;
  display: block;
  border-radius: 6px;
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
</style>
