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
    appId: 'wx105c7f4184eb6754',
    appSecret: '088d0c9a3a536cad7501f197a06d60ef'
  },
  
  // 文件上传配置
  upload: {
    dir: process.env.UPLOAD_DIR || 'uploads',
    serverUrl: process.env.SERVER_URL || 'http://localhost:8080'
  },
  
  // 店铺配置
  shop: {
    name: process.env.SHOP_NAME || '奶茶点单系统',
    latitude: parseFloat(process.env.SHOP_LATITUDE) || 39.9042,
    longitude: parseFloat(process.env.SHOP_LONGITUDE) || 116.4074,
    deliveryRange: parseFloat(process.env.SHOP_DELIVERY_RANGE) || 5.0
  }
};

