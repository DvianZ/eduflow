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
import { useTranslation } from '@/i18n';

export default function GradingScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { t, language } = useTranslation();

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
        'Download Successful',
        `File "${filename}" has been saved to your downloads.`
      );
    } else {
      copyCSVToClipboard(csvString);
      Alert.alert(
        'CSV Copied to Clipboard',
        'Gradebook CSV data has been copied to clipboard and is ready to paste into Excel or Google Sheets.'
      );
    }
  };

  const handleCopyCSV = async () => {
    const activeBatch = batches.find((b) => b.id === exportBatchFilter);
    const className = activeBatch
      ? `${activeBatch.classCode} - ${activeBatch.batchName}`
      : 'All Classes';
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
      setInputFeedback('Great work! Clean architectural structure and well-managed state.');
    }
    setSelectedSub(sub);
  };

  const handleSaveGradePress = (isRevision: boolean) => {
    if (!selectedSub) return;
    const scoreNum = parseInt(inputScore, 10);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
      Alert.alert('Invalid Score', 'Please enter a numeric score between 0 and 100.');
      return;
    }

    gradeSubmission(
      selectedSub.id,
      scoreNum,
      inputFeedback.trim() || 'Evaluation completed.',
      isRevision
    );

    Alert.alert(
      isRevision ? 'Revision Requested' : 'Grade Successfully Saved',
      isRevision
        ? 'The student has been notified to revise their deliverable.'
        : `Score ${scoreNum}/100 and feedback delivered to student.`
    );
    setSelectedSub(null);
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
        <View
          style={[
            styles.heroHeaderCard,
            {
              backgroundColor: isTeacher ? '#4F46E5' : '#2563EB',
              borderColor: isTeacher ? '#4338CA' : '#1D4ED8',
              borderBottomColor: isTeacher ? '#312E81' : '#1E40AF',
            },
          ]}>
          <View style={styles.heroHeaderContent}>
            <View style={styles.heroIconBadge}>
              <Ionicons
                name={isTeacher ? 'school' : 'ribbon'}
                size={22}
                color="#FFFFFF"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroHeaderTitle}>
                {isTeacher ? t.assignment.gradingQueueTitle : (language === 'en' ? 'Project Deliverables & Feedback' : 'Status Tugas & Feedback')}
              </Text>
              <Text style={styles.heroHeaderSubtitle}>
                {isTeacher
                  ? t.assignment.gradingQueueSubtitle
                  : (language === 'en' ? 'Track your deliverable scores and review mentor feedback' : 'Pantau nilai resmi dan ulasan perbaikan dari mentor Anda')}
              </Text>
            </View>
          </View>
        </View>

        {/* Teacher Gradebook Export Action Card */}
        {isTeacher && (
          <View
            style={[
              styles.exportActionCard,
              {
                backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                borderColor: isDark ? '#334155' : '#E2E8F0',
                borderBottomColor: isDark ? '#0F172A' : '#CBD5E1',
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
                  {language === 'en' ? 'Cohort Gradebook Export' : 'Rekapitulasi Nilai Siswa'}
                </Text>
                <Text style={styles.exportCardSub}>
                  {language === 'en' ? 'Export quiz evaluations, project deliverables, and graduation status to CSV/Excel' : 'Ekspor rekap nilai kuis, tugas proyek & status kelulusan ke CSV/Excel'}
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
              <Text style={styles.openExportModalBtnText}>{t.assignment.exportCsvBtn}</Text>
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
                      : '#FFFFFF',
                  borderColor:
                    selectedBatchFilter === 'all'
                      ? '#7C3AED'
                      : isDark
                      ? '#334155'
                      : '#E2E8F0',
                  borderBottomColor:
                    selectedBatchFilter === 'all'
                      ? '#6D28D9'
                      : isDark
                      ? '#0F172A'
                      : '#CBD5E1',
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
                        : '#FFFFFF',
                      borderColor: isSelected
                        ? '#7C3AED'
                        : isDark
                        ? '#334155'
                        : '#E2E8F0',
                      borderBottomColor: isSelected
                        ? '#6D28D9'
                        : isDark
                        ? '#0F172A'
                        : '#CBD5E1',
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
              No Submissions Found
            </Text>
            <Text style={styles.emptySubtitle}>
              {isTeacher
                ? selectedBatchFilter !== 'all'
                  ? 'No student submissions recorded for this cohort.'
                  : 'No student project submissions waiting in your queue.'
                : 'Navigate to the Syllabus tab and submit your project assignment for instructor evaluation.'}
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
                    borderBottomColor: isGraded
                      ? '#047857'
                      : isRevision
                      ? '#B91C1C'
                      : '#D97706',
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
                      isGraded
                        ? {
                            backgroundColor: '#8B5CF6',
                            borderColor: '#7C3AED',
                            borderBottomColor: '#6D28D9',
                          }
                        : {
                            backgroundColor: '#2563EB',
                            borderColor: '#1D4ED8',
                            borderBottomColor: '#1E40AF',
                          },
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
              Instructor Evaluation Form
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
                  Student: <Text style={{ fontWeight: '800' }}>{selectedSub.studentName}</Text>
                </Text>

                <View style={styles.reviewBox}>
                  <Text style={styles.reviewLabel}>Student Submission Content:</Text>
                  <Text style={styles.reviewContent}>
                    {selectedSub.submissionContent}
                  </Text>
                  {selectedSub.attachmentUrl && (
                    <Text style={styles.reviewLink}>
                      Deliverable Link: {selectedSub.attachmentUrl}
                    </Text>
                  )}
                </View>

                <Text
                  style={[
                    styles.inputFieldLabel,
                    { color: isDark ? '#F8FAFC' : '#0F172A' },
                  ]}>
                  Numeric Score (0 - 100):
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
                  Instructor Feedback & Qualitative Remarks:
                </Text>
                <TextInput
                  value={inputFeedback}
                  onChangeText={setInputFeedback}
                  multiline
                  numberOfLines={4}
                  placeholder="Write constructive qualitative remarks for the student..."
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
              <Text style={styles.revisionBtnText}>Request Revision</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleSaveGradePress(false)}
              style={styles.saveGradeBtn}>
              <Ionicons name="checkmark-done" size={18} color="#FFFFFF" />
              <Text style={styles.saveGradeBtnText}>Save Passing Grade</Text>
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
                      No students enrolled in the selected cohort yet.
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
                                r.graduationStatus === 'GRADUATED'
                                  ? '#DCFCE7'
                                  : r.graduationStatus === 'IN PROGRESS'
                                  ? '#FEF3C7'
                                  : '#F1F5F9',
                            },
                          ]}>
                          <Text
                            style={[
                              styles.tableStatusBadgeText,
                              {
                                color:
                                  r.graduationStatus === 'GRADUATED'
                                    ? '#15803D'
                                    : r.graduationStatus === 'IN PROGRESS'
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
  heroHeaderCard: {
    borderRadius: 26,
    borderWidth: 2,
    borderBottomWidth: 6,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  heroHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  heroIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  heroHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
    marginBottom: 3,
  },
  heroHeaderSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 16,
    fontWeight: '500',
  },
  filterChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
    paddingBottom: 4,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1.5,
    borderBottomWidth: 4,
    minHeight: 38,
    justifyContent: 'center',
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
    borderRadius: 24,
    padding: 32,
    borderWidth: 2,
    borderBottomWidth: 5,
    borderBottomColor: '#CBD5E1',
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
    borderRadius: 24,
    padding: 18,
    borderWidth: 2,
    borderBottomWidth: 5,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  subHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  studentName: {
    fontSize: 14,
    fontWeight: '800',
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  assignTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10,
  },
  attachmentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
  },
  attachmentText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '600',
    flex: 1,
  },
  contentBox: {
    marginBottom: 12,
  },
  contentLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
  },
  contentText: {
    fontSize: 13,
    lineHeight: 19,
  },
  gradeResultBox: {
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    marginBottom: 14,
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
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderBottomWidth: 5,
    minHeight: 48,
    gap: 8,
  },
  gradeActionBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
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
    fontWeight: '800',
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
    padding: 14,
    borderRadius: 14,
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
    fontWeight: '800',
    marginBottom: 6,
  },
  modalInput: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 14,
  },
  modalTextArea: {
    height: 95,
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
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#F87171',
    borderBottomColor: '#DC2626',
    borderBottomWidth: 4,
    paddingVertical: 12,
    borderRadius: 14,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  revisionBtnText: {
    color: '#DC2626',
    fontWeight: '800',
    fontSize: 13,
  },
  saveGradeBtn: {
    flex: 2,
    backgroundColor: '#10B981',
    borderColor: '#059669',
    borderWidth: 1.5,
    borderBottomColor: '#047857',
    borderBottomWidth: 4,
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 14,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  saveGradeBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  exportActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 24,
    borderWidth: 2,
    borderBottomWidth: 5,
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
    gap: 12,
  },
  exportIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exportCardTitle: {
    fontSize: 15,
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
    borderColor: '#059669',
    borderWidth: 1.5,
    borderBottomColor: '#047857',
    borderBottomWidth: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    minHeight: 42,
  },
  openExportModalBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
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
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderBottomWidth: 3.5,
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
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderBottomWidth: 4,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '700',
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
    fontWeight: '700',
  },
  tableWrapper: {
    borderRadius: 18,
    borderWidth: 1.5,
    borderBottomWidth: 4,
    borderBottomColor: '#CBD5E1',
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
    borderRadius: 12,
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderBottomColor: '#94A3B8',
    borderBottomWidth: 4,
    minHeight: 48,
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
    borderColor: '#059669',
    borderWidth: 1.5,
    borderBottomColor: '#047857',
    borderBottomWidth: 4,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    minHeight: 48,
  },
  downloadCSVBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
