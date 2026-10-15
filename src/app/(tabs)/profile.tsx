import React, { useState } from 'react';
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
import { useRouter } from 'expo-router';
import { DemoHeader } from '@/components/DemoHeader';
import { useElearningStore } from '@/store/useElearningStore';
import { useAuthStore } from '@/store/useAuthStore';
import { calculateBatchEvaluation } from '@/utils/lockEngine';
import { useTranslation } from '@/i18n';
import { triggerMilestoneFeedback } from '@/utils/feedback';

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

  // Certificate name modal state
  const [showCertNameModal, setShowCertNameModal] = useState(false);
  const [certNameInput, setCertNameInput] = useState(
    currentUser.certificateName || currentUser.fullName
  );

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
      Alert.alert(
        '🎉 Congratulations! Official Credential Issued',
        `Credential ID: ${cert.certificateNumber}\nProgram: ${cert.courseTitle}\nFinal Score: ${cert.finalScore}/100\n+200 XP earned!\n\nYour certificate is now permanently active in your Portfolio!`
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

            <View style={styles.certNameValueBox}>
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
                style={styles.editCertNameBtn}>
                <Ionicons name="create-outline" size={15} color="#2563EB" />
                <Text style={styles.editCertNameBtnText}>
                  Edit Legal Name
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.certNameNoticeRow}>
              <Ionicons name="information-circle-outline" size={14} color="#64748B" />
              <Text style={styles.certNameNoticeText}>
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
                Buka Panel Manajemen Kelas & Siswa
              </Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ) : (
          /* LEARNER VIEW: MULTI-CERTIFICATE GALLERY & WEIGHTED GRADUATION EVALUATOR */
          <>
            {/* SECTION 1: MULTI-CERTIFICATE CREDENTIALS GALLERY */}
            <View
              style={[
                styles.galleryCard,
                {
                  backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                  borderColor: isDark ? '#334155' : '#E2E8F0',
                  borderBottomColor: isDark ? '#0F172A' : '#CBD5E1',
                },
              ]}>
              <View style={styles.galleryHeader}>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.galleryTitle,
                      { color: isDark ? '#F8FAFC' : '#0F172A' },
                    ]}>
                    🏅 Portofolio Sertifikat Digital ({userCertificates.length})
                  </Text>
                  <Text style={styles.gallerySubtitle}>
                    Koleksi sertifikat resmi terakreditasi milik Anda
                  </Text>
                </View>
                <View style={styles.certCountBadge}>
                  <Ionicons name="ribbon" size={14} color="#D97706" />
                  <Text style={styles.certCountBadgeText}>{userCertificates.length} Sah</Text>
                </View>
              </View>

              {/* Certificate Selector Pills if multi-certificate */}
              {userCertificates.length > 1 && (
                <View style={styles.certSelectorRow}>
                  <Text style={[styles.certSelectorLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                    PILIH SERTIFIKAT UNTUK DITAMPILKAN:
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.certPillsScroll}>
                    {userCertificates.map((cert) => {
                      const isSelected = cert.id === certToDisplay?.id;
                      return (
                        <TouchableOpacity
                          key={cert.id}
                          onPress={() => setSelectedCertId(cert.id)}
                          style={[
                            styles.certChip,
                            {
                              backgroundColor: isSelected
                                ? '#FEF3C7'
                                : isDark
                                ? '#0F172A'
                                : '#F8FAFC',
                              borderColor: isSelected
                                ? '#D97706'
                                : isDark
                                ? '#334155'
                                : '#E2E8F0',
                              borderBottomColor: isSelected
                                ? '#B45309'
                                : isDark
                                ? '#0B0F19'
                                : '#CBD5E1',
                            },
                          ]}>
                          <Ionicons
                            name="shield-checkmark"
                            size={14}
                            color={isSelected ? '#D97706' : '#94A3B8'}
                          />
                          <Text
                            numberOfLines={1}
                            style={[
                              styles.certChipTitle,
                              {
                                color: isSelected
                                    ? '#92400E'
                                    : isDark
                                    ? '#F8FAFC'
                                    : '#0F172A',
                                fontWeight: isSelected ? '800' : '600',
                              },
                            ]}>
                            {cert.courseTitle}
                          </Text>
                          <View style={styles.certChipScore}>
                            <Text style={styles.certChipScoreText}>
                              {cert.finalScore}/100
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}

              {/* EMPTY PORTFOLIO OR ACTIVE DIPLOMA CERTIFICATE CARD */}
              {userCertificates.length === 0 ? (
                <View style={styles.emptyCertPortfolio}>
                  <View style={styles.emptyCertIconCircle}>
                    <Ionicons name="ribbon-outline" size={36} color="#D97706" />
                  </View>
                  <Text
                    style={[
                      styles.emptyCertTitle,
                      { color: isDark ? '#F8FAFC' : '#0F172A' },
                    ]}>
                    Belum Memiliki Sertifikat Resmi
                  </Text>
                  <Text style={styles.emptyCertDesc}>
                    Selesaikan seluruh materi (100%), lulus kuis evaluasi, dan tuntaskan tugas proyek pada kelas Anda untuk menerbitkan sertifikat digital resmi.
                  </Text>
                </View>
              ) : certToDisplay ? (
                <View style={styles.certificateCard}>
                  <View style={styles.certInnerBorder}>
                    <View style={styles.certHeader}>
                      <Ionicons name="ribbon" size={32} color="#D97706" />
                      <Text style={styles.certTitle}>CERTIFICATE OF COMPLETION</Text>
                      <Text style={styles.certNumber}>
                        {certToDisplay.certificateNumber}
                      </Text>
                    </View>

                    <Text style={styles.certLead}>
                      This is to officially certify that:
                    </Text>
                    <Text style={styles.certStudentName}>
                      {certToDisplay.studentName}
                    </Text>

                    <Text style={styles.certBody}>
                      has successfully completed all required modules, assessments, and project deliverables for the accredited program:
                    </Text>
                    <Text style={styles.certCourseName}>
                      {certToDisplay.courseTitle}
                    </Text>
                    <Text style={styles.certBatchName}>
                      {certToDisplay.batchName}
                    </Text>

                    <View style={styles.certFooter}>
                      <View style={styles.certScoreBox}>
                        <Text style={styles.certScoreLabel}>
                          FINAL SCORE
                        </Text>
                        <Text style={styles.certScoreValue}>
                          {certToDisplay.finalScore} / 100
                        </Text>
                      </View>

                      <View style={styles.certSignBox}>
                        <Text style={styles.certSignName}>
                          {certToDisplay.instructorName}
                        </Text>
                        <Text style={styles.certSignTitle}>
                          Lead Instructor & Academic Mentor
                        </Text>
                      </View>
                    </View>

                    {/* Certificate Action Buttons */}
                    <View style={styles.certActionRow}>
                      <TouchableOpacity
                        onPress={() =>
                          Alert.alert(
                            'Credential ID',
                            `Certificate ID: ${certToDisplay.certificateNumber}\n\nID copied for your professional portfolio verification.`
                          )
                        }
                        style={styles.certActionBtn}>
                        <Ionicons name="copy-outline" size={14} color="#D97706" />
                        <Text style={styles.certActionBtnText}>
                          Copy Credential ID
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() =>
                          Alert.alert(
                            'Credential Status',
                            `✅ Credential ${certToDisplay.certificateNumber} is OFFICIALLY VERIFIED on the EduFlow ledger & aligned with Wadhwani Cohort standards.`
                          )
                        }
                        style={[styles.certActionBtn, { backgroundColor: '#DCFCE7', borderColor: '#86EFAC' }]}>
                        <Ionicons name="checkmark-done" size={14} color="#15803D" />
                        <Text style={[styles.certActionBtnText, { color: '#15803D' }]}>
                          Verified Official
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => {
                          if (typeof window !== 'undefined' && window.print) {
                            window.print();
                          } else {
                            Alert.alert(
                              'Print Certificate',
                              `Certificate ${certToDisplay.certificateNumber} ready for printing.`
                            );
                          }
                        }}
                        style={[styles.certActionBtn, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
                        <Ionicons name="print-outline" size={14} color="#2563EB" />
                        <Text style={[styles.certActionBtnText, { color: '#2563EB' }]}>
                          Print / Save PDF
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ) : null}
            </View>

            {/* SECTION 2: WEIGHTED GRADUATION EVALUATION PER COHORT */}
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
                <Text style={styles.finalScoreBadge}>
                  Score: {evalResult.finalScore}/100
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
                <View style={styles.alreadyCertifiedBox}>
                  <Ionicons name="checkmark-circle" size={20} color="#15803D" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.alreadyCertifiedTitle}>
                      Cohort Officially Certified!
                    </Text>
                    <Text style={styles.alreadyCertifiedDesc}>
                      Certificate #{existingCert.certificateNumber} for &quot;{existingCert.courseTitle}&quot; issued with composite score {existingCert.finalScore}/100.
                    </Text>
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
          </>
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
                { text: 'Reset', style: 'destructive', onPress: resetDemoData },
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
                style={styles.promptCancelBtn}>
                <Text style={styles.promptCancelText}>Cancel</Text>
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
    padding: 18,
    borderRadius: 26,
    borderWidth: 2,
    borderBottomWidth: 6,
    marginBottom: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  userEmail: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 8,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  roleBadgeText: {
    fontSize: 11,
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
  },
  evalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  finalScoreBadge: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2563EB',
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
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  metricRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metricRowText: {
    fontSize: 13,
    fontWeight: '700',
  },
  metricRowValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2563EB',
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
  // CERTIFICATE STYLES
  certificateCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 20,
    padding: 10,
    borderWidth: 3,
    borderColor: '#D97706',
    borderBottomWidth: 6,
    borderBottomColor: '#B45309',
    marginBottom: 20,
    shadowColor: '#D97706',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  certInnerBorder: {
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  certHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  certTitle: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: '#92400E',
    marginTop: 6,
  },
  certNumber: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
    marginTop: 2,
  },
  certLead: {
    fontSize: 11,
    color: '#78350F',
    marginBottom: 4,
  },
  certStudentName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1E3A8A',
    marginBottom: 8,
  },
  certBody: {
    fontSize: 11,
    color: '#78350F',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 6,
  },
  certCourseName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  certBatchName: {
    fontSize: 11,
    color: '#2563EB',
    fontWeight: '700',
    marginBottom: 16,
  },
  certFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#FDE68A',
  },
  certScoreBox: {
    alignItems: 'flex-start',
  },
  certScoreLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#92400E',
  },
  certScoreValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#15803D',
  },
  certSignBox: {
    alignItems: 'flex-end',
  },
  certSignName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  certSignTitle: {
    fontSize: 9,
    color: '#64748B',
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
  galleryCard: {
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
  galleryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  galleryTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
  },
  gallerySubtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  certCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    borderBottomColor: '#D97706',
    borderBottomWidth: 3,
  },
  certCountBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B45309',
  },
  certSelectorRow: {
    marginBottom: 14,
  },
  certSelectorLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  certPillsScroll: {
    gap: 8,
  },
  certChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1.5,
    borderBottomWidth: 3.5,
    maxWidth: 240,
    minHeight: 40,
  },
  certChipTitle: {
    fontSize: 12,
    maxWidth: 140,
  },
  certChipScore: {
    backgroundColor: 'rgba(217, 119, 6, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  certChipScoreText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
  },
  certActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 14,
    width: '100%',
  },
  certActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderBottomWidth: 3.5,
    borderColor: '#FDE68A',
    borderBottomColor: '#D97706',
    backgroundColor: '#FEF3C7',
    minHeight: 42,
  },
  certActionBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B45309',
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
  alreadyCertifiedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    padding: 14,
    borderRadius: 14,
    gap: 10,
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    borderBottomColor: '#4ADE80',
    borderBottomWidth: 3.5,
  },
  alreadyCertifiedTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#15803D',
    marginBottom: 2,
  },
  alreadyCertifiedDesc: {
    fontSize: 12,
    color: '#166534',
    lineHeight: 16,
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
  },
  certNameValueText: {
    fontSize: 14,
    fontWeight: '800',
    flex: 1,
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
  },
  editCertNameBtnText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '800',
  },
  // EMPTY CERTIFICATE PORTFOLIO
  emptyCertPortfolio: {
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFBEB',
    borderRadius: 20,
    borderWidth: 2,
    borderBottomWidth: 5,
    borderColor: '#FDE68A',
    borderBottomColor: '#F59E0B',
  },
  emptyCertIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
  },
  emptyCertTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyCertDesc: {
    fontSize: 12,
    color: '#92400E',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 290,
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

