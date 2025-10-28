const router = require("koa-router")();
const { koaBody } = require("koa-body");
const authMiddleware = require("../middlewares/auth");

const panelRoutes = require("./bi_opt/panel");
const bannerRoutes = require("./bi_opt/banner");
const userRoutes = require("./bi_opt/user");
const petRoutes = require("./bi_opt/pet");
const loginRoutes = require("./globals/open");
const globalRoutes = require("./globals/global");
const uploadRoutes = require("./globals/upload");
const noteRoutes = require("./bi_opt/note");
const biPetStatisticRoutes = require("./bi/petStatistic");
const biCatStatisticRoutes = require("./bi/catStatistic");
const newBiPlanStatisticRoutes = require("./newbi/planStatistic");
const newBiPetStatisticRoutes = require("./newbi/petStatistic");
const customersRoutes = require("./customers");
const taxRoutes = require("./bi_goods/tax");
const goodsRoutes = require("./bi_goods/goods");
const storeRoutes = require("./bi_goods/store");
const saleRoutes = require("./bi_goods/sale");
const shopTkRoutes = require("./shop_tk");
const scoreRoutes = require("./vip/score");
const taskRoutes = require("./vip/task");
const vipGoodsRoutes = require("./vip/goods");
const biOutSideCityRoutes = require("./bi_outside/city");
const biOutSideStoreRoutes = require("./bi_outside/store");
const biOutSideBrandRoutes = require("./bi_outside/brand");
const biOutSideCateRoutes = require("./bi_outside/cate");
const biOutSideGoodsRoutes = require("./bi_outside/goods");
const biOutSideBaseRoutes = require("./bi_outside/base");
const wechatPushRoutes = require("./wechat_push/wechat_push");
const JstStatisticRoutes = require("./statistic/order");
const WechatPushResultRoutes = require("./statistic/wechat_push_result");

//单独设置koabody
router.use(uploadRoutes.routes());
router.use(customersRoutes.routes());
router.use(taxRoutes.routes());

router.use(koaBody());
router.use(loginRoutes.routes());
router.use(globalRoutes.routes());

// 需要认证的路由
router.use(authMiddleware);
router.use(panelRoutes.routes());
router.use(bannerRoutes.routes());
router.use(userRoutes.routes());
router.use(petRoutes.routes());
router.use(noteRoutes.routes());
router.use(biPetStatisticRoutes.routes());
router.use(biCatStatisticRoutes.routes());
router.use(newBiPlanStatisticRoutes.routes());
router.use(newBiPetStatisticRoutes.routes());
router.use(goodsRoutes.routes());
router.use(storeRoutes.routes());
router.use(saleRoutes.routes());
router.use(shopTkRoutes.routes());
router.use(scoreRoutes.routes());
router.use(taskRoutes.routes());
router.use(vipGoodsRoutes.routes());
router.use(biOutSideCityRoutes.routes());
router.use(biOutSideStoreRoutes.routes());
router.use(biOutSideBrandRoutes.routes());
router.use(biOutSideCateRoutes.routes());
router.use(biOutSideGoodsRoutes.routes());
router.use(biOutSideBaseRoutes.routes());
router.use(wechatPushRoutes.routes());
router.use(JstStatisticRoutes.routes());
router.use(WechatPushResultRoutes.routes());

module.exports = router;
