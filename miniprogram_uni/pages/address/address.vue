<template>
    <!-- pages/address/address.wxml -->
    <view class="address-container">
        <view v-if="addressList.length > 0" class="address-list">
            <view class="address-item" @tap="selectAddress" :data-address="item" v-for="(item, index) in addressList" :key="index">
                <view class="address-header">
                    <view class="user-info">
                        <text class="user-name">{{ item.name }}</text>
                        <text class="user-phone">{{ item.phone }}</text>
                    </view>
                    <view v-if="item.isDefault" class="default-tag">默认</view>
                </view>

                <view class="address-detail">
                    <text class="address-icon">📍</text>
                    <text class="address-text">{{ item.province }}{{ item.city }}{{ item.district }}{{ item.detail }}</text>
                </view>

                <view class="address-actions">
                    <view class="action-btn" @tap.stop.prevent="editAddress" :data-address="item">
                        <text class="action-icon">✏️</text>
                        <text>编辑</text>
                    </view>
                    <view class="action-btn" @tap.stop.prevent="deleteAddress" :data-id="item.id">
                        <text class="action-icon">🗑️</text>
                        <text>删除</text>
                    </view>
                    <view v-if="!item.isDefault" class="action-btn" @tap.stop.prevent="setDefault" :data-id="item.id">
                        <text class="action-icon">⭐</text>
                        <text>设为默认</text>
                    </view>
                </view>
            </view>
        </view>

        <!-- 空状态 -->
        <view v-else class="empty-address">
            <image src="/static/images/me/shouhuodizhi.png" class="empty-image" />
            <text class="empty-text">还没有收货地址</text>
        </view>

        <!-- 添加地址按钮 -->
        <view class="add-address-btn" @tap="addAddress">
            <text>+ 添加新地址</text>
        </view>

        <!-- 加载中 -->
        <view v-if="loading" class="loading">
            <text>加载中...</text>
        </view>
    </view>
</template>

<script>
// pages/address/address.js
const app = getApp();
const api = require('../../utils/api.js');
export default {
    data() {
        return {
            addressList: [],
            loading: false,
            selectedAddress: '',
            address: ''
        };
    },
    onLoad(options) {
        this.fromPage = options.from || '';
        this.loadAddressList();
    },
    onShow() {
        this.loadAddressList();
    },
    methods: {
        // 加载地址列表
        async loadAddressList() {
            if (!app.globalData.isLogin) {
                const local = uni.getStorageSync('guestAddresses') || [];
                this.setData({ addressList: local });
                return;
            }
            this.setData({ loading: true });
            try {
                const result = await api.getAddressList();
                this.setData({ addressList: result || [] });
            } catch (error) {
                console.error('加载地址列表失败', error);
                uni.showToast({ title: '加载失败', icon: 'none' });
            } finally {
                this.setData({ loading: false });
            }
        },

        // 选择地址（从结算页跳转过来时）
        selectAddress(e) {
            const address = e.currentTarget.dataset.address;
            if (this.fromPage === 'checkout') {
                // 将选中的地址传回结算页
                const pages = getCurrentPages();
                const prevPage = pages[pages.length - 2];
                if (prevPage) {
                    prevPage.setData({
                        selectedAddress: address,
                        address: `${address.name} ${address.phone} ${address.province}${address.city}${address.district}${address.detail}`
                    });
                }
                uni.navigateBack();
            }
        },

        // 设置默认地址
        async setDefault(e) {
            const addressId = e.currentTarget.dataset.id;
            if (!app.globalData.isLogin) {
                let list = uni.getStorageSync('guestAddresses') || [];
                list = list.map(a => ({ ...a, isDefault: a.id == addressId }));
                uni.setStorageSync('guestAddresses', list);
                this.setData({ addressList: list });
                return;
            }
            try {
                await api.setDefaultAddress(addressId);
                uni.showToast({ title: '设置成功', icon: 'success' });
                this.loadAddressList();
            } catch (error) {
                uni.showToast({ title: '设置失败', icon: 'none' });
            }
        },

        // 编辑地址
        editAddress(e) {
            const address = e.currentTarget.dataset.address;
            uni.navigateTo({
                url: `/pages/address-edit/address-edit?id=${address.id}`
            });
        },

        // 删除地址
        deleteAddress(e) {
            const addressId = e.currentTarget.dataset.id;
            uni.showModal({
                title: '确认删除',
                content: '确定要删除这个地址吗？',
                success: async (res) => {
                    if (!res.confirm) return;
                    if (!app.globalData.isLogin) {
                        let list = uni.getStorageSync('guestAddresses') || [];
                        list = list.filter(a => a.id != addressId);
                        uni.setStorageSync('guestAddresses', list);
                        this.setData({ addressList: list });
                        return;
                    }
                    try {
                        await api.deleteAddress(addressId);
                        uni.showToast({ title: '删除成功', icon: 'success' });
                        this.loadAddressList();
                    } catch (error) {
                        uni.showToast({ title: '删除失败', icon: 'none' });
                    }
                }
            });
        },

        // 添加地址
        addAddress() {
            uni.navigateTo({
                url: '/pages/address-edit/address-edit'
            });
        }
    }
};
</script>
<style>
/* pages/address/address.wxss */
.address-container {
    min-height: 100vh;
    background-color: #f8f8f8;
    padding: 20rpx;
    padding-bottom: 120rpx;
}

/* 地址列表 */
.address-list {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
}

.address-item {
    background-color: #fff;
    border-radius: 16rpx;
    padding: 30rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
}

.address-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 20rpx;
}

.user-name {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
}

.user-phone {
    font-size: 28rpx;
    color: #666;
}

.default-tag {
    padding: 8rpx 16rpx;
    background: linear-gradient(135deg, #aad08f 0%, #8bc34a 100%);
    color: #fff;
    font-size: 24rpx;
    border-radius: 20rpx;
}

.address-detail {
    display: flex;
    align-items: flex-start;
    margin-bottom: 20rpx;
    padding: 20rpx;
    background-color: #f8f8f8;
    border-radius: 12rpx;
}

.address-icon {
    font-size: 32rpx;
    margin-right: 10rpx;
}

.address-text {
    flex: 1;
    font-size: 28rpx;
    color: #333;
    line-height: 1.6;
}

.address-actions {
    display: flex;
    gap: 20rpx;
    padding-top: 20rpx;
    border-top: 1rpx solid #e0e0e0;
}

.action-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
    padding: 16rpx;
    background-color: #f5f5f5;
    border-radius: 8rpx;
    font-size: 26rpx;
    color: #666;
}

.action-icon {
    font-size: 28rpx;
}

/* 空状态 */
.empty-address {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-top: 200rpx;
}

.empty-image {
    width: 300rpx;
    height: 300rpx;
    margin-bottom: 40rpx;
}

.empty-text {
    font-size: 32rpx;
    color: #999;
    margin-bottom: 60rpx;
}

/* 添加地址按钮 */
.add-address-btn {
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

/* 加载中 */
.loading {
    text-align: center;
    padding: 40rpx;
    color: #999;
    font-size: 28rpx;
}
</style>
