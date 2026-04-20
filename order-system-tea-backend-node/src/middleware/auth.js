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

/**
 * 可选认证中间件（无 token 时用 guestId）
 */
const optionalAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      const decoded = jwt.verify(token, config.jwt.secret);
      req.userId = decoded.userId;
      req.user = decoded;
    } else {
      req.userId = req.body.guestId || req.query.guestId || null;
    }
  } catch (error) {
    req.userId = req.body.guestId || req.query.guestId || null;
  }
  next();
};

module.exports = { auth, adminAuth, optionalAuth };

