const router = require("koa-router")();
const StoreController = require("../../controllers/bi_goods/store");

const storeController = new StoreController();

router.post("/bi/store/lists", storeController.getLists); //分页查询商品分仓库存报表
router.post("/bi/store/export", storeController.export); //导出商品分仓库存报表

module.exports = router;
