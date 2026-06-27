const { z } = require('zod');

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
});

const createUserSchema = z.object({
  email: z.string().email('Invalid email'),
  name: z.string().min(1, 'Name required'),
  role: z.enum(['MENTOR', 'INTERN']),
  batchId: z.string().min(1).optional(),
  primaryMentorId: z.string().min(1).optional(),
});

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  status: z.enum(['INVITED', 'ONBOARDING', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CONVERTED', 'REMOVED']).optional(),
  batchId: z.string().min(1).nullable().optional(),
  primaryMentorId: z.string().min(1).nullable().optional(),
});

const createBatchSchema = z.object({
  name: z.string().min(1, 'Batch name required'),
  startDate: z.string().min(1, 'Start date required'),
  endDate: z.string().min(1, 'End date required'),
});

const updateBatchSchema = z.object({
  name: z.string().min(1).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(['ACTIVE', 'COMPLETED', 'ARCHIVED']).optional(),
});

const createCourseSchema = z.object({
  title: z.string().min(1, 'Title required'),
  description: z.string().optional(),
  category: z.string().optional(),
  weekNumber: z.number().int().min(1).max(14),
  order: z.number().int().optional(),
});

const updateCourseSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  weekNumber: z.number().int().min(1).max(14).optional(),
  order: z.number().int().optional(),
});

const createModuleSchema = z.object({
  courseId: z.string().min(1, 'Course ID required'),
  title: z.string().min(1, 'Title required'),
  description: z.string().optional(),
  order: z.number().int().optional(),
  estimatedDuration: z.number().int().optional(),
  prerequisiteModuleId: z.string().uuid().optional(),
});

const updateModuleSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  order: z.number().int().optional(),
  estimatedDuration: z.number().int().nullable().optional(),
  prerequisiteModuleId: z.string().uuid().nullable().optional(),
});

const createLessonSchema = z.object({
  moduleId: z.string().min(1, 'Module ID required'),
  title: z.string().min(1, 'Title required'),
  contentType: z.enum(['VIDEO', 'TEXT', 'PDF', 'CODE', 'NOTEBOOK']),
  content: z.string().optional(),
  fileUrl: z.string().optional(),
  duration: z.number().int().optional(),
  order: z.number().int().optional(),
});

const updateLessonSchema = z.object({
  title: z.string().min(1).optional(),
  contentType: z.enum(['VIDEO', 'TEXT', 'PDF', 'CODE', 'NOTEBOOK']).optional(),
  content: z.string().nullable().optional(),
  fileUrl: z.string().nullable().optional(),
  duration: z.number().int().nullable().optional(),
  order: z.number().int().optional(),
});

const toggleAccessSchema = z.object({
  internId: z.string().min(1),
  entityType: z.enum(['MODULE', 'LESSON', 'FILE']),
  entityId: z.string().min(1),
  locked: z.boolean(),
});

const bulkToggleAccessSchema = z.object({
  internIds: z.array(z.string().min(1)).min(1),
  entityType: z.enum(['MODULE', 'LESSON', 'FILE']),
  entityId: z.string().min(1),
  locked: z.boolean(),
});

const overrideAttendanceSchema = z.object({
  internId: z.string().min(1),
  date: z.string().min(1),
  status: z.enum(['PRESENT', 'LATE', 'INCOMPLETE', 'ABSENT', 'EXCUSED']),
  reason: z.string().min(1, 'Reason required'),
});

const submitStandupSchema = z.object({
  yesterday: z.string().min(1, 'Yesterday field required'),
  today: z.string().min(1, 'Today field required'),
  blockers: z.string().optional(),
});

const createDailyTaskSchema = z.object({
  internId: z.string().min(1),
  title: z.string().min(1, 'Title required'),
  description: z.string().optional(),
  dueTime: z.string().optional(),
});

const updateTaskStatusSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']),
});

module.exports = {
  loginSchema,
  changePasswordSchema,
  createUserSchema,
  updateUserSchema,
  createBatchSchema,
  updateBatchSchema,
  createCourseSchema,
  updateCourseSchema,
  createModuleSchema,
  updateModuleSchema,
  createLessonSchema,
  updateLessonSchema,
  toggleAccessSchema,
  bulkToggleAccessSchema,
  overrideAttendanceSchema,
  submitStandupSchema,
  createDailyTaskSchema,
  updateTaskStatusSchema,
};
