<template>
    <view class="profile-container">
        <scroll-view scroll-y class="scroll-wrap" :style="{ paddingTop: (statusBarHeight + 20) + 'px' }">

            <!-- 用户信息头部 -->
            <view class="user-header">
                <image
                    :src="isLogin ? userInfo.avatar : '/static/images/icon/wode.png'"
                    class="user-avatar"
                    @tap="handleAvatarTap"
                />
                <view class="user-info-text">
                    <view class="user-name-row">
                        <text class="user-name">{{ isLogin ? userInfo.nickname : 'Hello, Guest' }}</text>
                        <view class="member-badge" v-if="isLogin">
                            <text class="member-badge-text">会员</text>
                        </view>
                    </view>
                    <text class="user-sub">{{ isLogin ? '已登录' : '点击头像登录' }}</text>
                </view>
                <view class="qr-icon-btn" v-if="isLogin" @tap="openQrPopup">
                    <view class="qr-icon">
                        <view class="qr-tl"><view class="qr-fi"></view></view>
                        <view class="qr-tr"><view class="qr-fi"></view></view>
                        <view class="qr-bl"><view class="qr-fi"></view></view>
                        <view class="qr-br"><view class="qr-fi"></view></view>
                        <view class="qr-d1"></view>
                        <view class="qr-d2"></view>
                        <view class="qr-d3"></view>
                        <view class="qr-d4"></view>
                        <view class="qr-d5"></view>
                    </view>
                </view>
            </view>

            <!-- QR码弹窗 -->
            <view v-if="showQrPopup" class="qr-overlay" @tap="closeQrPopup">
                <view class="qr-popup" @tap.stop>
                    <text class="qr-popup-name">{{ userInfo && userInfo.nickname }}</text>
                    <text class="qr-popup-sub">会员二维码</text>
                    <view class="qr-popup-img-box">
                        <image src="/static/images/icon/paynow-qr.png" mode="aspectFit" class="qr-popup-img" />
                    </view>
                    <text class="qr-popup-tip">向商家出示二维码</text>
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
                    <text class="stats-num">${{ totalSpent }}</text>
                    <text class="stats-label">TOTAL SPENT</text>
                </view>
            </view>

            <!-- 菜单 -->
            <view class="menu-list">
                <view class="menu-item" @tap="goToOrders">
                    <text class="menu-text">My Orders</text>
                    <text class="menu-arrow">›</text>
                </view>
                <view class="menu-divider" />
                <view class="menu-item" @tap="handleMenuClick" data-type="address">
                    <text class="menu-text">My Adresses</text>
                    <text class="menu-arrow">›</text>
                </view>
                <view class="menu-divider" />
                <view class="menu-item" @tap="handleMenuClick" data-type="usage">
                    <text class="menu-text">Terms of Use</text>
                    <text class="menu-arrow">›</text>
                </view>
                <view class="menu-divider" />
                <view class="menu-item" @tap="handleMenuClick" data-type="privacy">
                    <text class="menu-text">Privacy Policy</text>
                    <text class="menu-arrow">›</text>
                </view>
                <view class="menu-divider" />
                <view class="menu-item" @tap="handleMenuClick" data-type="recruitment">
                    <text class="menu-text">Join Us</text>
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
            totalSpent: '0.00',
            likeCount: 0,
            statusBarHeight: 0,
            showQrPopup: false
        };
    },
    onLoad() {
        this.statusBarHeight = uni.getSystemInfoSync().statusBarHeight;
        this.checkLoginStatus();
    },
    onShow() {
        this.checkLoginStatus();
        this.loadUserStats();
    },
    methods: {
        // 检查登录状态
        checkLoginStatus() {
            this.setData({
                isLogin: app.globalData.isLogin,
                userInfo: app.globalData.userInfo
            });
        },

        // 加载用户统计数据
        async loadUserStats() {
            try {
                // 从后端获取用户订单统计
                const params = { page: 1, pageSize: 1000 };
                if (!app.globalData.isLogin) {
                    params.guestId = app.globalData.guestId;
                }
                const result = await api.getUserOrders(params);
                const orders = result.records || [];
                const orderCount = orders.length;

                // 计算累计消费（只统计已完成的订单）
                const totalSpent = orders
                    .filter((o) => o.status === 'completed')
                    .reduce((total, order) => {
                        return total + parseFloat(order.totalPrice || 0);
                    }, 0)
                    .toFixed(2);
                this.setData({
                    orderCount,
                    totalSpent
                });
            } catch (error) {
                console.log('CatchClause', error);
                console.log('CatchClause', error);
                console.error('加载用户统计失败', error);
                this.setData({
                    orderCount: 0,
                    totalSpent: '0.00'
                });
            }
        },

        // 处理登录
        handleLogin() {
            const that = this;
            uni.getUserProfile({
                desc: '用于完善用户资料',
                success: (res) => {
                    // 获取微信登录code
                    uni.login({
                        success: async (loginRes) => {
                            try {
                                uni.showLoading({
                                    title: '登录中...'
                                });

                                // 调用后端登录接口
                                const result = await api.wxLogin({
                                    code: loginRes.code,
                                    nickname: res.userInfo.nickname,
                                    avatar: res.userInfo.avatarUrl
                                });
                                uni.hideLoading();

                                // 保存token和用户信息
                                uni.setStorageSync('token', result.token);
                                uni.setStorageSync('userInfo', result.user);
                                app.globalData.isLogin = true;
                                app.globalData.userInfo = result.user;
                                that.setData({
                                    isLogin: true,
                                    userInfo: result.user
                                });
                                that.loadUserStats();
                                uni.showToast({
                                    title: '登录成功',
                                    icon: 'success'
                                });
                            } catch (error) {
                                console.log('CatchClause', error);
                                console.log('CatchClause', error);
                                uni.hideLoading();
                                console.error('登录失败', error);
                                uni.showToast({
                                    title: '登录失败',
                                    icon: 'none'
                                });
                            }
                        },
                        fail: () => {
                            uni.showToast({
                                title: '获取登录凭证失败',
                                icon: 'none'
                            });
                        }
                    });
                },
                fail: () => {
                    uni.showToast({
                        title: '取消登录',
                        icon: 'none'
                    });
                }
            });
        },

        // 处理登出
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
                            totalSpent: '0.00'
                        });
                        uni.showToast({
                            title: '已退出登录',
                            icon: 'success'
                        });
                    }
                }
            });
        },

        // 跳转到订单页面
        goToOrders() {
            uni.switchTab({
                url: '/pages/orderList/orderList'
            });
        },

        // 跳转到购物车
        goToCart() {
            uni.navigateTo({
                url: '/pages/cart/cart'
            });
        },

        // 跳转到收藏页面
        goToFavorite() {
            if (!this.isLogin) {
                uni.showToast({
                    title: '请先登录',
                    icon: 'none'
                });
                return;
            }
            uni.navigateTo({
                url: '/pages/favorite/favorite'
            });
        },

        // 跳转到点赞页面
        goToLikes() {
            if (!this.isLogin) {
                uni.showToast({
                    title: '请先登录',
                    icon: 'none'
                });
                return;
            }
            uni.navigateTo({
                url: '/pages/likes/likes'
            });
        },

        // 处理菜单点击
        handleMenuClick(e) {
            const type = e.currentTarget.dataset.type;
            switch (type) {
                case 'address':
                    uni.navigateTo({
                        url: '/pages/address/address'
                    });
                    break;
                case 'usage':
                    this.showUsageModal();
                    break;
                case 'privacy':
                    this.showPrivacyModal();
                    break;
                case 'agreement':
                    this.showAgreementModal();
                    break;
                case 'recruitment':
                    this.showRecruitmentModal();
                    break;
            }
        },

        // 显示使用须知
        showUsageModal() {
            uni.showModal({
                title: '使用须知',
                content: '1. 请在营业时间内下单\n2. 外卖配送时间约30-45分钟\n3. 自取订单请在2小时内取餐\n4. 如有问题请联系客服',
                showCancel: false,
                confirmText: '我知道了'
            });
        },

        // 显示隐私条款
        showPrivacyModal() {
            uni.showModal({
                title: '隐私条款',
                content: '我们重视您的隐私保护，收集的信息仅用于提供更好的服务体验。我们不会向第三方泄露您的个人信息。',
                showCancel: false,
                confirmText: '我知道了'
            });
        },

        // 显示员工招聘
        showRecruitmentModal() {
            uni.showModal({
                title: '员工招聘',
                content: '我们正在招聘优秀的店员和配送员，欢迎有志之士加入我们的团队！\n\n联系方式：400-123-4567',
                showCancel: false,
                confirmText: '我知道了'
            });
        },

        handleAvatarTap() {
            if (!this.isLogin) {
                this.handleLogin();
            }
        },

        openQrPopup() {
            this.setData({ showQrPopup: true });
        },

        closeQrPopup() {
            this.setData({ showQrPopup: false });
        },

        goToEditProfile() {
            uni.navigateTo({
                url: '/pages/profile-edit/profile-edit'
            });
        }
    }
};
</script>
<style>
.profile-container {
    background-color: #F8F8F6;
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
    padding: 24rpx 30rpx 30rpx;
}

