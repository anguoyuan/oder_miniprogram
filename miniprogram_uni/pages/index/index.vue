<template>
    <!-- pages/index/index.wxml -->
    <view class="index-container">
        <!-- 主体内容 -->
        <view class="main-content">
            <!-- 轮播图 -->
            <view class="hero-section">
			  <image :src="banners[0].image" class="hero-image" mode="aspectFill" />
			  <view class="hero-mask"></view>
			  <view class="hero-content">
				<text class="brand-name">SHANGHAI PASTRY</text>
				<text class="brand-slogan">寻味海派点心，品味弄堂情怀</text>
			  </view>
			</view>

            <!-- 导航菜单 -->
            <view class="action-grid">
                <view class="action-item" @tap="handleOrderType" data-type="pickup">
					<view class="icon-wrapper">
						<image src="/static/images/shouye/baozi.png" class="icon-img" />
					</view>
					<text class="action-label">到店自取</text>
					<text class="action-sub">STORE PICKUP</text>
                </view>
                <view class="action-item" @tap="handleOrderType" data-type="takeaway">
					<view class="icon-wrapper">
						<image src="/static/images/shouye/delivery.png" class="icon-img" />
					</view>
                    <text class="action-label">外送订餐</text>
                    <text class="action-sub">FAST DELIVERY</text>
                </view>
            </view>

            <!-- 功能菜单已删除（积分商城、领券中心、团购套餐、好友拼单功能已移除） -->

            <!-- 公益广告轮播 -->
            <view class="feature-section">
				<view class="section-title">
					<view class="dot"></view>
					<text>今日推荐</text>
				</view>
                <swiper class="ad-swiper" :indicator-dots="true" :autoplay="true" interval="4000" duration="500">
                    <swiper-item v-for="(item, index) in publicAds" :key="index">
                        <view class="feature-card">
                            <image :src="item.image" class="card-img" mode="aspectFill" />
                            <view class="card-info">
                                <text class="item-title">{{ item.title }}</text>
                                <text class="item-price">{{ item.desc }}</text>
                            </view>
                        </view>
                    </swiper-item>
                </swiper>
            </view>
        </view>
    </view>
</template>

<script>
import navigationBar from '@/components/navigation-bar/navigation-bar';
// pages/index/index.js
const app = getApp();
const api = require('../../utils/api.js');
export default {
    components: {
        navigationBar
    },
    data() {
        return {
            isLogin: false,
            userInfo: null,
            banners: [
                        { image: '/static/images/shouye/home_huntun.jpg' }
                        ],

            publicAds: [
                {
                    id: 1,
                    image: '/static/images/yinpinlan/daiyu.jpg',
                    title: '季节限定 · 舟山带鱼',
                    desc: '$38.8'
                },
                {
                    id: 2,
                    image: '/static/images/yinpinlan/longhuban.jpg',
                    title: '生猛海鲜 · 清蒸龙虎斑',
                    desc: '$19.6/100g'
                }
            ],

            statusBarHeight: ''
        };
    },
    onLoad() {
        this.getSystemInfo();
    },
    onShow() {
    },
    methods: {
        // 获取系统信息
        getSystemInfo() {
            const systemInfo = uni.getSystemInfoSync();
            this.setData({
                statusBarHeight: systemInfo.statusBarHeight
            });
        },
        
        // 检查登录状态
        checkLoginStatus() {
            this.setData({
                isLogin: app.globalData.isLogin,
                userInfo: app.globalData.userInfo
            });
        },

        // 处理登录
        
        // 处理订单类型选择
        handleOrderType(e) {
            const type = e.currentTarget.dataset.type;
            app.globalData.orderType = type;
            uni.switchTab({
                url: '/pages/order/order'
            });
        }
    }
};
</script>
<style>
/**index.wxss**/
page {
    height: 100vh;
    display: flex;
    flex-direction: column;
	background-color: #F8F8F6;
}
.scrollarea {
    flex: 1;
    overflow-y: hidden;
}

/* pages/index/index.wxss */
.index-container {
    background-color: #F8F8F6;
    min-height: 100vh;
}

/* 顶部大图 */
.hero-section {
  width: 100%;
  height: 50vh;
  position: relative;
}
.hero-image {
  width: 100%;
  height: 100%;
}
.hero-mask {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 200rpx;
  background: linear-gradient(to bottom, rgba(248,248,246,0), rgba(248,248,246,1));
}
.hero-content {
  position: absolute;
  bottom: 80rpx;
  left: 40rpx;
  color: #fff;
  display: flex;
  flex-direction: column;
  color: #ffffff;
  text-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.3);
}
.brand-name {
  font-size: 44rpx;
  font-weight: 300;
  letter-spacing: 6rpx;
  margin-bottom: 12rpx;
}
/* 副标题 */
.brand-slogan {
  font-size: 28rpx;
  opacity: 0.95;
  letter-spacing: 2rpx;
}


/* 核心功能区 */
.action-grid {
  display: flex;
  gap: 20rpx;
  padding: 0 20rpx;
  margin-top: -60rpx;
  position: relative;
  z-index: 10;
}
.action-item {
  flex: 1;
  background: #fff;
  height: 240rpx;
  border-radius: 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
/*  box-shadow: 0 20rpx 40rpx rgba(132,84,72,0.1); */
  box-shadow: 0 8rpx 30rpx rgba(0,0,0,0.03);
  border: 2rpx solid rgba(132, 84, 72, 0.05);
}

.action-item:active {
  transform: scale(0.96);
}
.icon-wrapper {
  width: 100rpx;
  height: 100rpx;
  background: #FDFCFB;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20rpx;
}

.icon-img {
  width: 60rpx;
  height: 60rpx;
}
.action-label {
  font-size: 30rpx;
  font-weight: 600;
  color: #4A322D;
}

.action-sub {
  font-size: 20rpx;
  color: #A08D89;
  margin-top: 6rpx;
}

/* 功能菜单 */
/* .function-section {
    margin: 0 20rpx 30rpx;
}

.function-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20rpx;
}

.function-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20rpx;
    cursor: pointer;
    transition: all 0.3s ease;
}

.function-item:active {
    transform: scale(0.95);
    background-color: #f8f8f8;
    border-radius: 12rpx;
}

.function-icon {
    width: 60rpx;
    height: 60rpx;
    margin-bottom: 12rpx;
}

.function-text {
    font-size: 24rpx;
    color: #333;
    text-align: center;
} */

/* 推荐 */
.feature-section {
  padding: 60rpx 20rpx;
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
}

.dot {
  width: 12rpx;
  height: 12rpx;
  background: #845448;
  border-radius: 50%;
  margin-right: 12rpx;
}
.ad-swiper {
    height: 480rpx;
}


.feature-card {
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
}

.card-img {
  width: 100%;
  height: 320rpx;
}

.card-info {
  display: flex;
  justify-content: space-between;
  padding: 20rpx;
}

.item-title {
  font-size: 28rpx;
}

.item-price {
  font-size: 30rpx;
  color: #845448;
  font-weight: bold;
}

.ad-swiper .wx-swiper-dot {
    background-color: rgba(0, 0, 0, 0.3);
}

.ad-swiper .wx-swiper-dot-active {
    background-color: #845448;
}

/* 响应式调整 */
@media (max-width: 375px) {
    .function-grid {
        gap: 15rpx;
    }

    .function-icon {
        width: 50rpx;
        height: 50rpx;
    }

    .function-text {
        font-size: 22rpx;
    }
}
</style>
