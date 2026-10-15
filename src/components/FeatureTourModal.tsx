import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useElearningStore } from '@/store/useElearningStore';

interface FeatureTourModalProps {
  visible: boolean;
  onClose: () => void;
}

interface TourStep {
  id: string;
  category: 'CORE FEATURE' | 'DEMO UTILITY';
  isCore: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  description: string;
  tip: string;
  targetTab?: string;
  targetRole?: 'learner' | 'teacher';
}

export function FeatureTourModal({ visible, onClose }: FeatureTourModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const { setHasSeenAppTour, switchRole } = useElearningStore();
  const { width: windowWidth } = useWindowDimensions();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);

  const tourSteps: TourStep[] = [
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
      id: 'certificate',
      category: 'CORE FEATURE',
      isCore: true,
      icon: 'ribbon',
      title: '6. Graduation Evaluator & Certificate PDF',
      subtitle: 'Weighted 30:30:40 Formula & Official PDF',
      description:
        'The automated evaluator enforces the weighted formula: 30% curriculum progress + 30% quiz average + 40% project score. Graduated students can view credentials and print official PDF certificates!',
      tip: 'Demo Focus: Select Digital Entrepreneurship cohort, then tap "View Certificate" or "Print / Save PDF".',
      targetTab: '/(tabs)/profile',
      targetRole: 'learner',
    },
    {
      id: 'settings-theme',
      category: 'DEMO UTILITY',
      isCore: false,
      icon: 'color-palette',
      title: '7. Theme & Tactile Personalization',
      subtitle: 'Dark Mode, Light Mode & 3D Haptics',
      description:
        'In Settings, customize your experience: toggle between Light and Dark themes, enable 3D tactile vibration haptics on buttons, and audio milestone feedback.',
      tip: 'Demo Focus: Toggle between Dark and Light mode to experience instant aesthetic adaptation.',
      targetTab: '/settings?section=theme',
      targetRole: 'learner',
    },
    {
      id: 'settings-name',
      category: 'CORE FEATURE',
      isCore: true,
      icon: 'ribbon',
      title: '8. Official Legal Name for Certificates',
      subtitle: 'Verified Credential Name Synchronization',
      description:
        'Learners can configure their legal full name to appear on official accredited graduation certificates and digital verification records.',
      tip: 'Demo Focus: Edit the legal name and save—it immediately updates across all verified certificates.',
      targetTab: '/settings?section=name',
      targetRole: 'learner',
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
    },
  ];

  const activeStep = tourSteps[currentStepIndex] || tourSteps[0];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === tourSteps.length - 1;

  // Dynamically navigate to the target screen and role as the tour progresses
  useEffect(() => {
    if (visible && activeStep) {
      if (activeStep.targetRole) {
        switchRole(activeStep.targetRole);
      }
      if (activeStep.targetTab) {
        router.push(activeStep.targetTab as any);
      }
    }
  }, [visible, currentStepIndex, activeStep, router, switchRole]);

  const handleNext = () => {
    if (isLastStep) {
      handleFinish();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleFinish = () => {
    setHasSeenAppTour(true);
    setCurrentStepIndex(0);
    setIsMinimized(false);
    onClose();
    // Return to main dashboard with learner mode
    switchRole('learner');
    router.push('/(tabs)' as any);
  };

  if (!visible) return null;

  const cardMaxWidth = Math.min(windowWidth - 20, 500);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={handleFinish}>
      <View style={styles.modalRoot} pointerEvents="box-none">
        {/* NON-BLOCKING FLOATING DOCK (NO BLUR, NO DIMMING, FULL SCREEN VISIBLE) */}
        <View style={styles.dockOverlayContainer} pointerEvents="box-none">
          {/* MINIMIZED FLOATING PILL */}
          {isMinimized ? (
            <View
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
                  <Ionicons name={activeStep.icon} size={13} color="#FFFFFF" />
                </View>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.minimizedText,
                    { color: isDark ? '#F8FAFC' : '#0F172A' },
                  ]}>
                  Tour ({currentStepIndex + 1}/{tourSteps.length}): {activeStep.title.replace(/^\d+\.\s*/, '')}
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
                      Step {currentStepIndex + 1} of {tourSteps.length}
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
                    name={activeStep.icon}
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
                  {tourSteps.map((_, idx) => (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => setCurrentStepIndex(idx)}
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
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    position: 'relative',
    backgroundColor: 'transparent',
  },
  dockOverlayContainer: {
    flex: 1,
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
