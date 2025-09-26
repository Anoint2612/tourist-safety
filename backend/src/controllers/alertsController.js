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

exports.assignAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const { station_id, station_name } = req.body;
    if (!station_id || !station_name) {
      return res.status(400).json({ error: "station_id and station_name are required" });
    }
    const updated = await Alert.findByIdAndUpdate(
      id,
      { $set: { assigned_station_id: station_id, assigned_station_name: station_name } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Alert not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to assign alert" });
  }
};