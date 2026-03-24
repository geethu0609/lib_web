const Channel = require('../models/Channel');
const Room = require('../models/Room');
const Notification = require('../models/Notification');
const MalpracticeEvent = require('../models/MalpracticeEvent');
const User = require('../models/User');

const createChannel = async (req, res) => {
  try {
    const channel = await Channel.create({ ...req.body, created_by: req.user.id });
    res.status(201).json(channel);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addRooms = async (req, res) => {
  const { rooms } = req.body;
  try {
    const channel = await Channel.findById(req.params.id);
    if (!channel) return res.status(404).json({ message: 'Channel not found' });

    const created = await Room.insertMany(rooms.map(r => ({ ...r, channel_id: req.params.id })));

    const notifications = created.map(room => ({
      user_id: room.faculty_id,
      message: `You have been assigned to Room ${room.room_number} for exam: ${channel.exam_name} on ${new Date(channel.date).toDateString()}`,
      type: 'assignment',
    }));
    await Notification.insertMany(notifications);

    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getChannels = async (req, res) => {
  try {
    const channels = await Channel.find().populate('created_by', 'name email').sort({ createdAt: -1 });
    const result = await Promise.all(channels.map(async (ch) => {
      const rooms = await Room.find({ channel_id: ch._id }).populate('faculty_id', 'name email');
      return { ...ch.toObject(), rooms };
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMalpracticeReports = async (req, res) => {
  try {
    const events = await MalpracticeEvent.find()
      .populate('channel_id', 'exam_name date')
      .populate('room_id', 'room_number')
      .populate('faculty_id', 'name email')
      .sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getFacultyUsers = async (req, res) => {
  try {
    const faculty = await User.find({ role: 'faculty' }, 'name email');
    res.json(faculty);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createChannel, addRooms, getChannels, getMalpracticeReports, getFacultyUsers };
