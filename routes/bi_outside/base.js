const router = require("koa-router")();
const BaseController = require("../../controllers/bi_outside/base");

const baseController = new BaseController();

router.post("/bi_outside/base/city", baseController.createMiddleware('getCitys')); //城市列表
router.post("/bi_outside/base/store", baseController.createMiddleware('getStores')); //分仓列表
router.post("/bi_outside/base/channel", baseController.createMiddleware('getChannels')); //销售渠道列表
router.post("/bi_outside/base/brand", baseController.createMiddleware('getBrands')); //品牌列表
router.post("/bi_outside/base/fcate", baseController.createMiddleware('getFcates')); //一级品类列表
router.post("/bi_outside/base/scate", baseController.createMiddleware('getScates')); //二级品类列表
router.post("/bi_outside/base/tcate", baseController.createMiddleware('getTcates')); //三级品类列表

module.exports = router;
