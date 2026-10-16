import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { Alert } from '@/utils/alert';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useGlobalSearchParams } from 'expo-router';
import { DemoHeader } from '@/components/DemoHeader';
import { useElearningStore } from '@/store/useElearningStore';
import { useAuthStore } from '@/store/useAuthStore';
import { calculateBatchEvaluation } from '@/utils/lockEngine';
import { useTranslation } from '@/i18n';
import { triggerMilestoneFeedback } from '@/utils/feedback';
import { getCertificatePdfFilename, printCertificatePDF } from '@/utils/certificatePdf';
import { copyToClipboard } from '@/utils/clipboard';
import { DEMO_USERS } from '@/data/mockData';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const { t } = useTranslation();
  const { logout, registeredUsers, updateCertificateName: authUpdateCertName } =
    useAuthStore();

  const {
    currentUser,
    currentRole,
    batches,
    modules,
    lessons,
    completedLessonIds,
    quizAttempts,
    submissions,
    grades,
    certificates,
    enrollments,
    claimCertificate,
    updateCertificateName: storeUpdateCertName,
    resetDemoData,
    selectedBatchId,
  } = useElearningStore();

  const isTeacher = currentRole === 'teacher';

  const userCertificates = certificates.filter((c) => c.userId === currentUser.id);
  const [selectedCertId, setSelectedCertId] = useState<string>(
    userCertificates[0]?.id || ''
  );

  const userEnrollments = enrollments.filter((e) => e.userId === currentUser.id);
  const enrolledBatches = batches.filter((b) =>
    userEnrollments.some((e) => e.batchId === b.id)
  );
  const teacherBatches = batches.filter((b) => b.instructorId === currentUser.id);
  const availableBatches = isTeacher
    ? (teacherBatches.length > 0 ? teacherBatches : batches)
    : (enrolledBatches.length > 0 ? enrolledBatches : batches);

  const [evalBatchId, setEvalBatchId] = useState(
    selectedBatchId || availableBatches[0]?.id || batches[0].id
  );

  // Certificate modal state
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  // Certificate name modal state
  const [showCertNameModal, setShowCertNameModal] = useState(false);
  const [certNameInput, setCertNameInput] = useState(
    currentUser.certificateName || currentUser.fullName
  );

  const { section } = useGlobalSearchParams<{ section?: string }>();
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!section) return;
    const timer = setTimeout(() => {
      if (section === 'evaluator') {
        scrollRef.current?.scrollTo({ y: 240, animated: true });
        const node = (scrollRef.current as any)?.getScrollableNode?.();
        if (node && typeof node.scrollTo === 'function') {
          node.scrollTo({ top: 240, behavior: 'smooth' });
        }
      } else if (section === 'name') {
        scrollRef.current?.scrollTo({ y: 0, animated: true });
        const node = (scrollRef.current as any)?.getScrollableNode?.();
        if (node && typeof node.scrollTo === 'function') {
          node.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [section]);

  const handleSaveCertName = () => {
    if (!certNameInput.trim()) {
      Alert.alert(
        'Legal Name Required',
        'Please enter your official full name to appear on your graduation certificates.'
      );
      return;
    }
    storeUpdateCertName(certNameInput.trim());
    authUpdateCertName(currentUser.id, certNameInput.trim());
    setShowCertNameModal(false);
    Alert.alert(
      'Official Name Saved! 🎉',
      'This legal name will appear on all your verified digital credentials.'
    );
  };

  const activeBatch =
    availableBatches.find((b) => b.id === evalBatchId) ||
    availableBatches[0] ||
    batches[0];

  const batchMods = modules.filter((m) => m.courseId === activeBatch.courseId);
  const batchModIds = batchMods.map((m) => m.id);
  const batchLessons = lessons.filter((l) => batchModIds.includes(l.moduleId));
  const batchLessonIds = batchLessons.map((l) => l.id);

  const userQuizAttempts = quizAttempts.filter((q) => q.userId === currentUser.id);
  const userSubmissions = submissions.filter((s) => s.userId === currentUser.id);
  const userGrades = grades.filter((g) => {
    const s = submissions.find((sub) => sub.id === g.submissionId);
    return s ? s.userId === currentUser.id : false;
  });

  const evalResult = calculateBatchEvaluation(
    batchLessons.length,
    {
      completedLessonIds,
      quizAttempts: userQuizAttempts,
      submissions: userSubmissions,
      grades: userGrades,
    },
    batchLessonIds
  );

  const existingCert = userCertificates.find((c) => c.batchId === activeBatch.id);
  const batchEnrollments = enrollments.filter((e) => e.batchId === activeBatch.id);

  const certToDisplay =
    userCertificates.find((c) => c.id === selectedCertId) ||
    userCertificates[userCertificates.length - 1] ||
    userCertificates[0];

  const handleClaimCertificatePress = () => {
    if (!evalResult.canGraduate) {
      Alert.alert(
        'Graduation Requirements Incomplete',
        'Ensure all lessons are completed (100%), all quizzes passed (≥80%), and your project assignment is graded by the instructor with at least 75 points.'
      );
      return;
    }

    const cert = claimCertificate(activeBatch.id);
    if (cert) {
      triggerMilestoneFeedback();
      setSelectedCertId(cert.id);
      setShowCertificateModal(true);
      Alert.alert(
        '🎉 Congratulations! Official Credential Issued',
        `Credential ID: ${cert.certificateNumber}\nProgram: ${cert.courseTitle}\nFinal Score: ${cert.finalScore}/100\n+200 XP earned!\n\nYou can now view and print your official certificate.`
      );
    }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of your EduFlow account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView
      edges={['top']}
      style={[
        styles.safeArea,
        { backgroundColor: isDark ? '#0B0F19' : '#F4F6FA' },
      ]}>
      <DemoHeader />

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* User Identity Hero Card */}
        <View
          style={[
            styles.userCard,
            {
              backgroundColor: isTeacher ? '#7C3AED' : '#4F46E5',
              borderColor: isTeacher ? '#6D28D9' : '#4338CA',
              borderBottomColor: isTeacher ? '#5B21B6' : '#312E81',
            },
          ]}>
          <View
            style={[
              styles.avatarCircle,
              { backgroundColor: 'rgba(255, 255, 255, 0.22)' },
            ]}>
            <Ionicons
              name={isTeacher ? 'school' : 'person'}
              size={28}
              color="#FFFFFF"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.userName,
                { color: '#FFFFFF' },
              ]}>
              {currentUser.fullName}
            </Text>
            <Text style={styles.userEmail}>{currentUser.email}</Text>
            <View
              style={[
                styles.roleBadge,
                {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderColor: 'rgba(255, 255, 255, 0.35)',
                },
              ]}>
              <Text
                style={[
                  styles.roleBadgeText,
                  {
                    color: '#FFFFFF',
                  },
                ]}>
                {isTeacher
                  ? '👨‍🏫 Certified Cohort Instructor'
                  : '👨‍🎓 Active Cohort Learner'}
              </Text>
            </View>
          </View>
        </View>

        {/* STUDENT VIEW: OFFICIAL CERTIFICATE NAME CARD */}
        {!isTeacher && (
          <View
            style={[
              styles.certNameCard,
              {
                backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                borderColor: isDark ? '#334155' : '#E2E8F0',
                borderBottomColor: isDark ? '#0F172A' : '#CBD5E1',
              },
            ]}>
            <View style={styles.certNameHeader}>
              <View style={styles.certNameIconCircle}>
                <Ionicons name="ribbon" size={20} color="#2563EB" />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.certNameCardTitle,
                    { color: isDark ? '#F8FAFC' : '#0F172A' },
                  ]}>
                  {t.profile.officialNameTitle}
                </Text>
                <Text style={styles.certNameCardSubtitle}>
                  {t.profile.officialNameDesc}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.certNameValueBox,
                {
                  backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                  borderColor: isDark ? '#334155' : '#E2E8F0',
                },
              ]}>
              <Text
                style={[
                  styles.certNameValueText,
                  { color: isDark ? '#F8FAFC' : '#0F172A' },
                ]}>
                {currentUser.certificateName || currentUser.fullName}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setCertNameInput(
                    currentUser.certificateName || currentUser.fullName
                  );
                  setShowCertNameModal(true);
                }}
                style={[
                  styles.editCertNameBtn,
                  isDark && {
                    backgroundColor: '#1E293B',
                    borderColor: '#3B82F6',
                    borderBottomColor: '#1D4ED8',
                  },
                ]}>
                <Ionicons
                  name="create-outline"
                  size={15}
                  color={isDark ? '#60A5FA' : '#2563EB'}
                />
                <Text
                  style={[
                    styles.editCertNameBtnText,
                    isDark && { color: '#93C5FD' },
                  ]}>
                  Edit Legal Name
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.certNameNoticeRow}>
              <Ionicons
                name="information-circle-outline"
                size={14}
                color={isDark ? '#94A3B8' : '#64748B'}
              />
              <Text
                style={[
                  styles.certNameNoticeText,
                  { color: isDark ? '#94A3B8' : '#64748B' },
                ]}>
                Ensure name matches your government-issued ID. Name cannot be altered once credential is officially issued.
              </Text>
            </View>
          </View>
        )}

        {/* TEACHER VIEW: AUTHORITY PANEL (TEACHER DOES NOT RECEIVE CERTIFICATE) */}
        {isTeacher ? (
          <View
            style={[
              styles.teacherCard,
              {
                backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                borderColor: isDark ? '#334155' : '#E2E8F0',
                borderBottomColor: isDark ? '#0F172A' : '#CBD5E1',
              },
            ]}>
            <View style={styles.teacherHeader}>
              <Ionicons name="ribbon-outline" size={24} color="#8B5CF6" />
              <Text
                style={[
                  styles.teacherTitle,
                  { color: isDark ? '#F8FAFC' : '#0F172A' },
                ]}>
                Certificate Authority & Signatory Panel
              </Text>
            </View>

            <Text
              style={[
                styles.teacherNote,
                { color: isDark ? '#CBD5E1' : '#64748B' },
              ]}>
              As a certified Instructor/Mentor, you act as the official evaluator and signatory. Instructors oversee and endorse student graduation rather than receiving student certificates.
            </Text>

            {/* Batch Selector for Teacher Monitoring */}
            <View style={styles.cohortSelectorBox}>
              <Text style={styles.cohortSelectorLabel}>SELECT COHORT CLASS:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cohortPillsRow}>
                {batches.map((b) => {
                  const isSelected = b.id === activeBatch.id;
                  return (
                    <TouchableOpacity
                      key={b.id}
                      onPress={() => setEvalBatchId(b.id)}
                      style={[
                        styles.cohortPill,
                        {
                          backgroundColor: isSelected ? '#8B5CF6' : isDark ? '#0F172A' : '#F1F5F9',
                          borderColor: isSelected ? '#7C3AED' : isDark ? '#334155' : '#E2E8F0',
                          borderBottomColor: isSelected ? '#6D28D9' : isDark ? '#0B0F19' : '#CBD5E1',
                        },
                      ]}>
                      <Text
                        style={[
                          styles.cohortPillText,
                          { color: isSelected ? '#FFFFFF' : isDark ? '#CBD5E1' : '#475569' },
                        ]}>
                        {b.classCode}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <View
              style={[
                styles.studentMonitorBox,
                {
                  backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                  borderColor: isDark ? '#334155' : '#E2E8F0',
                  borderBottomColor: isDark ? '#0B0F19' : '#CBD5E1',
                },
              ]}>
              <Text
                style={[
                  styles.monitorTitle,
                  { color: isDark ? '#F8FAFC' : '#0F172A' },
                ]}>
                👥 Student Monitoring ({activeBatch.classCode}):
              </Text>

              {batchEnrollments.length === 0 ? (
                <View style={styles.emptyMonitoringBox}>
                  <Text
                    style={[
                      styles.emptyMonitoringText,
                      { color: isDark ? '#94A3B8' : '#64748B' },
                    ]}>
                    No students enrolled in this cohort yet. Share class code &quot;{activeBatch.classCode}&quot; with your students.
                  </Text>
                </View>
              ) : (
                batchEnrollments.map((enr) => {
                  const student = registeredUsers.find((u) => u.id === enr.userId);
                  const studentName = student?.fullName || enr.userId;
                  const isCertified = certificates.some(
                    (c) => c.batchId === activeBatch.id && c.userId === enr.userId
                  );

                  return (
                    <View key={enr.id} style={styles.studentItemRow}>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.studentItemName,
                            { color: isDark ? '#F8FAFC' : '#0F172A' },
                          ]}>
                          {studentName}
                        </Text>
                        <Text style={styles.studentItemMeta}>
                          Progress: {enr.progressPercentage}% • Status: {enr.graduationStatus}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.certBadge,
                          {
                            backgroundColor: isCertified ? '#DCFCE7' : '#FEF3C7',
                          },
                        ]}>
                        <Text
                          style={[
                            styles.certBadgeText,
                            {
                              color: isCertified ? '#15803D' : '#D97706',
                            },
                          ]}>
                          {isCertified ? 'Certified' : 'In Progress'}
                        </Text>
                      </View>
                    </View>
                  );
                })
              )}
            </View>

            <TouchableOpacity
              onPress={() => router.push('/class-manager' as any)}
              style={styles.teacherManageClassBtn}>
              <Ionicons name="settings-outline" size={18} color="#FFFFFF" />
              <Text style={styles.teacherManageClassBtnText}>
                Open Class & Student Management Panel
              </Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ) : (
          /* LEARNER VIEW: SINGLE-SOURCE GRADUATION EVALUATOR & CERTIFICATE CLAIM */
          <View
            style={[
              styles.evalCard,
              {
                backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                borderColor: isDark ? '#334155' : '#E2E8F0',
                borderBottomColor: isDark ? '#0F172A' : '#CBD5E1',
              },
            ]}>
            <View style={styles.evalHeader}>
              <Text
                style={[
                  styles.evalTitle,
                  { color: isDark ? '#F8FAFC' : '#0F172A' },
                ]}>
                🎓 Graduation Evaluator & Certificate Claim
              </Text>
              <Text
                style={[
                  styles.finalScoreBadge,
                  existingCert && { color: '#10B981' },
                ]}>
                Score: {existingCert ? existingCert.finalScore : evalResult.finalScore}/100
              </Text>
            </View>

            {/* Cohort Switcher for Evaluation */}
            <View style={styles.evalCohortSelector}>
              <Text style={[styles.evalCohortLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                SELECT COHORT TO EVALUATE:
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.evalCohortPills}>
                {availableBatches.map((b) => {
                  const isSelected = b.id === activeBatch.id;
                  const isDynamic = b.id === 'batch-edf-402';
                  const isCertExists = userCertificates.some((c) => c.batchId === b.id);

                  return (
                    <TouchableOpacity
                      key={b.id}
                      onPress={() => setEvalBatchId(b.id)}
                      style={[
                        styles.evalCohortPill,
                        {
                          backgroundColor: isSelected ? '#2563EB' : isDark ? '#0F172A' : '#F1F5F9',
                          borderColor: isSelected ? '#1D4ED8' : isDark ? '#334155' : '#E2E8F0',
                          borderBottomColor: isSelected ? '#1E40AF' : isDark ? '#0B0F19' : '#CBD5E1',
                        },
                      ]}>
                      <Text
                        style={[
                          styles.evalCohortPillText,
                          { color: isSelected ? '#FFFFFF' : isDark ? '#CBD5E1' : '#475569' },
                        ]}>
                        {b.classCode} {isDynamic ? '(Active)' : isCertExists ? '(Graduated)' : ''}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Status Notice if Already Certified */}
            {existingCert ? (
              <View
                style={[
                  styles.certifiedShowcaseCard,
                  {
                    backgroundColor: isDark ? '#022C22' : '#F0FDF4',
                    borderColor: '#10B981',
                    borderBottomColor: '#059669',
                  },
                ]}>
                <View style={styles.showcaseTopRow}>
                  <View style={styles.showcaseBadgeIcon}>
                    <Ionicons name="ribbon" size={24} color="#059669" />
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text
                      style={[
                        styles.showcaseTitle,
                        { color: isDark ? '#A7F3D0' : '#065F46' },
                      ]}>
                      Cohort Officially Certified! 🎓
                    </Text>
                    <Text
                      style={[
                        styles.showcaseSubtitle,
                        { color: isDark ? '#6EE7B7' : '#047857' },
                      ]}>
                      Accredited Certificate #{existingCert.certificateNumber}
                    </Text>
                  </View>
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark-done" size={13} color="#15803D" />
                    <Text style={styles.verifiedBadgeText}>Verified</Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.showcaseDetailsBox,
                    {
                      backgroundColor: isDark ? '#064E3B' : '#FFFFFF',
                      borderColor: isDark ? '#047857' : '#DCFCE7',
                    },
                  ]}>
                  <View style={styles.showcaseDetailCol}>
                    <Text style={styles.showcaseDetailLabel}>PROGRAM</Text>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.showcaseDetailVal,
                        { color: isDark ? '#F8FAFC' : '#0F172A' },
                      ]}>
                      {existingCert.courseTitle}
                    </Text>
                  </View>
                  <View style={styles.showcaseDetailCol}>
                    <Text style={styles.showcaseDetailLabel}>RECIPIENT</Text>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.showcaseDetailVal,
                        { color: isDark ? '#F8FAFC' : '#0F172A' },
                      ]}>
                      {existingCert.studentName}
                    </Text>
                  </View>
                  <View style={styles.showcaseDetailCol}>
                    <Text style={styles.showcaseDetailLabel}>COMPOSITE SCORE</Text>
                    <Text
                      style={[
                        styles.showcaseDetailVal,
                        { color: '#10B981', fontWeight: '900' },
                      ]}>
                      {existingCert.finalScore} / 100
                    </Text>
                  </View>
                </View>

                {/* Responsive Action Grid: 100% Mobile Optimized */}
                <View style={styles.showcaseActionGrid}>
                  <TouchableOpacity
                    onPress={() => setShowCertificateModal(true)}
                    style={[
                      styles.showcaseActionBtn,
                      {
                        backgroundColor: '#2563EB',
                        borderColor: '#1D4ED8',
                        borderBottomColor: '#1E40AF',
                      },
                    ]}>
                    <Ionicons name="eye-outline" size={16} color="#FFFFFF" />
                    <Text style={[styles.showcaseActionBtnText, { color: '#FFFFFF' }]}>
                      View Certificate
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => printCertificatePDF(existingCert)}
                    style={[
                      styles.showcaseActionBtn,
                      {
                        backgroundColor: '#10B981',
                        borderColor: '#059669',
                        borderBottomColor: '#047857',
                      },
                    ]}>
                    <Ionicons name="print-outline" size={16} color="#FFFFFF" />
                    <Text style={[styles.showcaseActionBtnText, { color: '#FFFFFF' }]}>
                      Print / Save PDF
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={async () => {
                      await copyToClipboard(existingCert.certificateNumber);
                      Alert.alert(
                        'Credential Copied',
                        `Certificate ID: ${existingCert.certificateNumber}\nClass: ${existingCert.batchName}\nRecipient: ${existingCert.studentName}\n\nID copied to clipboard for your portfolio verification.`
                      );
                    }}
                    style={[
                      styles.showcaseActionBtn,
                      {
                        backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                        borderColor: isDark ? '#334155' : '#E2E8F0',
                        borderBottomColor: isDark ? '#0B0F19' : '#CBD5E1',
                      },
                    ]}>
                    <Ionicons
                      name="copy-outline"
                      size={15}
                      color={isDark ? '#CBD5E1' : '#475569'}
                    />
                    <Text
                      style={[
                        styles.showcaseActionBtnText,
                        { color: isDark ? '#CBD5E1' : '#475569' },
                      ]}>
                      Copy ID
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                <Text style={styles.formulaDesc}>
                  {t.profile.weightedFormula}
                </Text>

                {/* Metric 1 */}
                <View style={styles.metricRow}>
                  <View style={styles.metricRowLeft}>
                    <Ionicons
                      name={
                        evalResult.completedLessons >= evalResult.totalLessons && evalResult.totalLessons > 0
                          ? 'checkmark-circle'
                          : 'ellipse-outline'
                      }
                      size={18}
                      color={
                        evalResult.completedLessons >= evalResult.totalLessons && evalResult.totalLessons > 0
                          ? '#10B981'
                          : '#94A3B8'
                      }
                    />
                    <Text
                      style={[
                        styles.metricRowText,
                        { color: isDark ? '#F8FAFC' : '#0F172A' },
                      ]}>
                      Curriculum Progress ({evalResult.completedLessons}/{evalResult.totalLessons} • 30% Weight)
                    </Text>
                  </View>
                  <Text style={styles.metricRowValue}>
                    {evalResult.lessonProgressPct}%
                  </Text>
                </View>
                {/* Metric 2 */}
                <View style={styles.metricRow}>
                  <View style={styles.metricRowLeft}>
                    <Ionicons
                      name={
                        evalResult.quizAvg >= 80
                          ? 'checkmark-circle'
                          : 'ellipse-outline'
                      }
                      size={18}
                      color={evalResult.quizAvg >= 80 ? '#10B981' : '#94A3B8'}
                    />
                    <Text
                      style={[
                        styles.metricRowText,
                        { color: isDark ? '#F8FAFC' : '#0F172A' },
                      ]}>
                      Quiz Assessment Average (30% Weight)
                    </Text>
                  </View>
                  <Text style={styles.metricRowValue}>{evalResult.quizAvg}%</Text>
                </View>

                {/* Metric 3 */}
                <View style={styles.metricRow}>
                  <View style={styles.metricRowLeft}>
                    <Ionicons
                      name={
                        evalResult.assignmentGrade >= 75
                          ? 'checkmark-circle'
                          : 'ellipse-outline'
                      }
                      size={18}
                      color={evalResult.assignmentGrade >= 75 ? '#10B981' : '#94A3B8'}
                    />
                    <Text
                      style={[
                        styles.metricRowText,
                        { color: isDark ? '#F8FAFC' : '#0F172A' },
                      ]}>
                      Instructor Project Score (40% Weight)
                    </Text>
                  </View>
                  <Text style={styles.metricRowValue}>
                    {evalResult.assignmentGrade > 0
                      ? `${evalResult.assignmentGrade}/100`
                      : 'Pending Review'}
                  </Text>
                </View>

                {/* Graduation Requirement Note */}
                <View
                  style={[
                    styles.statusNoteBox,
                    {
                      backgroundColor: evalResult.canGraduate
                        ? '#DCFCE7'
                        : isDark
                        ? '#0F172A'
                        : '#F1F5F9',
                    },
                  ]}>
                  <Ionicons
                    name={
                      evalResult.canGraduate
                        ? 'trophy'
                        : 'information-circle-outline'
                    }
                    size={18}
                    color={evalResult.canGraduate ? '#15803D' : '#64748B'}
                  />
                  <Text
                    style={[
                      styles.statusNoteText,
                      {
                        color: evalResult.canGraduate ? '#15803D' : '#64748B',
                      },
                    ]}>
                    {evalResult.canGraduate
                      ? 'All graduation criteria satisfied! You are eligible to claim your official credential.'
                      : 'Graduation standard: 100% lessons, all quizzes passed (≥80%), and project deliverable graded ≥75.'}
                  </Text>
                </View>

                {/* Claim Button */}
                <TouchableOpacity
                  onPress={handleClaimCertificatePress}
                  disabled={!evalResult.canGraduate}
                  style={[
                    styles.claimBtn,
                    {
                      backgroundColor: evalResult.canGraduate
                        ? '#10B981'
                        : '#94A3B8',
                      borderColor: evalResult.canGraduate
                        ? '#059669'
                        : '#64748B',
                      borderBottomColor: evalResult.canGraduate
                        ? '#047857'
                        : '#475569',
                      opacity: evalResult.canGraduate ? 1 : 0.6,
                    },
                  ]}>
                  <Ionicons name="ribbon-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.claimBtnText}>
                    {evalResult.canGraduate
                      ? 'Claim Official Certificate (+200 XP)'
                      : 'Certificate Locked'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={18} color="#DC2626" />
          <Text style={styles.logoutBtnText}>
            {t.common.logout}
          </Text>
        </TouchableOpacity>

        {/* Reset Demo Data Action */}
        <TouchableOpacity
          onPress={() => {
            Alert.alert(
              'Reset Demo Data',
              'Are you sure you want to reset all demo evaluation and progress data?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Reset',
                  style: 'destructive',
                  onPress: () => {
                    resetDemoData();
                    const defaultName = DEMO_USERS.learner.fullName;
                    authUpdateCertName('user-budi', defaultName);
                    logout();
                    router.replace('/login');
                  },
                },
              ]
            );
          }}
          style={[
            styles.resetContainerBtn,
            {
              backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
              borderColor: isDark ? '#334155' : '#E2E8F0',
              borderBottomColor: isDark ? '#0F172A' : '#CBD5E1',
            },
          ]}>
          <Ionicons name="refresh-circle-outline" size={18} color="#EF4444" />
          <Text style={styles.resetContainerText}>
            Reset All Demo Testing Data
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* MODAL: EDIT OFFICIAL CERTIFICATE NAME */}
      <Modal
        visible={showCertNameModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowCertNameModal(false)}>
        <View style={styles.promptModalOverlay}>
          <View
            style={[
              styles.promptModalCard,
              {
                backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                borderColor: isDark ? '#334155' : '#E2E8F0',
                borderBottomColor: isDark ? '#0F172A' : '#CBD5E1',
              },
            ]}>
            <View style={styles.promptModalHeader}>
              <Ionicons name="ribbon-outline" size={24} color="#2563EB" />
              <Text
                style={[
                  styles.promptModalTitle,
                  { color: isDark ? '#F8FAFC' : '#0F172A' },
                ]}>
                Official Certificate Name
              </Text>
            </View>

            <Text
              style={[
                styles.promptModalDesc,
                { color: isDark ? '#94A3B8' : '#64748B' },
              ]}>
              Enter your legal full name including any academic credentials. This will be printed permanently on your verified digital credentials.
            </Text>

            <TextInput
              value={certNameInput}
              onChangeText={setCertNameInput}
              placeholder="e.g. Alex Johnson, M.Sc"
              placeholderTextColor="#94A3B8"
              style={[
                styles.promptInput,
                {
                  backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                  color: isDark ? '#F8FAFC' : '#0F172A',
                  borderColor: isDark ? '#334155' : '#CBD5E1',
                },
              ]}
            />

            <View style={styles.promptBtnRow}>
              <TouchableOpacity
                onPress={() => setShowCertNameModal(false)}
                style={[
                  styles.promptCancelBtn,
                  isDark && {
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderBottomColor: '#1E293B',
                  },
                ]}>
                <Text
                  style={[
                    styles.promptCancelText,
                    isDark && { color: '#94A3B8' },
                  ]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSaveCertName}
                style={[
                  styles.promptSaveBtn,
                  {
                    backgroundColor: '#2563EB',
                    borderColor: '#1D4ED8',
                    borderBottomColor: '#1E40AF',
                  },
                ]}>
                <Text style={styles.promptSaveText}>Save Name</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL: VIEW ACCREDITED CERTIFICATE */}
      <Modal
        visible={showCertificateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCertificateModal(false)}>
        <SafeAreaView
          style={[
            styles.certModalContainer,
            { backgroundColor: isDark ? '#0F172A' : '#F1F5F9' },
          ]}>
          <View
            style={[
              styles.certModalHeader,
              {
                backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                borderBottomColor: isDark ? '#334155' : '#E2E8F0',
              },
            ]}>
            <TouchableOpacity
              onPress={() => setShowCertificateModal(false)}
              style={styles.certModalCloseBtn}>
              <Ionicons name="close" size={24} color={isDark ? '#F8FAFC' : '#0F172A'} />
            </TouchableOpacity>

            <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: 8 }}>
              <Text
                style={[
                  styles.certModalHeaderTitle,
                  { color: isDark ? '#F8FAFC' : '#0F172A' },
                ]}>
                Official Accredited Certificate
              </Text>
              {(existingCert || certToDisplay) && (
                <Text style={styles.certModalHeaderSub} numberOfLines={1}>
                  {getCertificatePdfFilename(
                    (existingCert || certToDisplay).batchName ||
                      (existingCert || certToDisplay).courseTitle,
                    (existingCert || certToDisplay).studentName
                  )}
                </Text>
              )}
            </View>

            {(existingCert || certToDisplay) && (
              <TouchableOpacity
                onPress={() => printCertificatePDF(existingCert || certToDisplay)}
                style={styles.certModalHeaderPrintBtn}>
                <Ionicons name="print-outline" size={18} color="#2563EB" />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView
            contentContainerStyle={styles.certModalScrollContent}
            showsVerticalScrollIndicator={false}>
            {(existingCert || certToDisplay) ? (
              <View style={styles.certModalFrame}>
                <View style={styles.certModalInnerBorder}>
                  <View style={styles.certModalBadgeCircle}>
                    <Ionicons name="ribbon" size={36} color="#D97706" />
                  </View>

                  <Text style={styles.certModalTitle}>CERTIFICATE OF COMPLETION</Text>
                  <Text style={styles.certModalNumber}>
                    CREDENTIAL #{(existingCert || certToDisplay).certificateNumber}
                  </Text>

                  <View style={styles.certModalDivider} />

                  <Text style={styles.certModalLead}>
                    This is to officially certify that
                  </Text>
                  <Text style={styles.certModalRecipient}>
                    {(existingCert || certToDisplay).studentName}
                  </Text>

                  <Text style={styles.certModalDesc}>
                    has successfully completed all required curriculum modules, rigorous assessments, and capstone project deliverables for the accredited collaborative learning program:
                  </Text>

                  <Text style={styles.certModalProgram}>
                    {(existingCert || certToDisplay).courseTitle}
                  </Text>
                  <Text style={styles.certModalCohort}>
                    {(existingCert || certToDisplay).batchName}
                  </Text>

                  <View style={styles.certModalFooter}>
                    <View style={styles.certModalScoreBox}>
                      <Text style={styles.certModalScoreLabel}>COMPOSITE SCORE</Text>
                      <Text style={styles.certModalScoreVal}>
                        {(existingCert || certToDisplay).finalScore} / 100
                      </Text>
                    </View>

                    <View style={styles.certModalSealBox}>
                      <Ionicons name="shield-checkmark" size={16} color="#059669" />
                      <Text style={styles.certModalSealText}>VERIFIED CREDENTIAL</Text>
                    </View>

                    <View style={styles.certModalSigBox}>
                      <Text style={styles.certModalSigName}>
                        {(existingCert || certToDisplay).instructorName}
                      </Text>
                      <Text style={styles.certModalSigTitle}>
                        Lead Instructor & Academic Mentor
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ) : null}
          </ScrollView>

          {/* Modal Action Bar */}
          {(existingCert || certToDisplay) && (
            <View
              style={[
                styles.certModalActionBar,
                {
                  backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                  borderTopColor: isDark ? '#334155' : '#E2E8F0',
                },
              ]}>
              <TouchableOpacity
                onPress={() => printCertificatePDF(existingCert || certToDisplay)}
                style={styles.certModalPrintActionBtn}>
                <Ionicons name="print-outline" size={18} color="#FFFFFF" />
                <Text style={styles.certModalPrintActionText}>
                  Print / Save PDF
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowCertificateModal(false)}
                style={[
                  styles.certModalCloseActionBtn,
                  {
                    backgroundColor: isDark ? '#0F172A' : '#F1F5F9',
                    borderColor: isDark ? '#334155' : '#CBD5E1',
                  },
                ]}>
                <Text
                  style={[
                    styles.certModalCloseActionText,
                    { color: isDark ? '#CBD5E1' : '#475569' },
                  ]}>
                  Close
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#F87171',
    borderBottomColor: '#DC2626',
    borderBottomWidth: 4,
    backgroundColor: '#FEF2F2',
    gap: 8,
    marginBottom: 12,
    minHeight: 48,
  },
  logoutBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#DC2626',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 22,
    borderWidth: 2,
    borderBottomWidth: 5,
    marginBottom: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    flexShrink: 0,
  },
  userName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  userEmail: {
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 6,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  roleBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  // TEACHER PANEL STYLES
  teacherCard: {
    padding: 18,
    borderRadius: 24,
    borderWidth: 2,
    borderBottomWidth: 5,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  teacherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  teacherTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  teacherNote: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  studentMonitorBox: {
    padding: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    borderBottomWidth: 4,
  },
  monitorTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 10,
  },
  studentItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    gap: 10,
  },
  studentItemName: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  studentItemMeta: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 2,
  },
  studentFinalScore: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  certBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  certBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  // LEARNER EVAL STYLES
  evalCard: {
    padding: 18,
    borderRadius: 24,
    borderWidth: 2,
    borderBottomWidth: 5,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  evalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    flexWrap: 'wrap',
    gap: 6,
  },
  evalTitle: {
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
    minWidth: 160,
  },
  finalScoreBadge: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2563EB',
    flexShrink: 0,
  },
  formulaDesc: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 14,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 8,
  },
  metricRowLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 8,
  },
  metricRowText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    flexWrap: 'wrap',
  },
  metricRowValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2563EB',
    flexShrink: 0,
  },
  statusNoteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 14,
    marginTop: 14,
    marginBottom: 14,
  },
  statusNoteText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  claimBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 16,
    borderWidth: 1.5,
    borderBottomWidth: 5,
    minHeight: 48,
    gap: 8,
  },
  claimBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  cohortSelectorBox: {
    marginBottom: 14,
  },
  cohortSelectorLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 6,
    letterSpacing: 0.8,
  },
  cohortPillsRow: {
    gap: 8,
  },
  cohortPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1.5,
    borderBottomWidth: 3.5,
    minHeight: 38,
    justifyContent: 'center',
  },
  cohortPillText: {
    fontSize: 12,
    fontWeight: '800',
  },
  evalCohortSelector: {
    marginBottom: 14,
  },
  evalCohortLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  evalCohortPills: {
    gap: 8,
  },
  evalCohortPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1.5,
    borderBottomWidth: 3.5,
    minHeight: 38,
    justifyContent: 'center',
  },
  evalCohortPillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  resetContainerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    borderBottomWidth: 4,
    gap: 8,
    minHeight: 48,
  },
  resetContainerText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#EF4444',
  },
  // CERTIFIED SHOWCASE CARD (NEW SINGLE SOURCE OF TRUTH)
  certifiedShowcaseCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 2,
    borderBottomWidth: 5,
    marginBottom: 8,
  },
  showcaseTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  showcaseBadgeIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#DCFCE7',
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  showcaseTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
  },
  showcaseSubtitle: {
    fontSize: 11,
    fontWeight: '700',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#86EFAC',
    flexShrink: 0,
  },
  verifiedBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
  },
  showcaseDetailsBox: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    marginBottom: 14,
    gap: 8,
    flexWrap: 'wrap',
  },
  showcaseDetailCol: {
    flex: 1,
    minWidth: 80,
  },
  showcaseDetailLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 3,
    textTransform: 'uppercase',
  },
  showcaseDetailVal: {
    fontSize: 12,
    fontWeight: '700',
  },
  showcaseActionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  showcaseActionBtn: {
    flex: 1,
    minWidth: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderBottomWidth: 4,
    minHeight: 44,
  },
  showcaseActionBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  // CERTIFICATE PREVIEW MODAL STYLES
  certModalContainer: {
    flex: 1,
  },
  certModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  certModalCloseBtn: {
    padding: 4,
  },
  certModalHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  certModalHeaderSub: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  certModalHeaderPrintBtn: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
  },
  certModalScrollContent: {
    padding: 16,
    paddingBottom: 24,
    alignItems: 'center',
  },
  certModalFrame: {
    width: '100%',
    maxWidth: 600,
    backgroundColor: '#FFFDF7',
    borderRadius: 22,
    padding: 14,
    borderWidth: 6,
    borderColor: '#D97706',
    borderBottomWidth: 8,
    borderBottomColor: '#B45309',
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  certModalInnerBorder: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#B45309',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  certModalBadgeCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEF3C7',
    borderWidth: 2,
    borderColor: '#D97706',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  certModalTitle: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
    color: '#92400E',
    textAlign: 'center',
  },
  certModalNumber: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706',
    letterSpacing: 0.8,
    marginTop: 2,
    marginBottom: 12,
  },
  certModalDivider: {
    width: 80,
    height: 2,
    backgroundColor: '#FDE68A',
    marginBottom: 12,
  },
  certModalLead: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#78350F',
    fontWeight: '700',
    marginBottom: 4,
  },
  certModalRecipient: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1E3A8A',
    textAlign: 'center',
    marginBottom: 12,
    textDecorationLine: 'underline',
    textDecorationColor: '#FBBF24',
  },
  certModalDesc: {
    fontSize: 11,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 10,
    maxWidth: 440,
  },
  certModalProgram: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  certModalCohort: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
    textAlign: 'center',
    marginBottom: 16,
  },
  certModalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    width: '100%',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    marginTop: 6,
    flexWrap: 'wrap',
    gap: 10,
  },
  certModalScoreBox: {
    alignItems: 'flex-start',
  },
  certModalScoreLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  certModalScoreVal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#10B981',
  },
  certModalSealBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  certModalSealText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669',
  },
  certModalSigBox: {
    alignItems: 'flex-end',
  },
  certModalSigName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#0F172A',
    paddingBottom: 2,
  },
  certModalSigTitle: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  certModalActionBar: {
    padding: 14,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 10,
  },
  certModalPrintActionBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    borderColor: '#1D4ED8',
    borderWidth: 1.5,
    borderBottomColor: '#1E40AF',
    borderBottomWidth: 4,
    borderRadius: 14,
    paddingVertical: 12,
    minHeight: 48,
  },
  certModalPrintActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  certModalCloseActionBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
    borderBottomWidth: 4,
    paddingVertical: 12,
    minHeight: 48,
  },
  certModalCloseActionText: {
    fontSize: 13,
    fontWeight: '800',
  },
  // OFFICIAL CERTIFICATE NAME CARD
  certNameCard: {
    padding: 18,
    borderRadius: 24,
    borderWidth: 2,
    borderBottomWidth: 5,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  certNameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  certNameIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  certNameCardTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  certNameCardSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 15,
  },
  certNameValueBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    flexWrap: 'wrap',
    gap: 8,
  },
  certNameValueText: {
    fontSize: 14,
    fontWeight: '800',
    flex: 1,
    minWidth: 120,
    marginRight: 8,
  },
  editCertNameBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    borderBottomColor: '#93C5FD',
    borderBottomWidth: 3.5,
    flexShrink: 0,
  },
  editCertNameBtnText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '800',
  },
  emptyMonitoringBox: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    alignItems: 'center',
  },
  emptyMonitoringText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  // PROMPT MODAL STYLES
  promptModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  promptModalCard: {
    width: '100%',
    maxWidth: 400,
    padding: 22,
    borderRadius: 24,
    borderWidth: 2,
    borderBottomWidth: 5,
  },
  promptModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  promptModalTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  promptModalDesc: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 14,
  },
  promptInput: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    fontSize: 14,
    marginBottom: 16,
  },
  promptBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  promptCancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderBottomColor: '#94A3B8',
    borderBottomWidth: 4,
    backgroundColor: '#F8FAFC',
  },
  promptCancelText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748B',
  },
  promptSaveBtn: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderBottomWidth: 4,
  },
  promptSaveText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  teacherManageClassBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#8B5CF6',
    borderColor: '#7C3AED',
    borderWidth: 1.5,
    borderBottomColor: '#6D28D9',
    borderBottomWidth: 5,
    borderRadius: 16,
    minHeight: 48,
    marginTop: 14,
  },
  teacherManageClassBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  certNameNoticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  certNameNoticeText: {
    fontSize: 11,
    color: '#64748B',
    flex: 1,
    lineHeight: 15,
  },
});

