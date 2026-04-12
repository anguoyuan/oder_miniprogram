const path = require('path');
const moment = require('moment');
const { success, error } = require('../utils/response');

class FileController {
  /**
   * 上传文件
   */
  static async upload(req, res) {
    try {
      if (!req.file) {
        return res.json(error('请选择要上传的文件'));
      }
      
      const date = moment().format('YYYY/MM/DD');
      const relativePath = `/upload/${date}/${req.file.filename}`;
      
      res.json(success({
        url: `${process.env.SERVER_URL || 'http://localhost:8080'}/api${relativePath}`,
        fullUrl: `${process.env.SERVER_URL || 'http://localhost:8080'}/api${relativePath}`
      }, '上传成功'));
    } catch (err) {
      console.error('文件上传失败:', err);
      res.json(error(err.message || '文件上传失败'));
    }
  }
}

module.exports = FileController;

