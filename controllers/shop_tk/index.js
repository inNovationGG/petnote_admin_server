const warehousesService = require("../../services/warehousesService");

/**
 * 同步客服数据
 * @param {Object} ctx - Koa context
 */
const getWmsStock = async (ctx) => {
  const result = await warehousesService.getWmsStock();

  if (result.error) {
    ctx.status = 500;
  } else {
    ctx.status = result.success ? 200 : 400;
  }
  ctx.body = result;
};

module.exports = {
  getWmsStock,
};
