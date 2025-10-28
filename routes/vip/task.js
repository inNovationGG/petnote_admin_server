const router = require("koa-router")();
const TaskController = require("../../controllers/vip/task");

const taskController = new TaskController();

router.post("/vip/task/create", taskController.createMiddleware('createTask')); //新增任务
router.post("/vip/task/edit", taskController.createMiddleware('editTask')); //编辑任务
router.post("/vip/task/delete", taskController.createMiddleware('deleteTask')); //删除任务
router.post("/vip/task/createticket", taskController.createMiddleware('createSurpriseTicket')); //新增惊喜奖励
router.post("/vip/task/editticket", taskController.createMiddleware('editSurpriseTicket')); //编辑惊喜奖励
router.post("/vip/task/createlotterytext", taskController.createMiddleware('createLotteryText')); //新增签运文案
router.post("/vip/task/editlotterytext", taskController.createMiddleware('editLotteryText')); //编辑签运文案
router.post("/vip/task/dellotterytext", taskController.createMiddleware('delLotteryText')); //删除签运文案
router.post("/vip/task/consumerule", taskController.createMiddleware('getConsumeRule')); //查看消费送积分规则
router.post("/vip/task/newuserrule", taskController.createMiddleware('getNewUserRule')); //查看新用户任务规则
router.post("/vip/task/dailyrule", taskController.createMiddleware('getDailyRule')); //查看每日任务规则
router.post("/vip/task/signrule", taskController.createMiddleware('getSignRule')); //查看连续打卡设置
router.post("/vip/task/surpriserule", taskController.createMiddleware('getSurpriseRule')); //查看惊喜奖励设置
router.post("/vip/task/lotterytext", taskController.createMiddleware('getLotteryText')); //查看抽签文案设置
router.post("/vip/task/scorelimit", taskController.createMiddleware('getScoreLimit')); //查看每日获取积分上限
router.post("/vip/task/collecttext", taskController.createMiddleware('getCollectText')); //查看屯罐计划玩法规则
router.post("/vip/task/lotterytype", taskController.createMiddleware('getLotteryType')); //查看所有签运类型

module.exports = router;
