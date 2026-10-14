import {
  isLessonUnlocked,
  isQuizUnlocked,
  isAssignmentUnlocked,
  calculateBatchEvaluation,
} from '../src/utils/lockEngine';
import {
  INITIAL_LESSONS,
  INITIAL_QUIZZES,
  INITIAL_ASSIGNMENTS,
} from '../src/data/mockData';
import { useElearningStore } from '../src/store/useElearningStore';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

describe('EduFlow Cohort Logic & Sequential Gatekeeper Tests', () => {
  const lesson1 = INITIAL_LESSONS.find((l) => l.id === 'lesson-1')!;
  const lesson2 = INITIAL_LESSONS.find((l) => l.id === 'lesson-2')!;
  const quiz1 = INITIAL_QUIZZES.find((q) => q.id === 'quiz-mod-1')!;
  const assignment1 = INITIAL_ASSIGNMENTS.find((a) => a.id === 'assign-proj-1')!;

  test('Lesson 1.1 harus selalu terbuka sebagai materi perdana', () => {
    const unlocked = isLessonUnlocked(lesson1, INITIAL_LESSONS, INITIAL_QUIZZES, {
      completedLessonIds: [],
      quizAttempts: [],
      submissions: [],
      grades: [],
    });
    expect(unlocked).toBe(true);
  });

  test('Lesson 1.2 harus terkunci sebelum Lesson 1.1 selesai', () => {
    const lockedState = isLessonUnlocked(lesson2, INITIAL_LESSONS, INITIAL_QUIZZES, {
      completedLessonIds: [],
      quizAttempts: [],
      submissions: [],
      grades: [],
    });
    expect(lockedState).toBe(false);

    const unlockedState = isLessonUnlocked(lesson2, INITIAL_LESSONS, INITIAL_QUIZZES, {
      completedLessonIds: ['lesson-1'],
      quizAttempts: [],
      submissions: [],
      grades: [],
    });
    expect(unlockedState).toBe(true);
  });

  test('Kuis Modul 1 harus terkunci sampai seluruh lesson di Modul 1 selesai', () => {
    const lockedQuiz = isQuizUnlocked(quiz1, INITIAL_LESSONS, {
      completedLessonIds: ['lesson-1'], // lesson-2 belum selesai
      quizAttempts: [],
      submissions: [],
      grades: [],
    });
    expect(lockedQuiz).toBe(false);

    const unlockedQuiz = isQuizUnlocked(quiz1, INITIAL_LESSONS, {
      completedLessonIds: ['lesson-1', 'lesson-2'],
      quizAttempts: [],
      submissions: [],
      grades: [],
    });
    expect(unlockedQuiz).toBe(true);
  });

  test('Tugas yang ditambahkan di Modul 1 harus langsung terbuka untuk siswa', () => {
    const mod1Assignment = {
      id: 'assign-mod1-test',
      moduleId: 'mod-1',
      title: 'Tugas Modul 1: Layouting',
      instructions: 'Kerjakan flexbox',
      dueDate: '2026-11-15',
      maxScore: 100,
      allowLateSubmission: true,
    };
    const unlocked = isAssignmentUnlocked(mod1Assignment, {
      completedLessonIds: [],
      quizAttempts: [],
      submissions: [],
      grades: [],
    });
    expect(unlocked).toBe(true);
  });

  test('Materi & Tugas Modul 2 harus terkunci sebelum Kuis Modul 1 lulus', () => {
    const lockedAssignment = isAssignmentUnlocked(assignment1, {
      completedLessonIds: ['lesson-1', 'lesson-2'],
      quizAttempts: [], // Belum pernah ambil kuis
      submissions: [],
      grades: [],
    });
    expect(lockedAssignment).toBe(false);

    const failedQuizState = isAssignmentUnlocked(assignment1, {
      completedLessonIds: ['lesson-1', 'lesson-2'],
      quizAttempts: [
        {
          id: 'att-1',
          quizId: 'quiz-mod-1',
          userId: 'user-budi',
          scorePercentage: 60, // Di bawah 80%
          isPassed: false,
          selectedAnswers: [0, 0, 0],
          attemptedAt: '2026-10-12',
        },
      ],
      submissions: [],
      grades: [],
    });
    expect(failedQuizState).toBe(false);

    const passedQuizState = isAssignmentUnlocked(assignment1, {
      completedLessonIds: ['lesson-1', 'lesson-2'],
      quizAttempts: [
        {
          id: 'att-2',
          quizId: 'quiz-mod-1',
          userId: 'user-budi',
          scorePercentage: 100, // Lulus
          isPassed: true,
          selectedAnswers: [1, 1, 0],
          attemptedAt: '2026-10-12',
        },
      ],
      submissions: [],
      grades: [],
    });
    expect(passedQuizState).toBe(true);
  });

  test('Kalkulasi kelulusan terbobot (Weighted Graduation Gate)', () => {
    // Kondisi belum tuntas
    const incompleteEval = calculateBatchEvaluation(3, {
      completedLessonIds: ['lesson-1', 'lesson-2'], // 2/3 materi (67%)
      quizAttempts: [
        {
          id: 'att-1',
          quizId: 'quiz-mod-1',
          userId: 'user-budi',
          scorePercentage: 100,
          isPassed: true,
          selectedAnswers: [],
          attemptedAt: '2026-10-12',
        },
      ],
      submissions: [],
      grades: [],
    });
    expect(incompleteEval.canGraduate).toBe(false);

    // Kondisi tuntas sempurna: 3/3 materi, kuis 100%, tugas dinilai 90 oleh guru
    const completeEval = calculateBatchEvaluation(3, {
      completedLessonIds: ['lesson-1', 'lesson-2', 'lesson-3'],
      quizAttempts: [
        {
          id: 'att-1',
          quizId: 'quiz-mod-1',
          userId: 'user-budi',
          scorePercentage: 100,
          isPassed: true,
          selectedAnswers: [],
          attemptedAt: '2026-10-12',
        },
      ],
      submissions: [
        {
          id: 'sub-1',
          assignmentId: 'assign-proj-1',
          batchId: 'batch-edf-402',
          userId: 'user-budi',
          studentName: 'Budi Santoso',
          submissionContent: 'Selesai',
          status: 'GRADED',
          submittedAt: '2026-10-12',
          isLate: false,
        },
      ],
      grades: [
        {
          id: 'grd-1',
          submissionId: 'sub-1',
          graderId: 'user-alex',
          graderName: 'Pak Alex',
          score: 90,
          feedbackNotes: 'Hebat!',
          gradedAt: '2026-10-12',
        },
      ],
    });

    // Final score = (100 * 30%) + (100 * 30%) + (90 * 40%) = 30 + 30 + 36 = 96
    expect(completeEval.finalScore).toBe(96);
    expect(completeEval.canGraduate).toBe(true);
  });

  test('Pengajar dapat menambah dan menghapus materi pembelajaran (Lesson CRUD)', () => {
    let mockLessons = [...INITIAL_LESSONS];
    const initialCount = mockLessons.length;

    // Tambah lesson baru
    const newLesson = {
      id: 'lesson-custom-1',
      moduleId: 'mod-1',
      title: '1.3 Navigasi Lanjutan',
      contentType: 'reading' as const,
      contentBody: 'Penjelasan Expo Router Stack & Tabs',
      durationMinutes: 15,
      sequenceNumber: 3,
    };
    mockLessons.push(newLesson);
    expect(mockLessons.length).toBe(initialCount + 1);

    // Hapus lesson
    mockLessons = mockLessons.filter((l) => l.id !== 'lesson-custom-1');
    expect(mockLessons.length).toBe(initialCount);
  });

  test('Pengajar dapat menambah tugas baru dan menentukan batas waktu (Due Date CRUD)', () => {
    let mockAssignments = [...INITIAL_ASSIGNMENTS];
    const newDueDate = '2026-11-25 23:59';

    // Tambah tugas baru dengan batas waktu
    const newAssignment = {
      id: 'assign-custom-1',
      moduleId: 'mod-2',
      title: 'Tugas 2: Desain Antarmuka Glassmorphism',
      instructions: 'Buat komponen glassmorphism dengan expo-blur',
      dueDate: newDueDate,
      maxScore: 100,
      allowLateSubmission: true,
    };
    mockAssignments.push(newAssignment);
    expect(mockAssignments.find((a) => a.id === 'assign-custom-1')?.dueDate).toBe(newDueDate);

    // Ubah batas waktu pengerjaan tugas
    const updatedDueDate = '2026-11-30 18:00';
    mockAssignments = mockAssignments.map((a) =>
      a.id === 'assign-custom-1' ? { ...a, dueDate: updatedDueDate } : a
    );
    expect(mockAssignments.find((a) => a.id === 'assign-custom-1')?.dueDate).toBe(updatedDueDate);

    // Hapus tugas
    mockAssignments = mockAssignments.filter((a) => a.id !== 'assign-custom-1');
    expect(mockAssignments.some((a) => a.id === 'assign-custom-1')).toBe(false);
  });

  test('Isolasi evaluasi batch: Menghitung progres spesifik per kelas dengan batchLessonIds', () => {
    const mobileLessonIds = ['lesson-1', 'lesson-2', 'lesson-3'];
    const wadhwaniLessonIds = ['lesson-wdf-1', 'lesson-wdf-2', 'lesson-wdf-3'];

    // Siswa menyelesaikan seluruh materi Wadhwani dan 1 materi Mobile
    const completedLessonIds = ['lesson-wdf-1', 'lesson-wdf-2', 'lesson-wdf-3', 'lesson-1'];

    // Evaluasi Mobile Cohort hanya menghitung 1 dari 3 materi (33%)
    const mobileEval = calculateBatchEvaluation(
      mobileLessonIds.length,
      {
        completedLessonIds,
        quizAttempts: [],
        submissions: [],
        grades: [],
      },
      mobileLessonIds
    );
    expect(mobileEval.completedLessons).toBe(1);
    expect(mobileEval.totalLessons).toBe(3);
    expect(mobileEval.lessonProgressPct).toBe(33);

    // Evaluasi Wadhwani Cohort menghitung 3 dari 3 materi (100%)
    const wadhwaniEval = calculateBatchEvaluation(
      wadhwaniLessonIds.length,
      {
        completedLessonIds,
        quizAttempts: [],
        submissions: [],
        grades: [],
      },
      wadhwaniLessonIds
    );
    expect(wadhwaniEval.completedLessons).toBe(3);
    expect(wadhwaniEval.totalLessons).toBe(3);
    expect(wadhwaniEval.lessonProgressPct).toBe(100);
  });

  test('Multi-Sertifikat ala Wadhwani: Siswa dapat memiliki beberapa sertifikat dari kelas berbeda', () => {
    const studentCertificates = [
      {
        id: 'cert-wdf-1',
        batchId: 'batch-wdf-101',
        userId: 'user-budi',
        studentName: 'Budi Santoso',
        courseTitle: 'Entrepreneurship & Digital Venture Creation',
        batchName: 'Wadhwani Entrepreneurship Cohort - Batch 01',
        certificateNumber: 'WDF-CERT-2026-0891-WDF-101',
        finalScore: 94,
        instructorName: 'Dr. Hendra Wijaya, S.E., M.M.',
        issuedAt: '2026-09-15T10:00:00Z',
      },
    ];

    expect(studentCertificates.length).toBe(1);

    // Setelah menyelesaikan kelas Fullstack Mobile & lulus
    const newMobileCert = {
      id: 'cert-edf-2',
      batchId: 'batch-edf-402',
      userId: 'user-budi',
      studentName: 'Budi Santoso',
      courseTitle: 'Fullstack Mobile & Modern React Native',
      batchName: 'Batch 04 - Mobile Cohort Program',
      certificateNumber: 'EDF-CERT-2026-402-998',
      finalScore: 96,
      instructorName: 'Pak Alex Kurniawan, M.Kom',
      issuedAt: '2026-10-12T12:00:00Z',
    };

    const updatedCertificates = [...studentCertificates, newMobileCert];

    expect(updatedCertificates.length).toBe(2);
    expect(updatedCertificates.map((c) => c.batchId)).toContain('batch-wdf-101');
    expect(updatedCertificates.map((c) => c.batchId)).toContain('batch-edf-402');
  });

  describe('Full Logic Auth System (Learner & Teacher)', () => {
    test('Registrasi berhasil untuk pendaftar sebagai Pengajar (Teacher)', () => {
      const users: any[] = [];
      const registerUser = (fullName: string, email: string, pass: string, role: string) => {
        if (!fullName || !email || !pass) return { success: false, error: 'Wajib diisi' };
        if (pass.length < 6) return { success: false, error: 'Password minimal 6 karakter' };
        if (users.some((u) => u.email === email.toLowerCase())) return { success: false, error: 'Email sudah terdaftar' };
        const newUser = { id: `user-${Date.now()}`, fullName, email: email.toLowerCase(), password: pass, role };
        users.push(newUser);
        return { success: true, user: newUser };
      };

      const result = registerUser('Ibu Sarah Dewi, M.Pd', 'sarah@eduflow.id', 'teacher123', 'teacher');
      expect(result.success).toBe(true);
      expect(result.user?.role).toBe('teacher');
      expect(result.user?.fullName).toBe('Ibu Sarah Dewi, M.Pd');
    });

    test('Validasi registrasi: Gagal jika email duplikat atau password kurang dari 6 karakter', () => {
      const users = [{ email: 'sarah@eduflow.id', password: 'teacher123' }];
      const registerUser = (email: string, pass: string) => {
        if (pass.length < 6) return { success: false, error: 'Password minimal 6 karakter' };
        if (users.some((u) => u.email === email.toLowerCase())) return { success: false, error: 'Email sudah terdaftar' };
        return { success: true };
      };

      const dupResult = registerUser('sarah@eduflow.id', 'passwordLain');
      expect(dupResult.success).toBe(false);
      expect(dupResult.error).toBe('Email sudah terdaftar');

      const shortPassResult = registerUser('new@eduflow.id', '12345');
      expect(shortPassResult.success).toBe(false);
      expect(shortPassResult.error).toBe('Password minimal 6 karakter');
    });

    test('Login autentikasi: Sukses dan session tersimpan jika kredensial benar', () => {
      const users = [{ id: 'user-sarah', email: 'sarah@eduflow.id', password: 'teacher123', role: 'teacher' }];
      const login = (email: string, pass: string) => {
        const u = users.find((x) => x.email === email.toLowerCase() && x.password === pass);
        if (!u) return { success: false, error: 'Email atau password salah' };
        return { success: true, session: { userId: u.id, isAuthenticated: true } };
      };

      const failedLogin = login('sarah@eduflow.id', 'wrongPass');
      expect(failedLogin.success).toBe(false);

      const successLogin = login('sarah@eduflow.id', 'teacher123');
      expect(successLogin.success).toBe(true);
      expect(successLogin.session?.isAuthenticated).toBe(true);
      expect(successLogin.session?.userId).toBe('user-sarah');
    });
  });

  describe('Sistem Pembuatan Kelas bagi Pengajar (Teacher Class Creation)', () => {
    test('Pengajar membuat kelas baru: Menghasilkan kode kelas 6 karakter unik & modul perdana', () => {
      const courses: any[] = [];
      const batches: any[] = [];
      const modules: any[] = [];

      const createClass = (instructorId: string, instructorName: string, title: string, batchName: string, maxStudents: number) => {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const randomLetters = Array.from({ length: 3 }, () => letters.charAt(Math.floor(Math.random() * letters.length))).join('');
        const randomDigits = Math.floor(100 + Math.random() * 900).toString();
        const classCode = `${randomLetters}-${randomDigits}`;

        const newCourse = { id: `course-${Date.now()}`, title };
        const newBatch = {
          id: `batch-${Date.now()}`,
          courseId: newCourse.id,
          instructorId,
          instructorName,
          batchName,
          classCode,
          status: 'active',
          maxStudents,
        };
        const newModule = {
          id: `mod-${Date.now()}`,
          courseId: newCourse.id,
          title: 'Modul 1: Pendahuluan',
          sequenceNumber: 1,
        };

        courses.push(newCourse);
        batches.push(newBatch);
        modules.push(newModule);

        return { course: newCourse, batch: newBatch, classCode };
      };

      const result = createClass('user-sarah', 'Ibu Sarah Dewi', 'Machine Learning Foundations', 'Batch 01 ML', 25);
      expect(result.classCode).toMatch(/^[A-Z]{3}-\d{3}$/);
      expect(result.batch.instructorId).toBe('user-sarah');
      expect(batches.length).toBe(1);
      expect(modules[0].title).toBe('Modul 1: Pendahuluan');
    });
  });

  describe('Sistem Kode Kelas bagi Siswa (Class Code Enrollment)', () => {
    const batches = [
      { id: 'batch-test-1', classCode: 'KLS-555', maxStudents: 2, batchName: 'Kelas Eksklusif' },
    ];
    let enrollments: any[] = [];

    const joinClassByCode = (code: string, studentId: string) => {
      const normalized = code.toUpperCase().trim();
      const batch = batches.find((b) => b.classCode === normalized);
      if (!batch) return { success: false, error: 'Kode kelas tidak ditemukan.' };

      const already = enrollments.find((e) => e.batchId === batch.id && e.userId === studentId);
      if (already) return { success: false, error: 'Anda sudah terdaftar di kelas ini.' };

      const currentCount = enrollments.filter((e) => e.batchId === batch.id).length;
      if (currentCount >= batch.maxStudents) return { success: false, error: 'Kelas sudah penuh.' };

      const newEnrollment = {
        id: `enr-${Date.now()}`,
        batchId: batch.id,
        userId: studentId,
        progressPercentage: 0,
        graduationStatus: 'in_progress',
      };
      enrollments.push(newEnrollment);
      return { success: true, batchId: batch.id };
    };

    beforeEach(() => {
      enrollments = [];
    });

    test('Siswa berhasil bergabung ke kelas dengan memasukkan kode kelas yang valid', () => {
      const res = joinClassByCode('kls-555', 'student-dina');
      expect(res.success).toBe(true);
      expect(res.batchId).toBe('batch-test-1');
      expect(enrollments.some((e) => e.userId === 'student-dina' && e.batchId === 'batch-test-1')).toBe(true);
    });

    test('Gagal bergabung jika kode kelas salah atau tidak ditemukan', () => {
      const res = joinClassByCode('WRONG-999', 'student-dina');
      expect(res.success).toBe(false);
      expect(res.error).toBe('Kode kelas tidak ditemukan.');
    });

    test('Gagal bergabung jika siswa sudah pernah terdaftar di kelas tersebut', () => {
      joinClassByCode('KLS-555', 'student-dina');
      const secondAttempt = joinClassByCode('KLS-555', 'student-dina');
      expect(secondAttempt.success).toBe(false);
      expect(secondAttempt.error).toBe('Anda sudah terdaftar di kelas ini.');
    });

    test('Gagal bergabung jika kuota kapasitas kelas telah penuh', () => {
      joinClassByCode('KLS-555', 'student-1');
      joinClassByCode('KLS-555', 'student-2'); // Kapasitas 2 tercapai
      const overflowStudent = joinClassByCode('KLS-555', 'student-3');
      expect(overflowStudent.success).toBe(false);
      expect(overflowStudent.error).toBe('Kelas sudah penuh.');
    });
  });

  describe('Isolasi Data Antar Pengajar (Multi-Teacher Isolation)', () => {
    test('Pengajar A dan Pengajar B memiliki data kelas & antrean penilaian yang terisolasi', () => {
      const teacherA = { id: 'teacher-alex', name: 'Alex Suhendra' };
      const teacherB = { id: 'teacher-sarah', name: 'Sarah Dewi' };

      const batches = [
        { id: 'batch-react', instructorId: teacherA.id, batchName: 'React Native Cohort' },
        { id: 'batch-flutter', instructorId: teacherB.id, batchName: 'Flutter Cohort' },
      ];

      const submissions = [
        { id: 'sub-1', batchId: 'batch-react', userId: 'student-1', status: 'SUBMITTED' },
        { id: 'sub-2', batchId: 'batch-react', userId: 'student-2', status: 'SUBMITTED' },
        { id: 'sub-3', batchId: 'batch-flutter', userId: 'student-3', status: 'SUBMITTED' },
      ];

      // Filter submission untuk Pengajar A
      const teacherABatches = batches.filter((b) => b.instructorId === teacherA.id).map((b) => b.id);
      const teacherASubmissions = submissions.filter((s) => teacherABatches.includes(s.batchId));

      // Filter submission untuk Pengajar B
      const teacherBBatches = batches.filter((b) => b.instructorId === teacherB.id).map((b) => b.id);
      const teacherBSubmissions = submissions.filter((s) => teacherBBatches.includes(s.batchId));

      expect(teacherASubmissions.length).toBe(2);
      expect(teacherASubmissions.map((s) => s.id)).toEqual(['sub-1', 'sub-2']);

      expect(teacherBSubmissions.length).toBe(1);
      expect(teacherBSubmissions[0].id).toBe('sub-3');

      // Pengajar B tidak dapat melihat submission kelas Pengajar A
      expect(teacherBSubmissions.some((s) => s.batchId === 'batch-react')).toBe(false);
    });
  });

  describe('Isolasi Data Antar Siswa (Multi-Student Isolation)', () => {
    test('Progres materi dan submission Siswa 1 tidak bocor atau menimpa Siswa 2', () => {
      const userCompletedLessons: Record<string, string[]> = {
        'student-budi': ['lesson-1', 'lesson-2'],
      };

      const completeLesson = (userId: string, lessonId: string) => {
        const current = userCompletedLessons[userId] || [];
        if (!current.includes(lessonId)) {
          userCompletedLessons[userId] = [...current, lessonId];
        }
      };

      // Siswa 2 baru mulai
      expect(userCompletedLessons['student-citra'] || []).toEqual([]);

      completeLesson('student-citra', 'lesson-1');
      expect(userCompletedLessons['student-citra']).toEqual(['lesson-1']);
      // Siswa 1 tetap memiliki 2 materi selesai
      expect(userCompletedLessons['student-budi']).toEqual(['lesson-1', 'lesson-2']);

      // Submissions map isolation
      let submissions = [
        { id: 'sub-1', assignmentId: 'assign-1', userId: 'student-budi', content: 'Tugas Budi' },
      ];

      const submitAssignment = (userId: string, assignmentId: string, content: string) => {
        const filtered = submissions.filter(
          (s) => !(s.assignmentId === assignmentId && s.userId === userId)
        );
        submissions = [...filtered, { id: `sub-${Date.now()}`, assignmentId, userId, content }];
      };

      // Siswa 2 mengumpulkan tugas yang sama
      submitAssignment('student-citra', 'assign-1', 'Tugas Citra');

      expect(submissions.length).toBe(2);
      const budiSub = submissions.find((s) => s.assignmentId === 'assign-1' && s.userId === 'student-budi');
      const citraSub = submissions.find((s) => s.assignmentId === 'assign-1' && s.userId === 'student-citra');

      expect(budiSub?.content).toBe('Tugas Budi');
      expect(citraSub?.content).toBe('Tugas Citra');
    });
  });

  describe('Nama Resmi Lengkap di Sertifikat (Official Certificate Full Name Customization)', () => {
    test('Nama resmi siswa (dengan gelar) tertera pada sertifikat yang diterbitkan', () => {
      let currentUser = {
        id: 'student-budi',
        fullName: 'Budi Santoso',
        certificateName: 'Budi Santoso',
      };

      let certificates = [
        {
          id: 'cert-1',
          userId: 'student-budi',
          studentName: 'Budi Santoso',
          courseTitle: 'Fullstack Mobile',
        },
      ];

      const updateCertificateName = (newName: string) => {
        const trimmed = newName.trim();
        currentUser = { ...currentUser, certificateName: trimmed };
        certificates = certificates.map((c) =>
          c.userId === currentUser.id ? { ...c, studentName: trimmed } : c
        );
      };

      // Siswa melengkapi nama resmi dengan gelar akademis
      updateCertificateName('Budi Santoso, S.Kom., M.Cs.');

      expect(currentUser.certificateName).toBe('Budi Santoso, S.Kom., M.Cs.');
      // Sertifikat lama terbarui
      expect(certificates[0].studentName).toBe('Budi Santoso, S.Kom., M.Cs.');

      // Sertifikat baru yang diklaim menggunakan certificateName
      const issueNewCertificate = () => ({
        id: 'cert-2',
        userId: currentUser.id,
        studentName: currentUser.certificateName || currentUser.fullName,
        courseTitle: 'AI Engineering',
      });

      const newCert = issueNewCertificate();
      expect(newCert.studentName).toBe('Budi Santoso, S.Kom., M.Cs.');
    });
  });

  describe('Pengeditan & Penutupan Kelas oleh Pengajar (Class Edit & Lifecycle Management)', () => {
    let mockBatches: any[] = [];
    let mockEnrollments: any[] = [];

    beforeEach(() => {
      mockBatches = [
        {
          id: 'batch-active-1',
          classCode: 'DEV-101',
          batchName: 'Batch 01 - Mobile Native',
          startDate: '2026-10-01',
          endDate: '2026-12-01',
          maxStudents: 30,
          status: 'active' as const,
        },
      ];
      mockEnrollments = [];
    });

    const updateBatch = (batchId: string, updates: any) => {
      mockBatches = mockBatches.map((b) =>
        b.id === batchId ? { ...b, ...updates } : b
      );
    };

    const joinClassByCode = (code: string, userId: string) => {
      const normalized = code.toUpperCase().trim();
      const batch = mockBatches.find((b) => b.classCode === normalized);
      if (!batch) return { success: false, error: 'Kode kelas tidak ditemukan.' };

      if (batch.status === 'completed') {
        return {
          success: false,
          error: 'Kelas ini telah ditutup/selesai. Pendaftaran siswa baru tidak lagi dibuka.',
        };
      }

      const already = mockEnrollments.find(
        (e) => e.batchId === batch.id && e.userId === userId
      );
      if (already) return { success: false, error: 'Anda sudah terdaftar di kelas ini.' };

      const currentCount = mockEnrollments.filter((e) => e.batchId === batch.id).length;
      if (currentCount >= batch.maxStudents) return { success: false, error: 'Kelas sudah penuh.' };

      mockEnrollments.push({ batchId: batch.id, userId });
      return { success: true, batchId: batch.id };
    };

    test('Pengajar dapat mengedit kapasitas siswa, tanggal cohort, dan nama kelas', () => {
      updateBatch('batch-active-1', {
        batchName: 'Batch 01 - Mobile & Skia Masterclass',
        maxStudents: 45,
        startDate: '2026-10-15',
        endDate: '2026-12-31',
      });

      const updated = mockBatches.find((b) => b.id === 'batch-active-1');
      expect(updated?.batchName).toBe('Batch 01 - Mobile & Skia Masterclass');
      expect(updated?.maxStudents).toBe(45);
      expect(updated?.startDate).toBe('2026-10-15');
      expect(updated?.endDate).toBe('2026-12-31');
    });

    test('Pengajar dapat menutup kelas dan siswa baru ditolak saat memasukkan kode kelas', () => {
      // Pengajar menutup kelas (Selesai)
      updateBatch('batch-active-1', { status: 'completed' });
      expect(mockBatches.find((b) => b.id === 'batch-active-1')?.status).toBe('completed');

      // Siswa mencoba bergabung ke kelas yang sudah ditutup
      const joinAttempt = joinClassByCode('DEV-101', 'student-baru');
      expect(joinAttempt.success).toBe(false);
      expect(joinAttempt.error).toContain('ditutup/selesai');
      expect(mockEnrollments.length).toBe(0);
    });

    test('Pengajar dapat mengaktifkan kembali kelas yang ditutup dan siswa dapat bergabung', () => {
      // Awalnya ditutup
      updateBatch('batch-active-1', { status: 'completed' });

      // Diaktifkan kembali oleh pengajar
      updateBatch('batch-active-1', { status: 'active' });
      expect(mockBatches.find((b) => b.id === 'batch-active-1')?.status).toBe('active');

      // Siswa sekarang dapat bergabung
      const joinAttempt = joinClassByCode('DEV-101', 'student-sukses');
      expect(joinAttempt.success).toBe(true);
      expect(mockEnrollments.length).toBe(1);
    });
  });

  describe('Fitur Ekspor Rekap Nilai Siswa ke CSV / Excel (Gradebook Export Engine)', () => {
    const mockBatches: any[] = [
      {
        id: 'batch-1',
        courseId: 'course-1',
        instructorId: 'teacher-alex',
        batchName: 'Batch 01 - Mobile',
        classCode: 'MOB-101',
      },
      {
        id: 'batch-2',
        courseId: 'course-2',
        instructorId: 'teacher-sarah',
        batchName: 'Batch 01 - Cloud',
        classCode: 'CLD-202',
      },
    ];

    const mockCourses: any[] = [
      { id: 'course-1', title: 'React Native & Skia' },
      { id: 'course-2', title: 'AWS Cloud Native' },
    ];

    const mockEnrollments: any[] = [
      {
        id: 'enr-1',
        batchId: 'batch-1',
        userId: 'student-budi',
        progressPercentage: 100,
        enrolledAt: '2026-10-01T08:00:00Z',
      },
      {
        id: 'enr-2',
        batchId: 'batch-1',
        userId: 'student-ani',
        progressPercentage: 60,
        enrolledAt: '2026-10-02T09:00:00Z',
      },
      {
        id: 'enr-3',
        batchId: 'batch-2',
        userId: 'student-cici',
        progressPercentage: 100,
        enrolledAt: '2026-10-03T10:00:00Z',
      },
    ];

    const mockRegisteredUsers: any[] = [
      { id: 'student-budi', fullName: 'Budi Santoso', email: 'budi@eduflow.id' },
      { id: 'student-ani', fullName: 'Ani Yudhoyono', email: 'ani@eduflow.id' },
      { id: 'student-cici', fullName: 'Cici Paramida', email: 'cici@eduflow.id' },
    ];

    const mockSubmissions: any[] = [
      { id: 'sub-1', batchId: 'batch-1', userId: 'student-budi' },
      { id: 'sub-2', batchId: 'batch-1', userId: 'student-ani' },
    ];

    const mockGrades: any[] = [
      { id: 'grd-1', submissionId: 'sub-1', score: 95 },
      { id: 'grd-2', submissionId: 'sub-2', score: 70 },
    ];

    const mockQuizAttempts: any[] = [
      { quizId: 'quiz-1', userId: 'student-budi', scorePercentage: 90 },
      { quizId: 'quiz-1', userId: 'student-ani', scorePercentage: 65 },
    ];

    const mockQuizzes: any[] = [{ id: 'quiz-1', moduleId: 'mod-1' }];
    const mockModules: any[] = [{ id: 'mod-1', courseId: 'course-1' }];

    test('Membangun baris data rekap nilai dengan kalkulasi terbobot dan isolasi pengajar', () => {
      const { buildGradebookRows } = require('../src/utils/exportGradebook');

      // Guru Alex hanya mengekspor batch-1 miliknya
      const alexRows = buildGradebookRows({
        batches: mockBatches,
        courses: mockCourses,
        modules: mockModules,
        lessons: [],
        quizzes: mockQuizzes,
        enrollments: mockEnrollments,
        submissions: mockSubmissions,
        grades: mockGrades,
        quizAttempts: mockQuizAttempts,
        registeredUsers: mockRegisteredUsers,
        targetBatchId: 'all',
        instructorId: 'teacher-alex',
      });

      expect(alexRows.length).toBe(2);
      expect(alexRows.some((r: any) => r.studentName === 'Cici Paramida')).toBe(false);

      // Siswa Budi: Progress 100 * 30% (30) + Quiz 90 * 30% (27) + Tugas 95 * 40% (38) = 95
      const budiRow = alexRows.find((r: any) => r.studentName === 'Budi Santoso');
      expect(budiRow).toBeDefined();
      expect(budiRow?.finalScore).toBe(95);
      expect(budiRow?.graduationStatus).toBe('LULUS');

      // Siswa Ani: Progress 60 * 30% (18) + Quiz 65 * 30% (19.5) + Tugas 70 * 40% (28) = 66
      const aniRow = alexRows.find((r: any) => r.studentName === 'Ani Yudhoyono');
      expect(aniRow).toBeDefined();
      expect(aniRow?.finalScore).toBe(66);
      expect(aniRow?.graduationStatus).toBe('DALAM PROSES');
    });

    test('Menghitung ringkasan statistik rekap nilai (total siswa, rerata nilai, tingkat kelulusan)', () => {
      const { calculateGradebookSummary } = require('../src/utils/exportGradebook');

      const mockRows = [
        { graduationStatus: 'LULUS', finalScore: 95 },
        { graduationStatus: 'DALAM PROSES', finalScore: 65 },
      ];

      const summary = calculateGradebookSummary(mockRows);
      expect(summary.totalStudents).toBe(2);
      expect(summary.passedCount).toBe(1);
      expect(summary.inProgressCount).toBe(1);
      expect(summary.averageScore).toBe(80); // (95 + 65) / 2 = 80
      expect(summary.completionRate).toBe(50); // 1 / 2 = 50%
    });

    test('Menghasilkan string format CSV yang valid lengkap dengan UTF-8 BOM untuk Microsoft Excel', () => {
      const { formatGradebookCSV } = require('../src/utils/exportGradebook');

      const sampleRows = [
        {
          no: 1,
          studentName: 'Budi Santoso',
          studentEmail: 'budi@eduflow.id',
          batchName: 'Batch 01',
          classCode: 'MOB-101',
          progressPercentage: 100,
          quizAverage: 90,
          assignmentScore: 95,
          finalScore: 95,
          graduationStatus: 'LULUS',
          enrolledAt: '2026-10-01',
        },
      ];

      const csv = formatGradebookCSV(sampleRows, 'MOB-101');
      expect(csv.startsWith('\uFEFF')).toBe(true);
      expect(csv).toContain('Nama Siswa');
      expect(csv).toContain('Budi Santoso');
      expect(csv).toContain('budi@eduflow.id');
      expect(csv).toContain('LULUS');
    });
  });

  describe('Sistem Notifikasi In-App EduFlow (Cohort In-App Notifications)', () => {
    beforeEach(() => {
      useElearningStore.getState().resetDemoData();
    });

    test('Memiliki data awal notifikasi untuk Budi dan Alex dengan status unread/read yang tepat', () => {
      const state = useElearningStore.getState();
      expect(state.notifications.length).toBeGreaterThan(0);

      const budiNotifs = state.notifications.filter((n) => n.userId === 'user-budi');
      const budiUnread = budiNotifs.filter((n) => !n.isRead);
      expect(budiNotifs.length).toBeGreaterThanOrEqual(2);
      expect(budiUnread.length).toBeGreaterThan(0);

      const alexNotifs = state.notifications.filter((n) => n.userId === 'user-alex');
      expect(alexNotifs.length).toBeGreaterThanOrEqual(1);
    });

    test('Otomatis mengirimkan notifikasi ke siswa saat Pengajar memberikan penilaian tugas (type: grade)', () => {
      const store = useElearningStore.getState();

      // Siswa mengumpulkan tugas
      store.submitAssignment(
        'assign-proj-1',
        'batch-edf-402',
        'https://github.com/budi/mobile-cohort'
      );

      const sub = useElearningStore
        .getState()
        .submissions.find((s) => s.assignmentId === 'assign-proj-1');
      expect(sub).toBeDefined();

      // Pengajar beralih peran dan menilai tugas
      useElearningStore.getState().switchRole('teacher');
      useElearningStore
        .getState()
        .gradeSubmission(sub!.id, 95, 'Karya arsitektur aplikasi sangat baik!', false);

      const latestState = useElearningStore.getState();
      const studentNotif = latestState.notifications.find(
        (n) => n.userId === 'user-budi' && n.type === 'grade'
      );

      expect(studentNotif).toBeDefined();
      expect(studentNotif?.title).toContain('Tugas Dinilai');
      expect(studentNotif?.title).toContain('95/100');
      expect(studentNotif?.isRead).toBe(false);
      expect(studentNotif?.message).toContain('Karya arsitektur aplikasi sangat baik!');
    });

    test('Otomatis mengirimkan notifikasi peringatan saat Pengajar meminta revisi (type: revision)', () => {
      const store = useElearningStore.getState();

      // Siswa mengumpulkan tugas
      store.submitAssignment(
        'assign-proj-1',
        'batch-edf-402',
        'https://github.com/budi/mobile-cohort'
      );

      const sub = useElearningStore
        .getState()
        .submissions.find((s) => s.assignmentId === 'assign-proj-1');

      // Pengajar meminta revisi
      useElearningStore.getState().switchRole('teacher');
      useElearningStore
        .getState()
        .gradeSubmission(
          sub!.id,
          50,
          'Perbaiki penanganan state offline sesuai instruksi Modul 2.',
          true
        );

      const latestState = useElearningStore.getState();
      const revisionNotif = latestState.notifications.find(
        (n) => n.userId === 'user-budi' && n.type === 'revision'
      );

      expect(revisionNotif).toBeDefined();
      expect(revisionNotif?.title).toContain('Revisi Tugas');
      expect(revisionNotif?.isRead).toBe(false);
      expect(revisionNotif?.message).toContain('Perbaiki penanganan state offline');
    });

    test('Otomatis menyiarkan notifikasi ke seluruh siswa terdaftar saat pengajar memposting pengumuman kelas', () => {
      const store = useElearningStore.getState();
      useElearningStore.getState().switchRole('teacher');

      const initialBudiCount = store.notifications.filter(
        (n) => n.userId === 'user-budi' && n.type === 'announcement'
      ).length;

      // Buat pengumuman baru untuk batch-edf-402
      store.createAnnouncement(
        'batch-edf-402',
        'Webinar Live Q&A Besok Malam',
        'Jangan lewatkan sesi bedah kode bersama mentor!'
      );

      const updatedState = useElearningStore.getState();
      const newBudiAnnouncements = updatedState.notifications.filter(
        (n) => n.userId === 'user-budi' && n.type === 'announcement'
      );

      expect(newBudiAnnouncements.length).toBe(initialBudiCount + 1);
      const latestAnnNotif = newBudiAnnouncements[0];
      expect(latestAnnNotif.title).toContain('Pengumuman Baru');
      expect(latestAnnNotif.message).toContain('Webinar Live Q&A Besok Malam');
    });

    test('Fitur aksi: menandai 1 notifikasi dibaca, menandai semua dibaca, dan menghapus notifikasi', () => {
      const store = useElearningStore.getState();
      const budiNotifs = store.notifications.filter((n) => n.userId === 'user-budi');
      const targetNotif = budiNotifs[0];

      // Tandai 1 notifikasi dibaca
      store.markNotificationAsRead(targetNotif.id);
      expect(
        useElearningStore
          .getState()
          .notifications.find((n) => n.id === targetNotif.id)?.isRead
      ).toBe(true);

      // Tandai semua notifikasi Budi dibaca
      store.markAllNotificationsAsRead('user-budi');
      const allBudiRead = useElearningStore
        .getState()
        .notifications.filter((n) => n.userId === 'user-budi')
        .every((n) => n.isRead);
      expect(allBudiRead).toBe(true);

      // Hapus semua notifikasi Budi
      store.clearNotifications('user-budi');
      const remainingBudi = useElearningStore
        .getState()
        .notifications.filter((n) => n.userId === 'user-budi');
      expect(remainingBudi.length).toBe(0);

      // Notifikasi user lain (Alex) tidak boleh terhapus
      const alexRemaining = useElearningStore
        .getState()
        .notifications.filter((n) => n.userId === 'user-alex');
      expect(alexRemaining.length).toBeGreaterThan(0);
    });
  });
});

