const { pool } = require('../config/database');
const moment = require('moment');
const { normalizePagination } = require('../utils/pagination');

class OrderModel {
  /**
   * 生成订单号
   */
  static generateOrderNo() {
    return moment().format('YYYYMMDDHHmmss') + Math.floor(Math.random() * 10000);
  }
  
  /**
   * 创建订单
   *
   * 红包/去重：若 5 分钟内已有 unpaid 或 pending_confirm 订单 total_price 与本单相同，
   * 自动减 0.10 直至无冲突；最多减 RED_PACKET_MAX_STEPS 次。到达上限仍冲突则抛
   * REDUCTION_CAP_EXCEEDED，由 controller 转成"系统繁忙"提示。整个过程在事务里
   * 并 SELECT ... FOR UPDATE，避免并发同金额订单同时拿到相同折扣。
   *
   * paymentMethod === 'paynow' 时订单初始 payment_status='pending_confirm'，
   * 占用唯一金额坑位但 nanobot 不会对账。用户点击 "I have paid" 后由 confirmPayment()
   * 翻成 'unpaid' 才进入 nanobot 视野；关闭弹窗 → cancelPending() 翻成 'cancelled'。
   */
  static async create(order) {
    const orderNo = this.generateOrderNo();
    const RED_PACKET_MAX_STEPS = 20;
    const STEP_CENTS = 10;
    const originalCents = Math.round(parseFloat(order.totalPrice) * 100);
    const initialPaymentStatus = order.paymentMethod === 'paynow' ? 'pending_confirm' : 'unpaid';

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      let candidateCents = originalCents;
      for (let i = 0; i <= RED_PACKET_MAX_STEPS; i++) {
        const [rows] = await conn.execute(
          `SELECT id FROM orders
             WHERE payment_status IN ('unpaid', 'pending_confirm')
               AND ROUND(total_price * 100) = ?
               AND create_time >= NOW() - INTERVAL 5 MINUTE
             FOR UPDATE`,
          [candidateCents]
        );
        if (rows.length === 0) break;
        if (i === RED_PACKET_MAX_STEPS) {
          await conn.rollback();
          const err = new Error('REDUCTION_CAP_EXCEEDED');
          err.code = 'REDUCTION_CAP_EXCEEDED';
          throw err;
        }
        candidateCents -= STEP_CENTS;
      }
      const adjustedPrice = (candidateCents / 100).toFixed(2);

      let sql, params;
      const hasAddressId = order.addressId !== undefined && order.addressId !== null;
      if (hasAddressId) {
        sql = `INSERT INTO orders (order_no, user_id, total_price, order_type, status, payment_status, remark, address, phone, address_id)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        params = [
          orderNo, order.userId, adjustedPrice, order.orderType || 'takeaway',
          'pending', initialPaymentStatus, order.remark || null, order.address || null,
          order.phone || null, order.addressId
        ];
      } else {
        sql = `INSERT INTO orders (order_no, user_id, total_price, order_type, status, payment_status, remark, address, phone)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        params = [
          orderNo, order.userId, adjustedPrice, order.orderType || 'takeaway',
          'pending', initialPaymentStatus, order.remark || null, order.address || null,
          order.phone || null
        ];
      }

      const [result] = await conn.execute(sql, params);
      await conn.commit();

      return {
        orderId: result.insertId,
        orderNo,
        originalTotalPrice: (originalCents / 100).toFixed(2),
        adjustedTotalPrice: adjustedPrice,
        redPacket: ((originalCents - candidateCents) / 100).toFixed(2),
      };
    } catch (e) {
      try { await conn.rollback(); } catch (_) { /* already rolled back */ }
      throw e;
    } finally {
      conn.release();
    }
  }
  
  /**
   * 创建订单明细
   */
  static async createOrderItems(orderId, items) {
    const values = items.map(item => [
      orderId,
      item.productId,
      item.productName || '',
      item.productImage || '',
      item.price || 0,
      item.quantity || 1,
      item.specs || null
    ]);
    
    await pool.query(
      `INSERT INTO order_item (order_id, product_id, product_name, product_image, price, quantity, specs) 
       VALUES ?`,
      [values]
    );
  }
  
  /**
   * 根据ID查找订单
   */
  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM orders WHERE id = ?',
      [id]
    );
    return rows[0];
  }
  
  /**
   * 获取订单详情（包含订单明细）
   */
  static async getDetail(orderId) {
    const [orderRows] = await pool.execute(
      'SELECT * FROM orders WHERE id = ?',
      [orderId]
    );
    
    if (orderRows.length === 0) return null;
    
    const [itemRows] = await pool.execute(
      'SELECT * FROM order_item WHERE order_id = ?',
      [orderId]
    );
    
    return {
      ...orderRows[0],
      items: itemRows
    };
  }
  
  /**
   * 获取用户订单列表
   */
  static async getUserOrders(userId, status, page, pageSize) {
    // 使用分页工具确保参数是整数类型（MySQL兼容性）
    const { limit, offset } = normalizePagination(page, pageSize);
    
    // 直接拼接SQL（参数已经过类型转换，安全）
    // pending_confirm 是 PayNow 弹窗未确认前的预占状态，不展示给用户
    let sql = `SELECT * FROM orders WHERE user_id = ${userId} AND payment_status != 'pending_confirm'`;
    let countSql = `SELECT COUNT(*) as total FROM orders WHERE user_id = ${userId} AND payment_status != 'pending_confirm'`;
    
    if (status) {
      const safeStatus = pool.escape(status);
      sql += ` AND status = ${safeStatus}`;
      countSql += ` AND status = ${safeStatus}`;
    }
    
    sql += ` ORDER BY create_time DESC LIMIT ${limit} OFFSET ${offset}`;
    
    const [rows] = await pool.query(sql);
    const [countRows] = await pool.query(countSql);
    
    // 为每个订单查询订单明细
    const orders = await Promise.all(rows.map(async (order) => {
      const [items] = await pool.execute(
        `SELECT oi.*, p.description as product_description
         FROM order_item oi
         LEFT JOIN product p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [order.id]
      );
      return {
        ...order,
        items: items
      };
    }));
    
    return {
      records: orders,
      total: countRows[0].total
    };
  }
  
  /**
   * 获取所有订单列表（管理端）
   */
  static async getAllOrders(status, paymentStatus, page, pageSize) {
    const { limit, offset } = normalizePagination(page, pageSize);

    let where = [];
    let sql = 'SELECT o.*, u.nickname as userNickname, u.avatar as userAvatar FROM orders o LEFT JOIN user u ON o.user_id = u.id';
    let countSql = 'SELECT COUNT(*) as total FROM orders o';

    if (status === 'active') {
      where.push(`o.status IN ('pending','preparing','ready')`);
    } else if (status) {
      where.push(`o.status = ${pool.escape(status)}`);
    }
    if (paymentStatus) {
      where.push(`o.payment_status = ${pool.escape(paymentStatus)}`);
    }
    if (where.length) {
      sql += ` WHERE ${where.join(' AND ')}`;
      countSql += ` WHERE ${where.map(w => w.replace(/^o\./g, '')).join(' AND ')}`;
    }

    sql += ` ORDER BY o.create_time DESC LIMIT ${limit} OFFSET ${offset}`;

    const [rows] = await pool.query(sql);
    const [countRows] = await pool.query(countSql);

    const orders = await Promise.all(rows.map(async (order) => {
      const [items] = await pool.execute(
        `SELECT oi.*, p.description as product_description
         FROM order_item oi
         LEFT JOIN product p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [order.id]
      );
      return { ...order, items };
    }));

    return { records: orders, total: countRows[0].total };
  }

  static async updatePaymentStatus(orderId, paymentStatus) {
    const [result] = await pool.execute(
      'UPDATE orders SET payment_status = ? WHERE id = ?',
      [paymentStatus, orderId]
    );
    return result.affectedRows > 0;
  }
  
  /**
   * 更新订单状态
   */
  static async updateStatus(orderId, status) {
    const [result] = await pool.execute(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, orderId]
    );
    return result.affectedRows > 0;
  }
  
  /**
   * 取消订单
   */
  static async cancel(orderId, userId) {
    const [result] = await pool.execute(
      'UPDATE orders SET status = "cancelled" WHERE id = ? AND user_id = ? AND status = "pending"',
      [orderId, userId]
    );
    return result.affectedRows > 0;
  }

  /**
   * 用户点击 "I have paid" 后，将 pending_confirm 翻成 unpaid，让 nanobot 开始对账。
   */
  static async confirmPayment(orderId, userId) {
    const [result] = await pool.execute(
      `UPDATE orders SET payment_status = 'unpaid'
         WHERE id = ? AND user_id = ? AND payment_status = 'pending_confirm'`,
      [orderId, userId]
    );
    return result.affectedRows > 0;
  }

  /**
   * 用户关闭 PayNow 弹窗 / 放弃支付：直接 DELETE 这条 pending_confirm 订单
   * 及其 order_item，从用户视角看就像从未下过单。事务里 SELECT ... FOR UPDATE
   * 防止与并发 confirmPayment 抢同一条记录。
   */
  static async cancelPending(orderId, userId) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [rows] = await conn.execute(
        `SELECT id FROM orders
           WHERE id = ? AND user_id = ? AND payment_status = 'pending_confirm'
           FOR UPDATE`,
        [orderId, userId]
      );
      if (rows.length === 0) {
        await conn.rollback();
        return false;
      }
      await conn.execute('DELETE FROM order_item WHERE order_id = ?', [orderId]);
      const [result] = await conn.execute(
        `DELETE FROM orders
           WHERE id = ? AND user_id = ? AND payment_status = 'pending_confirm'`,
        [orderId, userId]
      );
      await conn.commit();
      return result.affectedRows > 0;
    } catch (e) {
      try { await conn.rollback(); } catch (_) { /* already rolled back */ }
      throw e;
    } finally {
      conn.release();
    }
  }
  
  /**
   * 获取订单统计
   */
  static async getStats() {
    // 查询今日订单统计
    const [todayStats] = await pool.execute(
      `SELECT 
         COUNT(*) as orderCount, 
         COALESCE(SUM(total_price), 0) as totalAmount 
       FROM orders 
       WHERE DATE(create_time) = CURDATE() AND status != 'cancelled'`
    );
    
    // 查询总订单统计
    const [totalStats] = await pool.execute(
      `SELECT 
         COUNT(*) as orderCount, 
         COALESCE(SUM(total_price), 0) as totalAmount 
       FROM orders 
       WHERE status != 'cancelled'`
    );
    
    // 统计各状态订单数（只统计当前实时状态，不限日期）
    const [statusStats] = await pool.execute(
      `SELECT 
         SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
         SUM(CASE WHEN status = 'preparing' THEN 1 ELSE 0 END) as preparing,
         SUM(CASE WHEN status = 'ready' THEN 1 ELSE 0 END) as ready
       FROM orders`
    );
    
    // 统计今日完成订单和营业额
    const [todayCompletedStats] = await pool.execute(
      `SELECT 
         COUNT(*) as todayCompleted,
         COALESCE(SUM(total_price), 0) as todayRevenue
       FROM orders 
       WHERE status = 'completed' 
       AND DATE(create_time) = CURDATE()`
    );
    
    console.log('📊 订单统计数据:', {
      today: todayStats[0],
      completed: todayCompletedStats[0],
      status: statusStats[0]
    });
    
    return {
      today: {
        orderCount: parseInt(todayStats[0].orderCount) || 0,
        totalAmount: parseFloat(todayStats[0].totalAmount) || 0
      },
      total: {
        orderCount: parseInt(totalStats[0].orderCount) || 0,
        totalAmount: parseFloat(totalStats[0].totalAmount) || 0
      },
      status: {
        pending: parseInt(statusStats[0].pending) || 0,
        preparing: parseInt(statusStats[0].preparing) || 0,
        ready: parseInt(statusStats[0].ready) || 0,
        todayCompleted: parseInt(todayCompletedStats[0].todayCompleted) || 0,
        todayRevenue: parseFloat(todayCompletedStats[0].todayRevenue) || 0
      }
    };
  }
}

module.exports = OrderModel;

