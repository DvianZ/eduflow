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

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();

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
      Alert.alert('Form Belum Lengkap', 'Judul dan pesan pengumuman wajib diisi.');
      return;
    }
    createAnnouncement(activeBatch.id, annTitle.trim(), annMessage.trim());
    setAnnTitle('');
    setAnnMessage('');
    Alert.alert('Sukses', 'Pengumuman kelas berhasil diposting!');
  };

  const handleJoinClass = () => {
    setJoinError('');
    if (!joinCode.trim()) {
      setJoinError('Masukkan kode kelas.');
      return;
    }
    const result = joinBatchByCode(joinCode.trim(), currentUser.id);
    if (!result.success) {
      setJoinError(result.error || 'Gagal bergabung.');
      return;
    }
    setShowJoinModal(false);
    setJoinCode('');
    Alert.alert('Berhasil! 🎉', 'Anda telah bergabung ke kelas baru. Silakan cek silabus.');
  };

  // iOS Theme Tokens
  const pageBg = isDark ? '#000000' : '#F2F2F7';
  const cardBg = isDark ? '#1C1C1E' : '#FFFFFF';
  const secondaryCardBg = isDark ? '#2C2C2E' : '#FFFFFF';
  const cardBorder = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)';
  const textPrimary = isDark ? '#FFFFFF' : '#000000';
  const textSecondary = isDark ? 'rgba(235, 235, 245, 0.65)' : 'rgba(60, 60, 67, 0.65)';
  const inputBg = isDark ? '#2C2C2E' : '#F2F2F7';

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: pageBg }]}>
      <DemoHeader />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* iOS BENTO GRID CONTAINER */}
        <View style={styles.bentoGrid}>
          {/* ============================================================== */}
          {/* CELL 1 (SPAN 2): ACTIVE BATCH HERO CARD */}
          {/* ============================================================== */}
          <View
            style={[
              styles.bentoSpan2,
              styles.heroBatchCard,
              {
                backgroundColor: cardBg,
                borderColor: cardBorder,
              },
            ]}>
            <View style={styles.batchHeader}>
              <View
                style={[
                  styles.batchBadge,
                  {
                    backgroundColor:
                      activeBatch.id === 'batch-edf-402'
                        ? isDark
                          ? 'rgba(59, 130, 246, 0.2)'
                          : '#EBF5FF'
                        : activeBatch.status === 'completed'
                        ? isDark
                          ? 'rgba(16, 185, 129, 0.2)'
                          : '#ECFDF5'
                        : isDark
                        ? 'rgba(139, 92, 246, 0.2)'
                        : '#F5F3FF',
                  },
                ]}>
                <Ionicons
                  name={
                    activeBatch.status === 'completed'
                      ? 'trophy'
                      : activeBatch.id === 'batch-edf-402'
                      ? 'flash'
                      : 'school'
                  }
                  size={12}
                  color={
                    activeBatch.id === 'batch-edf-402'
                      ? '#2563EB'
                      : activeBatch.status === 'completed'
                      ? '#10B981'
                      : '#8B5CF6'
                  }
                />
                <Text
                  style={[
                    styles.batchBadgeText,
                    {
                      color:
                        activeBatch.id === 'batch-edf-402'
                          ? '#2563EB'
                          : activeBatch.status === 'completed'
                          ? '#10B981'
                          : '#8B5CF6',
                    },
                  ]}>
                  {activeBatch.id === 'batch-edf-402'
                    ? 'COHORT AKTIF'
                    : activeBatch.status === 'completed'
                    ? 'LULUS & TERSERTIFIKASI'
                    : 'KELAS AKTIF'}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => handleCopyCode(activeBatch.classCode)}
                activeOpacity={0.7}
                style={[
                  styles.codeBadge,
                  {
                    backgroundColor:
                      copiedCode === activeBatch.classCode
                        ? isDark
                          ? 'rgba(16, 185, 129, 0.25)'
                          : '#DCFCE7'
                        : isDark
                        ? '#2C2C2E'
                        : '#F2F2F7',
                  },
                ]}>
                <Ionicons
                  name={copiedCode === activeBatch.classCode ? 'checkmark' : 'copy-outline'}
                  size={13}
                  color={copiedCode === activeBatch.classCode ? '#10B981' : isTeacher ? '#8B5CF6' : '#007AFF'}
                />
                <Text style={styles.codeBadgeLabel}>Kode:</Text>
                <Text
                  style={[
                    styles.codeBadgeValue,
                    {
                      color:
                        copiedCode === activeBatch.classCode
                          ? '#10B981'
                          : isTeacher
                          ? '#8B5CF6'
                          : '#007AFF',
                    },
                  ]}>
                  {copiedCode === activeBatch.classCode ? 'Tersalin!' : activeBatch.classCode}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.batchTitle, { color: textPrimary }]}>
              {activeCourse?.title || activeBatch.batchName}
            </Text>
            <Text style={[styles.batchSubtitle, { color: textSecondary }]}>
              {activeBatch.batchName}
            </Text>

            <View style={styles.mentorRow}>
              <View style={[styles.mentorAvatarIcon, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
                <Ionicons name="person" size={14} color={isTeacher ? '#8B5CF6' : '#007AFF'} />
              </View>
              <Text style={[styles.mentorText, { color: textSecondary }]}>
                Mentor: <Text style={[styles.mentorName, { color: textPrimary }]}>{activeBatch.instructorName}</Text>
              </Text>
            </View>
          </View>

          {/* ============================================================== */}
          {/* LEARNER SPECIFIC VIEW */}
          {/* ============================================================== */}
          {!isTeacher ? (
            <>
              {/* CELL (SPAN 2): URGENT NOTIFICATION BANNER (IF ANY) */}
              {unreadAlertNotif && (
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => router.push('/(tabs)/grading')}
                  style={[
                    styles.bentoSpan2,
                    styles.urgentNotifBanner,
                    {
                      backgroundColor:
                        unreadAlertNotif.type === 'revision'
                          ? isDark
                            ? 'rgba(245, 158, 11, 0.15)'
                            : '#FFFBEB'
                          : isDark
                          ? 'rgba(16, 185, 129, 0.15)'
                          : '#ECFDF5',
                      borderColor:
                        unreadAlertNotif.type === 'revision' ? '#F59E0B' : '#10B981',
                    },
                  ]}>
                  <View
                    style={[
                      styles.urgentNotifIconBox,
                      {
                        backgroundColor:
                          unreadAlertNotif.type === 'revision' ? '#FEF3C7' : '#D1FAE5',
                      },
                    ]}>
                    <Ionicons
                      name={unreadAlertNotif.type === 'revision' ? 'alert-circle' : 'trophy'}
                      size={20}
                      color={unreadAlertNotif.type === 'revision' ? '#D97706' : '#059669'}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.urgentNotifTitle,
                        {
                          color:
                            unreadAlertNotif.type === 'revision' ? '#D97706' : '#059669',
                        },
                      ]}>
                      {unreadAlertNotif.title}
                    </Text>
                    <Text
                      style={[styles.urgentNotifMessage, { color: textSecondary }]}
                      numberOfLines={2}>
                      {unreadAlertNotif.message}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={unreadAlertNotif.type === 'revision' ? '#D97706' : '#059669'}
                  />
                </TouchableOpacity>
              )}

              {/* CELL (SPAN 2): LEARNER PROGRESS HERO */}
              <View
                style={[
                  styles.bentoSpan2,
                  styles.bentoCard,
                  {
                    backgroundColor: cardBg,
                    borderColor: cardBorder,
                  },
                ]}>
                <View style={styles.cardHeader}>
                  <View style={styles.bentoCardHeaderLeft}>
                    <View style={[styles.bentoHeaderIcon, { backgroundColor: isDark ? 'rgba(0,122,255,0.2)' : '#EBF5FF' }]}>
                      <Ionicons name="bar-chart" size={16} color="#007AFF" />
                    </View>
                    <Text style={[styles.cardTitle, { color: textPrimary }]}>
                      Progres Pembelajaran
                    </Text>
                  </View>
                  <Text style={styles.progressPctText}>{evalResult.lessonProgressPct}%</Text>
                </View>

                {/* Progress Bar Track */}
                <View style={[styles.progressBarTrack, { backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA' }]}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${evalResult.lessonProgressPct}%`,
                        backgroundColor: evalResult.lessonProgressPct === 100 ? '#34C759' : '#007AFF',
                      },
                    ]}
                  />
                </View>

                <TouchableOpacity
                  onPress={() => router.push('/(tabs)/syllabus')}
                  activeOpacity={0.8}
                  style={styles.primaryBtn}>
                  <Text style={styles.primaryBtnText}>Buka Silabus & Kurikulum</Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* CELL (SPAN 1): METRIC MATERI SELESAI */}
              <View
                style={[
                  styles.bentoSpan1,
                  styles.bentoWidget,
                  {
                    backgroundColor: secondaryCardBg,
                    borderColor: cardBorder,
                  },
                ]}>
                <View style={styles.widgetHeader}>
                  <View style={[styles.widgetIconBox, { backgroundColor: isDark ? 'rgba(0,122,255,0.2)' : '#EBF5FF' }]}>
                    <Ionicons name="book-outline" size={18} color="#007AFF" />
                  </View>
                  <Text style={[styles.widgetLabel, { color: textSecondary }]}>Materi</Text>
                </View>
                <View style={styles.widgetBody}>
                  <Text style={[styles.widgetValue, { color: textPrimary }]}>
                    {evalResult.completedLessons}/{evalResult.totalLessons}
                  </Text>
                  <Text style={[styles.widgetSubLabel, { color: textSecondary }]}>
                    Selesai Dipelajari
                  </Text>
                </View>
              </View>

              {/* CELL (SPAN 1): METRIC KUIS LULUS */}
              <View
                style={[
                  styles.bentoSpan1,
                  styles.bentoWidget,
                  {
                    backgroundColor: secondaryCardBg,
                    borderColor: cardBorder,
                  },
                ]}>
                <View style={styles.widgetHeader}>
                  <View style={[styles.widgetIconBox, { backgroundColor: isDark ? 'rgba(52,199,89,0.2)' : '#EAFBF0' }]}>
                    <Ionicons name="checkmark-done" size={18} color="#34C759" />
                  </View>
                  <Text style={[styles.widgetLabel, { color: textSecondary }]}>Kuis</Text>
                </View>
                <View style={styles.widgetBody}>
                  <Text style={[styles.widgetValue, { color: '#34C759' }]}>
                    {userQuizAttempts.filter((q) => q.isPassed).length}
                  </Text>
                  <Text style={[styles.widgetSubLabel, { color: textSecondary }]}>
                    Evaluasi Lulus
                  </Text>
                </View>
              </View>

              {/* CELL (SPAN 1): METRIC NILAI TUGAS */}
              <View
                style={[
                  styles.bentoSpan1,
                  styles.bentoWidget,
                  {
                    backgroundColor: secondaryCardBg,
                    borderColor: cardBorder,
                  },
                ]}>
                <View style={styles.widgetHeader}>
                  <View style={[styles.widgetIconBox, { backgroundColor: isDark ? 'rgba(255,149,0,0.2)' : '#FFF7EB' }]}>
                    <Ionicons name="document-text-outline" size={18} color="#FF9500" />
                  </View>
                  <Text style={[styles.widgetLabel, { color: textSecondary }]}>Tugas</Text>
                </View>
                <View style={styles.widgetBody}>
                  <Text style={[styles.widgetValue, { color: textPrimary }]}>
                    {userGrades.length > 0 ? `${userGrades[0].score}/100` : '-'}
                  </Text>
                  <Text style={[styles.widgetSubLabel, { color: textSecondary }]}>
                    {userGrades.length > 0 ? 'Sudah Dinilai' : 'Belum Ada Nilai'}
                  </Text>
                </View>
              </View>

              {/* CELL (SPAN 1): METRIC KELULUSAN */}
              <View
                style={[
                  styles.bentoSpan1,
                  styles.bentoWidget,
                  {
                    backgroundColor: secondaryCardBg,
                    borderColor: cardBorder,
                  },
                ]}>
                <View style={styles.widgetHeader}>
                  <View style={[styles.widgetIconBox, { backgroundColor: isDark ? 'rgba(175,82,222,0.2)' : '#F9F0FF' }]}>
                    <Ionicons name="ribbon-outline" size={18} color="#AF52DE" />
                  </View>
                  <Text style={[styles.widgetLabel, { color: textSecondary }]}>Status</Text>
                </View>
                <View style={styles.widgetBody}>
                  <Text
                    style={[
                      styles.widgetValue,
                      {
                        fontSize: 18,
                        color: evalResult.canGraduate ? '#34C759' : '#007AFF',
                      },
                    ]}>
                    {evalResult.canGraduate ? 'LULUS 🎓' : 'BERJALAN'}
                  </Text>
                  <Text style={[styles.widgetSubLabel, { color: textSecondary }]}>
                    {evalResult.canGraduate ? 'Sertifikat Terbit' : 'Lengkapi Syarat'}
                  </Text>
                </View>
              </View>

              {/* CELL (SPAN 2): SECTION TITLE COHORTS */}
              <View style={[styles.bentoSpan2, styles.sectionHeader]}>
                <Text style={[styles.sectionTitle, { color: textPrimary }]}>
                  🏫 Kelas & Program Terdaftar
                </Text>
                <Text style={[styles.sectionSubtitle, { color: textSecondary }]}>
                  Daftar kurikulum yang sedang dan telah Anda ikuti
                </Text>
              </View>

              {/* ENROLLED COHORTS LIST */}
              {enrolledBatches.length === 0 ? (
                <View
                  style={[
                    styles.bentoSpan2,
                    styles.emptyEnrolledCard,
                    {
                      backgroundColor: cardBg,
                      borderColor: cardBorder,
                    },
                  ]}>
                  <View style={[styles.emptyEnrolledIconCircle, { backgroundColor: isDark ? '#2C2C2E' : '#EBF5FF' }]}>
                    <Ionicons name="school-outline" size={36} color="#007AFF" />
                  </View>
                  <Text style={[styles.emptyEnrolledTitle, { color: textPrimary }]}>
                    Belum Ada Kelas Terdaftar
                  </Text>
                  <Text style={[styles.emptyEnrolledDesc, { color: textSecondary }]}>
                    Anda belum bergabung dengan kelas manapun. Masukkan kode kelas yang diberikan oleh pengajar untuk mulai belajar.
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowJoinModal(true)}
                    activeOpacity={0.8}
                    style={styles.emptyEnrolledBtn}>
                    <Ionicons name="key-outline" size={16} color="#FFFFFF" />
                    <Text style={styles.emptyEnrolledBtnText}>+ Masukkan Kode Kelas</Text>
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
                        styles.enrolledClassCard,
                        {
                          backgroundColor: cardBg,
                          borderColor: isSelected
                            ? '#007AFF'
                            : cardBorder,
                          borderWidth: isSelected ? 2 : 1,
                        },
                      ]}>
                      <View style={styles.enrolledHeaderRow}>
                        <View style={styles.codeAndBadgeRow}>
                          <View style={[styles.codeTag, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
                            <Text style={[styles.codeTagText, { color: textPrimary }]}>{b.classCode}</Text>
                          </View>
                          {isDynamic && (
                            <View style={[styles.statusPill, { backgroundColor: isDark ? 'rgba(0,122,255,0.2)' : '#EBF5FF' }]}>
                              <Ionicons name="sparkles" size={11} color="#007AFF" />
                              <Text style={[styles.statusPillText, { color: '#007AFF' }]}>
                                Cohort Aktif
                              </Text>
                            </View>
                          )}
                          {isCompleted && (
                            <View style={[styles.statusPill, { backgroundColor: isDark ? 'rgba(52,199,89,0.2)' : '#EAFBF0' }]}>
                              <Ionicons name="ribbon" size={11} color="#34C759" />
                              <Text style={[styles.statusPillText, { color: '#34C759' }]}>
                                Tersertifikasi
                              </Text>
                            </View>
                          )}
                        </View>

                        {isSelected && (
                          <View style={[styles.selectedIndicatorBadge, { backgroundColor: isDark ? 'rgba(0,122,255,0.2)' : '#EBF5FF' }]}>
                            <Text style={styles.selectedIndicatorText}>Sedang Aktif</Text>
                          </View>
                        )}
                      </View>

                      <Text style={[styles.enrolledCourseTitle, { color: textPrimary }]}>
                        {c?.title || b.batchName}
                      </Text>
                      <Text style={[styles.enrolledBatchName, { color: textSecondary }]}>
                        {b.batchName}
                      </Text>

                      {/* Progress Line */}
                      <View style={styles.enrolledProgressRow}>
                        <Text style={[styles.enrolledProgressLabel, { color: textSecondary }]}>
                          Progres Pembelajaran
                        </Text>
                        <Text style={styles.enrolledProgressValue}>{pct}%</Text>
                      </View>
                      <View style={[styles.progressBarTrackMini, { backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA' }]}>
                        <View
                          style={[
                            styles.progressBarFillMini,
                            {
                              width: `${pct}%`,
                              backgroundColor: isCompleted ? '#34C759' : '#007AFF',
                            },
                          ]}
                        />
                      </View>

                      {/* Footer Action */}
                      <View style={[styles.enrolledFooter, { borderTopColor: isDark ? '#2C2C2E' : '#E5E5EA' }]}>
                        <View style={styles.mentorMiniRow}>
                          <Ionicons name="person-circle-outline" size={16} color={textSecondary} />
                          <Text style={[styles.mentorMiniText, { color: textSecondary }]} numberOfLines={1}>
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
                            styles.enterSyllabusBtn,
                            {
                              backgroundColor: isSelected ? '#007AFF' : isDark ? '#2C2C2E' : '#F2F2F7',
                            },
                          ]}>
                          <Text
                            style={[
                              styles.enterSyllabusBtnText,
                              { color: isSelected ? '#FFFFFF' : textPrimary },
                            ]}>
                            Lihat Silabus
                          </Text>
                          <Ionicons
                            name="chevron-forward"
                            size={14}
                            color={isSelected ? '#FFFFFF' : textPrimary}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })
              )}

              {/* CELL (SPAN 2): GABUNG KELAS BUTTON */}
              <TouchableOpacity
                onPress={() => setShowJoinModal(true)}
                activeOpacity={0.8}
                style={[
                  styles.bentoSpan2,
                  styles.joinClassBtn,
                  {
                    backgroundColor: cardBg,
                    borderColor: '#007AFF',
                  },
                ]}>
                <View style={[styles.joinClassIconBox, { backgroundColor: isDark ? 'rgba(0,122,255,0.2)' : '#EBF5FF' }]}>
                  <Ionicons name="add" size={22} color="#007AFF" />
                </View>
                <View style={styles.joinClassTextCol}>
                  <Text style={styles.joinClassTitle}>Gabung Kelas Baru</Text>
                  <Text style={[styles.joinClassSubtitle, { color: textSecondary }]}>
                    Masukkan kode unik dari pengajar untuk masuk
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#007AFF" />
              </TouchableOpacity>
            </>
          ) : (
            /* ============================================================== */
            /* TEACHER SPECIFIC VIEW */
            /* ============================================================== */
            <>
              {/* CELL (SPAN 1): TOTAL PESERTA */}
              <View
                style={[
                  styles.bentoSpan1,
                  styles.bentoWidget,
                  {
                    backgroundColor: secondaryCardBg,
                    borderColor: cardBorder,
                  },
                ]}>
                <View style={styles.widgetHeader}>
                  <View style={[styles.widgetIconBox, { backgroundColor: isDark ? 'rgba(139,92,246,0.2)' : '#F5F3FF' }]}>
                    <Ionicons name="people" size={18} color="#8B5CF6" />
                  </View>
                  <Text style={[styles.widgetLabel, { color: textSecondary }]}>Peserta</Text>
                </View>
                <View style={styles.widgetBody}>
                  <Text style={[styles.widgetValue, { color: '#8B5CF6' }]}>
                    {activeBatchEnrolledCount}/{activeBatch.maxStudents}
                  </Text>
                  <Text style={[styles.widgetSubLabel, { color: textSecondary }]}>
                    Siswa Terdaftar
                  </Text>
                </View>
              </View>

              {/* CELL (SPAN 1): PERLU DINILAI */}
              <View
                style={[
                  styles.bentoSpan1,
                  styles.bentoWidget,
                  {
                    backgroundColor: secondaryCardBg,
                    borderColor: cardBorder,
                  },
                ]}>
                <View style={styles.widgetHeader}>
                  <View
                    style={[
                      styles.widgetIconBox,
                      {
                        backgroundColor:
                          pendingSubmissions.length > 0
                            ? isDark
                              ? 'rgba(255,59,48,0.2)'
                              : '#FEE2E2'
                            : isDark
                            ? 'rgba(52,199,89,0.2)'
                            : '#EAFBF0',
                      },
                    ]}>
                    <Ionicons
                      name="clipboard"
                      size={18}
                      color={pendingSubmissions.length > 0 ? '#FF3B30' : '#34C759'}
                    />
                  </View>
                  <Text style={[styles.widgetLabel, { color: textSecondary }]}>Antrean</Text>
                </View>
                <View style={styles.widgetBody}>
                  <Text
                    style={[
                      styles.widgetValue,
                      { color: pendingSubmissions.length > 0 ? '#FF3B30' : '#34C759' },
                    ]}>
                    {pendingSubmissions.length}
                  </Text>
                  <Text style={[styles.widgetSubLabel, { color: textSecondary }]}>
                    Perlu Dinilai
                  </Text>
                </View>
              </View>

              {/* CELL (SPAN 1): RERATA TUGAS */}
              <View
                style={[
                  styles.bentoSpan1,
                  styles.bentoWidget,
                  {
                    backgroundColor: secondaryCardBg,
                    borderColor: cardBorder,
                  },
                ]}>
                <View style={styles.widgetHeader}>
                  <View style={[styles.widgetIconBox, { backgroundColor: isDark ? 'rgba(0,122,255,0.2)' : '#EBF5FF' }]}>
                    <Ionicons name="analytics" size={18} color="#007AFF" />
                  </View>
                  <Text style={[styles.widgetLabel, { color: textSecondary }]}>Rata-rata</Text>
                </View>
                <View style={styles.widgetBody}>
                  <Text style={[styles.widgetValue, { color: textPrimary }]}>
                    {activeBatchAverageGrade > 0 ? activeBatchAverageGrade : '-'}
                  </Text>
                  <Text style={[styles.widgetSubLabel, { color: textSecondary }]}>
                    Nilai Kelas
                  </Text>
                </View>
              </View>

              {/* CELL (SPAN 1): PINTASAN KELOLA KELAS */}
              <TouchableOpacity
                onPress={() => router.push('/class-manager' as any)}
                activeOpacity={0.8}
                style={[
                  styles.bentoSpan1,
                  styles.bentoWidget,
                  {
                    backgroundColor: secondaryCardBg,
                    borderColor: cardBorder,
                  },
                ]}>
                <View style={styles.widgetHeader}>
                  <View style={[styles.widgetIconBox, { backgroundColor: isDark ? 'rgba(139,92,246,0.2)' : '#F5F3FF' }]}>
                    <Ionicons name="settings-outline" size={18} color="#8B5CF6" />
                  </View>
                  <Ionicons name="arrow-forward" size={16} color="#8B5CF6" />
                </View>
                <View style={styles.widgetBody}>
                  <Text style={[styles.widgetValue, { fontSize: 16, color: '#8B5CF6' }]}>
                    Kelola Kelas
                  </Text>
                  <Text style={[styles.widgetSubLabel, { color: textSecondary }]}>
                    Atur Kapasitas & Status
                  </Text>
                </View>
              </TouchableOpacity>

              {/* CELL (SPAN 2): PRIMARY TEACHER ACTION */}
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/grading')}
                activeOpacity={0.8}
                style={[styles.bentoSpan2, styles.teacherActionHeroBtn]}>
                <View style={styles.teacherActionBtnContent}>
                  <Ionicons name="clipboard" size={20} color="#FFFFFF" />
                  <Text style={styles.teacherActionHeroBtnText}>
                    Buka Panel Pemeriksaan ({pendingSubmissions.length} Menunggu)
                  </Text>
                </View>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </TouchableOpacity>

              {/* CELL (SPAN 2): POST ANNOUNCEMENT CARD */}
              <View
                style={[
                  styles.bentoSpan2,
                  styles.bentoCard,
                  {
                    backgroundColor: cardBg,
                    borderColor: cardBorder,
                  },
                ]}>
                <View style={styles.bentoCardHeaderLeft}>
                  <View style={[styles.bentoHeaderIcon, { backgroundColor: isDark ? 'rgba(139,92,246,0.2)' : '#F5F3FF' }]}>
                    <Ionicons name="megaphone" size={16} color="#8B5CF6" />
                  </View>
                  <Text style={[styles.cardTitle, { color: textPrimary }]}>
                    Buat Pengumuman Baru ke Kelas
                  </Text>
                </View>

                <TextInput
                  placeholder="Judul pengumuman..."
                  placeholderTextColor="#8E8E93"
                  value={annTitle}
                  onChangeText={setAnnTitle}
                  style={[
                    styles.input,
                    {
                      backgroundColor: inputBg,
                      color: textPrimary,
                    },
                  ]}
                />

                <TextInput
                  placeholder="Tulis pesan untuk semua siswa di batch ini..."
                  placeholderTextColor="#8E8E93"
                  value={annMessage}
                  onChangeText={setAnnMessage}
                  multiline
                  numberOfLines={3}
                  style={[
                    styles.input,
                    styles.textArea,
                    {
                      backgroundColor: inputBg,
                      color: textPrimary,
                    },
                  ]}
                />

                <TouchableOpacity
                  onPress={handlePostAnnouncement}
                  activeOpacity={0.8}
                  style={[styles.secondaryBtn, { borderColor: '#8B5CF6' }]}>
                  <Ionicons name="send" size={14} color="#8B5CF6" />
                  <Text style={[styles.secondaryBtnText, { color: '#8B5CF6' }]}>
                    Kirim Pengumuman
                  </Text>
                </TouchableOpacity>
              </View>

              {/* CELL (SPAN 2): BUAT KELAS BARU */}
              <TouchableOpacity
                onPress={() => router.push('/class-manager' as any)}
                activeOpacity={0.8}
                style={[
                  styles.bentoSpan2,
                  styles.createClassBtn,
                  {
                    backgroundColor: cardBg,
                    borderColor: '#8B5CF6',
                  },
                ]}>
                <View
                  style={[
                    styles.createClassIcon,
                    { backgroundColor: isDark ? 'rgba(139,92,246,0.2)' : '#F5F3FF' },
                  ]}>
                  <Ionicons name="add" size={22} color="#8B5CF6" />
                </View>
                <View style={styles.joinClassTextCol}>
                  <Text style={[styles.joinClassTitle, { color: '#8B5CF6' }]}>
                    Buat Kelas & Course Baru
                  </Text>
                  <Text style={[styles.joinClassSubtitle, { color: textSecondary }]}>
                    Rancang kurikulum dan buka angkatan cohort baru
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#8B5CF6" />
              </TouchableOpacity>
            </>
          )}

          {/* ============================================================== */}
          {/* SECTION HEADER (SPAN 2): ANNOUNCEMENTS STREAM */}
          {/* ============================================================== */}
          <View style={[styles.bentoSpan2, styles.sectionHeader]}>
            <Text style={[styles.sectionTitle, { color: textPrimary }]}>
              💬 Pengumuman Kelas (Stream)
            </Text>
            <Text style={[styles.sectionSubtitle, { color: textSecondary }]}>
              Informasi terkini dari instruktur kelas
            </Text>
          </View>

          {announcements.map((ann) => (
            <View
              key={ann.id}
              style={[
                styles.bentoSpan2,
                styles.announcementCard,
                {
                  backgroundColor: cardBg,
                  borderColor: cardBorder,
                },
              ]}>
              <View style={styles.annHeader}>
                <View style={styles.annAuthor}>
                  <View style={[styles.annAuthorIconBox, { backgroundColor: isDark ? 'rgba(139,92,246,0.2)' : '#F5F3FF' }]}>
                    <Ionicons name="person" size={14} color="#8B5CF6" />
                  </View>
                  <Text style={[styles.annAuthorName, { color: textPrimary }]}>{ann.authorName}</Text>
                </View>
                <Text style={styles.annTime}>
                  {new Date(ann.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </Text>
              </View>
              <Text style={[styles.annTitle, { color: textPrimary }]}>{ann.title}</Text>
              <Text style={[styles.annMessage, { color: textSecondary }]}>{ann.message}</Text>
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
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
              },
            ]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: textPrimary }]}>
                🔑 Gabung Kelas
              </Text>
              <TouchableOpacity onPress={() => setShowJoinModal(false)}>
                <Ionicons
                  name="close-circle"
                  size={28}
                  color={isDark ? '#8E8E93' : '#AEAEB2'}
                />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalDesc, { color: textSecondary }]}>
              Masukkan kode kelas 6 karakter yang diberikan oleh pengajar untuk bergabung.
            </Text>

            {joinError !== '' && (
              <View style={styles.modalErrorBox}>
                <Ionicons name="alert-circle" size={16} color="#FF3B30" />
                <Text style={styles.modalErrorText}>{joinError}</Text>
              </View>
            )}

            <TextInput
              placeholder="Contoh: ABC-123"
              placeholderTextColor="#8E8E93"
              value={joinCode}
              onChangeText={(t) => {
                setJoinCode(t.toUpperCase());
                setJoinError('');
              }}
              autoCapitalize="characters"
              style={[
                styles.modalInput,
                {
                  backgroundColor: inputBg,
                  color: textPrimary,
                  borderColor: joinError ? '#FF3B30' : cardBorder,
                },
              ]}
            />

            <TouchableOpacity
              onPress={handleJoinClass}
              activeOpacity={0.8}
              style={styles.modalPrimaryBtn}>
              <Ionicons name="enter-outline" size={18} color="#FFFFFF" />
              <Text style={styles.modalPrimaryBtnText}>Gabung Kelas</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowJoinModal(false)}
              activeOpacity={0.7}
              style={[
                styles.modalSecondaryBtn,
                {
                  borderColor: isDark ? '#3A3A3C' : '#E5E5EA',
                },
              ]}>
              <Text style={[styles.modalSecondaryBtnText, { color: textSecondary }]}>
                Batal
              </Text>
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
  /* iOS BENTO GRID CONTAINER & CELL SPANS */
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
  /* BENTO CARD & CELLS (SQUIRCLE 22PX) */
  /* ============================================================== */
  bentoCard: {
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 14,
    elevation: 2,
  },
  heroBatchCard: {
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 3,
  },
  bentoWidget: {
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    minHeight: 110,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
  },
  widgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  widgetIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  widgetLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  widgetBody: {
    justifyContent: 'flex-end',
  },
  widgetValue: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  widgetSubLabel: {
    fontSize: 11,
    fontWeight: '500',
  },

  /* ============================================================== */
  /* HERO BATCH CARD CONTENT */
  /* ============================================================== */
  batchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  batchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  batchBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  codeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    minHeight: 32,
  },
  codeBadgeLabel: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '500',
  },
  codeBadgeValue: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  batchTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.4,
  },
  batchSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 12,
  },
  mentorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mentorAvatarIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mentorText: {
    fontSize: 12,
  },
  mentorName: {
    fontWeight: '600',
  },

  /* ============================================================== */
  /* PROGRESS HERO */
  /* ============================================================== */
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bentoCardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  bentoHeaderIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  progressPctText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#007AFF',
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },

  /* ============================================================== */
  /* INTERACTIVE BUTTONS (APPLE HIG 44PX TARGET) */
  /* ============================================================== */
  primaryBtn: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    borderRadius: 12,
    gap: 8,
    paddingHorizontal: 16,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: -0.2,
  },
  teacherActionHeroBtn: {
    backgroundColor: '#8B5CF6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
    borderRadius: 14,
    paddingHorizontal: 16,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  },
  teacherActionBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  teacherActionHeroBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: -0.2,
  },
  secondaryBtn: {
    borderWidth: 1.5,
    borderRadius: 12,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 14,
    marginTop: 4,
  },
  secondaryBtnText: {
    fontWeight: '700',
    fontSize: 13,
  },

  /* ============================================================== */
  /* FORMS & INPUTS (SQUIRCLE 12PX) */
  /* ============================================================== */
  input: {
    borderRadius: 12,
    paddingHorizontal: 14,
    minHeight: 44,
    fontSize: 14,
    marginBottom: 10,
  },
  textArea: {
    minHeight: 70,
    paddingTop: 12,
    textAlignVertical: 'top',
  },

  /* ============================================================== */
  /* SECTIONS & ENROLLED COHORTS */
  /* ============================================================== */
  sectionHeader: {
    marginTop: 10,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  enrolledClassCard: {
    borderRadius: 22,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  enrolledHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  codeAndBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  codeTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  codeTagText: {
    fontSize: 11,
    fontWeight: '800',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  selectedIndicatorBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  selectedIndicatorText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#007AFF',
  },
  enrolledCourseTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  enrolledBatchName: {
    fontSize: 12,
    marginBottom: 12,
  },
  enrolledProgressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  enrolledProgressLabel: {
    fontSize: 11,
  },
  enrolledProgressValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#007AFF',
  },
  progressBarTrackMini: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFillMini: {
    height: '100%',
    borderRadius: 3,
  },
  enrolledFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  mentorMiniRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  mentorMiniText: {
    fontSize: 12,
  },
  enterSyllabusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    minHeight: 36,
    borderRadius: 10,
  },
  enterSyllabusBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },

  /* ============================================================== */
  /* ACTION CARDS (GABUNG & BUAT KELAS) */
  /* ============================================================== */
  joinClassBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 22,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    minHeight: 64,
  },
  joinClassIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  joinClassTextCol: {
    flex: 1,
  },
  joinClassTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  joinClassSubtitle: {
    fontSize: 11,
  },
  createClassBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 22,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    minHeight: 64,
  },
  createClassIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ============================================================== */
  /* ANNOUNCEMENTS STREAM */
  /* ============================================================== */
  announcementCard: {
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  annHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  annAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  annAuthorIconBox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  annAuthorName: {
    fontSize: 12,
    fontWeight: '700',
  },
  annTime: {
    fontSize: 11,
    color: '#8E8E93',
  },
  annTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  annMessage: {
    fontSize: 13,
    lineHeight: 18,
  },

  /* ============================================================== */
  /* URGENT NOTIFICATION BANNER */
  /* ============================================================== */
  urgentNotifBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 22,
    borderWidth: 1.5,
    gap: 12,
  },
  urgentNotifIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  urgentNotifTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  urgentNotifMessage: {
    fontSize: 12,
    lineHeight: 16,
  },

  /* ============================================================== */
  /* EMPTY STATE */
  /* ============================================================== */
  emptyEnrolledCard: {
    padding: 24,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyEnrolledIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyEnrolledTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyEnrolledDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
    maxWidth: 280,
  },
  emptyEnrolledBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    minHeight: 44,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  emptyEnrolledBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  /* ============================================================== */
  /* MODAL */
  /* ============================================================== */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  modalDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  modalErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEE2E2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  modalErrorText: {
    fontSize: 13,
    color: '#FF3B30',
    fontWeight: '600',
    flex: 1,
  },
  modalInput: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    minHeight: 48,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 16,
  },
  modalPrimaryBtn: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 10,
    shadowColor: '#007AFF',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  modalPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  modalSecondaryBtn: {
    borderWidth: 1.5,
    borderRadius: 12,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSecondaryBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
