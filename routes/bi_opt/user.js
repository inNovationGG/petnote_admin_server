const router = require("koa-router")();
const UserController = require("../../controllers/bi_opt/user");

const userController = new UserController();

router.post("/bi_opt/user/lists", userController.userSearchList);
router.post("/bi_opt/user/info", userController.userPetInfo);
router.post("/bi_opt/user/edit", userController.userEdit);

module.exports = router;