.user-avatar {
    width: 110rpx;
    height: 110rpx;
    border-radius: 50%;
    border: 4rpx solid #f0e6dc;
    margin-right: 24rpx;
    flex-shrink: 0;
}

.user-info-text {
    flex: 1;
    min-width: 0;
}

.user-name-row {
    display: flex;
    align-items: center;
    margin-bottom: 8rpx;
}

.user-name {
    font-size: 36rpx;
    font-weight: bold;
    color: #2C1810;
    margin-right: 12rpx;
}

.member-badge {
    background: #f0e6dc;
    border-radius: 20rpx;
    padding: 4rpx 14rpx;
}

.member-badge-text {
    font-size: 20rpx;
    color: #8B5E3C;
    font-weight: 500;
}

.user-sub {
    font-size: 24rpx;
    color: #9B7B5B;
}

/* QR图标 */
.qr-icon-btn {
    padding: 10rpx;
    flex-shrink: 0;
}

.qr-icon {
    width: 50rpx;
    height: 50rpx;
    position: relative;
}

/* 三个角定位方块 */
.qr-tl, .qr-tr, .qr-bl {
    position: absolute;
    width: 18rpx;
    height: 18rpx;
    border: 3rpx solid #5D3A1A;
    display: flex;
    align-items: center;
    justify-content: center;
}
.qr-tl { top: 0; left: 0; }
.qr-tr { top: 0; right: 0; }
.qr-bl { bottom: 0; left: 0; }
.qr-br { bottom: 0; right: 0; }

