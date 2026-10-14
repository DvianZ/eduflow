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

  return (
    <SafeAreaView
      edges={['top']}
      style={[
        styles.safeArea,
        { backgroundColor: isDark ? '#090D16' : '#F8FAFC' },
      ]}>
      <DemoHeader />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Active Batch Hero Card */}
        <View
          style={[
            styles.batchCard,
            {
              backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
              borderColor: isDark ? '#334155' : '#E2E8F0',
            },
          ]}>
          <View style={styles.batchHeader}>
            <View
              style={[
                styles.batchBadge,
                {
                  backgroundColor:
                    activeBatch.id === 'batch-edf-402'
                      ? '#DBEAFE'
                      : activeBatch.status === 'completed'
                      ? '#DCFCE7'
                      : '#EDE9FE',
                },
              ]}>
              <Text
                style={[
                  styles.batchBadgeText,
                  {
                    color:
                      activeBatch.id === 'batch-edf-402'
                        ? '#1E40AF'
                        : activeBatch.status === 'completed'
                        ? '#15803D'
                        : '#7C3AED',
                  },
                ]}>
                {activeBatch.id === 'batch-edf-402'
                  ? '⚡ COHORT AKTIF'
                  : activeBatch.status === 'completed'
                  ? '🏆 LULUS & BERSERTIFIKAT'
                  : 'KELAS AKTIF'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => handleCopyCode(activeBatch.classCode)}
              activeOpacity={0.8}
              style={[
                styles.codeBadge,
                copiedCode === activeBatch.classCode && { backgroundColor: '#DCFCE7' },
              ]}>
              <Ionicons
                name={copiedCode === activeBatch.classCode ? 'checkmark' : 'copy-outline'}
                size={12}
                color={copiedCode === activeBatch.classCode ? '#16A34A' : '#2563EB'}
              />
              <Text style={styles.codeBadgeLabel}>Kode:</Text>
              <Text
                style={[
                  styles.codeBadgeValue,
                  copiedCode === activeBatch.classCode && { color: '#16A34A' },
                ]}>
                {copiedCode === activeBatch.classCode ? 'Tersalin!' : activeBatch.classCode}
              </Text>
            </TouchableOpacity>
          </View>

          <Text
            style={[
              styles.batchTitle,
              { color: isDark ? '#F8FAFC' : '#0F172A' },
            ]}>
            {activeCourse?.title || activeBatch.batchName}
          </Text>
          <Text style={styles.batchSubtitle}>{activeBatch.batchName}</Text>

          <View style={styles.mentorRow}>
            <Ionicons name="person-circle-outline" size={18} color="#64748B" />
            <Text style={styles.mentorText}>
              Mentor: <Text style={styles.mentorName}>{activeBatch.instructorName}</Text>
            </Text>
          </View>
        </View>

        {/* LEARNER SPECIFIC VIEW */}
        {!isTeacher ? (
          <>
            {/* Urgent Notification Banner for Learner */}
            {unreadAlertNotif && (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => router.push('/(tabs)/grading')}
                style={[
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
                      unreadAlertNotif.type === 'revision'
                        ? '#F59E0B'
                        : '#10B981',
                  },
                ]}>
                <View
                  style={[
                    styles.urgentNotifIconBox,
                    {
                      backgroundColor:
                        unreadAlertNotif.type === 'revision'
                          ? '#FEF3C7'
                          : '#D1FAE5',
                    },
                  ]}>
                  <Ionicons
                    name={
                      unreadAlertNotif.type === 'revision'
                        ? 'alert-circle'
                        : 'trophy'
                    }
                    size={20}
                    color={
                      unreadAlertNotif.type === 'revision'
                        ? '#D97706'
                        : '#059669'
                    }
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.urgentNotifTitle,
                      {
                        color:
                          unreadAlertNotif.type === 'revision'
                            ? '#D97706'
                            : '#059669',
                      },
                    ]}>
                    {unreadAlertNotif.title}
                  </Text>
                  <Text
                    style={[
                      styles.urgentNotifMessage,
                      { color: isDark ? '#E2E8F0' : '#475569' },
                    ]}
                    numberOfLines={2}>
                    {unreadAlertNotif.message}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={
                    unreadAlertNotif.type === 'revision'
                      ? '#D97706'
                      : '#059669'
                  }
                />
              </TouchableOpacity>
            )}

            {/* Progress Card for Active Class */}
            <View
              style={[
                styles.card,
                {
                  backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                  borderColor: isDark ? '#334155' : '#E2E8F0',
                },
              ]}>
              <View style={styles.cardHeader}>
                <Text
                  style={[
                    styles.cardTitle,
                    { color: isDark ? '#F8FAFC' : '#0F172A' },
                  ]}>
                  📊 Progres Belajar: {activeBatch.classCode}
                </Text>
                <Text style={styles.progressPctText}>{evalResult.lessonProgressPct}%</Text>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressBarTrack}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${evalResult.lessonProgressPct}%` },
                  ]}
                />
              </View>

              <View style={styles.metricsGrid}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricValue}>
                    {evalResult.completedLessons}/{evalResult.totalLessons}
                  </Text>
                  <Text style={styles.metricLabel}>Materi Selesai</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricValue}>
                    {userQuizAttempts.filter((q) => q.isPassed).length}
                  </Text>
                  <Text style={styles.metricLabel}>Kuis Lulus</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricValue}>
                    {userGrades.length > 0 ? `${userGrades[0].score}/100` : '-'}
                  </Text>
                  <Text style={styles.metricLabel}>Nilai Tugas</Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => router.push('/(tabs)/syllabus')}
                style={styles.primaryBtn}>
                <Text style={styles.primaryBtnText}>Buka Silabus & Kurikulum</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* ENROLLED COHORTS LIST (Multi-Class Platform ala Wadhwani) */}
            <View style={styles.sectionHeader}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: isDark ? '#F8FAFC' : '#0F172A' },
                ]}>
                🏫 Kelas & Program Terdaftar (Enrolled Cohorts)
              </Text>
              <Text style={styles.sectionSubtitle}>
                Daftar kurikulum yang sedang dan telah Anda ikuti
              </Text>
            </View>

            {enrolledBatches.length === 0 ? (
              <View
                style={[
                  styles.emptyEnrolledCard,
                  {
                    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                    borderColor: isDark ? '#334155' : '#E2E8F0',
                  },
                ]}>
                <View style={styles.emptyEnrolledIconCircle}>
                  <Ionicons name="school-outline" size={36} color="#2563EB" />
                </View>
                <Text
                  style={[
                    styles.emptyEnrolledTitle,
                    { color: isDark ? '#F8FAFC' : '#0F172A' },
                  ]}>
                  Belum Ada Kelas Terdaftar
                </Text>
                <Text style={styles.emptyEnrolledDesc}>
                  Anda belum bergabung dengan kelas manapun. Masukkan kode kelas yang diberikan oleh pengajar Anda untuk mulai belajar.
                </Text>
                <TouchableOpacity
                  onPress={() => setShowJoinModal(true)}
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
                    styles.enrolledClassCard,
                    {
                      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                      borderColor: isSelected
                        ? '#2563EB'
                        : isDark
                        ? '#334155'
                        : '#E2E8F0',
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}>
                  <View style={styles.enrolledHeaderRow}>
                    <View style={styles.codeAndBadgeRow}>
                      <View style={styles.codeTag}>
                        <Text style={styles.codeTagText}>{b.classCode}</Text>
                      </View>
                      {isDynamic && (
                        <View style={[styles.statusPill, { backgroundColor: '#DBEAFE' }]}>
                          <Ionicons name="sparkles" size={12} color="#1D4ED8" />
                          <Text style={[styles.statusPillText, { color: '#1D4ED8' }]}>
                            Cohort Aktif
                          </Text>
                        </View>
                      )}
                      {isCompleted && (
                        <View style={[styles.statusPill, { backgroundColor: '#DCFCE7' }]}>
                          <Ionicons name="ribbon" size={12} color="#15803D" />
                          <Text style={[styles.statusPillText, { color: '#15803D' }]}>
                            Tersertifikasi
                          </Text>
                        </View>
                      )}
                    </View>

                    {isSelected && (
                      <View style={styles.selectedIndicatorBadge}>
                        <Text style={styles.selectedIndicatorText}>Sedang Aktif</Text>
                      </View>
                    )}
                  </View>

                  <Text
                    style={[
                      styles.enrolledCourseTitle,
                      { color: isDark ? '#F8FAFC' : '#0F172A' },
                    ]}>
                    {c?.title || b.batchName}
                  </Text>
                  <Text style={styles.enrolledBatchName}>{b.batchName}</Text>

                  {/* Progress Line */}
                  <View style={styles.enrolledProgressRow}>
                    <Text style={styles.enrolledProgressLabel}>Progres Pembelajaran</Text>
                    <Text style={styles.enrolledProgressValue}>{pct}%</Text>
                  </View>
                  <View style={styles.progressBarTrackMini}>
                    <View
                      style={[
                        styles.progressBarFillMini,
                        {
                          width: `${pct}%`,
                          backgroundColor: isCompleted ? '#10B981' : '#2563EB',
                        },
                      ]}
                    />
                  </View>

                  {/* Footer Action */}
                  <View style={styles.enrolledFooter}>
                    <View style={styles.mentorMiniRow}>
                      <Ionicons name="person-circle-outline" size={16} color="#64748B" />
                      <Text style={styles.mentorMiniText} numberOfLines={1}>
                        {b.instructorName}
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => {
                        selectBatch(b.id);
                        router.push('/(tabs)/syllabus');
                      }}
                      style={[
                        styles.enterSyllabusBtn,
                        {
                          backgroundColor: isSelected ? '#2563EB' : isDark ? '#334155' : '#F1F5F9',
                        },
                      ]}>
                      <Text
                        style={[
                          styles.enterSyllabusBtnText,
                          { color: isSelected ? '#FFFFFF' : isDark ? '#F8FAFC' : '#1E293B' },
                        ]}>
                        Lihat Silabus
                      </Text>
                      <Ionicons
                        name="chevron-forward"
                        size={14}
                        color={isSelected ? '#FFFFFF' : isDark ? '#F8FAFC' : '#1E293B'}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}

            {/* Join Class Button */}
            <TouchableOpacity
              onPress={() => setShowJoinModal(true)}
              style={[
                styles.joinClassBtn,
                {
                  backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                  borderColor: '#2563EB',
                },
              ]}>
              <Ionicons name="add-circle-outline" size={20} color="#2563EB" />
              <View style={styles.joinClassTextCol}>
                <Text style={styles.joinClassTitle}>Gabung Kelas Baru</Text>
                <Text style={styles.joinClassSubtitle}>Masukkan kode kelas dari pengajar</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#2563EB" />
            </TouchableOpacity>
          </>
        ) : (
          /* TEACHER SPECIFIC VIEW */
          <>
            {/* Teacher Metrics Overview */}
            <View
              style={[
                styles.card,
                {
                  backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                  borderColor: isDark ? '#334155' : '#E2E8F0',
                },
              ]}>
              <Text
                style={[
                  styles.cardTitle,
                  { color: isDark ? '#F8FAFC' : '#0F172A' },
                ]}>
                👨‍🏫 Panel Ringkasan Pengajar
              </Text>

              <View style={styles.metricsGrid}>
                <View style={styles.metricItem}>
                  <Text style={[styles.metricValue, { color: '#8B5CF6' }]}>
                    {activeBatchEnrolledCount} / {activeBatch.maxStudents}
                  </Text>
                  <Text style={styles.metricLabel}>Total Peserta</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text
                    style={[
                      styles.metricValue,
                      { color: pendingSubmissions.length > 0 ? '#EF4444' : '#10B981' },
                    ]}>
                    {pendingSubmissions.length}
                  </Text>
                  <Text style={styles.metricLabel}>Perlu Dinilai</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricValue}>
                    {activeBatchAverageGrade > 0 ? `${activeBatchAverageGrade}` : '-'}
                  </Text>
                  <Text style={styles.metricLabel}>Rerata Tugas</Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => router.push('/(tabs)/grading')}
                style={[styles.primaryBtn, { backgroundColor: '#8B5CF6' }]}>
                <Text style={styles.primaryBtnText}>
                  Buka Panel Pemeriksaan ({pendingSubmissions.length} Menunggu)
                </Text>
                <Ionicons name="clipboard-outline" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Post Announcement Form */}
            <View
              style={[
                styles.card,
                {
                  backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                  borderColor: isDark ? '#334155' : '#E2E8F0',
                },
              ]}>
              <Text
                style={[
                  styles.cardTitle,
                  { color: isDark ? '#F8FAFC' : '#0F172A' },
                ]}>
                📢 Buat Pengumuman Baru ke Kelas
              </Text>

              <TextInput
                placeholder="Judul pengumuman..."
                placeholderTextColor="#94A3B8"
                value={annTitle}
                onChangeText={setAnnTitle}
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? '#0F172A' : '#F1F5F9',
                    color: isDark ? '#F8FAFC' : '#0F172A',
                  },
                ]}
              />

              <TextInput
                placeholder="Tulis pesan untuk semua siswa di batch ini..."
                placeholderTextColor="#94A3B8"
                value={annMessage}
                onChangeText={setAnnMessage}
                multiline
                numberOfLines={3}
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    backgroundColor: isDark ? '#0F172A' : '#F1F5F9',
                    color: isDark ? '#F8FAFC' : '#0F172A',
                  },
                ]}
              />

              <TouchableOpacity
                onPress={handlePostAnnouncement}
                style={[styles.secondaryBtn, { borderColor: '#8B5CF6' }]}>
                <Ionicons name="megaphone-outline" size={16} color="#8B5CF6" />
                <Text style={[styles.secondaryBtnText, { color: '#8B5CF6' }]}>
                  Kirim Pengumuman
                </Text>
              </TouchableOpacity>
            </View>

            {/* Create Class Button */}
            <TouchableOpacity
              onPress={() => router.push('/class-manager' as any)}
              style={[
                styles.createClassBtn,
                {
                  backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                  borderColor: '#8B5CF6',
                },
              ]}>
              <View style={[
                styles.createClassIcon,
                { backgroundColor: isDark ? '#2D1B69' : '#EDE9FE' },
              ]}>
                <Ionicons name="add" size={22} color="#8B5CF6" />
              </View>
              <View style={styles.joinClassTextCol}>
                <Text style={[styles.joinClassTitle, { color: '#8B5CF6' }]}>
                  Buat Kelas Baru
                </Text>
                <Text style={styles.joinClassSubtitle}>
                  Buat course dan kelas baru untuk siswa Anda
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#8B5CF6" />
            </TouchableOpacity>
          </>
        )}

        {/* Batch Announcements Stream */}
        <View style={styles.sectionHeader}>
          <Text
            style={[
              styles.sectionTitle,
              { color: isDark ? '#F8FAFC' : '#0F172A' },
            ]}>
            💬 Pengumuman Kelas (Stream)
          </Text>
        </View>

        {announcements.map((ann) => (
          <View
            key={ann.id}
            style={[
              styles.announcementCard,
              {
                backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                borderColor: isDark ? '#334155' : '#E2E8F0',
              },
            ]}>
            <View style={styles.annHeader}>
              <View style={styles.annAuthor}>
                <Ionicons name="person-circle" size={24} color="#8B5CF6" />
                <Text style={styles.annAuthorName}>{ann.authorName}</Text>
              </View>
              <Text style={styles.annTime}>
                {new Date(ann.createdAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                })}
              </Text>
            </View>
            <Text
              style={[
                styles.annTitle,
                { color: isDark ? '#F8FAFC' : '#0F172A' },
              ]}>
              {ann.title}
            </Text>
            <Text style={styles.annMessage}>{ann.message}</Text>
          </View>
        ))}
      </ScrollView>

      {/* JOIN CLASS MODAL */}
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
                backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
              },
            ]}>
            <View style={styles.modalHeader}>
              <Text
                style={[
                  styles.modalTitle,
                  { color: isDark ? '#F8FAFC' : '#0F172A' },
                ]}>
                🔑 Gabung Kelas
              </Text>
              <TouchableOpacity onPress={() => setShowJoinModal(false)}>
                <Ionicons
                  name="close-circle"
                  size={28}
                  color={isDark ? '#94A3B8' : '#64748B'}
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDesc}>
              Masukkan kode kelas yang diberikan oleh pengajar untuk bergabung ke kelas baru.
            </Text>

            {joinError !== '' && (
              <View style={styles.modalErrorBox}>
                <Ionicons name="alert-circle" size={16} color="#DC2626" />
                <Text style={styles.modalErrorText}>{joinError}</Text>
              </View>
            )}

            <TextInput
              placeholder="Contoh: ABC-123 atau EDF-402"
              placeholderTextColor="#94A3B8"
              value={joinCode}
              onChangeText={(t) => {
                setJoinCode(t.toUpperCase());
                setJoinError('');
              }}
              autoCapitalize="characters"
              style={[
                styles.modalInput,
                {
                  backgroundColor: isDark ? '#0F172A' : '#F1F5F9',
                  color: isDark ? '#F8FAFC' : '#0F172A',
                  borderColor: joinError ? '#FCA5A5' : isDark ? '#334155' : '#CBD5E1',
                },
              ]}
            />

            <TouchableOpacity
              onPress={handleJoinClass}
              style={styles.modalPrimaryBtn}>
              <Ionicons name="enter-outline" size={18} color="#FFFFFF" />
              <Text style={styles.modalPrimaryBtnText}>Gabung Kelas</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowJoinModal(false)}
              style={[
                styles.modalSecondaryBtn,
                {
                  borderColor: isDark ? '#334155' : '#CBD5E1',
                },
              ]}>
              <Text
                style={[
                  styles.modalSecondaryBtnText,
                  { color: isDark ? '#94A3B8' : '#64748B' },
                ]}>
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
    padding: 16,
    paddingBottom: 40,
  },
  batchCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  batchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  batchBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  batchBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
  },
  codeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  codeBadgeLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  codeBadgeValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2563EB',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  batchTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  mentorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mentorText: {
    fontSize: 12,
    color: '#64748B',
  },
  mentorName: {
    fontWeight: '700',
    color: '#475569',
  },
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  progressPctText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2563EB',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 4,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 8,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  primaryBtn: {
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  input: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 10,
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  secondaryBtn: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  secondaryBtnText: {
    fontWeight: '700',
    fontSize: 13,
  },
  sectionHeader: {
    marginTop: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  announcementCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  annHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  annAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  annAuthorName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  annTime: {
    fontSize: 11,
    color: '#94A3B8',
  },
  annTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  annMessage: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  batchSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 4,
  },
  enrolledClassCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
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
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  codeTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  selectedIndicatorBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#93C5FD',
  },
  selectedIndicatorText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  enrolledCourseTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  enrolledBatchName: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12,
  },
  enrolledProgressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  enrolledProgressLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  enrolledProgressValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  progressBarTrackMini: {
    height: 6,
    backgroundColor: '#E2E8F0',
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
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E2E8F0',
  },
  mentorMiniRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  mentorMiniText: {
    fontSize: 12,
    color: '#64748B',
  },
  enterSyllabusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  enterSyllabusBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  joinClassBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    marginBottom: 12,
  },
  joinClassTextCol: {
    flex: 1,
  },
  joinClassTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563EB',
    marginBottom: 2,
  },
  joinClassSubtitle: {
    fontSize: 11,
    color: '#64748B',
  },
  createClassBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    marginTop: 12,
    marginBottom: 12,
  },
  createClassIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  },
  modalDesc: {
    fontSize: 13,
    color: '#64748B',
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
    color: '#DC2626',
    fontWeight: '600',
    flex: 1,
  },
  modalInput: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 16,
  },
  modalPrimaryBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 14,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 10,
    shadowColor: '#2563EB',
    shadowOpacity: 0.3,
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
    borderRadius: 14,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSecondaryBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyEnrolledCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyEnrolledIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EFF6FF',
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
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
    maxWidth: 280,
  },
  emptyEnrolledBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  emptyEnrolledBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  urgentNotifBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 16,
    gap: 12,
  },
  urgentNotifIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
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
});
