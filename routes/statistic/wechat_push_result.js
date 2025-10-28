const router = require("koa-router")();
const WechatPushResultController = require("../../controllers/statistic/wechat_push_result");

const wechatPushResultController = new WechatPushResultController();

router.post("/statistic/wechat/pushresult", wechatPushResultController.createMiddleware('getWechatPushResult')); //分析精准推送结果

module.exports = router;
