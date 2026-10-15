import { useAlertStore, AlertButton, AlertType, AlertConfig, detectAlertType } from '@/store/useAlertStore';
import { triggerAlertFeedback } from '@/utils/feedback';

export type { AlertButton, AlertType, AlertConfig };

export interface AlertOptions {
  cancelable?: boolean;
  onDismiss?: () => void;
  type?: AlertType;
}

/**
 * Universal Alert service powering EduFlow's custom Bento Alert Modal
 */
export const Alert = {
  /**
   * Drop-in replacement for React Native's Alert.alert
   */
  alert: (
    title: string,
    message?: string,
    buttons?: AlertButton[],
    options?: AlertOptions
  ) => {
    const defaultButtons: AlertButton[] =
      buttons && buttons.length > 0 ? buttons : [{ text: 'OK' }];

    const resolvedType =
      options?.type || detectAlertType(title, message, defaultButtons);

    // Trigger subtle sound and tactile haptics if enabled in Settings
    triggerAlertFeedback(resolvedType);

    useAlertStore.getState().showAlert({
      title,
      message,
      buttons: defaultButtons,
      type: resolvedType,
      cancelable: options?.cancelable ?? true,
      onDismiss: options?.onDismiss,
    });
  },

  /**
   * Quick success notification modal
   */
  success: (title: string, message?: string, onPress?: () => void) => {
    Alert.alert(title, message, [{ text: 'OK', onPress, style: 'default' }], {
      type: 'success',
    });
  },

  /**
   * Quick error / problem notification modal
   */
  error: (title: string, message?: string, onPress?: () => void) => {
    Alert.alert(title, message, [{ text: 'OK', onPress, style: 'default' }], {
      type: 'error',
    });
  },

  /**
   * Quick warning / attention modal
   */
  warning: (title: string, message?: string, onPress?: () => void) => {
    Alert.alert(title, message, [{ text: 'Understood', onPress, style: 'default' }], {
      type: 'warning',
    });
  },

  /**
   * Quick informational modal
   */
  info: (title: string, message?: string, onPress?: () => void) => {
    Alert.alert(title, message, [{ text: 'OK', onPress, style: 'default' }], {
      type: 'info',
    });
  },

  /**
   * Confirmation dialog modal with Cancel and Confirm buttons
   */
  confirm: (
    title: string,
    message?: string,
    onConfirm?: () => void,
    onCancel?: () => void,
    confirmText: string = 'Confirm',
    cancelText: string = 'Cancel',
    isDestructive: boolean = false
  ) => {
    Alert.alert(
      title,
      message,
      [
        { text: cancelText, onPress: onCancel, style: 'cancel' },
        {
          text: confirmText,
          onPress: onConfirm,
          style: isDestructive ? 'destructive' : 'default',
        },
      ],
      { type: isDestructive ? 'warning' : 'confirm' }
    );
  },
};

export const showAlert = Alert.alert;
