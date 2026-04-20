<template>
    <!-- pages/orderList/orderList.wxml -->
    <view class="order-list-container">
        <!-- 顶部标题 + tab 一体 -->
        <view class="page-header" :style="{ paddingTop: (statusBarHeight + 6) + 'px' }">
            <text class="page-title">ORDER HISTORY</text>
            <view class="tab-section">
                <view :class="'tab-item ' + (currentTab === 'all' ? 'active' : '')" @tap="switchTab" data-tab="all">
                    <text>All</text>
                </view>
                <view :class="'tab-item ' + (currentTab === 'pending' ? 'active' : '')" @tap="switchTab" data-tab="pending">
                    <text>Preparing</text>
                </view>
                <!-- <view :class="'tab-item ' + (currentTab === 'preparing' ? 'active' : '')" @tap="switchTab" data-tab="preparing">
                    <text>制作中</text>
                </view>
                <view :class="'tab-item ' + (currentTab === 'ready' ? 'active' : '')" @tap="switchTab" data-tab="ready">
                    <text>待取餐</text>
                </view> -->
                <view :class="'tab-item ' + (currentTab === 'completed' ? 'active' : '')" @tap="switchTab" data-tab="completed">
                    <text>Finished</text>
                </view>
            </view>
        </view>
        <!-- 主体内容 -->
        <view class="main-content">

            <!-- 订单列表 -->
            <view class="order-content">
                <view v-if="orders.length > 0">
                    <view class="order-item card fade-in" v-for="(item, index) in orders" :key="index">
                        <view class="order-header">
                            <text class="order-id">订单号：{{ item.orderNo }}</text>
                            <view :class="'order-status status-' + item.status">
                                <text>{{ item.statusText }}</text>
                            </view>
                        </view>

                        <view class="order-info">
                            <text class="order-type">{{ item.orderType === 'takeaway' ? '外卖订单' : '自取订单' }}</text>
                            <text class="order-time">{{ item.createTime }}</text>
                        </view>

                        <view class="order-items">
                            <view class="order-product" v-for="(product, index1) in item.items" :key="index1">
                                <image :src="product.productImage" class="product-image" mode="aspectFill" />

                                <view class="product-info">
                                    <text class="product-name">{{ product.productName }}</text>
                                    <text class="product-specs" v-if="product.specs">{{ product.specs }}</text>
                                    <view class="product-bottom">
                                        <text class="product-price">${{ product.price }}</text>
                                        <text class="product-quantity">x{{ product.quantity }}</text>
                                    </view>
                                </view>
                            </view>
                        </view>

                        <view class="order-footer">
                            <text class="order-total">合计：${{ item.totalPrice }}</text>
                            <view class="order-actions">
                                <view v-if="item.status === 'pending' || item.status === 'preparing'" class="action-btn cancel-btn" @tap="cancelOrder" :data-id="item.id">
                                    取消订单
                                </view>
                                <view
                                    v-if="item.status === 'completed'"
                                    class="action-btn review-btn"
                                    @tap="goToReview"
                                    :data-id="item.id"
                                    :data-no="item.orderNo"
                                    :data-reviewed="item.hasReview"
                                >
                                    {{ item.hasReview ? '查看评价' : '去评价' }}
                                </view>
                                <!-- <view wx:if="{{item.status === 'completed'}}" 
                    class="action-btn reorder-btn" 
                    bindtap="reorder" 
                    data-id="{{item.id}}">
                再来一单
              </view> -->
                            </view>
                        </view>
                    </view>
                </view>

                <!-- 订单为空 -->
                <view v-else class="empty-state">
                    <text class="empty-text">No orders yet</text>
                    <view class="go-order-btn" @tap="goOrder">Order Now</view>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
