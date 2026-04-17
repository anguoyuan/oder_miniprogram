const PaymentModel = require('../models/paymentModel');
const OrderModel = require('../models/orderModel');
const { generatePayNowQRDataURL } = require('../utils/paynowQR');
const { success, error } = require('../utils/response');

// Merchant config — set PAYNOW_MOBILE (+65XXXXXXXX) for personal PayNow,
// or PAYNOW_UEN for business PayNow. MOBILE takes priority.
const MERCHANT_MOBILE = process.env.PAYNOW_MOBILE || '';
const MERCHANT_UEN = process.env.PAYNOW_UEN || '';
const MERCHANT_NAME = process.env.PAYNOW_MERCHANT_NAME || 'Shanghai Pastry';

class PaymentController {
  /**
   * Create a PayNow payment for an order.
   * If a pending payment already exists, returns it.
   */
  static async createPayment(req, res) {
    try {
      const userId = req.userId;
      const { orderId } = req.body;

      if (!orderId) return res.json(error('订单ID不能为空'));

      const order = await OrderModel.findById(orderId);
      if (!order) return res.json(error('订单不存在'));
      if (order.user_id !== userId) return res.json(error('无权操作此订单'));

      // Reuse existing pending payment if present
      const existing = await PaymentModel.findByOrderId(orderId);
      if (existing && existing.status === 'pending') {
        const { dataURL } = await generatePayNowQRDataURL({
          mobile: MERCHANT_MOBILE || undefined,
          uen: MERCHANT_UEN || undefined,
          amount: existing.amount,
          reference: existing.reference,
          merchantName: MERCHANT_NAME
        });
        return res.json(success({
          paymentId: existing.id,
          paymentNo: existing.payment_no,
          amount: existing.amount,
          status: existing.status,
          qrCodeDataURL: dataURL
        }));
      }

      const { qrString, dataURL } = await generatePayNowQRDataURL({
        mobile: MERCHANT_MOBILE || undefined,
        uen: MERCHANT_UEN || undefined,
        amount: order.total_price,
        reference: order.order_no,
        merchantName: MERCHANT_NAME
      });

      const { paymentId, paymentNo } = await PaymentModel.create({
        orderId,
        amount: order.total_price,
        qrString
      });

      res.json(success({
        paymentId,
        paymentNo,
        amount: order.total_price,
        status: 'pending',
        qrCodeDataURL: dataURL
      }, '支付二维码已生成'));
    } catch (err) {
      console.error('创建支付失败:', err);
      res.json(error(err.message || '创建支付失败'));
    }
  }

  /**
   * Poll payment status (called by frontend every few seconds).
   */
  static async getPaymentStatus(req, res) {
    try {
      const { paymentId } = req.params;
      const payment = await PaymentModel.findById(paymentId);
      if (!payment) return res.json(error('支付记录不存在'));

      res.json(success({ paymentId: payment.id, status: payment.status, amount: payment.amount }));
    } catch (err) {
      console.error('查询支付状态失败:', err);
      res.json(error(err.message || '查询支付状态失败'));
    }
  }

  /**
   * Admin manually confirms a payment received via PayNow.
   */
  static async confirmPayment(req, res) {
    try {
      const { paymentId } = req.params;
      const payment = await PaymentModel.findById(paymentId);
      if (!payment) return res.json(error('支付记录不存在'));
      if (payment.status === 'paid') return res.json(success(null, '已经确认过了'));

      await PaymentModel.updateStatus(paymentId, 'paid');
      // Move order to pending (ready for kitchen)
      await OrderModel.updateStatus(payment.order_id, 'pending');

      // Notify via WebSocket/Socket.IO
      const order = await OrderModel.getDetail(payment.order_id);
      if (req.app.locals.io) req.app.locals.io.emit('paymentConfirmed', { paymentId, order });
      if (req.app.locals.wsClients) {
        const msg = JSON.stringify({ type: 'payment_confirmed', data: { paymentId, order } });
        req.app.locals.wsClients.forEach(client => {
          if (client.readyState === 1) client.send(msg);
        });
      }

      res.json(success(null, '支付已确认'));
    } catch (err) {
      console.error('确认支付失败:', err);
      res.json(error(err.message || '确认支付失败'));
    }
  }

  /**
   * Get all pending payments (admin).
   */
  static async getPendingPayments(req, res) {
    try {
      const [rows] = await require('../config/database').pool.execute(
        `SELECT p.*, o.order_no, o.total_price, o.order_type
         FROM payments p
         JOIN orders o ON p.order_id = o.id
         WHERE p.status = 'pending'
         ORDER BY p.created_at DESC`
      );
      res.json(success(rows));
    } catch (err) {
      console.error('获取待确认支付失败:', err);
      res.json(error(err.message || '获取待确认支付失败'));
    }
  }
}

module.exports = PaymentController;
