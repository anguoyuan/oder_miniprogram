<template>
    <!-- pages/favorite/favorite.wxml -->
    <view class="favorite-container">
        <view v-if="favorites.length > 0" class="favorite-list">
            <view class="favorite-item" @tap="viewProduct" :data-id="item.productId" v-for="(item, index) in favorites" :key="index">
                <image :src="item.productImage" class="item-image" mode="aspectFill" />

                <view class="item-info">
                    <text class="item-name">{{ item.productName }}</text>
                    <text class="item-desc" v-if="item.productDescription">{{ item.productDescription }}</text>
                    <view class="item-bottom">
                        <text class="item-price">${{ item.productPrice }}</text>
                        <view class="item-actions">
                            <view class="action-btn add-cart" @tap.stop.prevent="addToCart" :data-product="item">
                                <text>加入购物车</text>
                            </view>
                            <view class="action-btn remove" @tap.stop.prevent="removeFavorite" :data-id="item.productId">
                                <text>取消收藏</text>
                            </view>
                        </view>
                    </view>
                </view>
            </view>
        </view>

        <!-- 空状态 -->
        <view v-else class="empty-favorite">
            <image src="/static/images/me/shouhuodizhi.png" class="empty-image" />
            <text class="empty-text">还没有收藏商品哦~</text>
            <view class="go-shopping-btn" @tap="viewProduct">去逛逛</view>
        </view>

        <!-- 加载中 -->
        <view v-if="loading" class="loading">
            <text>加载中...</text>
        </view>
    </view>
</template>

<script>
// pages/favorite/favorite.js
const app = getApp();
const api = require('../../utils/api.js');
export default {
    data() {
        return {
            favorites: [],
            loading: false
        };
    },
    onLoad() {
        this.checkLogin();
    },
    onShow() {
        if (app.globalData.isLogin) {
            this.loadFavorites();
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
                                url: '/pages/index/index'
                            });
                        }
                    }
                });
                return false;
            }
            return true;
        },

        // 加载收藏列表
        async loadFavorites() {
            if (!this.checkLogin()) {
                return;
            }
            this.setData({
                loading: true
            });
            try {
                const result = await api.getFavorites();
                this.setData({
                    favorites: result || []
                });
            } catch (error) {
                console.log('CatchClause', error);
                console.log('CatchClause', error);
                console.error('加载收藏列表失败', error);
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

        // 取消收藏
        async removeFavorite(e) {
            const productId = e.currentTarget.dataset.id;
            uni.showModal({
                title: '提示',
                content: '确定要取消收藏吗？',
                success: async (res) => {
                    if (res.confirm) {
                        try {
                            await api.removeFavorite(productId);
                            uni.showToast({
                                title: '取消成功',
                                icon: 'success'
                            });
                            this.loadFavorites();
                        } catch (error) {
                            console.log('CatchClause', error);
                            console.log('CatchClause', error);
                            uni.showToast({
                                title: '操作失败',
                                icon: 'none'
                            });
                        }
                    }
                }
            });
        },

        // 查看商品详情
        viewProduct(e) {
            const productId = e.currentTarget.dataset.id;
            // 跳转到商品详情页（这里暂时跳转到点单页）
            uni.switchTab({
                url: '/pages/order/order'
            });
        },

        // 加入购物车
        addToCart(e) {
            const product = e.currentTarget.dataset.product;

            // 简单添加到购物车（默认规格）
            const cartItem = {
                cartId: Date.now(),
                productId: product.productId || product.id,
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
/* pages/favorite/favorite.wxss */
.favorite-container {
    min-height: 100vh;
    background-color: #f8f8f8;
    padding: 20rpx;
}

/* 收藏列表 */
.favorite-list {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
}

.favorite-item {
    display: flex;
    background-color: #fff;
    padding: 20rpx;
    border-radius: 16rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
}

.item-image {
    width: 180rpx;
    height: 180rpx;
    border-radius: 12rpx;
    margin-right: 20rpx;
    flex-shrink: 0;
}

.item-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.item-name {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 10rpx;
}

.item-desc {
    font-size: 24rpx;
    color: #999;
    margin-bottom: 10rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

.item-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.item-price {
    font-size: 36rpx;
    color: #ff6b6b;
    font-weight: bold;
}

.item-actions {
    display: flex;
    gap: 10rpx;
}

.action-btn {
    padding: 12rpx 24rpx;
    border-radius: 30rpx;
    font-size: 24rpx;
}

.add-cart {
    background: linear-gradient(135deg, #aad08f 0%, #8bc34a 100%);
    color: #fff;
}

.remove {
    background-color: #f5f5f5;
    color: #999;
}

/* 空状态 */
.empty-favorite {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-top: 200rpx;
}

.empty-image {
    width: 300rpx;
    height: 300rpx;
    margin-bottom: 40rpx;
}

.empty-text {
    font-size: 32rpx;
    color: #999;
    margin-bottom: 60rpx;
}

.go-shopping-btn {
    background: linear-gradient(135deg, #aad08f 0%, #8bc34a 100%);
    color: #fff;
    padding: 24rpx 80rpx;
    border-radius: 50rpx;
    font-size: 32rpx;
    font-weight: bold;
    box-shadow: 0 8rpx 16rpx rgba(170, 208, 143, 0.3);
}

/* 加载中 */
.loading {
    text-align: center;
    padding: 40rpx;
    color: #999;
    font-size: 28rpx;
}
</style>
