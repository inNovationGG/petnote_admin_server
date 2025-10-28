const router = require("koa-router")();
const GoodsController = require("../../controllers/vip/goods");

const goodsController = new GoodsController();

router.post("/vip/goods/create", goodsController.createMiddleware('createGoods')); //新增商品
router.post("/vip/goods/edit", goodsController.createMiddleware('editGoods')); //编辑商品
router.post("/vip/goods/editstatus", goodsController.createMiddleware('editStatus')); //商品上架/下架
router.post("/vip/goods/lists", goodsController.createMiddleware('getGoodsList')); //商品分页查询
router.post("/vip/goods/info", goodsController.createMiddleware('getGoodsInfo')); //查看商品详情
router.post("/vip/goodscate/create", goodsController.createMiddleware('createGoodsCate')); //新增商品分类
router.post("/vip/goods/getallgoods", goodsController.createMiddleware('getAllGoods')); //获取所有商品
router.post("/vip/goods/validatesort", goodsController.createMiddleware('validateSort')); //校验商品的sort
router.post("/vip/goods/tickets", goodsController.createMiddleware('getRealTickets')); //查询有赞优惠券列表

module.exports = router;
