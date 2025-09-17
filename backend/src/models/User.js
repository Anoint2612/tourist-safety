const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true, index: true },
  userName: { type: String, required: true },
  userPhone: { type: String, required: true },
  role: { type: String, enum: ['tourist', 'guide'], required: true },
  userEmail: { type: String, required: true, unique: true },
  hashedPassword: { type: String, required: true }
});

UserSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.hashedPassword);
};

module.exports = mongoose.model('User', UserSchema);
