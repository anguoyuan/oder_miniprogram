<template>
    <!-- pages/order/order.wxml -->
    <view class="order-container">
        <!-- 自定义导航栏 -->
        <view class="custom-nav" :style="{ paddingTop: statusBarHeight + 'px', height: (statusBarHeight + 44) + 'px' }">
            <text class="custom-nav-title">Order</text>
        </view>
        <!-- 主体内容 -->
        <view class="main-content" :style="{ height: 'calc(100vh - ' + (statusBarHeight + 44) + 'px)' }">
            <!-- 主体内容区域 -->
            <view class="content-section">
                <!-- 左侧分类导航 -->
                <view class="category-nav">
                    <scroll-view scroll-y class="category-scroll">
                        <view
                            :class="'category-item ' + (currentCategory === item.id ? 'active' : '')"
                            @tap="selectCategory"
                            :data-id="item.id"
                            v-for="(item, index) in categories"
                            :key="index"
                        >
                            <image :src="item.icon" class="category-icon" mode="aspectFill" />

                            <text>{{ item.name }}</text>
                        </view>
                    </scroll-view>
                </view>

                <!-- 右侧商品列表 -->
                <view class="product-list">
                    <scroll-view scroll-y class="product-scroll" :scroll-into-view="scrollIntoView" @scroll="onProductScroll">
                        <view class="category-section" :id="'category-' + item.id" v-for="(item, index) in categories" :key="index">
                            <view class="category-title">{{ item.name }}</view>

                            <view class="product-item" v-for="(product, index1) in item.products" :key="index1">
                                <image :src="product.image" class="product-image" mode="aspectFill" @tap="viewProductDetail" :data-id="product.id" />

                                <view class="product-info">
                                    <view class="product-header">
                                        <view class="product-name-wrap">
                                            <text class="product-name">{{ product.name }}</text>
                                            <text class="product-name-cn" v-if="product.description">{{ product.description }}</text>
                                        </view>
                                        <view class="product-actions">
                                            <view class="action-icon" @tap.stop.prevent="toggleLike" :data-id="product.id">
                                                <text :class="'icon-text ' + (product.isLiked ? 'liked' : '')">{{ product.isLiked ? '♥' : '♡' }}</text>
                                            </view>
                                            <view class="action-icon" @tap.stop.prevent="toggleFavorite" :data-id="product.id">
                                                <text :class="'icon-text ' + (product.isFavorited ? 'favorited' : '')">{{ product.isFavorited ? '★' : '☆' }}</text>
                                            </view>
                                        </view>
                                    </view>
                                    <view class="product-bottom">
                                        <text class="product-price">${{ product.price }}</text>
                                        <view class="add-btn" @tap="addToCart" :data-product="product">
                                            <text>+</text>
                                        </view>
                                    </view>
                                </view>
                            </view>
                        </view>
                    </scroll-view>
                </view>
            </view>
        </view>

        <!-- 底部购物车 -->
        <view class="cart-bottom" v-if="cartCount > 0">
            <view class="cart-info" @tap="showCart">
                <view class="cart-icon-wrapper">
                    <image src="/static/images/icon/gouwuche.png" class="cart-icon" />
                    <view class="cart-badge">{{ cartCount }}</view>
                </view>
                <view class="cart-details">
                    <text class="cart-count">{{ cartCount }} Item</text>
                    <text class="cart-total">${{ totalPrice }}</text>
                </view>
            </view>
            <view class="checkout-btn" @tap="checkout">
                <text>Checkout</text>
            </view>
        </view>

        <!-- 商品规格选择弹窗 -->
        <view :class="'spec-modal ' + (showSpecModal ? 'show' : '')" @tap="hideSpecModal">
            <view class="spec-content" @tap.stop.prevent="stopPropagation">
                <view class="spec-header">
                    <image :src="selectedProduct.image" class="spec-image" mode="aspectFill" />
                    <view class="spec-info">
                        <text class="spec-name">{{ selectedProduct.name }}</text>
                        <text class="spec-price">${{ selectedProduct.price }}</text>
                    </view>
                    <view class="close-btn" @tap="hideSpecModal">×</view>
                </view>

                <view class="spec-options">
                    <!-- 糖度选择 -->
                    <view class="spec-group">
                        <text class="spec-label">糖度</text>
                        <view class="spec-tags">
                            <view
                                :class="'spec-tag ' + (selectedSpecs.sugar === item ? 'active' : '')"
                                @tap="selectSpec"
                                data-type="sugar"
                                :data-value="item"
                                v-for="(item, index) in sugarOptions"
                                :key="index"
                            >
                                {{ item }}
                            </view>
                        </view>
                    </view>

                    <!-- 温度选择 -->
                    <view class="spec-group">
                        <text class="spec-label">温度</text>
                        <view class="spec-tags">
                            <view
                                :class="'spec-tag ' + (selectedSpecs.temperature === item ? 'active' : '')"
                                @tap="selectSpec"
                                data-type="temperature"
                                :data-value="item"
                                v-for="(item, index) in temperatureOptions"
                                :key="index"
                            >
                                {{ item }}
                            </view>
                        </view>
                    </view>

                    <!-- 加料选择 -->
                    <view class="spec-group">
                        <text class="spec-label">加料</text>
                        <view class="spec-tags">
                            <view
                                :class="'spec-tag ' + (selectedSpecs.addOn === item ? 'active' : '')"
                                @tap="selectSpec"
                                data-type="addOn"
                                :data-value="item"
                                v-for="(item, index) in addOnOptions"
                                :key="index"
                            >
                                {{ item }}
                            </view>
                        </view>
                    </view>
                </view>

                <view class="spec-footer">
                    <view class="quantity-control">
                        <view class="quantity-btn" @tap="changeQuantity" data-type="minus">-</view>
                        <text class="quantity-text">{{ quantity }}</text>
                        <view class="quantity-btn" @tap="changeQuantity" data-type="plus">+</view>
                    </view>
                    <view class="confirm-btn" @tap="confirmAddToCart">加入购物车</view>
                </view>
            </view>
        </view>

        <!-- 购物车详情弹窗 -->
        <view :class="'cart-modal ' + (showCartModal ? 'show' : '')" @tap="hideCartModal">
            <view class="cart-content" @tap.stop.prevent="stopPropagation">
                <view class="cart-header">
                    <text class="cart-title">购物车</text>
                    <view class="clear-btn" @tap="clearCart">清空</view>
                </view>

                <scroll-view class="cart-list" scroll-y>
                    <view class="cart-item" v-for="(item, index) in cart" :key="index">
                        <image :src="item.image" class="cart-item-image" mode="aspectFill" />

                        <view class="cart-item-info">
                            <text class="cart-item-name">{{ item.name }}</text>
                            <text class="cart-item-specs">{{ item.specs.sugar }} {{ item.specs.temperature }} {{ item.specs.addOn }}</text>
                            <view class="cart-item-bottom">
                                <text class="cart-item-price">${{ item.price }}</text>
                                <view class="cart-quantity-control">
                                    <view class="cart-quantity-btn" @tap="updateCartQuantity" :data-cart-id="item.cartId" data-type="minus">-</view>
                                    <text class="cart-quantity-text">{{ item.quantity }}</text>
                                    <view class="cart-quantity-btn" @tap="updateCartQuantity" :data-cart-id="item.cartId" data-type="plus">+</view>
                                </view>
                            </view>
                        </view>
                    </view>
                </scroll-view>

                <view class="cart-footer">
                    <view class="cart-total-info">
                        <text>合计：${{ totalPrice }}</text>
                    </view>
                    <view class="cart-checkout-btn" @tap="checkout">Checkout</view>
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
            orderType: 'takeaway',
            currentCategory: null,
            scrollIntoView: '',
            showSpecModal: false,
            showCartModal: false,

            selectedProduct: {
                image: '',
                name: '',
                price: ''
            },

            selectedSpecs: {
                sugar: '正常糖',
                temperature: '正常冰',
                addOn: '不加料'
            },

            quantity: 1,
            cart: [],
            cartCount: 0,
            totalPrice: 0,
            loading: true,
            statusBarHeight: 0,

            // 规格选项
            sugarOptions: ['无糖', '少糖', '正常糖', '多糖'],

            temperatureOptions: ['热饮', '常温', '少冰', '正常冰', '多冰'],
            addOnOptions: ['不加料', '珍珠', '椰果', '红豆', '布丁', '仙草'],

            // 商品分类数据（从后端加载）
            categories: [],

            product: {
                image: '',
                id: '',
                name: '',
                isLiked: false,
                isFavorited: false,
                desc: '',
                tags: [],
                price: ''
            },

            tag: ''
        };
    },
    onLoad() {
        this.statusBarHeight = uni.getSystemInfoSync().statusBarHeight;
        this.loadCategories();
        this.loadCart();
    },
    onShow() {
        this.loadCart();
    },
    methods: {
        // 从后端加载分类和商品
        async loadCategories() {
            try {
                uni.showLoading({
                    title: '加载中...'
                });

                // 获取分类列表
                const categories = await api.getCategoryList();

                // 为每个分类加载商品
                for (let category of categories) {
                    const products = await api.getProductsByCategory(category.id);
                    category.products = products.map((p) => ({
                        ...p,
                        tags: p.tags ? p.tags.split(',') : []
                    }));
                }
                this.setData({
                    categories: categories,
                    currentCategory: categories[0]?.id || null,
                    loading: false
                });
                uni.hideLoading();
            } catch (error) {
                console.log('CatchClause', error);
                console.log('CatchClause', error);
                uni.hideLoading();
                console.error('加载商品失败', error);
                uni.showToast({
                    title: '加载商品失败',
                    icon: 'none'
                });
                this.setData({
                    loading: false
                });
            }
        },

        // 加载购物车数据（使用本地数据）
        loadCart() {
            const cart = app.globalData.cart || [];
            const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
            const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
            this.setData({
                cart,
                cartCount,
                totalPrice
            });
        },

        // 监听商品列表滚动，自动切换分类高亮
        onProductScroll(e) {
            // 防抖处理，避免频繁计算
            if (this.scrollTimer) {
                clearTimeout(this.scrollTimer);
            }
            this.scrollTimer = setTimeout(() => {
                const { scrollTop } = e.detail;
                const query = uni.createSelectorQuery().in(this);

                // 获取所有分类区域的位置信息
                this.categories.forEach((category, index) => {
                    query.select(`#category-${category.id}`).boundingClientRect();
                });
                query.exec((res) => {
                    if (!res || res.length === 0) {
                        return;
                    }

                    // 找到当前滚动位置对应的分类
                    for (let i = 0; i < res.length; i++) {
                        if (res[i] && res[i].top <= 100 && res[i].top > -res[i].height) {
                            const categoryId = this.categories[i].id;
                            if (this.currentCategory !== categoryId) {
                                this.setData({
                                    currentCategory: categoryId
                                });
                            }
                            break;
                        }
                    }
                });
            }, 100);
        },

        // 切换订单类型
        switchOrderType(e) {
            const type = e.currentTarget.dataset.type;
            app.globalData.orderType = type;
            this.setData({
                orderType: type
            });
        },

        // 选择分类
        selectCategory(e) {
            const categoryId = e.currentTarget.dataset.id;
            this.setData({
                currentCategory: categoryId,
                scrollIntoView: `category-${categoryId}`
            });
        },

        // 选择商品（显示规格弹窗）
        selectProduct(e) {
            const product = e.currentTarget.dataset.product;
            this.setData({
                selectedProduct: product,
                showSpecModal: true,
                quantity: 1,
                selectedSpecs: {
                    sugar: '正常糖',
                    temperature: '正常冰',
                    addOn: '不加料'
                }
            });
        },

        // 直接添加到购物车（使用默认规格）
        addToCart(e) {
            const product = e.currentTarget.dataset.product;
            const item = {
                ...product,
                quantity: 1,
                specs: {
                    sugar: '正常糖',
                    temperature: '正常冰',
                    addOn: '不加料'
                }
            };
            app.globalData.addToCart(item);
            this.loadCart();
            uni.showToast({
                title: '已添加到购物车',
                icon: 'success',
                duration: 1000
            });
        },

        // 选择规格
        selectSpec(e) {
            const { type, value } = e.currentTarget.dataset;
            this.setData({
                [`selectedSpecs.${type}`]: value
            });
        },

        // 修改数量
        changeQuantity(e) {
            const type = e.currentTarget.dataset.type;
            let quantity = this.quantity;
            if (type === 'plus') {
                quantity++;
            } else if (type === 'minus' && quantity > 1) {
                quantity--;
            }
            this.setData({
                quantity
            });
        },

        // 确认添加到购物车
        confirmAddToCart() {
            const { selectedProduct, selectedSpecs, quantity } = this;
            const item = {
                ...selectedProduct,
                quantity,
                specs: selectedSpecs
            };
            app.globalData.addToCart(item);
            this.loadCart();
            this.hideSpecModal();
            uni.showToast({
                title: '已添加到购物车',
                icon: 'success',
                duration: 1000
            });
        },

        // 显示购物车
        showCart() {
            if (this.cart.length === 0) {
                uni.showToast({
                    title: '购物车为空',
                    icon: 'none'
                });
                return;
            }
            this.setData({
                showCartModal: true
            });
        },

        // 隐藏规格弹窗
        hideSpecModal() {
            this.setData({
                showSpecModal: false
            });
        },

        // 隐藏购物车弹窗
        hideCartModal() {
            this.setData({
                showCartModal: false
            });
        },

        // 阻止事件冒泡
        stopPropagation() {
            // 阻止事件冒泡
        },

        // 更新购物车商品数量
        updateCartQuantity(e) {
            const { cartId, type } = e.currentTarget.dataset;
            const cart = this.cart;
            const itemIndex = cart.findIndex((item) => item.cartId === cartId);
            if (itemIndex >= 0) {
                if (type === 'plus') {
                    cart[itemIndex].quantity++;
                } else if (type === 'minus') {
                    if (cart[itemIndex].quantity > 1) {
                        cart[itemIndex].quantity--;
                    } else {
                        // 数量为1时，删除商品
                        app.globalData.removeFromCart(cartId);
                        this.loadCart();
                        return;
                    }
                }
                app.globalData.cart = cart;
                uni.setStorageSync('cart', cart);
                this.loadCart();
            }
        },

        // 清空购物车
        clearCart() {
            uni.showModal({
                title: '确认清空',
                content: '确定要清空购物车吗？',
                success: (res) => {
                    if (res.confirm) {
                        app.globalData.clearCart();
                        this.loadCart();
                        this.hideCartModal();
                    }
                }
            });
        },

        // 计算总价
        calculateTotalPrice() {
            const { selectedProduct, quantity } = this;
            return (selectedProduct.price * quantity).toFixed(2);
        },

        // 查看商品详情
        viewProductDetail(e) {
            const productId = e.currentTarget.dataset.id;
            uni.navigateTo({
                url: `/pages/product-detail/product-detail?id=${productId}`
            });
        },

        // 去结算
        checkout() {
            if (this.cart.length === 0) {
                uni.showToast({
                    title: '购物车为空',
                    icon: 'none'
                });
                return;
            }

            // 跳转到结算页面
            uni.navigateTo({
                url: '/pages/checkout/checkout'
            });
        },

        // 切换点赞
        async toggleLike(e) {
            const productId = e.currentTarget.dataset.id;
            try {
                // 找到当前商品
                let product = null;
                let categoryIndex = -1;
                let productIndex = -1;
                for (let i = 0; i < this.categories.length; i++) {
                    const index = this.categories[i].products.findIndex((p) => p.id === productId);
                    if (index > -1) {
                        categoryIndex = i;
                        productIndex = index;
                        product = this.categories[i].products[index];
                        break;
                    }
                }
                if (!product) {
                    return;
                }
                const isLiked = product.isLiked;
                if (isLiked) {
                    await api.removeLike(productId);
                    uni.showToast({
                        title: '取消点赞',
                        icon: 'none'
                    });
                } else {
                    await api.addLike(productId);
                    uni.showToast({
                        title: '点赞成功',
                        icon: 'success'
                    });
                }

                // 更新状态
                this.setData({
                    [`categories[${categoryIndex}].products[${productIndex}].isLiked`]: !isLiked
                });
            } catch (error) {
                console.log('CatchClause', error);
                console.log('CatchClause', error);
                console.error('点赞操作失败', error);
                uni.showToast({
                    title: '操作失败',
                    icon: 'none'
                });
            }
        },

        // 切换收藏
        async toggleFavorite(e) {
            const productId = e.currentTarget.dataset.id;
            try {
                // 找到当前商品
                let product = null;
                let categoryIndex = -1;
                let productIndex = -1;
                for (let i = 0; i < this.categories.length; i++) {
                    const index = this.categories[i].products.findIndex((p) => p.id === productId);
                    if (index > -1) {
                        categoryIndex = i;
                        productIndex = index;
                        product = this.categories[i].products[index];
                        break;
                    }
                }
                if (!product) {
                    return;
                }
                const isFavorited = product.isFavorited;
                if (isFavorited) {
                    await api.removeFavorite(productId);
                    uni.showToast({
                        title: '取消收藏',
                        icon: 'none'
                    });
                } else {
                    await api.addFavorite(productId);
                    uni.showToast({
                        title: '收藏成功',
                        icon: 'success'
                    });
                }

                // 更新状态
                this.setData({
                    [`categories[${categoryIndex}].products[${productIndex}].isFavorited`]: !isFavorited
                });
            } catch (error) {
                console.log('CatchClause', error);
                console.log('CatchClause', error);
                console.error('收藏操作失败', error);
                uni.showToast({
                    title: '操作失败',
                    icon: 'none'
                });
            }
        }
    }
};
</script>
<style>
/* pages/order/order.wxss */
.order-container {
    background-color: #ffffff;
    min-height: 100vh;
    padding-bottom: 120rpx;
}

