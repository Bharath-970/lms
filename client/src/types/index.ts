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

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}
