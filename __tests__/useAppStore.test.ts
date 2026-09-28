import { useAppStore } from '../src/store/useAppStore';

describe('useAppStore', () => {
  beforeEach(() => {
    // Reset state before each test if needed
  });

  it('should initialize with default user state', () => {
    const state = useAppStore.getState();
    expect(state.user.name).toBe('Marcus Vance');
    expect(state.user.points).toBe(1250);
  });

  it('should add points correctly', () => {
    useAppStore.getState().addPoints(50);
    expect(useAppStore.getState().user.points).toBe(1300);
  });

  it('should enroll in a course', () => {
    useAppStore.getState().enrollInCourse('test-course-1');
    expect(useAppStore.getState().enrolledCourses).toContain('test-course-1');
  });
});