.custom-nav {
    background-color: #ffffff;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding-bottom: 10px;
    box-sizing: border-box;
}

.custom-nav-title {
    font-size: 34rpx;
    font-weight: bold;
    color: #333;
}

.main-content {
    display: flex;
    flex-direction: column;
}
/* 主体内容区域 */
.content-section {
    flex: 1;
    display: flex;
    overflow: hidden;
}

/* 左侧分类导航 */
.category-nav {
    width: 200rpx;
    background-color: #f5f5f5;
}

.category-scroll {
    height: 100%;
}

.category-item {
    padding: 20rpx;
    text-align: center;
    font-size: 28rpx;
    color: #666;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.category-item.active {
    background-color: #fff;
    color: #8B5E3C;
    font-weight: bold;
   /* border-right: 4rpx solid #f0f0f0; */
}

.category-icon {
    width: 50rpx;
    height: 50rpx;
    margin-bottom: 8rpx;
    border-radius: 6rpx;
}

/* 右侧商品列表 */
.product-list {
    flex: 1;
    background-color: #fff;
}

.product-scroll {
    height: 100%;
}

.category-section {
    padding: 0;
}

.category-title {
    font-size: 28rpx;
    font-weight: bold;
    color: #999;
    margin-bottom: 0;
    padding: 16rpx 20rpx 8rpx;
 /*   border-left: 4rpx solid #8B5E3C; */
}

