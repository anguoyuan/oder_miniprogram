<template>
    <view class="review-container">
        <view class="review-header">
            <text class="header-title">订单评价</text>
            <text class="order-no">订单号：{{ orderNo }}</text>
        </view>

        <!-- 评分 -->
        <view class="review-section">
            <view class="section-title">
                <text>评分</text>
                <text class="rating-text">{{ rating }}分</text>
            </view>
            <view class="rating-stars">
                <view :class="'star ' + (item <= rating ? 'active' : '')" @tap="onRatingChange" :data-rating="item" v-for="(item, index) in [1, 2, 3, 4, 5]" :key="index">
                    <text>{{ item <= rating ? '★' : '☆' }}</text>
                </view>
            </view>
        </view>

        <!-- 评价内容 -->
        <view class="review-section">
            <view class="section-title">评价内容</view>
            <textarea class="review-textarea" placeholder="请输入您的评价内容（至少10个字）" maxlength="500" :value="content" @input="onContentInput" />
            <view class="char-count">{{ content.length }}/500</view>
        </view>

        <!-- 上传图片 -->
        <view class="review-section">
            <view class="section-title">上传图片（选填，最多3张）</view>
            <view class="image-list">
                <view class="image-item" v-for="(item, index) in images" :key="index">
                    <image :src="item" mode="aspectFill" @tap="previewImage" :data-index="index" />

                    <view class="delete-btn" @tap="deleteImage" :data-index="index">
                        <text>×</text>
                    </view>
                </view>
                <view class="add-image" v-if="images.length < 3" @tap="chooseImage">
                    <text class="add-icon">+</text>
                    <text class="add-text">添加图片</text>
                </view>
            </view>
        </view>

        <!-- 提交按钮 -->
        <view class="submit-btn-container">
            <button class="submit-btn" @tap="submitReview" :disabled="submitting">
                {{ submitting ? '提交中...' : '提交评价' }}
            </button>
        </view>
    </view>
</template>

<script>
// pages/review/review.js
const app = getApp();
const api = require('../../utils/api.js');
export default {
    data() {
        return {
            orderId: null,
            orderNo: '',
            rating: 5,
            content: '',
            images: [],
            submitting: false
        };
    },
    onLoad(options) {
        if (options.orderId) {
            this.setData({
                orderId: options.orderId,
                orderNo: options.orderNo || ''
            });
        }
    },
    methods: {
        // 评分变化
        onRatingChange(e) {
            const rating = e.currentTarget.dataset.rating;
            this.setData({
                rating: rating
            });
        },

        // 输入评价内容
        onContentInput(e) {
            this.setData({
                content: e.detail.value
            });
        },

        // 选择图片
        chooseImage() {
            const that = this;
            uni.chooseMedia({
                count: 3 - this.images.length,
                mediaType: ['image'],
                sizeType: ['compressed'],
                sourceType: ['album', 'camera'],
                success(res) {
                    const tempFiles = res.tempFiles.map((file) => file.tempFilePath);
                    that.setData({
                        images: [...that.images, ...tempFiles]
                    });
                }
            });
        },

        // 删除图片
        deleteImage(e) {
            const index = e.currentTarget.dataset.index;
            const images = this.images;
            images.splice(index, 1);
            this.setData({
                images
            });
        },

        // 预览图片
        previewImage(e) {
            const index = e.currentTarget.dataset.index;
            uni.previewImage({
                current: this.images[index],
                urls: this.images
            });
        },

        // 提交评价
        async submitReview() {
            if (!this.content || this.content.trim().length === 0) {
                uni.showToast({
                    title: '请输入评价内容',
                    icon: 'none'
                });
                return;
            }
            if (this.content.length < 10) {
                uni.showToast({
                    title: '评价内容至少10个字',
                    icon: 'none'
                });
                return;
            }
            this.setData({
                submitting: true
            });
            uni.showLoading({
                title: '提交中...'
            });
            try {
                // 上传图片（如果有）
                const uploadedImages = [];
                for (const imagePath of this.images) {
                    try {
                        const result = await this.uploadImage(imagePath);
                        uploadedImages.push(result.data.url);
                    } catch (error) {
                        console.log('CatchClause', error);
                        console.log('CatchClause', error);
                        console.error('图片上传失败', error);
                    }
                }

                // 提交评价
                await api.submitReview({
                    orderId: this.orderId,
                    rating: this.rating,
                    content: this.content,
                    images: uploadedImages.join(',')
                });
                uni.hideLoading();
                uni.showToast({
                    title: '评价成功',
                    icon: 'success',
                    duration: 2000
                });

                // 返回上一页
                setTimeout(() => {
                    uni.navigateBack();
                }, 2000);
            } catch (error) {
                console.log('CatchClause', error);
                console.log('CatchClause', error);
                uni.hideLoading();
                console.error('提交评价失败', error);
                uni.showToast({
                    title: '提交失败',
                    icon: 'none'
                });
                this.setData({
                    submitting: false
                });
            }
        },

        // 上传图片到服务器
        uploadImage(filePath) {
            return new Promise((resolve, reject) => {
                const token = uni.getStorageSync('token');
                uni.uploadFile({
                    url: app.globalData.apiBase + '/file/upload',
                    filePath: filePath,
                    name: 'file',
                    header: {
                        Authorization: token
                    },
                    success: (res) => {
                        const data = JSON.parse(res.data);
                        if (data.code === 200) {
                            resolve(data);
                        } else {
                            reject(new Error(data.message));
                        }
                    },
                    fail: reject
                });
            });
        }
    }
};
</script>
<style>
.review-container {
    min-height: 100vh;
    background: #f5f5f5;
    padding-bottom: 120rpx;
}

