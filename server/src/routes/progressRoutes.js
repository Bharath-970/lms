const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  createPeerReview,
  getPeerReviews,
  generateWeeklyReport,
  getWeeklyReports,
  addMentorComment,
  createEvaluation,
  getEvaluations,
  getInternProgress,
} = require('../controllers/progressController');
const {
  createPeerReviewSchema,
  generateReportSchema,
  mentorCommentSchema,
  createEvaluationSchema,
} = require('../utils/schemas');

router.use(authenticate);

// Peer reviews
router.post('/peer-reviews', validate(createPeerReviewSchema), createPeerReview);
router.get('/peer-reviews', getPeerReviews);

// Weekly reports
router.post('/weekly-reports', validate(generateReportSchema), generateWeeklyReport);
router.get('/weekly-reports', getWeeklyReports);
router.put('/weekly-reports/:id/comment', authorize('ADMIN', 'MENTOR'), validate(mentorCommentSchema), addMentorComment);

// Evaluations
router.post('/evaluations', authorize('ADMIN', 'MENTOR'), validate(createEvaluationSchema), createEvaluation);
router.get('/evaluations', getEvaluations);

// Progress dashboard
router.get('/dashboard/:internId?', getInternProgress);

module.exports = router;
