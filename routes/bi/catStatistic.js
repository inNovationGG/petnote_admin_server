const router = require("koa-router")();
const CatController = require("../../controllers/bi/catStatistic");

const catController = new CatController();

router.post("/bi/pet/cat/useraction", catController.useraction);//猫-用户记录行为
router.post("/bi/pet/cat/noteaction", catController.noteaction);//猫-记录类型统计
router.post("/bi/pet/cat/noteactiondetail", catController.noteactiondetail);//猫-记录类型统计详情
router.get("/bi/pet/cat/notedetailexport", catController.noteacexport1);//猫-记录类型统计详情-导出(最新3000条)
router.get("/bi/pet/cat/usernotedetailexport", catController.noteacexport2);//猫-记录类型统计详情-导出(单个用户记录)
router.post("/bi/pet/cat/newweightage", catController.newweightagedetail);//猫-体重年龄分布详情
router.post("/bi/pet/cat/weightagedetail", catController.weightagedetail2);//猫-体重年龄详情
router.get("/bi/pet/cat/allweightnoteexport", catController.weightagexport1);//猫-年龄体重分布统计-详情导出(指定年龄段，指定体重区间内，所有猫咪的体重记录)
router.get("/bi/pet/cat/singleweightnoteexport", catController.weightagexport2);//用户-猫咪年龄体重分布统计-详情导出(单个猫咪体重记录)
router.post("/bi/pet/cat/weightsize", catController.weightage1);//猫-年龄体型分布详情(胖/瘦/标准)
router.post("/bi/pet/cat/stool", catController.stool);//猫-排便相关
router.post("/bi/pet/cat/urine", catController.urine);//猫-排尿相关
router.post("/bi/pet/cat/stoolurinedetail", catController.stoolurinedetail);//猫-尿便详情
router.get("/bi/pet/cat/stoolurinexport", catController.stoolurinexport1);//猫-尿便详情-导出（top3000）
router.get("/bi/pet/cat/singlestoolurinexport", catController.stoolurinexport2);//猫-尿便详情-导出（单个用户的全部记录）

module.exports = router;
