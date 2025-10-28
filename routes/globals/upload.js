const router = require("koa-router")();
const GlobalController = require("../../controllers/globals/global");
const { koaBody } = require("koa-body");
const authMiddleware = require("../../middlewares/auth");

const globalController = new GlobalController();

// 特定路由的 koa-body 中间件
const uploadKoaBody = koaBody({
  multipart: true,
  formidable: {
    maxFileSize: 50 * 1024 * 1024, // 设置为 50 MB，之前上传使用的 base64，会增大载荷，TODO: 后期采用 file 文件上传
  },
  jsonLimit: "50mb", // 设置 JSON 请求体的最大大小
  formLimit: "50mb", // 设置表单请求体的最大大小
  textLimit: "50mb", // 设置文本请求体的最大大小
});

router.post("/globals/ossupload", uploadKoaBody, authMiddleware, globalController.uploadImg);

module.exports = router;
