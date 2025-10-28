const router = require("koa-router")();
const NoteController = require("../../controllers/bi_opt/note");

const noteController = new NoteController();

router.post("/bi_opt/note/auditlists", noteController.createMiddleware('getAuditNoteList'));
router.post("/bi_opt/note/auditstatus", noteController.createMiddleware('auditStatus'));
router.post("/bi_opt/note/info", noteController.createMiddleware('getAuditNote'));
router.post("/bi_opt/note/auditnext", noteController.createMiddleware('auditNext'));
router.post("/bi_opt/note/reviewlists", noteController.createMiddleware('getReviewNoteList'));
router.post("/bi_opt/note/reviewstatus", noteController.createMiddleware('reviewStatus'));

module.exports = router;
