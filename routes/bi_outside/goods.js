const router = require("koa-router")();
const GoodsController = require("../../controllers/bi_outside/goods");

const goodsController = new GoodsController();

router.post("/bi_outside/goods/lists", goodsController.createMiddleware('getLists')); //分品报表查询
router.post("/bi_outside/goods/export", goodsController.createMiddleware('exportData')); //导出报表

module.exports = router;
