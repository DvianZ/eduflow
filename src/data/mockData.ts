import {
  User,
  Course,
  Batch,
  Module,
  Lesson,
  Quiz,
  Assignment,
  BatchAnnouncement,
  UserStreak,
  BatchEnrollment,
  Certificate,
  InAppNotification,
} from '@/types/elearning';

export const DEMO_USERS: Record<string, User> = {
  learner: {
    id: 'user-budi',
    fullName: 'Budi Santoso',
    email: 'budi.santoso@eduflow.id',
    role: 'learner',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
  },
  teacher: {
    id: 'user-alex',
    fullName: 'Pak Alex Kurniawan, M.Kom',
    email: 'alex.kurniawan@eduflow.id',
    role: 'teacher',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=160&q=80',
  },
};

export const INITIAL_COURSES: Course[] = [
  {
    id: 'course-rn-101',
    title: 'Fullstack Mobile & Modern React Native',
    slug: 'react-native-modern',
    description: 'Kuasai arsitektur mobile modern, Expo SDK 57, Zustand state management, dan alur integrasi real-world.',
    category: 'Mobile Development',
    level: 'intermediate',
    thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'course-wdf-101',
    title: 'Entrepreneurship & Digital Venture Creation',
    slug: 'wadhwani-entrepreneurship',
    description: 'Program akselerasi kewirausahaan model Wadhwani Foundation: validasi ide bisnis, model finansial, dan pitch deck.',
    category: 'Business & Entrepreneurship',
    level: 'beginner',
    thumbnailUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'course-aiml-202',
    title: 'Applied AI & Prompt Engineering for Developers',
    slug: 'applied-ai-engineering',
    description: 'Penerapan praktis arsitektur LLM, RAG (Retrieval-Augmented Generation), dan orkestrasi agent AI modern.',
    category: 'Artificial Intelligence',
    level: 'advanced',
    thumbnailUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=600&q=80',
  },
];

export const INITIAL_BATCHES: Batch[] = [
  {
    id: 'batch-edf-402',
    courseId: 'course-rn-101',
    instructorId: 'user-alex',
    instructorName: 'Pak Alex Kurniawan, M.Kom',
    batchName: 'Batch 04 - Mobile Cohort Program',
    classCode: 'EDF-402',
    startDate: '2026-10-01',
    endDate: '2026-11-15',
    status: 'active',
    maxStudents: 30,
  },
  {
    id: 'batch-wdf-101',
    courseId: 'course-wdf-101',
    instructorId: 'user-hendra',
    instructorName: 'Dr. Hendra Wijaya, S.E., M.M.',
    batchName: 'Wadhwani Entrepreneurship Cohort - Batch 01',
    classCode: 'WDF-101',
    startDate: '2026-08-01',
    endDate: '2026-09-15',
    status: 'completed',
    maxStudents: 50,
  },
  {
    id: 'batch-aiml-202',
    courseId: 'course-aiml-202',
    instructorId: 'user-rian',
    instructorName: 'Ir. Rian Pratama, M.Sc',
    batchName: 'AI Fellowship Cohort - Batch 02',
    classCode: 'AIML-202',
    startDate: '2026-09-20',
    endDate: '2026-11-30',
    status: 'active',
    maxStudents: 40,
  },
];

export const INITIAL_MODULES: Module[] = [
  // Modul untuk Fullstack Mobile (Dinamis untuk Testing)
  {
    id: 'mod-1',
    courseId: 'course-rn-101',
    title: 'Modul 1: Fondasi UI & State Management Modern',
    sequenceNumber: 1,
  },
  {
    id: 'mod-2',
    courseId: 'course-rn-101',
    title: 'Modul 2: Tugas Proyek & Clean Architecture',
    sequenceNumber: 2,
  },
  // Modul untuk Wadhwani Entrepreneurship
  {
    id: 'mod-wdf-1',
    courseId: 'course-wdf-101',
    title: 'Modul 1: Opportunity Discovery & Lean Canvas',
    sequenceNumber: 1,
  },
  {
    id: 'mod-wdf-2',
    courseId: 'course-wdf-101',
    title: 'Modul 2: Unit Economics & Investor Pitch Deck',
    sequenceNumber: 2,
  },
  // Modul untuk Applied AI
  {
    id: 'mod-ai-1',
    courseId: 'course-aiml-202',
    title: 'Modul 1: LLM Architecture & Prompt Engineering',
    sequenceNumber: 1,
  },
  {
    id: 'mod-ai-2',
    courseId: 'course-aiml-202',
    title: 'Modul 2: RAG Pipeline & Multi-Agent Systems',
    sequenceNumber: 2,
  },
];

