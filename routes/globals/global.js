const router = require("koa-router")();
const GlobalController = require("../../controllers/globals/global");

const globalController = new GlobalController();

router.post("/globals/areas", globalController.getAreas);
router.post("/globals/actlog", globalController.addActionLog);
router.post("/globals/permission", globalController.getPermission);

module.exports = router;
