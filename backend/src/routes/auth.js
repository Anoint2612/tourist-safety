const router = require("express").Router();
const jwt = require("jsonwebtoken");

// Simple admin login using env vars (replace with real user DB later)
router.post("/login", (req, res) => {
  const { username, password } = req.body;
  const adminUser = process.env.ADMIN_USER || "admin";
  const adminPass = process.env.ADMIN_PASS || "adminpass";
  if (username === adminUser && password === adminPass) {
    const token = jwt.sign({ username, role: "admin" }, process.env.JWT_SECRET || "devsecret", { expiresIn: "8h" });
    res.json({ token });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

module.exports = router;