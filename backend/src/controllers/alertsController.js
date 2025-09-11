const Alert = require("../models/Alert");

exports.listAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ createdAt: -1 }).limit(100);
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: "DB error" });
  }
};

exports.createAlert = async (req, res) => {
  try {
    const a = new Alert(req.body);
    await a.save();
    res.status(201).json(a);
  } catch (err) {
    res.status(400).json({ error: "Invalid data" });
  }
};