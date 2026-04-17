const { pool } = require('../config/database');
const moment = require('moment');

class PaymentModel {
  static generatePaymentNo() {
    return 'PAY' + moment().format('YYYYMMDDHHmmss') + Math.floor(Math.random() * 10000);
  }

  static async create({ orderId, amount, qrString }) {
    const paymentNo = this.generatePaymentNo();
    const [result] = await pool.execute(
      `INSERT INTO payments (order_id, payment_no, amount, method, status, qr_string, reference)
       VALUES (?, ?, ?, 'paynow', 'pending', ?, ?)`,
      [orderId, paymentNo, amount, qrString, paymentNo]
    );
    return { paymentId: result.insertId, paymentNo };
  }

  static async findByOrderId(orderId) {
    const [rows] = await pool.execute(
      'SELECT * FROM payments WHERE order_id = ? ORDER BY created_at DESC LIMIT 1',
      [orderId]
    );
    return rows[0] || null;
  }

  static async findById(paymentId) {
    const [rows] = await pool.execute(
      'SELECT * FROM payments WHERE id = ?',
      [paymentId]
    );
    return rows[0] || null;
  }

  static async updateStatus(paymentId, status) {
    const [result] = await pool.execute(
      'UPDATE payments SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, paymentId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = PaymentModel;
