import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  useColorScheme,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { DemoHeader } from '@/components/DemoHeader';
import { useElearningStore } from '@/store/useElearningStore';
import { useAuthStore } from '@/store/useAuthStore';
import { AssignmentSubmission } from '@/types/elearning';
import {
  buildGradebookRows,
  calculateGradebookSummary,
  formatGradebookCSV,
  downloadCSVFile,
  copyCSVToClipboard,
} from '@/utils/exportGradebook';

export default function GradingScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const {
    currentRole,
    currentUser,
    submissions,
    grades,
    assignments,
    batches,
    courses,
    modules,
    lessons,
    quizzes,
    enrollments,
    quizAttempts,
    gradeSubmission,
  } = useElearningStore();
  const registeredUsers = useAuthStore((state) => state.registeredUsers);

  const isTeacher = currentRole === 'teacher';

  const teacherBatches = batches.filter((b) => b.instructorId === currentUser.id);
  const teacherBatchIds = teacherBatches.map((b) => b.id);

  // Data isolation:
  // - Teacher only sees submissions from their own classes
  // Data isolation:
  // - Teacher only sees submissions from their own classes
  // - Student only sees their own submitted assignments
  const relevantSubmissions = isTeacher
    ? submissions.filter((s) => teacherBatchIds.includes(s.batchId))
    : submissions.filter((s) => s.userId === currentUser.id);

  const [selectedBatchFilter, setSelectedBatchFilter] = useState<string>('all');

  // Gradebook export modal state
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportBatchFilter, setExportBatchFilter] = useState<string>('all');
  const [isCopiedCSV, setIsCopiedCSV] = useState(false);

  // Build gradebook data
  const gradebookRows = buildGradebookRows({
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
    targetBatchId: exportBatchFilter,
    instructorId: isTeacher ? currentUser.id : undefined,
  });

  const gradebookSummary = calculateGradebookSummary(gradebookRows);

  const handleDownloadCSV = () => {
    const activeBatch = batches.find((b) => b.id === exportBatchFilter);
    const className = activeBatch
      ? `${activeBatch.classCode} - ${activeBatch.batchName}`
      : 'Semua Kelas';
    const csvString = formatGradebookCSV(gradebookRows, className);
    const filename = `rekap_nilai_${
      activeBatch ? activeBatch.classCode.toLowerCase() : 'semua_kelas'
    }_${new Date().toISOString().split('T')[0]}.csv`;

    const success = downloadCSVFile(csvString, filename);
    if (success) {
      Alert.alert(
        'Berhasil Mengunduh Berkas',
        `Berkas "${filename}" telah diunduh ke folder unduhan Anda.`
      );
    } else {
      copyCSVToClipboard(csvString);
      Alert.alert(
        'Data CSV Disalin ke Clipboard',
        'Berkas CSV telah disalin ke clipboard dan siap ditempel ke Google Sheets atau Excel.'
      );
    }
  };

  const handleCopyCSV = async () => {
    const activeBatch = batches.find((b) => b.id === exportBatchFilter);
    const className = activeBatch
      ? `${activeBatch.classCode} - ${activeBatch.batchName}`
      : 'Semua Kelas';
    const csvString = formatGradebookCSV(gradebookRows, className);
    await copyCSVToClipboard(csvString);
    setIsCopiedCSV(true);
    setTimeout(() => setIsCopiedCSV(false), 2500);
  };

  const filteredSubmissions = relevantSubmissions.filter((s) => {
    if (!isTeacher || selectedBatchFilter === 'all') return true;
    return s.batchId === selectedBatchFilter;
  });

  // Teacher grading modal state
  const [selectedSub, setSelectedSub] = useState<AssignmentSubmission | null>(null);
  const [inputScore, setInputScore] = useState('85');
  const [inputFeedback, setInputFeedback] = useState('');

  const handleOpenGradeModal = (sub: AssignmentSubmission) => {
    const existingGrade = grades.find((g) => g.submissionId === sub.id);
    if (existingGrade) {
      setInputScore(existingGrade.score.toString());
      setInputFeedback(existingGrade.feedbackNotes);
    } else {
      setInputScore('85');
      setInputFeedback('Kerja bagus! Struktur arsitektur dan pemisahan state sudah rapi.');
    }
    setSelectedSub(sub);
  };

  const handleSaveGradePress = (isRevision: boolean) => {
    if (!selectedSub) return;
    const scoreNum = parseInt(inputScore, 10);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
      Alert.alert('Nilai Tidak Valid', 'Masukkan nilai angka antara 0 hingga 100.');
      return;
    }

    gradeSubmission(
      selectedSub.id,
      scoreNum,
      inputFeedback.trim() || 'Evaluasi selesai.',
      isRevision
    );

    Alert.alert(
      isRevision ? 'Permintaan Revisi Dikirim' : 'Nilai Berhasil Disimpan',
      isRevision
        ? 'Siswa diminta memperbaiki tugas.'
        : `Nilai ${scoreNum}/100 dan feedback berhasil diberikan kepada siswa.`
    );
    setSelectedSub(null);
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
        <View style={styles.headerTitleContainer}>
          <Text
            style={[
              styles.screenTitle,
              { color: isDark ? '#F8FAFC' : '#0F172A' },
            ]}>
            {isTeacher ? '📝 Panel Pemeriksaan Tugas Pengajar' : '📑 Status Tugas & Feedback Guru'}
          </Text>
          <Text style={styles.screenSubtitle}>
            {isTeacher
              ? 'Periksa hasil pengumpulan tugas proyek siswa dan berikan evaluasi'
              : 'Pantau nilai resmi dan ulasan perbaikan dari mentor Anda'}
          </Text>
        </View>

        {/* Teacher Gradebook Export Action Card */}
        {isTeacher && (
          <View
            style={[
              styles.exportActionCard,
              {
                backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                borderColor: isDark ? '#334155' : '#E2E8F0',
              },
            ]}>
            <View style={styles.exportActionLeft}>
              <View style={styles.exportIconBadge}>
                <Ionicons name="document-text" size={20} color="#10B981" />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.exportCardTitle,
                    { color: isDark ? '#F8FAFC' : '#0F172A' },
                  ]}>
                  Rekapitulasi Nilai Siswa
                </Text>
                <Text style={styles.exportCardSub}>
                  Ekspor rekap nilai kuis, tugas proyek & status kelulusan ke CSV/Excel
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => {
                setExportBatchFilter(selectedBatchFilter);
                setIsExportModalOpen(true);
              }}
              style={styles.openExportModalBtn}>
              <Ionicons name="cloud-download-outline" size={15} color="#FFFFFF" />
              <Text style={styles.openExportModalBtnText}>Unduh Rekap Nilai</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Teacher Class Filter Chips */}
        {isTeacher && teacherBatches.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterChipsRow}>
            <TouchableOpacity
              onPress={() => setSelectedBatchFilter('all')}
              style={[
                styles.filterChip,
                {
                  backgroundColor:
                    selectedBatchFilter === 'all'
                      ? '#8B5CF6'
                      : isDark
                      ? '#1E293B'
                      : '#F1F5F9',
                  borderColor:
                    selectedBatchFilter === 'all'
                      ? '#7C3AED'
                      : isDark
                      ? '#334155'
                      : '#E2E8F0',
                },
              ]}>
              <Text
                style={[
                  styles.filterChipText,
                  {
                    color:
                      selectedBatchFilter === 'all'
                        ? '#FFFFFF'
                        : isDark
                        ? '#CBD5E1'
                        : '#475569',
                    fontWeight: selectedBatchFilter === 'all' ? '800' : '600',
                  },
                ]}>
                Semua Kelas ({relevantSubmissions.length})
              </Text>
            </TouchableOpacity>

            {teacherBatches.map((b) => {
              const count = relevantSubmissions.filter((s) => s.batchId === b.id).length;
              const isSelected = selectedBatchFilter === b.id;
              return (
                <TouchableOpacity
                  key={b.id}
                  onPress={() => setSelectedBatchFilter(b.id)}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: isSelected
                        ? '#8B5CF6'
                        : isDark
                        ? '#1E293B'
                        : '#F1F5F9',
                      borderColor: isSelected
                        ? '#7C3AED'
                        : isDark
                        ? '#334155'
                        : '#E2E8F0',
                    },
                  ]}>
                  <Text
                    style={[
                      styles.filterChipText,
                      {
                        color: isSelected
                          ? '#FFFFFF'
                          : isDark
                          ? '#CBD5E1'
                          : '#475569',
                        fontWeight: isSelected ? '800' : '600',
                      },
                    ]}>
                    {b.classCode} ({count})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {filteredSubmissions.length === 0 ? (
          <View
            style={[
              styles.emptyCard,
              {
                backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                borderColor: isDark ? '#334155' : '#E2E8F0',
              },
            ]}>
            <Ionicons name="folder-outline" size={48} color="#94A3B8" />
            <Text
              style={[
                styles.emptyTitle,
                { color: isDark ? '#F8FAFC' : '#0F172A' },
              ]}>
              Belum Ada Pengumpulan Tugas
            </Text>
            <Text style={styles.emptySubtitle}>
              {isTeacher
                ? selectedBatchFilter !== 'all'
                  ? 'Belum ada pengumpulan tugas pada kelas ini.'
                  : 'Siswa belum mengumpulkan tugas proyek di kelas Anda.'
                : 'Buka tab Silabus dan kumpulkan tugas proyek Anda untuk diperiksa pengajar.'}
            </Text>
          </View>
        ) : (
          filteredSubmissions.map((sub) => {
            const assignment = assignments.find((a) => a.id === sub.assignmentId);
            const grade = grades.find((g) => g.submissionId === sub.id);
            const subBatch = batches.find((b) => b.id === sub.batchId);

            const isGraded = sub.status === 'GRADED';
            const isRevision = sub.status === 'REVISION_REQUIRED';

            return (
              <View
                key={sub.id}
                style={[
                  styles.submissionCard,
                  {
                    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                    borderColor: isGraded
                      ? '#10B981'
                      : isRevision
                      ? '#EF4444'
                      : '#F59E0B',
                  },
                ]}>
                <View style={styles.subHeader}>
                  <View style={styles.studentInfo}>
                    <Ionicons name="person-circle-outline" size={20} color="#2563EB" />
                    <Text
                      style={[
                        styles.studentName,
                        { color: isDark ? '#F8FAFC' : '#0F172A' },
                      ]}>
                      {sub.studentName}
                    </Text>
                    {subBatch && (
                      <View style={styles.subBatchBadge}>
                        <Text style={styles.subBatchBadgeText}>{subBatch.classCode}</Text>
                      </View>
                    )}
                  </View>

                  <View
                    style={[
                      styles.statusPill,
                      {
                        backgroundColor: isGraded
                          ? '#DCFCE7'
                          : isRevision
                          ? '#FEE2E2'
                          : '#FEF3C7',
                      },
                    ]}>
                    <Text
                      style={[
                        styles.statusPillText,
                        {
                          color: isGraded
                            ? '#15803D'
                            : isRevision
                            ? '#B91C1C'
                            : '#D97706',
                        },
                      ]}>
                      {isGraded
                        ? 'TELAH DINILAI'
                        : isRevision
                        ? 'PERLU REVISI'
                        : 'MENUNGGU DIPERIKSA'}
                    </Text>
                  </View>
                </View>

                <Text
                  style={[
                    styles.assignTitle,
                    { color: isDark ? '#F8FAFC' : '#0F172A' },
                  ]}>
                  {assignment?.title || 'Tugas Proyek'}
                </Text>

                {sub.attachmentUrl && (
                  <View style={styles.attachmentBox}>
                    <Ionicons name="link-outline" size={16} color="#2563EB" />
                    <Text style={styles.attachmentText} numberOfLines={1}>
                      {sub.attachmentUrl}
                    </Text>
                  </View>
                )}

                <View style={styles.contentBox}>
                  <Text style={styles.contentLabel}>Jawaban Siswa:</Text>
                  <Text
                    style={[
                      styles.contentText,
                      { color: isDark ? '#CBD5E1' : '#475569' },
                    ]}>
                    {sub.submissionContent}
                  </Text>
                </View>

                {grade && (
                  <View
                    style={[
                      styles.gradeResultBox,
                      {
                        backgroundColor: isDark ? '#0F172A' : '#F1F5F9',
                        borderColor: isDark ? '#334155' : '#E2E8F0',
                      },
                    ]}>
                    <View style={styles.gradeResultHeader}>
                      <Text style={styles.gradeScoreText}>
                        Skor: <Text style={styles.scoreHighlight}>{grade.score}/100</Text>
                      </Text>
                      <Text style={styles.graderNameText}>Oleh: {grade.graderName}</Text>
                    </View>
                    <Text style={styles.feedbackLabel}>Catatan / Feedback:</Text>
                    <Text
                      style={[
                        styles.feedbackText,
                        { color: isDark ? '#CBD5E1' : '#475569' },
                      ]}>
                      {`"${grade.feedbackNotes}"`}
                    </Text>
                  </View>
                )}

                {/* TEACHER ACTION BUTTON */}
                {isTeacher && (
                  <TouchableOpacity
                    onPress={() => handleOpenGradeModal(sub)}
                    style={[
                      styles.gradeActionBtn,
                      { backgroundColor: isGraded ? '#8B5CF6' : '#2563EB' },
                    ]}>
                    <Ionicons
                      name={isGraded ? 'create-outline' : 'checkmark-circle-outline'}
                      size={18}
                      color="#FFFFFF"
                    />
                    <Text style={styles.gradeActionBtnText}>
                      {isGraded ? 'Ubah Nilai & Feedback' : 'Periksa & Beri Nilai'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* TEACHER GRADING MODAL */}
      <Modal
        visible={!!selectedSub}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedSub(null)}>
        <SafeAreaView
          style={[
            styles.modalContainer,
            { backgroundColor: isDark ? '#0F172A' : '#FFFFFF' },
          ]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setSelectedSub(null)}>
              <Ionicons name="close" size={24} color={isDark ? '#F8FAFC' : '#0F172A'} />
            </TouchableOpacity>
            <Text
              style={[
                styles.modalHeaderTitle,
                { color: isDark ? '#F8FAFC' : '#0F172A' },
              ]}>
              Form Penilaian Pengajar
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalScroll}>
            {selectedSub && (
              <>
                <Text
                  style={[
                    styles.studentHeaderLabel,
                    { color: isDark ? '#94A3B8' : '#64748B' },
                  ]}>
                  Siswa: <Text style={{ fontWeight: '800' }}>{selectedSub.studentName}</Text>
                </Text>

                <View style={styles.reviewBox}>
                  <Text style={styles.reviewLabel}>Isi Jawaban Siswa:</Text>
                  <Text style={styles.reviewContent}>
                    {selectedSub.submissionContent}
                  </Text>
                  {selectedSub.attachmentUrl && (
                    <Text style={styles.reviewLink}>
                      Tautan: {selectedSub.attachmentUrl}
                    </Text>
                  )}
                </View>

                <Text
                  style={[
                    styles.inputFieldLabel,
                    { color: isDark ? '#F8FAFC' : '#0F172A' },
                  ]}>
                  Nilai Angka (0 - 100):
                </Text>
                <TextInput
                  value={inputScore}
                  onChangeText={setInputScore}
                  keyboardType="numeric"
                  placeholder="85"
                  placeholderTextColor="#94A3B8"
                  style={[
                    styles.modalInput,
                    {
                      backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                      color: isDark ? '#F8FAFC' : '#0F172A',
                      borderColor: isDark ? '#334155' : '#CBD5E1',
                    },
                  ]}
                />

                <Text
                  style={[
                    styles.inputFieldLabel,
                    { color: isDark ? '#F8FAFC' : '#0F172A' },
                  ]}>
                  Feedback & Evaluasi Tertulis:
                </Text>
                <TextInput
                  value={inputFeedback}
                  onChangeText={setInputFeedback}
                  multiline
                  numberOfLines={4}
                  placeholder="Tuliskan ulasan kualitatif untuk siswa..."
                  placeholderTextColor="#94A3B8"
                  style={[
                    styles.modalInput,
                    styles.modalTextArea,
                    {
                      backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                      color: isDark ? '#F8FAFC' : '#0F172A',
                      borderColor: isDark ? '#334155' : '#CBD5E1',
                    },
                  ]}
                />
              </>
            )}
          </ScrollView>

          <View style={styles.modalFooterRow}>
            <TouchableOpacity
              onPress={() => handleSaveGradePress(true)}
              style={styles.revisionBtn}>
              <Text style={styles.revisionBtnText}>Minta Revisi</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleSaveGradePress(false)}
              style={styles.saveGradeBtn}>
              <Ionicons name="checkmark-done" size={18} color="#FFFFFF" />
              <Text style={styles.saveGradeBtnText}>Simpan Nilai Lulus</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* MODAL PRATINJAU & EKSPOR REKAP NILAI (CSV / EXCEL) */}
      <Modal
        visible={isExportModalOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsExportModalOpen(false)}>
        <SafeAreaView
          style={[
            styles.modalContainer,
            { backgroundColor: isDark ? '#0F172A' : '#FFFFFF' },
          ]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsExportModalOpen(false)}>
              <Ionicons name="close" size={24} color={isDark ? '#F8FAFC' : '#0F172A'} />
            </TouchableOpacity>
            <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: 8 }}>
              <Text
                style={[
                  styles.modalHeaderTitle,
                  { color: isDark ? '#F8FAFC' : '#0F172A' },
                ]}>
                Rekapitulasi Nilai Siswa
              </Text>
              <Text style={styles.modalHeaderSub}>
                Format Kompatibel Microsoft Excel & Google Sheets
              </Text>
            </View>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalScroll} contentContainerStyle={{ paddingBottom: 32 }}>
            {/* Filter by Batch in Modal */}
            <Text style={[styles.exportFilterLabel, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
              PILIH KELAS UNTUK DIREKAP:
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, marginBottom: 14 }}>
              <TouchableOpacity
                onPress={() => setExportBatchFilter('all')}
                style={[
                  styles.exportFilterChip,
                  {
                    backgroundColor:
                      exportBatchFilter === 'all'
                        ? '#8B5CF6'
                        : isDark
                        ? '#1E293B'
                        : '#F1F5F9',
                    borderColor:
                      exportBatchFilter === 'all'
                        ? '#7C3AED'
                        : isDark
                        ? '#334155'
                        : '#CBD5E1',
                  },
                ]}>
                <Text
                  style={[
                    styles.exportFilterChipText,
                    {
                      color:
                        exportBatchFilter === 'all'
                          ? '#FFFFFF'
                          : isDark
                          ? '#CBD5E1'
                          : '#475569',
                      fontWeight: exportBatchFilter === 'all' ? '700' : '500',
                    },
                  ]}>
                  Semua Kelas ({batches.filter((b) => b.instructorId === currentUser.id).length})
                </Text>
              </TouchableOpacity>

              {teacherBatches.map((b) => {
                const isSelected = exportBatchFilter === b.id;
                return (
                  <TouchableOpacity
                    key={b.id}
                    onPress={() => setExportBatchFilter(b.id)}
                    style={[
                      styles.exportFilterChip,
                      {
                        backgroundColor: isSelected
                          ? '#8B5CF6'
                          : isDark
                          ? '#1E293B'
                          : '#F1F5F9',
                        borderColor: isSelected
                          ? '#7C3AED'
                          : isDark
                          ? '#334155'
                          : '#CBD5E1',
                      },
                    ]}>
                    <Text
                      style={[
                        styles.exportFilterChipText,
                        {
                          color: isSelected
                            ? '#FFFFFF'
                            : isDark
                            ? '#CBD5E1'
                            : '#475569',
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}>
                      {b.classCode} • {b.batchName}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Summary Statistics Card */}
            <View
              style={[
                styles.summaryStatsGrid,
                {
                  backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                  borderColor: isDark ? '#334155' : '#E2E8F0',
                },
              ]}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Total Siswa</Text>
                <Text style={[styles.statValue, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
                  {gradebookSummary.totalStudents}
                </Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Rata-rata Nilai</Text>
                <Text style={[styles.statValue, { color: '#8B5CF6' }]}>
                  {gradebookSummary.averageScore}
                </Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Siswa Lulus</Text>
                <Text style={[styles.statValue, { color: '#10B981' }]}>
                  {gradebookSummary.passedCount}
                </Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Kelulusan</Text>
                <Text style={[styles.statValue, { color: '#2563EB' }]}>
                  {gradebookSummary.completionRate}%
                </Text>
              </View>
            </View>

            {/* Table Preview Title */}
            <View style={styles.tableTitleRow}>
              <Text
                style={[
                  styles.tableSectionTitle,
                  { color: isDark ? '#F8FAFC' : '#0F172A' },
                ]}>
                Pratinjau Data Rekap Nilai ({gradebookRows.length} Siswa)
              </Text>
              <Text style={styles.tableScrollHint}>Geser ke samping ➔</Text>
            </View>

            {/* Scrollable Table Preview */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={true}
              style={[
                styles.tableWrapper,
                {
                  backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                  borderColor: isDark ? '#334155' : '#E2E8F0',
                },
              ]}>
              <View>
                {/* Table Header Row */}
                <View
                  style={[
                    styles.tableRow,
                    styles.tableHeaderRow,
                    {
                      backgroundColor: isDark ? '#0F172A' : '#F1F5F9',
                      borderBottomColor: isDark ? '#334155' : '#E2E8F0',
                    },
                  ]}>
                  <Text style={[styles.thCell, { width: 36 }]}>No</Text>
                  <Text style={[styles.thCell, { width: 140 }]}>Nama Siswa</Text>
                  <Text style={[styles.thCell, { width: 80 }]}>Kelas</Text>
                  <Text style={[styles.thCell, { width: 70, textAlign: 'center' }]}>Materi</Text>
                  <Text style={[styles.thCell, { width: 70, textAlign: 'center' }]}>Kuis</Text>
                  <Text style={[styles.thCell, { width: 70, textAlign: 'center' }]}>Tugas</Text>
                  <Text style={[styles.thCell, { width: 80, textAlign: 'center' }]}>Nilai Akhir</Text>
                  <Text style={[styles.thCell, { width: 100, textAlign: 'center' }]}>Status</Text>
                </View>

                {/* Table Body Rows */}
                {gradebookRows.length === 0 ? (
                  <View style={{ padding: 20, alignItems: 'center' }}>
                    <Text style={{ color: '#94A3B8', fontSize: 13 }}>
                      Belum ada siswa terdaftar pada kelas yang dipilih.
                    </Text>
                  </View>
                ) : (
                  gradebookRows.map((r, idx) => (
                    <View
                      key={`${r.batchId}-${r.studentId}-${idx}`}
                      style={[
                        styles.tableRow,
                        {
                          borderBottomColor: isDark ? '#334155' : '#F1F5F9',
                          backgroundColor:
                            idx % 2 === 0
                              ? 'transparent'
                              : isDark
                              ? 'rgba(255,255,255,0.02)'
                              : '#FAFAFA',
                        },
                      ]}>
                      <Text style={[styles.tdCell, { width: 36, color: '#94A3B8' }]}>
                        {r.no}
                      </Text>
                      <View style={{ width: 140 }}>
                        <Text
                          style={[
                            styles.tdCellBold,
                            { color: isDark ? '#F8FAFC' : '#0F172A' },
                          ]}
                          numberOfLines={1}>
                          {r.studentName}
                        </Text>
                        <Text style={styles.tdCellSub} numberOfLines={1}>
                          {r.studentEmail}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.tdCell,
                          { width: 80, color: '#8B5CF6', fontWeight: '700' },
                        ]}>
                        {r.classCode}
                      </Text>
                      <Text
                        style={[
                          styles.tdCell,
                          { width: 70, textAlign: 'center', color: '#2563EB' },
                        ]}>
                        {r.progressPercentage}%
                      </Text>
                      <Text
                        style={[
                          styles.tdCell,
                          { width: 70, textAlign: 'center', color: isDark ? '#CBD5E1' : '#334155' },
                        ]}>
                        {r.quizAverage}
                      </Text>
                      <Text
                        style={[
                          styles.tdCell,
                          { width: 70, textAlign: 'center', color: isDark ? '#CBD5E1' : '#334155' },
                        ]}>
                        {r.assignmentScore}
                      </Text>
                      <Text
                        style={[
                          styles.tdCellBold,
                          {
                            width: 80,
                            textAlign: 'center',
                            color: r.finalScore >= 80 ? '#10B981' : '#F59E0B',
                          },
                        ]}>
                        {r.finalScore}
                      </Text>
                      <View style={{ width: 100, alignItems: 'center' }}>
                        <View
                          style={[
                            styles.tableStatusBadge,
                            {
                              backgroundColor:
                                r.graduationStatus === 'LULUS'
                                  ? '#DCFCE7'
                                  : r.graduationStatus === 'DALAM PROSES'
                                  ? '#FEF3C7'
                                  : '#F1F5F9',
                            },
                          ]}>
                          <Text
                            style={[
                              styles.tableStatusBadgeText,
                              {
                                color:
                                  r.graduationStatus === 'LULUS'
                                    ? '#15803D'
                                    : r.graduationStatus === 'DALAM PROSES'
                                    ? '#B45309'
                                    : '#64748B',
                              },
                            ]}>
                            {r.graduationStatus}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))
                )}
              </View>
            </ScrollView>

            <View style={styles.excelNoticeCard}>
              <Ionicons name="information-circle" size={18} color="#2563EB" />
              <Text style={styles.excelNoticeText}>
                Berkas CSV disandikan dengan UTF-8 BOM, sehingga otomatis terbaca rapi oleh Microsoft Excel, Apple Numbers, dan Google Spreadsheet tanpa perlu konfigurasi pemisah kolom tambahan.
              </Text>
            </View>
          </ScrollView>

          {/* Modal Footer */}
          <View
            style={[
              styles.exportModalFooter,
              {
                backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                borderTopColor: isDark ? '#1E293B' : '#E2E8F0',
              },
            ]}>
            <TouchableOpacity
              onPress={handleCopyCSV}
              style={[
                styles.copyCSVBtn,
                {
                  backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
                  borderColor: isDark ? '#334155' : '#CBD5E1',
                },
              ]}>
              <Ionicons
                name={isCopiedCSV ? 'checkmark' : 'copy-outline'}
                size={16}
                color={isCopiedCSV ? '#10B981' : '#64748B'}
              />
              <Text
                style={[
                  styles.copyCSVBtnText,
                  isCopiedCSV && { color: '#10B981' },
                ]}>
                {isCopiedCSV ? 'Tersalin!' : 'Salin CSV'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDownloadCSV}
              style={styles.downloadCSVBtn}>
              <Ionicons name="cloud-download" size={18} color="#FFFFFF" />
              <Text style={styles.downloadCSVBtnText}>Unduh Berkas CSV (Excel)</Text>
            </TouchableOpacity>
          </View>
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
  headerTitleContainer: {
    marginBottom: 16,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  screenSubtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  filterChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
    paddingBottom: 4,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12,
  },
  subBatchBadge: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
  },
  subBatchBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#7C3AED',
  },
  emptyCard: {
    borderRadius: 16,
    padding: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 12,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  submissionCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    marginBottom: 16,
  },
  subHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  studentName: {
    fontSize: 14,
    fontWeight: '700',
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  assignTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 8,
  },
  attachmentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  attachmentText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '600',
    flex: 1,
  },
  contentBox: {
    marginBottom: 10,
  },
  contentLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 2,
  },
  contentText: {
    fontSize: 13,
    lineHeight: 18,
  },
  gradeResultBox: {
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  gradeResultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  gradeScoreText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#10B981',
  },
  scoreHighlight: {
    fontSize: 16,
    fontWeight: '800',
  },
  graderNameText: {
    fontSize: 11,
    color: '#64748B',
  },
  feedbackLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 2,
  },
  feedbackText: {
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  gradeActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  gradeActionBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  // MODAL STYLES
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalScroll: {
    flex: 1,
    padding: 16,
  },
  studentHeaderLabel: {
    fontSize: 14,
    marginBottom: 12,
  },
  reviewBox: {
    backgroundColor: '#F1F5F9',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  reviewLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 4,
  },
  reviewContent: {
    fontSize: 13,
    color: '#0F172A',
    lineHeight: 18,
    marginBottom: 6,
  },
  reviewLink: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '600',
  },
  inputFieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 14,
  },
  modalTextArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  modalFooterRow: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 12,
  },
  revisionBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#EF4444',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  revisionBtnText: {
    color: '#EF4444',
    fontWeight: '700',
    fontSize: 13,
  },
  saveGradeBtn: {
    flex: 2,
    backgroundColor: '#10B981',
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  saveGradeBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  exportActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  exportActionLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  exportIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exportCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  exportCardSub: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
  },
  openExportModalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
  },
  openExportModalBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  modalHeaderSub: {
    fontSize: 11,
    color: '#8B5CF6',
    fontWeight: '600',
    marginTop: 2,
  },
  exportFilterLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  exportFilterChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  exportFilterChipActive: {
    elevation: 2,
  },
  exportFilterChipText: {
    fontSize: 12,
  },
  summaryStatsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },
  tableTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tableSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  tableScrollHint: {
    fontSize: 11,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  tableWrapper: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  tableHeaderRow: {
    paddingVertical: 10,
  },
  thCell: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  tdCell: {
    fontSize: 12,
    color: '#334155',
  },
  tdCellBold: {
    fontSize: 12,
    fontWeight: '700',
  },
  tdCellSub: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1,
  },
  tableStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tableStatusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  excelNoticeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 10,
    gap: 8,
    marginTop: 4,
  },
  excelNoticeText: {
    fontSize: 11,
    color: '#1E40AF',
    lineHeight: 16,
    flex: 1,
  },
  exportModalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
  },
  copyCSVBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
  },
  copyCSVBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  downloadCSVBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 10,
  },
  downloadCSVBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
