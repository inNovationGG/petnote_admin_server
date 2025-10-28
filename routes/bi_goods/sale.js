const router = require("koa-router")();
const SaleController = require("../../controllers/bi_goods/sale");

const saleController = new SaleController();

router.post("/bi/sale/lists", saleController.getLists); //分页查询小程序销售报表
router.post("/bi/sale/export", saleController.export); //导出小程序报表
router.post("/bi/sale/discovery", saleController.discovery); //数据恢复（tax表可能会上传失败，待重新上传tax数据成功后，调用此接口进行数据恢复）

module.exports = router;
