import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  useWindowDimensions,
  BackHandler,
} from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useElearningStore } from '@/store/useElearningStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useTourStore } from '@/store/useTourStore';
import { TOUR_STEPS } from '@/data/tourSteps';

interface FeatureTourModalProps {
  visible?: boolean;
  onClose?: () => void;
}

export function FeatureTourModal({
  visible: propVisible,
  onClose: propOnClose,
}: FeatureTourModalProps = {}) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const { setHasSeenAppTour, switchRole } = useElearningStore();
  const session = useAuthStore((s) => s.session);
  const isAuthenticated = !!session?.isAuthenticated;

  const {
    isOpen: storeIsOpen,
    currentStepIndex,
    closeTour,
    nextStep,
    prevStep,
    setStepIndex,
  } = useTourStore();
  const { width: windowWidth } = useWindowDimensions();

  const isModalVisible = propVisible !== undefined ? propVisible : storeIsOpen;
  const [isMinimized, setIsMinimized] = useState(false);
  const lastNavigatedStepRef = useRef<number>(-1);
  const lastNavigatedTabRef = useRef<string>('');

  // Auto-close tour if session expires or user is unauthenticated
  useEffect(() => {
    if (!isAuthenticated && storeIsOpen) {
      closeTour();
    }
  }, [isAuthenticated, storeIsOpen, closeTour]);

  // Hardware back button support for Android
  useEffect(() => {
    if (!isModalVisible || !isAuthenticated) return;

    const onBackPress = () => {
      if (currentStepIndex > 0) {
        prevStep();
        return true;
      }
      return false;
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [isModalVisible, isAuthenticated, currentStepIndex, prevStep]);

  const activeStep = TOUR_STEPS[currentStepIndex] || TOUR_STEPS[0];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === TOUR_STEPS.length - 1;

  // Dynamically navigate to the target screen, role, and scroll offset as the tour progresses.
  // We debounce navigation by 100ms: rapid continuous clicks update the tour dock card INSTANTLY
  // with 0ms latency, while the underlying screen transition only executes cleanly for the active step.
  useEffect(() => {
    if (!isModalVisible || !isAuthenticated) {
      lastNavigatedStepRef.current = -1;
      lastNavigatedTabRef.current = '';
      return;
    }

    const step = TOUR_STEPS[currentStepIndex];
    if (!step) return;

    const navTimer = setTimeout(() => {
      if (lastNavigatedStepRef.current === currentStepIndex) {
        return;
      }
      lastNavigatedStepRef.current = currentStepIndex;

      // 1. Role switch if needed
      if (step.targetRole && useElearningStore.getState().currentRole !== step.targetRole) {
        switchRole(step.targetRole);
      }

      // 2. Screen navigation using router.replace (skips redundant calls if already on same tab)
      if (step.targetTab && lastNavigatedTabRef.current !== step.targetTab) {
        lastNavigatedTabRef.current = step.targetTab;
        try {
          router.replace(step.targetTab as any);
        } catch {
          try {
            router.navigate(step.targetTab as any);
          } catch {
            // Ignore navigation error
          }
        }
      }

      // 3. Scroll offset if specified
      if (step.scrollOffset !== undefined) {
        if (Platform.OS === 'web') {
          try {
            const scrollables = document.querySelectorAll<HTMLElement>(
              'div[class*="r-overflowY"], div[scrollable="true"]'
            );
            scrollables.forEach((el) => {
              if (el.scrollHeight > el.clientHeight && el.clientHeight > 200) {
                const targetY =
                  step.scrollOffset === 'bottom'
                    ? el.scrollHeight
                    : (step.scrollOffset as number);
                el.scrollTo({ top: targetY, behavior: 'smooth' });
              }
            });
          } catch {
            // Ignore DOM query issues on edge environments
          }
        }
      }
    }, 100);

    return () => clearTimeout(navTimer);
  }, [
    isModalVisible,
    isAuthenticated,
    currentStepIndex,
    switchRole,
    router,
  ]);

  const handleNext = () => {
    if (isLastStep) {
      handleFinish();
    } else {
      nextStep(TOUR_STEPS.length);
    }
  };

  const handlePrev = () => {
    if (isFirstStep) return;
    prevStep();
  };

  const handleFinish = () => {
    setHasSeenAppTour(true);
    closeTour();
    setIsMinimized(false);
    propOnClose?.();
    // Return to main dashboard with learner mode
    switchRole('learner');
    lastNavigatedTabRef.current = '/';
    try {
      router.replace('/' as any);
    } catch {
      router.navigate('/' as any);
    }
  };

  if (!isModalVisible || !isAuthenticated) return null;

  const cardMaxWidth = Math.min(windowWidth - 20, 500);

  return (
    <View style={styles.floatingContainer} pointerEvents="box-none">
      {/* NON-BLOCKING FLOATING DOCK (NO BLUR, NO DIMMING, FULL SCREEN VISIBLE) */}
      <View style={styles.dockOverlayContainer} pointerEvents="box-none">
          {/* MINIMIZED FLOATING PILL */}
          {isMinimized ? (
            <View
              pointerEvents="auto"
              style={[
                styles.minimizedPill,
                {
                  backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                  borderColor: activeStep.isCore ? '#3B82F6' : '#F59E0B',
                },
              ]}>
              <TouchableOpacity
                onPress={() => setIsMinimized(false)}
                style={styles.minimizedLeft}>
                <View
                  style={[
                    styles.minimizedBadge,
                    { backgroundColor: activeStep.isCore ? '#2563EB' : '#D97706' },
                  ]}>
                  <Ionicons name={activeStep.icon as any} size={13} color="#FFFFFF" />
                </View>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.minimizedText,
                    { color: isDark ? '#F8FAFC' : '#0F172A' },
                  ]}>
                  Tour ({currentStepIndex + 1}/{TOUR_STEPS.length}): {activeStep.title.replace(/^\d+\.\s*/, '')}
                </Text>
              </TouchableOpacity>

              <View style={styles.minimizedActions}>
                <TouchableOpacity
                  onPress={handleNext}
                  style={[
                    styles.minimizedNextBtn,
                    { backgroundColor: activeStep.isCore ? '#2563EB' : '#10B981' },
                  ]}>
                  <Text style={styles.minimizedNextBtnText}>
                    {isLastStep ? 'Finish' : 'Next ➔'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setIsMinimized(false)}
                  style={styles.minimizedIconBtn}
                  accessibilityLabel="Expand tour">
                  <Ionicons
                    name="expand-outline"
                    size={16}
                    color={isDark ? '#CBD5E1' : '#64748B'}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleFinish}
                  style={styles.minimizedCloseBtn}
                  accessibilityLabel="Close tour">
                  <Ionicons name="close" size={16} color="#DC2626" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            /* EXPANDED INTERACTIVE TOUR DOCK */
            <View
              pointerEvents="auto"
              style={[
                styles.dockCard,
                {
                  maxWidth: cardMaxWidth,
                  backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                  borderColor: activeStep.isCore ? '#3B82F6' : '#F59E0B',
                  borderBottomColor: activeStep.isCore ? '#1D4ED8' : '#D97706',
                },
              ]}>
              {/* Top Tag & Control Bar */}
              <View style={styles.dockTopRow}>
                <View style={styles.tagGroup}>
                  <View
                    style={[
                      styles.categoryTagPill,
                      {
                        backgroundColor: activeStep.isCore ? '#EEF2FF' : '#FEF3C7',
                        borderColor: activeStep.isCore ? '#BFDBFE' : '#FDE68A',
                      },
                    ]}>
                    <Ionicons
                      name={activeStep.isCore ? 'sparkles' : 'flask'}
                      size={11}
                      color={activeStep.isCore ? '#2563EB' : '#D97706'}
                    />
                    <Text
                      style={[
                        styles.categoryTagText,
                        { color: activeStep.isCore ? '#1D4ED8' : '#B45309' },
                      ]}>
                      {activeStep.category}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.stepProgressPill,
                      { backgroundColor: isDark ? '#0F172A' : '#F1F5F9' },
                    ]}>
                    <Text
                      style={[
                        styles.stepProgressText,
                        { color: isDark ? '#CBD5E1' : '#475569' },
                      ]}>
                      Step {currentStepIndex + 1} of {TOUR_STEPS.length}
                    </Text>
                  </View>
                </View>

                <View style={styles.topControlBtns}>
                  {/* Minimize Button */}
                  <TouchableOpacity
                    onPress={() => setIsMinimized(true)}
                    style={styles.controlIconBtn}
                    accessibilityLabel="Minimize tour">
                    <Ionicons
                      name="chevron-down"
                      size={18}
                      color={isDark ? '#CBD5E1' : '#64748B'}
                    />
                  </TouchableOpacity>

                  {/* Close / Skip Button */}
                  <TouchableOpacity
                    onPress={handleFinish}
                    style={styles.controlIconBtn}
                    accessibilityLabel="Exit tour">
                    <Ionicons
                      name="close"
                      size={18}
                      color={isDark ? '#CBD5E1' : '#64748B'}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Title & Subtitle */}
              <View style={styles.dockTitleRow}>
                <View
                  style={[
                    styles.titleIconSquare,
                    {
                      backgroundColor: activeStep.isCore ? '#EFF6FF' : '#FFFBEB',
                      borderColor: activeStep.isCore ? '#BFDBFE' : '#FDE68A',
                    },
                  ]}>
                  <Ionicons
                    name={activeStep.icon as any}
                    size={17}
                    color={activeStep.isCore ? '#2563EB' : '#D97706'}
                  />
                </View>

                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.dockTitle,
                      { color: isDark ? '#F8FAFC' : '#0F172A' },
                    ]}>
                    {activeStep.title}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.dockSubtitle,
                      { color: activeStep.isCore ? '#3B82F6' : '#D97706' },
                    ]}>
                    {activeStep.subtitle}
                  </Text>
                </View>
              </View>

              {/* Description Body */}
              <Text
                style={[
                  styles.dockDesc,
                  { color: isDark ? '#CBD5E1' : '#475569' },
                ]}>
                {activeStep.description}
              </Text>

              {/* Highlight Focus Tip */}
              <View
                style={[
                  styles.focusTipBox,
                  {
                    backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                    borderColor: isDark ? '#334155' : '#E2E8F0',
                  },
                ]}>
                <Ionicons
                  name="bulb-outline"
                  size={13}
                  color={activeStep.isCore ? '#2563EB' : '#D97706'}
                />
                <Text
                  style={[
                    styles.focusTipText,
                    { color: isDark ? '#94A3B8' : '#64748B' },
                  ]}>
                  {activeStep.tip}
                </Text>
              </View>

              {/* Bottom Actions Row */}
              <View style={styles.dockBottomRow}>
                {/* Prev Button */}
                <TouchableOpacity
                  onPress={handlePrev}
                  disabled={isFirstStep}
                  style={[
                    styles.navBtn,
                    styles.prevBtn,
                    isFirstStep && styles.navBtnDisabled,
                    {
                      backgroundColor: isDark ? '#0F172A' : '#F1F5F9',
                      borderColor: isDark ? '#334155' : '#CBD5E1',
                      borderBottomColor: isDark ? '#0B0F19' : '#94A3B8',
                    },
                  ]}>
                  <Ionicons
                    name="arrow-back"
                    size={14}
                    color={isFirstStep ? '#94A3B8' : isDark ? '#CBD5E1' : '#475569'}
                  />
                  <Text
                    style={[
                    styles.prevBtnText,
                    { color: isFirstStep ? '#94A3B8' : isDark ? '#CBD5E1' : '#475569' },
                  ]}>
                    Back
                  </Text>
                </TouchableOpacity>

                {/* Progress Dots */}
                <View style={styles.dotsRow}>
                  {TOUR_STEPS.map((_, idx) => (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => setStepIndex(idx)}
                      style={[
                        styles.dotItem,
                        idx === currentStepIndex
                          ? [
                              styles.dotItemActive,
                              {
                                backgroundColor: activeStep.isCore
                                  ? '#2563EB'
                                  : '#D97706',
                              },
                            ]
                          : {
                              backgroundColor: isDark ? '#334155' : '#CBD5E1',
                            },
                      ]}
                    />
                  ))}
                </View>

                {/* Next / Finish Button */}
                <TouchableOpacity
                  onPress={handleNext}
                  style={[
                    styles.navBtn,
                    styles.nextBtn,
                    {
                      backgroundColor: isLastStep
                        ? '#10B981'
                        : activeStep.isCore
                        ? '#2563EB'
                        : '#F59E0B',
                      borderColor: isLastStep
                        ? '#059669'
                        : activeStep.isCore
                        ? '#1D4ED8'
                        : '#D97706',
                      borderBottomColor: isLastStep
                        ? '#047857'
                        : activeStep.isCore
                        ? '#1E40AF'
                        : '#B45309',
                    },
                  ]}>
                  <Text style={styles.nextBtnText}>
                    {isLastStep ? 'Finish Tour 🎉' : 'Next Step ➔'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
  );
}

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 99999,
    elevation: 99999,
  },
  dockOverlayContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 24 : 14,
    paddingHorizontal: 10,
    zIndex: 50,
  },
  dockCard: {
    width: '100%',
    borderRadius: 20,
    padding: 14,
    borderWidth: 2,
    borderBottomWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  dockTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tagGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  categoryTagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  categoryTagText: {
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  stepProgressPill: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  stepProgressText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  topControlBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  controlIconBtn: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dockTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  titleIconSquare: {
    width: 32,
    height: 32,
    borderRadius: 9,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  dockTitle: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  dockSubtitle: {
    fontSize: 10.5,
    fontWeight: '700',
    marginTop: 1,
  },
  dockDesc: {
    fontSize: 11.5,
    lineHeight: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  focusTipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 9,
    borderWidth: 1,
    marginBottom: 10,
  },
  focusTipText: {
    fontSize: 10.5,
    fontWeight: '600',
    flex: 1,
    lineHeight: 14,
  },
  dockBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 11,
    borderWidth: 1.5,
    borderBottomWidth: 3.5,
    minHeight: 36,
  },
  navBtnDisabled: {
    opacity: 0.45,
  },
  prevBtn: {},
  prevBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  nextBtn: {
    flex: 1,
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  dotItem: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  dotItemActive: {
    width: 12,
    borderRadius: 3,
  },
  // MINIMIZED PILL STYLES
  minimizedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 2,
    borderBottomWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    maxWidth: 480,
    width: '100%',
    gap: 6,
  },
  minimizedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    minWidth: 0,
  },
  minimizedBadge: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  minimizedText: {
    fontSize: 11,
    fontWeight: '800',
    flex: 1,
  },
  minimizedActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
  },
  minimizedNextBtn: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 7,
  },
  minimizedNextBtnText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '800',
  },
  minimizedIconBtn: {
    padding: 3,
  },
  minimizedCloseBtn: {
    padding: 3,
    marginLeft: 2,
  },
});
