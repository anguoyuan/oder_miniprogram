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

            <!-- 选择位置 -->
            <view class="form-item form-item-button">
                <text class="form-label">选择位置</text>
                <button class="location-button" @tap="chooseLocation">
                    <text class="location-icon">📍</text>
                    <text>{{ latitude && longitude ? '重新选择位置' : '点击选择位置' }}</text>
                </button>
            </view>

            <!-- 省市区选择 -->
            <view class="form-item">
                <text class="form-label">所在地区</text>
                <view class="region-display">{{ regions[0] }} {{ regions[1] }} {{ regions[2] }}</view>
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
                uni.showLoading({
                    title: '加载中...'
                });
                const addressList = await api.getAddressList();
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

        // 选择省市区
        regionChange(e) {
            const regions = e.detail.value;
            this.setData({
                regions: regions,
                province: regions[0],
                city: regions[1],
                district: regions[2]
            });
        },

        // 输入详细地址
        inputDetail(e) {
            this.setData({
                detail: e.detail.value
            });
        },

        // 选择位置
        chooseLocation() {
            uni.chooseLocation({
                success: (res) => {
                    console.log('选择的位置:', res);
                    this.setData({
                        province: res.address.split(/省|市|区|县/)[0] + '省',
                        city: res.address.split(/省|市/)[1]?.split(/区|县/)[0] + '市' || '',
                        district: res.address.split(/区|县/)[0].split(/市/)[1] + '区' || '',
                        detail: res.name || res.address,
                        latitude: res.latitude,
                        longitude: res.longitude,
                        regions: [
                            res.address.split(/省|市|区|县/)[0] + '省',
                            res.address.split(/省|市/)[1]?.split(/区|县/)[0] + '市' || '请选择',
                            res.address.split(/区|县/)[0].split(/市/)[1] + '区' || '请选择'
                        ]
                    });
                    uni.showToast({
                        title: '位置已选择',
                        icon: 'success'
                    });
                },
                fail: (err) => {
                    console.error('选择位置失败', err);
                    if (err.errMsg.indexOf('auth deny') !== -1) {
                        uni.showModal({
                            title: '提示',
                            content: '需要授权位置权限才能选择地址',
                            confirmText: '去设置',
                            success: (res) => {
                                if (res.confirm) {
                                    uni.openSetting();
                                }
                            }
                        });
                    }
                }
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
                uni.showToast({
                    title: '请输入手机号',
                    icon: 'none'
                });
                return;
            }
            if (!/^1[3-9]\d{9}$/.test(this.phone)) {
                uni.showToast({
                    title: '手机号格式不正确',
                    icon: 'none'
                });
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
            if (!this.latitude || !this.longitude) {
                uni.showToast({
                    title: '请选择地址位置',
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
                uni.showLoading({
                    title: '保存中...'
                });
                if (this.isEdit) {
                    addressData.id = this.addressId;
                    await api.updateAddress(addressData);
                } else {
                    await api.addAddress(addressData);
                }
                uni.hideLoading();
                uni.showToast({
                    title: '保存成功',
                    icon: 'success'
                });
                setTimeout(() => {
                    uni.navigateBack();
                }, 1500);
            } catch (error) {
                console.log('CatchClause', error);
                console.log('CatchClause', error);
                uni.hideLoading();
                uni.showToast({
                    title: '保存失败',
                    icon: 'none'
                });
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
