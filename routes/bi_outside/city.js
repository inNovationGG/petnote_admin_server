const router = require("koa-router")();
const CityController = require("../../controllers/bi_outside/city");

const cityController = new CityController();

router.post("/bi_outside/city/lists", cityController.createMiddleware('getLists')); //城市报表查询
router.post("/bi_outside/city/citytype", cityController.createMiddleware('getCityType')); //城市类型
router.post("/bi_outside/city/export", cityController.createMiddleware('exportData')); //导出报表

module.exports = router;