export const INITIAL_LESSONS: Lesson[] = [
  // Fullstack Mobile Lessons
  {
    id: 'lesson-1',
    moduleId: 'mod-1',
    title: '1.1 Pengenalan Mobile Layout & Flexbox Responsif',
    contentType: 'reading',
    durationMinutes: 15,
    sequenceNumber: 1,
    contentBody: `### Pengenalan Desain UI Mobile Modern

Dalam pengembangan aplikasi mobile dengan React Native dan Expo, kita menggunakan sistem flexbox bawaan. Secara default, arah sumbu utama (\`flexDirection\`) pada React Native adalah \`column\`, berbeda dengan CSS browser yang default-nya \`row\`.

#### Poin Utama:
1. **Safe Area**: Selalu gunakan \`react-native-safe-area-context\` untuk notch & home bar.
2. **Dynamic Theming**: Adaptasikan antarmuka dengan mode Gelap (Dark Mode) dan Terang (Light Mode).
3. **Atomic Components**: Pisahkan teks tematik (\`ThemedText\`) dan kontainer (\`ThemedView\`).

*Klik tombol 'Tandai Selesai' di bawah untuk melanjutkan ke materi berikutnya.*`,
  },
  {
    id: 'lesson-2',
    moduleId: 'mod-1',
    title: '1.2 State Management Reaktif dengan Zustand',
    contentType: 'reading',
    durationMinutes: 20,
    sequenceNumber: 2,
    contentBody: `### Mengapa Memilih Zustand untuk E-Learning?

Zustand adalah library state management berbobot sangat ringan (<1kB), tanpa boilerplate reducer yang rumit, dan sangat performant.

#### Karakteristik Unggulan:
- **Zero Provider Wrapping**: Komponen tidak perlu dibungkus context provider bertingkat.
- **Selective Re-rendering**: Komponen hanya me-render ulang jika bagian state yang di-subscribe berubah.
- **Middleware Persist**: Integrasi langsung dengan AsyncStorage untuk menyimpan progres belajar saat aplikasi ditutup.`,
  },
  {
    id: 'lesson-3',
    moduleId: 'mod-2',
    title: '2.1 Prinsip Clean Architecture & Evaluasi Kode',
    contentType: 'reading',
    durationMinutes: 25,
    sequenceNumber: 2,
    contentBody: `### Arsitektur Berkelanjutan pada Aplikasi Mobile

Untuk skala aplikasi profesional, pisahkan tanggung jawab kode (*Separation of Concerns*):
1. **Domain Layer**: Types dan Model Data bisnis.
2. **Data Layer**: Penyimpanan lokal (SQLite / AsyncStorage / API).
3. **Store Layer**: State reaktif dan business logic.
4. **UI Layer**: Komponen tampilan murni yang menerima data dari Store.`,
  },
  // Wadhwani Entrepreneurship Lessons (Semua sudah selesai karena batch lulus)
  {
    id: 'lesson-wdf-1',
    moduleId: 'mod-wdf-1',
    title: '1.1 Problem Discovery & Customer Pain Points',
    contentType: 'reading',
    durationMinutes: 20,
    sequenceNumber: 1,
    contentBody: `### Metodologi Wadhwani: Menemukan Peluang Pasar Riil

Wirausahawan sukses memulai dari masalah pelanggan yang nyata (*Hair-on-Fire Problem*), bukan dari produk jadi. Gunakan framework wawancara pelanggan (Customer Discovery) untuk memvalidasi hipotesis awal.`,
  },
  {
    id: 'lesson-wdf-2',
    moduleId: 'mod-wdf-1',
    title: '1.2 Lean Canvas & Value Proposition Design',
    contentType: 'reading',
    durationMinutes: 30,
    sequenceNumber: 2,
    contentBody: `### Merancang Lean Canvas 1 Halaman

Petakan 9 blok esensial: Problem, Solution, Unique Value Proposition, Unfair Advantage, Customer Segments, Key Metrics, Channels, Cost Structure, dan Revenue Streams.`,
  },
  {
    id: 'lesson-wdf-3',
    moduleId: 'mod-wdf-2',
    title: '2.1 Unit Economics, CAC & LTV',
    contentType: 'reading',
    durationMinutes: 25,
    sequenceNumber: 1,
    contentBody: `### Kelayakan Finansial Startup Digital

Hitung Customer Acquisition Cost (CAC) vs Customer Lifetime Value (LTV). Formula sehat industri adalah rasio LTV / CAC > 3x dengan periode pengembalian modal (payback period) < 12 bulan.`,
  },
  // Applied AI Lessons
  {
    id: 'lesson-ai-1',
    moduleId: 'mod-ai-1',
    title: '1.1 Few-Shot Prompting & Output Structuring',
    contentType: 'reading',
    durationMinutes: 20,
    sequenceNumber: 1,
    contentBody: `### Rekayasa Prompting Tingkat Lanjut

Gunakan teknik Few-Shot Exemples, Chain-of-Thought (CoT), dan output skema JSON terstruktur (Pydantic / Zod) untuk memastikan model LLM memberikan jawaban deterministik tanpa halusinasi.`,
  },
  {
    id: 'lesson-ai-2',
    moduleId: 'mod-ai-2',
    title: '2.1 RAG Architecture & Vector Database',
    contentType: 'reading',
    durationMinutes: 30,
    sequenceNumber: 1,
    contentBody: `### Membangun Sistem Retrieval-Augmented Generation

Integrasikan dokumen korpus internal dengan embeddings representatif, indeks similarity search (Cosine / HNSW), dan reranking untuk menjawab pertanyaan spesifik domain perusahaan.`,
  },
];

