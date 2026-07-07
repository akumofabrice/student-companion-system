const express = require('express');
const router = express.Router();
const timetableController = require('../controllers/timetableController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.post('/generate', timetableController.generateTimetable);
router.get('/', timetableController.getTimetable);
router.delete('/', timetableController.deleteTimetable);

module.exports = router;
