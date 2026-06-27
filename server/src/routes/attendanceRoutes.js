const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { overrideAttendanceSchema } = require('../utils/schemas');
const {
  markAttendance,
  getMyAttendance,
  getTodayAttendance,
  getAllAttendance,
  overrideAttendance,
} = require('../controllers/attendanceController');

router.use(authenticate);

router.post('/mark', authorize('INTERN'), markAttendance);
router.get('/me', authorize('INTERN'), getMyAttendance);
router.get('/today', authorize('ADMIN', 'MENTOR'), getTodayAttendance);
router.get('/', authorize('ADMIN', 'MENTOR'), getAllAttendance);
router.post('/override', authorize('ADMIN', 'MENTOR'), validate(overrideAttendanceSchema), overrideAttendance);

module.exports = router;
