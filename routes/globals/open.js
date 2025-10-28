const router = require("koa-router")();
const OpenController = require("../../controllers/globals/open");

const openController = new OpenController();

router.post("/open/login", openController.login);
router.post("/open/register", openController.register);

module.exports = router;
