import { Batch, Course, BatchEnrollment, AssignmentSubmission, SubmissionGrade, QuizAttempt, Module, Lesson, Quiz } from '@/types/elearning';
import { AuthUser } from '@/types/auth';

export interface GradebookRow {
  no: number;
  studentId: string;
  studentName: string;
  studentEmail: string;
  batchId: string;
  batchName: string;
  classCode: string;
  courseTitle: string;
  progressPercentage: number;
  quizAverage: number;
  assignmentScore: number;
  finalScore: number;
  graduationStatus: 'LULUS' | 'DALAM PROSES' | 'BELUM MULAI';
  enrolledAt: string;
}

export interface GradebookSummary {
  totalStudents: number;
  passedCount: number;
  inProgressCount: number;
  averageScore: number;
  completionRate: number;
}

export interface BuildGradebookOptions {
  batches: Batch[];
  courses: Course[];
  modules: Module[];
  lessons: Lesson[];
  quizzes: Quiz[];
  enrollments: BatchEnrollment[];
  submissions: AssignmentSubmission[];
  grades: SubmissionGrade[];
  quizAttempts: QuizAttempt[];
  registeredUsers?: AuthUser[];
  targetBatchId?: string; // 'all' or batchId
  instructorId?: string;  // data isolation
}

/**
 * Membangun baris rekap nilai terstruktur untuk pengajar
 */
export function buildGradebookRows(options: BuildGradebookOptions): GradebookRow[] {
  const {
    batches,
    courses,
    modules,
    quizzes,
    enrollments,
    submissions,
    grades,
    quizAttempts,
    registeredUsers = [],
    targetBatchId = 'all',
    instructorId,
  } = options;

  // 1. Filter batches by instructor (data isolation)
  const accessibleBatches = instructorId
    ? batches.filter((b) => b.instructorId === instructorId)
    : batches;

  const targetBatches =
    targetBatchId === 'all'
      ? accessibleBatches
      : accessibleBatches.filter((b) => b.id === targetBatchId);

  const rows: GradebookRow[] = [];
  let counter = 1;

  targetBatches.forEach((batch) => {
    const course = courses.find((c) => c.id === batch.courseId);
    const courseModules = modules.filter((m) => m.courseId === batch.courseId);
    const courseModuleIds = courseModules.map((m) => m.id);
    const courseQuizIds = quizzes
      .filter((q) => courseModuleIds.includes(q.moduleId))
      .map((q) => q.id);

    const batchEnrollments = enrollments.filter((e) => e.batchId === batch.id);

    batchEnrollments.forEach((enr) => {
      const user = registeredUsers.find((u) => u.id === enr.userId);
      const studentName = user?.fullName || enr.userId;
      const studentEmail = user?.email || 'siswa@eduflow.id';

      // Quiz score average for this course
      const userAttempts = quizAttempts.filter(
        (qa) => qa.userId === enr.userId && courseQuizIds.includes(qa.quizId)
      );
      const quizAvg =
        userAttempts.length > 0
          ? Math.round(
              userAttempts.reduce((acc, q) => acc + q.scorePercentage, 0) /
                userAttempts.length
            )
          : 0;

      // Assignment submissions in this batch
      const userSubmissions = submissions.filter(
        (s) => s.userId === enr.userId && s.batchId === batch.id
      );
      const userGrades = grades.filter((g) =>
        userSubmissions.some((s) => s.id === g.submissionId)
      );
      const assignmentScore =
        userGrades.length > 0
          ? Math.round(
              userGrades.reduce((acc, g) => acc + g.score, 0) / userGrades.length
            )
          : 0;

      // Weighted Final Score: (Progress * 30%) + (Quiz * 30%) + (Assignment * 40%)
      const progressPct = enr.progressPercentage || 0;
      const finalScore = Math.round(
        progressPct * 0.3 + quizAvg * 0.3 + assignmentScore * 0.4
      );

      // Graduation Status
      let status: 'LULUS' | 'DALAM PROSES' | 'BELUM MULAI' = 'BELUM MULAI';
      if (progressPct === 100 && quizAvg >= 80 && assignmentScore >= 75) {
        status = 'LULUS';
      } else if (progressPct > 0 || userSubmissions.length > 0 || userAttempts.length > 0) {
        status = 'DALAM PROSES';
      }

      rows.push({
        no: counter++,
        studentId: enr.userId,
        studentName,
        studentEmail,
        batchId: batch.id,
        batchName: batch.batchName,
        classCode: batch.classCode,
        courseTitle: course?.title || batch.batchName,
        progressPercentage: progressPct,
        quizAverage: quizAvg,
        assignmentScore,
        finalScore,
        graduationStatus: status,
        enrolledAt: enr.enrolledAt ? enr.enrolledAt.split('T')[0] : '2026-10-01',
      });
    });
  });

  return rows;
}

