const jwt = require('jsonwebtoken');
const config = require('../config/config');

/**
 * 生成用户JWT令牌
 */
const generateUserToken = (userId, nickname) => {
  return jwt.sign(
    { userId, nickname, type: 'user' },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

/**
 * 生成管理员JWT令牌
 */
const generateAdminToken = (adminId, username, role) => {
  return jwt.sign(
    { adminId, username, role, type: 'admin' },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

/**
 * 验证JWT令牌
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    return null;
  }
};

/**
 * 从请求中获取用户ID
 */
const getUserIdFromRequest = (req) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return null;
    
    const decoded = jwt.verify(token, config.jwt.secret);
    return decoded.userId;
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateUserToken,
  generateAdminToken,
  verifyToken,
  getUserIdFromRequest
};

