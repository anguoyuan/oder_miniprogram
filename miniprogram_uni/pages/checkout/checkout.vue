<template>
    <!-- pages/checkout/checkout.wxml -->
    <view class="checkout-container">
        <!-- 收货信息 -->
        <view class="section address-section" v-if="deliveryType === 'delivery'">
            <view class="section-header">
                <text class="section-icon">📍</text>
                <text class="section-title">收货地址</text>
            </view>
            <view class="address-content" @tap="selectAddress">
                <text class="address-text">{{ address }}</text>
                <text class="arrow">›</text>
            </view>
        </view>

        <!-- 配送方式 -->
        <view class="section delivery-section">
            <view class="section-header">
                <text class="section-icon">🚚</text>
                <text class="section-title">配送方式</text>
            </view>
            <view class="delivery-types">
                <view :class="'delivery-item ' + (deliveryType === 'delivery' ? 'active' : '')" @tap="selectDeliveryType" data-type="delivery">
                    <text class="delivery-name">外卖配送</text>
                    <text class="delivery-desc">预计30-45分钟送达</text>
                </view>
                <view :class="'delivery-item ' + (deliveryType === 'pickup' ? 'active' : '')" @tap="selectDeliveryType" data-type="pickup">
                    <text class="delivery-name">到店自取</text>
                    <text class="delivery-desc">预计15-20分钟可取</text>
                </view>
            </view>
        </view>

        <!-- 商品清单 -->
        <view class="section goods-section">
            <view class="section-header">
                <text class="section-icon">🛍️</text>
                <text class="section-title">商品清单</text>
            </view>
            <view class="goods-list">
                <view class="goods-item" v-for="(item, index) in selectedItems" :key="index">
                    <image :src="item.image" class="goods-image" mode="aspectFill" />

                    <view class="goods-info">
                        <text class="goods-name">{{ item.name }}</text>
                        <text class="goods-specs">{{ item.specs.sugar }} {{ item.specs.temperature }} {{ item.specs.addOn }}</text>
                    </view>

                    <view class="goods-right">
                        <text class="goods-price">¥{{ item.price }}</text>
                        <text class="goods-quantity">x{{ item.quantity }}</text>
                    </view>
                </view>
            </view>
        </view>

        <!-- 备注 -->
        <view class="section remark-section">
            <view class="section-header">
                <text class="section-icon">📝</text>
                <text class="section-title">订单备注</text>
            </view>
            <textarea class="remark-input" placeholder="请输入备注信息（选填）" :value="remark" @input="inputRemark" maxlength="200" />
        </view>

        <!-- 底部结算栏 -->
        <view class="checkout-footer">
            <view class="total-info">
                <text class="total-label">合计：</text>
                <text class="total-price">¥{{ totalPrice }}</text>
            </view>
            <view :class="'submit-btn ' + (submitting ? 'disabled' : '')" @tap="submitOrder">
                <text>{{ submitting ? '提交中...' : '提交订单' }}</text>
            </view>
        </view>
    </view>
</template>

