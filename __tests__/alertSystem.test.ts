jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

import { useAlertStore, detectAlertType } from '@/store/useAlertStore';
import { Alert } from '@/utils/alert';

describe('Custom Alert Modal & Store Logic', () => {
  beforeEach(() => {
    useAlertStore.getState().hideAlert();
  });

  test('should detect alert types accurately from title and message keywords', () => {
    expect(detectAlertType('Success', 'Lesson completed successfully')).toBe('success');
    expect(detectAlertType('Congratulations!', '+50 XP awarded')).toBe('success');
    expect(detectAlertType('Error', 'Invalid score entered')).toBe('error');
    expect(detectAlertType('Lesson Locked', 'Complete prerequisites')).toBe('error');
    expect(detectAlertType('Attention', 'Please answer all questions')).toBe('warning');
    expect(detectAlertType('Sign Out', 'Are you sure?')).toBe('warning');
    expect(
      detectAlertType('Action', 'Proceed?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive' },
      ])
    ).toBe('warning');
    expect(
      detectAlertType('Switch Cohort', 'Do you want to switch?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Switch', style: 'default' },
      ])
    ).toBe('confirm');
  });

  test('Alert.alert should open the modal with correct properties in useAlertStore', () => {
    Alert.alert('Congratulations!', 'You graduated the cohort!', [{ text: 'Great!' }]);

    const state = useAlertStore.getState();
    expect(state.isOpen).toBe(true);
    expect(state.config?.title).toBe('Congratulations!');
    expect(state.config?.message).toBe('You graduated the cohort!');
    expect(state.config?.type).toBe('success');
    expect(state.config?.buttons?.length).toBe(1);
    expect(state.config?.buttons?.[0].text).toBe('Great!');
  });

  test('Alert.confirm should configure two buttons with cancel and confirm styles', () => {
    let confirmed = false;
    Alert.confirm(
      'Delete Lesson',
      'This will remove the unit permanently.',
      () => {
        confirmed = true;
      },
      undefined,
      'Delete',
      'Cancel',
      true
    );

    const state = useAlertStore.getState();
    expect(state.isOpen).toBe(true);
    expect(state.config?.type).toBe('warning');
    expect(state.config?.buttons?.length).toBe(2);
    expect(state.config?.buttons?.[0].style).toBe('cancel');
    expect(state.config?.buttons?.[1].style).toBe('destructive');

    // Simulate clicking confirm
    state.config?.buttons?.[1].onPress?.();
    expect(confirmed).toBe(true);
  });

  test('hideAlert should close the modal cleanly', () => {
    Alert.info('Notice', 'System maintenance tonight');
    expect(useAlertStore.getState().isOpen).toBe(true);

    useAlertStore.getState().hideAlert();
    expect(useAlertStore.getState().isOpen).toBe(false);
    expect(useAlertStore.getState().config).toBeNull();
  });
});
