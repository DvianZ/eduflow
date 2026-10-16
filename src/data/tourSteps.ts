export interface TourStep {
  id: string;
  category: 'CORE FEATURE' | 'DEMO UTILITY';
  isCore: boolean;
  icon: string;
  title: string;
  subtitle: string;
  description: string;
  tip: string;
  targetTab?: string;
  targetRole?: 'learner' | 'teacher';
  scrollOffset?: number | 'bottom';
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'dashboard',
    category: 'CORE FEATURE',
    isCore: true,
    icon: 'compass',
    title: '1. Dashboard & Cohort Mission',
    subtitle: 'Time-Based Cohort Learning Hub',
    description:
      'Welcome to EduFlow! On the Dashboard, learners view their Active Mission, class code (1-click copy), real-time curriculum progress, and enrolled cohorts.',
    tip: 'Demo Focus: Notice the 3D active mission card EDF-402 and live progress tracker.',
    targetTab: '/(tabs)',
    targetRole: 'learner',
  },
  {
    id: 'role-switcher',
    category: 'DEMO UTILITY',
    isCore: false,
    icon: 'swap-horizontal',
    title: '2. Instant 1-Click Role Switcher',
    subtitle: 'Learner ⇄ Instructor Toggle Without Re-login',
    description:
      'Built-in demo utility: Test both sides of the platform instantly! Switch between Learner (Budi) and Instructor (Mr. Alex) with one tap in the top header.',
    tip: 'Demo Focus: The pill switcher in the top header makes two-sided client evaluation seamless.',
    targetTab: '/(tabs)',
    targetRole: 'learner',
  },
  {
    id: 'gatekeeper',
    category: 'CORE FEATURE',
    isCore: true,
    icon: 'layers',
    title: '3. Curriculum & Prerequisite Gatekeeper',
    subtitle: 'Automated Milestone & Lock Engine',
    description:
      'The curriculum enforces sequential gatekeeper rules: Advanced lessons and project deliverables unlock only after finishing prerequisite materials and passing quizzes (≥80%).',
    tip: 'Demo Focus: Check Module 2 to see the lock gatekeeper protecting advanced assignments.',
    targetTab: '/(tabs)/syllabus',
    targetRole: 'learner',
  },
  {
    id: 'grading',
    category: 'CORE FEATURE',
    isCore: true,
    icon: 'clipboard',
    title: '4. Project Review, Grading & Revisions',
    subtitle: 'Instructor Evaluation Queue & Feedback',
    description:
      'Switched to Instructor mode: Mr. Alex can review project deliverables, assign composite scores (0–100), or request revisions with feedback that triggers instant student alerts.',
    tip: 'Demo Focus: The grading queue features revision workflows and gradebook CSV exports.',
    targetTab: '/(tabs)/grading',
    targetRole: 'teacher',
  },
  {
    id: 'class-manager',
    category: 'CORE FEATURE',
    isCore: true,
    icon: 'people',
    title: '5. Class & Student Management Panel',
    subtitle: 'Cohort Creation & Roster Monitoring',
    description:
      'Instructor authority panel: Create new cohort batches, configure student seat limits, generate unique enrollment codes, and monitor learner graduation progress.',
    tip: 'Demo Focus: Manage active cohort enrollment codes and track roster progress.',
    targetTab: '/class-manager',
    targetRole: 'teacher',
  },
  {
    id: 'profile-name',
    category: 'CORE FEATURE',
    isCore: true,
    icon: 'person-circle',
    title: '6. Official Legal Name for Certificates',
    subtitle: 'Exclusive Verified Name Management in Profile',
    description:
      'Learners can configure their official legal full name directly on this Profile screen to appear on official accredited graduation certificates and digital verification records.',
    tip: 'Demo Focus: Tap "Edit Legal Name" in the Official Certificate Name card on Profile.',
    targetTab: '/(tabs)/profile?section=name',
    targetRole: 'learner',
    scrollOffset: 0,
  },
  {
    id: 'certificate',
    category: 'CORE FEATURE',
    isCore: true,
    icon: 'ribbon',
    title: '7. Graduation Evaluator & Certificate PDF',
    subtitle: 'Weighted 30:30:40 Formula & Official PDF',
    description:
      'The automated evaluator enforces the weighted formula: 30% curriculum progress + 30% quiz average + 40% project score. Graduated students can view credentials and print official PDF certificates!',
    tip: 'Demo Focus: Select Digital Entrepreneurship cohort, then tap "View Certificate" or "Print / Save PDF".',
    targetTab: '/(tabs)/profile?section=evaluator',
    targetRole: 'learner',
    scrollOffset: 240,
  },
  {
    id: 'settings-theme',
    category: 'DEMO UTILITY',
    isCore: false,
    icon: 'color-palette',
    title: '8. Theme & Tactile Personalization',
    subtitle: 'Dark Mode, Light Mode & 3D Haptics',
    description:
      'In Settings, customize your experience: toggle between Light and Dark themes, enable 3D tactile vibration haptics on buttons, and audio milestone feedback.',
    tip: 'Demo Focus: Toggle between Dark and Light mode to experience instant aesthetic adaptation.',
    targetTab: '/settings?section=theme',
    targetRole: 'learner',
    scrollOffset: 190,
  },
  {
    id: 'settings-export',
    category: 'DEMO UTILITY',
    isCore: false,
    icon: 'download',
    title: '9. Cohort Gradebook Export (CSV)',
    subtitle: '1-Click Excel-Compatible Gradebook Sheet',
    description:
      'Export complete cohort performance data into UTF-8 BOM CSV for Excel, including quiz attempts, deliverable marks, and final graduation status.',
    tip: 'Demo Focus: Tap "Download Gradebook CSV" to generate an export-ready spreadsheet.',
    targetTab: '/settings?section=export',
    targetRole: 'learner',
    scrollOffset: 'bottom',
  },
  {
    id: 'settings-reset',
    category: 'DEMO UTILITY',
    isCore: false,
    icon: 'refresh',
    title: '10. Reset Demo Data to Initial State',
    subtitle: 'Safe Sandbox Re-simulation Any Time',
    description:
      'The ultimate testing tool: Evaluators can revert all mock data—quizzes, student submissions, revision requests, and certificates—back to default with 1 tap via a safe confirmation modal!',
    tip: 'Demo Focus: Tap "Reset All Demo Testing Data" to reset state whenever needed.',
    targetTab: '/settings?section=reset',
    targetRole: 'learner',
    scrollOffset: 'bottom',
  },
];
