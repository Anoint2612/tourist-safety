const Inspector = require('../models/Inspector');
const mongoose = require('mongoose');

exports.listAvailable = async (req, res) => {
  try {
    const { available } = req.query;
    let filter = {};
    if (available === 'true') {
      // Show only available inspectors; include docs without the flag as available
      filter = { $or: [ { isAvailable: true }, { isAvailable: { $exists: false } } ] };
    }
    let items = await Inspector.find(filter).sort({ name: 1 });
    console.log('[inspectors] found via Mongoose:', items?.length || 0);
    if (!items || items.length === 0) {
      // Fallback: in case collection name differs (e.g., 'Inspector')
      const alt = await mongoose.connection.db.collection('inspectors').find(filter).sort({ name: 1 }).toArray();
      console.log('[inspectors] found via native collection("Inspector"):', alt?.length || 0);
      items = alt || [];
    }
    res.json(items);
  } catch (err) {
    console.error('Error fetching inspectors:', err);
    res.status(500).json({ error: 'Failed to fetch inspectors' });
  }
};


