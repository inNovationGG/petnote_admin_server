const router = require("koa-router")();
const StatController = require("../../controllers/bi/petStatistic");

const statController = new StatController();

router.post("/bi/pet/daily/stat", statController.dailyStat);//每日数据统计
router.post("/bi/pet/rootcate", statController.getCate1);//宠物品种大类统计
router.post("/bi/pet/childcate", statController.getCate2);//宠物品种小类统计
router.post("/bi/pet/homedaystat", statController.home1);//宠物到家统计
router.post("/bi/pet/homeagestat", statController.home2);//宠物到家年龄统计
router.post("/bi/pet/usercat", statController.usercat);//用户名下猫数量统计
router.post("/bi/pet/userdog", statController.userdog);//用户名下狗数量统计
router.post("/bi/pet/userphone", statController.userphone);//用户手机号授权统计
router.post("/bi/pet/userarea", statController.userarea);//用户地区分布统计
router.post("/bi/pet/info", statController.petinfo);//查询详细宠物信息
router.get("/bi/pet/infoexport", statController.infoexport);//导出某个宠物的记录数据


module.exports = router;
