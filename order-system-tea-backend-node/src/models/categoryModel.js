const { pool } = require('../config/database');

class CategoryModel {
  /**
   * 获取所有分类
   */
  static async getAll() {
    const [rows] = await pool.execute(
      'SELECT * FROM category WHERE status = 1 ORDER BY sort ASC, create_time DESC'
    );
    return rows;
  }
  
  /**
   * 根据ID查找分类
   */
  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM category WHERE id = ?',
      [id]
    );
    return rows[0];
  }
  
  /**
   * 获取分类列表（包括隐藏的，管理端用）
   */
  static async getList() {
    const [rows] = await pool.execute(
      'SELECT * FROM category ORDER BY sort ASC, create_time DESC'
    );
    return rows;
  }
  
  /**
   * 创建分类
   */
  static async create(category) {
    const [result] = await pool.execute(
      'INSERT INTO category (name, icon, sort, status) VALUES (?, ?, ?, ?)',
      [category.name, category.icon || '', category.sort || 0, category.status !== undefined ? category.status : 1]
    );
    return result.insertId;
  }
  
  /**
   * 更新分类
   */
  static async update(id, category) {
    const fields = [];
    const values = [];
    
    if (category.name !== undefined) {
      fields.push('name = ?');
      values.push(category.name);
    }
    if (category.icon !== undefined) {
      fields.push('icon = ?');
      values.push(category.icon);
    }
    if (category.sort !== undefined) {
      fields.push('sort = ?');
      values.push(category.sort);
    }
    if (category.status !== undefined) {
      fields.push('status = ?');
      values.push(category.status);
    }
    
    if (fields.length === 0) return false;
    
    values.push(id);
    const [result] = await pool.execute(
      `UPDATE category SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  }
  
  /**
   * 删除分类
   */
  static async delete(id) {
    const [result] = await pool.execute(
      'DELETE FROM category WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = CategoryModel;

