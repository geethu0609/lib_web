const MalpracticeEvent = require('../models/MalpracticeEvent');
const Room = require('../models/Room');

const MOCK_IMAGES = [
  'https://placehold.co/320x240/cccccc/333333?text=Malpractice+Alert+1',
  'https://placehold.co/320x240/cccccc/333333?text=Malpractice+Alert+2',
  'https://placehold.co/320x240/cccccc/333333?text=Malpractice+Alert+3',
];

const generateMockEvent = async (req, res) => {
  const { roomId } = req.params;
  try {
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    if (room.status !== 'active') return res.status(400).json({ message: 'Room is not active' });

    const event = await MalpracticeEvent.create({
      channel_id: room.channel_id,
      room_id: room._id,
      faculty_id: room.faculty_id,
      image_url: MOCK_IMAGES[Math.floor(Math.random() * MOCK_IMAGES.length)],
      timestamp: new Date(),
      bounding_box: {
        x: Math.floor(Math.random() * 200),
        y: Math.floor(Math.random() * 150),
        width: Math.floor(Math.random() * 100) + 50,
        height: Math.floor(Math.random() * 80) + 40,
      },
    });
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { generateMockEvent };
