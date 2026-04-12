const { pool } = require('../config/database');

class BannerModel {
  /**
   * 获取所有轮播图
   */
  static async getAll() {
    const [rows] = await pool.execute(
      'SELECT * FROM banner WHERE status = 1 ORDER BY sort ASC, create_time DESC'
    );
    return rows;
  }
  
  /**
   * 根据ID查找轮播图
   */
  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM banner WHERE id = ?',
      [id]
    );
    return rows[0];
  }
  
  /**
   * 获取轮播图列表（包括隐藏的，管理端用）
   */
  static async getList() {
    const [rows] = await pool.execute(
      'SELECT * FROM banner ORDER BY sort ASC, create_time DESC'
    );
    return rows;
  }
  
  /**
   * 创建轮播图
   */
  static async create(banner) {
    const [result] = await pool.execute(
      'INSERT INTO banner (title, image, link_type, link_id, sort, status) VALUES (?, ?, ?, ?, ?, ?)',
      [
        banner.title || '',
        banner.image,
        banner.linkType || 'none',
        banner.linkId || null,
        banner.sort || 0,
        banner.status !== undefined ? banner.status : 1
      ]
    );
    return result.insertId;
  }
  
  /**
   * 更新轮播图
   */
  static async update(id, banner) {
    const fields = [];
    const values = [];
    
    if (banner.title !== undefined) {
      fields.push('title = ?');
      values.push(banner.title);
    }
    if (banner.image !== undefined) {
      fields.push('image = ?');
      values.push(banner.image);
    }
    if (banner.linkType !== undefined) {
      fields.push('link_type = ?');
      values.push(banner.linkType);
    }
    if (banner.linkId !== undefined) {
      fields.push('link_id = ?');
      values.push(banner.linkId);
    }
    if (banner.sort !== undefined) {
      fields.push('sort = ?');
      values.push(banner.sort);
    }
    if (banner.status !== undefined) {
      fields.push('status = ?');
      values.push(banner.status);
    }
    
    if (fields.length === 0) return false;
    
    values.push(id);
    const [result] = await pool.execute(
      `UPDATE banner SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  }
  
  /**
   * 删除轮播图
   */
  static async delete(id) {
    const [result] = await pool.execute(
      'DELETE FROM banner WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = BannerModel;

