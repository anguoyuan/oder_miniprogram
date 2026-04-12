const express = require('express');
const router = express.Router();
const BannerController = require('../controllers/bannerController');
const { adminAuth } = require('../middleware/auth');

// 用户端接口
router.get('/list', BannerController.getList);

// 管理端接口
router.get('/admin/list', adminAuth, BannerController.getAdminList);
router.post('/admin/add', adminAuth, BannerController.add);
router.put('/admin/update', adminAuth, BannerController.update);
router.delete('/admin/delete/:id', adminAuth, BannerController.delete);
router.put('/admin/toggleStatus/:id', adminAuth, BannerController.toggleStatus);

module.exports = router;