/* 角方块里的实心小方块 */
.qr-fi {
    width: 8rpx;
    height: 8rpx;
    background: #5D3A1A;
}

/* 中间随机数据点 */
.qr-d1, .qr-d2, .qr-d3, .qr-d4, .qr-d5 {
    position: absolute;
    width: 5rpx;
    height: 5rpx;
    background: #5D3A1A;
    border-radius: 1rpx;
}
.qr-d1 { top: 2rpx;  left: 24rpx; }
.qr-d2 { top: 9rpx;  left: 30rpx; }
.qr-d3 { top: 24rpx; left: 24rpx; }
.qr-d4 { bottom: 2rpx;  right: 2rpx; }
.qr-d5 { bottom: 9rpx; right: 10rpx; }

/* QR弹窗 */
.qr-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.5);
    z-index: 999;
    display: flex;
    align-items: center;
    justify-content: center;
}

.qr-popup {
    background: #fff;
    border-radius: 24rpx;
    padding: 50rpx 60rpx;
    width: 80%;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.qr-popup-name {
    font-size: 36rpx;
    font-weight: bold;
    color: #2C1810;
    margin-bottom: 8rpx;
}

.qr-popup-sub {
    font-size: 24rpx;
    color: #9B7B5B;
    margin-bottom: 40rpx;
}

.qr-popup-img-box {
    width: 320rpx;
    height: 320rpx;
    border: 1rpx solid #eee;
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 30rpx;
}

.qr-popup-img {
    width: 300rpx;
    height: 300rpx;
}

.qr-popup-tip {
    font-size: 24rpx;
    color: #bbb;
}

/* 退出登录 */
.logout-link {
    text-align: center;
    padding: 40rpx 0 20rpx;
}

.logout-link-text {
    font-size: 28rpx;
    color: #bbb;
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

.version-info {
    text-align: center;
    padding: 40rpx 20rpx;
}

.version-text {
    font-size: 22rpx;
    color: #C4A882;
}
</style>
