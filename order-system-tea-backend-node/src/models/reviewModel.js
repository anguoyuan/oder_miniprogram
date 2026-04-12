const { pool } = require('../config/database');
const { normalizePagination } = require('../utils/pagination');

class ReviewModel {
  /**
   * 添加评价
   */
  static async create(review) {
    const [result] = await pool.execute(
      `INSERT INTO review (order_id, user_id, product_id, rating, content, images, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        review.orderId,
        review.userId,
        review.productId || null,
        review.rating,
        review.content || '',
        review.images || '',
        1
      ]
    );
    return result.insertId;
  }
  
  /**
   * 获取商品评价列表
   */
  static async getProductReviews(productId, page, pageSize) {
    // 使用分页工具确保参数是整数类型（MySQL兼容性）
    const { limit, offset } = normalizePagination(page, pageSize);
    
    // 直接拼接SQL（参数已经过类型转换，安全）
    const sql = `SELECT r.*, 
            u.nickname as userName, 
            u.avatar as userAvatar 
     FROM review r 
     LEFT JOIN user u ON r.user_id = u.id 
     WHERE r.product_id = ${productId} AND r.status = 1 
     ORDER BY r.create_time DESC 
     LIMIT ${limit} OFFSET ${offset}`;
    
    const countSql = `SELECT COUNT(*) as total FROM review WHERE product_id = ${productId} AND status = 1`;
    
    const [rows] = await pool.query(sql);
    const [countRows] = await pool.query(countSql);
    
    return {
      records: rows,
      total: countRows[0].total
    };
  }
  
  /**
   * 获取用户评价列表
   */
  static async getUserReviews(userId, page, pageSize) {
    // 使用分页工具确保参数是整数类型（MySQL兼容性）
    const { limit, offset } = normalizePagination(page, pageSize);
    
    // 直接拼接SQL（参数已经过类型转换，安全）
    const sql = `SELECT r.*, 
            p.name as productName, 
            p.image as productImage 
     FROM review r 
     LEFT JOIN product p ON r.product_id = p.id 
     WHERE r.user_id = ${userId} 
     ORDER BY r.create_time DESC 
     LIMIT ${limit} OFFSET ${offset}`;
    
    const countSql = `SELECT COUNT(*) as total FROM review WHERE user_id = ${userId}`;
    
    const [rows] = await pool.query(sql);
    const [countRows] = await pool.query(countSql);
    
    return {
      records: rows,
      total: countRows[0].total
    };
  }
  
  /**
   * 回复评价
   */
  static async reply(reviewId, reply) {
    const [result] = await pool.execute(
      'UPDATE review SET reply = ?, reply_time = NOW() WHERE id = ?',
      [reply, reviewId]
    );
    return result.affectedRows > 0;
  }
  
  /**
   * 更新评价状态
   */
  static async updateStatus(reviewId, status) {
    const [result] = await pool.execute(
      'UPDATE review SET status = ? WHERE id = ?',
      [status, reviewId]
    );
    return result.affectedRows > 0;
  }
  
  /**
   * 获取所有评价列表（管理端）
   */
  static async getAllReviews(status, rating, page, pageSize) {
    // 使用分页工具确保参数是整数类型（MySQL兼容性）
    const { limit, offset } = normalizePagination(page, pageSize);
    
    // 直接拼接SQL（参数已经过类型转换，安全）
    let sql = `SELECT r.*, 
                      u.nickname as userName, 
                      u.avatar as userAvatar, 
                      p.name as productName, 
                      o.order_no as orderNo
               FROM review r
               LEFT JOIN user u ON r.user_id = u.id
               LEFT JOIN product p ON r.product_id = p.id
               LEFT JOIN orders o ON r.order_id = o.id
               WHERE 1=1`;
    let countSql = 'SELECT COUNT(*) as total FROM review WHERE 1=1';
    
    if (status !== null && status !== undefined && status !== '') {
      sql += ` AND r.status = ${pool.escape(status)}`;
      countSql += ` AND status = ${pool.escape(status)}`;
    }
    
    if (rating !== null && rating !== undefined && rating !== '') {
      sql += ` AND r.rating = ${pool.escape(rating)}`;
      countSql += ` AND rating = ${pool.escape(rating)}`;
    }
    
    sql += ` ORDER BY r.create_time DESC LIMIT ${limit} OFFSET ${offset}`;
    
    const [rows] = await pool.query(sql);
    const [countRows] = await pool.query(countSql);
    
    return {
      records: rows,
      total: countRows[0].total
    };
  }
  
  /**
   * 检查订单是否已评价
   */
  static async hasReviewed(orderId) {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as count FROM review WHERE order_id = ?',
      [orderId]
    );
    return rows[0].count > 0;
  }
  
  /**
   * 获取订单评价详情
   */
  static async getOrderReview(orderId) {
    const [rows] = await pool.execute(
      `SELECT r.*, 
              u.nickname as userName, 
              u.avatar as userAvatar 
       FROM review r 
       LEFT JOIN user u ON r.user_id = u.id 
       WHERE r.order_id = ?`,
      [orderId]
    );
    return rows[0];
  }
}

module.exports = ReviewModel;