/**
 * Menghitung ringkasan statistik rekap nilai
 */
export function calculateGradebookSummary(rows: GradebookRow[]): GradebookSummary {
  if (rows.length === 0) {
    return {
      totalStudents: 0,
      passedCount: 0,
      inProgressCount: 0,
      averageScore: 0,
      completionRate: 0,
    };
  }

  const passedCount = rows.filter((r) => r.graduationStatus === 'LULUS').length;
  const inProgressCount = rows.filter((r) => r.graduationStatus === 'DALAM PROSES').length;
  const totalScore = rows.reduce((acc, r) => acc + r.finalScore, 0);
  const averageScore = Math.round(totalScore / rows.length);
  const completionRate = Math.round((passedCount / rows.length) * 100);

  return {
    totalStudents: rows.length,
    passedCount,
    inProgressCount,
    averageScore,
    completionRate,
  };
}

/**
 * Mengonversi baris rekap nilai ke string format CSV kompatibel Excel (UTF-8 BOM)
 */
export function formatGradebookCSV(rows: GradebookRow[], className = 'Semua Kelas'): string {
  // UTF-8 BOM so Excel opens with proper Indonesian characters
  const BOM = '\uFEFF';

  const headers = [
    'No',
    'Nama Siswa',
    'Email Siswa',
    'Nama Kelas',
    'Kode Kelas',
    'Materi Selesai (%)',
    'Rata-rata Kuis',
    'Nilai Tugas Proyek',
    'Nilai Akhir Terbobot',
    'Status Kelulusan',
    'Tanggal Pendaftaran',
  ];

  // CSV escape helper
  const escapeCell = (val: string | number) => {
    const str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const metadataLines = [
    `# REKAPITULASI NILAI AKADEMIK SISWA`,
    `# Kelas: ${className}`,
    `# Tanggal Ekspor: ${new Date().toISOString().split('T')[0]}`,
    `# Diterbitkan oleh: EduFlow Cohort Learning System`,
    ``,
  ];

  const headerLine = headers.map(escapeCell).join(',');
  const rowLines = rows.map((r) =>
    [
      r.no,
      r.studentName,
      r.studentEmail,
      r.batchName,
      r.classCode,
      `${r.progressPercentage}%`,
      r.quizAverage,
      r.assignmentScore,
      r.finalScore,
      r.graduationStatus,
      r.enrolledAt,
    ]
      .map(escapeCell)
      .join(',')
  );

  return BOM + metadataLines.join('\n') + headerLine + '\n' + rowLines.join('\n');
}

/**
 * Mengunduh berkas CSV di browser/web
 */
export function downloadCSVFile(csvContent: string, filename: string): boolean {
  try {
    if (typeof document !== 'undefined') {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return true;
    }
  } catch (err) {
    console.error('Download CSV error:', err);
  }
  return false;
}

/**
 * Menyalin konten CSV ke clipboard
 */
export async function copyCSVToClipboard(csvContent: string): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(csvContent);
      return true;
    }
  } catch (err) {
    console.error('Clipboard copy error:', err);
  }
  return false;
}
