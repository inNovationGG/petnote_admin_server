const router = require("koa-router")();
const JstOrderStatisticController = require("../../controllers/statistic/jst_order");

const jstOrderStatisticController = new JstOrderStatisticController();

router.post("/statistic/addmtphone", jstOrderStatisticController.createMiddleware('addMtPhoneField')); //补全美团手机号字段
router.post("/statistic/newuser/ordercount", jstOrderStatisticController.createMiddleware('getMtOrderCount')); //统计不同渠道的新用户订单数
// router.post("/statistic/newuser/saleamount", jstOrderStatisticController.createMiddleware('')); //统计不同渠道的新用户销售额
// router.post("/statistic/newuser/store/ordercount", jstOrderStatisticController.createMiddleware('')); //统计不同渠道的新用户的分仓订单数
// router.post("/statistic/newuser/store/saleamount", jstOrderStatisticController.createMiddleware('')); //统计不同渠道的新用户的分仓销售额
router.post("/statistic/newuser/orderDetail", jstOrderStatisticController.createMiddleware('getMtOrderDetail')); //统计美团新用户复购订单明细

module.exports = router;
