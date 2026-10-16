import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  User,
  UserRole,
  Batch,
  Course,
  Module,
  Lesson,
  Quiz,
  Assignment,
  QuizAttempt,
  AssignmentSubmission,
  SubmissionGrade,
  BatchAnnouncement,
  Certificate,
  UserStreak,
  BatchEnrollment,
  InAppNotification,
} from '@/types/elearning';
import {
  DEMO_USERS,
  INITIAL_COURSES,
  INITIAL_BATCHES,
  INITIAL_MODULES,
  INITIAL_LESSONS,
  INITIAL_QUIZZES,
  INITIAL_ASSIGNMENTS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_STREAK,
  INITIAL_ENROLLMENTS,
  INITIAL_CERTIFICATES,
  INITIAL_NOTIFICATIONS,
} from '@/data/mockData';
import { calculateBatchEvaluation } from '@/utils/lockEngine';

interface ElearningState {
  currentUser: User;
  currentRole: UserRole;
  selectedBatchId: string;
  courses: Course[];
  batches: Batch[];
  modules: Module[];
  lessons: Lesson[];
  quizzes: Quiz[];
  assignments: Assignment[];
  enrollments: BatchEnrollment[];
  completedLessonIds: string[];
  userCompletedLessons: Record<string, string[]>;
  quizAttempts: QuizAttempt[];
  submissions: AssignmentSubmission[];
  grades: SubmissionGrade[];
  announcements: BatchAnnouncement[];
  certificates: Certificate[];
  userStreak: UserStreak;
  notifications: InAppNotification[];
  hasSeenAppTour: boolean;

  // Actions
  selectBatch: (batchId: string) => void;
  switchRole: (role: UserRole) => void;
  completeLesson: (lessonId: string) => void;
  submitQuiz: (
    quizId: string,
    selectedAnswers: number[]
  ) => { scorePercentage: number; isPassed: boolean; explanation: string };
  submitAssignment: (
    assignmentId: string,
    batchId: string,
    submissionContent: string,
    attachmentUrl?: string
  ) => void;
  gradeSubmission: (
    submissionId: string,
    score: number,
    feedbackNotes: string,
    requestRevision?: boolean
  ) => void;
  createAnnouncement: (batchId: string, title: string, message: string) => void;
  addModule: (courseId: string, title: string) => Module;
  addLesson: (
    moduleId: string,
    title: string,
    contentBody: string,
    durationMinutes: number,
    contentType?: 'reading' | 'video',
    videoUrl?: string
  ) => void;
  deleteLesson: (lessonId: string) => void;
  addAssignment: (
    moduleId: string,
    title: string,
    instructions: string,
    dueDate: string,
    maxScore: number
  ) => void;
  deleteAssignment: (assignmentId: string) => void;
  updateAssignmentDueDate: (assignmentId: string, newDueDate: string) => void;
  claimCertificate: (batchId: string) => Certificate | null;
  updateCertificateName: (certificateName: string) => void;
  recordDailyActivity: () => void;
  resetDemoData: () => void;
  setHasSeenAppTour: (seen: boolean) => void;

  // In-App Notification actions
  addNotification: (
    notification: Omit<InAppNotification, 'id' | 'createdAt' | 'isRead'>
  ) => void;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: (userId?: string) => void;
  clearNotifications: (userId?: string) => void;

  // Auth-bridged actions
  syncUserFromAuth: (user: {
    id: string;
    fullName: string;
    email: string;
    role: UserRole;
    avatarUrl: string;
    certificateName?: string;
  }) => void;

  // Class management
  createBatch: (
    courseTitle: string,
    courseDescription: string,
    courseCategory: string,
    courseLevel: 'beginner' | 'intermediate' | 'advanced',
    batchName: string,
    startDate: string,
    endDate: string,
    maxStudents: number
  ) => { batch: Batch; course: Course; classCode: string };

  joinBatchByCode: (
    classCode: string,
    userId: string
  ) => { success: boolean; error?: string; batchId?: string };

  updateBatch: (
    batchId: string,
    updates: {
      batchName?: string;
      maxStudents?: number;
      startDate?: string;
      endDate?: string;
      status?: 'active' | 'upcoming' | 'completed';
    }
  ) => void;

  getTeacherBatches: (instructorId: string) => Batch[];
  getStudentEnrollments: (userId: string) => BatchEnrollment[];
}

