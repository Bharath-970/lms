const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getAdminDashboard,
  getMentorDashboard,
  getInternDashboard,
  getNotifications,
  markNotificationsRead,
} = require('../controllers/dashboardController');

router.use(authenticate);

router.get('/admin', authorize('ADMIN'), getAdminDashboard);
router.get('/mentor', authorize('ADMIN', 'MENTOR'), getMentorDashboard);
router.get('/intern', getInternDashboard);

router.get('/notifications', getNotifications);
router.put('/notifications/read', markNotificationsRead);

module.exports = router;
