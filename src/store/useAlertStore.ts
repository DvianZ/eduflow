import { create } from 'zustand';

export type AlertType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

export interface AlertButton {
  text?: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
  isPreferred?: boolean;
}

export interface AlertConfig {
  title: string;
  message?: string;
  type?: AlertType;
  buttons?: AlertButton[];
  cancelable?: boolean;
  onDismiss?: () => void;
}

interface AlertStoreState {
  isOpen: boolean;
  config: AlertConfig | null;
  showAlert: (config: AlertConfig) => void;
  hideAlert: () => void;
}

export function detectAlertType(
  title: string = '',
  message: string = '',
  buttons?: AlertButton[]
): AlertType {
  const combined = `${title} ${message}`.toLowerCase();

  if (buttons?.some((b) => b.style === 'destructive')) {
    return 'warning';
  }
  if (
    combined.includes('success') ||
    combined.includes('berhasil') ||
    combined.includes('congratulations') ||
    combined.includes('completed') ||
    combined.includes('claimed') ||
    combined.includes('enrolled') ||
    combined.includes('passed') ||
    combined.includes('published') ||
    combined.includes('active') ||
    combined.includes('🎉') ||
    combined.includes('✓')
  ) {
    return 'success';
  }
  if (
    combined.includes('error') ||
    combined.includes('failed') ||
    combined.includes('gagal') ||
    combined.includes('invalid') ||
    combined.includes('locked') ||
    combined.includes('terkunci') ||
    combined.includes('delete') ||
    combined.includes('hapus')
  ) {
    return 'error';
  }
  if (
    combined.includes('warning') ||
    combined.includes('attention') ||
    combined.includes('perhatian') ||
    combined.includes('incomplete') ||
    combined.includes('caution') ||
    combined.includes('sign out') ||
    combined.includes('logout') ||
    combined.includes('reset') ||
    combined.includes('closed')
  ) {
    return 'warning';
  }
  if (buttons && buttons.length > 1) {
    return 'confirm';
  }
  return 'info';
}

export const useAlertStore = create<AlertStoreState>((set) => ({
  isOpen: false,
  config: null,
  showAlert: (config: AlertConfig) => {
    const resolvedType = config.type || detectAlertType(config.title, config.message, config.buttons);
    set({
      isOpen: true,
      config: {
        ...config,
        type: resolvedType,
      },
    });
  },
  hideAlert: () => {
    set({ isOpen: false, config: null });
  },
}));