/* .product-item {
    display: flex;
    padding: 0 20rpx;
    background-color: transparent;
    border-radius: 0;
    box-shadow: none;
    transition: none;
} */

.product-item {
    display: flex;
    padding: 15rpx 20rpx; /* 使用内边距来撑开点击空间，背景依然是连贯的 */
    background-color: #ffffff; /* 确保背景是纯白 */
    border-bottom: none;       /* 确保没有边框线 */
}
.product-item:active {
    transform: scale(0.98);
}

.product-image {
    width: 120rpx;
    height: 120rpx;
    border-radius: 8rpx;
    margin: 16rpx 20rpx 16rpx 0;
    flex-shrink: 0;
}

.product-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 8rpx;
}

.product-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 8rpx;
}

.product-name-wrap {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.product-name {
    font-size: 28rpx;
    font-weight: bold;
    color: #333;
}

.product-name-cn {
    font-size: 22rpx;
    color: #C9A84C;
    margin-top: 0;
}

.product-actions {
    display: none;
    gap: 10rpx;
    margin-left: 10rpx;
}

.action-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 5rpx;
}

.icon-text {
    font-size: 32rpx;
    color: #ccc;
    transition: all 0.3s;
}

.icon-text.liked {
    color: #ff6b6b;
}

.icon-text.favorited {
    color: #ffd700;
}

