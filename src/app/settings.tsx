import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  StyleSheet,
} from 'react-native';
import { Alert } from '@/utils/alert';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from '@/i18n';
import { useSettingsStore, AppTheme } from '@/store/useSettingsStore';
import { useElearningStore } from '@/store/useElearningStore';
import { useAuthStore } from '@/store/useAuthStore';
import { FeatureTourModal } from '@/components/FeatureTourModal';
import {
  buildGradebookRows,
  formatGradebookCSV,
  downloadCSVFile,
  copyCSVToClipboard,
} from '@/utils/exportGradebook';
import { DEMO_USERS } from '@/data/mockData';

export default function SettingsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { t } = useTranslation();

  const {
    theme,
    setTheme,
    tactileEffects,
    setTactileEffects,
    soundAndHaptics,
    setSoundAndHaptics,
    autoAdvanceLesson,
    setAutoAdvanceLesson,
    notifGrades,
    notifRevisions,
    notifAnnouncements,
    notifDeadlines,
    toggleNotifSetting,
  } = useSettingsStore();

  const {
    currentUser,
    updateCertificateName,
    resetDemoData,
    batches,
    courses,
    modules,
    lessons,
    quizzes,
    enrollments,
    submissions,
    grades,
    quizAttempts,
  } = useElearningStore();
  const registeredUsers = useAuthStore((state) => state.registeredUsers);
  const authUpdateCertName = useAuthStore((state) => state.updateCertificateName);

  const [officialName, setOfficialName] = useState(
    currentUser.certificateName || currentUser.fullName
  );
  const [showTourModal, setShowTourModal] = useState(false);
  const [nameSavedSuccess, setNameSavedSuccess] = useState(false);

  const { section } = useLocalSearchParams<{ section?: string }>();
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!section) return;
    const timer = setTimeout(() => {
      if (section === 'theme') {
        scrollRef.current?.scrollTo({ y: 190, animated: true });
      } else if (section === 'name') {
        scrollRef.current?.scrollTo({ y: 490, animated: true });
      } else if (section === 'export') {
        scrollRef.current?.scrollTo({ y: 640, animated: true });
      } else if (section === 'reset') {
        scrollRef.current?.scrollToEnd({ animated: true });
      }
    }, 180);
    return () => clearTimeout(timer);
  }, [section]);

  const handleSaveOfficialName = () => {
    if (!officialName.trim()) return;
    updateCertificateName(officialName.trim());
    authUpdateCertName(currentUser.id, officialName.trim());
    setNameSavedSuccess(true);
    setTimeout(() => setNameSavedSuccess(false), 3000);
  };

  const handleExportGradebook = () => {
    const targetBatch = batches[0];
    const rows = buildGradebookRows({
      batches,
      courses,
      modules,
      lessons,
      quizzes,
      enrollments,
      submissions,
      grades,
      quizAttempts,
      registeredUsers,
      targetBatchId: 'all',
    });
    const csv = formatGradebookCSV(
      rows,
      targetBatch ? targetBatch.batchName : 'Cohort Gradebook'
    );
    const filename = `gradebook_export_${new Date().toISOString().split('T')[0]}.csv`;
    const downloaded = downloadCSVFile(csv, filename);
    if (!downloaded) {
      copyCSVToClipboard(csv);
    }
    Alert.alert(
      t.assignment.downloadCsvSuccess,
      'Gradebook CSV for all enrolled learners generated and downloaded.'
    );
  };

  const handleResetDemo = () => {
    Alert.alert(
      t.header.resetConfirmTitle,
      t.header.resetConfirmMsg,
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.common.reset,
          style: 'destructive',
          onPress: () => {
            resetDemoData();
            const defaultName = DEMO_USERS.learner.fullName;
            setOfficialName(defaultName);
            authUpdateCertName('user-budi', defaultName);
            Alert.alert(t.common.success, t.header.resetSuccess);
          },
        },
      ]
    );
  };

  const bg = isDark ? '#090D16' : '#F4F6FA';
  const cardBg = isDark ? '#1E293B' : '#FFFFFF';
  const textPrimary = isDark ? '#F8FAFC' : '#0F172A';
  const textSecondary = isDark ? '#94A3B8' : '#64748B';
  const borderColor = isDark ? '#334155' : '#E2E8F0';
  const sectionTitleColor = isDark ? '#93C5FD' : '#2563EB';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bg }]}>
      {/* Top Header */}
      <View
        style={[
          styles.headerBar,
          {
            backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
            borderBottomColor: borderColor,
          },
        ]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[
            styles.backBtn,
            { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' },
          ]}
          accessibilityLabel={t.common.back}>
          <Ionicons name="arrow-back" size={20} color={textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitles}>
          <Text style={[styles.headerTitle, { color: textPrimary }]}>
            {t.settings.headerTitle}
          </Text>
          <Text style={[styles.headerSubtitle, { color: textSecondary }]}>
            EduFlow Cohort Platform
          </Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Module 1: Language & Localization */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconBadge, { backgroundColor: '#DBEAFE' }]}>
              <Ionicons name="globe-outline" size={18} color="#2563EB" />
            </View>
            <View style={styles.sectionHeaderTexts}>
              <Text style={[styles.sectionTitle, { color: sectionTitleColor }]}>
                {t.settings.languageSectionTitle}
              </Text>
              <Text style={[styles.sectionDesc, { color: textSecondary }]}>
                {t.settings.languageSectionDesc}
              </Text>
            </View>
          </View>

          <View style={[styles.bentoCard, { backgroundColor: cardBg, borderColor }]}>
            {/* English (United States) - Standardized */}
            <View
              style={[
                styles.langOptionRow,
                {
                  backgroundColor: isDark ? '#172554' : '#EFF6FF',
                  borderColor: '#3B82F6',
                },
              ]}>
              <View style={styles.langOptionLeft}>
                <Text style={styles.flagEmoji}>🇺🇸</Text>
                <View style={{ flex: 1 }}>
                  <View style={styles.langBadgeRow}>
                    <Text style={[styles.langName, { color: textPrimary }]}>
                      {t.settings.langEnglish}
                    </Text>
                    <View style={styles.defaultPill}>
                      <Text style={styles.defaultPillText}>STANDARDIZED</Text>
                    </View>
                  </View>
                  <Text style={[styles.langDesc, { color: textSecondary }]}>
                    {t.settings.langEnglishDesc}
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.radioCircle,
                  styles.radioCircleActive,
                ]}>
                <Ionicons name="checkmark" size={12} color="#FFFFFF" />
              </View>
            </View>

            <View style={[styles.cardDivider, { backgroundColor: borderColor }]} />

            {/* Regional Formatting Info */}
            <View style={[styles.langOptionRow, { paddingVertical: 12 }]}>
              <View style={styles.langOptionLeft}>
                <Ionicons name="calendar-outline" size={20} color="#3B82F6" style={{ marginRight: 6 }} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.langName, { color: textPrimary, fontSize: 13 }]}>
                    {t.settings.langLocale}
                  </Text>
                  <Text style={[styles.langDesc, { color: textSecondary, fontSize: 11 }]}>
                    {t.settings.langLocaleDesc}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Module 2: Appearance & Theme */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconBadge, { backgroundColor: '#EDE9FE' }]}>
              <Ionicons name="color-palette-outline" size={18} color="#7C3AED" />
            </View>
            <View style={styles.sectionHeaderTexts}>
              <Text style={[styles.sectionTitle, { color: sectionTitleColor }]}>
                {t.settings.appearanceSectionTitle}
              </Text>
              <Text style={[styles.sectionDesc, { color: textSecondary }]}>
                {t.settings.appearanceSectionDesc}
              </Text>
            </View>
          </View>

          <View style={[styles.bentoCard, { backgroundColor: cardBg, borderColor }]}>
            {/* Theme Selector */}
            <View style={styles.themeSelectorRow}>
              {(['system', 'light', 'dark'] as AppTheme[]).map((mode) => (
                <TouchableOpacity
                  key={mode}
                  onPress={() => setTheme(mode)}
                  style={[
                    styles.themePill,
                    {
                      backgroundColor:
                        theme === mode
                          ? '#2563EB'
                          : isDark
                          ? '#0F172A'
                          : '#F1F5F9',
                    },
                  ]}>
                  <Ionicons
                    name={
                      mode === 'system'
                        ? 'phone-portrait-outline'
                        : mode === 'light'
                        ? 'sunny-outline'
                        : 'moon-outline'
                    }
                    size={15}
                    color={theme === mode ? '#FFFFFF' : textSecondary}
                  />
                  <Text
                    style={[
                      styles.themePillText,
                      { color: theme === mode ? '#FFFFFF' : textSecondary },
                    ]}>
                    {mode === 'system'
                      ? t.settings.themeSystem
                      : mode === 'light'
                      ? t.settings.themeLight
                      : t.settings.themeDark}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={[styles.cardDivider, { backgroundColor: borderColor }]} />

            {/* Tactile 3D Feedback */}
            <View style={styles.switchRow}>
              <View style={styles.switchTextContainer}>
                <Text style={[styles.switchLabel, { color: textPrimary }]}>
                  {t.settings.tactileFeedbackLabel}
                </Text>
                <Text style={[styles.switchDesc, { color: textSecondary }]}>
                  {t.settings.tactileFeedbackDesc}
                </Text>
              </View>
              <Switch
                value={tactileEffects}
                onValueChange={setTactileEffects}
                trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
                thumbColor={tactileEffects ? '#2563EB' : '#F1F5F9'}
              />
            </View>

            <View style={[styles.cardDivider, { backgroundColor: borderColor }]} />

            {/* Audio & Haptic Feedback */}
            <View style={styles.switchRow}>
              <View style={styles.switchTextContainer}>
                <Text style={[styles.switchLabel, { color: textPrimary }]}>
                  {t.settings.soundEffectsLabel}
                </Text>
                <Text style={[styles.switchDesc, { color: textSecondary }]}>
                  {t.settings.soundEffectsDesc}
                </Text>
              </View>
              <Switch
                value={soundAndHaptics}
                onValueChange={setSoundAndHaptics}
                trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
                thumbColor={soundAndHaptics ? '#2563EB' : '#F1F5F9'}
              />
            </View>
          </View>
        </View>

        {/* Module 3: Cohort Notification Preferences */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconBadge, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="notifications-outline" size={18} color="#D97706" />
            </View>
            <View style={styles.sectionHeaderTexts}>
              <Text style={[styles.sectionTitle, { color: sectionTitleColor }]}>
                {t.settings.notificationSectionTitle}
              </Text>
              <Text style={[styles.sectionDesc, { color: textSecondary }]}>
                {t.settings.notificationSectionDesc}
              </Text>
            </View>
          </View>

          <View style={[styles.bentoCard, { backgroundColor: cardBg, borderColor }]}>
            <View style={styles.switchRow}>
              <View style={styles.switchTextContainer}>
                <Text style={[styles.switchLabel, { color: textPrimary }]}>
                  {t.settings.notifGradesLabel}
                </Text>
                <Text style={[styles.switchDesc, { color: textSecondary }]}>
                  {t.settings.notifGradesDesc}
                </Text>
              </View>
              <Switch
                value={notifGrades}
                onValueChange={() => toggleNotifSetting('notifGrades')}
                trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
                thumbColor={notifGrades ? '#2563EB' : '#F1F5F9'}
              />
            </View>

            <View style={[styles.cardDivider, { backgroundColor: borderColor }]} />

            <View style={styles.switchRow}>
              <View style={styles.switchTextContainer}>
                <Text style={[styles.switchLabel, { color: textPrimary }]}>
                  {t.settings.notifRevisionsLabel}
                </Text>
                <Text style={[styles.switchDesc, { color: textSecondary }]}>
                  {t.settings.notifRevisionsDesc}
                </Text>
              </View>
              <Switch
                value={notifRevisions}
                onValueChange={() => toggleNotifSetting('notifRevisions')}
                trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
                thumbColor={notifRevisions ? '#2563EB' : '#F1F5F9'}
              />
            </View>

            <View style={[styles.cardDivider, { backgroundColor: borderColor }]} />

            <View style={styles.switchRow}>
              <View style={styles.switchTextContainer}>
                <Text style={[styles.switchLabel, { color: textPrimary }]}>
                  {t.settings.notifAnnouncementsLabel}
                </Text>
                <Text style={[styles.switchDesc, { color: textSecondary }]}>
                  {t.settings.notifAnnouncementsDesc}
                </Text>
              </View>
              <Switch
                value={notifAnnouncements}
                onValueChange={() => toggleNotifSetting('notifAnnouncements')}
                trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
                thumbColor={notifAnnouncements ? '#2563EB' : '#F1F5F9'}
              />
            </View>

            <View style={[styles.cardDivider, { backgroundColor: borderColor }]} />

            <View style={styles.switchRow}>
              <View style={styles.switchTextContainer}>
                <Text style={[styles.switchLabel, { color: textPrimary }]}>
                  {t.settings.notifDeadlinesLabel}
                </Text>
                <Text style={[styles.switchDesc, { color: textSecondary }]}>
                  {t.settings.notifDeadlinesDesc}
                </Text>
              </View>
              <Switch
                value={notifDeadlines}
                onValueChange={() => toggleNotifSetting('notifDeadlines')}
                trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
                thumbColor={notifDeadlines ? '#2563EB' : '#F1F5F9'}
              />
            </View>
          </View>
        </View>

        {/* Module 4: Learning & Gatekeeper Parameters */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconBadge, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="book-outline" size={18} color="#15803D" />
            </View>
            <View style={styles.sectionHeaderTexts}>
              <Text style={[styles.sectionTitle, { color: sectionTitleColor }]}>
                {t.settings.learningSectionTitle}
              </Text>
              <Text style={[styles.sectionDesc, { color: textSecondary }]}>
                {t.settings.learningSectionDesc}
              </Text>
            </View>
          </View>

          <View style={[styles.bentoCard, { backgroundColor: cardBg, borderColor }]}>
            <View style={styles.switchRow}>
              <View style={styles.switchTextContainer}>
                <Text style={[styles.switchLabel, { color: textPrimary }]}>
                  {t.settings.autoAdvanceLabel}
                </Text>
                <Text style={[styles.switchDesc, { color: textSecondary }]}>
                  {t.settings.autoAdvanceDesc}
                </Text>
              </View>
              <Switch
                value={autoAdvanceLesson}
                onValueChange={setAutoAdvanceLesson}
                trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
                thumbColor={autoAdvanceLesson ? '#2563EB' : '#F1F5F9'}
              />
            </View>

            <View style={[styles.cardDivider, { backgroundColor: borderColor }]} />

            <View style={styles.infoRow}>
              <View style={styles.infoLeft}>
                <Ionicons name="shield-checkmark" size={18} color="#10B981" />
                <Text style={[styles.infoLabel, { color: textPrimary }]}>
                  {t.settings.passGradeInfoLabel}
                </Text>
              </View>
              <View style={styles.infoBadge}>
                <Text style={styles.infoBadgeText}>
                  {t.settings.passGradeInfoValue}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Module 5: Official Certificate Identity */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconBadge, { backgroundColor: '#FCE7F3' }]}>
              <Ionicons name="ribbon-outline" size={18} color="#BE185D" />
            </View>
            <View style={styles.sectionHeaderTexts}>
              <Text style={[styles.sectionTitle, { color: sectionTitleColor }]}>
                {t.settings.certificateSectionTitle}
              </Text>
              <Text style={[styles.sectionDesc, { color: textSecondary }]}>
                {t.settings.certificateSectionDesc}
              </Text>
            </View>
          </View>

          <View style={[styles.bentoCard, { backgroundColor: cardBg, borderColor }]}>
            <Text style={[styles.inputLabel, { color: textPrimary }]}>
              {t.settings.officialNameLabel}
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                  borderColor: isDark ? '#334155' : '#CBD5E1',
                  color: textPrimary,
                },
              ]}
              value={officialName}
              onChangeText={setOfficialName}
              placeholder={t.settings.officialNamePlaceholder}
              placeholderTextColor={textSecondary}
            />

            <TouchableOpacity
              onPress={handleSaveOfficialName}
              style={[
                styles.saveBtn,
                {
                  backgroundColor: '#2563EB',
                  borderBottomColor: '#1D4ED8',
                },
              ]}
              activeOpacity={0.85}>
              <Ionicons name="checkmark-circle-outline" size={16} color="#FFFFFF" />
              <Text style={styles.saveBtnText}>
                {t.settings.saveOfficialNameBtn}
              </Text>
            </TouchableOpacity>

            {nameSavedSuccess && (
              <View style={styles.successBanner}>
                <Ionicons name="checkmark-circle" size={14} color="#15803D" />
                <Text style={styles.successBannerText}>
                  {t.profile.nameSavedSuccess}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Module 6: Testing & Demonstration Controls */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconBadge, { backgroundColor: '#E0E7FF' }]}>
              <Ionicons name="flask-outline" size={18} color="#4338CA" />
            </View>
            <View style={styles.sectionHeaderTexts}>
              <Text style={[styles.sectionTitle, { color: sectionTitleColor }]}>
                {t.settings.demoSectionTitle}
              </Text>
              <Text style={[styles.sectionDesc, { color: textSecondary }]}>
                {t.settings.demoSectionDesc}
              </Text>
            </View>
          </View>

          <View style={[styles.bentoCard, { backgroundColor: cardBg, borderColor }]}>
            {/* Replay Tour */}
            <TouchableOpacity
              onPress={() => setShowTourModal(true)}
              style={styles.actionRow}
              activeOpacity={0.8}>
              <View style={styles.actionLeft}>
                <View style={[styles.actionIcon, { backgroundColor: '#DBEAFE' }]}>
                  <Ionicons name="sparkles" size={16} color="#2563EB" />
                </View>
                <View style={styles.actionTexts}>
                  <Text style={[styles.actionTitle, { color: textPrimary }]}>
                    {t.settings.replayTourBtn}
                  </Text>
                  <Text style={[styles.actionDesc, { color: textSecondary }]}>
                    {t.settings.replayTourDesc}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={textSecondary} />
            </TouchableOpacity>

            <View style={[styles.cardDivider, { backgroundColor: borderColor }]} />

            {/* Export Gradebook CSV */}
            <TouchableOpacity
              onPress={handleExportGradebook}
              style={styles.actionRow}
              activeOpacity={0.8}>
              <View style={styles.actionLeft}>
                <View style={[styles.actionIcon, { backgroundColor: '#DCFCE7' }]}>
                  <Ionicons name="download-outline" size={16} color="#15803D" />
                </View>
                <View style={styles.actionTexts}>
                  <Text style={[styles.actionTitle, { color: textPrimary }]}>
                    {t.settings.exportGradebookBtn}
                  </Text>
                  <Text style={[styles.actionDesc, { color: textSecondary }]}>
                    {t.settings.exportGradebookDesc}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={textSecondary} />
            </TouchableOpacity>

            <View style={[styles.cardDivider, { backgroundColor: borderColor }]} />

            {/* Reset Demo Data */}
            <TouchableOpacity
              onPress={handleResetDemo}
              style={styles.actionRow}
              activeOpacity={0.8}>
              <View style={styles.actionLeft}>
                <View style={[styles.actionIcon, { backgroundColor: '#FEE2E2' }]}>
                  <Ionicons name="refresh-outline" size={16} color="#DC2626" />
                </View>
                <View style={styles.actionTexts}>
                  <Text style={[styles.actionTitle, { color: '#DC2626' }]}>
                    {t.settings.resetDemoBtn}
                  </Text>
                  <Text style={[styles.actionDesc, { color: textSecondary }]}>
                    {t.settings.resetDemoDesc}
                  </Text>
                </View>
              </View>
              <Ionicons name="alert-circle-outline" size={18} color="#DC2626" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Module 7: About & App Specifications */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconBadge, { backgroundColor: '#F1F5F9' }]}>
              <Ionicons name="information-circle-outline" size={18} color="#475569" />
            </View>
            <View style={styles.sectionHeaderTexts}>
              <Text style={[styles.sectionTitle, { color: sectionTitleColor }]}>
                {t.settings.aboutSectionTitle}
              </Text>
              <Text style={[styles.sectionDesc, { color: textSecondary }]}>
                {t.settings.aboutArchitectureDesc}
              </Text>
            </View>
          </View>

          <View style={[styles.bentoCard, { backgroundColor: cardBg, borderColor }]}>
            <View style={styles.aboutRow}>
              <Text style={[styles.aboutKey, { color: textSecondary }]}>
                {t.settings.aboutAppName}
              </Text>
              <Text style={[styles.aboutVal, { color: textPrimary }]}>
                EduFlow Cohort
              </Text>
            </View>
            <View style={[styles.cardDivider, { backgroundColor: borderColor }]} />
            <View style={styles.aboutRow}>
              <Text style={[styles.aboutKey, { color: textSecondary }]}>
                Release Version
              </Text>
              <Text style={[styles.aboutVal, { color: textPrimary }]}>
                v1.0.0 (Build 1)
              </Text>
            </View>
            <View style={[styles.cardDivider, { backgroundColor: borderColor }]} />
            <View style={styles.aboutRow}>
              <Text style={[styles.aboutKey, { color: textSecondary }]}>
                Accreditation
              </Text>
              <Text style={[styles.aboutVal, { color: '#2563EB' }]}>
                Global Cohort Standard
              </Text>
            </View>
            <View style={[styles.cardDivider, { backgroundColor: borderColor }]} />
            <View style={styles.aboutRow}>
              <Text style={[styles.aboutKey, { color: textSecondary }]}>
                Storage Architecture
              </Text>
              <Text style={[styles.aboutVal, { color: '#10B981' }]}>
                100% Local Dynamic State
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Guided Tour Modal */}
      <FeatureTourModal
        visible={showTourModal}
        onClose={() => setShowTourModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitles: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '500',
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  sectionContainer: {
    gap: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  sectionIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeaderTexts: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  sectionDesc: {
    fontSize: 11,
    lineHeight: 15,
  },
  bentoCard: {
    borderRadius: 18,
    borderWidth: 1.5,
    borderBottomWidth: 4,
    padding: 14,
    overflow: 'hidden',
  },
  langOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  langOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  flagEmoji: {
    fontSize: 26,
  },
  langBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  langName: {
    fontSize: 14,
    fontWeight: '700',
  },
  defaultPill: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  defaultPillText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  langDesc: {
    fontSize: 11,
    marginTop: 2,
    maxWidth: 240,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: '#2563EB',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563EB',
  },
  cardDivider: {
    height: 1,
    marginVertical: 10,
  },
  themeSelectorRow: {
    flexDirection: 'row',
    gap: 8,
  },
  themePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 12,
  },
  themePillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  switchTextContainer: {
    flex: 1,
  },
  switchLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  switchDesc: {
    fontSize: 11,
    lineHeight: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  infoBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  infoBadgeText: {
    color: '#15803D',
    fontSize: 11,
    fontWeight: '800',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 10,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderBottomWidth: 3,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DCFCE7',
    padding: 8,
    borderRadius: 10,
    marginTop: 8,
  },
  successBannerText: {
    color: '#15803D',
    fontSize: 11,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  actionIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTexts: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  actionDesc: {
    fontSize: 11,
  },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  aboutKey: {
    fontSize: 12,
    fontWeight: '500',
  },
  aboutVal: {
    fontSize: 12,
    fontWeight: '700',
  },
});