.review-header {
    background: #fff;
    padding: 30rpx;
    margin-bottom: 20rpx;
}

.header-title {
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
    margin-bottom: 20rpx;
}

.section-title {
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.rating-text {
    font-size: 28rpx;
    color: #ff6b35;
    font-weight: normal;
}

.rating-stars {
    display: flex;
    gap: 20rpx;
}

.star {
    font-size: 60rpx;
    color: #ddd;
    cursor: pointer;
    transition: color 0.2s;
}

.star.active {
    color: #ff6b35;
}

.review-textarea {
    width: 100%;
    min-height: 300rpx;
    padding: 20rpx;
    border: 1px solid #eee;
    border-radius: 8rpx;
    font-size: 28rpx;
    line-height: 1.6;
    background: #fafafa;
}

.char-count {
    text-align: right;
    font-size: 24rpx;
    color: #999;
    margin-top: 10rpx;
}

.image-list {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;
}

.image-item {
    width: 200rpx;
    height: 200rpx;
    position: relative;
}

.image-item image {
    width: 100%;
    height: 100%;
    border-radius: 8rpx;
}

.delete-btn {
    position: absolute;
    top: -10rpx;
    right: -10rpx;
    width: 40rpx;
    height: 40rpx;
    background: rgba(0, 0, 0, 0.6);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 32rpx;
    font-weight: bold;
}

.add-image {
    width: 200rpx;
    height: 200rpx;
    border: 2rpx dashed #ddd;
    border-radius: 8rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #fafafa;
}

.add-icon {
    font-size: 60rpx;
    color: #999;
    line-height: 1;
}

.add-text {
    font-size: 24rpx;
    color: #999;
    margin-top: 10rpx;
}

.submit-btn-container {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 20rpx;
    background: #fff;
    box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.submit-btn {
    width: 100%;
    background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%);
    color: #fff;
    font-size: 32rpx;
    font-weight: bold;
    border-radius: 45rpx;
    border: none;
}

.submit-btn[disabled] {
    background: #ccc;
}
</style>
