import { ScrollView, StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';

import { useState } from 'react';
import { useTheme } from '@/hooks/use-theme';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';
import { MOCK_COURSES, getCourseById, getLessonById } from '@/data/mockDatabase';
import { TextInput } from 'react-native';

export default function MyLearningScreen() {
  const { colors, typography, spacing, radii, shadows } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { enrolledCourses, courseProgress, completedLessons, bookmarkedCourses } = useAppStore();

  const inProgressCount = enrolledCourses.length;
  const completedCount = completedLessons.length;

  const [activeSegment, setActiveSegment] = useState('In Progress');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<any>(null);

  const activeCourseId = enrolledCourses.length > 0 ? enrolledCourses[0] : '1';
  const isEnrolledInCourse1 = enrolledCourses.includes(activeCourseId);
  const activeCourse = getCourseById(activeCourseId) || MOCK_COURSES[0];
  const currentProgress = courseProgress[activeCourseId] || 0;
  
  const activeLessonId = activeCourse.lessons?.[0];
  const activeLesson = activeLessonId ? getLessonById(activeLessonId) : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.sm,
          paddingBottom: insets.bottom + 96,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={{ paddingHorizontal: spacing.base, marginTop: spacing.xs }}>
          <View style={styles.header}>
            <View>
              <Text style={[typography.labelSm, { color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '600' }]}>
                Track your journey
              </Text>
              <Text style={[typography.displayLgMobile, { color: colors.textPrimary, marginTop: 4 }]}>
                My Learning
              </Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.surface0 }, shadows.sm]} onPress={() => setShowSearch(!showSearch)}>
                <Ionicons name="search" size={20} color={colors.textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.iconBtn, { backgroundColor: colors.surface0 }, shadows.sm]}
                onPress={() => router.push('/downloads')}
              >
                <Ionicons name="options" size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          {showSearch && (
            <View style={{ marginTop: spacing.sm, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface0, borderRadius: radii.lg, paddingHorizontal: 12, height: 44, ...shadows.sm }}>
              <Ionicons name="search" size={18} color={colors.textSecondary} />
              <TextInput 
                style={[typography.bodyMd, { flex: 1, marginLeft: 8, color: colors.textPrimary }]}
                placeholder="Search my learning..."
                placeholderTextColor={colors.textTertiary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
            </View>
          )}

          {/* Segmented Control */}
          <View style={[styles.segmentedControl, { backgroundColor: colors.surface2, marginTop: spacing.md }]}>
            <TouchableOpacity 
              style={[activeSegment === 'In Progress' ? styles.segmentBtnActive : styles.segmentBtn, activeSegment === 'In Progress' && { backgroundColor: colors.surface0, ...shadows.sm }]} 
              onPress={() => setActiveSegment('In Progress')}
            >
              <Text style={[typography.labelMd, { color: activeSegment === 'In Progress' ? colors.primaryContainer : colors.textSecondary, fontWeight: activeSegment === 'In Progress' ? '600' : '400' }]}>In Progress ({inProgressCount})</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[activeSegment === 'Completed' ? styles.segmentBtnActive : styles.segmentBtn, activeSegment === 'Completed' && { backgroundColor: colors.surface0, ...shadows.sm }]} 
              onPress={() => setActiveSegment('Completed')}
            >
              <Text style={[typography.labelMd, { color: activeSegment === 'Completed' ? colors.primaryContainer : colors.textSecondary, fontWeight: activeSegment === 'Completed' ? '600' : '400' }]}>Completed ({completedCount})</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[activeSegment === 'Bookmarked' ? styles.segmentBtnActive : styles.segmentBtn, activeSegment === 'Bookmarked' && { backgroundColor: colors.surface0, ...shadows.sm }]} 
              onPress={() => setActiveSegment('Bookmarked')}
            >
              <Text style={[typography.labelMd, { color: activeSegment === 'Bookmarked' ? colors.primaryContainer : colors.textSecondary, fontWeight: activeSegment === 'Bookmarked' ? '600' : '400' }]}>Bookmarked</Text>
            </TouchableOpacity>
          </View>
        </View>

        {activeSegment === 'In Progress' && (
          <View>

        {/* Primary Active Course Spotlight */}
        <View style={{ paddingHorizontal: spacing.base, marginTop: spacing.lg }}>
          <View style={[styles.spotlightCard, { backgroundColor: colors.surface0, borderRadius: radii.xl }, shadows.sm]}>
            <View style={styles.spotlightHeader}>
              <View style={{ flex: 1, marginRight: spacing.md }}>
                <View style={[styles.spotlightTag, { backgroundColor: colors.primaryFixed }]}>
                  <View style={[styles.dot, { backgroundColor: colors.primaryContainer, width: 6, height: 6 }]} />
                  <Text style={[typography.labelSm, { color: colors.primaryContainer, fontWeight: '600' }]}>Continue Learning</Text>
                </View>
                <Text style={[typography.headlineSm, { color: colors.textPrimary, marginTop: 8 }]} numberOfLines={2}>
                  {activeCourse.title}
                </Text>
                <Text style={[typography.bodySm, { color: colors.textSecondary, marginTop: 2 }]}>
                  Instructor: {activeCourse.instructor.name}
                </Text>
              </View>
              
              <View style={styles.gaugeContainer}>
                <Svg width="64" height="64" viewBox="0 0 64 64" style={{ transform: [{ rotate: '-90deg' }] }}>
                  <Circle cx="32" cy="32" r="26" stroke={colors.surface3} strokeWidth="5" fill="none" />
                  <Circle
                    cx="32"
                    cy="32"
                    r="26"
                    stroke={colors.primaryContainer}
                    strokeWidth="5"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray="163.36"
                    strokeDashoffset={163.36 - (163.36 * currentProgress / 100)} // dynamic
                  />
                </Svg>
                <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
                  <Text style={[typography.labelMd, { color: colors.textPrimary, fontWeight: '700' }]}>{currentProgress}%</Text>
                </View>
              </View>
            </View>

            <View style={[styles.spotlightModule, { backgroundColor: colors.surface1, borderRadius: radii.md }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="play-circle" size={16} color={colors.primaryContainer} />
                <Text style={[typography.labelSm, { color: colors.textSecondary, fontWeight: '500' }]} numberOfLines={1}>
                  Module 01 • {activeLesson?.title || 'Introduction'}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
                <Ionicons name="calendar-outline" size={14} color={colors.warning} />
                <Text style={[typography.labelSm, { color: colors.onSurfaceVariant, fontWeight: '500' }]}>
                  Quiz: {activeCourse.title} scheduled today
                </Text>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.spotlightBtn, { backgroundColor: colors.primaryContainer, borderRadius: radii.md }]}
              onPress={() => router.push(`/lesson/${activeLesson?.id || '1'}`)}
            >
              <Ionicons name="play" size={20} color={colors.onPrimary} />
              <Text style={[typography.labelLg, { color: colors.onPrimary, marginLeft: 8 }]}>Resume Lesson</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Learning Momentum */}
        <View style={{ paddingHorizontal: spacing.base, marginTop: spacing.xl }}>
          <View style={styles.sectionHeader}>
            <Text style={[typography.headlineSm, { color: colors.textPrimary }]}>Learning Momentum</Text>
            <Text style={[typography.labelSm, { color: colors.primaryContainer, fontWeight: '600' }]}>Weekly Goal (85%)</Text>
          </View>

          <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm, flexWrap: 'wrap' }}>
            {/* Streak */}
            <View style={[styles.bentoStreak, { backgroundColor: colors.surface0, borderRadius: radii.xl }, shadows.sm]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={[styles.iconBox, { backgroundColor: colors.primaryFixed }]}>
                    <Ionicons name="flame" size={18} color={colors.tertiary} />
                  </View>
                  <View>
                    <Text style={[typography.headlineSm, { color: colors.textPrimary, fontWeight: '700' }]}>{useAppStore.getState().user.streak || 14} Days</Text>
                    <Text style={[typography.labelSm, { color: colors.textSecondary }]}>Current Study Streak</Text>
                  </View>
                </View>
                <View style={[styles.personalBest, { backgroundColor: colors.successTint }]}>
                  <Text style={[typography.labelSm, { color: colors.success, fontWeight: '600' }]}>Personal Best 🔥</Text>
                </View>
              </View>
              <View style={styles.weekDots}>
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                  <View key={idx} style={{ alignItems: 'center', gap: 6 }}>
                    <Text style={[typography.labelSm, { color: idx === 6 ? colors.primary : colors.textTertiary, fontWeight: idx === 6 ? '700' : '500' }]}>{day}</Text>
                    <View style={[styles.dayDot, { backgroundColor: idx === 6 ? colors.primaryFixedDim : colors.primaryContainer }]}>
                      <Ionicons name="checkmark" size={16} color={idx === 6 ? colors.primaryFixed : colors.onPrimary} />
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Time Spent */}
            <View style={[styles.bentoSmall, { backgroundColor: colors.surface0, borderRadius: radii.xl }, shadows.sm]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={[styles.iconBox, { backgroundColor: colors.secondaryFixed }]}>
                  <Ionicons name="time" size={18} color={colors.secondary} />
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="trending-up" size={14} color={colors.success} />
                  <Text style={[typography.labelSm, { color: colors.success, fontWeight: '600', marginLeft: 2 }]}>+24%</Text>
                </View>
              </View>
              <View style={{ marginTop: 12 }}>
                <Text style={[typography.headlineMd, { color: colors.textPrimary, fontWeight: '700' }]}>6h 45m</Text>
                <Text style={[typography.labelSm, { color: colors.textSecondary, marginTop: 2 }]}>Spent this week</Text>
              </View>
            </View>

            {/* Certs */}
            <View style={[styles.bentoSmall, { backgroundColor: colors.surface0, borderRadius: radii.xl }, shadows.sm]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={[styles.iconBox, { backgroundColor: colors.primaryFixedDim, opacity: 0.8 }]}>
                  <Ionicons name="ribbon" size={18} color={colors.tertiary} />
                </View>
                <Text style={[typography.labelSm, { color: colors.textSecondary, fontWeight: '500' }]}>Verified</Text>
              </View>
              <View style={{ marginTop: 12 }}>
                <Text style={[typography.headlineMd, { color: colors.textPrimary, fontWeight: '700' }]}>2 Certs</Text>
                <Text style={[typography.labelSm, { color: colors.textSecondary, marginTop: 2 }]}>Credentials issued</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Active Curriculum */}
        <View style={{ paddingHorizontal: spacing.base, marginTop: spacing.xl }}>
          <View style={styles.sectionHeader}>
            <Text style={[typography.headlineSm, { color: colors.textPrimary }]}>Active Curriculum</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
              <Text style={[typography.labelSm, { color: colors.primaryContainer, fontWeight: '600' }]}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>
            {enrolledCourses.map((courseId) => {
              const enrolledCourse = getCourseById(courseId);
              if (!enrolledCourse) return null;
              const courseProg = courseProgress[courseId] || 0;
              return (
                <TouchableOpacity 
                  key={courseId}
                  style={[styles.curriculumItem, { backgroundColor: colors.surface0, borderRadius: radii.xl }, shadows.sm]}
                  onPress={() => router.push(`/course/${courseId}`)}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={[styles.curImgBox, { backgroundColor: colors.surface2, borderRadius: radii.lg }]}>
                      <Ionicons name="cube-outline" size={24} color={colors.primary} style={{ margin: 16 }} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={[typography.labelSm, { color: colors.textSecondary }]}>{enrolledCourse.instructor.name}</Text>
                        <Text style={[typography.labelSm, { color: colors.primaryContainer, fontWeight: '600' }]}>{courseProg}%</Text>
                      </View>
                      <Text style={[typography.headlineSm, { color: colors.textPrimary, marginTop: 2 }]} numberOfLines={1}>
                        {enrolledCourse.title}
                      </Text>
                      <Text style={[typography.bodySm, { color: colors.textSecondary, marginTop: 2 }]}>
                        {Math.floor((courseProg / 100) * enrolledCourse.lessons.length)} of {enrolledCourse.lessons.length} lessons completed
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.progressBarBg, { backgroundColor: colors.surface3 }]}>
                    <View style={[styles.progressBarFill, { backgroundColor: colors.primaryContainer, width: `${courseProg}%` }]} />
                  </View>
                </TouchableOpacity>
              );
            })}
            
            {enrolledCourses.length === 0 && (
              <View style={{ padding: 24, alignItems: 'center', backgroundColor: colors.surface0, borderRadius: radii.xl }}>
                 <Text style={[typography.labelLg, { color: colors.textSecondary }]}>No active curriculum</Text>
              </View>
            )}
          </View>
        </View>

        {/* Recent Badges */}
        <View style={{ paddingHorizontal: spacing.base, marginTop: spacing.xl }}>
          <View style={styles.sectionHeader}>
            <Text style={[typography.headlineSm, { color: colors.textPrimary }]}>Recent Badges</Text>
            <Text style={[typography.labelSm, { color: colors.textSecondary }]}>Level 4 Scholar</Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: spacing.sm }}>
            {[
              { title: 'Xcode Pro', desc: 'Build flawless', icon: 'terminal', bg: colors.primaryFixed, color: colors.primaryContainer },
              { title: 'Quiz Master', desc: '100% On 5 quizes', icon: 'ribbon', bg: colors.primaryFixed, color: colors.tertiary },
              { title: 'Night Owl', desc: 'Midnight study', icon: 'moon', bg: colors.secondaryFixed, color: colors.secondary }
            ].map((badge, idx) => (
              <TouchableOpacity key={idx} style={[styles.badgeCard, { backgroundColor: colors.surface0, borderRadius: radii.xl }, shadows.sm]} onPress={() => setSelectedBadge(badge)}>
                <View style={[styles.badgeIcon, { backgroundColor: badge.bg }]}>
                  <Ionicons name={badge.icon as any} size={24} color={badge.color} />
                </View>
                <Text style={[typography.labelMd, { color: colors.textPrimary, fontWeight: '600', marginTop: 8 }]}>{badge.title}</Text>
                <Text style={[typography.labelSm, { color: colors.textSecondary, marginTop: 2 }]}>{badge.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {selectedBadge && (
            <View style={{ marginTop: spacing.md, backgroundColor: colors.surface1, padding: spacing.md, borderRadius: radii.lg, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
               <View style={[styles.badgeIcon, { backgroundColor: selectedBadge.bg }]}><Ionicons name={selectedBadge.icon as any} size={24} color={selectedBadge.color} /></View>
               <View style={{ flex: 1 }}>
                 <Text style={[typography.headlineSm, { color: colors.textPrimary }]}>{selectedBadge.title} Badge</Text>
                 <Text style={[typography.bodySm, { color: colors.textSecondary }]}>You earned this by completing the requirement: {selectedBadge.desc}. Keep it up!</Text>
               </View>
               <TouchableOpacity onPress={() => setSelectedBadge(null)}>
                 <Ionicons name="close-circle" size={24} color={colors.textTertiary} />
               </TouchableOpacity>
            </View>
          )}
        </View>
        </View>
        )}

        {activeSegment === 'Completed' && (
          <View style={{ paddingHorizontal: spacing.base, marginTop: spacing.xl, alignItems: 'center', paddingVertical: 40 }}>
            <Ionicons name="checkmark-circle-outline" size={48} color={colors.success} />
            <Text style={[typography.labelLg, { color: colors.textSecondary, marginTop: 12 }]}>You have completed 5 courses.</Text>
            <Text style={[typography.bodySm, { color: colors.textTertiary, textAlign: 'center', marginTop: 4 }]}>Your certificates are available in your Profile.</Text>
          </View>
        )}

        {activeSegment === 'Bookmarked' && (
          <View style={{ paddingHorizontal: spacing.base, marginTop: spacing.xl, alignItems: 'center', paddingVertical: 40 }}>
            <Ionicons name="bookmark-outline" size={48} color={colors.surface3} />
            <Text style={[typography.labelLg, { color: colors.textSecondary, marginTop: 12 }]}>No bookmarked courses yet.</Text>
          </View>
        )}

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
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentedControl: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    borderRadius: 12,
  },
  segmentBtnActive: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  spotlightCard: {
    padding: 20,
    overflow: 'hidden',
  },
  spotlightHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  spotlightTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  dot: {
    borderRadius: 3,
  },
  gaugeContainer: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spotlightModule: {
    padding: 12,
    marginTop: 16,
  },
  spotlightBtn: {
    width: '100%',
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bentoStreak: {
    width: '100%',
    padding: 16,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personalBest: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  weekDots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingHorizontal: 4,
  },
  dayDot: {
    width: 32,
    height: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bentoSmall: {
    flex: 1,
    padding: 16,
    minWidth: '47%',
  },
  curriculumItem: {
    padding: 16,
  },
  curImgBox: {
    width: 56,
    height: 56,
    overflow: 'hidden',
  },
  curImg: {
    width: '100%',
    height: '100%',
  },
  progressBarBg: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    marginTop: 12,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  badgeCard: {
    flex: 1,
    padding: 14,
    alignItems: 'center',
  },
  badgeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

