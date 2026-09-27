import { ScrollView, StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';
import { useAppStore } from '@/store/useAppStore';
import { getCourseById, MOCK_COURSES } from '@/data/mockDatabase';

export default function CourseDetailsScreen() {
  const { colors, typography, spacing, radii, shadows } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { enrolledCourses, enrollInCourse } = useAppStore();
  
  const course = getCourseById(id || '1') || MOCK_COURSES[0];
  const isEnrolled = enrolledCourses.includes(course.id);

  const [activeTab, setActiveTab] = useState<'syllabus' | 'overview' | 'instructor' | 'reviews'>('syllabus');
  const [expandedModule, setExpandedModule] = useState<number | null>(1);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isShared, setIsShared] = useState(false);

  const toggleAccordion = (mod: number) => {
    setExpandedModule(expandedModule === mod ? null : mod);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm, backgroundColor: colors.headerBg }]}>
        <View style={styles.headerRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={24} color={colors.primaryContainer} />
            </TouchableOpacity>
            <Text style={[typography.headlineSm, { color: colors.textPrimary }]} numberOfLines={1}>Course Details</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={styles.iconBtn} 
              onPress={() => {
                setIsShared(true);
                setTimeout(() => setIsShared(false), 2000);
              }}
            >
              <Ionicons name={isShared ? "checkmark" : "share-outline"} size={20} color={isShared ? colors.success : colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 60,
          paddingBottom: insets.bottom + 100, // space for sticky bottom bar
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Media Preview Card */}
        <View style={{ paddingHorizontal: spacing.base, marginTop: spacing.sm }}>
          <View style={[styles.mediaCard, { borderRadius: radii.xl, backgroundColor: colors.surfaceContainer }]}>
            <Image
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9XyMgiXQz3yHvAdSyGMrY-x1EeYCGPA3FtO5esjNVIsRkYMZ8xp5BlfDcdQHkiwtoHTNyxgfuq6Zw04h3mM5YYYa0AwV3lIjmgAvADrA5nYjmuZg7fX8tWNPZaXeakmM3lKZq2k8co9oaSZQ_lUkmowkXWFjlvlSCWzNswBnV_dSJeRyrn1YjxzSyNokvQBUGmR3JbGfLaXWgP3BMVX8DQTWNPwjPRccQfew8A66hRsoSYbkeGpG8' }}
              style={styles.mediaImg}
            />
            <View style={styles.mediaOverlay} />
            
            {/* Top Left Badge */}
            <View style={[styles.badgeTopLeft, { backgroundColor: 'rgba(255,255,255,0.8)' }]}>
              <View style={[styles.pulseDot, { backgroundColor: colors.success }]} />
              <Text style={[typography.labelSm, { color: colors.textPrimary, marginLeft: 4 }]}>iOS 18 Native</Text>
            </View>
            
            {/* Top Right Badge */}
            <View style={[styles.badgeTopRight, { backgroundColor: 'rgba(0,0,0,0.4)' }]}>
              <Ionicons name="videocam" size={14} color="#fff" />
              <Text style={[typography.labelSm, { color: '#fff', marginLeft: 4 }]}>02:15 Trailer</Text>
            </View>

            {/* Play Button */}
            <TouchableOpacity 
              style={[styles.playBtn, { backgroundColor: colors.surface0 }, shadows.md]}
              onPress={() => router.push('/lesson/1')}
            >
              <Ionicons name="play" size={32} color={colors.primaryContainer} style={{ marginLeft: 4 }} />
            </TouchableOpacity>

            {/* Bottom Info */}
            <View style={styles.mediaBottom}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name="tv" size={16} color="#fff" />
                <Text style={[typography.labelMd, { color: '#fff', fontWeight: '500' }]}>4K ProRes · Interactive</Text>
              </View>
              <View style={[styles.previewBadge, { backgroundColor: colors.primaryContainer }]}>
                <Text style={[typography.labelSm, { color: colors.onPrimary, fontWeight: '500' }]}>Free Preview</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Metadata */}
        <View style={{ paddingHorizontal: spacing.base, marginTop: spacing.md }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            <View style={[styles.tag, { backgroundColor: colors.surface2 }]}><Text style={[typography.labelSm, { color: colors.primaryContainer, fontWeight: '600' }]}>SwiftUI 6.0</Text></View>
            <View style={[styles.tag, { backgroundColor: colors.surface2 }]}><Text style={[typography.labelSm, { color: colors.textSecondary }]}>ActivityKit 2</Text></View>
            <View style={[styles.tag, { backgroundColor: colors.surface2 }]}><Text style={[typography.labelSm, { color: colors.textSecondary }]}>Updated Autumn 2026</Text></View>
          </View>
          
          <Text style={[typography.headlineLg, { color: colors.textPrimary, marginTop: 12, fontWeight: '700' }]}>
            Mastering Dynamic Island & Live Activities
          </Text>
          
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginTop: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="star" size={16} color={colors.warning} />
              <Text style={[typography.labelLg, { color: colors.textPrimary, fontWeight: '700' }]}>4.9</Text>
              <Text style={[typography.bodySm, { color: colors.textTertiary }]}>(1,420)</Text>
            </View>
            <View style={[styles.dot, { backgroundColor: colors.surface4 }]} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="people" size={16} color={colors.textSecondary} />
              <Text style={[typography.bodySm, { color: colors.textSecondary }]}>6,830 learners</Text>
            </View>
            <View style={[styles.dot, { backgroundColor: colors.surface4 }]} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="time" size={16} color={colors.textSecondary} />
              <Text style={[typography.bodySm, { color: colors.textSecondary }]}>4h 30m</Text>
            </View>
          </View>

          {/* Instructor */}
          <View style={[styles.instructorCard, { backgroundColor: colors.surface0, borderRadius: radii.xl, marginTop: spacing.lg }, shadows.sm]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
              <View>
                <Image source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGgSozZfOD_syYPVPeoag9sbUO25CMCD-btkU17lTV5sDGIj-mNMpfJw7STtknlXF2MbLAG2cdS0wvGi5bewqZM_NQ8ZYh6yu-P-xb-j7OsufPIbqBZOrNlKFxaYbyYgcy-mPfR2gEqZ3aYphgKvruI3d9Gg_GhsKrFu_YIf9IQzoxrc1vxXzbTmnUOJtpKk20JT6aVmh5JtZ7k0NzfeA8C6uUr08FnII77V4zmJH4RSH8Xdg7heV5' }} style={styles.instImg} />
                <View style={[styles.instBadge, { backgroundColor: colors.primaryContainer }]}>
                  <Ionicons name="checkmark" size={10} color={colors.onPrimary} />
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[typography.headlineSm, { color: colors.textPrimary }]} numberOfLines={1}>Sarah Lin</Text>
                <Text style={[typography.bodySm, { color: colors.textSecondary, marginTop: 2 }]} numberOfLines={1}>Principal iOS Architect</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={[styles.followBtn, { backgroundColor: isFollowing ? colors.surface1 : colors.surface2 }]} 
              onPress={() => setIsFollowing(!isFollowing)}
            >
              <Text style={[typography.labelMd, { color: isFollowing ? colors.textSecondary : colors.primaryContainer, fontWeight: '600' }]}>{isFollowing ? 'Following' : 'Follow'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Segmented Control */}
        <View style={{ paddingHorizontal: spacing.base, marginTop: spacing.xl }}>
          <View style={[styles.tabBar, { backgroundColor: colors.surface2, borderRadius: radii.lg }]}>
            {['syllabus', 'overview', 'instructor', 'reviews'].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tabBtn, activeTab === tab ? { backgroundColor: colors.surface0, ...shadows.sm } : null]}
                onPress={() => setActiveTab(tab as any)}
              >
                <Text style={[typography.labelMd, { color: activeTab === tab ? colors.primaryContainer : colors.textSecondary, fontWeight: activeTab === tab ? '600' : '500', textTransform: 'capitalize' }]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tab Content */}
        <View style={{ paddingHorizontal: spacing.base, marginTop: spacing.lg }}>
          {activeTab === 'syllabus' && (
            <View style={{ gap: spacing.md }}>
              <View style={[styles.progBanner, { backgroundColor: colors.surface0, borderRadius: radii.xl }, shadows.sm]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={[typography.labelMd, { color: colors.textPrimary, fontWeight: '500' }]}>Your Progress</Text>
                  <Text style={[typography.labelMd, { color: colors.primaryContainer, fontWeight: '600' }]}>1 of 18 Complete (6%)</Text>
                </View>
                <View style={[styles.progBg, { backgroundColor: colors.surface2 }]}>
                  <View style={[styles.progFill, { backgroundColor: colors.primaryContainer, width: '6%' }]} />
                </View>
              </View>

              {/* Module 1 */}
              <View style={[styles.moduleCard, { backgroundColor: colors.surface0, borderRadius: radii.xl }, shadows.sm]}>
                <TouchableOpacity style={styles.moduleHeader} onPress={() => toggleAccordion(1)}>
                  <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={[typography.labelSm, { color: colors.primaryContainer, fontWeight: '600', textTransform: 'uppercase' }]}>Module 01</Text>
                      <View style={[styles.dot, { backgroundColor: colors.surface4 }]} />
                      <Text style={[typography.bodySm, { color: colors.textTertiary }]}>3 Lessons · 45 mins</Text>
                    </View>
                    <Text style={[typography.headlineSm, { color: colors.textPrimary, marginTop: 4 }]}>Foundations of ActivityKit</Text>
                  </View>
                  <View style={[styles.modIcon, { backgroundColor: colors.surface2 }]}>
                    <Ionicons name={expandedModule === 1 ? "chevron-up" : "chevron-down"} size={20} color={colors.textSecondary} />
                  </View>
                </TouchableOpacity>

                {expandedModule === 1 && (
                  <View style={styles.moduleBody}>
                    <View style={styles.lessonItem}>
                      <View style={[styles.lessonIconBox, { backgroundColor: 'rgba(50, 183, 107, 0.15)' }]}>
                        <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[typography.labelMd, { color: colors.textPrimary, fontWeight: '500' }]} numberOfLines={1}>01. ActivityAttributes & State</Text>
                        <Text style={[typography.bodySm, { color: colors.textTertiary, marginTop: 2 }]}>12:30 · <Text style={{ color: colors.success }}>Completed</Text></Text>
                      </View>
                    </View>
                    <View style={[styles.lessonSep, { backgroundColor: colors.surface2 }]} />
                    <TouchableOpacity 
                      style={[styles.lessonItem, { backgroundColor: colors.cardHighlight, borderRadius: radii.lg }]}
                      onPress={() => router.push('/lesson/1')}
                    >
                      <View style={[styles.lessonIconBox, { backgroundColor: colors.primaryContainer }]}>
                        <Ionicons name="play" size={18} color={colors.onPrimary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[typography.labelMd, { color: colors.primaryContainer, fontWeight: '600' }]} numberOfLines={1}>02. Expanded Presentation State</Text>
                        <Text style={[typography.bodySm, { color: colors.primaryContainer, opacity: 0.8, marginTop: 2 }]}>18:15 · Up Next</Text>
                      </View>
                    </TouchableOpacity>
                    <View style={[styles.lessonSep, { backgroundColor: colors.surface2 }]} />
                    <View style={[styles.lessonItem, { opacity: 0.7 }]}>
                      <View style={[styles.lessonIconBox, { backgroundColor: colors.surface2 }]}>
                        <Ionicons name="lock-closed" size={16} color={colors.textTertiary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[typography.labelMd, { color: colors.textSecondary, fontWeight: '500' }]} numberOfLines={1}>03. Lock Screen vs Minimal</Text>
                        <Text style={[typography.bodySm, { color: colors.textTertiary, marginTop: 2 }]}>14:45 · Requires Lesson 02</Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>

              {/* Module 2 */}
              <View style={[styles.moduleCard, { backgroundColor: colors.surface0, borderRadius: radii.xl }, shadows.sm]}>
                <TouchableOpacity style={styles.moduleHeader} onPress={() => toggleAccordion(2)}>
                  <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={[typography.labelSm, { color: colors.textTertiary, fontWeight: '600', textTransform: 'uppercase' }]}>Module 02</Text>
                      <View style={[styles.dot, { backgroundColor: colors.surface4 }]} />
                      <Text style={[typography.bodySm, { color: colors.textTertiary }]}>4 Lessons · 1h 15m</Text>
                    </View>
                    <Text style={[typography.headlineSm, { color: colors.textPrimary, marginTop: 4 }]}>Push Notification Updates</Text>
                  </View>
                  <View style={[styles.modIcon, { backgroundColor: colors.surface2 }]}>
                    <Ionicons name={expandedModule === 2 ? "chevron-up" : "chevron-down"} size={20} color={colors.textSecondary} />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {activeTab === 'overview' && (
            <View style={[styles.panelCard, { backgroundColor: colors.surface0, borderRadius: radii.xl }, shadows.sm]}>
              <Text style={[typography.headlineSm, { color: colors.textPrimary }]}>Course Description</Text>
              <Text style={[typography.bodyMd, { color: colors.textSecondary, marginTop: 12, lineHeight: 22 }]}>
                Bridge the gap between static iOS apps and fluid, glanceable dynamic experiences. In this Masterclass, we reconstruct the Dynamic Island architecture used by top tier sports, delivery, and travel apps to build buttery 120Hz interactive widgets that captivate users.
              </Text>
            </View>
          )}
        </View>

      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={[styles.bottomBar, { backgroundColor: colors.dockBg, borderTopWidth: 1, borderTopColor: colors.dockBorder, paddingBottom: insets.bottom + 12 }, shadows.lg]}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
            <Text style={[typography.displayLgMobile, { color: colors.textPrimary }]}>$79.00</Text>
            <Text style={[typography.bodySm, { color: colors.textTertiary, textDecorationLine: 'line-through' }]}>$149</Text>
          </View>
          <Text style={[typography.labelSm, { color: colors.success, marginTop: 4, fontWeight: '500' }]}>✓ 30-day guarantee</Text>
        </View>
        {isEnrolled ? (
          <TouchableOpacity 
            style={[styles.enrollBtn, { backgroundColor: colors.surface2 }]}
            onPress={() => router.push('/lesson/1')}
          >
            <Text style={[typography.labelLg, { color: colors.primaryContainer }]}>Resume</Text>
            <Ionicons name="play" size={20} color={colors.primaryContainer} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.enrollBtn, { backgroundColor: colors.primaryContainer }]}
            onPress={() => {
              router.push({ pathname: '/checkout', params: { courseId: course.id } });
            }}
          >
            <Text style={[typography.labelLg, { color: colors.onPrimary }]}>Enroll Now</Text>
            <Ionicons name="arrow-forward" size={20} color={colors.onPrimary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginLeft: -8,
  },
  headerRight: {
    flexDirection: 'row',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaCard: {
    width: '100%',
    aspectRatio: 16 / 10,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaImg: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
  },
  mediaOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  badgeTopLeft: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  badgeTopRight: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  playBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  mediaBottom: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  previewBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  instructorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  instImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  instBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  followBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  tabBar: {
    flexDirection: 'row',
    padding: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  progBanner: {
    padding: 16,
  },
  progBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progFill: {
    height: '100%',
    borderRadius: 4,
  },
  moduleCard: {
    overflow: 'hidden',
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  modIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  lessonIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonSep: {
    height: 1,
    marginHorizontal: 8,
  },
  panelCard: {
    padding: 16,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  enrollBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 48,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
});
