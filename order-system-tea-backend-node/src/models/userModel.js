const { pool } = require('../config/database');
const { normalizePagination } = require('../utils/pagination');

class UserModel {
  /**
   * 根据openid查找用户
   */
  static async findByOpenid(openid) {
    const [rows] = await pool.execute(
      'SELECT * FROM user WHERE openid = ?',
      [openid]
    );
    return rows[0];
  }
  
  /**
   * 根据ID查找用户
   */
  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM user WHERE id = ?',
      [id]
    );
    return rows[0];
  }
  
  /**
   * 创建用户
   */
  static async create(user) {
    const [result] = await pool.execute(
      'INSERT INTO user (openid, nickname, avatar, status) VALUES (?, ?, ?, ?)',
      [user.openid, user.nickname, user.avatar, 1]
    );
    return result.insertId;
  }
  
  /**
   * 更新用户信息
   */
  static async update(id, user) {
    const fields = [];
    const values = [];
    
    if (user.nickname !== undefined) {
      fields.push('nickname = ?');
      values.push(user.nickname);
    }
    if (user.avatar !== undefined) {
      fields.push('avatar = ?');
      values.push(user.avatar);
    }
    if (user.phone !== undefined) {
      fields.push('phone = ?');
      values.push(user.phone);
    }
    
    if (fields.length === 0) return false;
    
    values.push(id);
    const [result] = await pool.execute(
      `UPDATE user SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  }
  
  /**
   * 更新用户状态
   */
  static async updateStatus(id, status) {
    const [result] = await pool.execute(
      'UPDATE user SET status = ? WHERE id = ?',
      [status, id]
    );
    return result.affectedRows > 0;
  }
  
  /**
   * 获取用户列表（分页）
   */
  static async getList(keyword, page, pageSize) {
    // 使用分页工具确保参数是整数类型（MySQL兼容性）
    const { limit, offset } = normalizePagination(page, pageSize);
    
    // 直接拼接SQL（参数已经过类型转换，安全）
    let sql = 'SELECT * FROM user';
    let countSql = 'SELECT COUNT(*) as total FROM user';
    
    if (keyword) {
      const safeKeyword = pool.escape(`%${keyword}%`);
      const where = ` WHERE nickname LIKE ${safeKeyword} OR phone LIKE ${safeKeyword}`;
      sql += where;
      countSql += where;
    }
    
    sql += ` ORDER BY create_time DESC LIMIT ${limit} OFFSET ${offset}`;
    
    const [rows] = await pool.query(sql);
    const [countRows] = await pool.query(countSql);
    
    return {
      records: rows,
      total: countRows[0].total
    };
  }
  
  /**
   * 获取用户统计数据
   */
  static async getStats(userId) {
    const [orderStats] = await pool.execute(
      'SELECT COUNT(*) as totalOrders, SUM(total_price) as totalAmount FROM orders WHERE user_id = ? AND status != "cancelled"',
      [userId]
    );
    
    const [favoriteCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM favorite WHERE user_id = ?',
      [userId]
    );
    
    const [likeCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM product_like WHERE user_id = ?',
      [userId]
    );
    
    return {
      totalOrders: orderStats[0].totalOrders || 0,
      totalAmount: orderStats[0].totalAmount || 0,
      favoriteCount: favoriteCount[0].count || 0,
      likeCount: likeCount[0].count || 0
    };
  }
}

module.exports = UserModel;

