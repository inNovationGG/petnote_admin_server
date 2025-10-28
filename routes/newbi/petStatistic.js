const router = require("koa-router")();
const PetStatisticController = require("../../controllers/newbi/petStatistic");

const petStatisticController = new PetStatisticController();

//如果直接将petStatisticController.operationstatistic传递给路由处理器，
//会将该方法当作普通函数执行，而不是类的实例方法，因此会丢失方法内部的this指向，导致严格模式下是undefined
//解决办法：创建一个中间件函数，在其中绑定this的指向为类的实例
router.post("/v1/bi/petnote/operationstat", petStatisticController.createMiddleware("operationStatistic"));//宠本本运营数据
router.post("/v1/bi/petnote/operationstatexport", petStatisticController.createMiddleware("operationStatisticExport"));//宠本本运营数据-导出
router.post("/v1/bi/petnote/useralive", petStatisticController.createMiddleware("userAlive"));//宠本本用户留存
router.post("/v1/bi/petnote/useraliveexport", petStatisticController.createMiddleware("userAliveExport"));//宠本本用户留存-导出

module.exports = router;
