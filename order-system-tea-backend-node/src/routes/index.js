const express = require('express');
const router = express.Router();

const userRoutes = require('./userRoutes');
const productRoutes = require('./productRoutes');
const orderRoutes = require('./orderRoutes');
const categoryRoutes = require('./categoryRoutes');
const cartRoutes = require('./cartRoutes');
const bannerRoutes = require('./bannerRoutes');
const adminRoutes = require('./adminRoutes');
const fileRoutes = require('./fileRoutes');
const reviewRoutes = require('./reviewRoutes');
const addressRoutes = require('./addressRoutes');
const favoriteRoutes = require('./favoriteRoutes');
const likeRoutes = require('./likeRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const paymentRoutes = require('./paymentRoutes');

// 挂载路由
router.use('/user', userRoutes);
router.use('/product', productRoutes);
router.use('/order', orderRoutes);
router.use('/category', categoryRoutes);
router.use('/cart', cartRoutes);
router.use('/banner', bannerRoutes);
router.use('/admin', adminRoutes);
router.use('/file', fileRoutes);
router.use('/review', reviewRoutes);
router.use('/address', addressRoutes);
router.use('/favorite', favoriteRoutes);
router.use('/like', likeRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/payment', paymentRoutes);

module.exports = router;

