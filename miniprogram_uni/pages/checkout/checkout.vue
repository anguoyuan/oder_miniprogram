<template>
    <!-- pages/checkout/checkout.wxml -->
    <view class="checkout-container">
        <view class="checkout-body">
        <!-- 顶部标题 -->
        <view class="page-header">
            <text class="page-header-back" @tap="$navigateBack">‹</text>
            <text class="page-header-title">Your Order</text>
        </view>

        <!-- 配送方式 + 地址合并 -->
        <view class="section delivery-section">
            <view class="delivery-toggle">
                <view :class="'toggle-btn ' + (deliveryType === 'delivery' ? 'active' : '')" @tap="selectDeliveryType('delivery')">
                    <text class="toggle-text">Delivery</text>
                </view>
                <view :class="'toggle-btn ' + (deliveryType === 'pickup' ? 'active' : '')" @tap="selectDeliveryType('pickup')">
                    <text class="toggle-text">Pickup</text>
                </view>
            </view>

            <view v-if="deliveryType === 'delivery'">
                <view v-if="parseFloat(totalPrice) >= 65" class="delivery-row" @tap="openAddressPicker">
                    <text class="delivery-row-label">Address</text>
                    <text :class="'delivery-row-value ' + (address === '请选择收货地址' ? 'placeholder' : '')">
                        {{ address === '请选择收货地址' ? 'Please enter your address' : address }}
                    </text>
                    <text class="arrow">›</text>
                </view>
                <view v-else class="delivery-row">
                    <text class="delivery-row-label">MRT</text>
                    <input class="mrt-input" placeholder="Please enter your MRT station" :value="mrtStation" @input="e => setData({ mrtStation: e.detail.value })" />
                </view>
            </view>

            <view class="delivery-row" @tap="selectTime">
                <text class="delivery-row-label">{{ deliveryType === 'delivery' ? 'Delivery Time' : 'Pickup Time' }}</text>
                <text :class="'delivery-row-value ' + (deliveryTime ? '' : 'placeholder')">{{ deliveryTime || 'Select Time' }}</text>
                <text class="arrow">›</text>
            </view>
        </view>

        <!-- 商品清单 -->
        <view class="section goods-section">
            <view class="section-header">
                <text class="section-title">Order Summary</text>
            </view>
            <view class="goods-list">
                <view class="goods-item" v-for="(item, index) in selectedItems" :key="index">
                    <image :src="item.image" class="goods-image" mode="aspectFill" />

                    <view class="goods-info">
                        <text class="goods-name">{{ item.name }}</text>
                        <text v-if="item.description" class="goods-desc">{{ item.description }}</text>
                    </view>

                    <view class="goods-right">
                        <text class="goods-price">${{ item.price }}</text>
                        <text class="goods-quantity">x{{ item.quantity }}</text>
                    </view>
                </view>
            </view>
        </view>

        <!-- 支付方式 -->
        <view class="section payment-section">
            <view class="section-header">
                <text class="section-title">Payment Methods</text>
            </view>
            <view class="payment-item" @tap="selectPayment('wechat')">
                <image src="/static/images/icon/wechat-pay.png" class="payment-icon" mode="aspectFit" />
                <text class="payment-name">WeChat Pay</text>
                <view :class="'payment-radio ' + (paymentMethod === 'wechat' ? 'selected' : '')">
                    <text v-if="paymentMethod === 'wechat'" class="payment-check">✓</text>
                </view>
            </view>
            <view class="payment-divider" />
            <view class="payment-item" @tap="selectPayment('paynow')">
                <image src="/static/images/icon/paynow.png" class="payment-icon" mode="aspectFit" />
                <text class="payment-name">PayNow</text>
                <view :class="'payment-radio ' + (paymentMethod === 'paynow' ? 'selected' : '')">
                    <text v-if="paymentMethod === 'paynow'" class="payment-check">✓</text>
                </view>
            </view>
        </view>

        <!-- 备注 -->
        <view class="section remark-section">
            <view class="section-header">
                <text class="section-title">Order Notes</text>
            </view>
            <textarea class="remark-input" placeholder="Add notes (optional)" @input="inputRemark" :adjust-position="false" maxlength="200" />
        </view>

        <!-- 地址选择弹窗 -->
        <view v-if="showAddressPicker" class="picker-overlay" @tap="showAddressPicker = false">
            <view class="picker-sheet" @tap.stop>
                <view class="picker-header">
                    <text class="picker-title">Select delivery address</text>
                    <text class="addr-add-btn" @tap="openAddressForm">Add</text>
                </view>
                <scroll-view scroll-y class="addr-list">
                    <view v-if="addressList.length === 0" class="addr-empty">
                        <text class="addr-empty-text">No Address</text>
                    </view>
                    <view v-for="(item, i) in addressList" :key="i"
                          :class="'addr-item ' + (selectedAddress && selectedAddress.id == item.id ? 'selected' : '')"
                          @tap="selectAddressItem(item)">
                        <view class="addr-item-info">
                            <text class="addr-item-name">{{ item.name }}  {{ item.phone }}</text>
                            <text class="addr-item-detail">{{ item.province }}{{ item.city }}{{ item.district }}{{ item.detail }}</text>
                        </view>
                        <view :class="'addr-radio ' + (selectedAddress && selectedAddress.id == item.id ? 'active' : '')"></view>
                    </view>
                </scroll-view>
            </view>
        </view>

        <!-- 新增地址表单 -->
        <view v-if="showAddressForm" class="addr-form-overlay">
            <view class="addr-form-header">
                <text class="addr-form-close" @tap="closeAddressForm">✕</text>
                <text class="addr-form-title">Add new delivery address</text>
            </view>
            <scroll-view scroll-y class="addr-form-body">
                <view class="addr-field-group">
                    <view class="addr-field-label">Postal code</view>
                    <input class="addr-field-input" placeholder="e.g. 399948" :value="newAddr.postalCode" @input="onAddrInput('postalCode', $event)" />
                </view>
                <view class="addr-field-group">
                    <view class="addr-field-label">Building name <text class="addr-field-optional">Optional</text></view>
                    <input class="addr-field-input" placeholder="Building name" :value="newAddr.building" @input="onAddrInput('building', $event)" />
                </view>
                <view class="addr-field-group">
                    <view class="addr-field-label">Address</view>
                    <input class="addr-field-input" placeholder="Street address" :value="newAddr.address" @input="onAddrInput('address', $event)" />
                </view>
                <view class="addr-field-row">
                    <view class="addr-field-half">
                        <view class="addr-field-label">Floor</view>
                        <input class="addr-field-input" placeholder="e.g. 06" :value="newAddr.floor" @input="onAddrInput('floor', $event)" />
                    </view>
                    <view class="addr-field-half">
                        <view class="addr-field-label">Unit number</view>
                        <input class="addr-field-input" placeholder="e.g. 31" :value="newAddr.unit" @input="onAddrInput('unit', $event)" />
                    </view>
                </view>
                <view class="addr-recipient-section">
                    <view class="addr-section-title">Recipient's information</view>
                    <view class="addr-section-divider" />
                </view>
                <view class="addr-field-group">
                    <view class="addr-field-label">Name</view>
                    <input class="addr-field-input" placeholder="Full name" :value="newAddr.name" @input="onAddrInput('name', $event)" />
                </view>
                <view class="addr-field-group">
                    <view class="addr-field-label">Mobile number</view>
                    <input class="addr-field-input" placeholder="Phone number" :value="newAddr.phone" @input="onAddrInput('phone', $event)" type="number" />
                </view>
            </scroll-view>
            <view class="addr-form-save" @tap="saveNewAddress">
                <text>Add address</text>
            </view>
        </view>

        <!-- 时间选择弹窗 -->
        <view v-if="showTimePicker" class="picker-overlay" @tap="cancelTime">
            <view class="picker-sheet" @tap.stop>
                <view class="picker-header">
                    <text class="picker-title">Select a time slot</text>
                    <text class="picker-cancel" @tap="cancelTime">Cancel</text>
                </view>
                <scroll-view scroll-x class="date-tabs" :scroll-into-view="'date-tab-' + selectedDateIndex">
                    <view v-for="(tab, i) in dateTabs" :key="i"
                          :id="'date-tab-' + i"
                          :class="'date-tab ' + (selectedDateIndex === i ? 'active' : '')"
                          @tap="selectDateTab(i)">
                        <text class="date-tab-text">{{ tab.label }}</text>
                    </view>
                </scroll-view>
                <view class="slots-list">
                    <view v-for="(slot, i) in currentSlots" :key="i"
                          :class="'slot-item ' + (!slot.available ? 'unavailable' : tempTime === slot.label ? 'selected' : '')"
                          @tap="slot.available && selectSlot(slot.label)">
                        <view :class="'slot-radio ' + (tempTime === slot.label ? 'active' : '')"></view>
                        <text class="slot-label">{{ slot.label }}</text>
                        <text v-if="!slot.available" class="slot-na">Not available</text>
                    </view>
                </view>
                <view :class="'picker-confirm ' + (tempTime ? '' : 'disabled')" @tap="confirmTime">
                    <text>Confirm</text>
                </view>
            </view>
        </view>

        </view><!-- end checkout-body -->

        <!-- PayNow 付款弹窗 -->
        <view v-if="showPaynowPopup" class="paynow-overlay" @tap="closePaynowPopup">
            <view class="paynow-popup" @tap.stop>
                <view class="paynow-header">
                    <text class="paynow-title">PayNow Payment</text>
                    <text class="paynow-close" @tap="closePaynowPopup">✕</text>
                </view>
                <view class="paynow-body">
                    <view class="paynow-amount-box">
                        <text class="paynow-amount-label">Amount to pay</text>
                        <text class="paynow-amount">$ {{ totalPrice }}</text>
                    </view>
                    <view class="paynow-qr-box">
                        <image src="/static/images/icon/paynow-qr.png" class="paynow-qr-image" mode="aspectFit" />
                    </view>
                    <view class="paynow-account-box">
                        <text class="paynow-account-label">Or transfer to PayNow UEN</text>
                        <text class="paynow-account-number" selectable>202401234A</text>
                    </view>
                    <view class="paynow-tips">
                        <text class="paynow-tip">Scan the QR code above or transfer via PayNow UEN.</text>
                        <text class="paynow-tip">Please transfer the exact amount shown.</text>
                        <text class="paynow-tip-highlight">Payment confirmation takes about 1 minute.</text>
                    </view>
                </view>
                <view :class="'paynow-confirm-btn ' + (submitting ? 'disabled' : '')" @tap="confirmPaynowOrder">
                    <text>{{ submitting ? 'Processing...' : 'I have paid' }}</text>
                </view>
            </view>
        </view>

        <!-- 底部结算栏 -->
        <view class="checkout-footer" v-if="footerVisible">
            <view :class="'submit-btn ' + (submitting ? 'disabled' : '')" @tap="submitOrder">
                <text>{{ submitting ? 'Processing...' : 'PAY $ ' + totalPrice }}</text>
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
            remark: '',
            address: '请选择收货地址',
            selectedAddress: null,
            pickupCode: '',
            submitting: false,
            showPaynowPopup: false,
            paymentMethod: 'wechat',
            deliveryTime: '',
            showTimePicker: false,
            selectedDateIndex: 0,
            tempTime: '',
            showAddressPicker: false,
            showAddressForm: false,
            addressList: [],
            mrtStation: '',
            newAddr: { postalCode: '', building: '', address: '', floor: '', unit: '', name: '', phone: '' },
            footerVisible: false
        };
    },
    computed: {
        dateTabs() {
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const now = new Date();
            return Array.from({ length: 5 }, (_, i) => {
                const d = new Date(now);
                d.setDate(now.getDate() + i);
                const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow'
                    : `${d.getDate()} ${months[d.getMonth()]}, ${days[d.getDay()]}`;
                return { label, date: d };
            });
        },
        currentSlots() {
            const now = new Date();
            const isToday = this.selectedDateIndex === 0;
            const h = now.getHours();
            const slots = this.deliveryType === 'pickup'
                ? [
                    { label: '10am - 12pm', endHour: 12 },
                    { label: '12pm - 2pm',  endHour: 14 },
                    { label: '2pm - 4pm',   endHour: 16 },
                    { label: '4pm - 6pm',   endHour: 18 },
                    { label: '6pm - 8pm',   endHour: 20 },
                ]
                : [
                    { label: '10am - 12pm', endHour: 12 },
                    { label: '3pm - 7pm',   endHour: 19 },
                ];
            return slots.map(s => ({ ...s, available: !isToday || h < s.endHour }));
        }
    },
    onLoad() {
        this.loadCheckoutData();
        this.loadDefaultAddress();
    },
    onShow() {
        this.footerVisible = true;
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
        selectDeliveryType(type) {
            this.setData({ deliveryType: type, deliveryTime: '' });
        },

        // 打开时间选择器
        selectTime() {
            this.setData({ showTimePicker: true, selectedDateIndex: 0, tempTime: '' });
        },
        selectDateTab(i) {
            this.setData({ selectedDateIndex: i, tempTime: '' });
        },
        selectSlot(label) {
            this.setData({ tempTime: label });
        },
        confirmTime() {
            if (!this.tempTime) return;
            const dateLabel = this.dateTabs[this.selectedDateIndex].label;
            this.setData({ deliveryTime: `${dateLabel}, ${this.tempTime}`, showTimePicker: false });
        },
        cancelTime() {
            this.setData({ showTimePicker: false });
        },

        // 打开地址选择弹窗
        async openAddressPicker() {
            let list = [];
            if (app.globalData.isLogin) {
                try { list = await api.getAddressList() || []; } catch (e) {}
            } else {
                list = uni.getStorageSync('guestAddresses') || [];
            }
            this.setData({ addressList: list, showAddressPicker: true });
        },

        // 选中某个地址
        selectAddressItem(item) {
            const fullAddr = `${item.name} ${item.phone} ${item.province || ''}${item.city || ''}${item.district || ''}${item.detail || ''}`;
            this.setData({ selectedAddress: item, address: fullAddr, showAddressPicker: false });
        },

        // 打开新增地址表单
        openAddressForm() {
            this.setData({
                showAddressPicker: false,
                showAddressForm: true,
                newAddr: { postalCode: '', building: '', address: '', floor: '', unit: '', name: '', phone: '' }
            });
        },

        // 关闭新增地址表单
        closeAddressForm() {
            this.setData({ showAddressForm: false });
            this.openAddressPicker();
        },

        // 新增地址表单输入
        onAddrInput(field, e) {
            const updated = Object.assign({}, this.newAddr);
            updated[field] = e.detail.value;
            this.setData({ newAddr: updated });
        },

        // 保存新地址
        async saveNewAddress() {
            const a = this.newAddr;
            if (!a.address) { uni.showToast({ title: 'Please enter address', icon: 'none' }); return; }
            if (!a.name)    { uni.showToast({ title: 'Please enter name', icon: 'none' }); return; }
            const detail = `${a.building ? a.building + ', ' : ''}${a.address}${a.floor ? ', Floor ' + a.floor : ''}${a.unit ? ' #' + a.unit : ''}`;
            const addrData = {
                name: a.name, phone: a.phone,
                province: '', city: '', district: '',
                detail: `${detail}${a.postalCode ? ', ' + a.postalCode : ''}`,
                isDefault: false
            };
            if (app.globalData.isLogin) {
                try { await api.addAddress(addrData); } catch (e) {
                    uni.showToast({ title: 'Save failed', icon: 'none' }); return;
                }
            } else {
                let list = uni.getStorageSync('guestAddresses') || [];
                addrData.id = Date.now();
                if (list.length === 0) addrData.isDefault = true;
                list.push(addrData);
                uni.setStorageSync('guestAddresses', list);
            }
            this.setData({ showAddressForm: false });
            await this.openAddressPicker();
        },

        // 输入备注
        inputRemark(e) {
            this.setData({
                remark: e.detail.value
            });
        },

        // 提交订单
        async submitOrder() {
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
                if (parseFloat(this.totalPrice) >= 65) {
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
                } else {
                    if (!this.mrtStation || !this.mrtStation.trim()) {
                        uni.showToast({ title: 'Please enter your MRT station', icon: 'none' });
                        return;
                    }
                }

                // 再次验证配送范围（仅限填了地址的情况）
                if (this.selectedAddress && this.selectedAddress.latitude && this.selectedAddress.longitude) {
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
            if (this.paymentMethod === 'paynow') {
                this.setData({ showPaynowPopup: true });
                return;
            }
            await this.doSubmitOrder();
        },

        closePaynowPopup() {
            this.setData({ showPaynowPopup: false });
        },

        async confirmPaynowOrder() {
            this.setData({ showPaynowPopup: false });
            await this.doSubmitOrder();
        },

        async doSubmitOrder() {
            this.setData({
                submitting: true
            });
            try {
                const orderData = {
                    guestId: app.globalData.isLogin ? undefined : app.globalData.guestId,
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

        // 选择支付方式
        selectPayment(method) {
            this.setData({ paymentMethod: method });
        },

        // 返回上一页
        $navigateBack() {
            uni.navigateBack();
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
page {
    background-color: #f8f8f8;
    height: 100%;
}

.checkout-container {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: #f8f8f8;
}

.checkout-body {
    flex: 1;
    overflow-y: scroll;
    -webkit-overflow-scrolling: touch;
}

.remark-section {
    margin-bottom: 0;
}

.page-header {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 90rpx;
    background-color: #fff;
    padding-top: calc(var(--status-bar-height) + 16rpx);
}

.page-header-back {
    position: absolute;
    left: 30rpx;
    font-size: 56rpx;
    color: #333;
    line-height: 1;
}

.page-header-title {
    font-size: 34rpx;
    font-weight: bold;
    color: #333;
}

.section {
    background-color: #fff;
    margin-bottom: 16rpx;
    padding: 32rpx 30rpx 30rpx;
}

.section-header {
    padding-bottom: 16rpx;
    margin-bottom: 12rpx;
    border-bottom: 1rpx solid #ede8e3;
}

.section-title {
    font-size: 28rpx;
    font-weight: bold;
    color: #2c1a0e;
    letter-spacing: 1rpx;
    text-transform: uppercase;
}

/* 配送方式切换 */
.delivery-toggle {
    display: flex;
    background-color: #f0ebe6;
    border-radius: 12rpx;
    padding: 6rpx;
    margin-bottom: 24rpx;
}

.toggle-btn {
    flex: 1;
    height: 64rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10rpx;
}

.toggle-btn.active {
    background-color: #fff;
    box-shadow: 0 2rpx 8rpx rgba(44, 26, 14, 0.12);
}

.toggle-text {
    font-size: 28rpx;
    font-weight: bold;
    color: #a08060;
}

.toggle-btn.active .toggle-text {
    color: #2c1a0e;
}

.delivery-row {
    display: flex;
    align-items: center;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #f0ebe6;
}

.delivery-row:last-child {
    border-bottom: none;
    padding-bottom: 0;
}

.delivery-row-label {
    font-size: 28rpx;
    color: #2c1a0e;
    font-weight: 500;
    width: 200rpx;
    flex-shrink: 0;
}

.delivery-row-value {
    flex: 1;
    font-size: 26rpx;
    color: #2c1a0e;
    text-align: right;
    margin-right: 8rpx;
}

.delivery-row-value.placeholder {
    color: #a08060;
}

.arrow {
    font-size: 40rpx;
    color: #ccc;
}

/* 商品清单 */
.goods-list {
    display: flex;
    flex-direction: column;
}

.goods-item {
    display: flex;
    align-items: center;
    padding: 24rpx 0;
    border-bottom: 1rpx solid #f0ebe6;
}

.goods-item:last-child {
    border-bottom: none;
    padding-bottom: 0;
}

.goods-image {
    width: 110rpx;
    height: 110rpx;
    border-radius: 16rpx;
    margin-right: 24rpx;
    flex-shrink: 0;
}

.goods-info {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.goods-name {
    font-size: 28rpx;
    font-weight: 500;
    color: #2c1a0e;
    margin-bottom: 6rpx;
}

.goods-desc {
    font-size: 22rpx;
    color: #c8972a;
}

.goods-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 8rpx;
}

.goods-price {
    font-size: 30rpx;
    color: #2c1a0e;
    font-weight: bold;
}

.goods-quantity {
    font-size: 24rpx;
    color: #a08060;
}

/* MRT 输入 */
.mrt-input {
    flex: 1;
    font-size: 26rpx;
    color: #2c1a0e;
    text-align: right;
}

/* 地址选择弹窗 */
.addr-add-btn {
    font-size: 28rpx;
    color: #2c1a0e;
    font-weight: bold;
}

.addr-list {
    max-height: 600rpx;
}

.addr-empty {
    padding: 60rpx 0;
    display: flex;
    align-items: center;
    justify-content: center;
}

.addr-empty-text {
    font-size: 28rpx;
    color: #a08060;
}

.addr-item {
    display: flex;
    align-items: center;
    padding: 24rpx 0;
    border-bottom: 1rpx solid #f0ebe6;
}

.addr-item:last-child { border-bottom: none; }

.addr-item-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8rpx;
    margin-right: 20rpx;
}

.addr-item-name {
    font-size: 28rpx;
    font-weight: 500;
    color: #2c1a0e;
}

.addr-item-detail {
    font-size: 24rpx;
    color: #a08060;
    line-height: 1.5;
}

.addr-radio {
    width: 40rpx;
    height: 40rpx;
    border-radius: 50%;
    border: 3rpx solid #c0b0a0;
    flex-shrink: 0;
}

.addr-radio.active {
    background-color: #2c1a0e;
    border-color: #2c1a0e;
    box-shadow: inset 0 0 0 6rpx #fff;
}

/* 新增地址表单 */
.addr-form-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background-color: #fff;
    z-index: 1000;
    display: flex;
    flex-direction: column;
}

.addr-form-header {
    display: flex;
    align-items: center;
    padding: 24rpx 30rpx;
    padding-top: calc(var(--status-bar-height) + 50rpx);
    border-bottom: 1rpx solid #f0ebe6;
    flex-shrink: 0;
}

.addr-form-close {
    font-size: 40rpx;
    color: #333;
    margin-right: 24rpx;
    line-height: 1;
    padding: 8rpx;
}

.addr-form-title {
    font-size: 30rpx;
    font-weight: bold;
    color: #2c1a0e;
}

.addr-form-body {
    flex: 1;
    padding: 0 30rpx 30rpx;
    box-sizing: border-box;
    width: 100%;
}

.addr-field-group {
    margin-top: 32rpx;
    width: 100%;
    box-sizing: border-box;
}

.addr-field-label {
    font-size: 26rpx;
    font-weight: bold;
    color: #2c1a0e;
    margin-bottom: 12rpx;
}

.addr-field-optional {
    font-size: 22rpx;
    color: #a08060;
    font-weight: normal;
}

.addr-field-input {
    display: block;
    width: 100%;
    box-sizing: border-box;
    border: 2rpx solid #ddd;
    border-radius: 12rpx;
    padding: 22rpx 24rpx;
    font-size: 28rpx;
    color: #2c1a0e;
    min-height: 80rpx;
}

.addr-field-row {
    display: flex;
    gap: 20rpx;
    margin-top: 32rpx;
}

.addr-field-half {
    flex: 1;
}

.addr-recipient-section {
    margin-top: 48rpx;
}

.addr-section-title {
    font-size: 26rpx;
    color: #a08060;
    margin-bottom: 16rpx;
}

.addr-section-divider {
    height: 1rpx;
    background-color: #ede8e3;
}

.addr-form-save {
    margin: 20rpx 30rpx 60rpx;
    background-color: #2c1a0e;
    height: 96rpx;
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32rpx;
    font-weight: bold;
    color: #fff;
    flex-shrink: 0;
}

/* 时间选择弹窗 */
.picker-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background-color: rgba(0,0,0,0.45);
    z-index: 999;
    display: flex;
    align-items: flex-end;
}

.picker-sheet {
    width: 100%;
    box-sizing: border-box;
    background-color: #fff;
    border-radius: 32rpx 32rpx 0 0;
    padding: 36rpx 24rpx 60rpx;
}

.picker-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32rpx;
}

.picker-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #2c1a0e;
}

.picker-cancel {
    font-size: 28rpx;
    color: #a08060;
}

.date-tabs {
    white-space: nowrap;
    margin-bottom: 28rpx;
}

.date-tab {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 14rpx 28rpx;
    border-radius: 10rpx;
    border: 2rpx solid #ede8e3;
    margin-right: 16rpx;
    background-color: #fff;
}

.date-tab.active {
    background-color: #2c1a0e;
    border-color: #2c1a0e;
}

.date-tab-text {
    font-size: 26rpx;
    color: #2c1a0e;
    font-weight: 500;
}

.date-tab.active .date-tab-text {
    color: #fff;
}

.slots-list {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
    margin-bottom: 36rpx;
}

.slot-item {
    display: flex;
    align-items: center;
    padding: 24rpx 20rpx;
    border-radius: 16rpx;
    border: 2rpx solid #ede8e3;
    background-color: #fff;
    box-sizing: border-box;
}

.slot-item.unavailable {
    background-color: #f5f5f5;
    border-color: #f0f0f0;
}

.slot-item.selected {
    border-color: #2c1a0e;
}

.slot-radio {
    width: 36rpx;
    height: 36rpx;
    border-radius: 50%;
    border: 3rpx solid #c0b0a0;
    margin-right: 20rpx;
    flex-shrink: 0;
}

.slot-radio.active {
    border-color: #2c1a0e;
    background-color: #2c1a0e;
    box-shadow: inset 0 0 0 6rpx #fff;
}

.slot-label {
    flex: 1;
    font-size: 30rpx;
    color: #2c1a0e;
}

.slot-item.unavailable .slot-label {
    color: #bbb;
}

.slot-na {
    font-size: 24rpx;
    color: #bbb;
}

.picker-confirm {
    background-color: #2c1a0e;
    height: 96rpx;
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32rpx;
    font-weight: bold;
    color: #fff;
    box-sizing: border-box;
}

.picker-confirm.disabled {
    background-color: #ccc;
}

/* 支付方式 */
.payment-item {
    display: flex;
    align-items: center;
    padding: 16rpx 0;
}

.payment-icon {
    width: 48rpx;
    height: 30rpx;
    margin-right: 16rpx;
    flex-shrink: 0;
}

.payment-name {
    flex: 1;
    font-size: 27rpx;
    color: #2c1a0e;
}

.payment-radio {
    width: 36rpx;
    height: 36rpx;
    border-radius: 50%;
    border: 2rpx solid #ccc;
    display: flex;
    align-items: center;
    justify-content: center;
}

.payment-radio.selected {
    background-color: #2c1a0e;
    border-color: #2c1a0e;
}

.payment-check {
    color: #fff;
    font-size: 20rpx;
    font-weight: bold;
}

.payment-divider {
    height: 1rpx;
    background-color: #ede8e3;
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
    flex-shrink: 0;
    background-color: #fff;
    padding: 20rpx 30rpx 40rpx;
    box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.08);
}

