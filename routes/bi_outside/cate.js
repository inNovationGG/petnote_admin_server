const router = require("koa-router")();
const CateController = require("../../controllers/bi_outside/cate");

const cateController = new CateController();

router.post("/bi_outside/cate/lists", cateController.createMiddleware('getLists')); //分品类报表查询
router.post("/bi_outside/cate/export", cateController.createMiddleware('exportData')); //导出报表

module.exports = router;
