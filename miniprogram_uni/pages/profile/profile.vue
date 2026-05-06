<template>
    <view class="profile-container">
        <scroll-view scroll-y class="scroll-wrap" :style="{ paddingTop: statusBarHeight + 'px' }">

            <!-- 用户信息头部 -->
            <view class="user-header">
                <image
                    :src="isLogin ? userInfo.avatar : '/static/images/icon/person.png'"
                    class="user-avatar"
                    @tap="handleAvatarTap"
                />
                <view class="user-info-text">
                    <text class="user-name">{{ isLogin ? userInfo.nickname : 'Hello, Guest' }}</text>
                    <text class="user-sub">{{ isLogin ? '已登录' : '点击头像登录' }}</text>
                </view>
            </view>

            <!-- MY ACCOUNT -->
            <view class="section-title">MY ACCOUNT</view>
            <view class="stats-row">
                <view class="stats-card" @tap="goToOrders">
                    <text class="stats-num">{{ orderCount }}</text>
                    <text class="stats-label">ORDERS</text>
                </view>
                <view class="stats-card">
                    <text class="stats-num">{{ totalSpent }}</text>
                    <text class="stats-label">NONG COINS</text>
                </view>
            </view>

            <!-- 菜单 -->
            <view class="menu-group">
                <view class="menu-item" @tap="goToOrders">
                    <image src="/static/images/me/orders.png" class="menu-icon" />
                    <text class="menu-text">我的订单</text>
                    <text class="menu-arrow">›</text>
                </view>
                <view class="menu-divider" />
                <view class="menu-item" @tap="handleMenuClick" data-type="address">
                    <image src="/static/images/me/address.png" class="menu-icon" />
                    <text class="menu-text">收货地址</text>
                    <text class="menu-arrow">›</text>
                </view>
            </view>

            <view class="menu-group" style="margin-top: 20rpx;">
                <view class="menu-item" @tap="handleMenuClick" data-type="usage">
                    <image src="/static/images/me/note.png" class="menu-icon" />
                    <text class="menu-text">使用须知</text>
                    <text class="menu-arrow">›</text>
                </view>
                <view class="menu-divider" />
                <view class="menu-item" @tap="handleMenuClick" data-type="privacy">
                    <image src="/static/images/me/privacy.png" class="menu-icon" />
                    <text class="menu-text">隐私条款</text>
                    <text class="menu-arrow">›</text>
                </view>
                <view class="menu-divider" />
                <view class="menu-item" @tap="handleMenuClick" data-type="recruitment">
                    <image src="/static/images/me/megaphone.png" class="menu-icon" />
                    <text class="menu-text">员工招聘</text>
                    <text class="menu-arrow">›</text>
                </view>
            </view>

            <view class="logout-link" v-if="isLogin" @tap="handleLogout">
                <text class="logout-link-text">退出登录</text>
            </view>

            <view class="version-info">
                <text class="version-text">v1.0.0</text>
            </view>

        </scroll-view>

        <!-- 登录资料设置弹窗 -->
        <view v-if="showProfileSetup" class="setup-overlay" @tap.stop>
            <view class="setup-popup">
                <text class="setup-title">设置你的资料</text>
                <text class="setup-sub">头像和昵称将用于你的账号</text>

                <button
                    class="avatar-picker-btn"
                    open-type="chooseAvatar"
                    @chooseavatar="handleChooseAvatar"
                >
                    <image :src="tempAvatar || '/static/images/icon/person.png'" class="setup-avatar" />
                    <text class="avatar-hint">点击更换头像</text>
                </button>

                <view class="nickname-wrap">
                    <input
                        type="nickname"
                        class="nickname-input"
                        placeholder="输入你的昵称"
                        @change="handleNicknameChange"
                        @blur="handleNicknameBlur"
                        @input="handleNicknameInput"
                    />
                </view>

                <view class="setup-actions">
                    <view class="setup-cancel" @tap="cancelSetup">
                        <text class="setup-cancel-text">取消</text>
                    </view>
                    <view class="setup-confirm" @tap="confirmProfile">
                        <text class="setup-confirm-text">完成登录</text>
                    </view>
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
            isLogin: false,
            userInfo: null,
            orderCount: 0,
            totalSpent: 0,
            statusBarHeight: 0,
            showProfileSetup: false,
            tempAvatar: '',
            tempNickname: '',
            loginCode: ''
        };
    },
    onLoad() {
        this.statusBarHeight = uni.getSystemInfoSync().statusBarHeight;
        this.checkLoginStatus();
    },
    onShow() {
        this.checkLoginStatus();
        if (this.isLogin) {
            this.loadUserStats();
        }
    },
    methods: {
        checkLoginStatus() {
            this.setData({
                isLogin: app.globalData.isLogin,
                userInfo: app.globalData.userInfo
            });
        },

        async loadUserStats() {
            try {
                const result = await api.getUserOrders({ page: 1, pageSize: 1000 });
                const orders = result.records || [];
                const paidOrders = orders.filter((o) => o.paymentStatus === 'paid');
                const orderCount = paidOrders.length;
                const nongCoins = Math.floor(
                    paidOrders.reduce((total, order) => {
                        const price = parseFloat(order.totalPrice || 0);
                        let coins;
                        if (price < 60) coins = price * 1;
                        else if (price <= 100) coins = price * 1.5;
                        else coins = price * 2;
                        return total + coins;
                    }, 0)
                );
                this.setData({ orderCount, totalSpent: nongCoins });
            } catch (error) {
                console.error('加载用户统计失败', error);
                this.setData({ orderCount: 0, totalSpent: 0 });
            }
        },

        handleAvatarTap() {
            if (!this.isLogin) {
                this.handleLogin();
            }
        },

        handleLogin() {
            uni.login({
                success: (loginRes) => {
                    this.setData({
                        loginCode: loginRes.code,
                        tempAvatar: '',
                        tempNickname: '',
                        showProfileSetup: true
                    });
                },
                fail: () => {
                    uni.showToast({ title: '获取登录凭证失败', icon: 'none' });
                }
            });
        },

        handleChooseAvatar(e) {
            this.setData({ tempAvatar: e.detail.avatarUrl });
        },

        handleNicknameChange(e) {
            this.setData({ tempNickname: e.detail.value });
        },

        handleNicknameInput(e) {
            this.setData({ tempNickname: e.detail.value });
        },

        handleNicknameBlur(e) {
            this.setData({ tempNickname: e.detail.value });
        },

        async confirmProfile() {
            if (!this.tempNickname.trim()) {
                uni.showToast({ title: '请输入昵称', icon: 'none' });
                return;
            }
            try {
                uni.showLoading({ title: '登录中...' });

                // 先上传头像，获取永久URL
                let avatarUrl = '';
                if (this.tempAvatar) {
                    avatarUrl = await this.uploadAvatar(this.tempAvatar);
                }

                const result = await api.wxLogin({
                    code: this.loginCode,
                    nickname: this.tempNickname,
                    avatar: avatarUrl
                });
                uni.hideLoading();

                const userInfo = {
                    ...result.user,
                    nickname: this.tempNickname,
                    avatar: avatarUrl || result.user.avatar
                };

                uni.setStorageSync('token', result.token);
                uni.setStorageSync('userInfo', userInfo);
                app.globalData.isLogin = true;
                app.globalData.userInfo = userInfo;
                this.setData({ isLogin: true, userInfo, showProfileSetup: false });
                this.loadUserStats();
                uni.showToast({ title: '登录成功', icon: 'success' });
            } catch (error) {
                uni.hideLoading();
                console.error('登录失败', error);
                uni.showToast({ title: '登录失败', icon: 'none' });
            }
        },

        uploadAvatar(filePath) {
            const config = require('../../config.js');
            return new Promise((resolve, reject) => {
                uni.uploadFile({
                    url: config.apiUrl + '/file/upload',
                    filePath,
                    name: 'file',
                    header: { Authorization: uni.getStorageSync('token') || '' },
                    success: (res) => {
                        try {
                            const data = JSON.parse(res.data);
                            if (data.code === 200) {
                                resolve(data.data.url);
                            } else {
                                resolve('');
                            }
                        } catch {
                            resolve('');
                        }
                    },
                    fail: () => resolve('')
                });
            });
        },

        cancelSetup() {
            this.setData({ showProfileSetup: false });
        },

        handleLogout() {
            uni.showModal({
                title: '确认退出',
                content: '确定要退出登录吗？',
                success: (res) => {
                    if (res.confirm) {
                        app.globalData.logout();
                        this.setData({
                            isLogin: false,
                            userInfo: null,
                            orderCount: 0,
                            totalSpent: 0
                        });
                        uni.showToast({ title: '已退出登录', icon: 'success' });
                    }
                }
            });
        },

        goToOrders() {
            if (!this.isLogin) {
                uni.showToast({ title: '请先登录', icon: 'none' });
                return;
            }
            uni.switchTab({ url: '/pages/orderList/orderList' });
        },

        handleMenuClick(e) {
            const type = e.currentTarget.dataset.type;
            switch (type) {
                case 'address':
                    uni.navigateTo({ url: '/pages/address/address' });
                    break;
                case 'usage':
                    this.showUsageModal();
                    break;
                case 'privacy':
                    this.showPrivacyModal();
                    break;
                case 'recruitment':
                    this.showRecruitmentModal();
                    break;
            }
        },

        showUsageModal() {
            uni.showModal({
                title: '使用须知',
                content: '1. 请在营业时间内下单\n2. 外卖配送时间约30-45分钟\n3. 自取订单请在2小时内取餐\n4. 如有问题请联系客服',
                showCancel: false,
                confirmText: '我知道了'
            });
        },

        showPrivacyModal() {
            uni.showModal({
                title: '隐私条款',
                content: '我们重视您的隐私保护，收集的信息仅用于提供更好的服务体验。我们不会向第三方泄露您的个人信息。',
                showCancel: false,
                confirmText: '我知道了'
            });
        },

        showRecruitmentModal() {
            uni.showModal({
                title: '员工招聘',
                content: '我们正在招聘优秀的店员和配送员，欢迎有志之士加入我们的团队！\n\n联系方式：400-123-4567',
                showCancel: false,
                confirmText: '我知道了'
            });
        },

        goToEditProfile() {
            uni.navigateTo({ url: '/pages/profile-edit/profile-edit' });
        }
    }
};
</script>

