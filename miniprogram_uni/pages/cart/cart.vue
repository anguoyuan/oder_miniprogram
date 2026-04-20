<template>
    <!-- pages/cart/cart.wxml -->
    <view class="cart-container">
        <view v-if="cart.length > 0" class="cart-content">
            <!-- 购物车列表 -->
            <view class="cart-list">
                <view class="cart-item" v-for="(item, index) in cart" :key="index">
                    <view class="item-check" @tap="selectItem" :data-cartid="item.cartId">
                        <i :type="selectedItems.indexOf(item.cartId) > -1 ? 'success' : 'circle'" size="20" :color="selectedItems.indexOf(item.cartId) > -1 ? '#AAD08F' : '#ccc'" />
                    </view>

                    <image :src="item.image" class="item-image" mode="aspectFill" />

                    <view class="item-info">
                        <text class="item-name">{{ item.name }}</text>
                        <text class="item-specs">{{ item.specs.sugar }} {{ item.specs.temperature }} {{ item.specs.addOn }}</text>

                        <view class="item-bottom">
                            <text class="item-price">${{ item.price }}</text>

                            <view class="item-quantity">
                                <view class="quantity-btn" @tap="changeQuantity" :data-cartid="item.cartId" data-type="minus">
                                    <text>-</text>
                                </view>
                                <text class="quantity-num">{{ item.quantity }}</text>
                                <view class="quantity-btn" @tap="changeQuantity" :data-cartid="item.cartId" data-type="plus">
                                    <text>+</text>
                                </view>
                            </view>
                        </view>
                    </view>
                </view>
            </view>

            <!-- 底部操作栏 -->
            <view class="cart-footer">
                <view class="footer-left">
                    <view class="select-all" @tap="selectAll">
                        <i :type="selectedAll ? 'success' : 'circle'" size="20" :color="selectedAll ? '#AAD08F' : '#ccc'" />
                        <text>全选</text>
                    </view>
                    <text class="delete-btn" @tap="deleteSelected">删除</text>
                </view>

                <view class="footer-right">
                    <view class="total-info">
                        <text class="total-label">合计：</text>
                        <text class="total-price">${{ totalPrice }}</text>
                    </view>
                    <view class="checkout-btn" @tap="checkout">
                        <text>结算({{ selectedItems.length }})</text>
                    </view>
                </view>
            </view>
        </view>

        <!-- 购物车为空 -->
        <view v-else class="empty-cart">
            <image src="/static/images/icon/qucan.png" class="empty-image" />
            <text class="empty-text">购物车空空如也</text>
            <view class="go-shopping-btn" @tap="goShopping">去逛逛</view>
        </view>
    </view>
</template>

