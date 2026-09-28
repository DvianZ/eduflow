import { ScrollView, StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Path, Defs, LinearGradient, Stop } from 'react-native-svg';

import { useState } from 'react';
import { useTheme } from '@/hooks/use-theme';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';
import { MOCK_COURSES, getCourseById, getLessonById } from '@/data/mockDatabase';

export default function HomeScreen() {
  const { colors, typography, spacing, radii, shadows } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, enrolledCourses, courseProgress } = useAppStore();

  const [hasNotifications, setHasNotifications] = useState(true);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Active Course logic - pick first enrolled course or default to first mock course
  const activeCourseId = enrolledCourses.length > 0 ? enrolledCourses[0] : '1';
  const isEnrolledInCourse1 = enrolledCourses.includes(activeCourseId);
  const activeCourse = getCourseById(activeCourseId) || MOCK_COURSES[0];
  const course1Progress = courseProgress[activeCourseId] || 0;
  
  const activeLessonId = activeCourse.lessons?.[0];
  const activeLesson = activeLessonId ? getLessonById(activeLessonId) : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Fixed Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + spacing.sm,
            backgroundColor: colors.surface0,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: colors.outlineVariant,
          },
        ]}
      >
        <View style={styles.headerLeft}>
          <View style={[styles.brandIcon, { backgroundColor: colors.primaryContainer }]}>
            <Ionicons name="book" size={20} color={colors.onPrimary} />
          </View>
          <View>
            <Text style={[styles.brandLabel, { color: colors.primaryContainer }]}>
              EDUFLOW
            </Text>
            <Text style={[typography.headlineSm, { color: colors.textPrimary }]}>
              Home Dashboard
            </Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.surface2 }]} onPress={() => { setHasNotifications(false); router.push('/notifications'); }}>
            <Ionicons name="notifications-outline" size={22} color={colors.textSecondary} />
            {hasNotifications && <View style={[styles.statusDot, { backgroundColor: colors.error, right: 8, top: 8 }]} />}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingTop: spacing.lg,
          paddingBottom: insets.bottom + 96,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Greeting & Daily Streak Banner */}
        <View style={[styles.section, { paddingHorizontal: spacing.base }]}>
          <View style={styles.greetingRow}>
            <View style={styles.greetingLeft}>
              <View>
                <Image
                  source={{ uri: user.avatar }}
                  style={styles.profileImage}
                />
                <View style={[styles.statusDot, { backgroundColor: colors.success, borderColor: colors.surface0 }]} />
              </View>
              <View>
                <Text style={[typography.labelSm, { color: colors.textSecondary }]}>Welcome back</Text>
                <Text style={[typography.headlineMd, { color: colors.textPrimary }]}>Good morning, {user.name.split(' ')[0]}</Text>
              </View>
            </View>

            <TouchableOpacity style={[styles.streakBadge, { backgroundColor: showStreakModal ? colors.surface2 : colors.surface0 }, shadows.sm]} onPress={() => setShowStreakModal(!showStreakModal)}>
              <Text style={{ fontSize: 16 }}>🔥</Text>
              <View style={styles.streakText}>
                <Text style={[typography.labelMd, { color: colors.textPrimary, fontWeight: '700' }]}>{user.streak || 14}</Text>
                <Text style={[typography.labelSm, { color: colors.textSecondary }]}>Days</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Daily Target Progress Card */}
        <View style={[styles.section, { paddingHorizontal: spacing.base, marginTop: spacing.md }]}>
          <View style={[styles.goalCard, { backgroundColor: colors.surface0, borderRadius: radii.xl }, shadows.sm]}>
            <View style={styles.goalInfo}>
              <View style={styles.goalLabel}>
                <View style={[styles.dot, { backgroundColor: colors.primaryContainer }]} />
                <Text style={[typography.labelSm, { color: colors.primaryContainer, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }]}>
                  Today's Rhythm
                </Text>
              </View>
              <Text style={[typography.headlineSm, { color: colors.textPrimary, marginTop: spacing.xs }]}>
                Daily Goal 68% Met
              </Text>
              <Text style={[typography.bodySm, { color: colors.textSecondary, marginTop: spacing.xs }]}>
                <Text style={{ color: colors.textPrimary, fontWeight: '500' }}>2 of 3</Text> modules finished · <Text style={{ color: colors.primaryContainer, fontWeight: '600' }}>18m left</Text>
              </Text>
            </View>

            <View style={styles.gaugeContainer}>
              <Svg width="64" height="64" viewBox="0 0 48 48" style={{ transform: [{ rotate: '-90deg' }] }}>
                <Circle cx="24" cy="24" r="19" stroke={colors.surface2} strokeWidth="4.5" fill="none" />
                <Circle
                  cx="24"
                  cy="24"
                  r="19"
                  stroke={colors.primaryContainer}
                  strokeWidth="4.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray="119.38"
                  strokeDashoffset="38.2"
                />
              </Svg>
              <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
                <Text style={[typography.labelMd, { color: colors.textPrimary, fontWeight: '700' }]}>68%</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Resume Learning Hero Card */}
        <View style={[styles.section, { paddingHorizontal: spacing.base, marginTop: spacing.xl }]}>
          <View style={styles.sectionHeader}>
            <Text style={[typography.headlineSm, { color: colors.textPrimary }]}>{isEnrolledInCourse1 ? "Active Course" : "Start Learning"}</Text>
            {isEnrolledInCourse1 && (
              <TouchableOpacity onPress={() => router.push(`/course/${activeCourseId}`)}>
                <Text style={[typography.labelMd, { color: colors.primaryContainer, fontWeight: '600' }]}>Syllabus</Text>
              </TouchableOpacity>
            )}
          </View>

          {isEnrolledInCourse1 ? (
            <View style={[styles.activeCourseCard, { backgroundColor: colors.surface0, borderRadius: radii.xl }, shadows.sm]}>
              <View style={styles.courseHeader}>
                <View style={styles.courseHeaderLeft}>
                  <View style={styles.courseTags}>
                    <View style={[styles.tag, { backgroundColor: colors.secondaryFixed }]}>
                      <Text style={[typography.labelSm, { color: colors.textPrimary, fontWeight: '500' }]}>{activeCourse.category}</Text>
                    </View>
                  </View>
                  <Text style={[typography.headlineSm, { color: colors.textPrimary, marginTop: spacing.xs }]} numberOfLines={1}>
                    {activeCourse.title}
                  </Text>
                  <Text style={[typography.bodySm, { color: colors.textSecondary }]} numberOfLines={1}>
                    {activeCourse.instructor.name} · {activeCourse.instructor.role}
                  </Text>
                </View>
                <View style={[styles.courseIconBox, { backgroundColor: colors.surface2 }]}>
                  <Ionicons name="cube-outline" size={28} color={colors.primaryContainer} />
                </View>
              </View>

              <View style={[styles.lessonBox, { backgroundColor: colors.surface1, borderRadius: radii.lg }]}>
                <View style={styles.lessonBoxHeader}>
                  <Text style={[typography.labelSm, { color: colors.textSecondary, fontWeight: '600' }]}>Up Next</Text>
                  <Text style={[typography.labelSm, { color: colors.primaryContainer, fontWeight: '700' }]}>{course1Progress}% complete</Text>
                </View>
                <Text style={[typography.labelMd, { color: colors.textPrimary, marginTop: 4 }]} numberOfLines={1}>
                  {activeLesson?.title || 'Introduction'}
                </Text>
                <View style={[styles.progressBarBg, { backgroundColor: colors.surface3 }]}>
                  <View style={[styles.progressBarFill, { backgroundColor: colors.primaryContainer, width: `${course1Progress}%` }]} />
                </View>
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity 
                  style={[styles.resumeBtn, { backgroundColor: colors.primaryContainer, borderRadius: radii.lg }]}
                  onPress={() => router.push(`/lesson/${activeLesson?.id || '1'}`)}
                >
                  <Ionicons name="play" size={20} color={colors.onPrimary} />
                  <Text style={[typography.labelLg, { color: colors.onPrimary, marginLeft: spacing.xs }]}>Resume Lesson</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.audioBtn, { backgroundColor: isPlayingAudio ? colors.primaryContainer : colors.surface2, borderRadius: radii.lg }]} 
                  onPress={() => setIsPlayingAudio(!isPlayingAudio)}
                >
                  <Ionicons name={isPlayingAudio ? "pause" : "headset-outline"} size={20} color={isPlayingAudio ? colors.onPrimary : colors.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={[styles.activeCourseCard, { backgroundColor: colors.surface0, borderRadius: radii.xl, alignItems: 'center', paddingVertical: spacing.xl }, shadows.sm]}>
              <View style={[styles.courseIconBox, { backgroundColor: colors.surface1, marginBottom: 16 }]}>
                <Ionicons name="compass" size={32} color={colors.primary} />
              </View>
              <Text style={[typography.headlineSm, { color: colors.textPrimary }]}>No active courses yet</Text>
              <Text style={[typography.bodySm, { color: colors.textSecondary, textAlign: 'center', marginTop: 8, paddingHorizontal: 32 }]}>
                Find a course that interests you and start your learning journey today.
              </Text>
              <TouchableOpacity 
                style={[styles.resumeBtn, { backgroundColor: colors.primaryContainer, borderRadius: radii.lg, marginTop: 24, paddingHorizontal: 32 }]}
                onPress={() => router.push('/explore')}
              >
                <Ionicons name="search" size={20} color={colors.onPrimary} />
                <Text style={[typography.labelLg, { color: colors.onPrimary, marginLeft: spacing.xs }]}>Explore Courses</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Weekly Focus Velocity Micro-Chart */}
        <View style={[styles.section, { paddingHorizontal: spacing.base, marginTop: spacing.xl }]}>
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <Text style={[typography.headlineSm, { color: colors.textPrimary }]}>Focus Velocity</Text>
              <View style={[styles.velocityBadge, { backgroundColor: colors.surfaceContainer }]}>
                <Text style={[typography.labelSm, { color: colors.primary, fontWeight: '600' }]}>Top 5%</Text>
              </View>
            </View>
            <Text style={[typography.labelSm, { color: colors.textSecondary }]}>42m daily avg</Text>
          </View>

          <View style={[styles.velocityCard, { backgroundColor: colors.surface0, borderRadius: radii.xl }, shadows.sm]}>
            <View style={styles.chartContainer}>
              <Svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 320 80">
                <Defs>
                  <LinearGradient id="velocityGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <Stop offset="0%" stopColor={colors.primaryContainer} stopOpacity="0.22" />
                    <Stop offset="100%" stopColor={colors.primaryContainer} stopOpacity="0.0" />
                  </LinearGradient>
                </Defs>
                <Path d="M 0,55 Q 35,62 53,42 T 106,30 T 160,48 T 213,18 T 266,28 T 320,10 L 320,80 L 0,80 Z" fill="url(#velocityGrad)" />
                <Path d="M 0,55 Q 35,62 53,42 T 106,30 T 160,48 T 213,18 T 266,28 T 320,10" fill="none" stroke={colors.primaryContainer} strokeWidth="2.5" strokeLinecap="round" />
                <Circle cx="320" cy="10" r="4.5" fill={colors.primaryContainer} />
                <Circle cx="320" cy="10" r="2" fill={colors.surface0} />
              </Svg>
            </View>
            <View style={styles.daysRow}>
              {['M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                <View key={idx} style={styles.dayCol}>
                  <Text style={[typography.labelSm, { color: colors.textTertiary }]}>{day}</Text>
                  <View style={[styles.dayBar, { backgroundColor: colors.surface3, height: [24, 36, 44, 32, 48, 40][idx] }]} />
                </View>
              ))}
              <View style={styles.dayCol}>
                <Text style={[typography.labelSm, { color: colors.primaryContainer, fontWeight: '700' }]}>S</Text>
                <View style={[styles.dayBar, { backgroundColor: colors.primaryContainer, height: 56 }, shadows.sm]} />
              </View>
            </View>
          </View>
        </View>

        {/* Recommended Next Courses Horizontal Carousel */}
        <View style={[styles.section, { marginTop: spacing.xl }]}>
          <View style={[styles.sectionHeader, { paddingHorizontal: spacing.base }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[typography.headlineSm, { color: colors.textPrimary }]}>Recommended Next</Text>
              <Ionicons name="sparkles" size={16} color={colors.warning} />
            </View>
            <TouchableOpacity onPress={() => router.push('/explore')}>
              <Text style={[typography.labelMd, { color: colors.primaryContainer, fontWeight: '600' }]}>Explore All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: spacing.base, paddingTop: spacing.sm, paddingBottom: spacing.lg, gap: spacing.md }}
          >
            {/* Card 1 */}
            <View style={[styles.recommendCard, { backgroundColor: colors.surface0, borderRadius: radii.xl }, shadows.sm]}>
              <View style={styles.recommendImgContainer}>
                <Image
                  source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuClbqkpJETWl3mQ5JxZ8HQF8tAAuL_DXZUK7gAsiHUI_gS_yFHq6CixJ5K5gLqasqaZeRQ-RZPjFrv_HF3Rxu7EwCuAzOo4bnt1j_sVMFQJXW2uyWjDIuMQE3pWuEldMukI8nS5dTX99cYyloXCsSbYB3g2MESC4ictF6BgBXvoQFM1sfIYlGlvTgeJQ46r95R_d3MfHRSV7lrC-dzVQwLfKhWp_nFNJIQp-kOn6qhEHsUlk0-YSryG' }}
                  style={styles.recommendImg}
                />
                <View style={[styles.lessonBadge, { backgroundColor: 'rgba(255,255,255,0.8)' }]}>
                  <Text style={[typography.labelSm, { color: '#000', fontWeight: '600' }]}>{MOCK_COURSES[0].lessons.length} Lessons</Text>
                </View>
              </View>
              <View style={styles.recommendInfo}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name="star" size={14} color={colors.warning} />
                  <Text style={[typography.labelSm, { color: colors.textPrimary, fontWeight: '700' }]}>4.9</Text>
                  <Text style={[typography.labelSm, { color: colors.textSecondary }]}>· {MOCK_COURSES[0].reviewCount} learners</Text>
                </View>
                <Text style={[typography.headlineSm, { color: colors.textPrimary, marginTop: 4 }]} numberOfLines={2}>
                  {MOCK_COURSES[0].title}
                </Text>
                <View style={styles.recommendAction}>
                  <Text style={[typography.labelSm, { color: colors.textSecondary, fontWeight: '600' }]}>4h 30m</Text>
                  <TouchableOpacity 
                    style={[styles.enrollBtn, { backgroundColor: colors.surface2, borderRadius: radii.md }]}
                    onPress={() => router.push(`/course/${MOCK_COURSES[0].id}`)}
                  >
                    <Text style={[typography.labelMd, { color: colors.primaryContainer, fontWeight: '600' }]}>{enrolledCourses.includes(MOCK_COURSES[0].id) ? 'Resume' : 'Enroll'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Card 2 */}
            <View style={[styles.recommendCard, { backgroundColor: colors.surface0, borderRadius: radii.xl }, shadows.sm]}>
              <View style={styles.recommendImgContainer}>
                <Image
                  source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDcOdwhyhBopdImawT7UIj3PUR-tWRwKPGfd-vK_pogTGietqyPhE5tUgqeBJy2MYoKZ2I3ER1WUcn_iewV_J0kHtErExsTfW-ouOTzaKvzGDc7P_bD_fnBrlgeQb9u2fJAX1xkLJRm5hyZWzoZak2Iv5p4xXi-EZ1GYxyj06zRdMLaqwMOcs8RLCy1vX2_k9nHmtVYjm3YIaXH_8IkLNXTjF_Cjz1XRuoNR5WGvuwPL0H7-OHlsh8L' }}
                  style={styles.recommendImg}
                />
                <View style={[styles.lessonBadge, { backgroundColor: 'rgba(255,255,255,0.8)' }]}>
                  <Text style={[typography.labelSm, { color: '#000', fontWeight: '600' }]}>{MOCK_COURSES[1].lessons.length} Lessons</Text>
                </View>
              </View>
              <View style={styles.recommendInfo}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name="star" size={14} color={colors.warning} />
                  <Text style={[typography.labelSm, { color: colors.textPrimary, fontWeight: '700' }]}>4.8</Text>
                  <Text style={[typography.labelSm, { color: colors.textSecondary }]}>· {MOCK_COURSES[1].reviewCount} learners</Text>
                </View>
                <Text style={[typography.headlineSm, { color: colors.textPrimary, marginTop: 4 }]} numberOfLines={2}>
                  {MOCK_COURSES[1].title}
                </Text>
                <View style={styles.recommendAction}>
                  <Text style={[typography.labelSm, { color: colors.textSecondary, fontWeight: '600' }]}>6h 15m</Text>
                  <TouchableOpacity 
                    style={[styles.enrollBtn, { backgroundColor: colors.surface2, borderRadius: radii.md }]}
                    onPress={() => router.push(`/course/${MOCK_COURSES[1].id}`)}
                  >
                    <Text style={[typography.labelMd, { color: colors.primaryContainer, fontWeight: '600' }]}>{enrolledCourses.includes(MOCK_COURSES[1].id) ? 'Resume' : 'Enroll'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandLabel: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    width: '100%',
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greetingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  streakText: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    overflow: 'hidden',
  },
  goalInfo: {
    flex: 1,
    marginRight: 16,
  },
  goalLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  gaugeContainer: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  activeCourseCard: {
    padding: 20,
  },
  courseHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  courseHeaderLeft: {
    flex: 1,
  },
  courseTags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  courseIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonBox: {
    padding: 12,
    marginTop: 16,
  },
  lessonBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
  },
  resumeBtn: {
    flex: 1,
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioBtn: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  velocityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  velocityCard: {
    padding: 16,
  },
  chartContainer: {
    height: 96,
    width: '100%',
    marginBottom: 8,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 70,
  },
  dayCol: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
    justifyContent: 'flex-end',
  },
  dayBar: {
    width: 6,
    borderRadius: 3,
  },
  recommendCard: {
    width: 260,
    padding: 16,
  },
  recommendImgContainer: {
    width: '100%',
    height: 128,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#E5E5EA',
  },
  recommendImg: {
    width: '100%',
    height: '100%',
  },
  lessonBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  recommendInfo: {
    marginTop: 12,
  },
  recommendAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  enrollBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
});

