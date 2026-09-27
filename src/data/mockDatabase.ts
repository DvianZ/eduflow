// ─── Interfaces ───

export interface Course {
  id: string;
  title: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  rating: number;
  reviewCount: number;
  learnerCount: number;
  durationStr: string;
  instructor: {
    name: string;
    role: string;
    avatarUrl: string;
  };
  price: number;           // 0 = free
  originalPrice: number;   // for strikethrough display
  thumbnailUrl: string;
  tags: string[];
  lessons: string[];       // array of lesson IDs
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  durationSeconds: number;
  videoUrl: string;
  orderIndex: number;
  quizId?: string;
}

export interface QuizQuestion {
  id: string;
  text: string;
  codeSnippet?: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  hint: string;
}

export interface Quiz {
  id: string;
  lessonId: string;
  courseId: string;
  pointsPerQuestion: number;
  questions: QuizQuestion[];
}

// ─── Data ───

export const MOCK_COURSES: Course[] = [
  {
    id: '1',
    title: 'Mastering Dynamic Island & Live Activities',
    category: 'Spatial UI',
    level: 'Intermediate',
    rating: 4.9,
    reviewCount: 2400,
    learnerCount: 6830,
    durationStr: '14h 30m',
    instructor: {
      name: 'Sarah Lin',
      role: 'Staff iOS Eng',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBFmr-sAdjz0THFnNjAuiZuqXHxbjirKHAeeC4ifrR9kdU0PzDmX14iZxvU5xL-gl2-ZVKt2sJcMfFqXiI5vtXtooDUgwcPZT3f-Xz1ibeQL-va8sF1LV6Pdq0QWHZBLipzeBBPXaxqqV0S2DVt828pmEju14Mm7U5ofDRNHu3-pGebDB-igebK4U1gFur8Y1UtRniXVIQ5luqe9XFNVEoaaFSExr3h2YDmT2-xlSugA_cRps3s0cO'
    },
    price: 79,
    originalPrice: 149,
    thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCUYPcj3Rvvv4oM6KMKtvaq5EBQdb0xR3fbfqsNYyvHQ9GYGsdan_023pAhT_F4TjzP7TySxw_ayUTMH9KlEfnPzvaOIuDQA_hJzRv4P4YlwQNHPFpSAYt-svIuN4GF8RMdXe2H6fboW1InJ8t6nmB1Knnb723o9ofzVBcpX54jIILqv0I99mtRSM23830Kv48QKVYe5YwwfhIU9Ifq7vKgm6NG_BBcoHusmtyVHHMiaO2wc9B9yfzX',
    tags: ["Editor's Choice", "Trending"],
    lessons: ['1']
  },
  {
    id: '2',
    title: 'High-Performance Graphics with Metal 3',
    category: 'Graphics',
    level: 'Advanced',
    rating: 5.0,
    reviewCount: 1800,
    learnerCount: 4200,
    durationStr: '22h 10m',
    instructor: {
      name: 'Marcus Vance',
      role: 'Graphics Specialist',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVtACtL-u4Owmd7KIYaAXjwH5MmAbUdnn4ubRFG0DfTOYJYLeAS2BWYL4w1bWBMuV8HlNpguYscFRK_Y6RRxpQBVaGxLUVq1Hqw6VTh3NOqVyfYwadw-OfTExDhdCc4zuGVem8vCq4lI9VLTzbgCbM8QfvdZ9m8XoJ6CfFfKFRsmgH4SWuxTP8Fp6vqXLk-6aQGFFSMnNQ7VOYIac0dO7sPhHLhLUap-2p8VVGKs4HeAaa1FIrnT8O'
    },
    price: 79,
    originalPrice: 120,
    thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDWV-h8lxipfGg20WPwrbhXdAs97t6xvUCn1nwFtx6EC18z8dcQH6bjnVzT5isVBPLmnUG79nMhHegoupvKTRdhgo_ygbFzcBxbS7UB6SHzO0uQ-AQwpG_b0Z2jbIUh91zsN_kOv3mxIQ3Soq2RHuWX9h0xpdxGdgIY22_FBtE_lLg6hW7Du7auiSWCxyw__6a4Sff3oGqUiAjirTYb3dymMnwrCsDBLZXLE99jlssWqNIM4EjvWKTV',
    tags: ["Best Seller"],
    lessons: ['2']
  }
];

