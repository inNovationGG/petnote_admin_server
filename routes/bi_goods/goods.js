const router = require("koa-router")();
const GoodsController = require("../../controllers/bi_goods/goods");

const goodsController = new GoodsController();

router.post("/bi/goods/lists", goodsController.getLists); //分页查询商品销售报表
router.post("/bi/goods/city", goodsController.getCitys); //查询城市
router.post("/bi/goods/store", goodsController.getStores); //查询分仓
router.post("/bi/goods/channel", goodsController.getSaleChannel); //查询销售渠道
router.post("/bi/goods/brand", goodsController.getBrands); //查询品牌
router.post("/bi/goods/cate", goodsController.getCates); //查询分类
router.post("/bi/goods/export", goodsController.export); //导出商品销售报表

module.exports = router;
