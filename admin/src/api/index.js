import request from '@/utils/request'

// 管理员登录
export function login(data) {
  return request({
    url: '/admin/login',
    method: 'post',
    data
  })
}

// 获取管理员信息
export function getAdminInfo() {
  return request({
    url: '/admin/info',
    method: 'get'
  })
}

// 获取所有订单
export function getAllOrders(params) {
  return request({
    url: '/order/all',
    method: 'get',
    params
  })
}

// 更新订单状态
export function updateOrderStatus(data) {
  return request({
    url: '/order/update-status',
    method: 'put',
    data
  })
}

// 更新付款状态
export function updatePaymentStatus(data) {
  return request({
    url: '/order/update-payment-status',
    method: 'put',
    data
  })
}

// 获取所有分类
export function getAllCategories() {
  return request({
    url: '/category/all',
    method: 'get'
  })
}

// 添加分类
export function addCategory(data) {
  return request({
    url: '/category/add',
    method: 'post',
    data
  })
}

// 更新分类
export function updateCategory(data) {
  return request({
    url: '/category/update',
    method: 'put',
    data
  })
}

// 删除分类
export function deleteCategory(id) {
  return request({
    url: `/category/delete/${id}`,
    method: 'delete'
  })
}

// 获取商品分页
export function getProductPage(params) {
  return request({
    url: '/product/page',
    method: 'get',
    params
  })
}

// 添加商品
export function addProduct(data) {
  return request({
    url: '/product/add',
    method: 'post',
    data
  })
}

// 更新商品
export function updateProduct(data) {
  return request({
    url: '/product/update',
    method: 'put',
    data
  })
}

// 删除商品
export function deleteProduct(id) {
  return request({
    url: `/product/delete/${id}`,
    method: 'delete'
  })
}

// 回复评价
export function replyReview(data) {
  return request({
    url: '/review/reply',
    method: 'put',
    data
  })
}

// 更新评价状态
export function updateReviewStatus(data) {
  return request({
    url: '/review/status',
    method: 'put',
    data
  })
}

// ========== 轮播图管理 ==========

// 获取轮播图列表
export function getBannerList() {
  return request({
    url: '/banner/admin/list',
    method: 'get'
  })
}

// 添加轮播图
export function addBanner(data) {
  return request({
    url: '/banner/admin/add',
    method: 'post',
    data
  })
}

// 更新轮播图
export function updateBanner(data) {
  return request({
    url: '/banner/admin/update',
    method: 'put',
    data
  })
}

// 删除轮播图
export function deleteBanner(id) {
  return request({
    url: `/banner/admin/delete/${id}`,
    method: 'delete'
  })
}

// 切换轮播图状态
export function toggleBannerStatus(id) {
  return request({
    url: `/banner/admin/toggleStatus/${id}`,
    method: 'put'
  })
}

// ========== 文件上传 ==========

// 上传单个文件
export function uploadFile(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/file/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 上传多个文件
export function uploadFiles(files) {
  const formData = new FormData()
  files.forEach(file => {
    formData.append('files', file)
  })
  return request({
    url: '/file/uploads',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 删除文件
export function deleteFile(url) {
  return request({
    url: '/file/delete',
    method: 'delete',
    params: { url }
  })
}

