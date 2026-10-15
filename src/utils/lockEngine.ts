import {
  Lesson,
  Quiz,
  Assignment,
  QuizAttempt,
  AssignmentSubmission,
  SubmissionGrade,
} from '@/types/elearning';

export interface LockStateSnapshot {
  completedLessonIds: string[];
  quizAttempts: QuizAttempt[];
  submissions: AssignmentSubmission[];
  grades: SubmissionGrade[];
}

/**
 * Memeriksa apakah sebuah lesson terbuka berdasarkan materi prasyarat
 */
export function isLessonUnlocked(
  lesson: Lesson,
  allLessons: Lesson[],
  quizzes: Quiz[],
  snapshot: LockStateSnapshot
): boolean {
  // Lesson pertama di Modul 1 selalu terbuka
  if (lesson.moduleId === 'mod-1' && lesson.sequenceNumber === 1) {
    return true;
  }

  // Jika di Modul 1, lesson berikutnya butuh lesson sebelumnya selesai
  if (lesson.moduleId === 'mod-1') {
    const prevLesson = allLessons.find(
      (l) => l.moduleId === 'mod-1' && l.sequenceNumber === lesson.sequenceNumber - 1
    );
    return prevLesson ? snapshot.completedLessonIds.includes(prevLesson.id) : true;
  }

  // Jika di Modul 2, syaratnya adalah Kuis Modul 1 harus sudah lulus!
  if (lesson.moduleId === 'mod-2') {
    const quiz1Passed = snapshot.quizAttempts.some(
      (q) => q.quizId === 'quiz-mod-1' && q.isPassed
    );
    if (!quiz1Passed) return false;

    // Dan jika sequence > 1, butuh lesson sebelumnya selesai
    if (lesson.sequenceNumber > 1) {
      const prevLesson = allLessons.find(
        (l) => l.moduleId === 'mod-2' && l.sequenceNumber === lesson.sequenceNumber - 1
      );
      return prevLesson ? snapshot.completedLessonIds.includes(prevLesson.id) : true;
    }

    return true;
  }

  // Untuk modul kelas lain (misal: Entrepreneurship atau AI):
  // Lesson sequence 1 selalu terbuka
  if (lesson.sequenceNumber === 1) {
    return true;
  }
  // Sequence berikutnya terbuka jika lesson sebelumnya selesai
  const prevLesson = allLessons.find(
    (l) => l.moduleId === lesson.moduleId && l.sequenceNumber === lesson.sequenceNumber - 1
  );
  return prevLesson ? snapshot.completedLessonIds.includes(prevLesson.id) : true;
}

/**
 * Memeriksa apakah kuis modul terbuka
 */
export function isQuizUnlocked(
  quiz: Quiz,
  allLessons: Lesson[],
  snapshot: LockStateSnapshot
): boolean {
  // Semua lesson di modul tersebut harus sudah ditandai selesai
  const moduleLessons = allLessons.filter((l) => l.moduleId === quiz.moduleId);
  const allLessonsDone = moduleLessons.every((l) =>
    snapshot.completedLessonIds.includes(l.id)
  );

  return allLessonsDone;
}

/**
 * Memeriksa apakah tugas proyek terbuka
 */
export function isAssignmentUnlocked(
  assignment: Assignment,
  snapshot: LockStateSnapshot
): boolean {
  // Tugas di Modul 1 langsung terbuka untuk dikerjakan siswa
  if (assignment.moduleId === 'mod-1') {
    return true;
  }

  // Tugas di Modul 2 (atau modul lanjutan) terbuka jika Kuis Modul 1 sudah lulus
  if (assignment.moduleId === 'mod-2') {
    const quiz1Passed = snapshot.quizAttempts.some(
      (q) => q.quizId === 'quiz-mod-1' && q.isPassed
    );
    return quiz1Passed;
  }

  // Tugas di modul lain terbuka secara default
  return true;
}

/**
 * Menghitung rekap kelulusan terbobot untuk batch
 */
export function calculateBatchEvaluation(
  totalLessonsCount: number,
  snapshot: LockStateSnapshot,
  batchLessonIds?: string[]
) {
  // 1. Progres Lesson
  const completedCount = batchLessonIds
    ? snapshot.completedLessonIds.filter((id) => batchLessonIds.includes(id)).length
    : snapshot.completedLessonIds.length;
  const effectiveTotal = batchLessonIds ? batchLessonIds.length : totalLessonsCount;
  const lessonProgressPct =
    effectiveTotal > 0 ? Math.round((completedCount / effectiveTotal) * 100) : 0;

  // 2. Rata-rata Kuis Lulus
  const passedQuizzes = snapshot.quizAttempts.filter((q) => q.isPassed);
  const quizAvg =
    passedQuizzes.length > 0
      ? Math.round(
          passedQuizzes.reduce((acc, curr) => acc + curr.scorePercentage, 0) /
            passedQuizzes.length
        )
      : 0;

  // 3. Nilai Tugas dari Pengajar
  const assignmentGrade = snapshot.grades.length > 0 ? snapshot.grades[0].score : 0;

  // Weighted formula:
  // Final Score = (Lesson Progress * 30%) + (Quiz Avg * 30%) + (Assignment * 40%)
  const finalScore = Math.round(
    lessonProgressPct * 0.3 + quizAvg * 0.3 + assignmentGrade * 0.4
  );

  const isAllLessonsDone = completedCount >= effectiveTotal && effectiveTotal > 0;
  const isQuizzesDone = snapshot.quizAttempts.some(
    (q) => q.quizId === 'quiz-mod-1' && q.isPassed
  );
  const isAssignmentGraded = snapshot.grades.length > 0 && assignmentGrade >= 75;

  const canGraduate =
    isAllLessonsDone && isQuizzesDone && isAssignmentGraded && finalScore >= 75;

  return {
    completedLessons: completedCount,
    totalLessons: effectiveTotal,
    lessonProgressPct,
    quizAvg,
    assignmentGrade,
    finalScore,
    canGraduate,
  };
}

