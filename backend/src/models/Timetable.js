const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  timetableId: {
    type: String,
    unique: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courses: [{
    courseName: { type: String, required: true },
    day: { type: String, required: true }, // e.g. "Monday", "Tuesday"
    startTime: { type: String, required: true }, // e.g. "08:30"
    endTime: { type: String, required: true }, // e.g. "10:00"
    room: { type: String, default: '' }
  }],
  breaks: [{
    day: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Timetable', timetableSchema);
