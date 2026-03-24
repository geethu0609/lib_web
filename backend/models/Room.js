const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  channel_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel', required: true },
  room_number: { type: String, required: true },
  faculty_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['inactive', 'active'], default: 'inactive' },
  activatedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
