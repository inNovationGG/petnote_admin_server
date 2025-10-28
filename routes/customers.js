const router = require("koa-router")();
const { koaBody } = require("koa-body");
const customersController = require("../controllers/customers");
const authMiddleware = require("../middlewares/auth");

router.prefix("/v1");

// 特定路由的 koa-body 中间件
const uploadKoaBody = koaBody({
  multipart: true,
  formidable: {
    multipart: true, // 是否支持 multipart-formdate 的表单
    maxFileSize: 50 * 1024 * 1024, // 设置为 50 MB
  },
  jsonLimit: "50mb", // 设置 JSON 请求体的最大大小
  formLimit: "50mb", // 设置表单请求体的最大大小
  textLimit: "50mb", // 设置文本请求体的最大大小
});

// 同步客服数据
router.post("/customers/synchro-customers-data", authMiddleware, customersController.synchroCustomersData);

// 解析有赞客户数据，匹配现有聚水潭数据库
router.post("/customers/march-customers", uploadKoaBody, authMiddleware, customersController.marchWechatWorkCustomers);

// 调用企微推送
router.post("/customers/wechat-work-push", uploadKoaBody, authMiddleware, customersController.wechatWorkPush);

// 查询企微推送客服购买情况
router.post(
  "/customers/push-customer-purchases",
  uploadKoaBody,
  authMiddleware,
  customersController.pushCustomerPurchases
);

// 上传临时素材
// router.post("/customers/media-upload", uploadKoaBody, authMiddleware, customersController.mediaUpload);

// 获取群发记录列表
router.post("/customers/getGroupMsgList", uploadKoaBody, authMiddleware, customersController.getGroupMsgList);

// 获取群发成员发送任务列表
router.post("/customers/getGroupmsgTask", uploadKoaBody, authMiddleware, customersController.getGroupmsgTask);

module.exports = router;
