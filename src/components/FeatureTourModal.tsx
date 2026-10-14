import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useElearningStore } from '@/store/useElearningStore';

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

const TOUR_STEPS: TourStep[] = [
  {
    id: 'intro',
    badge: 'PENGENALAN PLATFORM',
    icon: 'school',
    themeColor: '#4F46E5',
    themeBg: '#EEF2FF',
    themeBorder: '#C7D2FE',
    themeLip: '#818CF8',
    title: 'Selamat Datang di EduFlow Cohort!',
    subtitle: 'Platform E-Learning Kolaboratif & Terakreditasi',
    description:
      'EduFlow Cohort dirancang khusus untuk pembelajaran berbasis cohort berbatas waktu dengan metodologi standar Wadhwani Foundation, menyajikan kurikulum terstruktur dan evaluasi dua arah.',
    features: [
      {
        icon: 'flash-outline',
        title: '100% Dinamis & Lokal',
        desc: 'Semua data tersimpan otomatis di perangkat lokal tanpa konfigurasi backend rumit, siap diuji coba langsung oleh client.',
      },
      {
        icon: 'color-palette-outline',
        title: 'Gamified Bento + Tactile 3D UI',
        desc: 'Antarmuka modular bergaya widget iOS dan tombol taktil 3D interaktif ala Duolingo yang memikat dan tidak membosankan.',
      },
    ],
    testingGuide: [
      'Gunakan bilah tab bawah untuk berpindah antar modul: Dashboard, Silabus, Tugas/Periksa, dan Kelulusan.',
      'Data progres selalu tersimpan secara instan di storage aplikasi.',
    ],
    targetTab: '/(tabs)',
    actionLabel: 'Buka Dashboard Utama',
  },
  {
    id: 'dual-role',
    badge: 'FITUR UTAMA: DUAL ROLE',
    icon: 'swap-horizontal',
    themeColor: '#2563EB',
    themeBg: '#EFF6FF',
    themeBorder: '#BFDBFE',
    themeLip: '#60A5FA',
    title: 'Beralih Peran Siswa & Guru 1-Klik',
    subtitle: 'Uji Seluruh Alur Dua Arah Tanpa Login Ulang',
    description:
      'Di bagian atas layar terdapat pill selector peran instan yang memungkinkan Anda berganti sudut pandang antara Siswa (Budi) dan Pengajar (Pak Alex) dalam sekejap.',
    features: [
      {
        icon: 'person-outline',
        title: 'Mode Siswa (Budi Santoso)',
        desc: 'Belajar modul, menonton video materi, mengerjakan kuis evaluasi, kumpul proyek, dan klaim sertifikat ijazah resmi.',
      },
      {
        icon: 'ribbon-outline',
        title: 'Mode Pengajar (Pak Alex)',
        desc: 'Menilai tugas siswa, meminta revisi perbaikan, mengelola kelas (Class Manager), dan mengunduh rekap nilai ke CSV/Excel.',
      },
    ],
    testingGuide: [
      'Klik tombol "Mode Pengajar (Pak Alex)" di header atas aplikasi untuk melihat perspektif guru.',
      'Siswa mengumpulkan tugas ➔ Ganti ke Pengajar ➔ Tugas langsung masuk antrean pemeriksaan.',
    ],
    targetRole: 'teacher',
    actionLabel: 'Coba Switch ke Guru',
  },
  {
    id: 'syllabus-gate',
    badge: 'TAB SILABUS: GATEKEEPER',
    icon: 'layers',
    themeColor: '#8B5CF6',
    themeBg: '#F5F3FF',
    themeBorder: '#DDD6FE',
    themeLip: '#A78BFA',
    title: 'Silabus & Sequential Gating Lock',
    subtitle: 'Materi & Kuis Terbuka Bertahap',
    description:
      'EduFlow menerapkan sistem kunci gerbang belajar (Gatekeeper) otomatis untuk memastikan siswa menuntaskan materi secara berurutan dan terarah.',
    features: [
      {
        icon: 'lock-closed-outline',
        title: 'Materi Terkunci Berurutan',
        desc: 'Materi berikutnya (Lesson 1.2) terkunci sampai materi sebelumnya (Lesson 1.1) ditandai selesai.',
      },
      {
        icon: 'shield-checkmark-outline',
        title: 'Gerbang Kuis Modul (KKM 80)',
        desc: 'Kuis Modul terkunci sampai seluruh materi selesai. Modul berikutnya baru terbuka bila kuis lulus minimal 80%.',
      },
    ],
    testingGuide: [
      'Buka tab "Silabus" dalam Mode Siswa, klik Lesson 1.1 dan tandai selesai.',
      'Perhatikan gembok Lesson 1.2 yang langsung terbuka secara otomatis!',
    ],
    targetTab: '/(tabs)/syllabus',
    targetRole: 'learner',
    actionLabel: 'Buka Tab Silabus',
  },
  {
    id: 'interactive-quiz',
    badge: 'EVALUASI INTERAKTIF',
    icon: 'checkmark-done-circle',
    themeColor: '#10B981',
    themeBg: '#ECFDF5',
    themeBorder: '#A7F3D0',
    themeLip: '#34D399',
    title: 'Kuis Taktil 3D & Tugas Proyek',
    subtitle: 'Uji Kompetensi Kognitif & Proyek Portofolio',
    description:
      'Dua instrumen evaluasi utama memastikan pemahaman mendalam: kuis pilihan ganda otomatis dengan umpan balik, serta pengumpulan tugas proyek nyata.',
    features: [
      {
        icon: 'help-circle-outline',
        title: 'Kuis Pilihan Ganda Gamifikasi',
        desc: 'Tombol opsi taktil 3D dengan umpan balik instan, pembahasan jawaban, dan penambahan +50 XP bila lulus.',
      },
      {
        icon: 'cloud-upload-outline',
        title: 'Pengumpulan Tugas Portofolio',
        desc: 'Siswa menulis rangkuman solusi dan menyematkan tautan repository (GitHub/Figma/Drive) untuk dinilai pengajar.',
      },
    ],
    testingGuide: [
      'Buka Kuis Modul di tab Silabus dan rasakan sensasi tombol opsi taktil 3D.',
      'Kumpulkan tugas proyek untuk melihat statusnya berubah menjadi "Menunggu Diperiksa".',
    ],
    targetTab: '/(tabs)/syllabus',
    targetRole: 'learner',
    actionLabel: 'Coba Kuis di Silabus',
  },
  {
    id: 'teacher-grading',
    badge: 'TAB PERIKSA: OTORITAS GURU',
    icon: 'document-text',
    themeColor: '#D97706',
    themeBg: '#FFFBEB',
    themeBorder: '#FDE68A',
    themeLip: '#FBBF24',
    title: 'Panel Penilaian & Ekspor CSV/Excel',
    subtitle: 'Koreksi Tugas, Revisi & Rekapitulasi Lengkap',
    description:
      'Pada Mode Pengajar, tab berganti menjadi "Periksa". Pengajar dapat memeriksa jawaban siswa, memberikan ulasan kualitatif, serta mengunduh rekap nilai.',
    features: [
      {
        icon: 'create-outline',
        title: 'Penilaian & Permintaan Revisi',
        desc: 'Beri skor 0-100 dengan feedback tertulis, atau minta siswa melakukan revisi perbaikan.',
      },
      {
        icon: 'download-outline',
        title: 'Ekspor Rekap Nilai CSV (Excel)',
        desc: 'Format CSV disandikan UTF-8 BOM otomatis sehingga langsung terbuka rapi di Microsoft Excel & Google Sheets tanpa error karakter.',
      },
    ],
    testingGuide: [
      'Ganti ke Mode Pengajar, buka tab "Periksa", lalu tekan tombol hijau "Unduh Rekap Nilai".',
      'Lihat pratinjau data rekap nilai lengkap dengan progress materi, kuis, dan status kelulusan.',
    ],
    targetTab: '/(tabs)/grading',
    targetRole: 'teacher',
    actionLabel: 'Buka Tab Periksa & Ekspor',
  },
  {
    id: 'graduation-cert',
    badge: 'TAB KELULUSAN & MANAJEMEN KELAS',
    icon: 'ribbon',
    themeColor: '#E11D48',
    themeBg: '#FFF1F2',
    themeBorder: '#FECDD3',
    themeLip: '#FB7185',
    title: 'Evaluasi Terbobot & Sertifikat Digital',
    subtitle: 'Formula Bobot Industri (30:30:40) & Ijazah Digital',
    description:
      'Tab Kelulusan menghitung nilai akhir transparan: (Materi 30%) + (Kuis 30%) + (Tugas 40%). Jika tuntas, tombol Klaim Sertifikat Resmi akan aktif.',
    features: [
      {
        icon: 'trophy-outline',
        title: 'Sertifikat Digital Kredensial Resmi',
        desc: 'Dilengkapi Nomor Kredensial unik, status terverifikasi sah, nama resmi bergelar, dan fitur Cetak / Simpan PDF.',
      },
      {
        icon: 'people-outline',
        title: 'Manajemen Kelas & Notifikasi In-App',
        desc: 'Pengajar dapat membuat kelas cohort baru dengan kode 6 karakter, mengelola kapasitas, dan broadcast pengumuman.',
      },
    ],
    testingGuide: [
      'Periksa tab "Kelulusan" untuk melihat portofolio sertifikat terakreditasi milik Budi Santoso.',
      'Coba ubah nama resmi di sertifikat menggunakan tombol "Ubah / Lengkapi".',
    ],
    targetTab: '/(tabs)/profile',
    targetRole: 'learner',
    actionLabel: 'Buka Tab Kelulusan',
  },
];

