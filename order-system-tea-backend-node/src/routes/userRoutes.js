const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { auth, adminAuth } = require('../middleware/auth');

// 用户端接口
router.post('/wx-login', UserController.wxLogin);
router.get('/info', auth, UserController.getUserInfo);
router.put('/update', auth, UserController.updateUser);

// 管理端接口
router.get('/list', adminAuth, UserController.getUserList);
router.put('/update-status', adminAuth, UserController.updateUserStatus);
router.get('/stats/:userId', adminAuth, UserController.getUserStats);

module.exports = router;

