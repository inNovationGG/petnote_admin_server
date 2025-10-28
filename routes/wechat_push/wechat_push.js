const router = require("koa-router")();
const WechatPushController = require("../../controllers/wechat_push/wechat_push");

const wechatPushController = new WechatPushController();

router.post("/wechatpush/create", wechatPushController.createMiddleware('createWechatPush')); //新增精准推送
router.post("/wechatpush/edit", wechatPushController.createMiddleware('editWechatPush')); //编辑精准推送
router.post("/wechatpush/editstatus", wechatPushController.createMiddleware('editStatus')); //编辑生效状态
router.post("/wechatpush/lists", wechatPushController.createMiddleware('getWechatPushList')); //精准推送分页查询
router.post("/wechatpush/info", wechatPushController.createMiddleware('getWechatPushInfo')); //查看精准推送详情
router.post("/wechatpush/labels", wechatPushController.createMiddleware('getLabels')); //查看标签

module.exports = router;
