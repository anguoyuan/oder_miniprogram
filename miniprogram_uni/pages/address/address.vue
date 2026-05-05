<template>
    <view class="address-page">
        <!-- 顶部导航 -->
        <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px', height: (statusBarHeight + 44) + 'px' }">
            <text class="nav-back" @tap="goBack">←</text>
            <text class="nav-title">Address</text>
            <view style="width: 60rpx;"></view>
        </view>

        <scroll-view scroll-y class="addr-scroll">
            <view v-if="loading" class="addr-empty">
                <text class="addr-empty-text">Loading...</text>
            </view>
            <view v-else-if="addressList.length === 0" class="addr-empty">
                <text class="addr-empty-text">No addresses yet</text>
            </view>

            <view v-for="(item, i) in addressList" :key="i" class="addr-card" @tap="setDefault(item.id)">
                <view class="addr-card-content">
                    <text class="addr-name">{{ item.name }}  {{ item.phone }}</text>
                    <text class="addr-detail">{{ item.province }}{{ item.city }}{{ item.district }}{{ item.detail }}</text>
                    <text class="addr-edit" @tap.stop="editAddress(item)">Edit</text>
                </view>
                <view :class="['addr-radio', item.isDefault ? 'active' : '']"></view>
            </view>

            <view class="add-link-row" @tap="addAddress">
                <text class="add-link">+ 添加新地址</text>
            </view>
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
                    this.addressList = uni.getStorageSync('guestAddresses') || [];
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
        }
    }
};
</script>

<style>
page {
    background-color: #f5f5f5;
}

.address-page {
    min-height: 100vh;
    background-color: #f5f5f5;
    display: flex;
    flex-direction: column;
}

.nav-bar {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    padding: 0 30rpx 16rpx;
    box-sizing: border-box;
    background-color: #fff;
    border-bottom: 1rpx solid #eee;
    flex-shrink: 0;
}

.nav-back {
    font-size: 40rpx;
    color: #2c1a0e;
    width: 60rpx;
}

.nav-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #2c1a0e;
    flex: 1;
    text-align: center;
}

.addr-scroll {
    flex: 1;
    padding: 24rpx 0;
}

.addr-empty {
    padding: 120rpx 0;
    display: flex;
    align-items: center;
    justify-content: center;
}

.addr-empty-text {
    font-size: 28rpx;
    color: #a08060;
}

.addr-card {
    background: #fff;
    margin: 0 24rpx 20rpx;
    border-radius: 16rpx;
    padding: 28rpx 24rpx;
    display: flex;
    align-items: center;
    gap: 20rpx;
}

.addr-card-content {
    flex: 1;
}

.addr-radio {
    width: 40rpx;
    height: 40rpx;
    border-radius: 50%;
    border: 2rpx solid #d0c0b0;
    flex-shrink: 0;
}

.addr-radio.active {
    border-color: #2c1a0e;
    background: #2c1a0e;
    box-shadow: inset 0 0 0 6rpx #fff;
}

.addr-name {
    font-size: 28rpx;
    font-weight: bold;
    color: #2c1a0e;
    display: block;
    margin-bottom: 8rpx;
}

.addr-edit {
    font-size: 24rpx;
    color: #C4A882;
    display: block;
    margin-top: 12rpx;
}

.addr-detail {
    font-size: 26rpx;
    color: #888;
    line-height: 1.5;
}

.add-link-row {
    padding: 16rpx 0 40rpx;
    display: flex;
    justify-content: center;
}

.add-link {
    font-size: 26rpx;
    color: #a08060;
}
</style>
