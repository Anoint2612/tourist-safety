const Efir = require("../models/Efir");

exports.listPending = async (req, res) => {
  try {
    const items = await Efir.find({ status: "pending" }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "DB error" });
  }
};

exports.verify = async (req, res) => {
  try {
    const id = req.params.id;
    const item = await Efir.findByIdAndUpdate(id, { status: "verified" }, { new: true });
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: "Invalid request" });
  }
};