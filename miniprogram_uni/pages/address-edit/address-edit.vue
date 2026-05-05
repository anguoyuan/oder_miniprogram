<template>
    <view class="addr-form-page">
        <!-- 顶部导航 -->
        <view class="addr-form-header" :style="{ paddingTop: (statusBarHeight + 24) + 'px' }">
            <text class="addr-form-close" @tap="goBack">‹</text>
            <text class="addr-form-title">{{ isEdit ? 'Edit Address' : 'Add new delivery address' }}</text>
        </view>

        <!-- 表单内容 -->
        <scroll-view scroll-y class="addr-form-body">
            <view class="addr-field-group">
                <view class="addr-field-label">Postal code</view>
                <input class="addr-field-input" placeholder="e.g. 399948" :value="postalCode" @input="e => postalCode = e.detail.value" />
            </view>
            <view class="addr-field-group">
                <view class="addr-field-label">Building name <text class="addr-field-optional">Optional</text></view>
                <input class="addr-field-input" placeholder="Building name" :value="building" @input="e => building = e.detail.value" />
            </view>
            <view class="addr-field-group">
                <view class="addr-field-label">Address</view>
                <input class="addr-field-input" placeholder="Street address" :value="detail" @input="e => detail = e.detail.value" />
            </view>
            <view class="addr-field-row">
                <view class="addr-field-half">
                    <view class="addr-field-label">Floor</view>
                    <input class="addr-field-input" placeholder="e.g. 06" :value="floor" @input="e => floor = e.detail.value" />
                </view>
                <view class="addr-field-half">
                    <view class="addr-field-label">Unit number</view>
                    <input class="addr-field-input" placeholder="e.g. 31" :value="unit" @input="e => unit = e.detail.value" />
                </view>
            </view>
            <view class="addr-recipient-section">
                <view class="addr-section-title">Recipient's information</view>
                <view class="addr-section-divider"></view>
            </view>
            <view class="addr-field-group">
                <view class="addr-field-label">Name</view>
                <input class="addr-field-input" placeholder="Full name" :value="name" @input="e => name = e.detail.value" />
            </view>
            <view class="addr-field-group">
                <view class="addr-field-label">Mobile number</view>
                <input class="addr-field-input" placeholder="Phone number" :value="phone" @input="e => phone = e.detail.value" type="number" />
            </view>

            <!-- 编辑模式显示删除按钮 -->
            <view v-if="isEdit" class="addr-delete-btn" @tap="deleteAddress">
                <text class="addr-delete-text">Delete this address</text>
            </view>

            <view style="height: 40rpx;"></view>
        </scroll-view>

        <!-- 保存按钮 -->
        <view class="addr-form-save" @tap="saveAddress">
            <text>{{ isEdit ? 'Save Changes' : 'Add address' }}</text>
        </view>
    </view>
</template>

