const mongoose = require('mongoose');

const GeoLocationSchema = new mongoose.Schema({
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  // optional extra data (e.g., nearestCity) can be stored if available
  nearestCity: { type: String }
}, { _id: false });

const EfirSchema = new mongoose.Schema({
  filedBy: { type: String, required: true },
  description: { type: String, required: true },
  phone: { type: String, required: true },
  touristId: { type: String, required: true, index: true },
  geoLocation: { type: GeoLocationSchema, required: true },
  assignedInspector: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'Inspector' },
    name: { type: String }
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'assigned', 'sent', 'rejected'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Efir', EfirSchema);