export const useElearningStore = create<ElearningState>()(
  persist(
    (set, get) => ({
      currentUser: DEMO_USERS.learner,
      currentRole: 'learner',
      selectedBatchId: 'batch-edf-402',
      courses: INITIAL_COURSES,
      batches: INITIAL_BATCHES,
      modules: INITIAL_MODULES,
      lessons: INITIAL_LESSONS,
      quizzes: INITIAL_QUIZZES,
      assignments: INITIAL_ASSIGNMENTS,
      enrollments: INITIAL_ENROLLMENTS,
      completedLessonIds: [
        'lesson-1',
        'lesson-wdf-1',
        'lesson-wdf-2',
        'lesson-wdf-3',
        'lesson-ai-1',
      ],
      userCompletedLessons: {
        'user-budi': [
          'lesson-1',
          'lesson-wdf-1',
          'lesson-wdf-2',
          'lesson-wdf-3',
          'lesson-ai-1',
        ],
      },
      quizAttempts: [],
      submissions: [],
      grades: [],
      announcements: INITIAL_ANNOUNCEMENTS,
      certificates: INITIAL_CERTIFICATES,
      userStreak: INITIAL_STREAK,
      notifications: INITIAL_NOTIFICATIONS,
      hasSeenAppTour: false,

      setHasSeenAppTour: (seen: boolean) => {
        set({ hasSeenAppTour: seen });
      },

      selectBatch: (batchId: string) => {
        set({ selectedBatchId: batchId });
      },

      switchRole: (role: UserRole) => {
        const targetUser = DEMO_USERS[role];
        const { userCompletedLessons } = get();
        set({
          currentRole: role,
          currentUser: targetUser,
          completedLessonIds: userCompletedLessons[targetUser.id] || [],
        });
      },

      completeLesson: (lessonId: string) => {
        const { currentUser, userCompletedLessons, recordDailyActivity } = get();
        const userLessons = userCompletedLessons[currentUser.id] || [];
        if (!userLessons.includes(lessonId)) {
          const updatedUserLessons = [...userLessons, lessonId];
          set({
            userCompletedLessons: {
              ...userCompletedLessons,
              [currentUser.id]: updatedUserLessons,
            },
            completedLessonIds: updatedUserLessons,
            userStreak: {
              ...get().userStreak,
              totalXp: get().userStreak.totalXp + 25,
            },
          });
          recordDailyActivity();
        }
      },

      submitQuiz: (quizId: string, selectedAnswers: number[]) => {
        const { quizzes, currentUser, quizAttempts, recordDailyActivity } = get();
        const quiz = quizzes.find((q) => q.id === quizId);
        if (!quiz) {
          return { scorePercentage: 0, isPassed: false, explanation: 'Quiz not found' };
        }

        let correctCount = 0;
        quiz.questions.forEach((q, idx) => {
          if (selectedAnswers[idx] === q.correctOptionIndex) {
            correctCount++;
          }
        });

        const scorePercentage = Math.round((correctCount / quiz.questions.length) * 100);
        const isPassed = scorePercentage >= quiz.passingScorePercentage;

        const attempt: QuizAttempt = {
          id: `attempt-${Date.now()}`,
          quizId,
          userId: currentUser.id,
          scorePercentage,
          isPassed,
          selectedAnswers,
          attemptedAt: new Date().toISOString(),
        };

        const filtered = quizAttempts.filter(
          (a) => !(a.quizId === quizId && a.userId === currentUser.id)
        );
        set({
          quizAttempts: [...filtered, attempt],
          userStreak: {
            ...get().userStreak,
            totalXp: get().userStreak.totalXp + (isPassed ? 50 : 10),
          },
        });

        recordDailyActivity();

        return {
          scorePercentage,
          isPassed,
          explanation: isPassed
            ? `Selamat! Anda lulus kuis dengan skor ${scorePercentage}%.`
            : `Skor Anda ${scorePercentage}%. Minimal kelulusan adalah ${quiz.passingScorePercentage}%. Silakan coba lagi.`,
        };
      },

      submitAssignment: (
        assignmentId: string,
        batchId: string,
        submissionContent: string,
        attachmentUrl?: string
      ) => {
        const {
          currentUser,
          submissions,
          batches,
          notifications,
          recordDailyActivity,
        } = get();
        const now = new Date().toISOString();

        const newSubmission: AssignmentSubmission = {
          id: `sub-${Date.now()}`,
          assignmentId,
          batchId,
          userId: currentUser.id,
          studentName: currentUser.fullName,
          submissionContent,
          attachmentUrl,
          status: 'SUBMITTED',
          submittedAt: now,
          isLate: false,
        };

        const filtered = submissions.filter(
          (s) => !(s.assignmentId === assignmentId && s.userId === currentUser.id)
        );

        // Notify teacher if present
        const batch = batches.find((b) => b.id === batchId);
        let updatedNotifs = notifications;
        if (batch && batch.instructorId !== currentUser.id) {
          const teacherNotif: InAppNotification = {
            id: `notif-sub-${Date.now()}`,
            userId: batch.instructorId,
            title: '📥 Pengumpulan Tugas Baru',
            message: `${currentUser.fullName} telah mengumpulkan tugas proyek di kelas ${batch.batchName}.`,
            type: 'system',
            isRead: false,
            createdAt: now,
            linkRoute: '/(tabs)/grading',
            metadata: {
              batchId,
              assignmentId,
            },
          };
          updatedNotifs = [teacherNotif, ...notifications];
        }

        set({
          submissions: [...filtered, newSubmission],
          notifications: updatedNotifs,
          userStreak: {
            ...get().userStreak,
            totalXp: get().userStreak.totalXp + 75,
          },
        });

        recordDailyActivity();
      },

      gradeSubmission: (
        submissionId: string,
        score: number,
        feedbackNotes: string,
        requestRevision = false
      ) => {
        const {
          currentUser,
          submissions,
          grades,
          assignments,
          batches,
          notifications,
        } = get();
        const submission = submissions.find((s) => s.id === submissionId);
        if (!submission) return;

        const newStatus = requestRevision ? 'REVISION_REQUIRED' : 'GRADED';
        const now = new Date().toISOString();

        const updatedSubmissions = submissions.map((s) =>
          s.id === submissionId ? { ...s, status: newStatus as any } : s
        );

        const newGrade: SubmissionGrade = {
          id: `grade-${Date.now()}`,
          submissionId,
          graderId: currentUser.id,
          graderName: currentUser.fullName,
          score,
          feedbackNotes,
          gradedAt: now,
        };

        const filteredGrades = grades.filter((g) => g.submissionId !== submissionId);

        // Create student notification
        const assignment = assignments.find((a) => a.id === submission.assignmentId);
        const batch = batches.find((b) => b.id === submission.batchId);

        const studentNotif: InAppNotification = {
          id: `notif-grade-${Date.now()}`,
          userId: submission.userId,
          title: requestRevision
            ? '⚠️ Project Revision Requested'
            : `🎉 Project Evaluated: Score ${score}/100`,
          message: requestRevision
            ? `${currentUser.fullName} requested a revision on "${assignment?.title || 'Project Assignment'}". Remarks: "${feedbackNotes || 'Please review instructor notes.'}"`
            : `${currentUser.fullName} evaluated "${assignment?.title || 'Project Assignment'}". Remarks: "${feedbackNotes || 'Excellent work!'}"`,
          type: requestRevision ? 'revision' : 'grade',
          isRead: false,
          createdAt: now,
          linkRoute: '/(tabs)/grading',
          metadata: {
            batchId: submission.batchId,
            batchName: batch?.batchName,
            submissionId: submission.id,
            assignmentId: submission.assignmentId,
            score,
          },
        };

        set({
          submissions: updatedSubmissions,
          grades: [...filteredGrades, newGrade],
          notifications: [studentNotif, ...notifications],
        });
      },

      createAnnouncement: (batchId: string, title: string, message: string) => {
        const {
          currentUser,
          announcements,
          enrollments,
          batches,
          notifications,
        } = get();
        const now = new Date().toISOString();
        const newAnnouncement: BatchAnnouncement = {
          id: `ann-${Date.now()}`,
          batchId,
          authorId: currentUser.id,
          authorName: currentUser.fullName,
          title,
          message,
          createdAt: now,
        };

        const batch = batches.find((b) => b.id === batchId);
        const enrolledStudents = enrollments.filter(
          (e) => e.batchId === batchId && e.userId !== currentUser.id
        );

        const newNotifs: InAppNotification[] = enrolledStudents.map((enr, idx) => ({
          id: `notif-ann-${Date.now()}-${idx}`,
          userId: enr.userId,
          title: `📢 New Announcement: ${batch?.batchName || 'Cohort'}`,
          message: `${currentUser.fullName}: "${title}"`,
          type: 'announcement',
          isRead: false,
          createdAt: now,
          linkRoute: '/(tabs)/',
          metadata: {
            batchId,
            batchName: batch?.batchName,
          },
        }));

        set({
          announcements: [newAnnouncement, ...announcements],
          notifications: [...newNotifs, ...notifications],
        });
      },

      addModule: (courseId: string, title: string) => {
        const { modules } = get();
        const courseModules = modules.filter((m) => m.courseId === courseId);
        const maxSeq =
          courseModules.length > 0
            ? Math.max(...courseModules.map((m) => m.sequenceNumber))
            : 0;
        const newModule: Module = {
          id: `mod-${Date.now()}`,
          courseId,
          title: title.trim(),
          sequenceNumber: maxSeq + 1,
        };
        set({ modules: [...modules, newModule] });
        return newModule;
      },

      addLesson: (
        moduleId: string,
        title: string,
        contentBody: string,
        durationMinutes: number,
        contentType?: 'reading' | 'video',
        videoUrl?: string
      ) => {
        const { lessons } = get();
        const moduleLessons = lessons.filter((l) => l.moduleId === moduleId);
        const maxSeq =
          moduleLessons.length > 0
            ? Math.max(...moduleLessons.map((l) => l.sequenceNumber))
            : 0;
        const newLesson: Lesson = {
          id: `lesson-${Date.now()}`,
          moduleId,
          title,
          contentType: contentType || 'reading',
          contentBody,
          videoUrl: videoUrl?.trim() || undefined,
          durationMinutes: durationMinutes || 15,
          sequenceNumber: maxSeq + 1,
        };
        set({ lessons: [...lessons, newLesson] });
      },

      deleteLesson: (lessonId: string) => {
        const { lessons, completedLessonIds } = get();
        set({
          lessons: lessons.filter((l) => l.id !== lessonId),
          completedLessonIds: completedLessonIds.filter((id) => id !== lessonId),
        });
      },

      addAssignment: (
        moduleId: string,
        title: string,
        instructions: string,
        dueDate: string,
        maxScore: number
      ) => {
        const { assignments } = get();
        const newAssign: Assignment = {
          id: `assign-${Date.now()}`,
          moduleId,
          title,
          instructions,
          dueDate,
          maxScore: maxScore || 100,
          allowLateSubmission: true,
        };
        set({ assignments: [...assignments, newAssign] });
      },

      deleteAssignment: (assignmentId: string) => {
        const { assignments, submissions, grades } = get();
        const subIdsToDelete = submissions
          .filter((s) => s.assignmentId === assignmentId)
          .map((s) => s.id);
        set({
          assignments: assignments.filter((a) => a.id !== assignmentId),
          submissions: submissions.filter((s) => s.assignmentId !== assignmentId),
          grades: grades.filter((g) => !subIdsToDelete.includes(g.submissionId)),
        });
      },

      updateAssignmentDueDate: (assignmentId: string, newDueDate: string) => {
        const { assignments } = get();
        set({
          assignments: assignments.map((a) =>
            a.id === assignmentId ? { ...a, dueDate: newDueDate } : a
          ),
        });
      },

      claimCertificate: (batchId: string) => {
        const state = get();
        const batch = state.batches.find((b) => b.id === batchId);
        const course = state.courses.find((c) => c.id === batch?.courseId);

        if (!batch || !course) return null;

        const batchModules = state.modules.filter((m) => m.courseId === batch.courseId);
        const batchModuleIds = batchModules.map((m) => m.id);
        const batchLessons = state.lessons.filter((l) =>
          batchModuleIds.includes(l.moduleId)
        );
        const batchLessonIds = batchLessons.map((l) => l.id);

        const userQuizAttempts = state.quizAttempts.filter(
          (q) => q.userId === state.currentUser.id
        );
        const userSubmissions = state.submissions.filter(
          (s) => s.userId === state.currentUser.id
        );
        const userGrades = state.grades.filter((g) => {
          const sub = state.submissions.find((s) => s.id === g.submissionId);
          return sub ? sub.userId === state.currentUser.id : false;
        });

        const evalResult = calculateBatchEvaluation(
          batchLessons.length,
          {
            completedLessonIds: state.completedLessonIds,
            quizAttempts: userQuizAttempts,
            submissions: userSubmissions,
            grades: userGrades,
          },
          batchLessonIds
        );

        if (!evalResult.canGraduate) {
          return null;
        }

        const certNumber = `EDF-CERT-${Date.now().toString().slice(-6)}-${batch.classCode}`;
        const newCert: Certificate = {
          id: `cert-${Date.now()}`,
          batchId,
          userId: state.currentUser.id,
          studentName: state.currentUser.certificateName || state.currentUser.fullName,
          courseTitle: course.title,
          batchName: batch.batchName,
          certificateNumber: certNumber,
          finalScore: evalResult.finalScore,
          instructorName: batch.instructorName,
          issuedAt: new Date().toISOString(),
        };

        set({
          certificates: [...state.certificates, newCert],
          userStreak: {
            ...state.userStreak,
            totalXp: state.userStreak.totalXp + 200,
          },
        });

        return newCert;
      },

      recordDailyActivity: () => {
        const { userStreak } = get();
        const todayStr = new Date().toISOString().split('T')[0];

        if (userStreak.lastActiveDate === todayStr) {
          return;
        }

        const lastDate = new Date(userStreak.lastActiveDate);
        const today = new Date(todayStr);
        const diffDays = Math.round(
          (today.getTime() - lastDate.getTime()) / (1000 * 3600 * 24)
        );

        let newStreak = userStreak.currentStreak;
        if (diffDays === 1) {
          newStreak += 1;
        } else if (diffDays > 1) {
          newStreak = 1;
        }

        const newHighest = Math.max(newStreak, userStreak.highestStreak);

        set({
          userStreak: {
            ...userStreak,
            currentStreak: newStreak,
            highestStreak: newHighest,
            lastActiveDate: todayStr,
          },
        });
      },

      resetDemoData: () => {
        set({
          currentUser: DEMO_USERS.learner,
          currentRole: 'learner',
          selectedBatchId: 'batch-edf-402',
          courses: INITIAL_COURSES,
          batches: INITIAL_BATCHES,
          modules: INITIAL_MODULES,
          lessons: INITIAL_LESSONS,
          quizzes: INITIAL_QUIZZES,
          assignments: INITIAL_ASSIGNMENTS,
          enrollments: INITIAL_ENROLLMENTS,
          completedLessonIds: [
            'lesson-1',
            'lesson-wdf-1',
            'lesson-wdf-2',
            'lesson-wdf-3',
            'lesson-ai-1',
          ],
          userCompletedLessons: {
            'user-budi': [
              'lesson-1',
              'lesson-wdf-1',
              'lesson-wdf-2',
              'lesson-wdf-3',
              'lesson-ai-1',
            ],
          },
          quizAttempts: [],
          submissions: [],
          grades: [],
          announcements: INITIAL_ANNOUNCEMENTS,
          certificates: INITIAL_CERTIFICATES,
          userStreak: INITIAL_STREAK,
          notifications: INITIAL_NOTIFICATIONS,
          hasSeenAppTour: false,
        });
      },

      syncUserFromAuth: (user) => {
        const { userCompletedLessons } = get();
        set({
          currentUser: {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            avatarUrl: user.avatarUrl,
            certificateName: user.certificateName || user.fullName,
          },
          currentRole: user.role,
          completedLessonIds: userCompletedLessons[user.id] || [],
        });
      },

      updateCertificateName: (certificateName: string) => {
        const trimmed = certificateName.trim();
        const { currentUser, certificates } = get();
        set({
          currentUser: {
            ...currentUser,
            certificateName: trimmed,
          },
          certificates: certificates.map((c) =>
            c.userId === currentUser.id ? { ...c, studentName: trimmed } : c
          ),
        });
      },

      createBatch: (
        courseTitle,
        courseDescription,
        courseCategory,
        courseLevel,
        batchName,
        startDate,
        endDate,
        maxStudents
      ) => {
        const state = get();
        const timestamp = Date.now();

        // Generate class code: 3 uppercase letters + 3 digits
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const randomLetters = Array.from({ length: 3 }, () =>
          letters.charAt(Math.floor(Math.random() * letters.length))
        ).join('');
        const randomDigits = Math.floor(100 + Math.random() * 900).toString();
        const classCode = `${randomLetters}-${randomDigits}`;

        // Create course
        const newCourse: Course = {
          id: `course-${timestamp}`,
          title: courseTitle,
          slug: courseTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: courseDescription,
          category: courseCategory,
          level: courseLevel,
          thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
        };

        // Create batch
        const newBatch: Batch = {
          id: `batch-${timestamp}`,
          courseId: newCourse.id,
          instructorId: state.currentUser.id,
          instructorName: state.currentUser.fullName,
          batchName,
          classCode,
          startDate,
          endDate,
          status: 'active',
          maxStudents,
        };

        // Create a default Module 1 for the new course
        const newModule: Module = {
          id: `mod-${timestamp}`,
          courseId: newCourse.id,
          title: 'Modul 1: Pendahuluan',
          sequenceNumber: 1,
        };

        set({
          courses: [...state.courses, newCourse],
          batches: [...state.batches, newBatch],
          modules: [...state.modules, newModule],
          selectedBatchId: newBatch.id,
        });

        return { batch: newBatch, course: newCourse, classCode };
      },

      joinBatchByCode: (classCode, userId) => {
        const state = get();
        const normalizedCode = classCode.toUpperCase().trim();

        const batch = state.batches.find(
          (b) => b.classCode.toUpperCase() === normalizedCode
        );

        if (!batch) {
          return { success: false, error: 'Class code not found.' };
        }

        // Check if class is closed/completed
        if (batch.status === 'completed') {
          return {
            success: false,
            error: 'This cohort has ended or is closed. New enrollments are no longer accepted.',
          };
        }

        // Check if already enrolled
        const alreadyEnrolled = state.enrollments.find(
          (e) => e.batchId === batch.id && e.userId === userId
        );
        if (alreadyEnrolled) {
          return { success: false, error: 'You are already enrolled in this cohort.' };
        }

        // Check capacity
        const currentEnrollCount = state.enrollments.filter(
          (e) => e.batchId === batch.id
        ).length;
        if (currentEnrollCount >= batch.maxStudents) {
          return { success: false, error: 'Class is at full capacity.' };
        }

        const newEnrollment: BatchEnrollment = {
          id: `enr-${Date.now()}`,
          batchId: batch.id,
          userId,
          progressPercentage: 0,
          finalScore: 0,
          graduationStatus: 'in_progress',
          enrolledAt: new Date().toISOString(),
        };

        const teacherNotif: InAppNotification = {
          id: `notif-join-${Date.now()}`,
          userId: batch.instructorId,
          title: '👋 New Student Enrolled',
          message: `A new student has enrolled in cohort ${batch.batchName}.`,
          type: 'enrollment',
          isRead: false,
          createdAt: new Date().toISOString(),
          linkRoute: '/(tabs)/grading',
          metadata: {
            batchId: batch.id,
            batchName: batch.batchName,
          },
        };

        set({
          enrollments: [...state.enrollments, newEnrollment],
          selectedBatchId: batch.id,
          notifications: [teacherNotif, ...state.notifications],
        });

        return { success: true, batchId: batch.id };
      },

      updateBatch: (batchId, updates) => {
        set((state) => ({
          batches: state.batches.map((b) =>
            b.id === batchId ? { ...b, ...updates } : b
          ),
        }));
      },

      addNotification: (notification) => {
        const newNotif: InAppNotification = {
          ...notification,
          id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          createdAt: new Date().toISOString(),
          isRead: false,
        };
        set((state) => ({ notifications: [newNotif, ...state.notifications] }));
      },

      markNotificationAsRead: (notificationId: string) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === notificationId ? { ...n, isRead: true } : n
          ),
        }));
      },

      markAllNotificationsAsRead: (userId?: string) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            !userId || n.userId === userId ? { ...n, isRead: true } : n
          ),
        }));
      },

      clearNotifications: (userId?: string) => {
        set((state) => ({
          notifications: userId
            ? state.notifications.filter((n) => n.userId !== userId)
            : [],
        }));
      },

      getTeacherBatches: (instructorId) => {
        return get().batches.filter((b) => b.instructorId === instructorId);
      },

      getStudentEnrollments: (userId) => {
        return get().enrollments.filter((e) => e.userId === userId);
      },
    }),
    {
      name: 'eduflow-hybrid-store',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hasSeenAppTour = false;
          state.batches = state.batches.map((b) => ({
            ...b,
            batchName: b.batchName.replace(/wadhwani/gi, 'Digital'),
          }));
          state.certificates = state.certificates.map((c) => ({
            ...c,
            batchName: c.batchName.replace(/wadhwani/gi, 'Digital'),
            certificateNumber: c.certificateNumber.replace(/WDF/g, 'ENT'),
          }));
          state.courses = state.courses.map((c) => ({
            ...c,
            description: c.description
              .replace(/wadhwani foundation/gi, 'international cohort standards')
              .replace(/wadhwani/gi, 'Digital Entrepreneurship'),
          }));
        }
      },
    }
  )
);
