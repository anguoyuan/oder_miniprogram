const AdminModel = require('../models/adminModel');
const { generateAdminToken } = require('../utils/jwt');
const { success, error } = require('../utils/response');

class AdminController {
  /**
   * 管理员登录
   */
  static async login(req, res) {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.json(error('用户名和密码不能为空'));
      }
      
      // 查找管理员
      const admin = await AdminModel.findByUsername(username);
      
      if (!admin) {
        return res.json(error('用户名或密码错误'));
      }
      
      // 验证密码
      const isValid = await AdminModel.verifyPassword(password, admin.password);
      
      if (!isValid) {
        return res.json(error('用户名或密码错误'));
      }
      
      if (admin.status !== 1) {
        return res.json(error('账号已被禁用'));
      }
      
      // 生成token
      const token = generateAdminToken(admin.id, admin.username, admin.role);
      
      // 移除敏感信息
      delete admin.password;
      
      res.json(success({
        token,
        admin
      }, '登录成功'));
    } catch (err) {
      console.error('管理员登录失败:', err);
      res.json(error(err.message || '登录失败'));
    }
  }
  
  /**
   * 获取管理员信息
   */
  static async getAdminInfo(req, res) {
    try {
      const adminId = req.adminId;
      
      const admin = await AdminModel.findById(adminId);
      
      if (!admin) {
        return res.json(error('管理员不存在'));
      }
      
      res.json(success(admin));
    } catch (err) {
      console.error('获取管理员信息失败:', err);
      res.json(error(err.message || '获取管理员信息失败'));
    }
  }
  
  /**
   * 获取管理员列表
   */
  static async getAdminList(req, res) {
    try {
      const admins = await AdminModel.getList();
      
      res.json(success(admins));
    } catch (err) {
      console.error('获取管理员列表失败:', err);
      res.json(error(err.message || '获取管理员列表失败'));
    }
  }
}

module.exports = AdminController;

