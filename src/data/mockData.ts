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
    fullName: 'Alex Kurniawan, M.Sc.',
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
    description: 'Master enterprise mobile architecture, Expo SDK, reactive Zustand state management, and production-grade integration workflows.',
    category: 'Mobile Development',
    level: 'intermediate',
    thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'course-wdf-101',
    title: 'Entrepreneurship & Digital Venture Creation',
    slug: 'digital-entrepreneurship',
    description: 'Structured venture acceleration curriculum adhering to global cohort standards: market validation, unit economics, and investor pitch preparation.',
    category: 'Business & Entrepreneurship',
    level: 'beginner',
    thumbnailUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'course-aiml-202',
    title: 'Applied AI & Prompt Engineering for Developers',
    slug: 'applied-ai-engineering',
    description: 'Practical deployment of modern LLM architectures, RAG (Retrieval-Augmented Generation) pipelines, and autonomous agent orchestration.',
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
    instructorName: 'Alex Kurniawan, M.Sc.',
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
    instructorName: 'Dr. Hendra Wijaya, Ph.D.',
    batchName: 'Digital Entrepreneurship Cohort - Batch 01',
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
    instructorName: 'Rian Pratama, M.Eng.',
    batchName: 'AI Fellowship Cohort - Batch 02',
    classCode: 'AIML-202',
    startDate: '2026-09-20',
    endDate: '2026-11-30',
    status: 'active',
    maxStudents: 40,
  },
];

export const INITIAL_MODULES: Module[] = [
  {
    id: 'mod-1',
    courseId: 'course-rn-101',
    title: 'Module 1: UI Architecture & Reactive State Foundations',
    sequenceNumber: 1,
  },
  {
    id: 'mod-2',
    courseId: 'course-rn-101',
    title: 'Module 2: Project Deliverables & Clean Architecture',
    sequenceNumber: 2,
  },
  {
    id: 'mod-wdf-1',
    courseId: 'course-wdf-101',
    title: 'Module 1: Opportunity Discovery & Lean Canvas',
    sequenceNumber: 1,
  },
  {
    id: 'mod-wdf-2',
    courseId: 'course-wdf-101',
    title: 'Module 2: Unit Economics & Investor Pitch Deck',
    sequenceNumber: 2,
  },
  {
    id: 'mod-ai-1',
    courseId: 'course-aiml-202',
    title: 'Module 1: LLM Architecture & Prompt Engineering',
    sequenceNumber: 1,
  },
  {
    id: 'mod-ai-2',
    courseId: 'course-aiml-202',
    title: 'Module 2: RAG Pipeline & Multi-Agent Systems',
    sequenceNumber: 2,
  },
];

