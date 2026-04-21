const OrderModel = require('../models/orderModel');
const ProductModel = require('../models/productModel');
const { success, error, page } = require('../utils/response');

class OrderController {
  /**
   * 创建订单
   */
  static async createOrder(req, res) {
    try {
      let userId = req.userId;
      const { items, orderType, remark, address, phone, totalPrice, guestId } = req.body;

      // 兜底：若 token 和 body guestId 都没给，生成一个匿名ID，避免 user_id 为 null
      if (!userId) {
        userId = guestId || (900000000 + Math.floor(Math.random() * 100000000));
      }

      if (!items || items.length === 0) {
        return res.json(error('订单商品不能为空'));
      }
      
      // 填充商品信息并计算总价
      let calculatedTotalPrice = 0;
      const enrichedItems = [];
      
      for (const item of items) {
        const product = await ProductModel.findById(item.productId);
        if (!product) {
          return res.json(error(`商品不存在: ${item.productId}`));
        }
        
        enrichedItems.push({
          productId: product.id,
          productName: product.name,
          productImage: product.image,
          price: parseFloat(product.price),
          quantity: item.quantity,
          specs: item.specs || null
        });
        
        calculatedTotalPrice += parseFloat(product.price) * item.quantity;
      }
      
      // 使用计算出的总价（如果前端传了totalPrice，优先使用前端的）
      const finalTotalPrice = totalPrice || calculatedTotalPrice;
      
      // 创建订单
      const { orderId, orderNo } = await OrderModel.create({
        userId,
        totalPrice: finalTotalPrice,
        orderType: orderType || 'takeaway',
        remark: remark || null,
        address: address || null,
        phone: phone || null
      });
      
      // 创建订单明细
      await OrderModel.createOrderItems(orderId, enrichedItems);
      
      // 更新商品销量和库存
      for (const item of enrichedItems) {
        await ProductModel.incrementSales(item.productId, item.quantity);
        // 如果商品有库存字段，减少库存（可选）
        // await ProductModel.decrementStock(item.productId, item.quantity);
      }
      
      // 获取完整订单信息
      const order = await OrderModel.getDetail(orderId);
      
      // 通过Socket.IO通知（新架构）
      if (req.app.locals.io) {
        req.app.locals.io.emit('newOrder', order);
      }
      
      // 通过原生WebSocket通知（旧前端）
      if (req.app.locals.wsClients) {
        const message = JSON.stringify({
          type: 'new_order',
          data: order
        });
        req.app.locals.wsClients.forEach(client => {
          if (client.readyState === 1) { // WebSocket.OPEN
            client.send(message);
          }
        });
      }
      
      res.json(success(order, '订单创建成功'));
    } catch (err) {
      console.error('创建订单失败:', err);
      res.json(error(err.message || '创建订单失败'));
    }
  }
  
  /**
   * 获取订单详情
   */
  static async getOrderDetail(req, res) {
    try {
      const { orderId } = req.params;
      
      const order = await OrderModel.getDetail(orderId);
      
      if (!order) {
        return res.json(error('订单不存在'));
      }
      
      res.json(success(order));
    } catch (err) {
      console.error('获取订单详情失败:', err);
      res.json(error(err.message || '获取订单详情失败'));
    }
  }
  
  /**
   * 获取用户订单列表
   */
  static async getUserOrders(req, res) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.json(page([], 0));
      }
      const { status, page: pageNum = 1, pageSize = 10 } = req.query;
      
      const result = await OrderModel.getUserOrders(
        userId,
        status,
        parseInt(pageNum),
        parseInt(pageSize)
      );
      
      res.json(page(result.records, result.total));
    } catch (err) {
      console.error('获取用户订单失败:', err);
      res.json(error(err.message || '获取用户订单失败'));
    }
  }
  
  /**
   * 获取所有订单列表（管理端）
   */
  static async getAllOrders(req, res) {
    try {
      const { status, page: pageNum = 1, pageSize = 10 } = req.query;
      
      const result = await OrderModel.getAllOrders(
        status,
        parseInt(pageNum),
        parseInt(pageSize)
      );
      
      res.json(page(result.records, result.total));
    } catch (err) {
      console.error('获取所有订单失败:', err);
      res.json(error(err.message || '获取所有订单失败'));
    }
  }
  
  /**
   * 更新订单状态（管理端）
   */
  static async updateOrderStatus(req, res) {
    try {
      const { orderId, status } = req.body;
      
      await OrderModel.updateStatus(orderId, status);
      
      // 通过Socket.IO通知
      if (req.app.locals.io) {
        req.app.locals.io.emit('orderStatusUpdate', { orderId, status });
      }
      
      // 通过原生WebSocket通知
      if (req.app.locals.wsClients) {
        const message = JSON.stringify({
          type: 'order_status_update',
          data: { orderId, status }
        });
        req.app.locals.wsClients.forEach(client => {
          if (client.readyState === 1) {
            client.send(message);
          }
        });
      }
      
      res.json(success(null, '更新成功'));
    } catch (err) {
      console.error('更新订单状态失败:', err);
      res.json(error(err.message || '更新订单状态失败'));
    }
  }
  
  /**
   * 取消订单
   */
  static async cancelOrder(req, res) {
    try {
      const userId = req.userId;
      const { orderId } = req.params;
      
      const result = await OrderModel.cancel(orderId, userId);
      
      if (!result) {
        return res.json(error('订单不存在或无法取消'));
      }
      
      res.json(success(null, '订单已取消'));
    } catch (err) {
      console.error('取消订单失败:', err);
      res.json(error(err.message || '取消订单失败'));
    }
  }
  
  /**
   * 获取订单统计（管理端）
   */
  static async getStats(req, res) {
    try {
      const stats = await OrderModel.getStats();
      res.json(success(stats));
    } catch (err) {
      console.error('获取订单统计失败:', err);
      res.json(error(err.message || '获取订单统计失败'));
    }
  }
}

module.exports = OrderController;

