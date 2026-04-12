const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboardController');
const { adminAuth } = require('../middleware/auth');

// Dashboard统计接口
router.get('/stats', adminAuth, DashboardController.getStats);

module.exports = router;

