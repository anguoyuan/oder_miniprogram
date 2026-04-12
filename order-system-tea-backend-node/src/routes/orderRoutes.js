const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/orderController');
const { auth, adminAuth } = require('../middleware/auth');

// 用户端接口
router.post('/create', auth, OrderController.createOrder);
router.get('/detail/:orderId', auth, OrderController.getOrderDetail);
router.get('/user-orders', auth, OrderController.getUserOrders);
router.put('/cancel/:orderId', auth, OrderController.cancelOrder);

// 管理端接口
router.get('/all', adminAuth, OrderController.getAllOrders);
router.put('/update-status', adminAuth, OrderController.updateOrderStatus);
router.get('/stats', adminAuth, OrderController.getStats);

module.exports = router;

