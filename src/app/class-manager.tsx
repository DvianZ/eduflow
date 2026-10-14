import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useColorScheme,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useElearningStore } from '@/store/useElearningStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Batch } from '@/types/elearning';
import { useTranslation } from '@/i18n';

type CourseLevel = 'beginner' | 'intermediate' | 'advanced';

export default function ClassManagerScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const { t } = useTranslation();

  const {
    createBatch,
    updateBatch,
    currentUser,
    batches,
    courses,
    enrollments,
    selectBatch,
  } = useElearningStore();
  const registeredUsers = useAuthStore((state) => state.registeredUsers);

  const [activeTab, setActiveTab] = useState<'create' | 'myClasses'>('myClasses');

  // Create form state
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDesc, setCourseDesc] = useState('');
  const [courseCategory, setCourseCategory] = useState('');
  const [courseLevel, setCourseLevel] = useState<CourseLevel>('beginner');
  const [batchName, setBatchName] = useState('');
  const [maxStudents, setMaxStudents] = useState('30');
  const [createdCode, setCreatedCode] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [expandedRosterBatchId, setExpandedRosterBatchId] = useState<string | null>(null);
  const [successCreatedBatch, setSuccessCreatedBatch] = useState<{
    title: string;
    code: string;
    batchId: string;
  } | null>(null);

  // Edit & Lifecycle Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [editBatchName, setEditBatchName] = useState('');
  const [editMaxStudents, setEditMaxStudents] = useState('30');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editStatus, setEditStatus] = useState<'active' | 'upcoming' | 'completed'>('active');

  const teacherBatches = batches.filter(
    (b) => b.instructorId === currentUser.id
  );

  const handleCopyCode = async (code: string) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(code);
      }
    } catch {
      // fallback
    }
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleOpenEditBatch = (batch: Batch) => {
    setEditingBatch(batch);
    setEditBatchName(batch.batchName);
    setEditMaxStudents(batch.maxStudents.toString());
    setEditStartDate(batch.startDate);
    setEditEndDate(batch.endDate);
    setEditStatus(batch.status);
    setIsEditModalOpen(true);
  };

  const handleSaveBatchChanges = () => {
    if (!editingBatch) return;
    if (!editBatchName.trim()) {
      Alert.alert('Perhatian', 'Nama batch tidak boleh kosong.');
      return;
    }
    const maxStd = parseInt(editMaxStudents, 10) || 30;
    updateBatch(editingBatch.id, {
      batchName: editBatchName.trim(),
      maxStudents: maxStd,
      startDate: editStartDate.trim() || editingBatch.startDate,
      endDate: editEndDate.trim() || editingBatch.endDate,
      status: editStatus,
    });
    setIsEditModalOpen(false);
    Alert.alert('Sukses', 'Informasi kelas berhasil diperbarui!');
  };

  const handleQuickToggleBatchStatus = (batch: Batch) => {
    if (batch.status === 'active') {
      Alert.alert(
        'Tutup Kelas Ini?',
        `Apakah Anda yakin ingin menutup kelas "${batch.batchName}"? Status akan berubah menjadi Selesai dan pendaftaran siswa baru menggunakan kode "${batch.classCode}" akan dinonaktifkan.`,
        [
          { text: 'Batal', style: 'cancel' },
          {
            text: 'Tutup Kelas',
            style: 'destructive',
            onPress: () => {
              updateBatch(batch.id, { status: 'completed' });
              Alert.alert('Kelas Ditutup', `Kelas "${batch.batchName}" telah ditandai Selesai.`);
            },
          },
        ]
      );
    } else {
      Alert.alert(
        'Aktifkan Kembali Kelas?',
        `Buka kembali pendaftaran untuk kelas "${batch.batchName}"? Status kelas akan menjadi Aktif kembali.`,
        [
          { text: 'Batal', style: 'cancel' },
          {
            text: 'Aktifkan',
            onPress: () => {
              updateBatch(batch.id, { status: 'active' });
              Alert.alert('Kelas Aktif', `Kelas "${batch.batchName}" kini berstatus Aktif.`);
            },
          },
        ]
      );
    }
  };

  const handleCreate = () => {
    if (!courseTitle.trim() || !batchName.trim()) {
      Alert.alert('Form Belum Lengkap', 'Judul course dan nama batch wajib diisi.');
      return;
    }

    const today = new Date();
    const endDate = new Date(today);
    endDate.setMonth(endDate.getMonth() + 2);

    const result = createBatch(
      courseTitle.trim(),
      courseDesc.trim() || `Kelas ${courseTitle.trim()} oleh ${currentUser.fullName}`,
      courseCategory.trim() || 'General',
      courseLevel,
      batchName.trim(),
      today.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0],
      parseInt(maxStudents) || 30
    );

    setCreatedCode(result.classCode);
    setSuccessCreatedBatch({
      title: courseTitle.trim(),
      code: result.classCode,
      batchId: result.batch.id,
    });
    setCourseTitle('');
    setCourseDesc('');
    setCourseCategory('');
    setBatchName('');
    setMaxStudents('30');
    setActiveTab('myClasses');
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const bg = isDark ? '#090D16' : '#F8FAFC';
  const cardBg = isDark ? '#1E293B' : '#FFFFFF';
  const textPrimary = isDark ? '#F8FAFC' : '#0F172A';
  const textSecondary = isDark ? '#94A3B8' : '#64748B';
  const inputBg = isDark ? '#0F172A' : '#F1F5F9';
  const inputBorder = isDark ? '#334155' : '#CBD5E1';

  const levelLabels: Record<CourseLevel, { label: string; color: string; bg: string }> = {
    beginner: { label: 'Pemula', color: '#15803D', bg: '#DCFCE7' },
    intermediate: { label: 'Menengah', color: '#D97706', bg: '#FEF3C7' },
    advanced: { label: 'Lanjutan', color: '#DC2626', bg: '#FEE2E2' },
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bg }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}>
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
              borderBottomColor: isDark ? '#1E293B' : '#E2E8F0',
            },
          ]}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color={textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerTextCol}>
            <Text style={[styles.headerTitle, { color: textPrimary }]}>
              {t.classManager.headerTitle}
            </Text>
            <Text style={[styles.headerSubtitle, { color: textSecondary }]}>
              {t.classManager.headerSubtitle}
            </Text>
          </View>
        </View>

        {/* Tab Switcher */}
        <View
          style={[
            styles.tabContainer,
            { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' },
          ]}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'myClasses' && styles.tabActive,
            ]}
            onPress={() => setActiveTab('myClasses')}>
            <Ionicons
              name="list-outline"
              size={16}
              color={activeTab === 'myClasses' ? '#FFFFFF' : textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                {
                  color: activeTab === 'myClasses' ? '#FFFFFF' : textSecondary,
                },
              ]}>
              {t.classManager.tabMyClasses} ({teacherBatches.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'create' && styles.tabActiveCreate,
            ]}
            onPress={() => setActiveTab('create')}>
            <Ionicons
              name="add-circle-outline"
              size={16}
              color={activeTab === 'create' ? '#FFFFFF' : textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                {
                  color: activeTab === 'create' ? '#FFFFFF' : textSecondary,
                },
              ]}>
              {t.classManager.tabCreateClass}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {activeTab === 'myClasses' ? (
            <>
              {/* Success Notification Banner after creating class */}
              {successCreatedBatch && (
                <View
                  style={[
                    styles.successBannerCard,
                    {
                      backgroundColor: isDark ? '#064E3B' : '#ECFDF5',
                      borderColor: '#10B981',
                    },
                  ]}>
                  <View style={styles.successBannerHeader}>
                    <Ionicons name="sparkles" size={20} color="#10B981" />
                    <Text style={styles.successBannerTitle}>
                      Kelas Berhasil Dibuat! 🎉
                    </Text>
                  </View>
                  <Text style={[styles.successBannerText, { color: isDark ? '#D1FAE5' : '#065F46' }]}>
                    Kelas <Text style={{ fontWeight: '700' }}>{successCreatedBatch.title}</Text> telah aktif. Bagikan kode di bawah ke siswa Anda:
                  </Text>
                  <View style={styles.successCodeRow}>
                    <Text style={styles.successCodeText}>{successCreatedBatch.code}</Text>
                    <TouchableOpacity
                      onPress={() => handleCopyCode(successCreatedBatch.code)}
                      style={[
                        styles.successCopyBtn,
                        {
                          backgroundColor:
                            copiedCode === successCreatedBatch.code ? '#059669' : '#10B981',
                        },
                      ]}>
                      <Ionicons
                        name={
                          copiedCode === successCreatedBatch.code
                            ? 'checkmark'
                            : 'copy-outline'
                        }
                        size={15}
                        color="#FFFFFF"
                      />
                      <Text style={styles.successCopyBtnText}>
                        {copiedCode === successCreatedBatch.code ? 'Tersalin!' : 'Salin Kode'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {teacherBatches.length === 0 ? (
                <View
                  style={[
                    styles.emptyState,
                    { backgroundColor: cardBg },
                  ]}>
                  <View style={styles.emptyIconCircle}>
                    <Ionicons name="school-outline" size={40} color="#8B5CF6" />
                  </View>
                  <Text style={[styles.emptyTitle, { color: textPrimary }]}>
                    Belum Ada Kelas
                  </Text>
                  <Text style={[styles.emptyDesc, { color: textSecondary }]}>
                    Buat kelas pertama Anda dan bagikan kode kelas ke siswa.
                  </Text>
                  <TouchableOpacity
                    style={styles.emptyBtn}
                    onPress={() => setActiveTab('create')}>
                    <Ionicons name="add" size={18} color="#FFFFFF" />
                    <Text style={styles.emptyBtnText}>Buat Kelas</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                teacherBatches.map((batch) => {
                  const course = courses.find((c) => c.id === batch.courseId);
                  const batchEnrollments = enrollments.filter(
                    (e) => e.batchId === batch.id
                  );
                  const enrolledCount = batchEnrollments.length;
                  const isRosterExpanded = expandedRosterBatchId === batch.id;
                  const isCopied = copiedCode === batch.classCode;

                  return (
                    <View
                      key={batch.id}
                      style={[
                        styles.classCard,
                        {
                          backgroundColor: cardBg,
                          borderColor: isDark ? '#334155' : '#E2E8F0',
                        },
                      ]}>
                      {/* Class Header */}
                      <View style={styles.classCardHeader}>
                        <View
                          style={[
                            styles.classCodeBadge,
                            { backgroundColor: isDark ? '#2D1B69' : '#EDE9FE' },
                          ]}>
                          <Text style={styles.classCodeText}>
                            {batch.classCode}
                          </Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <View
                            style={[
                              styles.statusBadge,
                              {
                                backgroundColor:
                                  batch.status === 'active'
                                    ? '#DCFCE7'
                                    : batch.status === 'completed'
                                    ? '#DBEAFE'
                                    : '#FEF3C7',
                              },
                            ]}>
                            <Text
                              style={[
                                styles.statusBadgeText,
                                {
                                  color:
                                    batch.status === 'active'
                                      ? '#15803D'
                                      : batch.status === 'completed'
                                      ? '#1D4ED8'
                                      : '#92400E',
                                },
                              ]}>
                              {batch.status === 'active'
                                ? 'Aktif'
                                : batch.status === 'completed'
                                ? 'Selesai'
                                : 'Mendatang'}
                            </Text>
                          </View>

                          <TouchableOpacity
                            onPress={() => handleOpenEditBatch(batch)}
                            style={[
                              styles.cardEditMiniBtn,
                              {
                                backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
                                borderColor: isDark ? '#334155' : '#E2E8F0',
                              },
                            ]}
                            accessibilityLabel="Pengaturan Kelas">
                            <Ionicons name="settings-outline" size={15} color="#8B5CF6" />
                          </TouchableOpacity>
                        </View>
                      </View>

                      <Text
                        style={[
                          styles.classTitle,
                          { color: textPrimary },
                        ]}>
                        {course?.title || batch.batchName}
                      </Text>
                      <Text style={[styles.classBatchName, { color: textSecondary }]}>
                        {batch.batchName}
                      </Text>

                      {/* Metrics Row */}
                      <View style={styles.classMetrics}>
                        <View style={styles.classMetricItem}>
                          <Ionicons name="people-outline" size={16} color="#8B5CF6" />
                          <Text style={[styles.classMetricText, { color: textSecondary }]}>
                            {enrolledCount}/{batch.maxStudents} Siswa
                          </Text>
                        </View>
                        <View style={styles.classMetricItem}>
                          <Ionicons name="calendar-outline" size={16} color="#8B5CF6" />
                          <Text style={[styles.classMetricText, { color: textSecondary }]}>
                            {batch.startDate} — {batch.endDate}
                          </Text>
                        </View>
                      </View>

                      {/* 1-Click Copy Code Box */}
                      <TouchableOpacity
                        onPress={() => handleCopyCode(batch.classCode)}
                        activeOpacity={0.8}
                        style={[
                          styles.shareCodeBox,
                          {
                            backgroundColor: isCopied
                              ? isDark ? '#064E3B' : '#DCFCE7'
                              : isDark ? '#0F172A' : '#F8F7FF',
                            borderColor: isCopied ? '#10B981' : '#DDD6FE',
                            borderWidth: 1,
                          },
                        ]}>
                        <Ionicons
                          name={isCopied ? 'checkmark-circle' : 'key-outline'}
                          size={18}
                          color={isCopied ? '#10B981' : '#8B5CF6'}
                        />
                        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={[styles.shareCodeLabel, { color: textSecondary }]}>
                            Kode Kelas:
                          </Text>
                          <Text
                            style={[
                              styles.shareCodeValue,
                              { color: isCopied ? '#10B981' : '#8B5CF6' },
                            ]}>
                            {batch.classCode}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.copyButtonPill,
                            { backgroundColor: isCopied ? '#10B981' : '#8B5CF6' },
                          ]}>
                          <Ionicons
                            name={isCopied ? 'checkmark' : 'copy-outline'}
                            size={12}
                            color="#FFFFFF"
                          />
                          <Text style={styles.copyButtonPillText}>
                            {isCopied ? 'Tersalin!' : 'Salin Kode'}
                          </Text>
                        </View>
                      </TouchableOpacity>

                      {/* Action Row: Roster, Edit & Open Syllabus */}
                      <View style={styles.batchActionRow}>
                        <TouchableOpacity
                          onPress={() =>
                            setExpandedRosterBatchId(
                              isRosterExpanded ? null : batch.id
                            )
                          }
                          style={[
                            styles.rosterToggleBtn,
                            {
                              backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
                              borderColor: isDark ? '#334155' : '#E2E8F0',
                            },
                          ]}>
                          <Ionicons name="people" size={15} color="#6366F1" />
                          <Text style={[styles.rosterToggleText, { color: textPrimary }]}>
                            Peserta ({enrolledCount})
                          </Text>
                          <Ionicons
                            name={isRosterExpanded ? 'chevron-up' : 'chevron-down'}
                            size={14}
                            color={textSecondary}
                          />
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => handleOpenEditBatch(batch)}
                          style={[
                            styles.actionEditBtn,
                            {
                              backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
                              borderColor: isDark ? '#334155' : '#CBD5E1',
                            },
                          ]}>
                          <Ionicons name="create-outline" size={14} color="#8B5CF6" />
                          <Text style={[styles.actionEditBtnText, { color: textPrimary }]}>
                            Edit
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => {
                            selectBatch(batch.id);
                            router.push('/(tabs)/syllabus');
                          }}
                          style={styles.openSyllabusBtn}>
                          <Ionicons name="book-outline" size={14} color="#FFFFFF" />
                          <Text style={styles.openSyllabusBtnText}>Silabus</Text>
                        </TouchableOpacity>
                      </View>

                      {/* Quick Lifecycle Status Banner / Button */}
                      <TouchableOpacity
                        onPress={() => handleQuickToggleBatchStatus(batch)}
                        style={[
                          styles.lifecycleQuickBtn,
                          {
                            backgroundColor:
                              batch.status === 'active'
                                ? isDark ? '#451A03' : '#FFFBEB'
                                : isDark ? '#064E3B' : '#ECFDF5',
                            borderColor:
                              batch.status === 'active' ? '#F59E0B' : '#10B981',
                          },
                        ]}>
                        <Ionicons
                          name={
                            batch.status === 'active'
                              ? 'lock-closed-outline'
                              : 'checkmark-circle-outline'
                          }
                          size={15}
                          color={batch.status === 'active' ? '#D97706' : '#059669'}
                        />
                        <Text
                          style={[
                            styles.lifecycleQuickBtnText,
                            {
                              color:
                                batch.status === 'active' ? '#B45309' : '#047857',
                            },
                          ]}>
                          {batch.status === 'active'
                            ? 'Kelas Berjalan • Ketuk untuk Menutup Kelas'
                            : 'Kelas Ditutup • Ketuk untuk Membuka Kembali'}
                        </Text>
                        <Ionicons
                          name="chevron-forward"
                          size={13}
                          color={batch.status === 'active' ? '#D97706' : '#059669'}
                        />
                      </TouchableOpacity>

                      {/* Collapsible Student Roster List */}
                      {isRosterExpanded && (
                        <View
                          style={[
                            styles.rosterListBox,
                            {
                              backgroundColor: isDark ? '#0F172A' : '#FAFAFA',
                              borderColor: isDark ? '#334155' : '#E2E8F0',
                            },
                          ]}>
                          <Text
                            style={[
                              styles.rosterListTitle,
                              { color: textSecondary },
                            ]}>
                            DAFTAR SISWA TERDAFTAR:
                          </Text>
                          {batchEnrollments.length === 0 ? (
                            <Text style={[styles.emptyRosterText, { color: textSecondary }]}>
                              Belum ada siswa yang mendaftar. Bagikan kode kelas &quot;{batch.classCode}&quot; kepada siswa.
                            </Text>
                          ) : (
                            batchEnrollments.map((enr) => {
                              const studentUser = registeredUsers.find(
                                (u) => u.id === enr.userId
                              );
                              const studentName =
                                studentUser?.fullName ||
                                (enr.userId === currentUser.id
                                  ? currentUser.fullName
                                  : enr.userId);
                              const studentEmail =
                                studentUser?.email || 'siswa@eduflow.id';
                              const studentAvatar =
                                studentUser?.avatarUrl ||
                                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80';

                              return (
                                <View
                                  key={enr.id}
                                  style={[
                                    styles.rosterStudentRow,
                                    {
                                      borderBottomColor: isDark
                                        ? '#1E293B'
                                        : '#E2E8F0',
                                    },
                                  ]}>
                                  <Image
                                    source={{ uri: studentAvatar }}
                                    style={styles.rosterStudentAvatar}
                                  />
                                  <View style={{ flex: 1 }}>
                                    <Text
                                      style={[
                                        styles.rosterStudentName,
                                        { color: textPrimary },
                                      ]}>
                                      {studentName}
                                    </Text>
                                    <Text
                                      style={[
                                        styles.rosterStudentEmail,
                                        { color: textSecondary },
                                      ]}>
                                      {studentEmail}
                                    </Text>
                                  </View>
                                  <View style={styles.rosterProgressCol}>
                                    <Text style={styles.rosterProgressText}>
                                      {enr.progressPercentage}%
                                    </Text>
                                    <Text
                                      style={[
                                        styles.rosterStatusText,
                                        {
                                          color:
                                            enr.graduationStatus === 'graduated'
                                              ? '#16A34A'
                                              : '#D97706',
                                        },
                                      ]}>
                                      {enr.graduationStatus === 'graduated'
                                        ? 'Lulus'
                                        : 'Belajar'}
                                    </Text>
                                  </View>
                                </View>
                              );
                            })
                          )}
                        </View>
                      )}
                    </View>
                  );
                })
              )}
            </>
          ) : (
            /* CREATE CLASS FORM */
            <View
              style={[
                styles.formCard,
                {
                  backgroundColor: cardBg,
                  borderColor: isDark ? '#334155' : '#E2E8F0',
                },
              ]}>
              <View style={styles.formHeader}>
                <Ionicons name="create-outline" size={22} color="#8B5CF6" />
                <Text style={[styles.formTitle, { color: textPrimary }]}>
                  Buat Kelas Baru
                </Text>
              </View>

              {/* Course Title */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: textSecondary }]}>
                  Judul Course *
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: inputBg,
                      color: textPrimary,
                      borderColor: inputBorder,
                    },
                  ]}
                  placeholder="Contoh: Fullstack Mobile Development"
                  placeholderTextColor="#94A3B8"
                  value={courseTitle}
                  onChangeText={setCourseTitle}
                />
              </View>

              {/* Course Description */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: textSecondary }]}>
                  Deskripsi Course
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    styles.textArea,
                    {
                      backgroundColor: inputBg,
                      color: textPrimary,
                      borderColor: inputBorder,
                    },
                  ]}
                  placeholder="Deskripsi singkat tentang course..."
                  placeholderTextColor="#94A3B8"
                  value={courseDesc}
                  onChangeText={setCourseDesc}
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* Category */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: textSecondary }]}>
                  Kategori
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: inputBg,
                      color: textPrimary,
                      borderColor: inputBorder,
                    },
                  ]}
                  placeholder="Contoh: Mobile Development"
                  placeholderTextColor="#94A3B8"
                  value={courseCategory}
                  onChangeText={setCourseCategory}
                />
              </View>

              {/* Level Selector */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: textSecondary }]}>
                  Tingkat Kesulitan
                </Text>
                <View style={styles.levelRow}>
                  {(['beginner', 'intermediate', 'advanced'] as CourseLevel[]).map(
                    (lvl) => {
                      const info = levelLabels[lvl];
                      const isActive = courseLevel === lvl;
                      return (
                        <TouchableOpacity
                          key={lvl}
                          onPress={() => setCourseLevel(lvl)}
                          style={[
                            styles.levelChip,
                            {
                              backgroundColor: isActive
                                ? info.bg
                                : isDark
                                ? '#0F172A'
                                : '#F1F5F9',
                              borderColor: isActive ? info.color : 'transparent',
                            },
                          ]}>
                          <Text
                            style={[
                              styles.levelChipText,
                              {
                                color: isActive
                                  ? info.color
                                  : textSecondary,
                              },
                            ]}>
                            {info.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    }
                  )}
                </View>
              </View>

              {/* Batch Name */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: textSecondary }]}>
                  Nama Batch / Kelas *
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: inputBg,
                      color: textPrimary,
                      borderColor: inputBorder,
                    },
                  ]}
                  placeholder="Contoh: Batch 01 - Mobile Cohort"
                  placeholderTextColor="#94A3B8"
                  value={batchName}
                  onChangeText={setBatchName}
                />
              </View>

              {/* Max Students */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: textSecondary }]}>
                  Kapasitas Maks Siswa
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: inputBg,
                      color: textPrimary,
                      borderColor: inputBorder,
                      width: 100,
                    },
                  ]}
                  placeholder="30"
                  placeholderTextColor="#94A3B8"
                  value={maxStudents}
                  onChangeText={setMaxStudents}
                  keyboardType="number-pad"
                />
              </View>

              {/* Recently Created Code */}
              {createdCode !== '' && (
                <View
                  style={[
                    styles.createdCodeBox,
                    { backgroundColor: isDark ? '#052E16' : '#F0FDF4' },
                  ]}>
                  <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
                  <View style={styles.createdCodeTextCol}>
                    <Text style={styles.createdCodeLabel}>
                      Kode Kelas Terakhir Dibuat:
                    </Text>
                    <Text style={styles.createdCodeValue}>{createdCode}</Text>
                  </View>
                </View>
              )}

              {/* Submit */}
              <TouchableOpacity
                style={styles.createBtn}
                onPress={handleCreate}
                activeOpacity={0.85}>
                <Ionicons name="rocket-outline" size={18} color="#FFFFFF" />
                <Text style={styles.createBtnText}>Buat Kelas Sekarang</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* MODAL EDIT & STATUS KELAS */}
      <Modal
        visible={isEditModalOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsEditModalOpen(false)}>
        <SafeAreaView
          style={[
            styles.editModalContainer,
            { backgroundColor: isDark ? '#0F172A' : '#FFFFFF' },
          ]}>
          <View
            style={[
              styles.editModalHeader,
              { borderBottomColor: isDark ? '#1E293B' : '#E2E8F0' },
            ]}>
            <TouchableOpacity onPress={() => setIsEditModalOpen(false)}>
              <Ionicons name="close" size={24} color={textPrimary} />
            </TouchableOpacity>
            <Text style={[styles.editModalHeaderTitle, { color: textPrimary }]}>
              Pengaturan & Edit Kelas
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView
            style={styles.editModalScroll}
            contentContainerStyle={{ paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled">
            {editingBatch && (
              <>
                {/* Cohort Code Badge Info */}
                <View
                  style={[
                    styles.editCohortInfoCard,
                    {
                      backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                      borderColor: isDark ? '#334155' : '#E2E8F0',
                    },
                  ]}>
                  <View style={styles.editCohortRow}>
                    <Text style={[styles.editCohortLabel, { color: textSecondary }]}>
                      KODE KELAS (TIDAK DAPAT DIUBAH):
                    </Text>
                    <View style={styles.editClassCodePill}>
                      <Text style={styles.editClassCodePillText}>
                        {editingBatch.classCode}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.editCohortHelp, { color: textSecondary }]}>
                    Siswa bergabung menggunakan kode unik di atas.
                  </Text>
                </View>

                {/* Status Selector */}
                <Text style={[styles.editInputLabel, { color: textPrimary }]}>
                  Status Siklus Hidup Kelas *:
                </Text>
                <View style={styles.statusSelectorRow}>
                  <TouchableOpacity
                    onPress={() => setEditStatus('active')}
                    style={[
                      styles.statusSelectChip,
                      {
                        backgroundColor:
                          editStatus === 'active'
                            ? '#10B981'
                            : isDark
                            ? '#1E293B'
                            : '#F1F5F9',
                        borderColor:
                          editStatus === 'active'
                            ? '#059669'
                            : isDark
                            ? '#334155'
                            : '#CBD5E1',
                      },
                    ]}>
                    <Ionicons
                      name="radio-button-on"
                      size={14}
                      color={editStatus === 'active' ? '#FFFFFF' : '#10B981'}
                    />
                    <Text
                      style={[
                        styles.statusSelectChipText,
                        {
                          color:
                            editStatus === 'active'
                              ? '#FFFFFF'
                              : isDark
                              ? '#CBD5E1'
                              : '#334155',
                          fontWeight: editStatus === 'active' ? '700' : '500',
                        },
                      ]}>
                      🟢 Aktif
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setEditStatus('upcoming')}
                    style={[
                      styles.statusSelectChip,
                      {
                        backgroundColor:
                          editStatus === 'upcoming'
                            ? '#F59E0B'
                            : isDark
                            ? '#1E293B'
                            : '#F1F5F9',
                        borderColor:
                          editStatus === 'upcoming'
                            ? '#D97706'
                            : isDark
                            ? '#334155'
                            : '#CBD5E1',
                      },
                    ]}>
                    <Ionicons
                      name="time-outline"
                      size={14}
                      color={editStatus === 'upcoming' ? '#FFFFFF' : '#F59E0B'}
                    />
                    <Text
                      style={[
                        styles.statusSelectChipText,
                        {
                          color:
                            editStatus === 'upcoming'
                              ? '#FFFFFF'
                              : isDark
                              ? '#CBD5E1'
                              : '#334155',
                          fontWeight: editStatus === 'upcoming' ? '700' : '500',
                        },
                      ]}>
                      🟡 Mendatang
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setEditStatus('completed')}
                    style={[
                      styles.statusSelectChip,
                      {
                        backgroundColor:
                          editStatus === 'completed'
                            ? '#EF4444'
                            : isDark
                            ? '#1E293B'
                            : '#F1F5F9',
                        borderColor:
                          editStatus === 'completed'
                            ? '#DC2626'
                            : isDark
                            ? '#334155'
                            : '#CBD5E1',
                      },
                    ]}>
                    <Ionicons
                      name="lock-closed"
                      size={14}
                      color={editStatus === 'completed' ? '#FFFFFF' : '#EF4444'}
                    />
                    <Text
                      style={[
                        styles.statusSelectChipText,
                        {
                          color:
                            editStatus === 'completed'
                              ? '#FFFFFF'
                              : isDark
                              ? '#CBD5E1'
                              : '#334155',
                          fontWeight: editStatus === 'completed' ? '700' : '500',
                        },
                      ]}>
                      🔴 Selesai (Tutup)
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Batch Name */}
                <Text style={[styles.editInputLabel, { color: textPrimary }]}>
                  Nama Batch / Sesi Kelas *:
                </Text>
                <TextInput
                  value={editBatchName}
                  onChangeText={setEditBatchName}
                  placeholder="Contoh: Batch 01 - Mobile Cohort"
                  placeholderTextColor="#94A3B8"
                  style={[
                    styles.editInput,
                    {
                      backgroundColor: inputBg,
                      color: textPrimary,
                      borderColor: inputBorder,
                    },
                  ]}
                />

                {/* Max Students */}
                <Text style={[styles.editInputLabel, { color: textPrimary }]}>
                  Kapasitas Maksimum Siswa *:
                </Text>
                <TextInput
                  value={editMaxStudents}
                  onChangeText={setEditMaxStudents}
                  keyboardType="number-pad"
                  placeholder="30"
                  placeholderTextColor="#94A3B8"
                  style={[
                    styles.editInput,
                    {
                      backgroundColor: inputBg,
                      color: textPrimary,
                      borderColor: inputBorder,
                    },
                  ]}
                />

                {/* Dates: Start & End */}
                <View style={styles.dateInputsRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.editInputLabel, { color: textPrimary }]}>
                      Tanggal Mulai:
                    </Text>
                    <TextInput
                      value={editStartDate}
                      onChangeText={setEditStartDate}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor="#94A3B8"
                      style={[
                        styles.editInput,
                        {
                          backgroundColor: inputBg,
                          color: textPrimary,
                          borderColor: inputBorder,
                        },
                      ]}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.editInputLabel, { color: textPrimary }]}>
                      Tanggal Berakhir:
                    </Text>
                    <TextInput
                      value={editEndDate}
                      onChangeText={setEditEndDate}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor="#94A3B8"
                      style={[
                        styles.editInput,
                        {
                          backgroundColor: inputBg,
                          color: textPrimary,
                          borderColor: inputBorder,
                        },
                      ]}
                    />
                  </View>
                </View>

                {/* Quick Closure Banner if active */}
                {editStatus === 'active' && (
                  <View style={styles.closureNoticeBox}>
                    <Ionicons name="information-circle-outline" size={18} color="#D97706" />
                    <Text style={styles.closureNoticeText}>
                      Status Aktif: Siswa dapat memasukkan kode kelas &quot;{editingBatch.classCode}&quot; untuk bergabung. Ubah ke Selesai untuk menutup pendaftaran.
                    </Text>
                  </View>
                )}

                {editStatus === 'completed' && (
                  <View style={[styles.closureNoticeBox, { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }]}>
                    <Ionicons name="lock-closed" size={18} color="#DC2626" />
                    <Text style={[styles.closureNoticeText, { color: '#991B1B' }]}>
                      Status Selesai: Pendaftaran ditutup. Siswa baru yang memasukkan kode &quot;{editingBatch.classCode}&quot; akan ditolak.
                    </Text>
                  </View>
                )}
              </>
            )}
          </ScrollView>

          {/* Modal Footer */}
          <View
            style={[
              styles.editModalFooter,
              {
                backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                borderTopColor: isDark ? '#1E293B' : '#E2E8F0',
              },
            ]}>
            <TouchableOpacity
              onPress={() => setIsEditModalOpen(false)}
              style={styles.editCancelBtn}>
              <Text style={styles.editCancelBtnText}>Batal</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSaveBatchChanges}
              style={styles.editSaveBtn}>
              <Ionicons name="save-outline" size={16} color="#FFFFFF" />
              <Text style={styles.editSaveBtnText}>Simpan Perubahan</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextCol: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 14,
    padding: 3,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 11,
  },
  tabActive: {
    backgroundColor: '#8B5CF6',
  },
  tabActiveCreate: {
    backgroundColor: '#2563EB',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 20,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  emptyBtn: {
    backgroundColor: '#8B5CF6',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  classCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  classCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  classCodeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  classCodeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#8B5CF6',
    letterSpacing: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  classTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
  },
  classBatchName: {
    fontSize: 12,
    marginBottom: 12,
  },
  classMetrics: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  classMetricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  classMetricText: {
    fontSize: 12,
  },
  shareCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 10,
    borderRadius: 10,
    flexWrap: 'wrap',
  },
  shareCodeLabel: {
    fontSize: 12,
  },
  shareCodeValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#8B5CF6',
    letterSpacing: 1.5,
  },
  shareCodeHint: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  formCard: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  levelRow: {
    flexDirection: 'row',
    gap: 8,
  },
  levelChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  levelChipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  createdCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  createdCodeTextCol: {
    flex: 1,
  },
  createdCodeLabel: {
    fontSize: 12,
    color: '#15803D',
    fontWeight: '600',
  },
  createdCodeValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#16A34A',
    letterSpacing: 2,
    marginTop: 2,
  },
  createBtn: {
    backgroundColor: '#8B5CF6',
    borderRadius: 14,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  createBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  successBannerCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    marginBottom: 16,
  },
  successBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  successBannerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#10B981',
  },
  successBannerText: {
    fontSize: 13,
    marginBottom: 12,
    lineHeight: 18,
  },
  successCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  successCodeText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#059669',
    letterSpacing: 2,
  },
  successCopyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  successCopyBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  copyButtonPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  copyButtonPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  batchActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  rosterToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
  },
  rosterToggleText: {
    fontSize: 12,
    fontWeight: '700',
  },
  openSyllabusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#8B5CF6',
  },
  openSyllabusBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  rosterListBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  rosterListTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  emptyRosterText: {
    fontSize: 12,
    fontStyle: 'italic',
    paddingVertical: 6,
  },
  rosterStudentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  rosterStudentAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  rosterStudentName: {
    fontSize: 13,
    fontWeight: '700',
  },
  rosterStudentEmail: {
    fontSize: 11,
    marginTop: 1,
  },
  rosterProgressCol: {
    alignItems: 'flex-end',
  },
  rosterProgressText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2563EB',
  },
  rosterStatusText: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  cardEditMiniBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  actionEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
  },
  actionEditBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  lifecycleQuickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 10,
    gap: 6,
  },
  lifecycleQuickBtnText: {
    fontSize: 11,
    fontWeight: '700',
    flex: 1,
  },
  editModalContainer: {
    flex: 1,
  },
  editModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  editModalHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  editModalScroll: {
    flex: 1,
    padding: 16,
  },
  editCohortInfoCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  editCohortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  editCohortLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  editClassCodePill: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  editClassCodePillText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#8B5CF6',
  },
  editCohortHelp: {
    fontSize: 11,
  },
  editInputLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 12,
  },
  statusSelectorRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  statusSelectChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  statusSelectChipText: {
    fontSize: 12,
  },
  editInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  dateInputsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  closureNoticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
    borderWidth: 1,
    padding: 12,
    borderRadius: 10,
    marginTop: 18,
    gap: 8,
  },
  closureNoticeText: {
    fontSize: 12,
    color: '#B45309',
    lineHeight: 17,
    flex: 1,
  },
  editModalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
  },
  editCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  editCancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  editSaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#8B5CF6',
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  editSaveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
