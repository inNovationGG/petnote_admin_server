const router = require("koa-router")();
const PetController = require("../../controllers/bi_opt/pet");

const petController = new PetController();

//宠物信息管理
router.post("/bi_opt/pet/lists", petController.createMiddleware('petLists'));
router.post("/bi_opt/pet/del", petController.createMiddleware('delPet'));
router.post("/bi_opt/pet/delrecover", petController.createMiddleware('petDeletedRecover'));
router.post("/bi_opt/pet/edit", petController.createMiddleware('petEdit'));
router.post("/bi_opt/pet/info", petController.createMiddleware('petInfo'));
router.post("/bi_opt/pet/recover", petController.createMiddleware('petDieRecover'));
//宠物品种管理
router.post("/bi_opt/pet/cate/add", petController.createMiddleware('editPetCate'));
router.post("/bi_opt/pet/cate/edit", petController.createMiddleware('editPetCate'));
router.post("/bi_opt/pet/cate/info", petController.createMiddleware('getPetCateInfo'));
router.post("/bi_opt/pet/cate/lists", petController.createMiddleware('petCateLists'));
router.post("/bi_opt/pet/cate/refresh", petController.createMiddleware('petRedisDel'));
//移除共养关系
router.post("/bi_opt/pet/friend/remove", petController.createMiddleware('remove'));

module.exports = router;
