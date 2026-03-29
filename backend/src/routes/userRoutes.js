const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const { getUsers, createUser, getDownline, addCoins, grantVIP } = require("../controllers/userController");

router.get("/",          auth, getUsers);
router.get("/downline",  auth, getDownline);
router.post("/create",   auth, createUser);
router.post("/coins",    auth, requireRole(["ADMIN"]), addCoins);
router.post("/vip",      auth, requireRole(["ADMIN"]), grantVIP);

module.exports = router;
