const ReviewModel = require('../models/reviewModel');
const { success, error, page } = require('../utils/response');

class ReviewController {
  /**
   * 添加评价
   */
  static async submit(req, res) {
    try {
      const userId = req.userId;
      const { orderId, productId, rating, content, images } = req.body;
      
      if (!orderId || !rating) {
        return res.json(error('订单ID和评分不能为空'));
      }
      
      await ReviewModel.create({
        orderId,
        userId,
        productId,
        rating,
        content,
        images
      });
      
      res.json(success(null, '评价成功'));
    } catch (err) {
      console.error('添加评价失败:', err);
      res.json(error(err.message || '添加评价失败'));
    }
  }
  
  /**
   * 获取商品评价列表
   */
  static async getProductReviews(req, res) {
    try {
      const { productId } = req.params;
      const { page: pageNum = 1, pageSize = 10 } = req.query;
      
      const result = await ReviewModel.getProductReviews(
        productId,
        parseInt(pageNum),
        parseInt(pageSize)
      );
      
      res.json(page(result.records, result.total));
    } catch (err) {
      console.error('获取商品评价失败:', err);
      res.json(error(err.message || '获取商品评价失败'));
    }
  }
  
  /**
   * 获取用户评价列表
   */
  static async getUserReviews(req, res) {
    try {
      const userId = req.userId;
      const { page: pageNum = 1, pageSize = 10 } = req.query;
      
      const result = await ReviewModel.getUserReviews(
        userId,
        parseInt(pageNum),
        parseInt(pageSize)
      );
      
      res.json(page(result.records, result.total));
    } catch (err) {
      console.error('获取用户评价失败:', err);
      res.json(error(err.message || '获取用户评价失败'));
    }
  }
  
  /**
   * 回复评价（管理端）
   */
  static async reply(req, res) {
    try {
      const { reviewId, reply } = req.body;
      
      if (!reviewId || !reply) {
        return res.json(error('评价ID和回复内容不能为空'));
      }
      
      await ReviewModel.reply(reviewId, reply);
      
      res.json(success(null, '回复成功'));
    } catch (err) {
      console.error('回复评价失败:', err);
      res.json(error(err.message || '回复评价失败'));
    }
  }
  
  /**
   * 更新评价状态（管理端）
   */
  static async updateStatus(req, res) {
    try {
      const { reviewId, status } = req.body;
      
      if (!reviewId || status === undefined) {
        return res.json(error('评价ID和状态不能为空'));
      }
      
      await ReviewModel.updateStatus(reviewId, status);
      
      res.json(success(null, '更新成功'));
    } catch (err) {
      console.error('更新评价状态失败:', err);
      res.json(error(err.message || '更新评价状态失败'));
    }
  }
  
  /**
   * 获取所有评价列表（管理端）
   */
  static async getAllReviews(req, res) {
    try {
      const { status, rating, page: pageNum = 1, pageSize = 10 } = req.query;
      
      const result = await ReviewModel.getAllReviews(
        status,
        rating,
        parseInt(pageNum),
        parseInt(pageSize)
      );
      
      res.json(page(result.records, result.total));
    } catch (err) {
      console.error('获取所有评价失败:', err);
      res.json(error(err.message || '获取所有评价失败'));
    }
  }
  
  /**
   * 检查订单是否已评价
   */
  static async hasReviewed(req, res) {
    try {
      const { orderId } = req.params;
      
      const hasReviewed = await ReviewModel.hasReviewed(orderId);
      
      res.json(success(hasReviewed));
    } catch (err) {
      console.error('检查订单评价状态失败:', err);
      res.json(error(err.message || '检查订单评价状态失败'));
    }
  }
  
  /**
   * 获取订单评价详情
   */
  static async getOrderReview(req, res) {
    try {
      const { orderId } = req.params;
      
      const review = await ReviewModel.getOrderReview(orderId);
      
      res.json(success(review));
    } catch (err) {
      console.error('获取订单评价详情失败:', err);
      res.json(error(err.message || '获取订单评价详情失败'));
    }
  }
}

module.exports = ReviewController;

