const router = require("koa-router")();
const ScoreController = require("../../controllers/vip/score");

const scoreController = new ScoreController();

router.post("/vip/score/lists", scoreController.createMiddleware('getScoreList')); //积分管理列表分页查询
router.post("/vip/score/edit", scoreController.createMiddleware('updateScore')); //管理员调整积分
router.post("/vip/score/validateuserbyphone", scoreController.createMiddleware('validateUserByPhone')); //根据手机号验证用户是否存在

module.exports = router;
