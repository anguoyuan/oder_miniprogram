<template>
    <view class="product-detail">
        <view v-if="loading" class="loading">
            <text>加载中...</text>
        </view>

        <view v-else class="detail-content">
            <!-- 商品图片 -->
            <view class="product-image">
                <image :src="product.image" mode="aspectFill" />
            </view>

            <!-- 商品基本信息 -->
            <view class="product-info card">
                <view class="product-header">
                    <view class="product-title">{{ product.name }}</view>
                    <view class="product-price">${{ product.price }}</view>
                </view>
                <view class="product-desc">{{ product.description }}</view>

                <!-- 统计信息 -->
                <view class="product-stats">
                    <view class="stat-item">
                        <text class="stat-label">销量</text>
                        <text class="stat-value">{{ product.sales }}</text>
                    </view>
                    <view class="stat-item">
                        <text class="stat-label">点赞</text>
                        <text class="stat-value">{{ product.likeCount }}</text>
                    </view>
                    <view class="stat-item">
                        <text class="stat-label">收藏</text>
                        <text class="stat-value">{{ product.favoriteCount }}</text>
                    </view>
                </view>
            </view>

            <!-- 配料信息 -->
            <view class="product-ingredients card">
                <view class="section-title">配料信息</view>
                <view class="ingredients-content">
                    <text>{{ product.ingredients || '纯天然原料，精心调制' }}</text>
                </view>
            </view>

            <!-- 商品详情 -->
            <view class="product-details card">
                <view class="section-title">商品详情</view>
                <view class="details-content">
                    <view class="detail-item">
                        <text class="label">分类：</text>
                        <text class="value">{{ product.categoryName }}</text>
                    </view>
                    <view class="detail-item">
                        <text class="label">库存：</text>
                        <text class="value">{{ product.stock }}杯</text>
                    </view>
                    <view class="detail-item">
                        <text class="label">状态：</text>
                        <text class="value">{{ product.status === 1 ? '在售' : '已下架' }}</text>
                    </view>
                </view>
            </view>
        </view>

        <!-- 底部操作栏 -->
        <view class="bottom-bar">
            <view class="action-btns">
                <view class="icon-btn" @tap="toggleFavorite">
                    <text class="icon">{{ isFavorite ? '★' : '☆' }}</text>
                    <text class="text">收藏</text>
                </view>
                <view class="icon-btn" @tap="toggleLike">
                    <text class="icon">{{ isLiked ? '👍' : '👍🏻' }}</text>
                    <text class="text">点赞</text>
                </view>
            </view>
            <view class="cart-btn" @tap="addToCart">加入购物车</view>
            <view class="buy-btn" @tap="buyNow">立即购买</view>
        </view>
    </view>
</template>

