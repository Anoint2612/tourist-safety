const router = require("express").Router();
const ctrl = require("../controllers/alertsController");
const auth = require("../middleware/auth");

router.get("/", ctrl.listAlerts);
router.post("/", auth, ctrl.createAlert);

module.exports = router;