<style>
.profile-container {
    background-color: #f0f0f0;
    min-height: 100vh;
}

.scroll-wrap {
    height: 100vh;
    padding-bottom: 40rpx;
}

/* 用户头部 */
.user-header {
    display: flex;
    align-items: center;
    padding: 16rpx 30rpx 24rpx;
}

.user-avatar {
    width: 100rpx;
    height: 100rpx;
    border-radius: 50%;
    margin-right: 20rpx;
    flex-shrink: 0;
}

.user-name {
    font-size: 36rpx;
    font-weight: bold;
    color: #2C1810;
    display: block;
    margin-bottom: 2rpx;
    margin-top: 12rpx;
}

.user-sub {
    font-size: 22rpx;
    color: #9B7B5B;
    padding-left: 10rpx;
}

/* MY ACCOUNT */
.section-title {
    font-size: 26rpx;
    font-weight: bold;
    color: #9B7B5B;
    letter-spacing: 3rpx;
    padding: 0 30rpx 16rpx;
}

.stats-row {
    display: flex;
    gap: 20rpx;
    padding: 0 24rpx 30rpx;
}

.stats-card {
    flex: 1;
    background: #fff;
    border-radius: 16rpx;
    padding: 28rpx 24rpx;
}

.stats-num {
    font-size: 44rpx;
    font-weight: bold;
    color: #2C1810;
    display: block;
    margin-bottom: 8rpx;
}

