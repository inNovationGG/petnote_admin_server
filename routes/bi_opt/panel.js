const router = require("koa-router")();
const PanelController = require("../../controllers/bi_opt/panel");

const panelController = new PanelController();

router.post("/bi_opt/panel/dailynew", panelController.getDailyNew);
router.post("/bi_opt/panel/activity", panelController.getActivity);
router.post("/bi_opt/panel/wholestat", panelController.getWholestat);

module.exports = router;
