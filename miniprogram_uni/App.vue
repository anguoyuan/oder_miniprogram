<script>
// app.js
const config = require('./config.js');
export default {
    data() {
        return {};
    },
    globalData: {
        userInfo: null,
        isLogin: false,
        cart: [],
        orderType: 'takeaway',

        // takeaway 外卖, pickup 自取
        apiBase: config.apiUrl,

        // 用户登出
        logout() {
            this.userInfo = null;
            this.isLogin = false;
            uni.removeStorageSync('token');
            uni.removeStorageSync('userInfo');
            uni.showToast({
                title: '已退出登录',
                icon: 'success'
            });
        },

        // 添加到购物车
        async addToCart(item) {
            const existIndex = this.cart.findIndex((cartItem) => cartItem.id === item.id && JSON.stringify(cartItem.specs) === JSON.stringify(item.specs));
            if (existIndex >= 0) {
                this.cart[existIndex].quantity += item.quantity;
                // 如果已登录，同步到后端
                if (this.isLogin) {
                    try {
                        const api = require('./utils/api.js');
                        await api.updateCartQuantity({
                            cartId: this.cart[existIndex].cartId,
                            quantity: this.cart[existIndex].quantity
                        });
                    } catch (error) {
                        console.log('CatchClause', error);
                        console.log('CatchClause', error);
                        console.error('同步购物车到后端失败', error);
                    }
                }
            } else {
                const newCartId = Date.now() + Math.random();
                this.cart.push({
                    ...item,
                    cartId: newCartId
                });

                // 如果已登录，同步到后端
                if (this.isLogin) {
                    try {
                        const api = require('./utils/api.js');
                        await api.addToCart({
                            productId: item.id,
                            quantity: item.quantity,
                            specs: JSON.stringify(item.specs)
                        });
                    } catch (error) {
                        console.log('CatchClause', error);
                        console.log('CatchClause', error);
                        console.error('同步购物车到后端失败', error);
                    }
                }
            }
            uni.setStorageSync('cart', this.cart);
        },

        // 从购物车移除
        async removeFromCart(cartId) {
            // 如果已登录，同步到后端
            if (this.isLogin) {
                try {
                    const api = require('./utils/api.js');
                    await api.removeCartItem(cartId);
                } catch (error) {
                    console.log('CatchClause', error);
                    console.log('CatchClause', error);
                    console.error('删除购物车商品失败', error);
                }
            }
            this.cart = this.cart.filter((item) => item.cartId !== cartId);
            uni.setStorageSync('cart', this.cart);
        },

        // 清空购物车
        async clearCart() {
            // 如果已登录，同步到后端
            if (this.isLogin) {
                try {
                    const api = require('./utils/api.js');
                    await api.clearCart();
                } catch (error) {
                    console.log('CatchClause', error);
                    console.log('CatchClause', error);
                    console.error('清空购物车失败', error);
                }
            }
            this.cart = [];
            uni.setStorageSync('cart', this.cart);
        },

        // 登录后同步本地购物车到后端
        async syncCartToBackend() {
            if (!this.isLogin || this.cart.length === 0) {
                return;
            }
            try {
                const api = require('./utils/api.js');
                // 先清空后端购物车
                await api.clearCart();
                // 同步本地购物车到后端
                for (const item of this.cart) {
                    await api.addToCart({
                        productId: item.id,
                        quantity: item.quantity,
                        specs: JSON.stringify(item.specs)
                    });
                }
                console.log('购物车同步成功');
            } catch (error) {
                console.log('CatchClause', error);
                console.log('CatchClause', error);
                console.error('同步购物车失败', error);
            }
        }
    },
    onLaunch() {
        // 获取缓存的用户信息
        const token = uni.getStorageSync('token');
        const userInfo = uni.getStorageSync('userInfo');
        const cart = uni.getStorageSync('cart') || [];
        if (token && userInfo) {
            this.globalData.isLogin = true;
            this.globalData.userInfo = userInfo;
        }
        this.globalData.cart = cart;
        console.log('小程序启动，登录状态:', this.globalData.isLogin);
    }
};
</script>
<style>
/**app.wxss**/
page {
    background-color: #f8f8f8;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 通用样式 */
.container {
    padding: 20rpx;
}

.flex {
    display: flex;
}

.flex-column {
    display: flex;
    flex-direction: column;
}

.flex-center {
    display: flex;
    align-items: center;
    justify-content: center;
}

.flex-between {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.flex-around {
    display: flex;
    align-items: center;
    justify-content: space-around;
}

.text-center {
    text-align: center;
}

.text-right {
    text-align: right;
}

/* 主题色 */
.primary-color {
    color: #aad08f;
}

.primary-bg {
    background-color: #aad08f;
}

.secondary-color {
    color: #666;
}

.gray-color {
    color: #999;
}

.white-bg {
    background-color: #fff;
}

/* 卡片样式 */
.card {
    background-color: #fff;
    border-radius: 16rpx;
    padding: 20rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

/* 按钮样式 */
.btn {
    border-radius: 50rpx;
    padding: 20rpx 40rpx;
    font-size: 28rpx;
    border: none;
    text-align: center;
}

.btn-primary {
    background-color: #aad08f;
    color: #fff;
}

.btn-secondary {
    background-color: #f0f0f0;
    color: #333;
}

.btn-small {
    padding: 10rpx 20rpx;
    font-size: 24rpx;
}

/* 输入框样式 */
.input {
    border: 1px solid #e0e0e0;
    border-radius: 8rpx;
    padding: 20rpx;
    background-color: #fff;
}

/* 标签样式 */
.tag {
    display: inline-block;
    padding: 8rpx 16rpx;
    border-radius: 20rpx;
    font-size: 24rpx;
    background-color: #f0f0f0;
    color: #666;
    margin-right: 10rpx;
}

.tag-active {
    background-color: #aad08f;
    color: #fff;
}

/* 分割线 */
.divider {
    height: 1rpx;
    background-color: #e0e0e0;
    margin: 20rpx 0;
}

/* 空状态 */
.empty-state {
    text-align: center;
    padding: 100rpx 20rpx;
    color: #999;
}

.empty-state image {
    width: 200rpx;
    height: 200rpx;
    margin-bottom: 20rpx;
}

/* 导航栏 */
.custom-navbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    background-color: #fff;
    padding-top: var(--status-bar-height);
}

.navbar-content {
    height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    padding: 0 20rpx;
}

.navbar-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
}

.navbar-back {
    position: absolute;
    left: 20rpx;
    width: 40rpx;
    height: 40rpx;
}

/* 商品列表 */
.product-item {
    display: flex;
    padding: 20rpx;
    background-color: #fff;
    border-bottom: 1rpx solid #f0f0f0;
}

.product-image {
    width: 120rpx;
    height: 120rpx;
    border-radius: 8rpx;
    margin-right: 20rpx;
}

.product-info {
    flex: 1;
}

.product-name {
    font-size: 28rpx;
    color: #333;
    margin-bottom: 10rpx;
}

.product-desc {
    font-size: 24rpx;
    color: #999;
    margin-bottom: 10rpx;
}

.product-price {
    font-size: 32rpx;
    color: #aad08f;
    font-weight: bold;
}

/* 购物车 */
.cart-badge {
    position: absolute;
    top: -10rpx;
    right: -10rpx;
    background-color: #aad08f;
    color: #fff;
    border-radius: 50%;
    width: 36rpx;
    height: 36rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20rpx;
}

/* 动画 */
.fade-in {
    animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20rpx);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
