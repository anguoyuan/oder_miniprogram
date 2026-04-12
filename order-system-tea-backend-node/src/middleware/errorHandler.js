/**
 * 全局错误处理中间件
 */

const errorHandler = (err, req, res, next) => {
  console.error('服务器错误:', err);
  
  // 如果是已知的业务错误
  if (err.message) {
    return res.status(500).json({
      code: 500,
      message: err.message,
      data: null
    });
  }
  
  // 未知错误
  res.status(500).json({
    code: 500,
    message: '服务器内部错误',
    data: null
  });
};

module.exports = errorHandler;

