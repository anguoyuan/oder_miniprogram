const { pool } = require('../config/database');

class FavoriteModel {
  /**
   * 添加收藏
   */
  static async add(userId, productId) {
    // 检查是否已收藏
    const [existing] = await pool.execute(
      'SELECT id FROM favorite WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );
    
    if (existing.length > 0) {
      throw new Error('已收藏该商品');
    }
    
    const [result] = await pool.execute(
      'INSERT INTO favorite (user_id, product_id) VALUES (?, ?)',
      [userId, productId]
    );
    return result.insertId;
  }
  
  /**
   * 取消收藏
   */
  static async remove(userId, productId) {
    const [result] = await pool.execute(
      'DELETE FROM favorite WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );
    return result.affectedRows > 0;
  }
  
  /**
   * 检查是否已收藏
   */
  static async isFavorite(userId, productId) {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as count FROM favorite WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );
    return rows[0].count > 0;
  }
  
  /**
   * 获取用户收藏列表（带商品信息）
   */
  static async getUserFavoritesWithProduct(userId) {
    const [rows] = await pool.execute(
      `SELECT f.id as favoriteId, f.create_time as favoriteTime,
              p.id as productId,
              p.name as productName,
              p.description as productDescription,
              p.price as productPrice,
              p.image as productImage,
              p.tags as productTags,
              p.likes as productLikes,
              p.sales as productSales,
              p.status as productStatus,
              c.name as categoryName
       FROM favorite f
       LEFT JOIN product p ON f.product_id = p.id
       LEFT JOIN category c ON p.category_id = c.id
       WHERE f.user_id = ?
       ORDER BY f.create_time DESC`,
      [userId]
    );
    return rows;
  }
}

module.exports = FavoriteModel;

