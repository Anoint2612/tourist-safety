const Efir = require("../models/Efir");
const mongoose = require("mongoose");
const { generateNortheastIndiaCoordinates, generateTouristAreaCoordinates } = require('../utils/geoUtils');

// List all pending EFIRs
exports.listPending = async (req, res) => {
  try {
    const items = await Efir.find({ status: { $in: ["pending", "verified", "assigned", "sent"] } }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error("Error fetching pending EFIRs:", err);
    res.status(500).json({ error: "An error occurred while fetching pending EFIRs." });
  }
};

// Verify an EFIR by ID
exports.verify = async (req, res) => {
  try {
    const id = req.params.id;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid EFIR ID." });
    }

    const item = await Efir.findByIdAndUpdate(id, { status: "verified" }, { new: true });
    if (!item) {
      return res.status(404).json({ error: "EFIR not found." });
    }

    res.json(item);
  } catch (err) {
    console.error("Error verifying EFIR:", err);
    res.status(500).json({ error: "An error occurred while verifying the EFIR." });
  }
};

// Assign an inspector to an EFIR and mark as assigned
exports.assign = async (req, res) => {
  try {
    const id = req.params.id;
    const { inspectorId, inspectorName } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid EFIR ID." });
    }
    if (!inspectorId || !mongoose.Types.ObjectId.isValid(inspectorId)) {
      return res.status(400).json({ error: "Valid inspectorId is required." });
    }

    const item = await Efir.findByIdAndUpdate(
      id,
      { status: "assigned", assignedInspector: { id: inspectorId, name: inspectorName } },
      { new: true }
    );
    if (!item) {
      return res.status(404).json({ error: "EFIR not found." });
    }
    res.json(item);
  } catch (err) {
    console.error("Error assigning inspector:", err);
    res.status(500).json({ error: "An error occurred while assigning the inspector." });
  }
};

// Send a copy of the EFIR via SMS (Twilio) and mark as sent
exports.sendCopy = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid EFIR ID." });
    }

    const efir = await Efir.findById(id);
    if (!efir) {
      return res.status(404).json({ error: "EFIR not found." });
    }

    const oldStatus = efir.status;

    // Ensure we have a phone number to notify
    if (!efir.phone) {
      return res.status(400).json({ error: "EFIR does not have a phone number to notify." });
    }

    // Optional: ensure an inspector is assigned before sending
    const assignedName = efir.assignedInspector?.name || "Assigned Officer";

    // Generate a temporary human-friendly EFIR number for SMS (not persisted)
    const efirNumber = `EF-${Date.now().toString(36).toUpperCase()}`;

    // Update status to sent
    efir.status = 'sent';
    const updated = await efir.save();

    // Send SMS notification using Twilio service (best-effort)
    let smsResult = null;
    try {
      const smsService = require('../services/smsService');
      const info = `EFIR No: ${efirNumber}\nInspector: ${assignedName}`;
      smsResult = await smsService.sendStatusUpdateMessage(efir.phone, efir._id, oldStatus, updated.status, info);
      console.log('SMS result:', smsResult);
    } catch (smsErr) {
      console.error('Failed to send SMS notification:', smsErr);
      // Do not fail the request if SMS fails; return updated EFIR
    }

    res.json({ ...updated.toObject(), smsResult });
  } catch (err) {
    console.error("Error sending EFIR copy:", err);
    res.status(500).json({ error: "An error occurred while sending the EFIR copy." });
  }
};

// Reject (delete) an EFIR by ID
exports.reject = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid EFIR ID." });
    }
    const item = await Efir.findByIdAndDelete(id);
    if (!item) {
      return res.status(404).json({ error: "EFIR not found." });
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Error rejecting EFIR:", err);
    res.status(500).json({ error: "An error occurred while rejecting the EFIR." });
  }
};

// Create EFIR (allows tourists to file reports)
exports.createEfir = async (req, res) => {
  try {
    const { filedBy, description, phone, useRandomLocation = true } = req.body;
    if (!filedBy || !description || !phone) {
      return res.status(400).json({ error: 'filedBy, description and phone are required' });
    }

    const geoLocation = useRandomLocation
      ? generateTouristAreaCoordinates()
      : (req.body.geoLocation || generateTouristAreaCoordinates());

    const touristId = 'T' + Date.now().toString(36) + Math.random().toString(36).slice(2, 9).toUpperCase();

    const newEfir = new Efir({
      filedBy,
      description,
      phone,
      touristId,
      geoLocation: {
        latitude: geoLocation.latitude,
        longitude: geoLocation.longitude,
        nearestCity: geoLocation.nearestCity
      },
      status: 'pending'
    });

    const saved = await newEfir.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('Error creating EFIR:', err);
    res.status(500).json({ error: 'Failed to create EFIR' });
  }
};