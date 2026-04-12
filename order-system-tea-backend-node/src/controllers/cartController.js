const CartModel = require('../models/cartModel');
const { success, error } = require('../utils/response');

class CartController {
  /**
   * 获取购物车
   */
  static async getCart(req, res) {
    try {
      const userId = req.userId;
      const cart = await CartModel.getUserCart(userId);
      res.json(success(cart));
    } catch (err) {
      console.error('获取购物车失败:', err);
      res.json(error(err.message || '获取购物车失败'));
    }
  }
  
  /**
   * 添加到购物车
   */
  static async add(req, res) {
    try {
      const userId = req.userId;
      const { productId, quantity, specs } = req.body;
      
      if (!productId || !quantity) {
        return res.json(error('商品ID和数量不能为空'));
      }
      
      await CartModel.add(userId, productId, quantity, specs);
      res.json(success(null, '添加成功'));
    } catch (err) {
      console.error('添加到购物车失败:', err);
      res.json(error(err.message || '添加到购物车失败'));
    }
  }
  
  /**
   * 更新购物车数量
   */
  static async updateQuantity(req, res) {
    try {
      const userId = req.userId;
      const { cartId, quantity } = req.body;
      
      if (!cartId || !quantity) {
        return res.json(error('购物车ID和数量不能为空'));
      }
      
      await CartModel.updateQuantity(cartId, userId, quantity);
      res.json(success(null, '更新成功'));
    } catch (err) {
      console.error('更新购物车失败:', err);
      res.json(error(err.message || '更新购物车失败'));
    }
  }
  
  /**
   * 删除购物车项
   */
  static async delete(req, res) {
    try {
      const userId = req.userId;
      const { cartId } = req.params;
      
      await CartModel.delete(cartId, userId);
      res.json(success(null, '删除成功'));
    } catch (err) {
      console.error('删除购物车失败:', err);
      res.json(error(err.message || '删除购物车失败'));
    }
  }
  
  /**
   * 清空购物车
   */
  static async clear(req, res) {
    try {
      const userId = req.userId;
      await CartModel.clear(userId);
      res.json(success(null, '清空成功'));
    } catch (err) {
      console.error('清空购物车失败:', err);
      res.json(error(err.message || '清空购物车失败'));
    }
  }
  
  /**
   * 批量删除
   */
  static async deleteBatch(req, res) {
    try {
      const userId = req.userId;
      const { cartIds } = req.body;
      
      if (!cartIds || cartIds.length === 0) {
        return res.json(error('请选择要删除的商品'));
      }
      
      await CartModel.deleteBatch(cartIds, userId);
      res.json(success(null, '删除成功'));
    } catch (err) {
      console.error('批量删除失败:', err);
      res.json(error(err.message || '批量删除失败'));
    }
  }
}

module.exports = CartController;