export const INITIAL_QUIZZES: Quiz[] = [
  {
    id: 'quiz-mod-1',
    moduleId: 'mod-1',
    title: 'Kuis Evaluasi Modul 1: UI & State Management',
    passingScorePercentage: 80,
    timeLimitMinutes: 10,
    questions: [
      {
        id: 'q1-1',
        questionText: 'Apa nilai default dari "flexDirection" pada React Native?',
        options: ['row', 'column', 'row-reverse', 'grid'],
        correctOptionIndex: 1,
        explanation: 'Pada React Native, default flexDirection adalah "column", mengalir secara vertikal dari atas ke bawah.',
      },
      {
        id: 'q1-2',
        questionText: 'Keuntungan utama menggunakan Zustand dibandingkan Context API standar adalah...',
        options: [
          'Hanya mendukung web browser',
          'Mencegah re-render yang tidak perlu tanpa provider bertingkat',
          'Harus menggunakan Redux DevTools',
          'Wajib membungkus root app dengan 5 provider',
        ],
        correctOptionIndex: 1,
        explanation: 'Zustand memungkinkan selector selektif sehingga komponen hanya me-render ulang jika bagian state spesifik berubah.',
      },
      {
        id: 'q1-3',
        questionText: 'Bagaimana cara memastikan data siswa tetap tersimpan saat aplikasi ditutup?',
        options: [
          'Menggunakan Zustand dengan persist middleware ke AsyncStorage/SQLite',
          'Menyimpan di memori RAM variabel global biasa',
          'Menghapus cache setiap aplikasi terbuka',
          'Tidak bisa disimpan',
        ],
        correctOptionIndex: 0,
        explanation: 'Middleware persist Zustand mengalirkan perubahan state langsung ke penyimpanan persisten lokal seperti AsyncStorage atau SQLite.',
      },
    ],
  },
  {
    id: 'quiz-mod-2',
    moduleId: 'mod-2',
    title: 'Kuis Evaluasi Modul 2: Clean Architecture',
    passingScorePercentage: 80,
    timeLimitMinutes: 10,
    questions: [
      {
        id: 'q2-1',
        questionText: 'Di layer manakah aturan kelulusan sertifikasi sebaiknya diletakkan?',
        options: ['UI Button Component', 'Domain/Store Business Logic Layer', 'Stylesheet CSS', 'Babel Config'],
        correctOptionIndex: 1,
        explanation: 'Logika bisnis kelulusan harus berada di Store atau Domain layer agar independen dari komponen tampilan.',
      },
      {
        id: 'q2-2',
        questionText: 'Dalam model E-Learning Cohort, apa peran utama Pengajar/Mentor?',
        options: [
          'Hanya mengunggah video statis tanpa interaksi',
          'Membimbing batch, memeriksa tugas proyek, memberikan feedback, dan mengevaluasi kelulusan',
          'Menagih pembayaran uang kas',
          'Menonton video siswa',
        ],
        correctOptionIndex: 1,
        explanation: 'Pada model Cohort, pengajar aktif memeriksa submission tugas, memberikan penilaian kualitatif/kuantitatif, dan mengesahkan kelulusan.',
      },
    ],
  },
];

export const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: 'assign-proj-1',
    moduleId: 'mod-2',
    title: 'Tugas Proyek: Bangun Alur Penugasan & State Reaktif',
    instructions: `Siswa diminta untuk menyusun alur penugasan e-learning dengan kriteria:
1. Pastikan validasi pengumpulan tugas bekerja sebelum tenggat waktu.
2. Lampirkan link repository GitHub atau catatan implementasi arsitektur.
3. Pengajar akan memeriksa dan memberikan skor (0-100) serta umpan balik tertulis.
4. Minimal skor kelulusan adalah 75 untuk memenuhi syarat sertifikat.`,
    dueDate: '2026-11-10 23:59',
    maxScore: 100,
    allowLateSubmission: true,
  },
];