.product-desc {
    font-size: 22rpx;
    color: #bbb;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.product-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8rpx;
    margin-bottom: 12rpx;
}

.product-tag {
    font-size: 20rpx;
    color: #8B5E3C;
    background-color: rgba(170, 208, 143, 0.1);
    padding: 4rpx 8rpx;
    border-radius: 4rpx;
    border: 1rpx solid rgba(170, 208, 143, 0.3);
}

.product-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.product-price {
    font-size: 25rpx;
    font-weight: bold;
    color: #000000;
}

/* .add-btn {
    width: 60rpx;
    height: 60rpx;
    background-color: #aad08f;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 32rpx;
    font-weight: bold;
    transition: all 0.3s ease;
} */
.add-btn {
    width: 32rpx;
    height: 32rpx;
    background-color: #5D3A1A; 
    border-radius: 0;
    position: relative;
    margin-right: 20rpx;    /* 增加右边距，让它离边缘更远 */
    margin-bottom: 4rpx;
    flex-shrink: 0;
}

/* 2. 横线：长但不贯穿 */
.add-btn::before {
    content: '';
    position: absolute;
    width: 75%;             /* 改为 75%，两头就会留出空隙，不会切断方块 */
    height: 3rpx;           /* 线条粗细 */
    background-color: #ffffff;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%); /* 同时水平垂直居中 */
}

