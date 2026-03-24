const mongoose = require('mongoose');

const malpracticeEventSchema = new mongoose.Schema({
  channel_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel', required: true },
  room_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  faculty_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  image_url: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  bounding_box: {
    x: { type: Number },
    y: { type: Number },
    width: { type: Number },
    height: { type: Number },
  },
  status: { type: String, enum: ['pending', 'dismissed', 'confirmed'], default: 'pending' },
  reviewed_by_faculty: { type: Boolean, default: false },
  informed_admin: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('MalpracticeEvent', malpracticeEventSchema);