export const INITIAL_ANNOUNCEMENTS: BatchAnnouncement[] = [
  {
    id: 'ann-1',
    batchId: 'batch-edf-402',
    authorId: 'user-alex',
    authorName: 'Pak Alex Kurniawan, M.Kom',
    title: '📢 Selamat Datang di Batch 04 - Mobile Cohort Program!',
    message: 'Halo rekan-rekan pembelajar! Silakan mulai mempelajari Modul 1 secara berurutan. Jangan lupa kerjakan Kuis Evaluasi sebelum mengumpulkan Tugas Proyek di Modul 2.',
    createdAt: '2026-10-12T08:00:00Z',
  },
  {
    id: 'ann-2',
    batchId: 'batch-wdf-101',
    authorId: 'user-hendra',
    authorName: 'Dr. Hendra Wijaya, S.E., M.M.',
    title: '🎓 Kelulusan Resmi Batch 01 Wadhwani Entrepreneurship',
    message: 'Selamat kepada seluruh lulusan! Sertifikat digital terakreditasi telah diterbitkan dan dapat diunduh di tab Kelulusan.',
    createdAt: '2026-09-15T10:00:00Z',
  },
];

export const INITIAL_STREAK: UserStreak = {
  userId: 'user-budi',
  currentStreak: 3,
  highestStreak: 5,
  lastActiveDate: '2026-10-12',
  totalXp: 550,
};

// Siswa terdaftar di 3 kelas sekaligus
export const INITIAL_ENROLLMENTS: BatchEnrollment[] = [
  {
    id: 'enr-budi-402',
    batchId: 'batch-edf-402',
    userId: 'user-budi',
    progressPercentage: 33,
    finalScore: 0,
    graduationStatus: 'in_progress',
    enrolledAt: '2026-10-01T10:00:00Z',
  },
  {
    id: 'enr-budi-101',
    batchId: 'batch-wdf-101',
    userId: 'user-budi',
    progressPercentage: 100,
    finalScore: 94,
    graduationStatus: 'graduated',
    enrolledAt: '2026-08-01T09:00:00Z',
  },
  {
    id: 'enr-budi-202',
    batchId: 'batch-aiml-202',
    userId: 'user-budi',
    progressPercentage: 50,
    finalScore: 82,
    graduationStatus: 'in_progress',
    enrolledAt: '2026-09-20T11:00:00Z',
  },
];

// Siswa sudah memiliki 1 sertifikat dari kelas Wadhwani Foundation!
export const INITIAL_CERTIFICATES: Certificate[] = [
  {
    id: 'cert-wdf-existing-1',
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

export const INITIAL_NOTIFICATIONS: InAppNotification[] = [
  {
    id: 'notif-1',
    userId: 'user-budi',
    title: '📢 Pengumuman Baru di Batch 04',
    message:
      'Pak Alex Kurniawan memposting pengumuman: Selamat Datang di Batch 04 - Mobile Cohort Program!',
    type: 'announcement',
    isRead: false,
    createdAt: '2026-10-12T08:05:00Z',
    linkRoute: '/(tabs)/',
    metadata: {
      batchId: 'batch-edf-402',
      batchName: 'React Native & Expo Mobile Developer - Batch 04',
    },
  },
  {
    id: 'notif-2',
    userId: 'user-budi',
    title: '🎉 Sertifikat Kelulusan Terbit!',
    message:
      'Selamat! Sertifikat Anda untuk Entrepreneurship & Digital Venture Creation telah resmi diterbitkan.',
    type: 'grade',
    isRead: true,
    createdAt: '2026-09-15T10:05:00Z',
    linkRoute: '/(tabs)/profile',
    metadata: {
      batchId: 'batch-wdf-101',
      score: 94,
    },
  },
  {
    id: 'notif-3',
    userId: 'user-budi',
    title: '🔥 Streak Belajar 3 Hari Berturut-turut',
    message:
      'Hebat! Pertahankan konsistensi belajar Anda setiap hari untuk mendapatkan bonus XP.',
    type: 'system',
    isRead: false,
    createdAt: '2026-10-13T09:00:00Z',
  },
  {
    id: 'notif-4',
    userId: 'user-alex',
    title: '👋 Siswa Baru Bergabung',
    message:
      'Budi Santoso telah bergabung ke dalam kelas React Native & Expo Mobile Developer - Batch 04.',
    type: 'enrollment',
    isRead: false,
    createdAt: '2026-10-12T07:30:00Z',
    linkRoute: '/(tabs)/grading',
    metadata: {
      batchId: 'batch-edf-402',
    },
  },
  {
    id: 'notif-5',
    userId: 'user-alex',
    title: '💡 Evaluasi Tugas Siap Dinilai',
    message:
      'Terdapat submission tugas proyek baru yang menunggu penilaian di tab Penilaian.',
    type: 'system',
    isRead: false,
    createdAt: '2026-10-13T14:20:00Z',
    linkRoute: '/(tabs)/grading',
  },
];
