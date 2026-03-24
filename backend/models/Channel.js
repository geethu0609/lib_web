const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema({
  exam_name: { type: String, required: true },
  date: { type: Date, required: true },
  start_time: { type: String, required: true },
  end_time: { type: String, required: true },
  status: { type: String, enum: ['inactive', 'active', 'completed'], default: 'inactive' },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Channel', channelSchema);
