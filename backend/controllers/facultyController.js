const Room = require('../models/Room');
const Channel = require('../models/Channel');
const MalpracticeEvent = require('../models/MalpracticeEvent');
const Notification = require('../models/Notification');
const User = require('../models/User');

const getFacultyChannels = async (req, res) => {
  try {
    const rooms = await Room.find({ faculty_id: req.user.id }).populate('channel_id');
    const result = rooms.map(r => ({ room: r, channel: r.channel_id }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const activateRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    if (room.faculty_id.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });
    room.status = 'active';
    room.activatedAt = new Date();
    await room.save();
    await Channel.findByIdAndUpdate(room.channel_id, { status: 'active' });
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getRoomEvents = async (req, res) => {
  try {
    const events = await MalpracticeEvent.find({ room_id: req.params.id }).sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const dismissEvent = async (req, res) => {
  try {
    const event = await MalpracticeEvent.findByIdAndUpdate(
      req.params.id,
      { status: 'dismissed', reviewed_by_faculty: true },
      { new: true }
    );
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const informAdmin = async (req, res) => {
  try {
    const event = await MalpracticeEvent.findByIdAndUpdate(
      req.params.id,
      { status: 'confirmed', informed_admin: true, reviewed_by_faculty: true },
      { new: true }
    ).populate('room_id', 'room_number').populate('faculty_id', 'name');

    const admins = await User.find({ role: 'admin' }, '_id');
    const notifications = admins.map(admin => ({
      user_id: admin._id,
      message: `Malpractice confirmed in Room ${event.room_id?.room_number} by ${event.faculty_id?.name}`,
      type: 'alert',
    }));
    await Notification.insertMany(notifications);
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getFacultyChannels, activateRoom, getRoomEvents, dismissEvent, informAdmin };
