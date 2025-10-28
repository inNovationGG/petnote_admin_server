const router = require("koa-router")();
const StoreController = require("../../controllers/bi_outside/store");

const storeController = new StoreController();

router.post("/bi_outside/store/lists", storeController.createMiddleware('getLists')); //分仓报表查询
router.post("/bi_outside/store/export", storeController.createMiddleware('exportData')); //导出报表

module.exports = router;