.stats-label {
    font-size: 20rpx;
    color: #9B7B5B;
    letter-spacing: 1rpx;
}

/* 菜单 */
.menu-group {
    background: #fff;
    border-radius: 16rpx;
    margin: 0 24rpx;
    overflow: hidden;
}

.menu-item {
    display: flex;
    align-items: center;
    padding: 28rpx 24rpx;
}

.menu-item:active {
    background-color: #f5f5f5;
}

.menu-icon {
    width: 40rpx;
    height: 40rpx;
    margin-right: 20rpx;
}

.menu-text {
    flex: 1;
    font-size: 28rpx;
    color: #2C1810;
}

.menu-arrow {
    font-size: 36rpx;
    color: #C4A882;
}

.menu-divider {
    height: 1rpx;
    background-color: #f0f0f0;
    margin: 0 24rpx;
}

.logout-link {
    text-align: center;
    padding: 40rpx 0 10rpx;
}

.logout-link-text {
    font-size: 26rpx;
    color: #bbb;
}

.version-info {
    text-align: center;
    padding: 40rpx 20rpx;
}

.version-text {
    font-size: 22rpx;
    color: #C4A882;
}

/* 登录资料弹窗 */
.setup-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
    display: flex;
    align-items: flex-end;
    justify-content: center;
}

.setup-popup {
    background: #fff;
    border-radius: 32rpx 32rpx 0 0;
    padding: 48rpx 40rpx 60rpx;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.setup-title {
    font-size: 34rpx;
    font-weight: bold;
    color: #2C1810;
    margin-bottom: 12rpx;
}

.setup-sub {
    font-size: 24rpx;
    color: #9B7B5B;
    margin-bottom: 40rpx;
}

.avatar-picker-btn {
    background: none;
    border: none;
    padding: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 36rpx;
}

.avatar-picker-btn::after {
    border: none;
}

.setup-avatar {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    margin-bottom: 12rpx;
}

.avatar-hint {
    font-size: 22rpx;
    color: #9B7B5B;
}

.nickname-wrap {
    width: 100%;
    background: #f5f0eb;
    border-radius: 16rpx;
    padding: 0 28rpx;
    margin-bottom: 40rpx;
    box-sizing: border-box;
}

.nickname-input {
    width: 100%;
    height: 88rpx;
    font-size: 28rpx;
    color: #2C1810;
}

.setup-actions {
    display: flex;
    gap: 20rpx;
    width: 100%;
}

.setup-cancel {
    flex: 1;
    height: 88rpx;
    border: 2rpx solid #d0c0b0;
    border-radius: 44rpx;
    display: flex;
    align-items: center;
    justify-content: center;
}

.setup-cancel-text {
    font-size: 28rpx;
    color: #9B7B5B;
}

.setup-confirm {
    flex: 2;
    height: 88rpx;
    background: #2C1810;
    border-radius: 44rpx;
    display: flex;
    align-items: center;
    justify-content: center;
}

.setup-confirm-text {
    font-size: 28rpx;
    color: #fff;
    font-weight: bold;
}
</style>
