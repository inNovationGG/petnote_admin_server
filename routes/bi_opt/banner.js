const router = require("koa-router")();
const BannerController = require("../../controllers/bi_opt/banner");

const bannerController = new BannerController();

router.post("/bi_opt/banner/lists", bannerController.getLists);
router.post("/bi_opt/banner/del", bannerController.delInfo);
router.post("/bi_opt/banner/edit", bannerController.createOrUpdateBanner);
router.post("/bi_opt/banner/info", bannerController.getInfo);
router.post("/bi_opt/banner/status", bannerController.updateStatusById);

module.exports = router;