<script>
// pages/product-detail/product-detail.js
const app = getApp();
const api = require('../../utils/api.js');
export default {
    data() {
        return {
            product: null,
            loading: true,
            isFavorite: false,
            isLiked: false
        };
    },
    onLoad(options) {
        if (options.id) {
            this.loadProductDetail(options.id);
        }
    },
    methods: {
        // 加载商品详情
        async loadProductDetail(productId) {
            this.setData({
                loading: true
            });
            try {
                const product = await api.getProductDetail(productId);
                this.setData({
                    product: product,
                    loading: false
                });

                // 如果已登录，检查收藏和点赞状态
                if (app.globalData.isLogin) {
                    this.checkFavoriteStatus(productId);
                    this.checkLikeStatus(productId);
                }
            } catch (error) {
                console.log('CatchClause', error);
                console.log('CatchClause', error);
                console.error('加载商品详情失败', error);
                this.setData({
                    loading: false
                });
                uni.showToast({
                    title: '加载失败',
                    icon: 'none'
                });
            }
        },

        // 检查收藏状态
        async checkFavoriteStatus(productId) {
            try {
                const isFavorite = await api.checkFavorite(productId);
                this.setData({
                    isFavorite
                });
            } catch (error) {
                console.log('CatchClause', error);
                console.log('CatchClause', error);
                console.error('检查收藏状态失败', error);
            }
        },

        // 检查点赞状态
        async checkLikeStatus(productId) {
            try {
                const isLiked = await api.checkLike(productId);
                this.setData({
                    isLiked
                });
            } catch (error) {
                console.log('CatchClause', error);
                console.log('CatchClause', error);
                console.error('检查点赞状态失败', error);
            }
        },

        // 切换收藏
        async toggleFavorite() {
            if (!app.globalData.isLogin) {
                uni.showToast({
                    title: '请先登录',
                    icon: 'none'
                });
                return;
            }
            try {
                if (this.isFavorite) {
                    await api.removeFavorite(this.product.id);
                    this.setData({
                        isFavorite: false,
                        'product.favoriteCount': this.product.favoriteCount - 1
                    });
                    uni.showToast({
                        title: '取消收藏',
                        icon: 'success'
                    });
                } else {
                    await api.addFavorite(this.product.id);
                    this.setData({
                        isFavorite: true,
                        'product.favoriteCount': this.product.favoriteCount + 1
                    });
                    uni.showToast({
                        title: '收藏成功',
                        icon: 'success'
                    });
                }
            } catch (error) {
                console.log('CatchClause', error);
                console.log('CatchClause', error);
                uni.showToast({
                    title: '操作失败',
                    icon: 'none'
                });
            }
        },

        // 切换点赞
        async toggleLike() {
            if (!app.globalData.isLogin) {
                uni.showToast({
                    title: '请先登录',
                    icon: 'none'
                });
                return;
            }
            try {
                if (this.isLiked) {
                    await api.removeLike(this.product.id);
                    this.setData({
                        isLiked: false,
                        'product.likeCount': this.product.likeCount - 1
                    });
                } else {
                    await api.addLike(this.product.id);
                    this.setData({
                        isLiked: true,
                        'product.likeCount': this.product.likeCount + 1
                    });
                }
            } catch (error) {
                console.log('CatchClause', error);
                console.log('CatchClause', error);
                uni.showToast({
                    title: '操作失败',
                    icon: 'none'
                });
            }
        },

        // 加入购物车
        addToCart() {
            const cartItem = {
                id: this.product.id,
                name: this.product.name,
                description: this.product.description,
                image: this.product.image,
                price: this.product.price,
                quantity: 1,
                specs: {
                    sugar: '标准糖',
                    temperature: '正常冰',
                    addOn: '无'
                }
            };
            app.globalData.addToCart(cartItem);
            uni.showToast({
                title: '已加入购物车',
                icon: 'success'
            });
        },

        // 立即购买
        buyNow() {
            this.addToCart();
            uni.navigateTo({
                url: '/pages/checkout/checkout'
            });
        }
    }
};
</script>
<style>
.product-detail {
    min-height: 100vh;
    background: #f5f5f5;
    padding-bottom: 120rpx;
}

.loading {
    text-align: center;
    padding: 100rpx 0;
    color: #999;
}

.detail-content {
    padding-bottom: 20rpx;
}

.product-image {
    width: 100%;
    height: 500rpx;
    background: #fff;
}

.product-image image {
    width: 100%;
    height: 100%;
}

.card {
    background: #fff;
    margin: 20rpx;
    padding: 30rpx;
    border-radius: 16rpx;
}

.product-info {
    margin-top: 0;
}

.product-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
}

.product-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
    flex: 1;
}

.product-price {
    font-size: 40rpx;
    font-weight: bold;
    color: #ff6b35;
}

.product-desc {
    font-size: 28rpx;
    color: #666;
    line-height: 1.6;
    margin-bottom: 30rpx;
}

.product-stats {
    display: flex;
    padding-top: 20rpx;
    border-top: 1px solid #eee;
}

.stat-item {
    flex: 1;
    text-align: center;
}

.stat-label {
    font-size: 24rpx;
    color: #999;
    display: block;
    margin-bottom: 10rpx;
}

.stat-value {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
}

.section-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
}

.ingredients-content {
    font-size: 28rpx;
    color: #666;
    line-height: 1.8;
}

.details-content {
    font-size: 28rpx;
}

.detail-item {
    display: flex;
    padding: 15rpx 0;
}

.detail-item .label {
    color: #999;
    width: 120rpx;
}

.detail-item .value {
    color: #333;
    flex: 1;
}

/* 底部操作栏 */
.bottom-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #fff;
    padding: 20rpx;
    display: flex;
    align-items: center;
    box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.1);
    z-index: 100;
}

.action-btns {
    display: flex;
    gap: 30rpx;
}

.icon-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 20rpx;
}

.icon-btn .icon {
    font-size: 40rpx;
    margin-bottom: 5rpx;
}

.icon-btn .text {
    font-size: 20rpx;
    color: #666;
}

.cart-btn,
.buy-btn {
    flex: 1;
    margin-left: 20rpx;
    height: 80rpx;
    line-height: 80rpx;
    text-align: center;
    border-radius: 40rpx;
    font-size: 28rpx;
    font-weight: bold;
}

.cart-btn {
    background: linear-gradient(135deg, #fff8dc 0%, #ffe4b5 100%);
    color: #ff6b35;
    border: 2rpx solid #ff6b35;
}

.buy-btn {
    background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%);
    color: #fff;
}
</style>
