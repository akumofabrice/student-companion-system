const Timetable = require('../models/Timetable');

exports.generateTimetable = async (req, res) => {
  const { courses: courseNames, breaks: userBreaks } = req.body;
  
  if (!courseNames || !Array.isArray(courseNames) || courseNames.length === 0) {
    return res.status(400).json({ message: 'A list of courses is required.' });
  }

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const standardSlots = [
    { start: "08:30", end: "10:00" },
    { start: "10:15", end: "11:45" },
    { start: "12:00", end: "13:30" },
    { start: "14:00", end: "15:30" }
  ];

  const scheduledCourses = [];
  const breaks = userBreaks || [];

  const isOverlappingWithBreak = (day, start, end) => {
    return breaks.some(b => {
      if (b.day.toLowerCase() !== day.toLowerCase()) return false;
      const parseTime = (t) => {
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
      };
      const breakStart = parseTime(b.startTime);
      const breakEnd = parseTime(b.endTime);
      const slotStart = parseTime(start);
      const slotEnd = parseTime(end);
      return (slotStart < breakEnd && slotEnd > breakStart);
    });
  };

  let slotIndex = 0;
  let dayIndex = 0;

  for (let i = 0; i < courseNames.length; i++) {
    const courseName = courseNames[i];
    let scheduled = false;
    let attempts = 0;
    const maxAttempts = days.length * standardSlots.length;

    while (!scheduled && attempts < maxAttempts) {
      const currentDay = days[dayIndex];
      const currentSlot = standardSlots[slotIndex];

      if (!isOverlappingWithBreak(currentDay, currentSlot.start, currentSlot.end)) {
        scheduledCourses.push({
          courseName,
          day: currentDay,
          startTime: currentSlot.start,
          endTime: currentSlot.end,
          room: `Room ${101 + Math.floor(Math.random() * 10)}`
        });
        scheduled = true;
      }

      dayIndex = (dayIndex + 1) % days.length;
      if (dayIndex === 0) {
        slotIndex = (slotIndex + 1) % standardSlots.length;
      }
      attempts++;
    }

    if (!scheduled) {
      return res.status(400).json({ 
        message: `Could not generate a conflict-free timetable. Too many breaks or courses. Failed at: ${courseName}` 
      });
    }
  }

  try {
    // Remove existing user timetable
    await Timetable.deleteMany({ userId: req.user.id });

    const timetableId = 'TT_' + Date.now();
    const timetable = new Timetable({
      timetableId,
      userId: req.user.id,
      courses: scheduledCourses,
      breaks
    });

    await timetable.save();
    res.status(201).json(timetable);
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate timetable', error: error.message });
  }
};

exports.getTimetable = async (req, res) => {
  try {
    const timetable = await Timetable.findOne({ userId: req.user.id });
    if (!timetable) {
      return res.status(404).json({ message: 'No timetable found for this user.' });
    }
    res.json(timetable);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve timetable', error: error.message });
  }
};

exports.deleteTimetable = async (req, res) => {
  try {
    const result = await Timetable.findOneAndDelete({ userId: req.user.id });
    if (!result) {
      return res.status(404).json({ message: 'Timetable not found' });
    }
    res.json({ message: 'Timetable deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete timetable', error: error.message });
  }
};