<script>
// pages/checkout/checkout.js
const app = getApp();
const api = require('../../utils/api.js');
export default {
    data() {
        return {
            selectedItems: [],
            totalPrice: 0,
            deliveryType: 'delivery',
            // delivery: 外卖, pickup: 自取
            remark: '',
            address: '请选择收货地址',
            selectedAddress: null,
            pickupCode: '',
            submitting: false
        };
    },
    onLoad() {
        this.loadCheckoutData();
        this.loadDefaultAddress();
    },
    onShow() {
        // 从地址页面返回时重新加载并验证地址
        if (this.deliveryType === 'delivery') {
            this.loadDefaultAddress();
        }
    },
    methods: {
        // 加载结算数据
        loadCheckoutData() {
            const cart = app.globalData.cart || [];
            const selectedItems = [];
            let totalPrice = 0;

            // 这里简化处理，实际应该从购物车页面传递选中的商品ID
            cart.forEach((item) => {
                selectedItems.push(item);
                totalPrice += item.price * item.quantity;
            });
            this.setData({
                selectedItems: selectedItems,
                totalPrice: totalPrice.toFixed(2)
            });
        },

        // 加载默认地址
        async loadDefaultAddress() {
            if (!app.globalData.isLogin) {
                return;
            }
            try {
                const addressList = await api.getAddressList();
                if (addressList && addressList.length > 0) {
                    // 查找默认地址
                    let defaultAddress = addressList.find((addr) => addr.isDefault);
                    if (!defaultAddress) {
                        // 如果没有默认地址，使用第一个
                        defaultAddress = addressList[0];
                    }
                    this.setData({
                        selectedAddress: defaultAddress,
                        address: `${defaultAddress.name} ${defaultAddress.phone} ${defaultAddress.province}${defaultAddress.city}${defaultAddress.district}${defaultAddress.detail}`
                    });

                    // 验证地址是否在配送范围内
                    if (defaultAddress.latitude && defaultAddress.longitude) {
                        await this.checkAddressRange(defaultAddress);
                    }
                }
            } catch (error) {
                console.log('CatchClause', error);
                console.log('CatchClause', error);
                console.error('加载地址失败', error);
            }
        },

        // 验证地址配送范围
        async checkAddressRange(address) {
            try {
                const result = await api.checkDeliveryRange(address.latitude, address.longitude);
                if (!result.inRange) {
                    uni.showModal({
                        title: '配送范围提示',
                        content: `当前地址距离店铺${result.distanceText}，超出配送范围（${result.maxDistance}公里），请选择其他地址`,
                        showCancel: false
                    });
                    this.setData({
                        selectedAddress: null,
                        address: '请选择收货地址'
                    });
                }
            } catch (error) {
                console.log('CatchClause', error);
                console.log('CatchClause', error);
                console.error('验证配送范围失败', error);
            }
        },

        // 选择配送方式
        selectDeliveryType(e) {
            const type = e.currentTarget.dataset.type;
            this.setData({
                deliveryType: type
            });

            // 切换到外卖时，如果没有地址则提示
            if (type === 'delivery' && (!this.selectedAddress || this.address === '请选择收货地址')) {
                uni.showModal({
                    title: '提示',
                    content: '外卖配送需要添加收货地址',
                    confirmText: '去添加',
                    success: (res) => {
                        if (res.confirm) {
                            this.selectAddress();
                        }
                    }
                });
            }
        },

        // 选择地址
        async selectAddress() {
            uni.navigateTo({
                url: '/pages/address/address?from=checkout'
            });
        },

        // 输入备注
        inputRemark(e) {
            this.setData({
                remark: e.detail.value
            });
        },

        // 提交订单
        async submitOrder() {
            // 验证登录状态
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
                        }
                    }
                });
                return;
            }

            // 验证商品
            if (this.selectedItems.length === 0) {
                uni.showToast({
                    title: '请选择商品',
                    icon: 'none'
                });
                return;
            }

            // 验证外卖地址和配送范围
            if (this.deliveryType === 'delivery') {
                if (!this.selectedAddress || this.address === '请选择收货地址') {
                    uni.showModal({
                        title: '提示',
                        content: '外卖配送需要选择收货地址',
                        confirmText: '去选择',
                        success: (res) => {
                            if (res.confirm) {
                                this.selectAddress();
                            }
                        }
                    });
                    return;
                }

                // 再次验证配送范围
                if (this.selectedAddress.latitude && this.selectedAddress.longitude) {
                    try {
                        const result = await api.checkDeliveryRange(this.selectedAddress.latitude, this.selectedAddress.longitude);
                        if (!result.inRange) {
                            uni.showModal({
                                title: '配送范围提示',
                                content: `当前地址距离店铺${result.distanceText}，超出配送范围（${result.maxDistance}公里），请重新选择地址`,
                                showCancel: false
                            });
                            return;
                        }
                    } catch (error) {
                        console.log('CatchClause', error);
                        console.log('CatchClause', error);
                        console.error('验证配送范围失败', error);
                        uni.showToast({
                            title: '验证配送范围失败',
                            icon: 'none'
                        });
                        return;
                    }
                }
            }
            this.setData({
                submitting: true
            });
            try {
                const orderData = {
                    orderType: this.deliveryType === 'delivery' ? 'takeaway' : 'pickup',
                    address: this.deliveryType === 'delivery' ? this.address : '到店自取',
                    addressId: this.deliveryType === 'delivery' && this.selectedAddress ? this.selectedAddress.id : null,
                    phone: this.deliveryType === 'delivery' && this.selectedAddress ? this.selectedAddress.phone : '',
                    remark: this.remark,
                    items: this.selectedItems.map((item) => ({
                        productId: item.id,
                        quantity: item.quantity,
                        specs: `${item.specs.sugar} ${item.specs.temperature} ${item.specs.addOn}`
                    }))
                };
                const result = await api.createOrder(orderData);

                // 如果是自取订单，生成取餐码
                if (this.deliveryType === 'pickup') {
                    const pickupCode = this.generatePickupCode();
                    this.setData({
                        pickupCode: pickupCode
                    });

                    // 显示取餐码弹窗
                    uni.showModal({
                        title: '下单成功',
                        content: `您的取餐码是：${pickupCode}\n请凭此码到店取餐`,
                        showCancel: false,
                        success: () => {
                            this.navigateToOrderList();
                        }
                    });
                } else {
                    // 外卖订单直接跳转
                    uni.showToast({
                        title: '下单成功',
                        icon: 'success',
                        duration: 2000
                    });
                    setTimeout(() => {
                        this.navigateToOrderList();
                    }, 2000);
                }

                // 清空购物车
                app.globalData.clearCart();
            } catch (error) {
                console.log('CatchClause', error);
                console.log('CatchClause', error);
                console.error('提交订单失败', error);
                uni.showToast({
                    title: '下单失败',
                    icon: 'none'
                });
            } finally {
                this.setData({
                    submitting: false
                });
            }
        },

        // 生成取餐码（6位数字）
        generatePickupCode() {
            return Math.floor(100000 + Math.random() * 900000).toString();
        },

        // 跳转到订单列表
        navigateToOrderList() {
            uni.switchTab({
                url: '/pages/orderList/orderList'
            });
        }
    }
};
</script>
<style>
/* pages/checkout/checkout.wxss */
.checkout-container {
    min-height: 100vh;
    background-color: #f8f8f8;
    padding-bottom: 120rpx;
}

