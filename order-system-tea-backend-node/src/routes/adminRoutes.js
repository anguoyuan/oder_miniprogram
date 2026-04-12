const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const { adminAuth } = require('../middleware/auth');

router.post('/login', AdminController.login);
router.get('/info', adminAuth, AdminController.getAdminInfo);
router.get('/list', adminAuth, AdminController.getAdminList);

module.exports = router;