export const MOCK_LESSONS: Lesson[] = [
  {
    id: '1',
    courseId: '1',
    title: '02. Expanded Presentation State & Audio Engine',
    durationSeconds: 1095, // 18m 15s
    videoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAUMV_s3RYuZZUzJaxqYHuMAH_dJWMgBOAsgn764KNOFy3fmjv_hfXI28udRuzkevvmCDWoddxt00NfkC6fXn1wQEngQt69xwdkIR69tBdsNsHU_P8ELoZRzsTwu-MJns2HFQL5sebPwPSpp4Jvulb9OY7wLEAP-cJ1IYsXmIqCSKES9FI5-FuBEXrq1Ebh5xup6M4t6gkNudkhQjkJpBzuw4lbmS3jjOWN1z7KrXrlEgS9FDK0wpN6',
    orderIndex: 2,
    quizId: '1'
  },
  {
    id: '2',
    courseId: '2',
    title: '01. Intro to Compute Shaders',
    durationSeconds: 900,
    videoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAUMV_s3RYuZZUzJaxqYHuMAH_dJWMgBOAsgn764KNOFy3fmjv_hfXI28udRuzkevvmCDWoddxt00NfkC6fXn1wQEngQt69xwdkIR69tBdsNsHU_P8ELoZRzsTwu-MJns2HFQL5sebPwPSpp4Jvulb9OY7wLEAP-cJ1IYsXmIqCSKES9FI5-FuBEXrq1Ebh5xup6M4t6gkNudkhQjkJpBzuw4lbmS3jjOWN1z7KrXrlEgS9FDK0wpN6',
    orderIndex: 1
  }
];

export const MOCK_QUIZZES: Quiz[] = [
  {
    id: '1',
    lessonId: '1',
    courseId: '1',
    pointsPerQuestion: 150,
    questions: [
      {
        id: 'q1',
        text: 'Which presentation state in ActivityKit allows rendering an expanded banner when the user long-presses the Dynamic Island?',
        codeSnippet: `DynamicIslandExpandedContent(\n  leading: { /* left trailing pill */ },\n  trailing: { /* battery/state */ },\n  bottom: { /* actionable controls */ }\n)`,
        options: [
          { id: 'A', text: 'DynamicIslandCompact' },
          { id: 'B', text: 'DynamicIslandExpanded' },
          { id: 'C', text: 'DynamicIslandMinimal' },
          { id: 'D', text: 'DynamicIslandLockScreenBanner' },
        ],
        correctOptionId: 'B',
        hint: 'Keyframe Transition Note: When expanded, ActivityKit interpolates layout anchors from the default pill state into an unobstructed canvas containing leading, trailing, center, and bottom regions.'
      },
      {
        id: 'q2',
        text: 'What modifier is used to smoothly animate changes to the frame of a view when its parent layout changes?',
        codeSnippet: `View\n  .frame(width: isExpanded ? 300 : 100)\n  // Which modifier?`,
        options: [
          { id: 'A', text: '.animation(.easeInOut, value: isExpanded)' },
          { id: 'B', text: '.matchedGeometryEffect()' },
          { id: 'C', text: '.transition(.slide)' },
          { id: 'D', text: '.layoutPriority(1)' },
        ],
        correctOptionId: 'A',
        hint: 'Look for the standard way to apply implicit animations tied to a specific value change in SwiftUI 3+.'
      }
    ]
  }
];

// ─── Helper Functions ───

export function getCourseById(id: string): Course | undefined {
  return MOCK_COURSES.find(c => c.id === id);
}

export function getLessonById(id: string): Lesson | undefined {
  return MOCK_LESSONS.find(l => l.id === id);
}

export function getLessonsByCourse(courseId: string): Lesson[] {
  return MOCK_LESSONS.filter(l => l.courseId === courseId).sort((a, b) => a.orderIndex - b.orderIndex);
}

export function getQuizById(id: string): Quiz | undefined {
  return MOCK_QUIZZES.find(q => q.id === id);
}

export function getQuizByLesson(lessonId: string): Quiz | undefined {
  return MOCK_QUIZZES.find(q => q.lessonId === lessonId);
}

export function formatReviewCount(count: number): string {
  if (count >= 1000) return `(${(count / 1000).toFixed(1)}k)`;
  return `(${count})`;
}

export function formatPrice(price: number): string {
  if (price === 0) return 'Free';
  return `$${price.toFixed(2)}`;
}
