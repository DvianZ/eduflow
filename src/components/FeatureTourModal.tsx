import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useElearningStore } from '@/store/useElearningStore';

interface FeatureTourModalProps {
  visible: boolean;
  onClose: () => void;
}

interface TourStep {
  id: string;
  category: 'FITUR UTAMA' | 'FITUR PENDUKUNG DEMO';
  isCore: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  description: string;
  tip: string;
  targetTab?: string;
  targetRole?: 'learner' | 'teacher';
  actionButtonLabel?: string;
}

export function FeatureTourModal({ visible, onClose }: FeatureTourModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const { setHasSeenAppTour, switchRole } = useElearningStore();
  const { width: windowWidth } = useWindowDimensions();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);

  const tourSteps: TourStep[] = [
    {
      id: 'dashboard',
      category: 'FITUR UTAMA',
      isCore: true,
      icon: 'compass',
      title: '1. Dashboard & Misi Belajar Cohort',
      subtitle: 'Pusat Pembelajaran Berbasis Waktu',
      description:
        'Selamat datang di EduFlow! Di Dashboard ini, siswa dapat melihat Misi Aktif, kode kelas (bisa langsung disalin), metrik progres belajar, dan kartu cohort kelas yang diikuti.',
      tip: 'Fokus Demo: Perhatikan kartu Misi 3D di atas dan ringkasan progres belajar.',
      targetTab: '/(tabs)',
      targetRole: 'learner',
    },
    {
      id: 'role-switcher',
      category: 'FITUR PENDUKUNG DEMO',
      isCore: false,
      icon: 'swap-horizontal',
      title: '2. Role Switcher Instan (1-Klik)',
      subtitle: 'Simulasi Siswa vs Instruktur Tanpa Relogin',
      description:
        'Fitur pendukung demo: Klien penguji dapat beralih peran antara Siswa (Budi) dan Instruktur (Mr. Alex) seketika melalui tombol di bar atas tanpa perlu login ulang!',
      tip: 'Fokus Demo: Tombol pill switcher di header atas mempermudah demo 2 sisi.',
      targetTab: '/(tabs)',
      targetRole: 'learner',
    },
    {
      id: 'gatekeeper',
      category: 'FITUR UTAMA',
      isCore: true,
      icon: 'layers',
      title: '3. Kurikulum & Gatekeeper Prasyarat',
      subtitle: 'Membuka Materi & Kuis Berkelanjutan',
      description:
        'Kurikulum menerapkan aturan Gatekeeper otomatis: Pelajaran berikutnya dan tugas proyek terkunci sampai siswa menyelesaikan materi prasyarat dan lulus kuis (≥ 80%).',
      tip: 'Fokus Demo: Perhatikan tanda gembok pada Modul 2 yang mengunci tugas proyek.',
      targetTab: '/(tabs)/syllabus',
      targetRole: 'learner',
    },
    {
      id: 'grading',
      category: 'FITUR UTAMA',
      isCore: true,
      icon: 'clipboard',
      title: '4. Review Tugas, Nilai & Revisi',
      subtitle: 'Penilaian Dua Arah & Umpan Balik Instruktur',
      description:
        'Beralih ke mode Pengajar: Instruktur dapat memeriksa tugas proyek siswa, memberi skor komposit 0–100, atau meminta revisi (Request Revision) yang seketika memicu notifikasi peringatan.',
      tip: 'Fokus Demo: Antrean penilaian instruktur dengan tombol Request Revision & ekspor CSV.',
      targetTab: '/(tabs)/grading',
      targetRole: 'teacher',
    },
    {
      id: 'class-manager',
      category: 'FITUR UTAMA',
      isCore: true,
      icon: 'people',
      title: '5. Manajemen Kelas & Siswa',
      subtitle: 'Buat Cohort Baru & Pantau Kelulusan Roster',
      description:
        'Panel otoritas instruktur untuk membuka kelas baru, menentukan kuota kapasitas, menghasilkan kode kelas acak, dan memantau status kelulusan seluruh siswa yang terdaftar.',
      tip: 'Fokus Demo: Manajemen kuota kelas dan pembuatan kode unik pendaftaran.',
      targetTab: '/class-manager',
      targetRole: 'teacher',
    },
    {
      id: 'certificate',
      category: 'FITUR UTAMA',
      isCore: true,
      icon: 'ribbon',
      title: '6. Evaluasi Kelulusan & Sertifikat PDF',
      subtitle: 'Formula Terbobot 30:30:40 & Cetak Lisensi',
      description:
        'Evaluator menghitung otomatis formula: 30% kurikulum + 30% kuis + 40% tugas. Siswa yang lulus dapat melihat sertifikat terakreditasi berskala penuh dan mencetak file PDF sesuai nama kelas!',
      tip: 'Fokus Demo: Klik cohort WDF-101 lalu klik "View Certificate" atau "Print / Save PDF".',
      targetTab: '/(tabs)/profile',
      targetRole: 'learner',
    },
    {
      id: 'demo-utilities',
      category: 'FITUR PENDUKUNG DEMO',
      isCore: false,
      icon: 'flask',
      title: '7. Notifikasi, Tema & Reset Demo Data',
      subtitle: 'Dukungan Lengkap Pengujian Mandiri Klien',
      description:
        'Aplikasi dilengkapi Pusat Notifikasi (🔔) untuk melacak revisi/nilai, mode Gelap/Terang, dan tombol "Reset All Demo Testing Data" (🔄) untuk mengembalikan seluruh simulasi data ke awal kapan pun!',
      tip: 'Fokus Demo: Pengujian selesai! Anda kini dapat mencoba seluruh fitur secara bebas.',
      targetTab: '/settings',
      targetRole: 'learner',
    },
  ];

  const activeStep = tourSteps[currentStepIndex] || tourSteps[0];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === tourSteps.length - 1;

  // Dynamically navigate to the target screen and role as the tour progresses
  useEffect(() => {
    if (visible && activeStep) {
      if (activeStep.targetRole) {
        switchRole(activeStep.targetRole);
      }
      if (activeStep.targetTab) {
        router.push(activeStep.targetTab as any);
      }
    }
  }, [visible, currentStepIndex, activeStep, router, switchRole]);

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
    setIsMinimized(false);
    onClose();
    // Return to main dashboard with learner mode
    switchRole('learner');
    router.push('/(tabs)' as any);
  };

  if (!visible) return null;

  const cardMaxWidth = Math.min(windowWidth - 24, 520);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={handleFinish}>
      <View style={styles.overlayContainer} pointerEvents="box-none">
        {/* MINIMIZED FLOATING PILL */}
        {isMinimized ? (
          <View
            style={[
              styles.minimizedPill,
              {
                backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                borderColor: activeStep.isCore ? '#3B82F6' : '#F59E0B',
              },
            ]}>
            <TouchableOpacity
              onPress={() => setIsMinimized(false)}
              style={styles.minimizedLeft}>
              <View
                style={[
                  styles.minimizedBadge,
                  { backgroundColor: activeStep.isCore ? '#2563EB' : '#D97706' },
                ]}>
                <Ionicons name={activeStep.icon} size={14} color="#FFFFFF" />
              </View>
              <Text
                numberOfLines={1}
                style={[
                  styles.minimizedText,
                  { color: isDark ? '#F8FAFC' : '#0F172A' },
                ]}>
                Tour ({currentStepIndex + 1}/{tourSteps.length}): {activeStep.title.replace(/^\d+\.\s*/, '')}
              </Text>
            </TouchableOpacity>

            <View style={styles.minimizedActions}>
              <TouchableOpacity
                onPress={handleNext}
                style={[
                  styles.minimizedNextBtn,
                  { backgroundColor: activeStep.isCore ? '#2563EB' : '#10B981' },
                ]}>
                <Text style={styles.minimizedNextBtnText}>
                  {isLastStep ? 'Selesai' : 'Lanjut ➔'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setIsMinimized(false)}
                style={styles.minimizedIconBtn}
                accessibilityLabel="Perbesar tour">
                <Ionicons
                  name="expand-outline"
                  size={16}
                  color={isDark ? '#CBD5E1' : '#64748B'}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleFinish}
                style={styles.minimizedCloseBtn}
                accessibilityLabel="Tutup tour">
                <Ionicons name="close" size={16} color="#DC2626" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* EXPANDED INTERACTIVE WALKTHROUGH DOCK */
          <View
            style={[
              styles.dockCard,
              {
                maxWidth: cardMaxWidth,
                backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                borderColor: activeStep.isCore ? '#3B82F6' : '#F59E0B',
                borderBottomColor: activeStep.isCore ? '#1D4ED8' : '#D97706',
              },
            ]}>
            {/* Top Tag & Control Bar */}
            <View style={styles.dockTopRow}>
              <View style={styles.tagGroup}>
                <View
                  style={[
                    styles.categoryTagPill,
                    {
                      backgroundColor: activeStep.isCore ? '#EEF2FF' : '#FEF3C7',
                      borderColor: activeStep.isCore ? '#BFDBFE' : '#FDE68A',
                    },
                  ]}>
                  <Ionicons
                    name={activeStep.isCore ? 'sparkles' : 'flask'}
                    size={11}
                    color={activeStep.isCore ? '#2563EB' : '#D97706'}
                  />
                  <Text
                    style={[
                      styles.categoryTagText,
                      { color: activeStep.isCore ? '#1D4ED8' : '#B45309' },
                    ]}>
                    {activeStep.category}
                  </Text>
                </View>

                <View
                  style={[
                    styles.stepProgressPill,
                    { backgroundColor: isDark ? '#0F172A' : '#F1F5F9' },
                  ]}>
                  <Text
                    style={[
                      styles.stepProgressText,
                      { color: isDark ? '#CBD5E1' : '#475569' },
                    ]}>
                    Langkah {currentStepIndex + 1} dari {tourSteps.length}
                  </Text>
                </View>
              </View>

              <View style={styles.topControlBtns}>
                {/* Minimize Button */}
                <TouchableOpacity
                  onPress={() => setIsMinimized(true)}
                  style={styles.controlIconBtn}
                  accessibilityLabel="Minimize tour">
                  <Ionicons
                    name="chevron-down"
                    size={18}
                    color={isDark ? '#CBD5E1' : '#64748B'}
                  />
                </TouchableOpacity>

                {/* Close / Skip Button */}
                <TouchableOpacity
                  onPress={handleFinish}
                  style={styles.controlIconBtn}
                  accessibilityLabel="Exit tour">
                  <Ionicons
                    name="close"
                    size={18}
                    color={isDark ? '#CBD5E1' : '#64748B'}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Title & Subtitle */}
            <View style={styles.dockTitleRow}>
              <View
                style={[
                  styles.titleIconSquare,
                  {
                    backgroundColor: activeStep.isCore ? '#EFF6FF' : '#FFFBEB',
                    borderColor: activeStep.isCore ? '#BFDBFE' : '#FDE68A',
                  },
                ]}>
                <Ionicons
                  name={activeStep.icon}
                  size={18}
                  color={activeStep.isCore ? '#2563EB' : '#D97706'}
                />
              </View>

              <View style={{ flex: 1, minWidth: 0 }}>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.dockTitle,
                    { color: isDark ? '#F8FAFC' : '#0F172A' },
                  ]}>
                  {activeStep.title}
                </Text>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.dockSubtitle,
                    { color: activeStep.isCore ? '#3B82F6' : '#D97706' },
                  ]}>
                  {activeStep.subtitle}
                </Text>
              </View>
            </View>

            {/* Description Body */}
            <Text
              style={[
                styles.dockDesc,
                { color: isDark ? '#CBD5E1' : '#475569' },
              ]}>
              {activeStep.description}
            </Text>

            {/* Highlight Focus Tip */}
            <View
              style={[
                styles.focusTipBox,
                {
                  backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                  borderColor: isDark ? '#334155' : '#E2E8F0',
                },
              ]}>
              <Ionicons
                name="bulb-outline"
                size={14}
                color={activeStep.isCore ? '#2563EB' : '#D97706'}
              />
              <Text
                style={[
                  styles.focusTipText,
                  { color: isDark ? '#94A3B8' : '#64748B' },
                ]}>
                {activeStep.tip}
              </Text>
            </View>

            {/* Bottom Actions Row */}
            <View style={styles.dockBottomRow}>
              {/* Prev Button */}
              <TouchableOpacity
                onPress={handlePrev}
                disabled={isFirstStep}
                style={[
                  styles.navBtn,
                  styles.prevBtn,
                  isFirstStep && styles.navBtnDisabled,
                  {
                    backgroundColor: isDark ? '#0F172A' : '#F1F5F9',
                    borderColor: isDark ? '#334155' : '#CBD5E1',
                    borderBottomColor: isDark ? '#0B0F19' : '#94A3B8',
                  },
                ]}>
                <Ionicons
                  name="arrow-back"
                  size={15}
                  color={isFirstStep ? '#94A3B8' : isDark ? '#CBD5E1' : '#475569'}
                />
                <Text
                  style={[
                    styles.prevBtnText,
                    { color: isFirstStep ? '#94A3B8' : isDark ? '#CBD5E1' : '#475569' },
                  ]}>
                  Kembali
                </Text>
              </TouchableOpacity>

              {/* Progress Dots */}
              <View style={styles.dotsRow}>
                {tourSteps.map((_, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => setCurrentStepIndex(idx)}
                    style={[
                      styles.dotItem,
                      idx === currentStepIndex
                        ? [
                            styles.dotItemActive,
                            {
                              backgroundColor: activeStep.isCore
                                ? '#2563EB'
                                : '#D97706',
                            },
                          ]
                        : {
                            backgroundColor: isDark ? '#334155' : '#CBD5E1',
                          },
                    ]}
                  />
                ))}
              </View>

              {/* Next / Finish Button */}
              <TouchableOpacity
                onPress={handleNext}
                style={[
                  styles.navBtn,
                  styles.nextBtn,
                  {
                    backgroundColor: isLastStep
                      ? '#10B981'
                      : activeStep.isCore
                      ? '#2563EB'
                      : '#F59E0B',
                    borderColor: isLastStep
                      ? '#059669'
                      : activeStep.isCore
                      ? '#1D4ED8'
                      : '#D97706',
                    borderBottomColor: isLastStep
                      ? '#047857'
                      : activeStep.isCore
                      ? '#1E40AF'
                      : '#B45309',
                  },
                ]}>
                <Text style={styles.nextBtnText}>
                  {isLastStep ? 'Selesai Tour 🎉' : 'Lanjut Tour ➔'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 24 : 14,
    paddingHorizontal: 12,
  },
  dockCard: {
    width: '100%',
    borderRadius: 22,
    padding: 16,
    borderWidth: 2,
    borderBottomWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  dockTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  tagGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  categoryTagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  categoryTagText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  stepProgressPill: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  stepProgressText: {
    fontSize: 10,
    fontWeight: '800',
  },
  topControlBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  controlIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dockTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  titleIconSquare: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  dockTitle: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  dockSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 1,
  },
  dockDesc: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
    marginBottom: 10,
  },
  focusTipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  focusTipText: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
    lineHeight: 15,
  },
  dockBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderBottomWidth: 3.5,
    minHeight: 38,
  },
  navBtnDisabled: {
    opacity: 0.45,
  },
  prevBtn: {},
  prevBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  nextBtn: {
    flex: 1,
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dotItem: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotItemActive: {
    width: 14,
    borderRadius: 4,
  },
  // MINIMIZED PILL STYLES
  minimizedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 2,
    borderBottomWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    maxWidth: 480,
    width: '100%',
    gap: 8,
  },
  minimizedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  minimizedBadge: {
    width: 24,
    height: 24,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  minimizedText: {
    fontSize: 12,
    fontWeight: '800',
    flex: 1,
  },
  minimizedActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  minimizedNextBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  minimizedNextBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  minimizedIconBtn: {
    padding: 4,
  },
  minimizedCloseBtn: {
    padding: 4,
    marginLeft: 2,
  },
});
