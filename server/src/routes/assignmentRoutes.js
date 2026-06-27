const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createAssignmentSchema, updateAssignmentSchema, gradeSubmissionSchema } = require('../utils/schemas');
const {
  createAssignment, listAssignments, getAssignment,
  updateAssignment, deleteAssignment, submitAssignment, gradeSubmission,
} = require('../controllers/assignmentController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 52428800 } });

router.use(authenticate);

router.post('/', authorize('ADMIN', 'MENTOR'), validate(createAssignmentSchema), createAssignment);
router.get('/', authenticate, listAssignments);
router.get('/:id', authenticate, getAssignment);
router.put('/:id', authorize('ADMIN', 'MENTOR'), validate(updateAssignmentSchema), updateAssignment);
router.delete('/:id', authorize('ADMIN', 'MENTOR'), deleteAssignment);

router.post('/:assignmentId/submit', authorize('INTERN'), upload.single('file'), submitAssignment);
router.post('/submissions/:id/grade', authorize('ADMIN', 'MENTOR'), validate(gradeSubmissionSchema), gradeSubmission);

module.exports = router;
