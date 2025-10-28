const router = require("koa-router")();
const PlanStatisticController = require("../../controllers/newbi/planStatistic");

const planStatisticController = new PlanStatisticController();

router.post("/v1/bi/petplan/operationstat", planStatisticController.createMiddleware("operationStatistic"));//宠本本plan运营数据统计
router.post("/v1/bi/petplan/operationstatexport", planStatisticController.createMiddleware("operationStatisticExport"));//宠本本plan运营数据统计-导出
router.post("/v1/bi/petplan/subjectexiststat", planStatisticController.createMiddleware("subjectExistStatistic"));//宠本本plan答题退出情况数据统计
router.post("/v1/bi/petplan/subjectexiststatexport", planStatisticController.createMiddleware("subjectExistStatisticExport"));//宠本本plan答题退出情况数据统计-导出
router.post("/v1/bi/petplan/reportdetail", planStatisticController.createMiddleware("reportDetail"));//宠本本plan答题具体数据统计
router.post("/v1/bi/petplan/reportdetailexport", planStatisticController.createMiddleware("reportDetailExport"));//宠本本plan答题具体数据统计-导出
router.post("/v1/bi/petplan/eatDetail", planStatisticController.createMiddleware("eatDetail"));//宠本本plan饮食数据统计
router.post("/v1/bi/petplan/eatDetailexport", planStatisticController.createMiddleware("eatDetailExport"));//宠本本plan饮食数据统计-导出

module.exports = router;
