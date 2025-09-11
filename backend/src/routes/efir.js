const router = require("express").Router();
const ctrl = require("../controllers/efirController");
const auth = require("../middleware/auth");

router.get("/pending", auth, ctrl.listPending);
router.post("/verify/:id", auth, ctrl.verify);

module.exports = router;