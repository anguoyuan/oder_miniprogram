/**
 * 分页参数处理工具
 * 解决MySQL LIMIT/OFFSET 参数类型兼容性问题
 */

/**
 * 确保参数是整数类型
 * @param {*} value - 要转换的值
 * @param {number} defaultValue - 默认值
 * @returns {number} 整数
 */
function ensureInteger(value, defaultValue = 0) {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }
  
  const num = parseInt(value, 10);
  
  if (isNaN(num)) {
    return defaultValue;
  }
  
  return num;
}

/**
 * 标准化分页参数
 * @param {*} page - 页码（可能是字符串或数字）
 * @param {*} pageSize - 每页数量（可能是字符串或数字）
 * @returns {{page: number, pageSize: number, offset: number, limit: number}}
 */
function normalizePagination(page, pageSize) {
  // 确保是整数类型
  const pageInt = ensureInteger(page, 1);
  const pageSizeInt = ensureInteger(pageSize, 10);
  
  // 限制范围
  const safePage = Math.max(1, pageInt); // 最小为1
  const safePageSize = Math.min(Math.max(1, pageSizeInt), 100); // 1-100之间
  
  // 计算 offset
  const offset = (safePage - 1) * safePageSize;
  
  return {
    page: safePage,
    pageSize: safePageSize,
    offset: offset,
    limit: safePageSize
  };
}

module.exports = {
  ensureInteger,
  normalizePagination
};