export const INITIAL_LESSONS: Lesson[] = [
  {
    id: 'lesson-1',
    moduleId: 'mod-1',
    title: '1.1 Mobile Layout Paradigms & Responsive Flexbox',
    contentType: 'reading',
    durationMinutes: 15,
    sequenceNumber: 1,
    contentBody: `### Modern Mobile UI Architecture

In React Native and Expo cross-platform engineering, layout composition relies on the Flexbox engine. Crucially, the primary axis (\`flexDirection\`) in React Native defaults to \`column\`, contrasting with standard browser CSS which defaults to \`row\`.

#### Key Architectural Tenets:
1. **Safe Area Insets**: Always leverage \`react-native-safe-area-context\` to accommodate hardware notches, dynamic islands, and system navigation bars.
2. **Adaptive Theming**: Maintain crisp contrast ratios across Light (Bento) and Dark (OLED) display modes.
3. **Atomic Component Separation**: Decouple theme tokens from business presentation logic.

*Click 'Mark as Completed' below to advance along your sequential learning track.*`,
  },
  {
    id: 'lesson-2',
    moduleId: 'mod-1',
    title: '1.2 Reactive State Architecture with Zustand (Video Lecture)',
    contentType: 'video',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    durationMinutes: 20,
    sequenceNumber: 2,
    contentBody: `### Why Zustand for Enterprise E-Learning Platforms?

Zustand provides a minimal (<1kB), highly performant state container devoid of complex boilerplate reducers.

#### Strategic Advantages:
- **Zero Provider Nesting**: Components interact with stores directly without wrapping the root hierarchy in multiple nested context providers.
- **Selective Subscription**: Components only re-render when their explicitly selected state slice updates, eliminating unnecessary render cycles.
- **Persistent Middleware**: Out-of-the-box local storage persistence via AsyncStorage ensures user state survives application restarts.`,
  },
  {
    id: 'lesson-3',
    moduleId: 'mod-2',
    title: '2.1 Clean Architecture Principles & Code Review Standards',
    contentType: 'reading',
    durationMinutes: 25,
    sequenceNumber: 2,
    contentBody: `### Scalable Software Architecture for Mobile

To maintain long-term codebase health, adhere strictly to Separation of Concerns:
1. **Domain Layer**: Core business models, interfaces, and graduation criteria algorithms.
2. **Data Layer**: Local persistent storage (AsyncStorage) and cache synchronization.
3. **Store Layer**: Reactive state mutations and sequential gatekeeper rules.
4. **UI Layer**: Pure presentation components driven deterministically by store subscriptions.`,
  },
  {
    id: 'lesson-wdf-1',
    moduleId: 'mod-wdf-1',
    title: '1.1 Problem Discovery & Customer Pain Points',
    contentType: 'reading',
    durationMinutes: 20,
    sequenceNumber: 1,
    contentBody: `### The Venture Discovery Methodology: Uncovering Validated Market Demand

Successful entrepreneurs identify urgent customer problems ("Hair-on-Fire Problems") before building solutions. Employ structured customer discovery interviews to rigorously validate initial assumptions.`,
  },
  {
    id: 'lesson-wdf-2',
    moduleId: 'mod-wdf-1',
    title: '1.2 Lean Canvas & Value Proposition Design',
    contentType: 'reading',
    durationMinutes: 30,
    sequenceNumber: 2,
    contentBody: `### Designing a Concise One-Page Lean Canvas

Map out the 9 critical venture pillars: Problem, Solution, Unique Value Proposition, Unfair Advantage, Customer Segments, Key Metrics, Channels, Cost Structure, and Revenue Streams.`,
  },
  {
    id: 'lesson-wdf-3',
    moduleId: 'mod-wdf-2',
    title: '2.1 Unit Economics, CAC & LTV Optimization',
    contentType: 'reading',
    durationMinutes: 25,
    sequenceNumber: 1,
    contentBody: `### Financial Viability in Digital Cohort Ventures

Evaluate Customer Acquisition Cost (CAC) against Customer Lifetime Value (LTV). Healthy venture benchmarks require an LTV / CAC ratio exceeding 3x with capital payback periods under 12 months.`,
  },
  {
    id: 'lesson-ai-1',
    moduleId: 'mod-ai-1',
    title: '1.1 Few-Shot Prompting & Output Structuring',
    contentType: 'reading',
    durationMinutes: 20,
    sequenceNumber: 1,
    contentBody: `### Advanced Prompt Engineering Techniques

Utilize Few-Shot Demonstrations, Chain-of-Thought (CoT) reasoning, and strict JSON Schema validation (Pydantic / Zod) to enforce deterministic model outputs and eliminate hallucination risks.`,
  },
  {
    id: 'lesson-ai-2',
    moduleId: 'mod-ai-2',
    title: '2.1 RAG Architecture & Vector Indexing',
    contentType: 'reading',
    durationMinutes: 30,
    sequenceNumber: 1,
    contentBody: `### Implementing Production Retrieval-Augmented Generation

Bridge enterprise corpora with semantic dense vector embeddings, efficient indexing (HNSW / Cosine Similarity), and cross-encoder reranking to accurately resolve domain-specific queries.`,
  },
];

export const INITIAL_QUIZZES: Quiz[] = [
  {
    id: 'quiz-mod-1',
    moduleId: 'mod-1',
    title: 'Module 1 Assessment: UI & State Architecture',
    passingScorePercentage: 80,
    timeLimitMinutes: 10,
    questions: [
      {
        id: 'q1-1',
        questionText: 'What is the default value of "flexDirection" in React Native?',
        options: ['row', 'column', 'row-reverse', 'grid'],
        correctOptionIndex: 1,
        explanation: 'In React Native, the default flexDirection is "column", flowing content vertically from top to bottom.',
      },
      {
        id: 'q1-2',
        questionText: 'What is the primary advantage of Zustand over standard React Context?',
        options: [
          'It only functions in web browsers',
          'It prevents unnecessary re-renders through selective store subscriptions without nested providers',
          'It mandates the use of complex Redux boilerplate',
          'It requires wrapping the application in multiple high-level context providers',
        ],
        correctOptionIndex: 1,
        explanation: 'Zustand enables selective subscriptions so components only re-render when their observed state slices change.',
      },
      {
        id: 'q1-3',
        questionText: 'How is user progress reliably retained across application sessions?',
        options: [
          'By utilizing Zustand with the persist middleware backed by AsyncStorage',
          'By storing transient variables in volatile JavaScript global memory',
          'By clearing local caches upon every application launch',
          'Progress cannot be retained offline',
        ],
        correctOptionIndex: 0,
        explanation: 'Zustand persist middleware automatically synchronizes state changes to durable local persistent storage such as AsyncStorage.',
      },
    ],
  },
  {
    id: 'quiz-mod-2',
    moduleId: 'mod-2',
    title: 'Module 2 Assessment: Clean Architecture & Cohort Methodology',
    passingScorePercentage: 80,
    timeLimitMinutes: 10,
    questions: [
      {
        id: 'q2-1',
        questionText: 'In which architectural layer should weighted graduation certification rules reside?',
        options: [
          'UI Button Presentation Component',
          'Domain / Store Business Logic Layer',
          'CSS / Styling Configuration',
          'Babel / Bundler Configuration',
        ],
        correctOptionIndex: 1,
        explanation: 'Core graduation logic must reside within the Domain / Store layer to ensure independence from presentation components.',
      },
      {
        id: 'q2-2',
        questionText: 'In a cohort-based learning model, what is the primary responsibility of an instructor?',
        options: [
          'Uploading static pre-recorded videos without subsequent interaction',
          'Mentoring cohorts, evaluating project deliverables, providing qualitative feedback, and certifying graduation',
          'Collecting class administration dues',
          'Passively observing learner activity',
        ],
        correctOptionIndex: 1,
        explanation: 'In cohort-based learning, instructors actively inspect submissions, provide qualitative feedback, request revisions, and certify completion.',
      },
    ],
  },
];

