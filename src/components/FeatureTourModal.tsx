import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useElearningStore } from '@/store/useElearningStore';
import { useTranslation } from '@/i18n';

interface FeatureTourModalProps {
  visible: boolean;
  onClose: () => void;
}

interface TourStep {
  id: string;
  badge: string;
  icon: keyof typeof Ionicons.glyphMap;
  themeColor: string;
  themeBg: string;
  themeBorder: string;
  themeLip: string;
  title: string;
  subtitle: string;
  description: string;
  features: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    desc: string;
  }[];
  testingGuide: string[];
  targetTab?: string;
  targetRole?: 'learner' | 'teacher';
  actionLabel?: string;
}

export function FeatureTourModal({ visible, onClose }: FeatureTourModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const { t } = useTranslation();
  const { setHasSeenAppTour, switchRole } = useElearningStore();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const tourSteps: TourStep[] = [
    {
      id: 'intro',
      badge: t.tour.step1Tag,
      icon: 'school',
      themeColor: '#4F46E5',
      themeBg: '#EEF2FF',
      themeBorder: '#C7D2FE',
      themeLip: '#818CF8',
      title: t.tour.step1Title,
      subtitle: t.tour.step1Subtitle,
      description: t.tour.step1Desc,
      features: [
        {
          icon: 'flash-outline',
          title: t.tour.step1Feature1Title,
          desc: t.tour.step1Feature1Desc,
        },
        {
          icon: 'color-palette-outline',
          title: t.tour.step1Feature2Title,
          desc: t.tour.step1Feature2Desc,
        },
      ],
      testingGuide: [t.tour.step1Tip1, t.tour.step1Tip2],
      targetTab: '/(tabs)',
      actionLabel: t.tour.step1Action,
    },
    {
      id: 'dual-role',
      badge: t.tour.step2Tag,
      icon: 'swap-horizontal',
      themeColor: '#2563EB',
      themeBg: '#EFF6FF',
      themeBorder: '#BFDBFE',
      themeLip: '#60A5FA',
      title: t.tour.step2Title,
      subtitle: t.tour.step2Subtitle,
      description: t.tour.step2Desc,
      features: [
        {
          icon: 'person-outline',
          title: t.tour.step2Feature1Title,
          desc: t.tour.step2Feature1Desc,
        },
        {
          icon: 'ribbon-outline',
          title: t.tour.step2Feature2Title,
          desc: t.tour.step2Feature2Desc,
        },
      ],
      testingGuide: [t.tour.step2Tip1, t.tour.step2Tip2],
      targetRole: 'teacher',
      actionLabel: t.tour.step2Action,
    },
    {
      id: 'gatekeeper',
      badge: t.tour.step3Tag,
      icon: 'layers',
      themeColor: '#7C3AED',
      themeBg: '#F5F3FF',
      themeBorder: '#DDD6FE',
      themeLip: '#A78BFA',
      title: t.tour.step3Title,
      subtitle: t.tour.step3Subtitle,
      description: t.tour.step3Desc,
      features: [
        {
          icon: 'lock-closed-outline',
          title: t.tour.step3Feature1Title,
          desc: t.tour.step3Feature1Desc,
        },
        {
          icon: 'shield-checkmark-outline',
          title: t.tour.step3Feature2Title,
          desc: t.tour.step3Feature2Desc,
        },
      ],
      testingGuide: [t.tour.step3Tip1, t.tour.step3Tip2],
      targetTab: '/(tabs)/syllabus',
      targetRole: 'learner',
      actionLabel: t.tour.step3Action,
    },
    {
      id: 'quiz-assignments',
      badge: t.tour.step4Tag,
      icon: 'help-circle',
      themeColor: '#D97706',
      themeBg: '#FFFBEB',
      themeBorder: '#FDE68A',
      themeLip: '#FBBF24',
      title: t.tour.step4Title,
      subtitle: t.tour.step4Subtitle,
      description: t.tour.step4Desc,
      features: [
        {
          icon: 'radio-button-on-outline',
          title: t.tour.step4Feature1Title,
          desc: t.tour.step4Feature1Desc,
        },
        {
          icon: 'document-attach-outline',
          title: t.tour.step4Feature2Title,
          desc: t.tour.step4Feature2Desc,
        },
      ],
      testingGuide: [t.tour.step4Tip1, t.tour.step4Tip2],
      targetTab: '/(tabs)/grading',
      targetRole: 'learner',
      actionLabel: t.tour.step4Action,
    },
    {
      id: 'teacher-grading',
      badge: t.tour.step5Tag,
      icon: 'clipboard',
      themeColor: '#059669',
      themeBg: '#ECFDF5',
      themeBorder: '#A7F3D0',
      themeLip: '#34D399',
      title: t.tour.step5Title,
      subtitle: t.tour.step5Subtitle,
      description: t.tour.step5Desc,
      features: [
        {
          icon: 'create-outline',
          title: t.tour.step5Feature1Title,
          desc: t.tour.step5Feature1Desc,
        },
        {
          icon: 'download-outline',
          title: t.tour.step5Feature2Title,
          desc: t.tour.step5Feature2Desc,
        },
      ],
      testingGuide: [t.tour.step5Tip1, t.tour.step5Tip2],
      targetTab: '/(tabs)/grading',
      targetRole: 'teacher',
      actionLabel: t.tour.step5Action,
    },
    {
      id: 'graduation-cert',
      badge: t.tour.step6Tag,
      icon: 'ribbon',
      themeColor: '#E11D48',
      themeBg: '#FFF1F2',
      themeBorder: '#FECDD3',
      themeLip: '#FB7185',
      title: t.tour.step6Title,
      subtitle: t.tour.step6Subtitle,
      description: t.tour.step6Desc,
      features: [
        {
          icon: 'trophy-outline',
          title: t.tour.step6Feature1Title,
          desc: t.tour.step6Feature1Desc,
        },
        {
          icon: 'people-outline',
          title: t.tour.step6Feature2Title,
          desc: t.tour.step6Feature2Desc,
        },
      ],
      testingGuide: [t.tour.step6Tip1, t.tour.step6Tip2],
      targetTab: '/(tabs)/profile',
      targetRole: 'learner',
      actionLabel: t.tour.step6Action,
    },
  ];

  const activeStep = tourSteps[currentStepIndex] || tourSteps[0];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === tourSteps.length - 1;

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
    onClose();
  };

  const handleDirectFeatureAction = () => {
    setHasSeenAppTour(true);
    onClose();

    if (activeStep.targetRole) {
      switchRole(activeStep.targetRole);
    }
    if (activeStep.targetTab) {
      router.push(activeStep.targetTab as any);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={handleFinish}>
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.tourCard,
            {
              backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
              borderColor: isDark ? '#334155' : '#E2E8F0',
              borderBottomColor: isDark ? '#0F172A' : '#CBD5E1',
            },
          ]}>
          {/* Header with Step indicator and Skip button */}
          <View style={styles.cardHeader}>
            <View style={styles.stepCounterBadge}>
              <Text style={styles.stepCounterText}>
                {t.tour.stepIndicator} {currentStepIndex + 1} / {tourSteps.length}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleFinish}
              style={styles.skipButton}
              activeOpacity={0.7}>
              <Text style={styles.skipButtonText}>{t.tour.skipTour}</Text>
              <Ionicons name="close" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Segmented Progress Bars (Clickable) */}
          <View style={styles.progressBarContainer}>
            {tourSteps.map((step, idx) => {
              const isActive = idx === currentStepIndex;
              const isPast = idx < currentStepIndex;
              return (
                <TouchableOpacity
                  key={step.id}
                  onPress={() => setCurrentStepIndex(idx)}
                  style={[
                    styles.progressSegment,
                    {
                      backgroundColor: isActive
                        ? activeStep.themeColor
                        : isPast
                        ? isDark
                          ? '#475569'
                          : '#94A3B8'
                        : isDark
                        ? '#334155'
                        : '#E2E8F0',
                    },
                  ]}
                />
              );
            })}
          </View>

          {/* Scrollable Content Body */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}>
            {/* Center Visual Badge */}
            <View style={styles.visualBadgeWrapper}>
              <View
                style={[
                  styles.iconBadge3D,
                  {
                    backgroundColor: activeStep.themeBg,
                    borderColor: activeStep.themeBorder,
                    borderBottomColor: activeStep.themeLip,
                  },
                ]}>
                <Ionicons
                  name={activeStep.icon}
                  size={36}
                  color={activeStep.themeColor}
                />
              </View>

              <View
                style={[
                  styles.categoryPill,
                  {
                    backgroundColor: activeStep.themeBg,
                    borderColor: activeStep.themeBorder,
                  },
                ]}>
                <Text
                  style={[
                    styles.categoryPillText,
                    { color: activeStep.themeColor },
                  ]}>
                  {activeStep.badge}
                </Text>
              </View>
            </View>

            {/* Title & Subtitle */}
            <Text
              style={[
                styles.tourTitle,
                { color: isDark ? '#F8FAFC' : '#0F172A' },
              ]}>
              {activeStep.title}
            </Text>
            <Text style={styles.tourSubtitle}>{activeStep.subtitle}</Text>

            {/* Description */}
            <Text
              style={[
                styles.tourDesc,
                { color: isDark ? '#CBD5E1' : '#475569' },
              ]}>
              {activeStep.description}
            </Text>

            {/* Feature Highlights Grid */}
            <View style={styles.featuresList}>
              {activeStep.features.map((feat, i) => (
                <View
                  key={i}
                  style={[
                    styles.featureItemBox,
                    {
                      backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                      borderColor: isDark ? '#334155' : '#E2E8F0',
                      borderBottomColor: isDark ? '#1E293B' : '#CBD5E1',
                    },
                  ]}>
                  <View
                    style={[
                      styles.featIconCircle,
                      { backgroundColor: activeStep.themeBg },
                    ]}>
                    <Ionicons
                      name={feat.icon}
                      size={18}
                      color={activeStep.themeColor}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.featItemTitle,
                        { color: isDark ? '#F8FAFC' : '#0F172A' },
                      ]}>
                      {feat.title}
                    </Text>
                    <Text
                      style={[
                        styles.featItemDesc,
                        { color: isDark ? '#94A3B8' : '#64748B' },
                      ]}>
                      {feat.desc}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Testing Guide Box */}
            <View
              style={[
                styles.testingGuideCard,
                {
                  backgroundColor: isDark ? '#064E3B20' : '#ECFDF5',
                  borderColor: isDark ? '#065F46' : '#A7F3D0',
                  borderBottomColor: isDark ? '#047857' : '#6EE7B7',
                },
              ]}>
              <View style={styles.testingGuideHeader}>
                <Ionicons name="sparkles" size={16} color="#10B981" />
                <Text style={styles.testingGuideTitle}>
                  {t.tour.clientTestingTipsTitle}:
                </Text>
              </View>
              {activeStep.testingGuide.map((tip, idx) => (
                <View key={idx} style={styles.testingTipRow}>
                  <Text style={styles.tipBullet}>•</Text>
                  <Text
                    style={[
                      styles.tipText,
                      { color: isDark ? '#A7F3D0' : '#065F46' },
                    ]}>
                    {tip}
                  </Text>
                </View>
              ))}
            </View>

            {/* Quick Action Link to Feature */}
            {activeStep.actionLabel && (
              <TouchableOpacity
                onPress={handleDirectFeatureAction}
                style={[
                  styles.directActionLink,
                  {
                    backgroundColor: isDark ? '#0F172A' : '#EFF6FF',
                    borderColor: isDark ? '#334155' : '#BFDBFE',
                  },
                ]}>
                <Ionicons
                  name="arrow-forward-circle-outline"
                  size={16}
                  color={activeStep.themeColor}
                />
                <Text
                  style={[
                    styles.directActionText,
                    { color: activeStep.themeColor },
                  ]}>
                  {activeStep.actionLabel} ➔
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>

          {/* Footer Controls */}
          <View
            style={[
              styles.cardFooter,
              {
                borderTopColor: isDark ? '#334155' : '#E2E8F0',
                backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
              },
            ]}>
            {!isFirstStep && (
              <TouchableOpacity
                onPress={handlePrev}
                style={[
                  styles.prevButton,
                  {
                    backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                    borderColor: isDark ? '#334155' : '#CBD5E1',
                    borderBottomColor: isDark ? '#1E293B' : '#94A3B8',
                  },
                ]}>
                <Ionicons
                  name="arrow-back"
                  size={16}
                  color={isDark ? '#CBD5E1' : '#475569'}
                />
                <Text
                  style={[
                    styles.prevButtonText,
                    { color: isDark ? '#CBD5E1' : '#475569' },
                  ]}>
                  {t.tour.prevBtn}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleNext}
              style={[
                styles.nextButton,
                isFirstStep && { flex: 1 },
                {
                  backgroundColor: isLastStep ? '#10B981' : activeStep.themeColor,
                  borderColor: isLastStep ? '#059669' : activeStep.themeBorder,
                  borderBottomColor: isLastStep ? '#047857' : activeStep.themeLip,
                },
              ]}>
              <Text style={styles.nextButtonText}>
                {isLastStep ? t.tour.finishBtn : `${t.tour.nextBtn} ➔`}
              </Text>
              {!isLastStep && (
                <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  tourCard: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '92%',
    borderRadius: 24,
    borderWidth: 2,
    borderBottomWidth: 6,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 8,
  },
  stepCounterBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stepCounterText: {
    color: '#4F46E5',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  skipButtonText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  progressBarContainer: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    alignItems: 'center',
  },
  visualBadgeWrapper: {
    alignItems: 'center',
    marginVertical: 10,
  },
  iconBadge3D: {
    width: 72,
    height: 72,
    borderRadius: 22,
    borderWidth: 2,
    borderBottomWidth: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  categoryPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  categoryPillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  tourTitle: {
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  tourSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6366F1',
    textAlign: 'center',
    marginBottom: 10,
  },
  tourDesc: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 14,
  },
  featuresList: {
    width: '100%',
    gap: 8,
    marginBottom: 12,
  },
  featureItemBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderBottomWidth: 3,
  },
  featIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  featItemTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  featItemDesc: {
    fontSize: 11,
    lineHeight: 15,
  },
  testingGuideCard: {
    width: '100%',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderBottomWidth: 3,
    marginBottom: 10,
  },
  testingGuideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  testingGuideTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#059669',
  },
  testingTipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 3,
  },
  tipBullet: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '900',
  },
  tipText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500',
  },
  directActionLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    width: '100%',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
  },
  directActionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  prevButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderBottomWidth: 4,
  },
  prevButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderBottomWidth: 4,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