/* 3. 竖线：长但不贯穿 */
.add-btn::after {
    content: '';
    position: absolute;
    width: 3rpx;            /* 线条粗细 */
    height: 75%;            /* 改为 75%，上下就会留出空隙 */
    background-color: #ffffff;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%); /* 同时水平垂直居中 */
}
.add-btn:active {
    transform: scale(0.9);
}

/* 底部购物车 */
.cart-bottom {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: #fff;
    padding: 20rpx;
    border-top: 1rpx solid #e0e0e0;
    display: flex;
    align-items: center;
    z-index: 100;
    box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.cart-info {
    flex: 1;
    display: flex;
    align-items: center;
    cursor: pointer;
}

.cart-icon-wrapper {
    position: relative;
    margin-right: 20rpx;
}

.cart-icon {
    width: 40rpx;
    height: 40rpx;
    padding: 10rpx;
    background-color: #5D3A1A;
    border-radius: 50%;
}

.cart-badge {
    position: absolute;
    top: -8rpx;
    right: -8rpx;
    background-color: #fff;
    color: #8B5E3C;
    border-radius: 50%;
    width: 32rpx;
    height: 32rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20rpx;
    font-weight: bold;
    border: 2rpx solid #8B5E3C;
}

.cart-details {
    flex: 1;
}

.cart-count {
    font-size: 24rpx;
    color: #666;
    display: block;
    margin-bottom: 4rpx;
}

.cart-total {
    font-size: 32rpx;
    font-weight: bold;
    color: #8B5E3C;
}

.checkout-btn {
    background-color: #5D3A1A;
    color: #fff;
    border-radius: 0;
    padding: 20rpx 40rpx;
    font-size: 28rpx;
    font-weight: bold;
    transition: all 0.3s ease;
}

.checkout-btn:active {
    transform: scale(0.95);
}

/* 规格选择弹窗 */
.spec-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    display: flex;
    align-items: flex-end;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
}