export const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: 'assign-proj-1',
    moduleId: 'mod-2',
    title: 'Capstone Project: Reactive State & Submission Architecture',
    instructions: `Learners must engineer an enterprise submission workflow fulfilling the following criteria:
1. Verify that client-side submission validation functions reliably prior to deadlines.
2. Provide a link to your GitHub repository or detailed architecture notes.
3. The instructor will evaluate deliverables and assign a composite score (0-100) with qualitative commentary.
4. Achieving a minimum composite threshold of 75 is required for accredited certification.`,
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
    authorName: 'Alex Kurniawan, M.Sc.',
    title: '📢 Welcome to Batch 04 - Mobile Cohort Program!',
    message: 'Welcome to all cohort participants! Please begin working through Module 1 sequentially. Remember to complete your Module Evaluation Quiz prior to submitting the Capstone Deliverable in Module 2.',
    createdAt: '2026-10-12T08:00:00Z',
  },
  {
    id: 'ann-2',
    batchId: 'batch-wdf-101',
    authorId: 'user-hendra',
    authorName: 'Dr. Hendra Wijaya, Ph.D.',
    title: '🎓 Official Graduation Announcement - Entrepreneurship Batch 01',
    message: 'Congratulations to all accredited graduates! Verified digital credentials have been issued and are available in your Graduation Profile.',
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

export const INITIAL_CERTIFICATES: Certificate[] = [
  {
    id: 'cert-wdf-existing-1',
    batchId: 'batch-wdf-101',
    userId: 'user-budi',
    studentName: 'Budi Santoso',
    courseTitle: 'Entrepreneurship & Digital Venture Creation',
    batchName: 'Digital Entrepreneurship Cohort - Batch 01',
    certificateNumber: 'ENT-CERT-2026-0891-WDF-101',
    finalScore: 94,
    instructorName: 'Dr. Hendra Wijaya, Ph.D.',
    issuedAt: '2026-09-15T10:00:00Z',
  },
];

export const INITIAL_NOTIFICATIONS: InAppNotification[] = [
  {
    id: 'notif-1',
    userId: 'user-budi',
    title: '📢 New Cohort Announcement in Batch 04',
    message: 'Alex Kurniawan posted an announcement: Welcome to Batch 04 - Mobile Cohort Program!',
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
    title: '🎉 Graduation Certificate Issued!',
    message: 'Congratulations! Your accredited certificate for Entrepreneurship & Digital Venture Creation has been officially published.',
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
    title: '🔥 3-Day Learning Streak Active',
    message: 'Excellent momentum! Maintain your daily learning habit to earn bonus XP.',
    type: 'system',
    isRead: false,
    createdAt: '2026-10-13T09:00:00Z',
  },
  {
    id: 'notif-4',
    userId: 'user-alex',
    title: '👋 New Learner Enrolled',
    message: 'Budi Santoso has enrolled in React Native & Expo Mobile Developer - Batch 04.',
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
    title: '💡 Deliverable Ready for Evaluation',
    message: 'A new capstone submission has been queued and awaits your review in the Gradebook.',
    type: 'system',
    isRead: false,
    createdAt: '2026-10-13T14:20:00Z',
    linkRoute: '/(tabs)/grading',
  },
];
