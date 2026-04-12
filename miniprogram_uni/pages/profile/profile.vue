<template>
    <!-- pages/profile/profile.wxml -->
    <view class="profile-container">
        <!-- 主体内容 -->
        <view class="main-content">
            <!-- 用户信息区域 -->
            <view class="user-section">
                <view v-if="isLogin" class="user-info card">
                    <image :src="userInfo.avatar" class="user-avatar" />
                    <view class="user-details">
                        <text class="user-name">{{ userInfo.nickname }}</text>
                        <text class="user-level">普通会员</text>
                    </view>
                    <view class="user-actions">
                        <view class="edit-btn" @tap="goToEditProfile">
                            <text>✏️</text>
                        </view>
                        <view class="logout-btn" @tap="handleLogout">
                            <text>退出</text>
                        </view>
                    </view>
                </view>

                <view v-else class="login-section card">
                    <view class="login-prompt" @tap="handleLogin">
                        <image src="/static/images/icon/wode.png" class="default-avatar" />
                        <view class="login-text">
                            <text class="login-title">一键登录</text>
                            <text class="login-subtitle">登录享受更多优惠</text>
                        </view>
                        <view class="login-arrow">></view>
                    </view>
                </view>
            </view>

            <!-- 统计信息 -->
            <view v-if="isLogin" class="stats-section card">
                <view class="stats-item" @tap="goToOrders">
                    <text class="stats-number">{{ orderCount }}</text>
                    <text class="stats-label">订单数量</text>
                </view>
                <view class="stats-divider"></view>
                <view class="stats-item">
                    <text class="stats-number">¥{{ totalSpent }}</text>
                    <text class="stats-label">累计消费</text>
                </view>
            </view>

            <!-- 菜单列表 -->
            <view class="menu-section">
                <view class="menu-group card">
                    <view class="menu-item" @tap="goToOrders">
                        <view class="menu-icon">
                            <image src="/static/images/me/wodedingdan.png" class="icon" />
                        </view>
                        <text class="menu-text">我的订单</text>
                        <view class="menu-arrow">></view>
                    </view>

                    <view class="menu-divider"></view>

                    <!-- <view class="menu-item" bindtap="goToCart">
          <view class="menu-icon">
            <image src="/static/images/icon/diancan.png" class="icon"/>
          </view>
          <text class="menu-text">购物车</text>
          <view class="menu-arrow">></view>
        </view> -->

                    <view class="menu-divider"></view>

                    <view class="menu-item" @tap="goToFavorite">
                        <view class="menu-icon">
                            <image src="/static/images/me/huiyuan.png" class="icon" />
                        </view>
                        <text class="menu-text">我的收藏</text>
                        <view class="menu-arrow">></view>
                    </view>

                    <view class="menu-divider"></view>

                    <view class="menu-item" @tap="goToLikes">
                        <view class="menu-icon">
                            <image src="/static/images/me/dianzan.png" class="icon" />
                        </view>
                        <text class="menu-text">我的点赞</text>
                        <view class="menu-arrow">></view>
                    </view>

                    <view class="menu-divider"></view>

                    <view class="menu-item" @tap="handleMenuClick" data-type="address">
                        <view class="menu-icon">
                            <image src="/static/images/me/shouhuodizhi.png" class="icon" />
                        </view>
                        <text class="menu-text">收货地址</text>
                        <view class="menu-arrow">></view>
                    </view>
                </view>

                <view class="menu-group card">
                    <view class="menu-item" @tap="handleMenuClick" data-type="usage">
                        <view class="menu-icon">
                            <image src="/static/images/me/使用须知.png" class="icon" />
                        </view>
                        <text class="menu-text">使用须知</text>
                        <view class="menu-arrow">></view>
                    </view>

                    <view class="menu-divider"></view>

                    <view class="menu-item" @tap="handleMenuClick" data-type="privacy">
                        <view class="menu-icon">
                            <image src="/static/images/me/yinsi.png" class="icon" />
                        </view>
                        <text class="menu-text">隐私条款</text>
                        <view class="menu-arrow">></view>
                    </view>

                    <view class="menu-divider"></view>

                    <view class="menu-item" @tap="handleMenuClick" data-type="recruitment">
                        <view class="menu-icon">
                            <image src="/static/images/me/yuangongzhaopin.png" class="icon" />
                        </view>
                        <text class="menu-text">员工招聘</text>
                        <view class="menu-arrow">></view>
                    </view>
                </view>
            </view>

            <!-- 版本信息 -->
            <view class="version-info">
                <text class="version-text">一厘米 v1.0.0</text>
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
            totalSpent: '0.00',
            likeCount: 0
        };
    },
    onLoad() {
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
/* pages/profile/profile.wxss */
.profile-container {
    background-color: #f8f8f8;
    min-height: 100vh;
}

.main-content {
    padding-top: 10rpx;
    padding-bottom: 20rpx;
}

/* 用户信息区域 */
.user-section {
    margin: 20rpx 20rpx 30rpx;
}

.user-info {
    display: flex;
    align-items: center;
    padding: 30rpx;
}

.user-avatar {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    margin-right: 20rpx;
}

.user-details {
    flex: 1;
}

.user-name {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 8rpx;
    display: block;
}

.user-level {
    font-size: 24rpx;
    color: #aad08f;
    background-color: #fff3e0;
    padding: 4rpx 12rpx;
    border-radius: 20rpx;
    display: inline-block;
}

.user-actions {
    display: flex;
    gap: 10rpx;
}

.edit-btn {
    padding: 16rpx 20rpx;
    background: linear-gradient(135deg, #aad08f 0%, #8bc34a 100%);
    color: #fff;
    border-radius: 50rpx;
    font-size: 28rpx;
    display: flex;
    align-items: center;
    justify-content: center;
}

.logout-btn {
    padding: 16rpx 24rpx;
    background-color: #f0f0f0;
    border-radius: 50rpx;
    font-size: 24rpx;
    color: #666;
}

/* 登录区域 */
.login-section {
    padding: 30rpx;
}

.login-prompt {
    display: flex;
    align-items: center;
    cursor: pointer;
}

.default-avatar {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    margin-right: 20rpx;
    opacity: 0.8;
}

.login-text {
    flex: 1;
}

.login-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 8rpx;
    display: block;
}

.login-subtitle {
    font-size: 24rpx;
    color: #999;
}

.login-arrow {
    font-size: 32rpx;
    color: #ccc;
}

/* 统计信息 */
.stats-section {
    margin: 0 20rpx 30rpx;
    padding: 30rpx;
    display: flex;
    align-items: center;
}

.stats-item {
    flex: 1;
    text-align: center;
    cursor: pointer;
}

.stats-number {
    font-size: 36rpx;
    font-weight: bold;
    color: #aad08f;
    display: block;
    margin-bottom: 8rpx;
}

.stats-label {
    font-size: 24rpx;
    color: #666;
}

.stats-divider {
    width: 1rpx;
    height: 60rpx;
    background-color: #e0e0e0;
}

/* 菜单区域 */
.menu-section {
    padding: 0 20rpx;
}

.menu-group {
    margin-bottom: 30rpx;
    padding: 0;
    overflow: hidden;
}

.menu-item {
    display: flex;
    align-items: center;
    padding: 30rpx;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.menu-item:active {
    background-color: #f8f8f8;
}

.menu-icon {
    width: 60rpx;
    height: 60rpx;
    margin-right: 20rpx;
    display: flex;
    align-items: center;
    justify-content: center;
}

.icon {
    width: 40rpx;
    height: 40rpx;
}

.menu-text {
    flex: 1;
    font-size: 28rpx;
    color: #333;
}

.menu-arrow {
    font-size: 28rpx;
    color: #ccc;
}

.menu-divider {
    height: 1rpx;
    background-color: #f0f0f0;
    margin: 0 30rpx;
}

/* 版本信息 */
.version-info {
    text-align: center;
    padding: 40rpx 20rpx;
}

.version-text {
    font-size: 24rpx;
    color: #999;
}
</style>
