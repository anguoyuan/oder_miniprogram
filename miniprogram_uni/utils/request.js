// utils/request.js - 统一请求封装
const config = require('../config.js');

/**
 * 发送HTTP请求
 * @param {String} url 请求地址
 * @param {String} method 请求方法
 * @param {Object} data 请求数据
 * @param {Boolean} needAuth 是否需要token
 */
function request(url, method = 'GET', data = {}, needAuth = true) {
    return new Promise((resolve, reject) => {
        const header = {
            'content-type': 'application/json'
        };

        // 添加token
        if (needAuth) {
            const token = uni.getStorageSync('token');
            if (token) {
                header['Authorization'] = 'Bearer ' + token;
            }
        }
        uni.request({
            url: config.apiUrl + url,
            method: method,
            data: data,
            header: header,
            success: (res) => {
                if (res.data.code === 200) {
                    resolve(res.data.data);
                } else {
                    uni.showToast({
                        title: res.data.message || '请求失败',
                        icon: 'none',
                        duration: 2000
                    });
                    reject(res.data);
                }
            },
            fail: (error) => {
                uni.showToast({
                    title: '网络请求失败',
                    icon: 'none',
                    duration: 2000
                });
                reject(error);
            }
        });
    });
}
module.exports = {
    get: (url, data) => request(url, 'GET', data),
    post: (url, data, needAuth) => request(url, 'POST', data, needAuth),
    put: (url, data) => request(url, 'PUT', data),
    delete: (url, data) => request(url, 'DELETE', data)
};
