<template>
    <view class="profile-container">
        <scroll-view scroll-y class="scroll-wrap" :style="{ paddingTop: (statusBarHeight + 20) + 'px' }">

            <!-- 用户信息头部 -->
            <view class="user-header">
                <view class="user-left">
                    <image :src="isLogin ? userInfo.avatar : '/static/images/icon/wode.png'" class="user-avatar" />
                    <view class="user-info-text">
                        <text class="user-name">{{ isLogin ? userInfo.nickname : 'Hello, Guest' }}</text>
                        <text class="user-sub">{{ isLogin ? '已登录' : '点击登录' }}</text>
                    </view>
                </view>
                <view class="user-right">
                    <view class="logout-btn" v-if="isLogin" @tap="handleLogout">
                        <text class="logout-text">退出</text>
                    </view>
                    <view class="login-btn" v-else @tap="handleLogin">
                        <text class="login-btn-text">登录</text>
                    </view>
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
            <view class="menu-group">
                <view class="menu-item" @tap="goToOrders">
                    <image src="/static/images/me/wodedingdan.png" class="menu-icon" />
                    <text class="menu-text">我的订单</text>
                    <text class="menu-arrow">›</text>
                </view>
                <view class="menu-divider" />
                <view class="menu-item" @tap="handleMenuClick" data-type="address">
                    <image src="/static/images/me/shouhuodizhi.png" class="menu-icon" />
                    <text class="menu-text">收货地址</text>
                    <text class="menu-arrow">›</text>
                </view>
            </view>

            <view class="menu-group" style="margin-top: 20rpx;">
                <view class="menu-item" @tap="handleMenuClick" data-type="usage">
                    <image src="/static/images/me/使用须知.png" class="menu-icon" />
                    <text class="menu-text">使用须知</text>
                    <text class="menu-arrow">›</text>
                </view>
                <view class="menu-divider" />
                <view class="menu-item" @tap="handleMenuClick" data-type="privacy">
                    <image src="/static/images/me/yinsi.png" class="menu-icon" />
                    <text class="menu-text">隐私条款</text>
                    <text class="menu-arrow">›</text>
                </view>
                <view class="menu-divider" />
                <view class="menu-item" @tap="handleMenuClick" data-type="recruitment">
                    <image src="/static/images/me/yuangongzhaopin.png" class="menu-icon" />
                    <text class="menu-text">员工招聘</text>
                    <text class="menu-arrow">›</text>
                </view>
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
            statusBarHeight: 0
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
                const result = await api.getUserOrders({
                    page: 1,
                    pageSize: 1000
                });
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
            if (!this.isLogin) {
                uni.showToast({
                    title: '请先登录',
                    icon: 'none'
                });
                return;
            }
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
    justify-content: space-between;
    padding: 20rpx 30rpx 30rpx;
}

.user-left {
    display: flex;
    align-items: center;
}

.user-avatar {
    width: 100rpx;
    height: 100rpx;
    border-radius: 50%;
    margin-right: 20rpx;
}

.user-name {
    font-size: 32rpx;
    font-weight: bold;
    color: #2C1810;
    display: block;
    margin-bottom: 6rpx;
}

.user-sub {
    font-size: 22rpx;
    color: #9B7B5B;
}

.logout-btn, .login-btn {
    padding: 12rpx 28rpx;
    border: 2rpx solid #5D3A1A;
    border-radius: 40rpx;
}

.logout-text, .login-btn-text {
    font-size: 24rpx;
    color: #5D3A1A;
}

/* 会员卡 */
.member-card {
    margin: 0 24rpx 30rpx;
    border-radius: 20rpx;
    overflow: hidden;
    box-shadow: 0 8rpx 24rpx rgba(93,58,26,0.15);
}

.member-card-img {
    width: 100%;
    height: 280rpx;
    display: block;
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
