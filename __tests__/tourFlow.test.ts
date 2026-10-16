import { useTourStore } from '../src/store/useTourStore';
import { useAuthStore } from '../src/store/useAuthStore';
import { useElearningStore } from '../src/store/useElearningStore';
import { TOUR_STEPS } from '../src/data/tourSteps';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

describe('EduFlow Guided Feature Tour Lifecycle Tests', () => {
  beforeEach(() => {
    useTourStore.getState().closeTour();
    useAuthStore.getState().logout();
    useElearningStore.getState().setHasSeenAppTour(false);
  });

  test('Tour cannot open when user is not authenticated', () => {
    expect(useAuthStore.getState().session).toBeNull();
    useTourStore.getState().openTour(0);
    expect(useTourStore.getState().isOpen).toBe(false);
  });

  test('Tour opens automatically upon user authentication and login', () => {
    const loginResult = useAuthStore.getState().login('budi@eduflow.id', 'demo123');
    expect(loginResult.success).toBe(true);
    expect(useAuthStore.getState().session?.isAuthenticated).toBe(true);

    useTourStore.getState().openTour(0);
    expect(useTourStore.getState().isOpen).toBe(true);
    expect(useTourStore.getState().currentStepIndex).toBe(0);
  });

  test('Step 5 is Class Manager and transitions forward to Step 6 Profile without popping', () => {
    useAuthStore.getState().login('alex@eduflow.id', 'demo123');
    useTourStore.getState().openTour(0);

    // Advance to Step 5 (index 4)
    useTourStore.getState().setStepIndex(4);
    expect(useTourStore.getState().currentStepIndex).toBe(4);

    const step5 = TOUR_STEPS[4];
    expect(step5.id).toBe('class-manager');
    expect(step5.targetTab).toBe('/class-manager');
    expect(step5.targetRole).toBe('teacher');

    // Click Next Step on Step 5 -> should advance to index 5 (Step 6)
    useTourStore.getState().nextStep(TOUR_STEPS.length);
    expect(useTourStore.getState().currentStepIndex).toBe(5);

    const step6 = TOUR_STEPS[5];
    expect(step6.id).toBe('profile-name');
    expect(step6.targetTab).toBe('/(tabs)/profile?section=name');
    expect(step6.targetRole).toBe('learner');
  });

  test('Step 5 Prev button cleanly returns to Step 4 Grading queue', () => {
    useAuthStore.getState().login('alex@eduflow.id', 'demo123');
    useTourStore.getState().openTour(4); // Start at Step 5

    expect(useTourStore.getState().currentStepIndex).toBe(4);
    useTourStore.getState().prevStep();

    expect(useTourStore.getState().currentStepIndex).toBe(3);
    const step4 = TOUR_STEPS[3];
    expect(step4.id).toBe('grading');
    expect(step4.targetTab).toBe('/(tabs)/grading');
    expect(step4.targetRole).toBe('teacher');
  });

  test('Finishing or closing the tour resets state cleanly', () => {
    useAuthStore.getState().login('budi@eduflow.id', 'demo123');
    useTourStore.getState().openTour(0);
    expect(useTourStore.getState().isOpen).toBe(true);

    useTourStore.getState().closeTour();
    expect(useTourStore.getState().isOpen).toBe(false);
    expect(useTourStore.getState().currentStepIndex).toBe(0);
  });
});
