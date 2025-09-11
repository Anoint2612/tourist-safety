const mongoose = require("mongoose");

const EfirSchema = new mongoose.Schema({
  filedBy: String,
  description: String,
  geoLocation: { lat: Number, lng: Number },
  status: { type: String, enum: ["pending", "verified", "sent"], default: "pending" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Efir", EfirSchema);