export function FeatureTourModal({ visible, onClose }: FeatureTourModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const { setHasSeenAppTour, switchRole } = useElearningStore();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const activeStep = TOUR_STEPS[currentStepIndex] || TOUR_STEPS[0];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === TOUR_STEPS.length - 1;

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
                Langkah {currentStepIndex + 1} dari {TOUR_STEPS.length}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleFinish}
              style={styles.skipButton}
              activeOpacity={0.7}>
              <Text style={styles.skipButtonText}>Lewati Panduan</Text>
              <Ionicons name="close" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Segmented Progress Bars (Clickable) */}
          <View style={styles.progressBarContainer}>
            {TOUR_STEPS.map((step, idx) => {
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
                  Panduan Pengujian untuk Client:
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
                  {activeStep.actionLabel} sekarang ➔
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
                  Sebelumnya
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
                {isLastStep ? 'Mulai Eksplorasi EduFlow 🚀' : 'Lanjut ➔'}
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
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    ...(Platform.OS === 'web' && ({
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
    } as any)),
  },
  tourCard: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '90%',
    borderRadius: 28,
    borderWidth: 2,
    borderBottomWidth: 6,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 10,
  },
  stepCounterBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  stepCounterText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4F46E5',
    letterSpacing: 0.4,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  skipButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  progressBarContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 6,
    marginBottom: 12,
  },
  progressSegment: {
    flex: 1,
    height: 6,
    borderRadius: 3,
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  visualBadgeWrapper: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  iconBadge3D: {
    width: 72,
    height: 72,
    borderRadius: 24,
    borderWidth: 2,
    borderBottomWidth: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  categoryPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  categoryPillText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  tourTitle: {
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  tourSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8B5CF6',
    textAlign: 'center',
    marginBottom: 10,
  },
  tourDesc: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 16,
  },
  featuresList: {
    gap: 10,
    marginBottom: 14,
  },
  featureItemBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    borderBottomWidth: 3.5,
    gap: 10,
  },
  featIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 12,
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
    lineHeight: 16,
  },
  testingGuideCard: {
    padding: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    borderBottomWidth: 4,
    marginBottom: 14,
  },
  testingGuideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
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
    marginBottom: 4,
  },
  tipBullet: {
    fontSize: 13,
    fontWeight: '800',
    color: '#10B981',
    lineHeight: 16,
  },
  tipText: {
    fontSize: 12,
    lineHeight: 17,
    flex: 1,
    fontWeight: '500',
  },
  directActionLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 6,
  },
  directActionText: {
    fontSize: 12,
    fontWeight: '800',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  prevButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 48,
    borderRadius: 16,
    borderWidth: 1.5,
    borderBottomWidth: 4,
  },
  prevButtonText: {
    fontSize: 13,
    fontWeight: '800',
  },
  nextButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 48,
    borderRadius: 16,
    borderWidth: 1.5,
    borderBottomWidth: 4,
  },
  nextButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
