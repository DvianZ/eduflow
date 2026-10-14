import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  useColorScheme,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { DemoHeader } from '@/components/DemoHeader';
import { useElearningStore } from '@/store/useElearningStore';
import { calculateBatchEvaluation } from '@/utils/lockEngine';
import { useTranslation } from '@/i18n';

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const { t, language } = useTranslation();

  const {
    currentRole,
    currentUser,
    batches,
    courses,
    modules,
    enrollments,
    selectedBatchId,
    selectBatch,
    announcements,
    createAnnouncement,
    joinBatchByCode,
    lessons,
    completedLessonIds,
    quizAttempts,
    submissions,
    grades,
    notifications,
  } = useElearningStore();

  const unreadAlertNotif = notifications.find(
    (n) =>
      n.userId === currentUser.id &&
      !n.isRead &&
      (n.type === 'revision' || n.type === 'grade')
  );

  const userEnrollments = enrollments.filter((e) => e.userId === currentUser.id);
  const enrolledBatches = batches.filter((b) =>
    userEnrollments.some((e) => e.batchId === b.id)
  );
  const teacherBatches = batches.filter((b) => b.instructorId === currentUser.id);

  const activeBatch =
    batches.find((b) => b.id === selectedBatchId) ||
    (currentRole === 'teacher'
      ? teacherBatches[0] || batches[0]
      : enrolledBatches[0] || batches[0]);
  const activeCourse = courses.find((c) => c.id === activeBatch?.courseId) || courses[0];
  const isTeacher = currentRole === 'teacher';

  // Teacher announcement form state
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');

  // Join class modal state
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = async (code: string) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(code);
      }
    } catch {
      // fallback
    }
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Hitung evaluasi spesifik untuk batch terpilih
  const activeBatchModules = modules.filter((m) => m.courseId === activeBatch.courseId);
  const activeBatchModuleIds = activeBatchModules.map((m) => m.id);
  const activeBatchLessons = lessons.filter((l) =>
    activeBatchModuleIds.includes(l.moduleId)
  );
  const activeBatchLessonIds = activeBatchLessons.map((l) => l.id);

  const userQuizAttempts = quizAttempts.filter((q) => q.userId === currentUser.id);
  const userSubmissions = submissions.filter((s) => s.userId === currentUser.id);
  const userGrades = grades.filter((g) => {
    const s = submissions.find((sub) => sub.id === g.submissionId);
    return s ? s.userId === currentUser.id : false;
  });

  const evalResult = calculateBatchEvaluation(
    activeBatchLessons.length,
    {
      completedLessonIds,
      quizAttempts: userQuizAttempts,
      submissions: userSubmissions,
      grades: userGrades,
    },
    activeBatchLessonIds
  );

  // Submissions & metrics untuk pengajar pada kelas aktif
  const activeBatchSubmissions = submissions.filter((s) => s.batchId === activeBatch.id);
  const pendingSubmissions = activeBatchSubmissions.filter(
    (s) => s.status === 'SUBMITTED'
  );
  const activeBatchSubmissionIds = activeBatchSubmissions.map((s) => s.id);
  const activeBatchGrades = grades.filter((g) =>
    activeBatchSubmissionIds.includes(g.submissionId)
  );
  const activeBatchAverageGrade =
    activeBatchGrades.length > 0
      ? Math.round(
          activeBatchGrades.reduce((sum, g) => sum + g.score, 0) / activeBatchGrades.length
        )
      : 0;
  const activeBatchEnrolledCount = enrollments.filter(
    (e) => e.batchId === activeBatch.id
  ).length;

  const handlePostAnnouncement = () => {
    if (!annTitle.trim() || !annMessage.trim()) {
      Alert.alert(t.dashboard.formIncompleteAlert, t.dashboard.formIncompleteMsg);
      return;
    }
    createAnnouncement(activeBatch.id, annTitle.trim(), annMessage.trim());
    setAnnTitle('');
    setAnnMessage('');
    Alert.alert(t.common.success, t.dashboard.announcementSuccessAlert);
  };

  const handleJoinClass = () => {
    setJoinError('');
    if (!joinCode.trim()) {
      setJoinError(t.dashboard.enterClassCodeError);
      return;
    }
    const result = joinBatchByCode(joinCode.trim(), currentUser.id);
    if (!result.success) {
      setJoinError(result.error || t.dashboard.joinFailedError);
      return;
    }
    setShowJoinModal(false);
    setJoinCode('');
    Alert.alert(t.dashboard.joinSuccessAlert, t.dashboard.joinSuccessMsg);
  };

  // Gamified & Tactile 3D Color Tokens
  const pageBg = isDark ? '#0B0F19' : '#F4F6FA';
  const cardBg = isDark ? '#1E293B' : '#FFFFFF';
  const textPrimary = isDark ? '#F8FAFC' : '#1E293B';
  const textSecondary = isDark ? '#94A3B8' : '#64748B';
  const inputBg = isDark ? '#0F172A' : '#F8FAFC';

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: pageBg }]}>
      <DemoHeader />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* ============================================================== */}
        {/* GAMIFIED BENTO GRID (2-COLUMN DUOLINGO x iOS WIDGET) */}
        {/* ============================================================== */}
        <View style={styles.bentoGrid}>
          {/* ============================================================== */}
          {/* HERO CARD / MISI UTAMA (SPAN 2): 3D TACTILE GRADIENT */}
          {/* ============================================================== */}
          <View style={[styles.bentoSpan2, styles.heroCard3D]}>
            <View style={styles.heroTopRow}>
              {/* Status Pill */}
              <View style={styles.heroBadgePill}>
                <Ionicons
                  name={
                    activeBatch.status === 'completed'
                      ? 'trophy'
                      : activeBatch.id === 'batch-edf-402'
                      ? 'flash'
                      : 'school'
                  }
                  size={13}
                  color="#FBBF24"
                />
                <Text style={styles.heroBadgeText}>
                  {activeBatch.id === 'batch-edf-402'
                    ? t.dashboard.heroBadgeActiveMission
                    : activeBatch.status === 'completed'
                    ? t.dashboard.heroBadgeGraduated
                    : t.dashboard.heroBadgeActiveClass}
                </Text>
              </View>

              {/* Class Code Tactile Pill */}
              <TouchableOpacity
                onPress={() => handleCopyCode(activeBatch.classCode)}
                activeOpacity={0.8}
                style={[
                  styles.heroCodePill,
                  copiedCode === activeBatch.classCode && styles.heroCodePillCopied,
                ]}>
                <Ionicons
                  name={copiedCode === activeBatch.classCode ? 'checkmark' : 'copy'}
                  size={12}
                  color="#FFFFFF"
                />
                <Text style={styles.heroCodePillLabel}>{t.dashboard.heroCodeLabel}</Text>
                <Text style={styles.heroCodePillValue}>
                  {copiedCode === activeBatch.classCode ? t.dashboard.heroCodeCopied : activeBatch.classCode}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.heroCourseTitle}>
              {activeCourse?.title || activeBatch.batchName}
            </Text>
            <Text style={styles.heroBatchSubtitle}>{activeBatch.batchName}</Text>

            <View style={styles.heroMentorRow}>
              <View style={styles.heroMentorAvatar}>
                <Ionicons name="person" size={13} color="#FFFFFF" />
              </View>
              <Text style={styles.heroMentorText}>
                {t.dashboard.heroMentorLabel} <Text style={styles.heroMentorName}>{activeBatch.instructorName}</Text>
              </Text>
            </View>
          </View>

          {/* ============================================================== */}
          {/* LEARNER SPECIFIC VIEW */}
          {/* ============================================================== */}
          {!isTeacher ? (
            <>
              {/* URGENT NOTIFICATION BANNER (SPAN 2, IF ANY) */}
              {unreadAlertNotif && (
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => router.push('/(tabs)/grading')}
                  style={[
                    styles.bentoSpan2,
                    styles.urgentBanner3D,
                    {
                      backgroundColor:
                        unreadAlertNotif.type === 'revision' ? '#FEF3C7' : '#ECFDF5',
                      borderColor:
                        unreadAlertNotif.type === 'revision' ? '#F59E0B' : '#10B981',
                      borderBottomColor:
                        unreadAlertNotif.type === 'revision' ? '#D97706' : '#059669',
                    },
                  ]}>
                  <View
                    style={[
                      styles.urgentIconCircle,
                      {
                        backgroundColor:
                          unreadAlertNotif.type === 'revision' ? '#F59E0B' : '#10B981',
                      },
                    ]}>
                    <Ionicons
                      name={unreadAlertNotif.type === 'revision' ? 'alert' : 'trophy'}
                      size={18}
                      color="#FFFFFF"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.urgentTitleText,
                        {
                          color:
                            unreadAlertNotif.type === 'revision' ? '#92400E' : '#065F46',
                        },
                      ]}>
                      {unreadAlertNotif.title}
                    </Text>
                    <Text
                      style={[
                        styles.urgentMessageText,
                        {
                          color:
                            unreadAlertNotif.type === 'revision' ? '#78350F' : '#047857',
                        },
                      ]}
                      numberOfLines={2}>
                      {unreadAlertNotif.message}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={unreadAlertNotif.type === 'revision' ? '#B45309' : '#047857'}
                  />
                </TouchableOpacity>
              )}

              {/* PROGRESS HERO (SPAN 2): CHUNKY 3D GAMIFIED PROGRESS */}
              <View
                style={[
                  styles.bentoSpan2,
                  styles.bentoCard3D,
                  { backgroundColor: cardBg },
                ]}>
                <View style={styles.cardHeaderRow}>
                  <View style={styles.cardHeaderLeft}>
                    <View style={[styles.headerIconBox, { backgroundColor: '#EEF2FF', borderColor: '#C7D2FE' }]}>
                      <Ionicons name="sparkles" size={16} color="#4F46E5" />
                    </View>
                    <Text style={[styles.cardHeaderTitle, { color: textPrimary }]}>
                      {t.dashboard.adventureProgress}
                    </Text>
                  </View>
                  <View style={styles.progressBadgePill}>
                    <Text style={styles.progressBadgeText}>{evalResult.lessonProgressPct}%</Text>
                  </View>
                </View>

                {/* Chunky 3D Progress Bar */}
                <View style={styles.progressBarTrack3D}>
                  <View
                    style={[
                      styles.progressBarFill3D,
                      {
                        width: `${Math.max(evalResult.lessonProgressPct, 6)}%`,
                        backgroundColor:
                          evalResult.lessonProgressPct === 100 ? '#10B981' : '#4F46E5',
                        borderBottomColor:
                          evalResult.lessonProgressPct === 100 ? '#047857' : '#312E81',
                      },
                    ]}
                  />
                </View>

                {/* Tactile 3D Green CTA Button (Duolingo Style) */}
                <TouchableOpacity
                  onPress={() => router.push('/(tabs)/syllabus')}
                  activeOpacity={0.8}
                  style={styles.tactileBtnGreen}>
                  <Text style={styles.tactileBtnGreenText}>{t.dashboard.openSyllabusBtn}</Text>
                  <Ionicons name="arrow-forward-circle" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* METRIC 1 (SPAN 1): MATERI SELESAI */}
              <View
                style={[
                  styles.bentoSpan1,
                  styles.bentoWidget3D,
                  { backgroundColor: cardBg },
                ]}>
                <View style={styles.widgetTopRow}>
                  <View style={[styles.widgetIconSquare, { backgroundColor: '#E0F2FE', borderColor: '#BAE6FD' }]}>
                    <Ionicons name="book" size={18} color="#0284C7" />
                  </View>
                  <Text style={[styles.widgetCategoryLabel, { color: textSecondary }]}>{t.dashboard.metricLessons}</Text>
                </View>
                <View style={styles.widgetBottomCol}>
                  <Text style={[styles.widgetBigValue, { color: '#0284C7' }]}>
                    {evalResult.completedLessons}/{evalResult.totalLessons}
                  </Text>
                  <Text style={[styles.widgetDescText, { color: textSecondary }]}>
                    {t.dashboard.metricCompleted}
                  </Text>
                </View>
              </View>

              {/* METRIC 2 (SPAN 1): KUIS LULUS */}
              <View
                style={[
                  styles.bentoSpan1,
                  styles.bentoWidget3D,
                  { backgroundColor: cardBg },
                ]}>
                <View style={styles.widgetTopRow}>
                  <View style={[styles.widgetIconSquare, { backgroundColor: '#D1FAE5', borderColor: '#A7F3D0' }]}>
                    <Ionicons name="checkmark-done" size={18} color="#10B981" />
                  </View>
                  <Text style={[styles.widgetCategoryLabel, { color: textSecondary }]}>{t.dashboard.metricQuiz}</Text>
                </View>
                <View style={styles.widgetBottomCol}>
                  <Text style={[styles.widgetBigValue, { color: '#10B981' }]}>
                    {userQuizAttempts.filter((q) => q.isPassed).length}
                  </Text>
                  <Text style={[styles.widgetDescText, { color: textSecondary }]}>
                    {t.dashboard.metricPassed}
                  </Text>
                </View>
              </View>

              {/* METRIC 3 (SPAN 1): NILAI TUGAS */}
              <View
                style={[
                  styles.bentoSpan1,
                  styles.bentoWidget3D,
                  { backgroundColor: cardBg },
                ]}>
                <View style={styles.widgetTopRow}>
                  <View style={[styles.widgetIconSquare, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
                    <Ionicons name="document-text" size={18} color="#F59E0B" />
                  </View>
                  <Text style={[styles.widgetCategoryLabel, { color: textSecondary }]}>{t.dashboard.metricAssignment}</Text>
                </View>
                <View style={styles.widgetBottomCol}>
                  <Text style={[styles.widgetBigValue, { color: '#F59E0B' }]}>
                    {userGrades.length > 0 ? `${userGrades[0].score}` : '-'}
                  </Text>
                  <Text style={[styles.widgetDescText, { color: textSecondary }]}>
                    {userGrades.length > 0 ? t.dashboard.metricProjectScore : t.dashboard.metricNotGraded}
                  </Text>
                </View>
              </View>

              {/* METRIC 4 (SPAN 1): STATUS KELULUSAN */}
              <View
                style={[
                  styles.bentoSpan1,
                  styles.bentoWidget3D,
                  { backgroundColor: cardBg },
                ]}>
                <View style={styles.widgetTopRow}>
                  <View style={[styles.widgetIconSquare, { backgroundColor: '#EDE9FE', borderColor: '#DDD6FE' }]}>
                    <Ionicons name="ribbon" size={18} color="#8B5CF6" />
                  </View>
                  <Text style={[styles.widgetCategoryLabel, { color: textSecondary }]}>{t.dashboard.metricStatus}</Text>
                </View>
                <View style={styles.widgetBottomCol}>
                  <Text
                    style={[
                      styles.widgetBigValue,
                      {
                        fontSize: 17,
                        color: evalResult.canGraduate ? '#10B981' : '#4F46E5',
                      },
                    ]}>
                    {evalResult.canGraduate ? t.dashboard.statusPassed : t.dashboard.statusInProgress}
                  </Text>
                  <Text style={[styles.widgetDescText, { color: textSecondary }]}>
                    {evalResult.canGraduate ? t.dashboard.statusCertReady : t.dashboard.statusPursue}
                  </Text>
                </View>
              </View>

              {/* SECTION HEADER (SPAN 2): COHORT LIST */}
              <View style={[styles.bentoSpan2, styles.gamifiedSectionHeader]}>
                <Text style={[styles.gamifiedSectionTitle, { color: textPrimary }]}>
                  {t.dashboard.enrolledClassesTitle}
                </Text>
                <Text style={[styles.gamifiedSectionSubtitle, { color: textSecondary }]}>
                  {t.dashboard.enrolledClassesSubtitle}
                </Text>
              </View>

              {/* ENROLLED COHORTS LIST */}
              {enrolledBatches.length === 0 ? (
                <View
                  style={[
                    styles.bentoSpan2,
                    styles.bentoCard3D,
                    styles.emptyEnrolledBox,
                    { backgroundColor: cardBg },
                  ]}>
                  <View style={styles.emptyIconCircle3D}>
                    <Ionicons name="school" size={32} color="#4F46E5" />
                  </View>
                  <Text style={[styles.emptyTitleText, { color: textPrimary }]}>
                    {t.dashboard.noClassesEnrolledTitle}
                  </Text>
                  <Text style={[styles.emptySubtitleText, { color: textSecondary }]}>
                    {t.dashboard.noClassesEnrolledSubtitle}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowJoinModal(true)}
                    activeOpacity={0.8}
                    style={styles.tactileBtnGreen}>
                    <Ionicons name="key" size={16} color="#FFFFFF" />
                    <Text style={styles.tactileBtnGreenText}>{t.dashboard.enterClassCodeBtn}</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                enrolledBatches.map((b) => {
                  const c = courses.find((course) => course.id === b.courseId);
                  const enr = enrollments.find((e) => e.batchId === b.id);
                  const isSelected = b.id === activeBatch.id;
                  const isDynamic = b.id === 'batch-edf-402';
                  const isCompleted = b.status === 'completed';

                  const pct = isDynamic
                    ? evalResult.lessonProgressPct
                    : isCompleted
                    ? 100
                    : enr?.progressPercentage ?? 50;

                  return (
                    <View
                      key={b.id}
                      style={[
                        styles.bentoSpan2,
                        styles.bentoCard3D,
                        styles.cohortCard3D,
                        {
                          backgroundColor: cardBg,
                          borderColor: isSelected ? '#4F46E5' : '#E2E8F0',
                          borderBottomColor: isSelected ? '#312E81' : '#CBD5E1',
                        },
                      ]}>
                      <View style={styles.cohortCardTopRow}>
                        <View style={styles.cohortCodeAndStatus}>
                          <View style={styles.cohortCodeTag3D}>
                            <Text style={styles.cohortCodeTagText}>{b.classCode}</Text>
                          </View>
                          {isDynamic && (
                            <View style={[styles.statusPill3D, { backgroundColor: '#EEF2FF', borderColor: '#C7D2FE' }]}>
                              <Ionicons name="sparkles" size={12} color="#4F46E5" />
                              <Text style={[styles.statusPillText, { color: '#4F46E5' }]}>
                                {t.dashboard.cohortActive}
                              </Text>
                            </View>
                          )}
                          {isCompleted && (
                            <View style={[styles.statusPill3D, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
                              <Ionicons name="ribbon" size={12} color="#10B981" />
                              <Text style={[styles.statusPillText, { color: '#10B981' }]}>
                                {t.dashboard.cohortGraduated}
                              </Text>
                            </View>
                          )}
                        </View>

                        {isSelected && (
                          <View style={styles.selectedBadgePill3D}>
                            <Text style={styles.selectedBadgeText}>{t.dashboard.cohortSelected}</Text>
                          </View>
                        )}
                      </View>

                      <Text style={[styles.cohortCourseTitle, { color: textPrimary }]}>
                        {c?.title || b.batchName}
                      </Text>
                      <Text style={[styles.cohortBatchName, { color: textSecondary }]}>
                        {b.batchName}
                      </Text>

                      {/* Mini Progress Track */}
                      <View style={styles.cohortProgressInfoRow}>
                        <Text style={[styles.cohortProgressLabel, { color: textSecondary }]}>
                          {t.dashboard.curriculumProgress}
                        </Text>
                        <Text style={styles.cohortProgressVal}>{pct}%</Text>
                      </View>
                      <View style={styles.progressBarMiniTrack3D}>
                        <View
                          style={[
                            styles.progressBarMiniFill3D,
                            {
                              width: `${Math.max(pct, 4)}%`,
                              backgroundColor: isCompleted ? '#10B981' : '#4F46E5',
                              borderBottomColor: isCompleted ? '#047857' : '#312E81',
                            },
                          ]}
                        />
                      </View>

                      {/* Card Footer */}
                      <View style={styles.cohortCardFooter}>
                        <View style={styles.cohortMentorRow}>
                          <Ionicons name="person-circle" size={16} color={textSecondary} />
                          <Text style={[styles.cohortMentorName, { color: textSecondary }]} numberOfLines={1}>
                            {b.instructorName}
                          </Text>
                        </View>

                        <TouchableOpacity
                          onPress={() => {
                            selectBatch(b.id);
                            router.push('/(tabs)/syllabus');
                          }}
                          activeOpacity={0.8}
                          style={[
                            styles.tactileBtnSmall,
                            isSelected ? styles.tactileBtnSmallPrimary : styles.tactileBtnSmallSecondary,
                          ]}>
                          <Text
                            style={[
                              styles.tactileBtnSmallText,
                              { color: isSelected ? '#FFFFFF' : '#4F46E5' },
                            ]}>
                            {t.dashboard.viewSyllabus}
                          </Text>
                          <Ionicons
                            name="chevron-forward"
                            size={14}
                            color={isSelected ? '#FFFFFF' : '#4F46E5'}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })
              )}

              {/* GABUNG KELAS BUTTON (SPAN 2, TACTILE DASHED 3D) */}
              <TouchableOpacity
                onPress={() => setShowJoinModal(true)}
                activeOpacity={0.8}
                style={[
                  styles.bentoSpan2,
                  styles.tactileDashedActionBtn,
                  { backgroundColor: cardBg },
                ]}>
                <View style={styles.tactileActionIconBox}>
                  <Ionicons name="add-circle" size={24} color="#4F46E5" />
                </View>
                <View style={styles.tactileActionTextCol}>
                  <Text style={styles.tactileActionTitle}>{t.dashboard.joinNewClassTitle}</Text>
                  <Text style={[styles.tactileActionSubtitle, { color: textSecondary }]}>
                    {t.dashboard.joinNewClassSubtitle}
                  </Text>
                </View>
                <Ionicons name="chevron-forward-circle" size={22} color="#4F46E5" />
              </TouchableOpacity>
            </>
          ) : (
            /* ============================================================== */
            /* TEACHER SPECIFIC VIEW */
            /* ============================================================== */
            <>
              {/* METRIC 1 (SPAN 1): TOTAL SISWA */}
              <View
                style={[
                  styles.bentoSpan1,
                  styles.bentoWidget3D,
                  { backgroundColor: cardBg },
                ]}>
                <View style={styles.widgetTopRow}>
                  <View style={[styles.widgetIconSquare, { backgroundColor: '#EDE9FE', borderColor: '#DDD6FE' }]}>
                    <Ionicons name="people" size={18} color="#8B5CF6" />
                  </View>
                  <Text style={[styles.widgetCategoryLabel, { color: textSecondary }]}>{t.dashboard.metricStudents}</Text>
                </View>
                <View style={styles.widgetBottomCol}>
                  <Text style={[styles.widgetBigValue, { color: '#8B5CF6' }]}>
                    {activeBatchEnrolledCount}/{activeBatch.maxStudents}
                  </Text>
                  <Text style={[styles.widgetDescText, { color: textSecondary }]}>
                    {t.dashboard.metricRegisteredStudents}
                  </Text>
                </View>
              </View>

              {/* METRIC 2 (SPAN 1): ANTREAN TUGAS */}
              <View
                style={[
                  styles.bentoSpan1,
                  styles.bentoWidget3D,
                  { backgroundColor: cardBg },
                ]}>
                <View style={styles.widgetTopRow}>
                  <View
                    style={[
                      styles.widgetIconSquare,
                      {
                        backgroundColor:
                          pendingSubmissions.length > 0 ? '#FEE2E2' : '#D1FAE5',
                        borderColor:
                          pendingSubmissions.length > 0 ? '#FECACA' : '#A7F3D0',
                      },
                    ]}>
                    <Ionicons
                      name="clipboard"
                      size={18}
                      color={pendingSubmissions.length > 0 ? '#EF4444' : '#10B981'}
                    />
                  </View>
                  <Text style={[styles.widgetCategoryLabel, { color: textSecondary }]}>{t.dashboard.metricQueue}</Text>
                </View>
                <View style={styles.widgetBottomCol}>
                  <Text
                    style={[
                      styles.widgetBigValue,
                      { color: pendingSubmissions.length > 0 ? '#EF4444' : '#10B981' },
                    ]}>
                    {pendingSubmissions.length}
                  </Text>
                  <Text style={[styles.widgetDescText, { color: textSecondary }]}>
                    {t.dashboard.metricNeedsGrading}
                  </Text>
                </View>
              </View>

              {/* METRIC 3 (SPAN 1): RATA-RATA TUGAS */}
              <View
                style={[
                  styles.bentoSpan1,
                  styles.bentoWidget3D,
                  { backgroundColor: cardBg },
                ]}>
                <View style={styles.widgetTopRow}>
                  <View style={[styles.widgetIconSquare, { backgroundColor: '#E0F2FE', borderColor: '#BAE6FD' }]}>
                    <Ionicons name="analytics" size={18} color="#0284C7" />
                  </View>
                  <Text style={[styles.widgetCategoryLabel, { color: textSecondary }]}>{t.dashboard.metricAverage}</Text>
                </View>
                <View style={styles.widgetBottomCol}>
                  <Text style={[styles.widgetBigValue, { color: '#0284C7' }]}>
                    {activeBatchAverageGrade > 0 ? activeBatchAverageGrade : '-'}
                  </Text>
                  <Text style={[styles.widgetDescText, { color: textSecondary }]}>
                    {t.dashboard.metricClassAverage}
                  </Text>
                </View>
              </View>

              {/* METRIC 4 (SPAN 1): KELOLA KELAS SHORTCUT */}
              <TouchableOpacity
                onPress={() => router.push('/class-manager' as any)}
                activeOpacity={0.8}
                style={[
                  styles.bentoSpan1,
                  styles.bentoWidget3D,
                  { backgroundColor: cardBg },
                ]}>
                <View style={styles.widgetTopRow}>
                  <View style={[styles.widgetIconSquare, { backgroundColor: '#EDE9FE', borderColor: '#DDD6FE' }]}>
                    <Ionicons name="settings" size={18} color="#8B5CF6" />
                  </View>
                  <Ionicons name="arrow-forward" size={16} color="#8B5CF6" />
                </View>
                <View style={styles.widgetBottomCol}>
                  <Text style={[styles.widgetBigValue, { fontSize: 16, color: '#8B5CF6' }]}>
                    {t.dashboard.manageClassesShortcut}
                  </Text>
                  <Text style={[styles.widgetDescText, { color: textSecondary }]}>
                    {t.dashboard.manageClassesDesc}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* PRIMARY TEACHER HERO ACTION (SPAN 2, TACTILE PURPLE) */}
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/grading')}
                activeOpacity={0.8}
                style={[styles.bentoSpan2, styles.tactileBtnPurple]}>
                <View style={styles.tactileBtnInnerRow}>
                  <Ionicons name="clipboard" size={20} color="#FFFFFF" />
                  <Text style={styles.tactileBtnPurpleText}>
                    {t.dashboard.openGradingPanelBtn} ({pendingSubmissions.length} {t.dashboard.pendingReviewsCount})
                  </Text>
                </View>
                <Ionicons name="arrow-forward-circle" size={22} color="#FFFFFF" />
              </TouchableOpacity>

              {/* BUAT PENGUMUMAN FORM (SPAN 2, 3D CARD) */}
              <View
                style={[
                  styles.bentoSpan2,
                  styles.bentoCard3D,
                  { backgroundColor: cardBg },
                ]}>
                <View style={styles.cardHeaderRow}>
                  <View style={styles.cardHeaderLeft}>
                    <View style={[styles.headerIconBox, { backgroundColor: '#EDE9FE', borderColor: '#DDD6FE' }]}>
                      <Ionicons name="megaphone" size={16} color="#8B5CF6" />
                    </View>
                    <Text style={[styles.cardHeaderTitle, { color: textPrimary }]}>
                      {t.dashboard.createAnnouncementTitle}
                    </Text>
                  </View>
                </View>

                <TextInput
                  placeholder={t.dashboard.announcementTitlePlaceholder}
                  placeholderTextColor="#94A3B8"
                  value={annTitle}
                  onChangeText={setAnnTitle}
                  style={[
                    styles.tactileInput3D,
                    { backgroundColor: inputBg, color: textPrimary },
                  ]}
                />

                <TextInput
                  placeholder={t.dashboard.announcementMsgPlaceholder}
                  placeholderTextColor="#94A3B8"
                  value={annMessage}
                  onChangeText={setAnnMessage}
                  multiline
                  numberOfLines={3}
                  style={[
                    styles.tactileInput3D,
                    styles.tactileTextArea3D,
                    { backgroundColor: inputBg, color: textPrimary },
                  ]}
                />

                <TouchableOpacity
                  onPress={handlePostAnnouncement}
                  activeOpacity={0.8}
                  style={styles.tactileBtnPurpleMedium}>
                  <Ionicons name="send" size={16} color="#FFFFFF" />
                  <Text style={styles.tactileBtnPurpleMediumText}>{t.dashboard.postAnnouncementBtn}</Text>
                </TouchableOpacity>
              </View>

              {/* BUAT KELAS & COURSE BARU (SPAN 2, TACTILE DASHED 3D) */}
              <TouchableOpacity
                onPress={() => router.push('/class-manager' as any)}
                activeOpacity={0.8}
                style={[
                  styles.bentoSpan2,
                  styles.tactileDashedActionBtn,
                  { backgroundColor: cardBg, borderColor: '#8B5CF6', borderBottomColor: '#6D28D9' },
                ]}>
                <View style={[styles.tactileActionIconBox, { backgroundColor: '#EDE9FE' }]}>
                  <Ionicons name="add-circle" size={24} color="#8B5CF6" />
                </View>
                <View style={styles.tactileActionTextCol}>
                  <Text style={[styles.tactileActionTitle, { color: '#8B5CF6' }]}>
                    {t.dashboard.createNewCourseClassTitle}
                  </Text>
                  <Text style={[styles.tactileActionSubtitle, { color: textSecondary }]}>
                    {t.dashboard.createNewCourseClassSubtitle}
                  </Text>
                </View>
                <Ionicons name="chevron-forward-circle" size={22} color="#8B5CF6" />
              </TouchableOpacity>
            </>
          )}

          {/* ============================================================== */}
          {/* SECTION HEADER (SPAN 2): ANNOUNCEMENTS STREAM */}
          {/* ============================================================== */}
          <View style={[styles.bentoSpan2, styles.gamifiedSectionHeader]}>
            <Text style={[styles.gamifiedSectionTitle, { color: textPrimary }]}>
              {t.dashboard.streamTitle}
            </Text>
            <Text style={[styles.gamifiedSectionSubtitle, { color: textSecondary }]}>
              {t.dashboard.streamSubtitle}
            </Text>
          </View>

          {announcements.map((ann) => (
            <View
              key={ann.id}
              style={[
                styles.bentoSpan2,
                styles.bentoCard3D,
                styles.announcementCard3D,
                { backgroundColor: cardBg },
              ]}>
              <View style={styles.annHeaderRow}>
                <View style={styles.annAuthorRow}>
                  <View style={styles.annAvatarCircle}>
                    <Ionicons name="person" size={13} color="#8B5CF6" />
                  </View>
                  <Text style={[styles.annAuthorNameText, { color: textPrimary }]}>{ann.authorName}</Text>
                </View>
                <Text style={styles.annDateBadge}>
                  {new Date(ann.createdAt).toLocaleDateString(language === 'en' ? 'en-US' : 'id-ID', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </Text>
              </View>
              <Text style={[styles.annTitleText, { color: textPrimary }]}>{ann.title}</Text>
              <Text style={[styles.annBodyText, { color: textSecondary }]}>{ann.message}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* ============================================================== */}
      {/* JOIN CLASS MODAL */}
      {/* ============================================================== */}
      <Modal
        visible={showJoinModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowJoinModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard3D, { backgroundColor: cardBg }]}>
            <View style={styles.modalHeaderRow}>
              <Text style={[styles.modalTitleText, { color: textPrimary }]}>
                {t.dashboard.joinModalTitle}
              </Text>
              <TouchableOpacity onPress={() => setShowJoinModal(false)}>
                <Ionicons name="close-circle" size={28} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalDescText, { color: textSecondary }]}>
              {t.dashboard.joinModalDesc}
            </Text>

            {joinError !== '' && (
              <View style={styles.modalErrorBox3D}>
                <Ionicons name="alert-circle" size={16} color="#DC2626" />
                <Text style={styles.modalErrorMsg}>{joinError}</Text>
              </View>
            )}

            <TextInput
              placeholder="e.g. ABC-123"
              placeholderTextColor="#94A3B8"
              value={joinCode}
              onChangeText={(txt) => {
                setJoinCode(txt.toUpperCase());
                setJoinError('');
              }}
              autoCapitalize="characters"
              style={[
                styles.modalInput3D,
                { backgroundColor: inputBg, color: textPrimary },
              ]}
            />

            <TouchableOpacity
              onPress={handleJoinClass}
              activeOpacity={0.8}
              style={styles.tactileBtnGreen}>
              <Ionicons name="enter" size={18} color="#FFFFFF" />
              <Text style={styles.tactileBtnGreenText}>{t.dashboard.joinModalBtn}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowJoinModal(false)}
              activeOpacity={0.7}
              style={styles.modalCancelBtn}>
              <Text style={[styles.modalCancelBtnText, { color: textSecondary }]}>{t.common.cancel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  /* ============================================================== */
  /* BENTO GRID 2-COLUMN LAYOUT */
  /* ============================================================== */
  bentoGrid: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    ...(Platform.OS === 'web' && {
      display: 'grid' as any,
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      gap: 12,
    }),
  },
  bentoSpan2: {
    width: '100%',
    ...(Platform.OS === 'web' && {
      gridColumn: 'span 2' as any,
    }),
  },
  bentoSpan1: {
    width: Platform.OS === 'web' ? 'auto' : '48%',
    flex: 1,
    minWidth: '45%',
    ...(Platform.OS === 'web' && {
      gridColumn: 'span 1' as any,
    }),
  },

  /* ============================================================== */
  /* HERO CARD / MISI UTAMA (SPAN 2): 3D TACTILE GRADIENT */
  /* ============================================================== */
  heroCard3D: {
    borderRadius: 26,
    padding: 20,
    backgroundColor: '#4F46E5',
    borderWidth: 2,
    borderColor: '#4338CA',
    borderBottomWidth: 6,
    borderBottomColor: '#312E81',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 6,
    ...(Platform.OS === 'web' && {
      backgroundImage: 'linear-gradient(135deg, #6366F1, #4F46E5)' as any,
    }),
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  heroBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  heroCodePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  heroCodePillCopied: {
    backgroundColor: '#10B981',
    borderColor: '#059669',
  },
  heroCodePillLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.75)',
  },
  heroCodePillValue: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  heroCourseTitle: {
    fontSize: 21,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.4,
  },
  heroBatchSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 14,
  },
  heroMentorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  heroMentorAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroMentorText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  heroMentorName: {
    fontWeight: '800',
    color: '#FFFFFF',
  },

  /* ============================================================== */
  /* BENTO CELL CARDS (TACTILE 3D LIP) */
  /* ============================================================== */
  bentoCard3D: {
    borderRadius: 24,
    padding: 18,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderBottomWidth: 5,
    borderBottomColor: '#CBD5E1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  bentoWidget3D: {
    borderRadius: 24,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderBottomWidth: 5,
    borderBottomColor: '#CBD5E1',
    minHeight: 120,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  widgetTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  widgetIconSquare: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  widgetCategoryLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  widgetBottomCol: {
    marginTop: 8,
  },
  widgetBigValue: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  widgetDescText: {
    fontSize: 11,
    fontWeight: '600',
  },

  /* ============================================================== */
  /* CHUNKY PROGRESS HERO */
  /* ============================================================== */
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  progressBadgePill: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  progressBadgeText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#4F46E5',
  },
  progressBarTrack3D: {
    height: 14,
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBarFill3D: {
    height: '100%',
    borderRadius: 10,
    borderBottomWidth: 3,
  },

  /* ============================================================== */
  /* TACTILE 3D BUTTONS (DUOLINGO STYLE) */
  /* ============================================================== */
  tactileBtnGreen: {
    backgroundColor: '#10B981',
    borderWidth: 1,
    borderColor: '#059669',
    borderBottomWidth: 5,
    borderBottomColor: '#047857',
    borderRadius: 16,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  tactileBtnGreenText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 0.2,
  },
  tactileBtnPurple: {
    backgroundColor: '#8B5CF6',
    borderWidth: 1,
    borderColor: '#7C3AED',
    borderBottomWidth: 5,
    borderBottomColor: '#6D28D9',
    borderRadius: 16,
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  tactileBtnInnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tactileBtnPurpleText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.2,
  },
  tactileBtnPurpleMedium: {
    backgroundColor: '#8B5CF6',
    borderWidth: 1,
    borderColor: '#7C3AED',
    borderBottomWidth: 4,
    borderBottomColor: '#6D28D9',
    borderRadius: 14,
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
  },
  tactileBtnPurpleMediumText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  tactileBtnSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    minHeight: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderBottomWidth: 3,
  },
  tactileBtnSmallPrimary: {
    backgroundColor: '#4F46E5',
    borderColor: '#4338CA',
    borderBottomColor: '#312E81',
  },
  tactileBtnSmallSecondary: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderBottomColor: '#CBD5E1',
  },
  tactileBtnSmallText: {
    fontSize: 12,
    fontWeight: '800',
  },

  /* ============================================================== */
  /* FORM INPUTS (TACTILE 3D) */
  /* ============================================================== */
  tactileInput3D: {
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderBottomWidth: 3,
    borderBottomColor: '#CBD5E1',
    borderRadius: 14,
    paddingHorizontal: 14,
    minHeight: 46,
    fontSize: 14,
    marginBottom: 10,
  },
  tactileTextArea3D: {
    minHeight: 75,
    paddingTop: 12,
    textAlignVertical: 'top',
  },

  /* ============================================================== */
  /* URGENT NOTIFICATION BANNER */
  /* ============================================================== */
  urgentBanner3D: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 22,
    borderWidth: 2,
    borderBottomWidth: 5,
    gap: 12,
  },
  urgentIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  urgentTitleText: {
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 2,
  },
  urgentMessageText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },

  /* ============================================================== */
  /* SECTION HEADERS */
  /* ============================================================== */
  gamifiedSectionHeader: {
    marginTop: 8,
    marginBottom: 4,
  },
  gamifiedSectionTitle: {
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  gamifiedSectionSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },

  /* ============================================================== */
  /* ENROLLED COHORTS CARDS */
  /* ============================================================== */
  cohortCard3D: {
    padding: 16,
  },
  cohortCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cohortCodeAndStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cohortCodeTag3D: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  cohortCodeTagText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#334155',
  },
  statusPill3D: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  selectedBadgePill3D: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#A5B4FC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  selectedBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#4F46E5',
  },
  cohortCourseTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  cohortBatchName: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 10,
  },
  cohortProgressInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cohortProgressLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  cohortProgressVal: {
    fontSize: 11,
    fontWeight: '900',
    color: '#4F46E5',
  },
  progressBarMiniTrack3D: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarMiniFill3D: {
    height: '100%',
    borderRadius: 6,
    borderBottomWidth: 2,
  },
  cohortCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  cohortMentorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
  },
  cohortMentorName: {
    fontSize: 12,
    fontWeight: '600',
  },

  /* ============================================================== */
  /* TACTILE ACTION BUTTONS (GABUNG & BUAT KELAS) */
  /* ============================================================== */
  tactileDashedActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#4F46E5',
    borderBottomWidth: 5,
    borderBottomColor: '#312E81',
    minHeight: 66,
  },
  tactileActionIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tactileActionTextCol: {
    flex: 1,
  },
  tactileActionTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#4F46E5',
    marginBottom: 2,
  },
  tactileActionSubtitle: {
    fontSize: 11,
    fontWeight: '500',
  },

  /* ============================================================== */
  /* ANNOUNCEMENTS STREAM (3D CARDS) */
  /* ============================================================== */
  announcementCard3D: {
    padding: 16,
    marginBottom: 6,
  },
  annHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  annAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  annAvatarCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  annAuthorNameText: {
    fontSize: 12,
    fontWeight: '800',
  },
  annDateBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  annTitleText: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  annBodyText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },

  /* ============================================================== */
  /* EMPTY ENROLLED STATE */
  /* ============================================================== */
  emptyEnrolledBox: {
    alignItems: 'center',
    padding: 24,
  },
  emptyIconCircle3D: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    borderWidth: 2,
    borderColor: '#C7D2FE',
    borderBottomWidth: 4,
    borderBottomColor: '#A5B4FC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyTitleText: {
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 4,
    textAlign: 'center',
  },
  emptySubtitleText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
    maxWidth: 280,
    fontWeight: '500',
  },

  /* ============================================================== */
  /* MODAL (3D TACTILE) */
  /* ============================================================== */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard3D: {
    borderRadius: 26,
    padding: 24,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderBottomWidth: 6,
    borderBottomColor: '#CBD5E1',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitleText: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  modalDescText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
    fontWeight: '500',
  },
  modalErrorBox3D: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
    borderWidth: 1.5,
    borderBottomWidth: 3,
    borderBottomColor: '#EF4444',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  modalErrorMsg: {
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '700',
    flex: 1,
  },
  modalInput3D: {
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderBottomWidth: 4,
    borderBottomColor: '#CBD5E1',
    borderRadius: 14,
    paddingHorizontal: 16,
    minHeight: 50,
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 16,
  },
  modalCancelBtn: {
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderBottomWidth: 3,
    borderBottomColor: '#CBD5E1',
    borderRadius: 14,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  modalCancelBtnText: {
    fontSize: 14,
    fontWeight: '800',
  },
});