.section {
    background-color: #fff;
    margin-bottom: 20rpx;
    padding: 30rpx;
}

.section-header {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;
}

.section-icon {
    font-size: 36rpx;
    margin-right: 10rpx;
}

.section-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
}

/* 地址部分 */
.address-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx;
    background-color: #f8f8f8;
    border-radius: 12rpx;
}

.address-text {
    flex: 1;
    font-size: 28rpx;
    color: #666;
}

.arrow {
    font-size: 48rpx;
    color: #ccc;
}

/* 配送方式 */
.delivery-types {
    display: flex;
    gap: 20rpx;
}

.delivery-item {
    flex: 1;
    padding: 30rpx 20rpx;
    background-color: #f8f8f8;
    border-radius: 12rpx;
    border: 2rpx solid transparent;
    display: flex;
    flex-direction: column;
    align-items: center;
    transition: all 0.3s;
}

.delivery-item.active {
    background-color: #e8f5e0;
    border-color: #aad08f;
}

.delivery-name {
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 10rpx;
}

.delivery-desc {
    font-size: 24rpx;
    color: #999;
}

/* 商品清单 */
.goods-list {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
}

.goods-item {
    display: flex;
    align-items: center;
    padding: 20rpx;
    background-color: #f8f8f8;
    border-radius: 12rpx;
}

.goods-image {
    width: 120rpx;
    height: 120rpx;
    border-radius: 12rpx;
    margin-right: 20rpx;
}

.goods-info {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.goods-name {
    font-size: 28rpx;
    color: #333;
    margin-bottom: 10rpx;
}

.goods-specs {
    font-size: 24rpx;
    color: #999;
}

.goods-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
}

.goods-price {
    font-size: 30rpx;
    color: #ff6b6b;
    font-weight: bold;
    margin-bottom: 5rpx;
}

.goods-quantity {
    font-size: 24rpx;
    color: #999;
}

/* 备注 */
.remark-input {
    width: 100%;
    min-height: 150rpx;
    padding: 20rpx;
    background-color: #f8f8f8;
    border-radius: 12rpx;
    font-size: 28rpx;
}

/* 底部结算栏 */
.checkout-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100rpx;
    background-color: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 30rpx;
    box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.08);
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
    font-size: 40rpx;
    color: #ff6b6b;
    font-weight: bold;
}

.submit-btn {
    background: linear-gradient(135deg, #aad08f 0%, #8bc34a 100%);
    color: #fff;
    padding: 24rpx 60rpx;
    border-radius: 50rpx;
    font-size: 32rpx;
    font-weight: bold;
    box-shadow: 0 8rpx 16rpx rgba(170, 208, 143, 0.3);
}

.submit-btn.disabled {
    opacity: 0.5;
}
</style>
