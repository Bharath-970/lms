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

const createAssignmentSchema = z.object({
  moduleId: z.string().min(1).optional(),
  title: z.string().min(1, 'Title required'),
  description: z.string().min(1, 'Description required'),
  rubricJson: z.any().optional(),
  maxScore: z.number().int().min(1),
  deadline: z.string().min(1, 'Deadline required'),
  fileTypes: z.string().optional(),
  maxFileSize: z.number().int().optional(),
  allowResubmit: z.boolean().optional(),
  maxResubmits: z.number().int().optional(),
  isMiniProject: z.boolean().optional(),
});

const updateAssignmentSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  rubricJson: z.any().optional(),
  maxScore: z.number().int().min(1).optional(),
  deadline: z.string().optional(),
  fileTypes: z.string().nullable().optional(),
  maxFileSize: z.number().int().optional(),
  allowResubmit: z.boolean().optional(),
  maxResubmits: z.number().int().optional(),
  isMiniProject: z.boolean().optional(),
});

const gradeSubmissionSchema = z.object({
  grade: z.number().min(0).optional(),
  feedback: z.string().min(1, 'Feedback required'),
  requestResubmit: z.boolean().optional(),
});

const createQuizSchema = z.object({
  moduleId: z.string().min(1).optional(),
  title: z.string().min(1, 'Title required'),
  type: z.enum(['MCQ', 'CODING', 'SQL', 'CASE_STUDY']),
  timeLimitMinutes: z.number().int().min(1).optional(),
  maxRetakes: z.number().int().min(0).optional(),
  scorePolicy: z.enum(['BEST', 'LAST']).optional(),
  maxScore: z.number().int().min(1),
  weekNumber: z.number().int().min(1).max(14).optional(),
  questions: z.array(z.object({
    questionType: z.enum(['MCQ_SINGLE', 'MCQ_MULTI', 'CODE_PYTHON', 'CODE_SQL', 'FREE_TEXT']),
    question: z.string().min(1),
    optionsJson: z.any().optional(),
    correctAnswer: z.string().optional(),
    testCasesJson: z.any().optional(),
    points: z.number().int().min(1),
  })).optional(),
});

const updateQuizSchema = z.object({
  title: z.string().min(1).optional(),
  type: z.enum(['MCQ', 'CODING', 'SQL', 'CASE_STUDY']).optional(),
  timeLimitMinutes: z.number().int().min(1).nullable().optional(),
  maxRetakes: z.number().int().min(0).optional(),
  scorePolicy: z.enum(['BEST', 'LAST']).optional(),
  maxScore: z.number().int().min(1).optional(),
  weekNumber: z.number().int().nullable().optional(),
  isPublished: z.boolean().optional(),
});

const addQuestionSchema = z.object({
  questionType: z.enum(['MCQ_SINGLE', 'MCQ_MULTI', 'CODE_PYTHON', 'CODE_SQL', 'FREE_TEXT']),
  question: z.string().min(1),
  optionsJson: z.any().optional(),
  correctAnswer: z.string().optional(),
  testCasesJson: z.any().optional(),
  points: z.number().int().min(1),
});

const submitAttemptSchema = z.object({
  answers: z.array(z.object({
    questionId: z.string().min(1),
    answer: z.string(),
  })),
});

const linkRepoSchema = z.object({
  repoUrl: z.string().url('Valid URL required'),
  repoName: z.string().min(1, 'Repo name required'),
  internId: z.string().min(1).optional(),
});

const addCommitSchema = z.object({
  githubLinkId: z.string().min(1),
  commitHash: z.string().min(1),
  message: z.string().min(1),
  filesChanged: z.number().int().optional(),
  additions: z.number().int().optional(),
  deletions: z.number().int().optional(),
  date: z.string().min(1),
});

const createReviewSchema = z.object({
  commitLogId: z.string().min(1),
  commentsJson: z.any().optional(),
});

const createHackathonSchema = z.object({
  title: z.string().min(1, 'Title required'),
  description: z.string().optional(),
  dayNumber: z.number().int().min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  rubricJson: z.any().optional(),
  maxScore: z.number().int().min(1),
  isTeam: z.boolean().optional(),
  batchId: z.string().min(1).optional(),
});

const updateHackathonSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  dayNumber: z.number().int().min(1).optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  rubricJson: z.any().optional(),
  maxScore: z.number().int().min(1).optional(),
  isTeam: z.boolean().optional(),
});

const submitHackathonSchema = z.object({
  repoUrl: z.string().url().optional(),
  demoUrl: z.string().url().optional(),
});

const judgeHackathonSchema = z.object({
  score: z.number().min(0),
  feedback: z.string().optional(),
});

const createCapstoneSchema = z.object({
  internId: z.string().min(1).optional(),
  mentorId: z.string().min(1).optional(),
  problemStatement: z.string().optional(),
  repoUrl: z.string().url().optional(),
});

const updateCapstoneSchema = z.object({
  problemStatement: z.string().optional(),
  phase: z.enum(['STATEMENT', 'SOLUTION', 'DEPLOYMENT', 'DOCUMENTATION', 'PRESENTATION', 'EVALUATION']).optional(),
  repoUrl: z.string().url().optional().or(z.literal('')),
  deployedUrl: z.string().url().optional().or(z.literal('')),
});

const evaluateCapstoneSchema = z.object({
  finalScore: z.number().min(0),
  feedbackJson: z.any().optional(),
});

const executeCodeSchema = z.object({
  language: z.enum(['python', 'sql']),
  code: z.string().min(1, 'Code required'),
});

const createPeerReviewSchema = z.object({
  revieweeId: z.string().min(1, 'Reviewee required'),
  assignmentId: z.string().min(1).optional(),
  weekNumber: z.number().int().min(1),
  scoresJson: z.any().optional(),
  strengths: z.string().optional(),
  improvements: z.string().optional(),
});

const generateReportSchema = z.object({
  internId: z.string().min(1).optional(),
  weekNumber: z.number().int().min(1),
});

const mentorCommentSchema = z.object({
  mentorComments: z.string().min(1, 'Comment required'),
  overallScore: z.number().min(0).max(100).optional(),
});

const createEvaluationSchema = z.object({
  internId: z.string().min(1, 'Intern required'),
  weekNumber: z.number().int().min(1),
  technicalScore: z.number().min(0).max(10),
  softSkillScore: z.number().min(0).max(10),
  attendanceScore: z.number().min(0).max(10),
  feedback: z.string().optional(),
  areasOfImprovement: z.string().optional(),
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
  createAssignmentSchema,
  updateAssignmentSchema,
  gradeSubmissionSchema,
  createQuizSchema,
  updateQuizSchema,
  addQuestionSchema,
  submitAttemptSchema,
  linkRepoSchema,
  addCommitSchema,
  createReviewSchema,
  executeCodeSchema,
  createHackathonSchema,
  updateHackathonSchema,
  submitHackathonSchema,
  judgeHackathonSchema,
  createCapstoneSchema,
  updateCapstoneSchema,
  evaluateCapstoneSchema,
  createPeerReviewSchema,
  generateReportSchema,
  mentorCommentSchema,
  createEvaluationSchema,
};
