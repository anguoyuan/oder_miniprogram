require('dotenv').config();

module.exports = {
  // 服务器配置
  port: process.env.PORT || 8080,
  env: process.env.NODE_ENV || 'development',
  
  // JWT配置
  jwt: {
    secret: process.env.JWT_SECRET || 'tea-order-system-secret-key-2026',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  
  // 微信配置
  wechat: {
    appId: process.env.WX_APP_ID || 'wx5c299618872f77c3',
    appSecret: process.env.WX_APP_SECRET || '6dde2ce45ba6c624bde73bf634e88750'
  },

  // 文件上传配置
  upload: {
    dir: process.env.UPLOAD_DIR || 'uploads',
    serverUrl: process.env.SERVER_URL || 'https://api.liveasy.solutions'
  },
  
  // 店铺配置
  shop: {
    name: process.env.SHOP_NAME || '奶茶点单系统',
    latitude: parseFloat(process.env.SHOP_LATITUDE) || 39.9042,
    longitude: parseFloat(process.env.SHOP_LONGITUDE) || 116.4074,
    deliveryRange: parseFloat(process.env.SHOP_DELIVERY_RANGE) || 5.0
  }
};

