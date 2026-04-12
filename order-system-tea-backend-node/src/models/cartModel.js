const { pool } = require('../config/database');

class CartModel {
  /**
   * 获取用户购物车
   */
  static async getUserCart(userId) {
    const [rows] = await pool.execute(
      `SELECT c.*, p.name as productName, p.price, p.image as productImage, p.stock
       FROM cart c
       LEFT JOIN product p ON c.product_id = p.id
       WHERE c.user_id = ?
       ORDER BY c.create_time DESC`,
      [userId]
    );
    return rows;
  }
  
  /**
   * 添加到购物车
   */
  static async add(userId, productId, quantity, specs) {
    // 先检查是否已存在
    const [existing] = await pool.execute(
      'SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ? AND specs = ?',
      [userId, productId, specs || '']
    );
    
    if (existing.length > 0) {
      // 更新数量
      const [result] = await pool.execute(
        'UPDATE cart SET quantity = quantity + ? WHERE id = ?',
        [quantity, existing[0].id]
      );
      return existing[0].id;
    } else {
      // 新增
      const [result] = await pool.execute(
        'INSERT INTO cart (user_id, product_id, quantity, specs) VALUES (?, ?, ?, ?)',
        [userId, productId, quantity, specs || '']
      );
      return result.insertId;
    }
  }
  
  /**
   * 更新购物车数量
   */
  static async updateQuantity(cartId, userId, quantity) {
    const [result] = await pool.execute(
      'UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?',
      [quantity, cartId, userId]
    );
    return result.affectedRows > 0;
  }
  
  /**
   * 删除购物车项
   */
  static async delete(cartId, userId) {
    const [result] = await pool.execute(
      'DELETE FROM cart WHERE id = ? AND user_id = ?',
      [cartId, userId]
    );
    return result.affectedRows > 0;
  }
  
  /**
   * 清空购物车
   */
  static async clear(userId) {
    const [result] = await pool.execute(
      'DELETE FROM cart WHERE user_id = ?',
      [userId]
    );
    return result.affectedRows;
  }
  
  /**
   * 批量删除
   */
  static async deleteBatch(cartIds, userId) {
    const placeholders = cartIds.map(() => '?').join(',');
    const [result] = await pool.execute(
      `DELETE FROM cart WHERE id IN (${placeholders}) AND user_id = ?`,
      [...cartIds, userId]
    );
    return result.affectedRows;
  }
}

module.exports = CartModel;

