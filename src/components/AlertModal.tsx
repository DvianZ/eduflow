import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAlertStore, AlertButton, AlertType } from '@/store/useAlertStore';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSettingsStore } from '@/store/useSettingsStore';

export function AlertModal() {
  const { isOpen, config, hideAlert } = useAlertStore();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const tactileEffects = useSettingsStore((state) => state.tactileEffects);

  if (!isOpen || !config) return null;

  const {
    title,
    message,
    type = 'info',
    buttons = [{ text: 'OK' }],
    cancelable = true,
    onDismiss,
  } = config;

  const handleDismiss = () => {
    if (cancelable) {
      if (onDismiss) onDismiss();
      hideAlert();
    }
  };

  const handleButtonPress = (btn: AlertButton) => {
    hideAlert();
    if (btn.onPress) {
      // Execute callback after modal dismisses smoothly
      setTimeout(() => {
        btn.onPress?.();
      }, 80);
    }
  };

  // Icon, colors, and badge metadata per alert type
  const getTypeConfig = (
    alertType: AlertType
  ): {
    iconName: keyof typeof Ionicons.glyphMap;
    accentColor: string;
    bgColor: string;
    borderColor: string;
    tagLabel: string;
  } => {
    switch (alertType) {
      case 'success':
        return {
          iconName: 'checkmark-circle',
          accentColor: '#10B981',
          bgColor: isDark ? 'rgba(16, 185, 129, 0.16)' : '#ECFDF5',
          borderColor: isDark ? 'rgba(16, 185, 129, 0.35)' : '#A7F3D0',
          tagLabel: 'SUCCESS',
        };
      case 'error':
        return {
          iconName: 'alert-circle',
          accentColor: '#EF4444',
          bgColor: isDark ? 'rgba(239, 68, 68, 0.16)' : '#FEF2F2',
          borderColor: isDark ? 'rgba(239, 68, 68, 0.35)' : '#FECACA',
          tagLabel: 'ERROR',
        };
      case 'warning':
        return {
          iconName: 'warning',
          accentColor: '#F59E0B',
          bgColor: isDark ? 'rgba(245, 158, 11, 0.16)' : '#FFFBEB',
          borderColor: isDark ? 'rgba(245, 158, 11, 0.35)' : '#FDE68A',
          tagLabel: 'ATTENTION',
        };
      case 'confirm':
        return {
          iconName: 'help-circle',
          accentColor: '#6366F1',
          bgColor: isDark ? 'rgba(99, 102, 241, 0.16)' : '#EEF2FF',
          borderColor: isDark ? 'rgba(99, 102, 241, 0.35)' : '#C7D2FE',
          tagLabel: 'CONFIRMATION',
        };
      case 'info':
      default:
        return {
          iconName: 'information-circle',
          accentColor: '#2563EB',
          bgColor: isDark ? 'rgba(37, 99, 235, 0.16)' : '#EFF6FF',
          borderColor: isDark ? 'rgba(37, 99, 235, 0.35)' : '#BFDBFE',
          tagLabel: 'NOTICE',
        };
    }
  };

  const currentTypeConfig = getTypeConfig(type);

  // Surface palette
  const modalBg = isDark ? '#1E293B' : '#FFFFFF';
  const modalBorder = isDark ? '#334155' : '#E2E8F0';
  const titleColor = isDark ? '#F8FAFC' : '#0F172A';
  const msgColor = isDark ? '#94A3B8' : '#64748B';

  const isTwoButtons = buttons.length === 2;

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={handleDismiss}
      statusBarTranslucent>
      <View style={styles.overlay}>
        {/* Backdrop dismiss pressable */}
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={handleDismiss}
          accessibilityRole="button"
          accessibilityLabel="Dismiss Alert"
        />

        {/* Modal Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: modalBg,
              borderColor: modalBorder,
            },
          ]}>
          {/* Top Glowing Icon Badge */}
          <View
            style={[
              styles.iconWrapper,
              {
                backgroundColor: currentTypeConfig.bgColor,
                borderColor: currentTypeConfig.borderColor,
              },
            ]}>
            <Ionicons
              name={currentTypeConfig.iconName}
              size={36}
              color={currentTypeConfig.accentColor}
            />
          </View>

          {/* Category Tag */}
          <View
            style={[
              styles.tagPill,
              {
                backgroundColor: currentTypeConfig.bgColor,
                borderColor: currentTypeConfig.borderColor,
              },
            ]}>
            <Text
              style={[
                styles.tagText,
                { color: currentTypeConfig.accentColor },
              ]}>
              {currentTypeConfig.tagLabel}
            </Text>
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: titleColor }]}>{title}</Text>

          {/* Message */}
          {message ? (
            <Text style={[styles.message, { color: msgColor }]}>{message}</Text>
          ) : null}

          {/* Action Buttons */}
          <View
            style={[
              styles.buttonsContainer,
              isTwoButtons ? styles.twoButtonsRow : styles.columnButtons,
            ]}>
            {buttons.map((btn, index) => {
              const isCancel = btn.style === 'cancel';
              const isDestructive = btn.style === 'destructive';

              let btnBg = '#2563EB';
              let btnBorderBottom = tactileEffects ? '#1D4ED8' : 'transparent';
              let btnTextColor = '#FFFFFF';
              let btnBorderWidth = 0;
              let btnBorderColor = 'transparent';

              if (isCancel) {
                btnBg = isDark ? '#334155' : '#F1F5F9';
                btnBorderBottom = tactileEffects
                  ? (isDark ? '#1E293B' : '#CBD5E1')
                  : 'transparent';
                btnTextColor = isDark ? '#E2E8F0' : '#475569';
                btnBorderWidth = 1;
                btnBorderColor = isDark ? '#475569' : '#E2E8F0';
              } else if (isDestructive) {
                btnBg = '#DC2626';
                btnBorderBottom = tactileEffects ? '#991B1B' : 'transparent';
                btnTextColor = '#FFFFFF';
              } else if (type === 'success' && !isCancel) {
                btnBg = '#059669';
                btnBorderBottom = tactileEffects ? '#047857' : 'transparent';
                btnTextColor = '#FFFFFF';
              }

              return (
                <TouchableOpacity
                  key={`alert-btn-${index}`}
                  activeOpacity={0.82}
                  onPress={() => handleButtonPress(btn)}
                  style={[
                    styles.actionButton,
                    isTwoButtons && styles.flexButton,
                    {
                      backgroundColor: btnBg,
                      borderBottomWidth: tactileEffects ? 3 : 0,
                      borderBottomColor: btnBorderBottom,
                      borderWidth: btnBorderWidth,
                      borderColor: btnBorderColor,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.actionButtonText,
                      { color: btnTextColor },
                      (btn.isPreferred || (!isCancel && !isDestructive)) &&
                        styles.boldText,
                    ]}>
                    {btn.text || 'OK'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 99999,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 28,
    borderWidth: 1.5,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 24,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.35,
        shadowRadius: 28,
      },
      android: {
        elevation: 16,
      },
      web: {
        boxShadow: '0 24px 50px rgba(0, 0, 0, 0.35), 0 4px 12px rgba(0, 0, 0, 0.15)',
      },
    }),
  },
  iconWrapper: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  tagPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  message: {
    fontSize: 14.5,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 6,
  },
  buttonsContainer: {
    width: '100%',
  },
  twoButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  columnButtons: {
    flexDirection: 'column',
    gap: 10,
  },
  flexButton: {
    flex: 1,
  },
  actionButton: {
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  actionButtonText: {
    fontSize: 14.5,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  boldText: {
    fontWeight: '700',
  },
});
