export type Role = 'ADMIN' | 'MENTOR' | 'INTERN';
export type UserStatus = 'INVITED' | 'ONBOARDING' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CONVERTED' | 'REMOVED';
export type ContentType = 'VIDEO' | 'TEXT' | 'PDF' | 'CODE' | 'NOTEBOOK';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  status: UserStatus;
  avatarUrl: string | null;
  forcePasswordChange: boolean;
  batchId: string | null;
  primaryMentorId: string | null;
  createdAt: string;
}

export interface Batch {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  _count?: { users: number };
}

export interface Course {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  weekNumber: number;
  order: number;
  _count?: { modules: number };
  modules?: Module[];
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  order: number;
  estimatedDuration: number | null;
  prerequisiteModuleId: string | null;
  _count?: { lessons: number };
  lessons?: Lesson[];
  course?: { id: string; title: string; weekNumber: number };
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  contentType: ContentType;
  content: string | null;
  fileUrl: string | null;
  duration: number | null;
  order: number;
}

export interface InternAccess {
  id: string;
  internId: string;
  entityType: 'MODULE' | 'LESSON' | 'FILE';
  entityId: string;
  locked: boolean;
  unlockedAt: string | null;
}

export type AttendanceStatus = 'PRESENT' | 'LATE' | 'INCOMPLETE' | 'ABSENT' | 'EXCUSED';
export type DailyTaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface Attendance {
  id: string;
  internId: string;
  date: string;
  markedAt: string | null;
  status: AttendanceStatus;
  overrideBy: string | null;
  overrideReason: string | null;
  tasksCompletedCount: number;
  tasksTotalCount: number;
  intern?: { id: string; name: string; email: string };
}

export interface DailyStandup {
  id: string;
  internId: string;
  date: string;
  yesterday: string;
  today: string;
  blockers: string | null;
  createdAt: string;
  intern?: { id: string; name: string; email: string };
}

export interface DailyTask {
  id: string;
  internId: string;
  date: string;
  title: string;
  description: string | null;
  assignedBy: string;
  dueTime: string | null;
  status: DailyTaskStatus;
  completedAt: string | null;
  createdAt: string;
  assigner?: { id: string; name: string };
}

export type SubmissionStatus = 'SUBMITTED' | 'GRADED' | 'RESUBMIT_REQUESTED';

export interface RubricItem {
  criteria: string;
  points: number;
}

export interface Assignment {
  id: string;
  moduleId: string | null;
  title: string;
  description: string;
  rubricJson: RubricItem[] | null;
  maxScore: number;
  deadline: string;
  fileTypes: string | null;
  maxFileSize: number;
  allowResubmit: boolean;
  maxResubmits: number;
  isMiniProject: boolean;
  createdBy: string;
  createdAt: string;
  module?: { id: string; title: string; course?: { title: string; weekNumber: number } };
  submissions?: Submission[];
  _count?: { submissions: number };
}

export interface Submission {
  id: string;
  assignmentId: string;
  internId: string;
  fileUrl: string | null;
  content: string | null;
  status: SubmissionStatus;
  grade: number | null;
  feedback: string | null;
  gradedBy: string | null;
  gradedAt: string | null;
  resubmitCount: number;
  submittedAt: string;
  intern?: { id: string; name: string; email: string };
}

export type QuizType = 'MCQ' | 'CODING' | 'SQL' | 'CASE_STUDY';
export type QuestionType = 'MCQ_SINGLE' | 'MCQ_MULTI' | 'CODE_PYTHON' | 'CODE_SQL' | 'FREE_TEXT';

export interface Quiz {
  id: string;
  moduleId: string | null;
  title: string;
  type: QuizType;
  timeLimitMinutes: number | null;
  maxRetakes: number;
  scorePolicy: 'BEST' | 'LAST';
  maxScore: number;
  weekNumber: number | null;
  isPublished: boolean;
  createdAt: string;
  module?: { id: string; title: string; course?: { title: string; weekNumber: number } };
  questions?: QuizQuestion[];
  _count?: { questions: number; attempts: number };
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  questionType: QuestionType;
  question: string;
  optionsJson: string[] | null;
  correctAnswer?: string;
  testCasesJson: unknown;
  points: number;
  order: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  internId: string;
  answersJson: { questionId: string; answer: string; earned: number; maxPoints: number; autoGraded: boolean }[];
  score: number | null;
  maxScore: number | null;
  attemptNumber: number;
  startedAt: string;
  submittedAt: string | null;
  intern?: { id: string; name: string; email: string };
}

export type CodeReviewStatus = 'PENDING' | 'REVIEWED';

export interface GitHubLink {
  id: string;
  internId: string;
  repoUrl: string;
  repoName: string;
  linkedAt: string;
  intern?: { id: string; name: string; email: string };
  _count?: { commits: number };
}

