
const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const controller = require("../controllers/chat.controller");

router.use(auth);

router.get("/", controller.chats);
router.get("/:userId/messages", controller.history);

module.exports = router;
