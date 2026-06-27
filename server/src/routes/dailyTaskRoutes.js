const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createDailyTaskSchema, updateTaskStatusSchema } = require('../utils/schemas');
const {
  createTask,
  getMyTasks,
  getTasksByIntern,
  updateTaskStatus,
  deleteTask,
} = require('../controllers/dailyTaskController');

router.use(authenticate);

router.post('/', authorize('ADMIN', 'MENTOR'), validate(createDailyTaskSchema), createTask);
router.get('/me', authorize('INTERN'), getMyTasks);
router.get('/intern/:internId', authorize('ADMIN', 'MENTOR'), getTasksByIntern);
router.patch('/:id/status', authenticate, validate(updateTaskStatusSchema), updateTaskStatus);
router.delete('/:id', authorize('ADMIN', 'MENTOR'), deleteTask);

module.exports = router;