const app = getApp();
const api = require('../../utils/api.js');
export default {
    data() {
        return {
            currentTab: 'all',
            orders: [],
            loading: false,
            statusBarHeight: 0,

            product: {
                productImage: '',
                productName: '',
                specs: '',
                price: '',
                quantity: ''
            }
        };
    },
    onLoad() {
        this.statusBarHeight = uni.getSystemInfoSync().statusBarHeight;
        this.loadOrders();
    },
    onShow() {
        this.loadOrders();
    },
    // 下拉刷新
    onPullDownRefresh() {
        this.loadOrders();
        setTimeout(() => {
            uni.stopPullDownRefresh();
        }, 1000);
    },
    methods: {
        // 从后端加载订单列表
        async loadOrders() {
            try {
                this.setData({
                    loading: true
                });
                uni.showLoading({
                    title: '加载中...'
                });

                // 根据选项卡加载不同状态的订单
                const status = this.currentTab === 'all' ? '' : this.currentTab;
                const params = { status, page: 1, pageSize: 50 };
                if (!app.globalData.isLogin) {
                    params.guestId = app.globalData.guestId;
                }
                const result = await api.getUserOrders(params);

                // 处理订单数据，添加评价状态
                const orders = await Promise.all(
                    result.records.map(async (item) => {
                        let hasReview = false;

                        // 如果是已完成订单，检查是否已评价
                        if (item.status === 'completed') {
                            try {
                                hasReview = await api.checkHasReviewed(item.id);
                            } catch (error) {
                                console.log('CatchClause', error);
                                console.log('CatchClause', error);
                                console.error('检查评价状态失败', error);
                            }
                        }
                        return {
                            ...item,
                            statusText: this.getStatusText(item.status),
                            createTime: this.formatTime(item.createTime),
                            hasReview: hasReview
                        };
                    })
                );
                this.setData({
                    orders: orders || [],
                    loading: false
                });
                uni.hideLoading();
            } catch (error) {
                console.log('CatchClause', error);
                console.log('CatchClause', error);
                uni.hideLoading();
                console.error('加载订单失败', error);

                this.setData({
                    loading: false
                });
            }
        },

        // 切换标签
        switchTab(e) {
            const tab = e.currentTarget.dataset.tab;
            this.setData({
                currentTab: tab
            });
            this.loadOrders();
        },

        formatTime(time) {
            return time.replace('T', ' ').substring(0, 16);
        },

        // 获取状态文本
        getStatusText(status) {
            const statusMap = {
                pending: '待处理',
                preparing: '制作中',
                ready: '待取餐',
                completed: '已完成',
                cancelled: '已取消'
            };
            return statusMap[status] || '未知状态';
        },

        // 获取状态样式类名
        getStatusClass(status) {
            const classMap = {
                pending: 'status-pending',
                preparing: 'status-preparing',
                ready: 'status-ready',
                completed: 'status-completed',
                cancelled: 'status-cancelled'
            };
            return classMap[status] || '';
        },

        // 查看订单详情
        viewOrderDetail(e) {
            const orderId = e.currentTarget.dataset.id;
            uni.navigateTo({
                url: `/pages/orderDetail/orderDetail?id=${orderId}`
            });
        },

        // 取消订单
        cancelOrder(e) {
            const orderId = e.currentTarget.dataset.id;
            uni.showModal({
                title: '确认取消',
                content: '确定要取消这个订单吗？',
                success: async (res) => {
                    if (res.confirm) {
                        try {
                            uni.showLoading({
                                title: '处理中...'
                            });
                            await api.cancelOrder(orderId);
                            uni.hideLoading();
                            uni.showToast({
                                title: '订单已取消',
                                icon: 'success'
                            });

                            // 重新加载订单列表
                            this.loadOrders();
                        } catch (error) {
                            console.log('CatchClause', error);
                            console.log('CatchClause', error);
                            uni.hideLoading();
                            console.error('取消订单失败', error);
                            uni.showToast({
                                title: '取消订单失败',
                                icon: 'none'
                            });
                        }
                    }
                }
            });
        },

        // 再来一单
        async reorder(e) {
            const orderId = e.currentTarget.dataset.id;
            try {
                uni.showLoading({
                    title: '加载中...'
                });

                // 获取订单详情（包含订单项）
                const orderDetail = await api.getOrderDetail(orderId);
                uni.hideLoading();
                if (!orderDetail || !orderDetail.items || orderDetail.items.length === 0) {
                    uni.showToast({
                        title: '订单信息不完整',
                        icon: 'none'
                    });
                    return;
                }
                uni.showModal({
                    title: '再来一单',
                    content: '确定要重新下单吗？',
                    success: async (res) => {
                        if (res.confirm) {
                            // 清空当前购物车
                            await app.globalData.clearCart();

                            // 将订单商品添加到购物车
                            for (const item of orderDetail.items) {
                                await app.globalData.addToCart({
                                    id: item.productId,
                                    name: item.productName,
                                    price: item.price,
                                    image: item.productImage,
                                    quantity: item.quantity,
                                    specs: item.specs
                                        ? typeof item.specs === 'string'
                                            ? JSON.parse(item.specs)
                                            : item.specs
                                        : {
                                              sugar: '正常糖',
                                              temperature: '正常冰',
                                              addOn: '不加料'
                                          }
                                });
                            }
                            uni.showToast({
                                title: '已添加到购物车',
                                icon: 'success'
                            });

                            // 跳转到点单页面
                            setTimeout(() => {
                                uni.switchTab({
                                    url: '/pages/order/order'
                                });
                            }, 1500);
                        }
                    }
                });
            } catch (error) {
                console.log('CatchClause', error);
                console.log('CatchClause', error);
                uni.hideLoading();
                console.error('加载订单详情失败', error);
                uni.showToast({
                    title: '操作失败',
                    icon: 'none'
                });
            }
        },

        // 去点单
        goOrder() {
            uni.switchTab({
                url: '/pages/order/order'
            });
        },

        // 去评价或查看评价
        goToReview(e) {
            const { id, no, reviewed } = e.currentTarget.dataset;
            if (reviewed) {
                // 查看评价
                uni.navigateTo({
                    url: `/pages/review-detail/review-detail?orderId=${id}&orderNo=${no}`
                });
            } else {
                // 去评价
                uni.navigateTo({
                    url: `/pages/review/review?orderId=${id}&orderNo=${no}`
                });
            }
        }
    }
};
</script>
<style>
/* pages/orderList/orderList.wxss */
.order-list-container {
    background-color: #f8f8f8;
    min-height: 100vh;
}

