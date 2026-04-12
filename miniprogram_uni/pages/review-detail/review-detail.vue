<template>
    <view class="review-detail-container">
        <view v-if="loading" class="loading-container">
            <text>加载中...</text>
        </view>

        <view v-else-if="!review" class="empty-container">
            <text class="empty-text">暂无评价</text>
            <button class="back-btn" @tap="goBack">返回</button>
        </view>

        <view v-else class="content">
            <!-- 订单信息 -->
            <view class="header">
                <text class="title">订单评价</text>
                <text class="order-no">订单号：{{ orderNo }}</text>
            </view>

            <!-- 评价信息 -->
            <view class="review-section">
                <!-- 评分 -->
                <view class="rating-row">
                    <text class="label">评分</text>
                    <view class="stars">
                        <text :class="'star ' + (item <= review.rating ? 'active' : '')" v-for="(item, index) in [1, 2, 3, 4, 5]" :key="index">
                            {{ item <= review.rating ? '★' : '☆' }}
                        </text>
                        <!-- <text class="rating-text">{{review.rating}}分</text> -->
                    </view>
                </view>

                <!-- 评价内容 -->
                <view class="content-row">
                    <text class="label">评价内容</text>
                    <text class="content-text">{{ review.content }}</text>
                </view>

                <!-- 评价图片 -->
                <view v-if="review.imageList && review.imageList.length > 0" class="images-row">
                    <text class="label">评价图片</text>
                    <view class="image-list">
                        <image
                            :src="item"
                            mode="aspectFill"
                            class="review-image"
                            @tap="previewImage"
                            :data-index="index"
                            v-for="(item, index) in review.imageList"
                            :key="index"
                        ></image>
                    </view>
                </view>

                <!-- 评价时间 -->
                <view class="time-row">
                    <text class="label">评价时间</text>
                    <text class="time-text">{{ review.createTime }}</text>
                </view>
            </view>

            <!-- 商家回复 -->
            <view v-if="review.reply" class="reply-section">
                <view class="reply-header">
                    <text class="reply-title">商家回复</text>
                    <text class="reply-time">{{ review.replyTime }}</text>
                </view>
                <view class="reply-content">
                    <text>{{ review.reply }}</text>
                </view>
            </view>

            <view v-else class="no-reply">
                <text>商家暂未回复</text>
            </view>

            <!-- 返回按钮 -->
            <view class="btn-container">
                <button class="back-button" @tap="goBack">返回订单列表</button>
            </view>
        </view>
    </view>
</template>

<script>
// pages/review-detail/review-detail.js
const app = getApp();
const api = require('../../utils/api.js');
export default {
    data() {
        return {
            orderId: null,
            orderNo: '',
            review: null,
            loading: true
        };
    },
    onLoad(options) {
        if (options.orderId) {
            this.setData({
                orderId: options.orderId,
                orderNo: options.orderNo || ''
            });
            this.loadReview();
        }
    },
    methods: {
        // 加载评价详情
        async loadReview() {
            try {
                uni.showLoading({
                    title: '加载中...'
                });
                const review = await api.getOrderReview(this.orderId);

                // 处理图片列表
                if (review.images) {
                    review.imageList = review.images.split(',').filter((img) => img);
                } else {
                    review.imageList = [];
                }
                review.createTime = this.formatTime(review.createTime);
                review.replyTime = this.formatTime(review.replyTime);
                this.setData({
                    review: review,
                    loading: false
                });
                uni.hideLoading();
            } catch (error) {
                console.log('CatchClause', error);
                console.log('CatchClause', error);
                uni.hideLoading();
                console.error('加载评价失败', error);
                uni.showToast({
                    title: '加载失败',
                    icon: 'none'
                });
                this.setData({
                    loading: false
                });
            }
        },

        // 预览图片
        previewImage(e) {
            const index = e.currentTarget.dataset.index;
            uni.previewImage({
                current: this.review.imageList[index],
                urls: this.review.imageList
            });
        },

        // 格式化时间
        formatTime(time) {
            if (!time) {
                return '';
            }
            return time.replace('T', ' ').substring(0, 16);
        },

        // 返回
        goBack() {
            uni.navigateBack();
        }
    }
};
</script>
<style>
.review-detail-container {
    min-height: 100vh;
    background: #f5f5f5;
    padding-bottom: 120rpx;
}

.loading-container,
.empty-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    color: #999;
}

.empty-text {
    font-size: 28rpx;
    margin-bottom: 30rpx;
}

.back-btn {
    width: 200rpx;
    height: 70rpx;
    line-height: 70rpx;
    background: #aad08f;
    color: #fff;
    border-radius: 35rpx;
    font-size: 28rpx;
}

.content {
    padding: 20rpx;
}

.header {
    background: #fff;
    padding: 30rpx;
    margin-bottom: 20rpx;
    border-radius: 16rpx;
}

.title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
    display: block;
    margin-bottom: 15rpx;
}

.order-no {
    font-size: 24rpx;
    color: #999;
}

.review-section {
    background: #fff;
    padding: 30rpx;
    border-radius: 16rpx;
    margin-bottom: 20rpx;
}

.rating-row,
.content-row,
.images-row,
.time-row {
    margin-bottom: 30rpx;
}

.rating-row:last-child,
.content-row:last-child,
.images-row:last-child,
.time-row:last-child {
    margin-bottom: 0;
}

.label {
    font-size: 28rpx;
    color: #666;
    display: block;
    margin-bottom: 15rpx;
    font-weight: bold;
}

.stars {
    display: flex;
    align-items: center;
    gap: 10rpx;
}

.star {
    font-size: 50rpx;
    color: #ddd;
}

.star.active {
    color: #ff6b35;
}

.rating-text {
    font-size: 28rpx;
    color: #ff6b35;
    margin-left: 20rpx;
    font-weight: bold;
}

.content-text {
    font-size: 28rpx;
    color: #333;
    line-height: 1.8;
    display: block;
}

.image-list {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;
}

.review-image {
    width: 200rpx;
    height: 200rpx;
    border-radius: 8rpx;
}

.time-text {
    font-size: 26rpx;
    color: #999;
}

.reply-section {
    background: #fff;
    padding: 30rpx;
    border-radius: 16rpx;
    margin-bottom: 20rpx;
    border-left: 4rpx solid #aad08f;
}

.reply-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
}

.reply-title {
    font-size: 28rpx;
    font-weight: bold;
    color: #aad08f;
}

.reply-time {
    font-size: 24rpx;
    color: #999;
}

.reply-content {
    font-size: 28rpx;
    color: #333;
    line-height: 1.8;
    background: #f8f8f8;
    padding: 20rpx;
    border-radius: 8rpx;
}

.no-reply {
    background: #fff;
    padding: 40rpx;
    border-radius: 16rpx;
    text-align: center;
    color: #999;
    font-size: 26rpx;
}

.btn-container {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 20rpx;
    background: #fff;
    box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.back-button {
    width: 100%;
    background: linear-gradient(135deg, #aad08f 0%, #8bc34a 100%);
    color: #fff;
    font-size: 32rpx;
    font-weight: bold;
    border-radius: 45rpx;
    border: none;
}
</style>
