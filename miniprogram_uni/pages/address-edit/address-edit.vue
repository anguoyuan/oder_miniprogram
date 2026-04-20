<template>
    <!-- pages/address-edit/address-edit.wxml -->
    <view class="address-edit-container">
        <view class="form-section">
            <!-- 收货人 -->
            <view class="form-item">
                <text class="form-label">收货人</text>
                <input class="form-input" placeholder="请输入收货人姓名" :value="name" @input="inputName" maxlength="20" />
            </view>

            <!-- 手机号 -->
            <view class="form-item">
                <text class="form-label">手机号</text>
                <input class="form-input" placeholder="请输入手机号" :value="phone" @input="inputPhone" type="number" maxlength="11" />
            </view>

            <!-- 省 -->
            <view class="form-item">
                <text class="form-label">省/州</text>
                <input class="form-input" placeholder="请输入省/州" :value="province" @input="inputProvince" maxlength="50" />
            </view>

            <!-- 市 -->
            <view class="form-item">
                <text class="form-label">城市</text>
                <input class="form-input" placeholder="请输入城市" :value="city" @input="inputCity" maxlength="50" />
            </view>

            <!-- 区 -->
            <view class="form-item">
                <text class="form-label">区/县</text>
                <input class="form-input" placeholder="请输入区/县（选填）" :value="district" @input="inputDistrict" maxlength="50" />
            </view>

            <!-- 详细地址 -->
            <view class="form-item form-item-full">
                <text class="form-label">详细地址</text>
                <textarea class="form-textarea" placeholder="选择位置后自动填入，可手动修改" :value="detail" @input="inputDetail" maxlength="200" auto-height />
            </view>

            <!-- 设为默认地址 -->
            <view class="form-item form-item-switch">
                <text class="form-label">设为默认地址</text>
                <switch :checked="isDefault" @change="toggleDefault" color="#AAD08F" />
            </view>
        </view>

        <!-- 保存按钮 -->
        <view class="save-btn" @tap="saveAddress">
            <text>保存</text>
        </view>
    </view>
</template>

