<template>
    <view class="likes-container">
        <view v-if="loading" class="loading">
            <text>加载中...</text>
        </view>

        <view v-else-if="likes.length === 0" class="empty">
            <image src="/static/images/icon/qucan.png" class="empty-image" />
            <text class="empty-text">暂无点赞商品</text>
            <navigator url="/pages/order/order" open-type="switchTab" class="go-shopping">去逛逛</navigator>
        </view>

        <view v-else class="likes-list">
            <view class="like-item" v-for="(item, index) in likes" :key="index">
                <view class="item-content" @tap="viewProduct" :data-id="item.productId">
                    <image :src="item.productImage" class="product-image" />
                    <view class="product-info">
                        <view class="product-name">{{ item.productName }}</view>
                        <view class="product-desc">销量: {{ item.productSales || 0 }}</view>
                        <view class="product-price">¥{{ item.productPrice }}</view>
                    </view>
                </view>

                <view class="item-actions">
                    <view class="cancel-btn" @tap="removeLike" :data-id="item.productId">取消点赞</view>
                    <view class="cart-btn" @tap="addToCart" :data-product="item">加入购物车</view>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
// pages/likes/likes.js
const app = getApp();
const api = require('../../utils/api.js');
export default {
    data() {
        return {
            likes: [],
            loading: false
        };
    },
    onLoad() {
        this.checkLogin();
    },
    onShow() {
        if (app.globalData.isLogin) {
            this.loadLikes();
        }
    },
    methods: {
        // 检查登录
        checkLogin() {
            if (!app.globalData.isLogin) {
                uni.showModal({
                    title: '提示',
                    content: '请先登录',
                    confirmText: '去登录',
                    success: (res) => {
                        if (res.confirm) {
                            uni.switchTab({
                                url: '/pages/profile/profile'
                            });
                        } else {
                            uni.navigateBack();
                        }
                    }
                });
                return false;
            }
            return true;
        },

        // 加载点赞列表
        async loadLikes() {
            if (!this.checkLogin()) {
                return;
            }
            this.setData({
                loading: true
            });
            try {
                const result = await api.getLikes();
                this.setData({
                    likes: result || []
                });
            } catch (error) {
                console.log('CatchClause', error);
                console.log('CatchClause', error);
                console.error('加载点赞列表失败', error);
                uni.showToast({
                    title: '加载失败',
                    icon: 'none'
                });
            } finally {
                this.setData({
                    loading: false
                });
            }
        },

        // 取消点赞
        async removeLike(e) {
            const productId = e.currentTarget.dataset.id;
            try {
                await api.removeLike(productId);
                uni.showToast({
                    title: '取消成功',
                    icon: 'success'
                });
                this.loadLikes();
            } catch (error) {
                console.log('CatchClause', error);
                console.log('CatchClause', error);
                uni.showToast({
                    title: '操作失败',
                    icon: 'none'
                });
            }
        },

        // 查看商品详情
        viewProduct(e) {
            const productId = e.currentTarget.dataset.id;
            uni.navigateTo({
                url: `/pages/product-detail/product-detail?id=${productId}`
            });
        },

        // 加入购物车
        addToCart(e) {
            const product = e.currentTarget.dataset.product;
            const cartItem = {
                id: product.productId || product.id,
                name: product.productName || product.name,
                image: product.productImage || product.image,
                price: product.productPrice || product.price,
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
        }
    }
};
</script>
<style>
.likes-container {
    min-height: 100vh;
    background: #f5f5f5;
    padding: 20rpx;
}

.loading {
    text-align: center;
    padding: 100rpx 0;
    color: #999;
}

.empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 200rpx 0;
}

.empty-image {
    width: 300rpx;
    height: 300rpx;
    margin-bottom: 40rpx;
}

.empty-text {
    font-size: 28rpx;
    color: #999;
    margin-bottom: 40rpx;
}

.go-shopping {
    padding: 20rpx 60rpx;
    background: linear-gradient(135deg, #aad08f 0%, #8bc34a 100%);
    color: #fff;
    border-radius: 50rpx;
    font-size: 28rpx;
}

.likes-list {
    padding-bottom: 20rpx;
}

.like-item {
    background: #fff;
    border-radius: 16rpx;
    padding: 24rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.item-content {
    display: flex;
    margin-bottom: 20rpx;
}

.product-image {
    width: 160rpx;
    height: 160rpx;
    border-radius: 12rpx;
    margin-right: 20rpx;
    flex-shrink: 0;
}

.product-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.product-name {
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 10rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

.product-desc {
    font-size: 24rpx;
    color: #999;
    margin-bottom: 10rpx;
}

.product-price {
    font-size: 32rpx;
    font-weight: bold;
    color: #ff6b35;
}

.item-actions {
    display: flex;
    gap: 20rpx;
}

.cancel-btn,
.cart-btn {
    flex: 1;
    height: 70rpx;
    line-height: 70rpx;
    text-align: center;
    border-radius: 35rpx;
    font-size: 26rpx;
}

.cancel-btn {
    background: #f5f5f5;
    color: #666;
}

.cart-btn {
    background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%);
    color: #fff;
}
</style>
