<template>
    <view class="payment-container">
        <!-- Header -->
        <view class="payment-header">
            <text class="header-title">PayNow 付款</text>
            <text class="header-subtitle">请使用银行App扫码付款</text>
        </view>

        <!-- Loading state -->
        <view class="loading-section" v-if="loading">
            <view class="loading-spinner"></view>
            <text class="loading-text">正在生成付款码...</text>
        </view>

        <!-- QR Code section -->
        <view class="qr-section" v-if="!loading && qrCodeDataURL">
            <!-- Amount -->
            <view class="amount-card">
                <text class="amount-label">付款金额</text>
                <text class="amount-value">S$ {{ amount }}</text>
            </view>

            <!-- QR Code -->
            <view class="qr-wrapper">
                <image :src="qrCodeDataURL" class="qr-image" mode="aspectFit" />
                <view class="paynow-badge">
                    <text class="paynow-text">PayNow</text>
                </view>
            </view>

            <!-- Instructions -->
            <view class="instructions">
                <view class="instruction-item">
                    <text class="step-num">1</text>
                    <text class="step-text">打开您的银行App（DBS/OCBC/UOB等）</text>
                </view>
                <view class="instruction-item">
                    <text class="step-num">2</text>
                    <text class="step-text">选择"PayNow"或"扫码转账"</text>
                </view>
                <view class="instruction-item">
                    <text class="step-num">3</text>
                    <text class="step-text">扫描上方二维码完成付款</text>
                </view>
                <view class="instruction-item">
                    <text class="step-num">4</text>
                    <text class="step-text">付款成功后等待商家确认</text>
                </view>
            </view>

            <!-- Payment reference -->
            <view class="reference-row">
                <text class="ref-label">参考号：</text>
                <text class="ref-value">{{ paymentNo }}</text>
            </view>

            <!-- Status -->
            <view :class="'status-bar ' + paymentStatus">
                <text class="status-icon">{{ statusIcon }}</text>
                <text class="status-text">{{ statusText }}</text>
            </view>
        </view>

        <!-- Success state -->
        <view class="success-section" v-if="paymentStatus === 'paid'">
            <view class="success-icon">✓</view>
            <text class="success-title">付款成功！</text>
            <text class="success-desc">商家已收到您的付款，正在准备您的订单</text>
            <view class="success-btn" @tap="goToOrders">查看订单</view>
        </view>

        <!-- Footer actions -->
        <view class="footer-actions" v-if="!loading && paymentStatus !== 'paid'">
            <view class="cancel-btn" @tap="cancelPayment">取消订单</view>
            <view class="refresh-btn" @tap="checkStatus">刷新状态</view>
        </view>
    </view>
</template>

<script>
const api = require('../../utils/api.js');

export default {
    data() {
        return {
            orderId: null,
            paymentId: null,
            paymentNo: '',
            amount: '0.00',
            qrCodeDataURL: '',
            paymentStatus: 'pending',
            loading: true,
            pollTimer: null
        };
    },
    computed: {
        statusText() {
            const map = {
                pending: '等待付款中...',
                paid: '付款已确认',
                failed: '付款失败',
                cancelled: '已取消'
            };
            return map[this.paymentStatus] || '等待付款中...';
        },
        statusIcon() {
            const map = { pending: '⏳', paid: '✅', failed: '❌', cancelled: '🚫' };
            return map[this.paymentStatus] || '⏳';
        }
    },
    onLoad(options) {
        this.orderId = options.orderId;
        this.initPayment();
    },
    onUnload() {
        this.stopPolling();
    },
    methods: {
        async initPayment() {
            try {
                const result = await api.createPayment(this.orderId);
                this.paymentId = result.paymentId;
                this.paymentNo = result.paymentNo;
                this.amount = parseFloat(result.amount).toFixed(2);
                this.qrCodeDataURL = result.qrCodeDataURL;
                this.paymentStatus = result.status;
                this.loading = false;
                if (result.status === 'pending') this.startPolling();
            } catch (err) {
                console.error('初始化支付失败', err);
                this.loading = false;
                uni.showToast({ title: '生成付款码失败', icon: 'none' });
            }
        },

        startPolling() {
            this.pollTimer = setInterval(() => this.checkStatus(), 4000);
        },

        stopPolling() {
            if (this.pollTimer) {
                clearInterval(this.pollTimer);
                this.pollTimer = null;
            }
        },

        async checkStatus() {
            if (!this.paymentId) return;
            try {
                const result = await api.getPaymentStatus(this.paymentId);
                this.paymentStatus = result.status;
                if (result.status === 'paid') {
                    this.stopPolling();
                    setTimeout(() => this.goToOrders(), 2500);
                } else if (result.status === 'failed' || result.status === 'cancelled') {
                    this.stopPolling();
                }
            } catch (err) {
                console.error('查询支付状态失败', err);
            }
        },

        async cancelPayment() {
            uni.showModal({
                title: '确认取消',
                content: '取消后订单将被关闭，确定要取消吗？',
                success: async (res) => {
                    if (res.confirm) {
                        try {
                            await api.cancelOrder(this.orderId);
                            this.stopPolling();
                            uni.showToast({ title: '订单已取消', icon: 'success' });
                            setTimeout(() => this.goToOrders(), 1500);
                        } catch (err) {
                            uni.showToast({ title: '取消失败', icon: 'none' });
                        }
                    }
                }
            });
        },

        goToOrders() {
            this.stopPolling();
            uni.switchTab({ url: '/pages/orderList/orderList' });
        }
    }
};
</script>

