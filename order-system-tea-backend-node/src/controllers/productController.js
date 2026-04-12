const ProductModel = require('../models/productModel');
const { success, error, page } = require('../utils/response');

class ProductController {
  /**
   * 根据分类获取商品列表
   */
  static async getProductsByCategory(req, res) {
    try {
      const { categoryId } = req.params;
      
      const products = await ProductModel.findByCategoryId(categoryId);
      
      res.json(success(products));
    } catch (err) {
      console.error('获取商品列表失败:', err);
      res.json(error(err.message || '获取商品列表失败'));
    }
  }
  
  /**
   * 获取商品详情
   */
  static async getProductDetail(req, res) {
    try {
      const { id } = req.params;
      
      const product = await ProductModel.findById(id);
      
      if (!product) {
        return res.json(error('商品不存在'));
      }
      
      res.json(success(product));
    } catch (err) {
      console.error('获取商品详情失败:', err);
      res.json(error(err.message || '获取商品详情失败'));
    }
  }
  
  /**
   * 搜索商品
   */
  static async searchProducts(req, res) {
    try {
      const { keyword, page: pageNum = 1, pageSize = 10 } = req.query;
      
      if (!keyword) {
        return res.json(error('请输入搜索关键词'));
      }
      
      const result = await ProductModel.search(
        keyword,
        parseInt(pageNum),
        parseInt(pageSize)
      );
      
      res.json(page(result.records, result.total));
    } catch (err) {
      console.error('搜索商品失败:', err);
      res.json(error(err.message || '搜索商品失败'));
    }
  }
  
  /**
   * 获取热门商品
   */
  static async getHotProducts(req, res) {
    try {
      const { limit = 10 } = req.query;
      
      const products = await ProductModel.getHotProducts(parseInt(limit));
      
      res.json(success(products));
    } catch (err) {
      console.error('获取热门商品失败:', err);
      res.json(error(err.message || '获取热门商品失败'));
    }
  }
  
  /**
   * 获取商品分页列表（管理端）
   */
  static async getProductPage(req, res) {
    try {
      const { page: pageNum = 1, pageSize = 10 } = req.query;
      
      const result = await ProductModel.getPage(
        parseInt(pageNum),
        parseInt(pageSize)
      );
      
      res.json(page(result.records, result.total));
    } catch (err) {
      console.error('获取商品分页失败:', err);
      res.json(error(err.message || '获取商品分页失败'));
    }
  }
  
  /**
   * 添加商品（管理端）
   */
  static async addProduct(req, res) {
    try {
      const product = req.body;
      
      await ProductModel.create(product);
      
      res.json(success(null, '添加成功'));
    } catch (err) {
      console.error('添加商品失败:', err);
      res.json(error(err.message || '添加商品失败'));
    }
  }
  
  /**
   * 更新商品（管理端）
   */
  static async updateProduct(req, res) {
    try {
      const { id, ...product } = req.body;
      
      await ProductModel.update(id, product);
      
      res.json(success(null, '更新成功'));
    } catch (err) {
      console.error('更新商品失败:', err);
      res.json(error(err.message || '更新商品失败'));
    }
  }
  
  /**
   * 删除商品（管理端）
   */
  static async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      
      await ProductModel.delete(id);
      
      res.json(success(null, '删除成功'));
    } catch (err) {
      console.error('删除商品失败:', err);
      res.json(error(err.message || '删除商品失败'));
    }
  }
}

module.exports = ProductController;

