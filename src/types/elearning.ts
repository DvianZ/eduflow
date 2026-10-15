export type UserRole = 'learner' | 'teacher';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
  certificateName?: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  thumbnailUrl: string;
}

export interface Batch {
  id: string;
  courseId: string;
  instructorId: string;
  instructorName: string;
  batchName: string;
  classCode: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'upcoming' | 'completed';
  maxStudents: number;
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  sequenceNumber: number;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  contentType: 'video' | 'reading';
  contentBody: string;
  videoUrl?: string;
  durationMinutes: number;
  sequenceNumber: number;
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  moduleId: string;
  title: string;
  passingScorePercentage: number;
  timeLimitMinutes: number;
  questions: QuizQuestion[];
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  scorePercentage: number;
  isPassed: boolean;
  selectedAnswers: number[];
  attemptedAt: string;
}

export interface Assignment {
  id: string;
  moduleId: string;
  title: string;
  instructions: string;
  dueDate: string;
  maxScore: number;
  allowLateSubmission: boolean;
}

export type SubmissionStatus = 'SUBMITTED' | 'SUBMITTED_LATE' | 'REVISION_REQUIRED' | 'GRADED';

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  batchId: string;
  userId: string;
  studentName: string;
  submissionContent: string;
  attachmentUrl?: string;
  status: SubmissionStatus;
  submittedAt: string;
  isLate: boolean;
}

export interface SubmissionGrade {
  id: string;
  submissionId: string;
  graderId: string;
  graderName: string;
  score: number;
  feedbackNotes: string;
  gradedAt: string;
}

export interface BatchAnnouncement {
  id: string;
  batchId: string;
  authorId: string;
  authorName: string;
  title: string;
  message: string;
  createdAt: string;
}

export interface BatchEnrollment {
  id: string;
  batchId: string;
  userId: string;
  progressPercentage: number;
  finalScore: number;
  graduationStatus: 'in_progress' | 'graduated' | 'dropped';
  enrolledAt: string;
}

export interface Certificate {
  id: string;
  batchId: string;
  userId: string;
  studentName: string;
  courseTitle: string;
  batchName: string;
  certificateNumber: string;
  finalScore: number;
  instructorName: string;
  issuedAt: string;
}

export interface UserStreak {
  userId: string;
  currentStreak: number;
  highestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  totalXp: number;
}

export type NotificationType =
  | 'grade'
  | 'revision'
  | 'announcement'
  | 'system'
  | 'enrollment'
  | 'deadline';

export interface InAppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  linkRoute?: string;
  metadata?: {
    batchId?: string;
    batchName?: string;
    submissionId?: string;
    assignmentId?: string;
    score?: number;
  };
}
