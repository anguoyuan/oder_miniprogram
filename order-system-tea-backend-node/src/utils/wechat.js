const axios = require('axios');
const config = require('../config/config');

/**
 * 微信登录 - 通过code获取openid
 */
const code2Session = async (code) => {
  try {
    const url = 'https://api.weixin.qq.com/sns/jscode2session';
    const response = await axios.get(url, {
      params: {
        appid: config.wechat.appId,
        secret: config.wechat.appSecret,
        js_code: code,
        grant_type: 'authorization_code'
      }
    });
    
    if (response.data.errcode) {
      throw new Error(response.data.errmsg || '微信登录失败');
    }
    
    return {
      openid: response.data.openid,
      sessionKey: response.data.session_key
    };
  } catch (error) {
    console.error('微信登录失败:', error);
    throw new Error('微信登录失败');
  }
};

module.exports = { code2Session };

