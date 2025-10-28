const wechatWorkService = require("../../services/wechatWorkService");

/**
 * 同步客服数据
 * @param {Object} ctx - Koa context
 */
const synchroCustomersData = async (ctx) => {
  const result = await wechatWorkService.synchroCustomersData();

  if (result.error) {
    ctx.status = 500;
  } else {
    ctx.status = result.success ? 200 : 400;
  }
  ctx.body = result;
};

/**
 * 解析有赞文件解析客户数据，匹配现有聚水潭数据库
 * @param {Object} ctx - Koa context
 */
const marchWechatWorkCustomers = async (ctx) => {
  const { files } = ctx.request;
  const result = await wechatWorkService.marchWechatWorkCustomers(files);

  if (result.error) {
    ctx.status = 500;
  } else {
    ctx.status = result.success ? 200 : 400;
  }
  ctx.body = result;
};

/**
 * 解析有赞文件解析客户数据，匹配现有聚水潭数据库
 * @param {Object} ctx - Koa context
 */
const wechatWorkPush = async (ctx) => {
  const { files } = ctx.request;
  const result = await wechatWorkService.wechatWorkPush(files);

  if (result.error) {
    ctx.status = 500;
  } else {
    ctx.status = result.success ? 200 : 400;
  }
  ctx.body = result;
};

/**
 * 解析有赞文件解析客户数据，匹配现有聚水潭数据库
 * @param {Object} ctx - Koa context
 */
const mediaUpload = async (ctx) => {
  const { files } = ctx.request;
  const result = await wechatWorkService.mediaUpload(files);

  if (result.error) {
    ctx.status = 500;
  } else {
    ctx.status = result.success ? 200 : 400;
  }
  ctx.body = result;
};

/**
 * 查询企微推送客服购买情况
 * @param {Object} ctx - Koa context
 */
const pushCustomerPurchases = async (ctx) => {
  const { userIds, start, end } = ctx.request.body;
  const result = await wechatWorkService.pushCustomerPurchases({ userIds, start, end });

  if (result.error) {
    ctx.status = 500;
  } else {
    ctx.status = result.success ? 200 : 400;
  }
  ctx.body = result;
};

/**
 * 获取群发记录列表
 * @param {Object} ctx - Koa context
 */
const getGroupMsgList = async (ctx) => {
  const { startTime, endTime } = ctx.request.body || {};
  const result = await wechatWorkService.getGroupMsgList(startTime, endTime);
  if (result.error) {
    ctx.status = 500;
  } else {
    ctx.status = result.success ? 200 : 400;
  }
  ctx.body = result;
};

/**
 * 获取群发成员发送任务列表
 * @param {Object} ctx - Koa context
 */
const getGroupmsgTask = async (ctx) => {
  const { msgid } = ctx.request.body || {};
  const result = await wechatWorkService.getGroupmsgTask(msgid);
  if (result.error) {
    ctx.status = 500;
  } else {
    ctx.status = result.success ? 200 : 400;
  }
  ctx.body = result;
};

module.exports = {
  synchroCustomersData,
  marchWechatWorkCustomers,
  wechatWorkPush,
  mediaUpload,
  pushCustomerPurchases,
  getGroupMsgList,
  getGroupmsgTask,
};
