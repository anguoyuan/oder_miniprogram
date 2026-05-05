<template>
    <view class="addr-form-overlay">
        <!-- 顶部 header -->
        <view class="addr-form-header" :style="{ paddingTop: (statusBarHeight+4) + 'px' }">
            <text class="addr-form-close" @tap="goBack">✕</text>
            <text class="addr-form-title">{{ isEdit ? 'Edit address' : 'Add new delivery address' }}</text>
        </view>

        <!-- 表单内容 -->
        <scroll-view scroll-y class="addr-form-body">
            <view class="addr-field-group">
                <view class="addr-field-label">Postal code</view>
                <input class="addr-field-input" placeholder="e.g. 399948" :value="form.postalCode" @input="e => form.postalCode = e.detail.value" />
            </view>
            <view class="addr-field-group">
                <view class="addr-field-label">Building name <text class="addr-field-optional">Optional</text></view>
                <input class="addr-field-input" placeholder="Building name" :value="form.building" @input="e => form.building = e.detail.value" />
            </view>
            <view class="addr-field-group">
                <view class="addr-field-label">Address</view>
                <input class="addr-field-input" placeholder="Street address" :value="form.detail" @input="e => form.detail = e.detail.value" />
            </view>
            <view class="addr-field-row">
                <view class="addr-field-half">
                    <view class="addr-field-label">Floor</view>
                    <input class="addr-field-input" placeholder="e.g. 06" :value="form.floor" @input="e => form.floor = e.detail.value" />
                </view>
                <view class="addr-field-half">
                    <view class="addr-field-label">Unit number</view>
                    <input class="addr-field-input" placeholder="e.g. 31" :value="form.unit" @input="e => form.unit = e.detail.value" />
                </view>
            </view>
            <view class="addr-recipient-section">
                <view class="addr-section-title">Recipient's information</view>
                <view class="addr-section-divider" />
            </view>
            <view class="addr-field-group">
                <view class="addr-field-label">Name</view>
                <input class="addr-field-input" placeholder="Full name" :value="form.name" @input="e => form.name = e.detail.value" />
            </view>
            <view class="addr-field-group">
                <view class="addr-field-label">Mobile number</view>
                <input class="addr-field-input" placeholder="Phone number" :value="form.phone" @input="e => form.phone = e.detail.value" type="number" />
            </view>

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
            form: {
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
            }
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
                    this.form = {
                        postalCode: addr.postalCode || '',
                        building:   addr.building || '',
                        detail:     addr.detail || '',
                        floor:      addr.floor || '',
                        unit:       addr.unit || '',
                        name:       addr.name || '',
                        phone:      addr.phone || '',
                        province:   addr.province || '',
                        city:       addr.city || '',
                        district:   addr.district || '',
                        isDefault:  addr.isDefault || false
                    };
                }
            } catch (e) {
                uni.showToast({ title: 'Failed to load', icon: 'none' });
            } finally {
                uni.hideLoading();
            }
        },

        async saveAddress() {
            if (!this.form.name) return uni.showToast({ title: 'Please enter name', icon: 'none' });
            if (!this.form.phone) return uni.showToast({ title: 'Please enter phone', icon: 'none' });
            if (!this.form.detail) return uni.showToast({ title: 'Please enter address', icon: 'none' });

            const data = { ...this.form };
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
                content: 'Are you sure?',
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

.addr-form-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background-color: #fff;
    display: flex;
    flex-direction: column;
}

.addr-form-header {
    display: flex;
    align-items: center;
    padding: 0 30rpx 24rpx;
    box-sizing: border-box;
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
