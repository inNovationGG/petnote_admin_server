const router = require("koa-router")();
const { koaBody } = require("koa-body");
const TaxController = require("../../controllers/bi_goods/tax");
const authMiddleware = require("../../middlewares/auth");
const path = require("path");
const uploadFilePath = path.resolve(__dirname, "../../", `uploads`);

// 特定路由的 koa-body 中间件
const uploadKoaBody = koaBody({
    multipart: true,
    formidable: {
        multipart: true, // 是否支持 multipart-formdate 的表单
        maxFileSize: 100 * 1024 * 1024, // 设置为 100 MB
        uploadDir: uploadFilePath, // 存储临时文件的目录
        keepExtensions: true, //是否保持文件原始扩展名
    },
    jsonLimit: "100mb", // 设置 JSON 请求体的最大大小
    formLimit: "100mb", // 设置表单请求体的最大大小
    textLimit: "100mb", // 设置文本请求体的最大大小
});

const taxController = new TaxController();

router.post("/bi/goods/uploadtax", uploadKoaBody, authMiddleware, taxController.uploadtax); //上传含税成本数据Excel并存入shop_tk库中的tax表

module.exports = router;
