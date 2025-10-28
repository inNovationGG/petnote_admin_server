const router = require("koa-router")();
const BrandController = require("../../controllers/bi_outside/brand");

const brandController = new BrandController();

router.post("/bi_outside/brand/lists", brandController.createMiddleware('getLists')); //分品牌报表查询
router.post("/bi_outside/brand/export", brandController.createMiddleware('exportData')); //导出报表

module.exports = router;
