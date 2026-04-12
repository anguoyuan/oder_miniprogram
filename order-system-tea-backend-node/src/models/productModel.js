const { pool } = require('../config/database');
const { normalizePagination, ensureInteger } = require('../utils/pagination');

class ProductModel {
  /**
   * 根据ID查找商品
   */
  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT p.*, c.name as categoryName 
       FROM product p 
       LEFT JOIN category c ON p.category_id = c.id 
       WHERE p.id = ?`,
      [id]
    );
    return rows[0];
  }
  
  /**
   * 根据分类ID获取商品列表
   */
  static async findByCategoryId(categoryId) {
    const [rows] = await pool.execute(
      'SELECT * FROM product WHERE category_id = ? AND status = 1 ORDER BY sort ASC, create_time DESC',
      [categoryId]
    );
    return rows;
  }
  
  /**
   * 搜索商品
   */
  static async search(keyword, page, pageSize) {
    // 使用分页工具确保参数是整数类型（MySQL兼容性）
    const { limit, offset } = normalizePagination(page, pageSize);
    const safeKeyword = pool.escape(`%${keyword}%`);
    
    // 直接拼接SQL（参数已经过类型转换，安全）
    const sql = `SELECT * FROM product WHERE (name LIKE ${safeKeyword} OR description LIKE ${safeKeyword} OR tags LIKE ${safeKeyword}) AND status = 1 ORDER BY sales DESC LIMIT ${limit} OFFSET ${offset}`;
    const countSql = `SELECT COUNT(*) as total FROM product WHERE (name LIKE ${safeKeyword} OR description LIKE ${safeKeyword} OR tags LIKE ${safeKeyword}) AND status = 1`;
    
    const [rows] = await pool.query(sql);
    const [countRows] = await pool.query(countSql);
    
    return {
      records: rows,
      total: countRows[0].total
    };
  }
  
  /**
   * 获取热门商品
   */
  static async getHotProducts(limit) {
    // 使用工具确保参数是整数类型（MySQL兼容性）
    const limitInt = ensureInteger(limit, 10);
    
    // 直接拼接SQL（参数已经过类型转换，安全）
    const sql = `SELECT * FROM product WHERE status = 1 ORDER BY sales DESC, likes DESC LIMIT ${limitInt}`;
    const [rows] = await pool.query(sql);
    return rows;
  }
  
  /**
   * 获取商品列表（分页）
   */
  static async getPage(page, pageSize) {
    // 使用分页工具确保参数是整数类型（MySQL兼容性）
    const { limit, offset } = normalizePagination(page, pageSize);
    
    // 直接拼接SQL（参数已经过类型转换，安全）
    const sql = `SELECT * FROM product ORDER BY sort ASC, create_time DESC LIMIT ${limit} OFFSET ${offset}`;
    const countSql = 'SELECT COUNT(*) as total FROM product';
    
    const [rows] = await pool.query(sql);
    const [countRows] = await pool.query(countSql);
    
    return {
      records: rows,
      total: countRows[0].total
    };
  }
  
  /**
   * 创建商品
   */
  static async create(product) {
    const [result] = await pool.execute(
      `INSERT INTO product (category_id, name, description, price, image, tags, stock, status, sort) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        product.categoryId,
        product.name,
        product.description,
        product.price,
        product.image,
        product.tags,
        product.stock || 999,
        product.status !== undefined ? product.status : 1,
        product.sort || 0
      ]
    );
    return result.insertId;
  }
  
  /**
   * 更新商品
   */
  static async update(id, product) {
    const fields = [];
    const values = [];
    
    if (product.categoryId !== undefined) {
      fields.push('category_id = ?');
      values.push(product.categoryId);
    }
    if (product.name !== undefined) {
      fields.push('name = ?');
      values.push(product.name);
    }
    if (product.description !== undefined) {
      fields.push('description = ?');
      values.push(product.description);
    }
    if (product.price !== undefined) {
      fields.push('price = ?');
      values.push(product.price);
    }
    if (product.image !== undefined) {
      fields.push('image = ?');
      values.push(product.image);
    }
    if (product.tags !== undefined) {
      fields.push('tags = ?');
      values.push(product.tags);
    }
    if (product.stock !== undefined) {
      fields.push('stock = ?');
      values.push(product.stock);
    }
    if (product.status !== undefined) {
      fields.push('status = ?');
      values.push(product.status);
    }
    if (product.sort !== undefined) {
      fields.push('sort = ?');
      values.push(product.sort);
    }
    
    if (fields.length === 0) return false;
    
    values.push(id);
    const [result] = await pool.execute(
      `UPDATE product SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  }
  
  /**
   * 删除商品
   */
  static async delete(id) {
    const [result] = await pool.execute(
      'DELETE FROM product WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
  
  /**
   * 增加销量
   */
  static async incrementSales(id, quantity) {
    const [result] = await pool.execute(
      'UPDATE product SET sales = sales + ? WHERE id = ?',
      [quantity, id]
    );
    return result.affectedRows > 0;
  }
  
  /**
   * 减少库存
   */
  static async decrementStock(id, quantity) {
    const [result] = await pool.execute(
      'UPDATE product SET stock = stock - ? WHERE id = ? AND stock >= ?',
      [quantity, id, quantity]
    );
    return result.affectedRows > 0;
  }
}

module.exports = ProductModel;

