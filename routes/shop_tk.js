const router = require("koa-router")();
const shopTkController = require("../controllers/shop_tk");

router.prefix("/v1");

// 聚水潭库存查询
router.post("/jst/wms-stock", shopTkController.getWmsStock);

module.exports = router;
