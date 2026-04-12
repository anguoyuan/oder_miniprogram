const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class AdminModel {
  /**
   * 根据用户名查找管理员
   */
  static async findByUsername(username) {
    const [rows] = await pool.execute(
      'SELECT * FROM admin WHERE username = ?',
      [username]
    );
    return rows[0];
  }
  
  /**
   * 根据ID查找管理员
   */
  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, username, name, phone, role, status FROM admin WHERE id = ?',
      [id]
    );
    return rows[0];
  }
  
  /**
   * 验证密码
   */
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
  
  /**
   * 创建管理员
   */
  static async create(admin) {
    const hashedPassword = await bcrypt.hash(admin.password, 10);
    const [result] = await pool.execute(
      'INSERT INTO admin (username, password, name, phone, role, status) VALUES (?, ?, ?, ?, ?, ?)',
      [admin.username, hashedPassword, admin.name, admin.phone || '', admin.role || 'admin', 1]
    );
    return result.insertId;
  }
  
  /**
   * 更新管理员信息
   */
  static async update(id, admin) {
    const fields = [];
    const values = [];
    
    if (admin.name !== undefined) {
      fields.push('name = ?');
      values.push(admin.name);
    }
    if (admin.phone !== undefined) {
      fields.push('phone = ?');
      values.push(admin.phone);
    }
    if (admin.password !== undefined) {
      fields.push('password = ?');
      values.push(await bcrypt.hash(admin.password, 10));
    }
    
    if (fields.length === 0) return false;
    
    values.push(id);
    const [result] = await pool.execute(
      `UPDATE admin SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  }
  
  /**
   * 获取管理员列表
   */
  static async getList() {
    const [rows] = await pool.execute(
      'SELECT id, username, name, phone, role, status, create_time FROM admin ORDER BY create_time DESC'
    );
    return rows;
  }
}

module.exports = AdminModel;

