
const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const controller = require("../controllers/friends.controller");

router.use(auth);

router.get("/users", controller.users);
router.get("/", controller.friends);
router.get("/getFriendRequests", controller.requests);
router.post("/sendFriendRequest", controller.sendRequest);
router.patch("/requests/:id", controller.respond);

module.exports = router;