.spec-modal.show {
    opacity: 1;
    visibility: visible;
}

.spec-content {
    background-color: #fff;
    border-radius: 24rpx 24rpx 0 0;
    padding: 40rpx;
    width: 100%;
    max-height: 80vh;
    transform: translateY(100%);
    transition: transform 0.3s ease;
}

.spec-modal.show .spec-content {
    transform: translateY(0);
}

.spec-header {
    display: flex;
    align-items: center;
    margin-bottom: 40rpx;
    position: relative;
}

.spec-image {
    width: 120rpx;
    height: 120rpx;
    border-radius: 12rpx;
    margin-right: 20rpx;
}

.spec-info {
    flex: 1;
}

.spec-name {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 10rpx;
    display: block;
}

.spec-price {
    font-size: 36rpx;
    font-weight: bold;
    color: #8B5E3C;
}

.close-btn {
    position: absolute;
    top: 0;
    right: 0;
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40rpx;
    color: #999;
}

.spec-options {
    margin-bottom: 40rpx;
}

.spec-group {
    margin-bottom: 30rpx;
}

.spec-label {
    font-size: 28rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 16rpx;
    display: block;
}

.spec-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
}

.spec-tag {
    padding: 16rpx 24rpx;
    border-radius: 50rpx;
    font-size: 24rpx;
    background-color: #f0f0f0;
    color: #666;
    transition: all 0.3s ease;
}

