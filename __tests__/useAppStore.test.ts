import { renderHook, act } from '@testing-library/react-native';
import { useAppStore } from '../src/store/useAppStore';

describe('useAppStore', () => {
  it('should initialize with default user state', () => {
    const { result } = renderHook(() => useAppStore());
    expect(result.current.user.name).toBe('Marcus Vance');
    expect(result.current.user.points).toBe(1250);
  });

  it('should add points correctly', () => {
    const { result } = renderHook(() => useAppStore());
    act(() => {
      result.current.addPoints(50);
    });
    expect(result.current.user.points).toBe(1300);
  });

  it('should enroll in a course', () => {
    const { result } = renderHook(() => useAppStore());
    act(() => {
      result.current.enrollInCourse('test-course-1');
    });
    expect(result.current.enrolledCourses).toContain('test-course-1');
  });
});
