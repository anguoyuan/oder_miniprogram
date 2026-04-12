const CategoryModel = require('../models/categoryModel');
const { success, error } = require('../utils/response');

class CategoryController {
  /**
   * 获取所有分类
   */
  static async getAll(req, res) {
    try {
      const categories = await CategoryModel.getAll();
      res.json(success(categories));
    } catch (err) {
      console.error('获取分类列表失败:', err);
      res.json(error(err.message || '获取分类列表失败'));
    }
  }
  
  /**
   * 获取分类详情
   */
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const category = await CategoryModel.findById(id);
      
      if (!category) {
        return res.json(error('分类不存在'));
      }
      
      res.json(success(category));
    } catch (err) {
      console.error('获取分类详情失败:', err);
      res.json(error(err.message || '获取分类详情失败'));
    }
  }
  
  /**
   * 获取所有分类（管理端）
   */
  static async getList(req, res) {
    try {
      const categories = await CategoryModel.getList();
      res.json(success(categories));
    } catch (err) {
      console.error('获取分类列表失败:', err);
      res.json(error(err.message || '获取分类列表失败'));
    }
  }
  
  /**
   * 添加分类（管理端）
   */
  static async add(req, res) {
    try {
      const category = req.body;
      await CategoryModel.create(category);
      res.json(success(null, '添加成功'));
    } catch (err) {
      console.error('添加分类失败:', err);
      res.json(error(err.message || '添加分类失败'));
    }
  }
  
  /**
   * 更新分类（管理端）
   */
  static async update(req, res) {
    try {
      const { id, ...category } = req.body;
      await CategoryModel.update(id, category);
      res.json(success(null, '更新成功'));
    } catch (err) {
      console.error('更新分类失败:', err);
      res.json(error(err.message || '更新分类失败'));
    }
  }
  
  /**
   * 删除分类（管理端）
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;
      await CategoryModel.delete(id);
      res.json(success(null, '删除成功'));
    } catch (err) {
      console.error('删除分类失败:', err);
      res.json(error(err.message || '删除分类失败'));
    }
  }
}

module.exports = CategoryController;