<script>
// pages/address-edit/address-edit.js
const app = getApp();
const api = require('../../utils/api.js');
export default {
    data() {
        return {
            addressId: null,
            name: '',
            phone: '',
            province: '',
            city: '',
            district: '',
            detail: '',
            latitude: null,
            longitude: null,
            isDefault: false,
            // 省市区选择
            regions: ['请选择', '请选择', '请选择'],
            isEdit: false
        };
    },
    onLoad(options) {
        if (options.id) {
            this.setData({
                addressId: options.id,
                isEdit: true
            });
            this.loadAddressDetail(options.id);
        }
    },
    methods: {
        // 加载地址详情
        async loadAddressDetail(addressId) {
            try {
                uni.showLoading({ title: '加载中...' });
                let addressList;
                if (!app.globalData.isLogin) {
                    addressList = uni.getStorageSync('guestAddresses') || [];
                } else {
                    addressList = await api.getAddressList();
                }
                const address = addressList.find((item) => item.id == addressId);
                if (address) {
                    this.setData({
                        name: address.name,
                        phone: address.phone,
                        province: address.province,
                        city: address.city,
                        district: address.district,
                        detail: address.detail,
                        latitude: address.latitude,
                        longitude: address.longitude,
                        isDefault: address.isDefault,
                        regions: [address.province, address.city, address.district]
                    });
                }
                uni.hideLoading();
            } catch (error) {
                console.log('CatchClause', error);
                console.log('CatchClause', error);
                uni.hideLoading();
                uni.showToast({
                    title: '加载失败',
                    icon: 'none'
                });
            }
        },

        // 输入姓名
        inputName(e) {
            this.setData({
                name: e.detail.value
            });
        },

        // 输入电话
        inputPhone(e) {
            this.setData({
                phone: e.detail.value
            });
        },

        // 输入省
        inputProvince(e) {
            this.setData({ province: e.detail.value });
        },

        // 输入城市
        inputCity(e) {
            this.setData({ city: e.detail.value });
        },

        // 输入区县
        inputDistrict(e) {
            this.setData({ district: e.detail.value });
        },

        // 输入详细地址
        inputDetail(e) {
            this.setData({
                detail: e.detail.value
            });
        },

        // 切换默认地址
        toggleDefault() {
            this.setData({
                isDefault: !this.isDefault
            });
        },

        // 保存地址
        async saveAddress() {
            // 验证数据
            if (!this.name) {
                uni.showToast({
                    title: '请输入收货人姓名',
                    icon: 'none'
                });
                return;
            }
            if (!this.phone) {
                uni.showToast({ title: '请输入手机号', icon: 'none' });
                return;
            }
            if (!this.province || this.province === '请选择') {
                uni.showToast({
                    title: '请选择省市区',
                    icon: 'none'
                });
                return;
            }
            if (!this.detail) {
                uni.showToast({
                    title: '请输入详细地址',
                    icon: 'none'
                });
                return;
            }
            const addressData = {
                name: this.name,
                phone: this.phone,
                province: this.province,
                city: this.city,
                district: this.district,
                detail: this.detail,
                latitude: this.latitude,
                longitude: this.longitude,
                isDefault: this.isDefault
            };
            try {
                uni.showLoading({ title: '保存中...' });
                if (!app.globalData.isLogin) {
                    let list = uni.getStorageSync('guestAddresses') || [];
                    if (this.isEdit) {
                        addressData.id = this.addressId;
                        list = list.map(a => a.id == this.addressId ? { ...a, ...addressData } : a);
                    } else {
                        addressData.id = Date.now();
                        if (addressData.isDefault || list.length === 0) {
                            list = list.map(a => ({ ...a, isDefault: false }));
                            addressData.isDefault = true;
                        }
                        list.push(addressData);
                    }
                    uni.setStorageSync('guestAddresses', list);
                } else if (this.isEdit) {
                    addressData.id = this.addressId;
                    await api.updateAddress(addressData);
                } else {
                    await api.addAddress(addressData);
                }
                uni.hideLoading();
                uni.showToast({ title: '保存成功', icon: 'success' });
                setTimeout(() => { uni.navigateBack(); }, 1500);
            } catch (error) {
                uni.hideLoading();
                uni.showToast({ title: '保存失败', icon: 'none' });
            }
        }
    }
};
</script>
<style>
/* pages/address-edit/address-edit.wxss */
.address-edit-container {
    min-height: 100vh;
    background-color: #f8f8f8;
    padding: 20rpx;
    padding-bottom: 140rpx;
}

/* 表单区域 */
.form-section {
    background-color: #fff;
    border-radius: 16rpx;
    padding: 20rpx;
}

.form-item {
    display: flex;
    align-items: center;
    padding: 30rpx 20rpx;
    border-bottom: 1rpx solid #e0e0e0;
}

.form-item-full {
    flex-direction: column;
    align-items: flex-start;
}

.form-item-switch {
    justify-content: space-between;
    border-bottom: none;
}

.form-label {
    width: 160rpx;
    font-size: 30rpx;
    color: #333;
    font-weight: bold;
}

.form-input {
    flex: 1;
    font-size: 28rpx;
    color: #333;
}

.form-textarea {
    width: 100%;
    min-height: 150rpx;
    margin-top: 20rpx;
    padding: 20rpx;
    background-color: #f8f8f8;
    border-radius: 12rpx;
    font-size: 28rpx;
}

.region-picker {
    flex: 1;
}

.picker-value {
    font-size: 28rpx;
    color: #333;
    text-align: right;
}

.form-item-button {
    flex-direction: column;
    align-items: flex-start;
}

.location-button {
    width: 100%;
    margin-top: 20rpx;
    padding: 24rpx;
    background: linear-gradient(135deg, #aad08f 0%, #8bc34a 100%);
    color: #fff;
    border-radius: 12rpx;
    font-size: 28rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10rpx;
    border: none;
}

.location-button::after {
    border: none;
}

.location-icon {
    font-size: 32rpx;
}

.region-display {
    flex: 1;
    font-size: 28rpx;
    color: #666;
    text-align: right;
}

/* 保存按钮 */
.save-btn {
    position: fixed;
    bottom: 40rpx;
    left: 40rpx;
    right: 40rpx;
    height: 90rpx;
    background: linear-gradient(135deg, #aad08f 0%, #8bc34a 100%);
    color: #fff;
    border-radius: 50rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32rpx;
    font-weight: bold;
    box-shadow: 0 8rpx 16rpx rgba(170, 208, 143, 0.3);
}
</style>
