<template>
    <view class="address-container">
        <!-- 自定义导航栏 -->
        <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px', height: (statusBarHeight + 44) + 'px' }">
            <text class="nav-back" @tap="goBack">‹</text>
            <text class="nav-title">My Addresses</text>
            <view style="width: 60rpx;"></view>
        </view>

        <!-- 地址列表 -->
        <scroll-view scroll-y class="addr-scroll">
            <view v-if="loading" class="addr-empty">
                <text class="addr-empty-text">Loading...</text>
            </view>
            <view v-else-if="addressList.length === 0" class="addr-empty">
                <text class="addr-empty-text">No addresses yet</text>
            </view>
            <view v-for="(item, i) in addressList" :key="i" class="addr-item" @tap="setDefault(item.id)">
                <!-- 左侧内容 -->
                <view class="addr-main">
                    <text class="addr-region">{{ item.province }}{{ item.city }}{{ item.district }}</text>
                    <text class="addr-street">{{ item.detail }}</text>
                    <view class="addr-bottom">
                        <text class="addr-person">{{ item.name }}  {{ item.phone }}</text>
                    </view>
                    <text class="addr-edit-link" @tap.stop="editAddress(item)">Edit</text>
                </view>
                <!-- 右侧单选圈 -->
                <view class="addr-radio" @tap.stop="setDefault(item.id)">
                    <view :class="['addr-radio-outer', item.isDefault ? 'addr-radio-selected' : '']">
                        <view v-if="item.isDefault" class="addr-radio-inner"></view>
                    </view>
                </view>
            </view>

            <view class="add-btn" @tap="addAddress">
                <text class="add-btn-text">+ Add New Address</text>
            </view>

            <view style="height: 40rpx;"></view>
        </scroll-view>
    </view>
</template>

<script>
const app = getApp();
const api = require('../../utils/api.js');
export default {
    data() {
        return {
            addressList: [],
            loading: false,
            statusBarHeight: 0
        };
    },
    onLoad() {
        this.statusBarHeight = uni.getSystemInfoSync().statusBarHeight;
    },
    onShow() {
        this.loadAddressList();
    },
    methods: {
        goBack() {
            uni.navigateBack();
        },

        async loadAddressList() {
            this.loading = true;
            try {
                if (!app.globalData.isLogin) {
                    const local = uni.getStorageSync('guestAddresses') || [];
                    this.addressList = local;
                    return;
                }
                const result = await api.getAddressList();
                this.addressList = result || [];
            } catch (e) {
                uni.showToast({ title: '加载失败', icon: 'none' });
            } finally {
                this.loading = false;
            }
        },

        addAddress() {
            uni.navigateTo({ url: '/pages/address-edit/address-edit' });
        },

        editAddress(item) {
            uni.navigateTo({ url: `/pages/address-edit/address-edit?id=${item.id}` });
        },

        async setDefault(id) {
            const item = this.addressList.find(a => a.id == id);
            if (item && item.isDefault) return;
            if (!app.globalData.isLogin) {
                let list = uni.getStorageSync('guestAddresses') || [];
                list = list.map(a => ({ ...a, isDefault: a.id == id }));
                uni.setStorageSync('guestAddresses', list);
                this.addressList = list;
                return;
            }
            try {
                await api.setDefaultAddress(id);
                this.loadAddressList();
            } catch (e) {
                uni.showToast({ title: '设置失败', icon: 'none' });
            }
        },

        deleteAddress(id) {
            uni.showModal({
                title: 'Delete Address',
                content: 'Are you sure?',
                success: async (res) => {
                    if (!res.confirm) return;
                    if (!app.globalData.isLogin) {
                        let list = uni.getStorageSync('guestAddresses') || [];
                        list = list.filter(a => a.id != id);
                        uni.setStorageSync('guestAddresses', list);
                        this.addressList = list;
                        return;
                    }
                    try {
                        await api.deleteAddress(id);
                        this.loadAddressList();
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

.address-container {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: #fff;
}

/* 导航栏 */
.nav-bar {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    padding: 0 30rpx 16rpx;
    box-sizing: border-box;
    border-bottom: 1rpx solid #f0ebe6;
    flex-shrink: 0;
}

.nav-back {
    font-size: 52rpx;
    color: #2c1a0e;
    line-height: 1;
    width: 60rpx;
}

.nav-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #2c1a0e;
    flex: 1;
    text-align: center;
}

.add-btn {
    flex-shrink: 0;
    padding: 24rpx 30rpx 40rpx;
    display: flex;
    align-items: center;
    justify-content: center;
}

.add-btn-text {
    font-size: 28rpx;
    color: #8B5E3C;
}

/* 列表 */
.addr-scroll {
    flex: 1;
}

.addr-empty {
    padding: 100rpx 0;
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
    padding: 32rpx 30rpx;
    border-bottom: 1rpx solid #f0ebe6;
}

.addr-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10rpx;
    margin-right: 24rpx;
}

.addr-region {
    font-size: 24rpx;
    color: #a08060;
}

.addr-street {
    font-size: 30rpx;
    font-weight: bold;
    color: #2c1a0e;
    line-height: 1.5;
}

.addr-bottom {
    display: flex;
    align-items: center;
    gap: 16rpx;
}

.addr-person {
    font-size: 26rpx;
    color: #2c1a0e;
}

.addr-edit-link {
    font-size: 24rpx;
    color: #a08060;
    margin-top: 6rpx;
}

/* 单选圈 */
.addr-radio {
    padding: 10rpx 0 10rpx 16rpx;
    flex-shrink: 0;
}

.addr-radio-outer {
    width: 40rpx;
    height: 40rpx;
    border-radius: 50%;
    border: 2rpx solid #d0c0b0;
    display: flex;
    align-items: center;
    justify-content: center;
}

.addr-radio-selected {
    border-color: #8B5E3C;
}

.addr-radio-inner {
    width: 22rpx;
    height: 22rpx;
    border-radius: 50%;
    background-color: #8B5E3C;
}
</style>
