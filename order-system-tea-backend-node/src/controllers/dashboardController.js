const OrderModel = require('../models/orderModel');
const { success, error } = require('../utils/response');

class DashboardController {
  /**
   * 获取Dashboard统计数据
   */
  static async getStats(req, res) {
    try {
      const stats = await OrderModel.getStats();
      
      // 返回格式化的统计数据
      res.json(success({
        pendingOrders: stats.status.pending,
        preparingOrders: stats.status.preparing,
        completedOrders: stats.status.todayCompleted,
        todayRevenue: stats.status.todayRevenue
      }));
    } catch (err) {
      console.error('获取统计数据失败:', err);
      res.json(error(err.message || '获取统计数据失败'));
    }
  }
}

module.exports = DashboardController;