.submit-btn {
    background-color: #2c1a0e;
    color: #fff;
    height: 96rpx;
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 34rpx;
    font-weight: bold;
    letter-spacing: 2rpx;
}

.submit-btn.disabled {
    opacity: 0.5;
}


/* PayNow 弹窗 */
.paynow-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background-color: rgba(0, 0, 0, 0.45);
    z-index: 999;
    display: flex;
    align-items: center;
    justify-content: center;
}
.paynow-popup {
    background: #fff;
    border-radius: 24rpx;
    width: 90%;
    max-width: 650rpx;
    overflow: hidden;
}
.paynow-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 40rpx 40rpx 20rpx;
}
.paynow-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #2c1a0e;
}
.paynow-close {
    font-size: 36rpx;
    color: #999;
    padding: 10rpx;
}
.paynow-body {
    padding: 0 40rpx 30rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
}
.paynow-amount-box {
    text-align: center;
    margin-bottom: 30rpx;
    width: 100%;
}
.paynow-amount-label {
    display: block;
    font-size: 26rpx;
    color: #999;
    margin-bottom: 10rpx;
}
.paynow-amount {
    font-size: 64rpx;
    font-weight: bold;
    color: #2c1a0e;
}
.paynow-qr-box {
    width: 360rpx;
    height: 360rpx;
    margin-bottom: 30rpx;
    border: 1rpx solid #eee;
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
}
.paynow-qr-image {
    width: 340rpx;
    height: 340rpx;
}
.paynow-account-box {
    background: #fdf6f0;
    border-radius: 16rpx;
    padding: 24rpx;
    text-align: center;
    margin-bottom: 24rpx;
    width: 100%;
    box-sizing: border-box;
}
.paynow-account-label {
    display: block;
    font-size: 24rpx;
    color: #999;
    margin-bottom: 10rpx;
}
.paynow-account-number {
    font-size: 40rpx;
    font-weight: bold;
    color: #2c1a0e;
    letter-spacing: 4rpx;
}
.paynow-tips {
    text-align: center;
    width: 100%;
}
.paynow-tip {
    display: block;
    font-size: 24rpx;
    color: #999;
    margin-bottom: 6rpx;
}
.paynow-tip-highlight {
    display: block;
    font-size: 24rpx;
    color: #c8873a;
    margin-top: 6rpx;
}
.paynow-confirm-btn {
    margin: 0 40rpx 40rpx;
    background: #2c1a0e;
    color: #fff;
    text-align: center;
    padding: 30rpx;
    border-radius: 50rpx;
    font-size: 32rpx;
    font-weight: bold;
}
.paynow-confirm-btn.disabled {
    opacity: 0.5;
}
</style>
