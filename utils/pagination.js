/**
 * 转换分页数据对象
 * @param {Object} param0 - 分页数据对象
 * @param {number} param0.total - 总记录数
 * @param {number} param0.page - 当前页码
 * @param {number} param0.limit - 每页记录数
 * @param {number} param0.pages - 总页数
 * @returns {Object} 格式化后的分页数据对象
 */
const formatPagination = ({ total, page, limit, pages }) => {
  return {
    totalCount: total,
    totalPage: pages,
    currentPage: parseInt(page, 10),
    currentPageSize: limit,
  };
};

module.exports = {
  formatPagination,
};