<script>
// pages/cart/cart.js
const app = getApp();
const api = require('../../utils/api.js');
export default {
    data() {
        return {
            cart: [],
            totalPrice: 0,
            selectedAll: false,
            selectedItems: [],
            loading: false
        };
    },
    onLoad() {
        this.loadCart();
    },
    onShow() {
        this.loadCart();
    },
    methods: {
        // 加载购物车
        async loadCart() {
            // 如果已登录，从后端加载购物车
            if (app.globalData.isLogin) {
                this.setData({
                    loading: true
                });
                try {
                    const cart = await api.getCartList();
                    // 转换后端数据格式为前端格式
                    const formattedCart = cart.map((item) => ({
                        cartId: item.id,
                        id: item.productId,
                        name: item.productName,
                        image: item.productImage,
                        price: item.productPrice,
                        quantity: item.quantity,
                        specs: item.specs
                            ? JSON.parse(item.specs)
                            : {
                                  sugar: '标准糖',
                                  temperature: '正常冰',
                                  addOn: '无'
                              }
                    }));
                    this.setData({
                        cart: formattedCart,
                        loading: false
                    });
                    // 同步到本地
                    app.globalData.cart = formattedCart;
                    uni.setStorageSync('cart', formattedCart);
                } catch (error) {
                    console.log('CatchClause', error);
                    console.log('CatchClause', error);
                    console.error('加载购物车失败', error);
                    this.setData({
                        loading: false
                    });
                    // 加载失败时使用本地数据
                    const cart = app.globalData.cart || [];
                    this.setData({
                        cart: cart
                    });
                }
            } else {
                // 未登录，使用本地数据
                const cart = app.globalData.cart || [];
                this.setData({
                    cart: cart
                });
            }
            this.calculateTotal();
        },

        // 选择商品
        selectItem(e) {
            const cartId = e.currentTarget.dataset.cartid;
            const selectedItems = this.selectedItems;
            const index = selectedItems.indexOf(cartId);
            if (index > -1) {
                selectedItems.splice(index, 1);
            } else {
                selectedItems.push(cartId);
            }
            this.setData({
                selectedItems: selectedItems,
                selectedAll: selectedItems.length === this.cart.length
            });
            this.calculateTotal();
        },

        // 全选
        selectAll() {
            const selectedAll = !this.selectedAll;
            let selectedItems = [];
            if (selectedAll) {
                selectedItems = this.cart.map((item) => item.cartId);
            }
            this.setData({
                selectedAll: selectedAll,
                selectedItems: selectedItems
            });
            this.calculateTotal();
        },

        // 修改数量
        async changeQuantity(e) {
            const { cartid, type } = e.currentTarget.dataset;
            const cart = this.cart;
            const itemIndex = cart.findIndex((item) => item.cartId === cartid);
            if (itemIndex >= 0) {
                if (type === 'plus') {
                    cart[itemIndex].quantity++;
                } else if (type === 'minus') {
                    if (cart[itemIndex].quantity > 1) {
                        cart[itemIndex].quantity--;
                    } else {
                        // 数量为1时删除
                        this.removeItem(cartid);
                        return;
                    }
                }

                // 如果已登录，同步到后端
                if (app.globalData.isLogin) {
                    try {
                        await api.updateCartQuantity({
                            cartId: cartid,
                            quantity: cart[itemIndex].quantity
                        });
                    } catch (error) {
                        console.log('CatchClause', error);
                        console.log('CatchClause', error);
                        console.error('更新购物车失败', error);
                        uni.showToast({
                            title: '更新失败',
                            icon: 'none'
                        });
                        return;
                    }
                }
                app.globalData.cart = cart;
                uni.setStorageSync('cart', cart);
                this.setData({
                    cart: cart
                });
                this.calculateTotal();
            }
        },

        // 删除商品
        async removeItem(cartId) {
            // 如果已登录，同步到后端
            if (app.globalData.isLogin) {
                try {
                    await api.removeCartItem(cartId);
                } catch (error) {
                    console.log('CatchClause', error);
                    console.log('CatchClause', error);
                    console.error('删除购物车商品失败', error);
                    uni.showToast({
                        title: '删除失败',
                        icon: 'none'
                    });
                    return;
                }
            }
            app.globalData.removeFromCart(cartId);
            this.loadCart();
        },

        // 删除选中
        deleteSelected() {
            if (this.selectedItems.length === 0) {
                uni.showToast({
                    title: '请先选择商品',
                    icon: 'none'
                });
                return;
            }
            uni.showModal({
                title: '确认删除',
                content: `确定要删除选中的${this.selectedItems.length}件商品吗？`,
                success: async (res) => {
                    if (res.confirm) {
                        // 如果已登录，同步到后端
                        if (app.globalData.isLogin) {
                            try {
                                for (const cartId of this.selectedItems) {
                                    await api.removeCartItem(cartId);
                                }
                            } catch (error) {
                                console.log('CatchClause', error);
                                console.log('CatchClause', error);
                                console.error('删除购物车商品失败', error);
                                uni.showToast({
                                    title: '删除失败',
                                    icon: 'none'
                                });
                                return;
                            }
                        }
                        this.selectedItems.forEach((cartId) => {
                            app.globalData.removeFromCart(cartId);
                        });
                        this.setData({
                            selectedItems: [],
                            selectedAll: false
                        });
                        this.loadCart();
                        uni.showToast({
                            title: '删除成功',
                            icon: 'success'
                        });
                    }
                }
            });
        },

        // 计算总价
        calculateTotal() {
            let totalPrice = 0;
            if (this.selectedItems.length > 0) {
                this.cart.forEach((item) => {
                    if (this.selectedItems.includes(item.cartId)) {
                        totalPrice += item.price * item.quantity;
                    }
                });
            }
            this.setData({
                totalPrice: totalPrice.toFixed(2)
            });
        },

        // 去结算
        checkout() {
            if (this.selectedItems.length === 0) {
                uni.showToast({
                    title: '请先选择商品',
                    icon: 'none'
                });
                return;
            }

            // 跳转到结算页面
            uni.navigateTo({
                url: '/pages/checkout/checkout'
            });
        },

        // 去购物
        goShopping() {
            uni.switchTab({
                url: '/pages/order/order'
            });
        }
    }
};
</script>
<style>
/* pages/cart/cart.wxss */
.cart-container {
    min-height: 100vh;
    background-color: #f8f8f8;
    padding-bottom: 120rpx;
}

.cart-content {
    padding: 20rpx;
}

/* 购物车列表 */
.cart-list {
    margin-bottom: 20rpx;
}

.cart-item {
    display: flex;
    align-items: center;
    background-color: #fff;
    padding: 20rpx;
    margin-bottom: 20rpx;
    border-radius: 16rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
}

.item-check {
    margin-right: 20rpx;
}

.item-image {
    width: 160rpx;
    height: 160rpx;
    border-radius: 12rpx;
    margin-right: 20rpx;
}

.item-info {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.item-name {
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 10rpx;
}

.item-specs {
    font-size: 24rpx;
    color: #999;
    margin-bottom: 20rpx;
}

.item-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.item-price {
    font-size: 32rpx;
    color: #ff6b6b;
    font-weight: bold;
}

.item-quantity {
    display: flex;
    align-items: center;
    border: 1rpx solid #ddd;
    border-radius: 40rpx;
}

.quantity-btn {
    width: 50rpx;
    height: 50rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32rpx;
    color: #666;
}

.quantity-num {
    min-width: 60rpx;
    text-align: center;
    font-size: 28rpx;
}

/* 底部操作栏 */
.cart-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100rpx;
    background-color: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20rpx;
    box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.08);
}

.footer-left {
    display: flex;
    align-items: center;
    gap: 30rpx;
}

.select-all {
    display: flex;
    align-items: center;
    gap: 10rpx;
    font-size: 28rpx;
}

.delete-btn {
    font-size: 28rpx;
    color: #ff6b6b;
}

.footer-right {
    display: flex;
    align-items: center;
    gap: 20rpx;
}

.total-info {
    display: flex;
    align-items: baseline;
}

.total-label {
    font-size: 28rpx;
    color: #666;
}

.total-price {
    font-size: 36rpx;
    color: #ff6b6b;
    font-weight: bold;
}

.checkout-btn {
    background: linear-gradient(135deg, #aad08f 0%, #8bc34a 100%);
    color: #fff;
    padding: 20rpx 40rpx;
    border-radius: 40rpx;
    font-size: 28rpx;
    font-weight: bold;
}

/* 空购物车 */
.empty-cart {
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
</style>
