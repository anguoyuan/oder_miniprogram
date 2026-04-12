<template>
    <!-- pages/profile-edit/profile-edit.wxml -->
    <view class="profile-edit-container">
        <view class="form-section">
            <!-- 头像 -->
            <view class="form-item">
                <text class="form-label">头像</text>
                <button class="avatar-button" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
                    <image :src="avatar" class="avatar-image" mode="aspectFill" />
                    <view class="avatar-mask">
                        <text class="avatar-text">点击修改</text>
                    </view>
                </button>
            </view>

            <!-- 昵称 -->
            <view class="form-item">
                <text class="form-label">昵称</text>
                <input class="form-input" type="nickname" placeholder="请输入昵称" :value="nickname" @input="onNicknameInput" maxlength="20" />
            </view>

            <!-- 手机号 -->
            <view class="form-item">
                <text class="form-label">手机号</text>
                <input class="form-input" type="number" placeholder="请输入手机号" :value="phone" @input="onPhoneInput" maxlength="11" />
            </view>
        </view>

        <!-- 保存按钮 -->
        <view class="save-button" @tap="saveProfile">
            <text v-if="!loading">保存</text>
            <text v-else>保存中...</text>
        </view>

        <!-- 提示信息 -->
        <view class="tips">
            <text class="tip-text">• 头像点击可更换</text>
            <text class="tip-text">• 昵称不超过20个字符</text>
            <text class="tip-text">• 手机号用于接收订单通知</text>
        </view>
    </view>
</template>

<script>
// pages/profile-edit/profile-edit.js
const app = getApp();
const api = require('../../utils/api.js');
export default {
    data() {
        return {
            avatar: '',
            nickname: '',
            phone: '',
            loading: false
        };
    },
    onLoad() {
        this.loadUserInfo();
    },
    methods: {
        // 加载用户信息
        loadUserInfo() {
            const userInfo = app.globalData.userInfo;
            if (userInfo) {
                this.setData({
                    avatar: userInfo.avatar || '/static/images/me/touxiang.png',
                    nickname: userInfo.nickname || '未设置',
                    phone: userInfo.phone || ''
                });
            }
        },

        // 选择头像（新版本API）
        onChooseAvatar(e) {
            const { avatarUrl } = e.detail;
            this.setData({
                avatar: avatarUrl
            });
            uni.showToast({
                title: '头像已选择',
                icon: 'success'
            });
        },

        // 输入昵称
        onNicknameInput(e) {
            this.setData({
                nickname: e.detail.value
            });
        },

        // 输入手机号
        onPhoneInput(e) {
            this.setData({
                phone: e.detail.value
            });
        },

        // 保存修改
        async saveProfile() {
            // 验证
            if (!this.nickname || this.nickname.trim() === '') {
                uni.showToast({
                    title: '请输入昵称',
                    icon: 'none'
                });
                return;
            }
            if (this.nickname.length > 20) {
                uni.showToast({
                    title: '昵称不能超过20个字符',
                    icon: 'none'
                });
                return;
            }
            if (this.phone && !/^1[3-9]\d{9}$/.test(this.phone)) {
                uni.showToast({
                    title: '手机号格式不正确',
                    icon: 'none'
                });
                return;
            }
            this.setData({
                loading: true
            });
            try {
                // 如果头像是本地路径（临时文件），需要先上传
                let avatarUrl = this.avatar;
                if ((avatarUrl && avatarUrl.startsWith('http://tmp/')) || avatarUrl.includes('wxfile://')) {
                    // 上传头像到服务器
                    avatarUrl = await this.uploadAvatar(avatarUrl);
                }

                // 调用API更新用户信息
                const updateData = {
                    nickname: this.nickname,
                    avatar: avatarUrl,
                    phone: this.phone
                };
                await api.updateUserInfo(updateData);

                // 更新全局用户信息
                app.globalData.userInfo = {
                    ...app.globalData.userInfo,
                    ...updateData
                };
                uni.setStorageSync('userInfo', app.globalData.userInfo);
                uni.showToast({
                    title: '保存成功',
                    icon: 'success'
                });
                setTimeout(() => {
                    uni.navigateBack();
                }, 1500);
            } catch (error) {
                console.log('CatchClause', error);
                console.log('CatchClause', error);
                console.error('保存失败', error);
                uni.showToast({
                    title: '保存失败',
                    icon: 'none'
                });
            } finally {
                this.setData({
                    loading: false
                });
            }
        },

        // 上传头像
        uploadAvatar(tempFilePath) {
            return new Promise((resolve, reject) => {
                uni.uploadFile({
                    url: `${app.globalData.apiBase}/file/upload`,
                    filePath: tempFilePath,
                    name: 'file',
                    header: {
                        Authorization: 'Bearer ' + uni.getStorageSync('token')
                    },
                    success: (res) => {
                        const data = JSON.parse(res.data);
                        if (data.code === 200) {
                            resolve(data.data.url);
                        } else {
                            reject(new Error(data.message));
                        }
                    },
                    fail: (err) => {
                        reject(err);
                    }
                });
            });
        }
    }
};
</script>
<style>
/* pages/profile-edit/profile-edit.wxss */
.profile-edit-container {
    min-height: 100vh;
    background-color: #f8f8f8;
    padding: 20rpx;
    padding-bottom: 160rpx;
}

/* 表单区域 */
.form-section {
    background-color: #fff;
    border-radius: 16rpx;
    padding: 20rpx;
    margin-bottom: 30rpx;
}

.form-item {
    display: flex;
    align-items: center;
    padding: 30rpx 20rpx;
    border-bottom: 1rpx solid #e0e0e0;
}

.form-item:last-child {
    border-bottom: none;
}

.form-label {
    width: 140rpx;
    font-size: 30rpx;
    color: #333;
    font-weight: bold;
}

.form-input {
    flex: 1;
    font-size: 28rpx;
    color: #333;
}

/* 头像按钮 */
.avatar-button {
    flex: 1;
    padding: 0;
    margin: 0;
    background: transparent;
    border: none;
    display: flex;
    justify-content: flex-end;
    position: relative;
    overflow: visible;
}

.avatar-button::after {
    border: none;
}

.avatar-image {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    border: 4rpx solid #aad08f;
}

.avatar-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s;
}

.avatar-button:active .avatar-mask {
    opacity: 1;
}

.avatar-text {
    color: #fff;
    font-size: 22rpx;
}

/* 保存按钮 */
.save-button {
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

/* 提示信息 */
.tips {
    background-color: #fff;
    border-radius: 16rpx;
    padding: 30rpx;
}

.tip-text {
    display: block;
    font-size: 26rpx;
    color: #999;
    line-height: 2;
}
</style>
