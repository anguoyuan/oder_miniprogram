// API接口封装
const request = require('./request.js');

// ==================== 用户相关 ====================

/**
 * 微信登录
 */
function wxLogin(data) {
    return request.post('/user/wx-login', data, false);
}

/**
 * 获取用户信息
 */
function getUserInfo() {
    return request.get('/user/info');
}

/**
 * 更新用户信息
 */
function updateUserInfo(data) {
    return request.put('/user/update', data);
}

/**
 * 获取轮播图列表
 */
function getBannerList() {
    return request.get('/banner/list', null, false);
}

// ==================== 商品相关 ====================

/**
 * 获取分类列表
 */
function getCategoryList() {
    return request.get('/category/list');
}

/**
 * 根据分类获取商品
 */
function getProductsByCategory(categoryId) {
    return request.get(`/product/list/${categoryId}`);
}

/**
 * 获取商品详情
 */
function getProductDetail(productId) {
    return request.get(`/product/detail/${productId}`);
}

// ==================== 购物车相关 ====================

/**
 * 获取购物车列表
 */
function getCartList() {
    return request.get('/cart/list');
}

/**
 * 添加到购物车
 */
function addToCart(data) {
    return request.post('/cart/add', data);
}

/**
 * 更新购物车数量
 */
function updateCartQuantity(data) {
    return request.put('/cart/update', data);
}

/**
 * 删除购物车商品
 */
function removeCartItem(cartId) {
    return request.delete(`/cart/remove/${cartId}`);
}

/**
 * 清空购物车
 */
function clearCart() {
    return request.delete('/cart/clear');
}

// ==================== 订单相关 ====================

/**
 * 创建订单
 */
function createOrder(data) {
    return request.post('/order/create', data, false);
}

/**
 * 获取订单详情
 */
function getOrderDetail(orderId) {
    return request.get(`/order/detail/${orderId}`);
}

/**
 * 获取用户订单列表
 */
function getUserOrders(params) {
    return request.get('/order/user-orders', params);
}

/**
 * 取消订单
 */
function cancelOrder(orderId) {
    return request.put(`/order/cancel/${orderId}`);
}

// ==================== 收藏相关 ====================

/**
 * 添加收藏
 */
function addFavorite(productId) {
    return request.post('/favorite/add', {
        productId
    });
}

/**
 * 取消收藏
 */
function removeFavorite(productId) {
    return request.delete(`/favorite/remove?productId=${productId}`);
}

/**
 * 获取收藏列表
 */
function getFavorites() {
    return request.get('/favorite/list');
}

/**
 * 检查商品是否已收藏
 */

// ==================== 点赞相关 ====================
/**
 * 添加点赞
 */
function addLike(productId) {
    return request.post('/like/add', {
        productId
    });
}

/**
 * 取消点赞
 */
function removeLike(productId) {
    return request.delete(`/like/remove?productId=${productId}`);
}
function getLikes() {
    return request.get('/like/list');
}

/**
 * 检查商品是否已点赞
 */

// ==================== 地址相关 ====================
/**
 * 获取地址列表
 */
function getAddressList() {
    return request.get('/address/list');
}

/**
 * 添加地址
 */
function addAddress(data) {
    return request.post('/address/add', data);
}

/**
 * 更新地址
 */
function updateAddress(data) {
    return request.put('/address/update', data);
}

/**
 * 删除地址
 */
function deleteAddress(addressId) {
    return request.delete(`/address/delete/${addressId}`);
}

/**
 * 设置默认地址
 */
function setDefaultAddress(addressId) {
    return request.put(`/address/setDefault/${addressId}`);
}

/**
 * 验证地址配送范围
 */
function checkDeliveryRange(latitude, longitude) {
    return request.post('/address/checkDeliveryRange', {
        latitude,
        longitude
    });
}

// ==================== 评价相关 ====================

/**
 * 提交评价
 */
function submitReview(data) {
    return request.post('/review/submit', data);
}

/**
 * 获取订单评价
 */
function getOrderReview(orderId) {
    return request.get(`/review/order/${orderId}`);
}

/**
 * 检查订单是否已评价
 */
function checkHasReviewed(orderId) {
    return request.get(`/review/order/${orderId}/hasReviewed`);
}
module.exports = {
    wxLogin,
    getUserInfo,
    updateUserInfo,
    getBannerList,
    getCategoryList,
    getProductsByCategory,
    getProductDetail,
    getCartList,
    addToCart,
    updateCartQuantity,
    removeCartItem,
    clearCart,
    createOrder,
    getOrderDetail,
    getUserOrders,
    cancelOrder,
    addFavorite,
    removeFavorite,
    getFavorites,
    addLike,
    removeLike,
    getLikes,
    getAddressList,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    checkDeliveryRange,
    submitReview,
    getOrderReview,
    checkHasReviewed
};
