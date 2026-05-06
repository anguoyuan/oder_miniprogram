const UserModel = require('../models/userModel');
const { code2Session } = require('../utils/wechat');
const { generateUserToken } = require('../utils/jwt');
const { success, error, page } = require('../utils/response');
const config = require('../config/config');

class UserController {
  /**
   * 微信登录
   */
  static async wxLogin(req, res) {
    try {
      const { code, nickname, avatar } = req.body;
      
      if (!code) {
        return res.json(error('缺少code参数'));
      }
      
      // 调用微信API获取openid
      const { openid } = await code2Session(code);
      
      // 查找或创建用户
      let user = await UserModel.findByOpenid(openid);
      
      if (!user) {
        // 创建新用户
        const userId = await UserModel.create({
          openid,
          nickname: nickname || '微信用户',
          avatar: avatar || ''
        });
        user = await UserModel.findById(userId);
      } else if (nickname || avatar) {
        // 更新用户信息
        await UserModel.update(user.id, {
          ...(nickname && { nickname }),
          ...(avatar && { avatar })
        });
        user = await UserModel.findById(user.id);
      }
      
      // 处理头像URL
      if (user.avatar && !user.avatar.startsWith('http')) {
        user.avatar = `${config.upload.serverUrl}/api${user.avatar}`;
      }
      
      // 生成token
      const token = generateUserToken(user.id, user.nickname);
      
      res.json(success({
        token,
        user
      }, '登录成功'));
    } catch (err) {
      console.error('微信登录失败:', err);
      res.json(error(err.message || '微信登录失败'));
    }
  }
  
  /**
   * 获取用户信息
   */
  static async getUserInfo(req, res) {
    try {
      const userId = req.userId;
      const user = await UserModel.findById(userId);
      
      if (!user) {
        return res.json(error('用户不存在'));
      }
      
      // 处理头像URL
      if (user.avatar && !user.avatar.startsWith('http')) {
        user.avatar = `${config.upload.serverUrl}/api${user.avatar}`;
      }
      
      res.json(success(user));
    } catch (err) {
      console.error('获取用户信息失败:', err);
      res.json(error(err.message || '获取用户信息失败'));
    }
  }
  
  /**
   * 更新用户信息
   */
  static async updateUser(req, res) {
    try {
      const userId = req.userId;
      const userData = req.body;
      
      await UserModel.update(userId, userData);
      
      res.json(success(null, '更新成功'));
    } catch (err) {
      console.error('更新用户信息失败:', err);
      res.json(error(err.message || '更新用户信息失败'));
    }
  }
  
  /**
   * 获取用户列表（管理端）
   */
  static async getUserList(req, res) {
    try {
      const { keyword, page: pageNum = 1, pageSize = 10 } = req.query;
      
      const result = await UserModel.getList(
        keyword,
        parseInt(pageNum),
        parseInt(pageSize)
      );
      
      res.json(page(result.records, result.total));
    } catch (err) {
      console.error('获取用户列表失败:', err);
      res.json(error(err.message || '获取用户列表失败'));
    }
  }
  
  /**
   * 更新用户状态（管理端）
   */
  static async updateUserStatus(req, res) {
    try {
      const { id, status } = req.body;
      
      await UserModel.updateStatus(id, status);
      
      res.json(success(null, '更新成功'));
    } catch (err) {
      console.error('更新用户状态失败:', err);
      res.json(error(err.message || '更新用户状态失败'));
    }
  }
  
  /**
   * 获取用户统计（管理端）
   */
  static async getUserStats(req, res) {
    try {
      const { userId } = req.params;
      
      const stats = await UserModel.getStats(userId);
      
      res.json(success(stats));
    } catch (err) {
      console.error('获取用户统计失败:', err);
      res.json(error(err.message || '获取用户统计失败'));
    }
  }
}

module.exports = UserController;