<script>
const app = getApp();
const api = require('../../utils/api.js');
export default {
    data() {
        return {
            statusBarHeight: 0,
            isEdit: false,
            addressId: null,
            postalCode: '',
            building: '',
            detail: '',
            floor: '',
            unit: '',
            name: '',
            phone: '',
            province: '',
            city: '',
            district: '',
            isDefault: false
        };
    },
    onLoad(options) {
        this.statusBarHeight = uni.getSystemInfoSync().statusBarHeight;
        if (options.id) {
            this.isEdit = true;
            this.addressId = options.id;
            this.loadAddressDetail(options.id);
        }
    },
    methods: {
        goBack() {
            uni.navigateBack();
        },

        async loadAddressDetail(id) {
            try {
                uni.showLoading({ title: 'Loading...' });
                let list;
                if (!app.globalData.isLogin) {
                    list = uni.getStorageSync('guestAddresses') || [];
                } else {
                    list = await api.getAddressList();
                }
                const addr = list.find(a => a.id == id);
                if (addr) {
                    this.postalCode = addr.postalCode || '';
                    this.building   = addr.building || '';
                    this.detail     = addr.detail || '';
                    this.floor      = addr.floor || '';
                    this.unit       = addr.unit || '';
                    this.name       = addr.name || '';
                    this.phone      = addr.phone || '';
                    this.province   = addr.province || '';
                    this.city       = addr.city || '';
                    this.district   = addr.district || '';
                    this.isDefault  = addr.isDefault || false;
                }
            } catch (e) {
                uni.showToast({ title: 'Failed to load', icon: 'none' });
            } finally {
                uni.hideLoading();
            }
        },

        async saveAddress() {
            if (!this.name) return uni.showToast({ title: 'Please enter name', icon: 'none' });
            if (!this.phone) return uni.showToast({ title: 'Please enter phone', icon: 'none' });
            if (!this.detail) return uni.showToast({ title: 'Please enter address', icon: 'none' });

            const data = {
                postalCode: this.postalCode,
                building:   this.building,
                detail:     this.detail,
                floor:      this.floor,
                unit:       this.unit,
                name:       this.name,
                phone:      this.phone,
                province:   this.province,
                city:       this.city,
                district:   this.district,
                isDefault:  this.isDefault
            };

            try {
                uni.showLoading({ title: 'Saving...' });
                if (!app.globalData.isLogin) {
                    let list = uni.getStorageSync('guestAddresses') || [];
                    if (this.isEdit) {
                        data.id = this.addressId;
                        list = list.map(a => a.id == this.addressId ? { ...a, ...data } : a);
                    } else {
                        data.id = Date.now();
                        if (list.length === 0) data.isDefault = true;
                        list.push(data);
                    }
                    uni.setStorageSync('guestAddresses', list);
                } else if (this.isEdit) {
                    data.id = this.addressId;
                    await api.updateAddress(data);
                } else {
                    await api.addAddress(data);
                }
                uni.hideLoading();
                uni.showToast({ title: 'Saved', icon: 'success' });
                setTimeout(() => uni.navigateBack(), 1200);
            } catch (e) {
                uni.hideLoading();
                uni.showToast({ title: 'Save failed', icon: 'none' });
            }
        },

        deleteAddress() {
            uni.showModal({
                title: 'Delete Address',
                content: 'Are you sure you want to delete this address?',
                success: async (res) => {
                    if (!res.confirm) return;
                    try {
                        if (!app.globalData.isLogin) {
                            let list = uni.getStorageSync('guestAddresses') || [];
                            list = list.filter(a => a.id != this.addressId);
                            uni.setStorageSync('guestAddresses', list);
                        } else {
                            await api.deleteAddress(this.addressId);
                        }
                        uni.showToast({ title: 'Deleted', icon: 'success' });
                        setTimeout(() => uni.navigateBack(), 1200);
                    } catch (e) {
                        uni.showToast({ title: 'Failed', icon: 'none' });
                    }
                }
            });
        }
    }
};
</script>

<style>
page {
    background-color: #fff;
}

.addr-form-page {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: #fff;
}

.addr-form-header {
    display: flex;
    align-items: center;
    padding-left: 20rpx;
    padding-right: 30rpx;
    padding-bottom: 24rpx;
    border-bottom: 1rpx solid #f0ebe6;
    flex-shrink: 0;
    box-sizing: border-box;
}

.addr-form-close {
    font-size: 52rpx;
    color: #2c1a0e;
    line-height: 1;
    padding: 8rpx 20rpx 8rpx 10rpx;
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
}

.addr-field-group {
    margin-top: 32rpx;
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
    border: 2rpx solid #e8e0d8;
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

.addr-delete-btn {
    margin-top: 60rpx;
    padding: 24rpx 0;
    display: flex;
    align-items: center;
    justify-content: center;
}

.addr-delete-text {
    font-size: 28rpx;
    color: #c0392b;
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
</style>