.page-header {
    background-color: #ffffff;
    padding: 0 30rpx 0;
    border-bottom: 1rpx solid #e8e8e8;
}

.page-title {
    font-size: 44rpx;
    font-weight: bold;
    color: #000000;
    letter-spacing: 2rpx;
    display: block;
    margin-bottom: 24rpx;
}

.main-content {
    padding-top: 0;
    padding-bottom: 20rpx;
}

/* 切换标签 */
.tab-section {
    display: flex;
    background-color: #fff;
}

.tab-item {
    padding: 16rpx 24rpx;
    font-size: 26rpx;
    color: #999;
    border-bottom: 4rpx solid transparent;
    transition: all 0.2s ease;
}

.tab-item.active {
    color: #5D3A1A;
    font-weight: bold;
    border-bottom: 4rpx solid #5D3A1A;
}

/* 订单状态样式 */
.status-pending {
    color: #ff9800;
    background-color: #fff3e0;
}

.status-preparing {
    color: #2196f3;
    background-color: #e3f2fd;
}

.status-ready {
    color: #4caf50;
    background-color: #e8f5e9;
}

.status-completed {
    color: #9e9e9e;
    background-color: #f5f5f5;
}

.status-cancelled {
    color: #f44336;
    background-color: #ffebee;
}

/* 订单内容 */
.order-content {
    padding: 0 20rpx;
}

.order-item {
    margin-bottom: 30rpx;
    padding: 30rpx;
}

/* 订单头部 */
.order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
    padding-bottom: 20rpx;
    border-bottom: 1rpx solid #f0f0f0;
}

.order-id {
    font-size: 28rpx;
    color: #333;
    font-weight: bold;
}

.order-status {
    padding: 8rpx 16rpx;
    border-radius: 20rpx;
    font-size: 24rpx;
    font-weight: bold;
}

.order-status.pending {
    background-color: #fff3cd;
    color: #856404;
}

.order-status.preparing {
    background-color: #d4edda;
    color: #155724;
}

.order-status.ready {
    background-color: #cce5ff;
    color: #004085;
}

.order-status.completed {
    background-color: #d1ecf1;
    color: #0c5460;
}

.order-status.cancelled {
    background-color: #f8d7da;
    color: #721c24;
}

/* 订单信息 */
.order-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
}

.order-type {
    font-size: 26rpx;
    color: #666;
}

.order-time {
    font-size: 24rpx;
    color: #999;
}

/* 订单商品 */
.order-items {
    margin-bottom: 20rpx;
}

.order-product {
    display: flex;
    align-items: center;
    padding: 15rpx 0;
    border-bottom: 1rpx solid #f5f5f5;
}

.order-product:last-child {
    border-bottom: none;
}

.product-image {
    width: 80rpx;
    height: 80rpx;
    border-radius: 8rpx;
    margin-right: 20rpx;
}

.product-info {
    flex: 1;
}

.product-name {
    font-size: 26rpx;
    color: #333;
    font-weight: bold;
    margin-bottom: 8rpx;
    display: block;
}

.product-specs {
    font-size: 22rpx;
    color: #999;
    margin-bottom: 8rpx;
    display: block;
}

.product-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.product-price {
    font-size: 26rpx;
    color: #aad08f;
    font-weight: bold;
}

.product-quantity {
    font-size: 24rpx;
    color: #666;
}

/* 订单底部 */
.order-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 20rpx;
    border-top: 1rpx solid #f0f0f0;
}

.order-total {
    font-size: 32rpx;
    color: #333;
    font-weight: bold;
}

.order-actions {
    display: flex;
    gap: 20rpx;
}

.action-btn {
    padding: 16rpx 32rpx;
    border-radius: 50rpx;
    font-size: 24rpx;
    text-align: center;
    transition: all 0.3s ease;
}

.cancel-btn {
    background-color: #f8f8f8;
    color: #666;
    border: 1rpx solid #e0e0e0;
}

.review-btn {
    background: linear-gradient(135deg, #ffb74d 0%, #ffa726 100%);
    color: #fff;
}

.reorder-btn {
    background: linear-gradient(135deg, #aad08f 0%, #8bc34a 100%);
    color: #fff;
}

.action-btn:active {
    transform: scale(0.95);
}

/* 空状态 */
.empty-state {
    text-align: center;
    padding: 100rpx 20rpx;
}

.empty-image {
    width: 200rpx;
    height: 200rpx;
    margin-bottom: 30rpx;
    opacity: 0.5;
}

.empty-text {
    font-size: 28rpx;
    color: #999;
    margin-bottom: 40rpx;
    display: block;
}

.go-order-btn {
    background-color: #5D3A1A;
    color: #fff;
    border-radius: 0;
    padding: 20rpx 60rpx;
    font-size: 28rpx;
    font-weight: bold;
    display: inline-block;
    transition: all 0.3s ease;
}

.go-order-btn:active {
    transform: scale(0.95);
}
</style>
