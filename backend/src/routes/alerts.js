const router = require("express").Router();
const ctrl = require("../controllers/alertsController");
const auth = require("../middleware/auth");

// In non-production environments, bypass auth for easier testing
const requireAuth = process.env.NODE_ENV === "production" ? auth : (req, res, next) => next();

router.get("/", ctrl.listAlerts);
router.post("/", requireAuth, ctrl.createAlert);
router.put("/:id/assign", requireAuth, ctrl.assignAlert);

module.exports = router;