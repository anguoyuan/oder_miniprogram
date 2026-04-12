const { pool } = require('../config/database');

class ProductLikeModel {
  /**
   * 点赞商品
   */
  static async like(userId, productId) {
    // 检查是否已点赞
    const [existing] = await pool.execute(
      'SELECT id FROM product_like WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );
    
    if (existing.length > 0) {
      throw new Error('已点赞该商品');
    }
    
    // 开启事务
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      // 添加点赞记录
      await connection.execute(
        'INSERT INTO product_like (user_id, product_id) VALUES (?, ?)',
        [userId, productId]
      );
      
      // 增加商品点赞数
      await connection.execute(
        'UPDATE product SET likes = likes + 1 WHERE id = ?',
        [productId]
      );
      
      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
  
  /**
   * 取消点赞
   */
  static async unlike(userId, productId) {
    // 开启事务
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      // 删除点赞记录
      const [result] = await connection.execute(
        'DELETE FROM product_like WHERE user_id = ? AND product_id = ?',
        [userId, productId]
      );
      
      if (result.affectedRows > 0) {
        // 减少商品点赞数
        await connection.execute(
          'UPDATE product SET likes = GREATEST(likes - 1, 0) WHERE id = ?',
          [productId]
        );
      }
      
      await connection.commit();
      return result.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
  
  /**
   * 检查是否已点赞
   */
  static async isLiked(userId, productId) {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as count FROM product_like WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );
    return rows[0].count > 0;
  }
  
  /**
   * 获取用户点赞列表（带商品信息）
   */
  static async getUserLikesWithProduct(userId) {
    const [rows] = await pool.execute(
      `SELECT pl.id as likeId, pl.create_time as likeTime,
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
       FROM product_like pl
       LEFT JOIN product p ON pl.product_id = p.id
       LEFT JOIN category c ON p.category_id = c.id
       WHERE pl.user_id = ?
       ORDER BY pl.create_time DESC`,
      [userId]
    );
    return rows;
  }
}

module.exports = ProductLikeModel;

