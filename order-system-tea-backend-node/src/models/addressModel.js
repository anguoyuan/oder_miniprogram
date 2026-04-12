const { pool } = require('../config/database');

class AddressModel {
  /**
   * 获取用户地址列表
   */
  static async getUserAddressList(userId) {
    const [rows] = await pool.execute(
      'SELECT * FROM address WHERE user_id = ? ORDER BY is_default DESC, create_time DESC',
      [userId]
    );
    return rows;
  }
  
  /**
   * 添加地址
   */
  static async create(address, userId) {
    // 如果设置为默认地址，先取消其他默认地址
    if (address.isDefault === 1) {
      await pool.execute(
        'UPDATE address SET is_default = 0 WHERE user_id = ?',
        [userId]
      );
    }
    
    const [result] = await pool.execute(
      `INSERT INTO address (user_id, name, phone, province, city, district, detail, latitude, longitude, is_default) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        address.name,
        address.phone,
        address.province,
        address.city,
        address.district,
        address.detail,
        address.latitude || null,
        address.longitude || null,
        address.isDefault || 0
      ]
    );
    return result.insertId;
  }
  
  /**
   * 更新地址
   */
  static async update(address, userId) {
    // 如果设置为默认地址，先取消其他默认地址
    if (address.isDefault === 1) {
      await pool.execute(
        'UPDATE address SET is_default = 0 WHERE user_id = ?',
        [userId]
      );
    }
    
    const [result] = await pool.execute(
      `UPDATE address SET name = ?, phone = ?, province = ?, city = ?, district = ?, 
                          detail = ?, latitude = ?, longitude = ?, is_default = ? 
       WHERE id = ? AND user_id = ?`,
      [
        address.name,
        address.phone,
        address.province,
        address.city,
        address.district,
        address.detail,
        address.latitude || null,
        address.longitude || null,
        address.isDefault || 0,
        address.id,
        userId
      ]
    );
    return result.affectedRows > 0;
  }
  
  /**
   * 删除地址
   */
  static async delete(id, userId) {
    const [result] = await pool.execute(
      'DELETE FROM address WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows > 0;
  }
  
  /**
   * 设置默认地址
   */
  static async setDefault(id, userId) {
    // 先取消其他默认地址
    await pool.execute(
      'UPDATE address SET is_default = 0 WHERE user_id = ?',
      [userId]
    );
    
    // 设置新的默认地址
    const [result] = await pool.execute(
      'UPDATE address SET is_default = 1 WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows > 0;
  }
  
  /**
   * 根据ID查找地址
   */
  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM address WHERE id = ?',
      [id]
    );
    return rows[0];
  }
}

module.exports = AddressModel;