export interface CommitLog {
  id: string;
  internId: string;
  githubLinkId: string;
  commitHash: string;
  message: string;
  filesChanged: number;
  additions: number;
  deletions: number;
  date: string;
  intern?: { id: string; name: string };
  githubLink?: { id: string; repoName: string; repoUrl: string };
  _count?: { reviews: number };
}

export interface CodeReview {
  id: string;
  commitLogId: string;
  reviewerId: string;
  commentsJson: { line?: number; file?: string; comment: string }[];
  status: CodeReviewStatus;
  reviewedAt: string | null;
  createdAt: string;
  reviewer?: { id: string; name: string };
  commitLog?: { id: string; commitHash: string; message: string; intern?: { id: string; name: string } };
}

export type CapstonePhase = 'STATEMENT' | 'SOLUTION' | 'DEPLOYMENT' | 'DOCUMENTATION' | 'PRESENTATION' | 'EVALUATION';

export interface Hackathon {
  id: string;
  title: string;
  description: string | null;
  dayNumber: number;
  startTime: string;
  endTime: string;
  rubricJson: unknown;
  maxScore: number;
  isTeam: boolean;
  batchId: string | null;
  createdAt: string;
  batch?: { id: string; name: string };
  submissions?: HackathonSubmission[];
  _count?: { submissions: number };
}

export interface HackathonSubmission {
  id: string;
  hackathonId: string;
  internId: string;
  repoUrl: string | null;
  demoUrl: string | null;
  submittedAt: string;
  score: number | null;
  feedback: string | null;
  judgedBy: string | null;
  intern?: { id: string; name: string; email: string };
  judge?: { id: string; name: string };
}

export interface CapstoneProject {
  id: string;
  internId: string;
  mentorId: string | null;
  problemStatement: string | null;
  phase: CapstonePhase;
  repoUrl: string | null;
  deployedUrl: string | null;
  finalScore: number | null;
  feedbackJson: unknown;
  createdAt: string;
  intern?: { id: string; name: string; email: string };
  mentor?: { id: string; name: string };
}

export type PeerReviewStatus = 'PENDING' | 'COMPLETED';

export interface PeerReview {
  id: string;
  reviewerId: string;
  revieweeId: string;
  assignmentId: string | null;
  weekNumber: number;
  scoresJson: unknown;
  strengths: string | null;
  improvements: string | null;
  status: PeerReviewStatus;
  createdAt: string;
  reviewer?: { id: string; name: string };
  reviewee?: { id: string; name: string };
  assignment?: { id: string; title: string };
}

export interface WeeklyReport {
  id: string;
  internId: string;
  mentorId: string | null;
  weekNumber: number;
  summaryJson: {
    attendanceDays: number;
    presentDays: number;
    standupCount: number;
    totalTasks: number;
    completedTasks: number;
    submissionCount: number;
    avgGrade: number;
    quizAttempts: number;
    commitCount: number;
    totalAdditions: number;
    totalDeletions: number;
  };
  mentorComments: string | null;
  overallScore: number | null;
  createdAt: string;
  intern?: { id: string; name: string; email: string };
  mentor?: { id: string; name: string };
}

export interface MentorEvaluation {
  id: string;
  internId: string;
  mentorId: string;
  weekNumber: number;
  technicalScore: number;
  softSkillScore: number;
  attendanceScore: number;
  overallScore: number;
  feedback: string | null;
  areasOfImprovement: string | null;
  createdAt: string;
  intern?: { id: string; name: string; email: string };
  mentor?: { id: string; name: string };
}

export interface ProgressStats {
  attendanceRate: number;
  totalDays: number;
  presentDays: number;
  taskCompletionRate: number;
  totalTasks: number;
  completedTasks: number;
  avgGrade: number;
  totalSubmissions: number;
  gradedSubmissions: number;
  quizzesTaken: number;
  commitCount: number;
  capstonePhase: CapstonePhase | null;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl: string | null;
  category: string;
  criteria: string;
  xpReward: number;
}

export interface EarnedBadge {
  id: string;
  internId: string;
  badgeId: string;
  earnedAt: string;
  badge?: Badge;
}

export interface XpLog {
  id: string;
  internId: string;
  amount: number;
  reason: string;
  sourceType: string;
  sourceId: string | null;
  createdAt: string;
  intern?: { id: string; name: string };
}

export interface LeaderboardEntry {
  rank: number;
  intern: { id: string; name: string; email?: string; avatarUrl?: string | null };
  totalXp: number;
  badgeCount: number;
  streak: number;
}

export interface StreakData {
  id: string;
  internId: string;
  type: string;
  currentCount: number;
  longestCount: number;
  lastActivityAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  link: string | null;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}
