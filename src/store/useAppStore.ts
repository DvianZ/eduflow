import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  points: number;
  certificates: number;
  streak: number;
  isPro: boolean;
  hasOnboarded: boolean;
}

export interface OnboardingPreferences {
  tracks: string[];      // e.g. ['spatial', 'ml']
  dailyPace: string;     // '15' | '30' | '45'
  remindersEnabled: boolean;
}

interface LessonProgress {
  [lessonId: string]: number; // lessonId -> percentage 0-100
}

interface AppState {
  user: User;
  onboardingPrefs: OnboardingPreferences;

  // Progress
  enrolledCourses: string[];   // array of course IDs
  courseProgress: LessonProgress;
  completedLessons: string[];  // array of lesson IDs
  completedQuizzes: string[];  // array of quiz IDs
  bookmarkedCourses: string[]; // array of course IDs

  // Actions - User
  setUser: (user: Partial<User>) => void;
  completeOnboarding: (prefs?: OnboardingPreferences) => void;
  upgradeToPro: () => void;
  resetStore: () => void;

  // Actions - Course
  enrollInCourse: (courseId: string) => void;
  bookmarkCourse: (courseId: string) => void;
  unbookmarkCourse: (courseId: string) => void;

  // Actions - Learning
  updateLessonProgress: (lessonId: string, progress: number) => void;
  markLessonComplete: (lessonId: string) => void;
  markQuizComplete: (quizId: string, earnedPoints: number) => void;
  addPoints: (points: number) => void;

  // Cart (kept for checkout flow)
  cartItems: { id: string; title: string; price: number }[];
  addToCart: (item: { id: string; title: string; price: number }) => void;
  removeFromCart: (courseId: string) => void;
  clearCart: () => void;
}

const initialUser: User = {
  id: 'u1',
  name: 'Marcus Vance',
  email: 'marcus@eduflow.io',
  points: 1250,
  certificates: 2,
  streak: 14,
  avatar: 'https://lh3.googleusercontent.com/aida/AEtjO1WaHZb7NKm-N9FPGnW28jnYsblH33HsbgLJYMY7q-8Mm3GwDKspdqsW_3iurw9pZ9Qit-OdyBbz2XGXVNy1yMlaQi8wPQLCqj9AciVod62FAT6d46-qLZfpZ7SOScAoB1f6qvEqsyY_NasA5nKJausIBVSNfdtCJOelfNAYMV0LXKd43_7LNjnZxevvcNXQn6EDW089a-zP6zoLCnQBCyF0DqkEIg45iEu824uvs_N0YPHPo_o',
  isPro: false,
  hasOnboarded: false,
};

const initialOnboardingPrefs: OnboardingPreferences = {
  tracks: [],
  dailyPace: '30',
  remindersEnabled: true,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: initialUser,
      onboardingPrefs: initialOnboardingPrefs,

      enrolledCourses: [],
      courseProgress: {},
      completedLessons: [],
      completedQuizzes: [],
      bookmarkedCourses: [],

      // ── User Actions ──
      setUser: (userUpdate) => set((state) => ({ user: { ...state.user, ...userUpdate } })),

      completeOnboarding: (prefs) => set((state) => ({
        user: { ...state.user, hasOnboarded: true },
        onboardingPrefs: prefs ?? state.onboardingPrefs,
      })),

      upgradeToPro: () => set((state) => ({ user: { ...state.user, isPro: true } })),

      resetStore: () => set({
        user: { ...initialUser, hasOnboarded: false },
        onboardingPrefs: initialOnboardingPrefs,
        enrolledCourses: [],
        courseProgress: {},
        completedLessons: [],
        completedQuizzes: [],
        bookmarkedCourses: [],
        cartItems: [],
      }),

      // ── Course Actions ──
      enrollInCourse: (courseId) => set((state) => {
        if (state.enrolledCourses.includes(courseId)) return state;
        return { enrolledCourses: [...state.enrolledCourses, courseId] };
      }),

      bookmarkCourse: (courseId) => set((state) => {
        if (state.bookmarkedCourses.includes(courseId)) return state;
        return { bookmarkedCourses: [...state.bookmarkedCourses, courseId] };
      }),

      unbookmarkCourse: (courseId) => set((state) => ({
        bookmarkedCourses: state.bookmarkedCourses.filter(id => id !== courseId),
      })),

      // ── Learning Actions ──
      updateLessonProgress: (lessonId, progress) => set((state) => ({
        courseProgress: {
          ...state.courseProgress,
          [lessonId]: Math.min(Math.max(progress, 0), 100),
        },
      })),

      markLessonComplete: (lessonId) => set((state) => {
        if (state.completedLessons.includes(lessonId)) return state;
        return {
          completedLessons: [...state.completedLessons, lessonId],
          courseProgress: { ...state.courseProgress, [lessonId]: 100 },
          user: { ...state.user, points: state.user.points + 50 },
        };
      }),

      markQuizComplete: (quizId, earnedPoints) => set((state) => {
        if (state.completedQuizzes.includes(quizId)) return state;
        return {
          completedQuizzes: [...state.completedQuizzes, quizId],
          user: { ...state.user, points: state.user.points + earnedPoints },
        };
      }),

      addPoints: (points) => set((state) => ({
        user: { ...state.user, points: state.user.points + points },
      })),

      // ── Cart ──
      cartItems: [],
      addToCart: (item) => set((state) => {
        if (state.cartItems.find(c => c.id === item.id)) return state;
        return { cartItems: [...state.cartItems, item] };
      }),
      removeFromCart: (courseId) => set((state) => ({
        cartItems: state.cartItems.filter(c => c.id !== courseId),
      })),
      clearCart: () => set({ cartItems: [] }),
    }),
    {
      name: 'eduflow-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