<style>
.payment-container {
    min-height: 100vh;
    background-color: #f5f5f5;
    padding-bottom: 140rpx;
}

.payment-header {
    background: linear-gradient(135deg, #6c3483, #a569bd);
    padding: 60rpx 40rpx 40rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.header-title {
    font-size: 40rpx;
    font-weight: bold;
    color: #fff;
    margin-bottom: 12rpx;
}

.header-subtitle {
    font-size: 26rpx;
    color: rgba(255, 255, 255, 0.85);
}

/* Loading */
.loading-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 120rpx 40rpx;
}

.loading-spinner {
    width: 80rpx;
    height: 80rpx;
    border: 6rpx solid #e0e0e0;
    border-top-color: #6c3483;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin-bottom: 30rpx;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.loading-text {
    font-size: 28rpx;
    color: #999;
}

/* QR Section */
.qr-section {
    padding: 30rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24rpx;
}

.amount-card {
    background: #fff;
    width: 100%;
    padding: 30rpx;
    border-radius: 16rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.06);
}

.amount-label {
    font-size: 28rpx;
    color: #666;
}

.amount-value {
    font-size: 44rpx;
    font-weight: bold;
    color: #6c3483;
}

.qr-wrapper {
    position: relative;
    background: #fff;
    padding: 30rpx;
    border-radius: 20rpx;
    box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.1);
    display: flex;
    flex-direction: column;
    align-items: center;
}

.qr-image {
    width: 480rpx;
    height: 480rpx;
}

.paynow-badge {
    margin-top: 16rpx;
    background: linear-gradient(135deg, #6c3483, #a569bd);
    padding: 8rpx 40rpx;
    border-radius: 30rpx;
}

.paynow-text {
    font-size: 26rpx;
    font-weight: bold;
    color: #fff;
    letter-spacing: 2rpx;
}

/* Instructions */
.instructions {
    background: #fff;
    width: 100%;
    padding: 30rpx;
    border-radius: 16rpx;
    box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.06);
    display: flex;
    flex-direction: column;
    gap: 20rpx;
}

.instruction-item {
    display: flex;
    align-items: flex-start;
    gap: 16rpx;
}

.step-num {
    width: 44rpx;
    height: 44rpx;
    background: #6c3483;
    color: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24rpx;
    font-weight: bold;
    flex-shrink: 0;
    line-height: 44rpx;
    text-align: center;
}

.step-text {
    font-size: 26rpx;
    color: #555;
    line-height: 44rpx;
}

/* Reference */
.reference-row {
    width: 100%;
    background: #fff;
    padding: 24rpx 30rpx;
    border-radius: 12rpx;
    display: flex;
    align-items: center;
    box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
}

.ref-label {
    font-size: 26rpx;
    color: #999;
    margin-right: 10rpx;
}

.ref-value {
    font-size: 26rpx;
    color: #333;
    font-family: monospace;
}

/* Status bar */
.status-bar {
    width: 100%;
    padding: 24rpx 30rpx;
    border-radius: 12rpx;
    display: flex;
    align-items: center;
    gap: 16rpx;
}

.status-bar.pending { background: #fff8e1; }
.status-bar.paid    { background: #e8f5e9; }
.status-bar.failed  { background: #fce4ec; }
.status-bar.cancelled { background: #f5f5f5; }

.status-icon { font-size: 36rpx; }
.status-text { font-size: 28rpx; color: #555; }

/* Success */
.success-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 80rpx 40rpx;
    gap: 20rpx;
}

.success-icon {
    width: 120rpx;
    height: 120rpx;
    background: #4caf50;
    color: #fff;
    border-radius: 50%;
    font-size: 64rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 120rpx;
    text-align: center;
}

.success-title {
    font-size: 40rpx;
    font-weight: bold;
    color: #333;
}

.success-desc {
    font-size: 26rpx;
    color: #888;
    text-align: center;
}

.success-btn {
    margin-top: 20rpx;
    background: linear-gradient(135deg, #6c3483, #a569bd);
    color: #fff;
    padding: 24rpx 80rpx;
    border-radius: 50rpx;
    font-size: 30rpx;
    font-weight: bold;
}

/* Footer */
.footer-actions {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #fff;
    display: flex;
    gap: 20rpx;
    padding: 20rpx 30rpx;
    box-shadow: 0 -2rpx 8rpx rgba(0,0,0,0.08);
}

.cancel-btn {
    flex: 1;
    padding: 24rpx;
    border: 2rpx solid #ccc;
    border-radius: 50rpx;
    font-size: 28rpx;
    color: #666;
    text-align: center;
}

.refresh-btn {
    flex: 1;
    padding: 24rpx;
    background: linear-gradient(135deg, #6c3483, #a569bd);
    border-radius: 50rpx;
    font-size: 28rpx;
    color: #fff;
    text-align: center;
    font-weight: bold;
}
</style>
