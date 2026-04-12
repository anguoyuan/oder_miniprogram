const jwt = require('jsonwebtoken');
const config = require('../config/config');

/**
 * JWT认证中间件
 */
const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        code: 401,
        message: '未提供认证令牌'
      });
    }
    
    const decoded = jwt.verify(token, config.jwt.secret);
    req.userId = decoded.userId;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      code: 401,
      message: '认证失败，请重新登录'
    });
  }
};

/**
 * 管理员认证中间件
 */
const adminAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        code: 401,
        message: '未提供认证令牌'
      });
    }
    
    const decoded = jwt.verify(token, config.jwt.secret);
    
    if (decoded.role !== 'admin' && decoded.role !== 'super') {
      return res.status(403).json({
        code: 403,
        message: '权限不足'
      });
    }
    
    req.adminId = decoded.adminId;
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      code: 401,
      message: '认证失败，请重新登录'
    });
  }
};

module.exports = { auth, adminAuth };

