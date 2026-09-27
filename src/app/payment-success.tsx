import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { useState } from 'react';

import { useTheme } from '@/hooks/use-theme';
import { useAppStore } from '@/store/useAppStore';
import { getCourseById, getLessonById, MOCK_COURSES } from '@/data/mockDatabase';

export default function PaymentSuccessScreen() {
  const { colors, typography, spacing, radii, shadows } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { courseId, finalPrice } = useLocalSearchParams<{ courseId: string, finalPrice: string }>();
  const { upgradeToPro, enrollInCourse } = useAppStore();

  const course = getCourseById(courseId || '1') || MOCK_COURSES[0];
  const paidAmount = finalPrice ? parseFloat(finalPrice) : 64.00;
  
  const firstLessonId = course.lessons?.[0];
  const firstLesson = firstLessonId ? getLessonById(firstLessonId) : null;

  useEffect(() => {
    // Record the purchase logic in the global context
    upgradeToPro();
    enrollInCourse(course.id);
  }, [course.id, enrollInCourse, upgradeToPro]);


  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.push('/')} style={styles.iconBtn}>
            <Ionicons name="close" size={26} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 50,
          paddingBottom: insets.bottom + 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: spacing.base, alignItems: 'center', marginBottom: spacing.lg }}>
          {/* Success Graphic */}
          <View style={[styles.checkCircle, { backgroundColor: 'rgba(50, 183, 107, 0.15)' }]}>
            <View style={[styles.checkInner, { backgroundColor: colors.success }, shadows.md]}>
              <Ionicons name="checkmark" size={36} color={colors.onPrimary} style={{ fontWeight: 'bold' }} />
            </View>
          </View>
          
          <View style={[styles.statusTag, { backgroundColor: 'rgba(50, 183, 107, 0.1)' }]}>
            <View style={[styles.dot, { backgroundColor: colors.success }]} />
            <Text style={[typography.labelSm, { color: colors.success, fontWeight: '600' }]}>Confirmed & Active</Text>
          </View>
          
          <Text style={[typography.headlineLg, { color: colors.textPrimary, marginBottom: 8 }]}>Payment Successful!</Text>
          <Text style={[typography.bodyMd, { color: colors.textSecondary, textAlign: 'center', paddingHorizontal: 16 }]}>
            You are now enrolled in <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>{course.title}</Text>. A copy of this receipt was sent to {useAppStore.getState().user.email}.
          </Text>
        </View>

        <View style={{ paddingHorizontal: spacing.base, gap: spacing.md }}>
          {/* Digital Receipt */}
          <View style={[styles.receiptCard, { backgroundColor: colors.surface0, borderRadius: radii.xl }, shadows.sm]}>
            <View style={[styles.receiptTop, { backgroundColor: 'rgba(94, 92, 230, 0.08)' }]}>
              <View style={[styles.receiptIcon, { backgroundColor: colors.surface0 }, shadows.sm]}>
                <Ionicons name="apps" size={24} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[typography.labelSm, { color: colors.primary, textTransform: 'uppercase', letterSpacing: 1 }]}>Specialized Course</Text>
                <Text style={[typography.headlineSm, { color: colors.textPrimary }]} numberOfLines={1}>{course.title}</Text>
                <Text style={[typography.bodySm, { color: colors.textSecondary }]}>By {course.instructor.name}</Text>
              </View>
            </View>
            
            <View style={styles.receiptDetails}>
              <View style={styles.detailRow}>
                <Text style={[typography.bodySm, { color: colors.textSecondary }]}>Transaction ID</Text>
                <Text style={[typography.labelMd, { color: colors.textPrimary, fontFamily: 'monospace' }]}>#EDU-8942-X18</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[typography.bodySm, { color: colors.textSecondary }]}>Date & Time</Text>
                <Text style={[typography.bodySm, { color: colors.textPrimary, fontWeight: '500' }]}>Today, 09:41 AM</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[typography.bodySm, { color: colors.textSecondary }]}>Payment Method</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View style={[styles.payMethodTag, { backgroundColor: colors.surface2 }]}>
                    <Ionicons name="card" size={12} color={colors.textPrimary} />
                    <Text style={[typography.labelSm, { color: colors.textPrimary }]}>Pay</Text>
                  </View>
                  <Text style={[typography.bodySm, { color: colors.textPrimary }]}>•••• 4242</Text>
                </View>
              </View>
            </View>

            {/* Ticket Notches */}
            <View style={styles.notchRow}>
              <View style={[styles.notch, styles.notchLeft, { backgroundColor: colors.background }]} />
              <View style={[styles.dashLine, { borderBottomColor: colors.surface3 }]} />
              <View style={[styles.notch, styles.notchRight, { backgroundColor: colors.background }]} />
            </View>

            <View style={[styles.receiptTotal, { backgroundColor: colors.surface1 }]}>
              <View>
                <Text style={[typography.labelMd, { color: colors.textSecondary }]}>Total Paid</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                  <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                  <Text style={[typography.labelSm, { color: colors.success }]}>Apple Pay Verified</Text>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[typography.headlineLg, { color: colors.textPrimary, fontWeight: 'bold' }]}>${paidAmount.toFixed(2)}</Text>
                <Text style={[typography.labelSm, { color: colors.textTertiary }]}>USD · Lifetime Access</Text>
              </View>
            </View>
          </View>

          {/* Quick-Start Card */}
          <View style={[styles.startCard, { backgroundColor: colors.surface0, borderRadius: radii.xl }, shadows.sm]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={[styles.dot, { backgroundColor: colors.primaryContainer }]} />
                <Text style={[typography.labelSm, { color: colors.textSecondary, textTransform: 'uppercase' }]}>Ready on Canvas</Text>
              </View>
              <View style={[styles.readyTag, { backgroundColor: 'rgba(68, 65, 204, 0.1)' }]}>
                <Text style={[typography.labelSm, { color: colors.primary }]}>Xcode 16 Ready</Text>
              </View>
            </View>
            
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
              <View style={[styles.startIcon, { backgroundColor: 'rgba(68, 65, 204, 0.1)' }]}>
                <Ionicons name="play" size={20} color={colors.primary} style={{ marginLeft: 2 }} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[typography.headlineSm, { color: colors.textPrimary }]}>Next Up: Lesson 01</Text>
                <Text style={[typography.bodySm, { color: colors.textSecondary }]}>{firstLesson?.title || 'Introduction'}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Ionicons name="time-outline" size={14} color={colors.textTertiary} />
                    <Text style={[typography.labelMd, { color: colors.textSecondary }]}>{Math.round((firstLesson?.durationSeconds || 720) / 60)} mins</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Ionicons name="folder-outline" size={14} color={colors.textTertiary} />
                    <Text style={[typography.labelMd, { color: colors.textSecondary }]}>Starter Project Included</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View style={{ gap: 12, marginTop: 8 }}>
            <TouchableOpacity 
              style={[styles.primaryBtn, { backgroundColor: colors.primaryContainer }, shadows.sm]}
              onPress={() => router.push(`/lesson/${firstLesson?.id || '1'}`)}
            >
              <Text style={[typography.labelLg, { color: colors.onPrimary }]}>Start Learning Now</Text>
              <Ionicons name="arrow-forward" size={18} color={colors.onPrimary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.secondaryBtn, { backgroundColor: isDownloaded ? 'rgba(50, 183, 107, 0.1)' : colors.surface2 }]} 
              onPress={() => {
                if (isDownloaded) return;
                setIsDownloading(true);
                setTimeout(() => {
                  setIsDownloading(false);
                  setIsDownloaded(true);
                }, 1500);
              }}
            >
              <Ionicons name={isDownloaded ? "checkmark-circle" : "download-outline"} size={20} color={isDownloaded ? colors.success : colors.onSurfaceVariant} />
              <Text style={[typography.labelLg, { color: isDownloaded ? colors.success : colors.textPrimary, fontWeight: '500' }]}>
                {isDownloading ? 'Downloading...' : isDownloaded ? 'Invoice Saved' : 'Download Invoice (PDF)'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ alignItems: 'center', paddingVertical: 8 }} onPress={() => router.push('/my-learning')}>
              <Text style={[typography.labelMd, { color: colors.primary }]}>Go to My Learning</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 56 },
  iconBtn: { width: 44, height: 44, justifyContent: 'center' },
  checkCircle: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  checkInner: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  statusTag: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16, marginBottom: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  receiptCard: { overflow: 'hidden' },
  receiptTop: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  receiptIcon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  receiptDetails: { padding: 16, gap: 12 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  payMethodTag: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, gap: 4 },
  notchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 2, height: 24, overflow: 'hidden' },
  notch: { width: 16, height: 24, position: 'absolute' },
  notchLeft: { left: -8, borderTopRightRadius: 12, borderBottomRightRadius: 12 },
  notchRight: { right: -8, borderTopLeftRadius: 12, borderBottomLeftRadius: 12 },
  dashLine: { flex: 1, marginHorizontal: 16, borderBottomWidth: 1, borderStyle: 'dashed' },
  receiptTotal: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  startCard: { padding: 16 },
  readyTag: { paddingHorizontal: 10, paddingVertical: 2, borderRadius: 12 },
  startIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  primaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 48, borderRadius: 12, gap: 8 },
  secondaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 48, borderRadius: 12, gap: 8 },
});

