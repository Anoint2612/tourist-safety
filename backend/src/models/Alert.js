const mongoose = require("mongoose");

const AlertSchema = new mongoose.Schema({
  type: String,
  severity: String,
  message: String,
  geoLocation: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], default: [0, 0] } // [lng, lat]
  },
  // Assignment fields
  assigned_station_id: { type: String, default: null },
  assigned_station_name: { type: String, default: null },
  is_resolved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Alert", AlertSchema);