.spec-tag.active {
    background-color: #8B5E3C;
    color: #fff;
}

.spec-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.quantity-control {
    display: flex;
    align-items: center;
    border: 1rpx solid #e0e0e0;
    border-radius: 50rpx;
    overflow: hidden;
}

.quantity-btn {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32rpx;
    background-color: #f8f8f8;
    color: #666;
}

.quantity-text {
    padding: 0 30rpx;
    font-size: 28rpx;
    color: #333;
}

.confirm-btn {
    flex: 1;
    margin-left: 30rpx;
    background-color: #8B5E3C;
    color: #fff;
    border-radius: 50rpx;
    padding: 20rpx;
    text-align: center;
    font-size: 28rpx;
    font-weight: bold;
}

/* 购物车详情弹窗 */
.cart-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    display: flex;
    align-items: flex-end;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
}

.cart-modal.show {
    opacity: 1;
    visibility: visible;
}

.cart-content {
    background-color: #fff;
    border-radius: 24rpx 24rpx 0 0;
    width: 100%;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    transform: translateY(100%);
    transition: transform 0.3s ease;
}

.cart-modal.show .cart-content {
    transform: translateY(0);
}

.cart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx 40rpx;
    border-bottom: 1rpx solid #f0f0f0;
}

.cart-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
}

.clear-btn {
    color: #8B5E3C;
    font-size: 28rpx;
}

.cart-list {
    flex: 1;
    padding: 0 40rpx;
    max-height: 500rpx;
}

.cart-item {
    display: flex;
    padding: 30rpx 0;
    border-bottom: 1rpx solid #f0f0f0;
}

.cart-item-image {
    width: 100rpx;
    height: 100rpx;
    border-radius: 8rpx;
    margin-right: 20rpx;
}

.cart-item-info {
    flex: 1;
}

.cart-item-name {
    font-size: 28rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 8rpx;
    display: block;
}

.cart-item-specs {
    font-size: 24rpx;
    color: #999;
    margin-bottom: 12rpx;
    display: block;
}

.cart-item-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.cart-item-price {
    font-size: 28rpx;
    font-weight: bold;
    color: #8B5E3C;
}

.cart-quantity-control {
    display: flex;
    align-items: center;
    border: 1rpx solid #e0e0e0;
    border-radius: 50rpx;
    overflow: hidden;
}

.cart-quantity-btn {
    width: 50rpx;
    height: 50rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24rpx;
    background-color: #f8f8f8;
    color: #666;
}

.cart-quantity-text {
    padding: 0 20rpx;
    font-size: 24rpx;
    color: #333;
}

.cart-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 30rpx 40rpx;
    border-top: 1rpx solid #f0f0f0;
}

.cart-total-info {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
}

.cart-checkout-btn {
    background-color: #8B5E3C;
    color: #fff;
    border-radius: 50rpx;
    padding: 20rpx 40rpx;
    font-size: 28rpx;
    font-weight: bold;
}
</style>
