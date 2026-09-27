import { ScrollView, StyleSheet, Text, View, Image, TouchableOpacity, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';
import { useAppStore } from '@/store/useAppStore';
import { MOCK_COURSES, formatReviewCount } from '@/data/mockDatabase';

export default function ExploreScreen() {
  const { colors, typography, spacing, radii, shadows } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { enrolledCourses } = useAppStore();


  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [mentors, setMentors] = useState([
    { id: 1, name: 'Elena Rossi', role: 'Spatial UX', following: false, uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCv1uUFAeCWku5j-m0usdw_EIuccBE0RWNNBSsuso-pk1ZcF9quzThC8JHb6FJ8-Cfwnh7m7Ka2H8cZDy121NMvmmqVIOfo52Wp20N5nAF1W99bAsRTY4Xk4wkQhS55zujwMD2URXpejWvXGsqK2DR7yMmwUWpibyQKSFytziXg6A1DJuEzwXiaLlSdGKu5kwuewvwm6hEqEByy0L15RmpHjhB-NfRotWUYUBOnOYG0oqdN5ojJMHe0' },
    { id: 2, name: 'David Chen', role: 'CoreML Lead', following: true, uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCAdEdtSwOSH4RVP2RK_-dmHUtOjdE69dsDCPDM11Pmjw76hye6Ewrp2E2ZKikgmiJonU7o0Y1D1LLLPceESG1fWc1Q0cxxdO5sRRIVKALPkJyr5XCmjXjpFxCCqKnPtzpWycXHsfDa_G_1NOtMVnAhwrnLIDN-UclihwRulAYRwZFo-_aYC8SkAW9IyzcOfYGvFXtrFuTjHBmTuQPGj7tk2fieiZMpvjx8CIDzrjpZc49qXDdL0t7T' },
    { id: 3, name: 'Maya Patel', role: 'Swift Guru', following: false, uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBu904scUTEcT4DGeUl92Su1b2AQVsiBz6HC1hQoV__ljxcFqTu9lzRqne5E-rJa59qhcSYXl6ANH_Lv5n9ebkApKNNp_PuTBtclYC2qGnwfzA3y4HuS7xu50Gz-b1RUTeaSd61ntegwTdClvUUwu05jkkEMxTjC9tH4FFN8H07Q7FGTKX29FISBFi0yOco8SxjT9o0Jsw76ptw63myQ51iQbmsUVlvBZLdiviPWzfl8PG2uu2ZInb1' }
  ]);

  const categories = ['All', 'Spatial UI', 'Graphics', 'CoreML', 'Design Systems'];

  // Filter courses based on search and category
  const filteredCourses = MOCK_COURSES.filter(course => {
    const matchesCategory = activeCategory === 'All' || course.category === activeCategory;
    const matchesSearch = !searchQuery.trim() || 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.sm,
          paddingBottom: insets.bottom + 96,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Toolbar */}
        <View style={[styles.header, { paddingHorizontal: spacing.base, marginTop: spacing.xs }]}>
          <View>
            <Text style={[typography.labelSm, { color: colors.textTertiary, textTransform: 'uppercase', letterSpacing: 1 }]}>
              Discover Knowledge
            </Text>
            <Text style={[typography.displayLgMobile, { color: colors.textPrimary, marginTop: 4 }]}>
              Explore
            </Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={[styles.iconBtn, { backgroundColor: showFilters ? colors.primaryContainer : colors.surface0 }, shadows.sm]} onPress={() => setShowFilters(!showFilters)}>
              <Ionicons name="options" size={20} color={showFilters ? colors.onPrimary : colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.surface0 }, shadows.sm]} onPress={() => router.push('/my-learning')}>
              <Ionicons name="bookmark-outline" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={{ paddingHorizontal: spacing.base, marginTop: spacing.md }}>
          <View style={[styles.searchContainer, { backgroundColor: colors.surface0, borderRadius: radii.lg }, shadows.sm]}>
            <Ionicons name="search" size={20} color={colors.textTertiary} />
            <TextInput
              style={[styles.searchInput, typography.bodyMd, { color: colors.textPrimary }]}
              placeholder={isListening ? "Listening..." : "Search Swift, Spatial UI, AI models..."}
              placeholderTextColor={isListening ? colors.primary : colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity 
              onPress={() => {
                setIsListening(!isListening);
                if (!isListening) {
                  setTimeout(() => setIsListening(false), 3000);
                }
              }}
            >
              <Ionicons name={isListening ? "mic" : "mic-outline"} size={20} color={isListening ? colors.error : colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          {showFilters && (
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
               <View style={{ backgroundColor: colors.surface1, padding: 8, borderRadius: 8, flex: 1, alignItems: 'center' }}><Text style={{ color: colors.textPrimary }}>Sort: Popular</Text></View>
               <View style={{ backgroundColor: colors.surface1, padding: 8, borderRadius: 8, flex: 1, alignItems: 'center' }}><Text style={{ color: colors.textPrimary }}>Level: All</Text></View>
            </View>
          )}
        </View>

        {/* Category Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: spacing.base, paddingVertical: spacing.sm, gap: spacing.sm, marginTop: spacing.md }}
        >
          {categories.map((cat, idx) => (
            <TouchableOpacity 
              key={idx} 
              style={[activeCategory === cat ? styles.pillActive : styles.pill, { backgroundColor: activeCategory === cat ? colors.textPrimary : colors.surface0 }, activeCategory === cat && shadows.sm]} 
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={[typography.labelMd, { color: activeCategory === cat ? colors.surface0 : colors.textSecondary }]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Trending Now */}
        <View style={{ paddingHorizontal: spacing.base, marginTop: spacing.lg }}>
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={[styles.dot, { backgroundColor: colors.primaryContainer }]} />
              <Text style={[typography.headlineSm, { color: colors.textPrimary }]}>Trending Now</Text>
            </View>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[typography.labelMd, { color: colors.primary, fontWeight: '600' }]}>See All</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={{ gap: spacing.md, marginTop: spacing.sm }}>
            {/* Course Card 1 */}
            <TouchableOpacity 
              style={[styles.courseCard, { backgroundColor: colors.surface0, borderRadius: radii.xl }, shadows.sm]}
              onPress={() => router.push('/course/1')}
            >
              <View style={[styles.courseImgContainer, { backgroundColor: colors.surface2, borderRadius: radii.lg }]}>
                <Image
                  source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCUYPcj3Rvvv4oM6KMKtvaq5EBQdb0xR3fbfqsNYyvHQ9GYGsdan_023pAhT_F4TjzP7TySxw_ayUTMH9KlEfnPzvaOIuDQA_hJzRv4P4YlwQNHPFpSAYt-svIuN4GF8RMdXe2H6fboW1InJ8t6nmB1Knnb723o9ofzVBcpX54jIILqv0I99mtRSM23830Kv48QKVYe5YwwfhIU9Ifq7vKgm6NG_BBcoHusmtyVHHMiaO2wc9B9yfzX' }}
                  style={styles.courseImg}
                />
                <View style={[styles.badgeTopLeft, { backgroundColor: colors.surface0 }]}>
                  <Ionicons name="star" size={12} color={colors.tertiaryContainer} />
                  <Text style={[typography.labelSm, { color: colors.textPrimary, fontWeight: '600', marginLeft: 4 }]}>Editor's Choice</Text>
                </View>
                <View style={[styles.badgeBottomRight, { backgroundColor: colors.surface0 }]}>
                  <Text style={[typography.labelSm, { color: colors.textPrimary, fontWeight: '500' }]}>14h 30m</Text>
                </View>
              </View>
              <View style={styles.courseInfo}>
                <View style={styles.courseRow}>
                  <View style={[styles.levelBadge, { backgroundColor: colors.primaryFixed }]}>
                    <Text style={[typography.labelSm, { color: colors.primary, fontWeight: '600' }]}>Intermediate</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Ionicons name="star" size={14} color={colors.warning} />
                    <Text style={[typography.labelSm, { color: colors.textPrimary, fontWeight: '700' }]}>4.9</Text>
                    <Text style={[typography.labelSm, { color: colors.textTertiary }]}>{formatReviewCount(MOCK_COURSES[0].reviewCount)}</Text>
                  </View>
                </View>
                <Text style={[typography.headlineSm, { color: colors.textPrimary, marginTop: 8 }]} numberOfLines={2}>
                  Mastering Dynamic Island & Live Activities
                </Text>
                <View style={[styles.courseFooter, { marginTop: 12, paddingTop: 12 }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Image
                      source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBFmr-sAdjz0THFnNjAuiZuqXHxbjirKHAeeC4ifrR9kdU0PzDmX14iZxvU5xL-gl2-ZVKt2sJcMfFqXiI5vtXtooDUgwcPZT3f-Xz1ibeQL-va8sF1LV6Pdq0QWHZBLipzeBBPXaxqqV0S2DVt828pmEju14Mm7U5ofDRNHu3-pGebDB-igebK4U1gFur8Y1UtRniXVIQ5luqe9XFNVEoaaFSExr3h2YDmT2-xlSugA_cRps3s0cO' }}
                      style={[styles.instructorImg, { backgroundColor: colors.surface2 }]}
                    />
                    <View>
                      <Text style={[typography.labelSm, { color: colors.textPrimary, fontWeight: '600' }]}>Sarah Lin</Text>
                      <Text style={[typography.labelSm, { color: colors.textTertiary }]}>Staff iOS Eng</Text>
                    </View>
                  </View>
                  <Text style={[typography.headlineSm, { color: colors.primary, fontWeight: '700' }]}>Free</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Course Card 2 */}
            <TouchableOpacity 
              style={[styles.courseCard, { backgroundColor: colors.surface0, borderRadius: radii.xl }, shadows.sm]}
              onPress={() => router.push('/course/2')}
            >
              <View style={[styles.courseImgContainer, { backgroundColor: colors.surface2, borderRadius: radii.lg }]}>
                <Image
                  source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDWV-h8lxipfGg20WPwrbhXdAs97t6xvUCn1nwFtx6EC18z8dcQH6bjnVzT5isVBPLmnUG79nMhHegoupvKTRdhgo_ygbFzcBxbS7UB6SHzO0uQ-AQwpG_b0Z2jbIUh91zsN_kOv3mxIQ3Soq2RHuWX9h0xpdxGdgIY22_FBtE_lLg6hW7Du7auiSWCxyw__6a4Sff3oGqUiAjirTYb3dymMnwrCsDBLZXLE99jlssWqNIM4EjvWKTV' }}
                  style={styles.courseImg}
                />
                <View style={[styles.badgeTopLeft, { backgroundColor: colors.surface0 }]}>
                  <Ionicons name="flash" size={12} color={colors.success} />
                  <Text style={[typography.labelSm, { color: colors.textPrimary, fontWeight: '600', marginLeft: 4 }]}>Best Seller</Text>
                </View>
                <View style={[styles.badgeBottomRight, { backgroundColor: colors.surface0 }]}>
                  <Text style={[typography.labelSm, { color: colors.textPrimary, fontWeight: '500' }]}>22h 10m</Text>
                </View>
              </View>
              <View style={styles.courseInfo}>
                <View style={styles.courseRow}>
                  <View style={[styles.levelBadge, { backgroundColor: colors.surfaceContainer }]}>
                    <Text style={[typography.labelSm, { color: colors.onSurfaceVariant, fontWeight: '600' }]}>Advanced</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Ionicons name="star" size={14} color={colors.warning} />
                    <Text style={[typography.labelSm, { color: colors.textPrimary, fontWeight: '700' }]}>5.0</Text>
                    <Text style={[typography.labelSm, { color: colors.textTertiary }]}>{formatReviewCount(MOCK_COURSES[1].reviewCount)}</Text>
                  </View>
                </View>
                <Text style={[typography.headlineSm, { color: colors.textPrimary, marginTop: 8 }]} numberOfLines={2}>
                  High-Performance Graphics with Metal 3
                </Text>
                <View style={[styles.courseFooter, { marginTop: 12, paddingTop: 12 }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Image
                      source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVtACtL-u4Owmd7KIYaAXjwH5MmAbUdnn4ubRFG0DfTOYJYLeAS2BWYL4w1bWBMuV8HlNpguYscFRK_Y6RRxpQBVaGxLUVq1Hqw6VTh3NOqVyfYwadw-OfTExDhdCc4zuGVem8vCq4lI9VLTzbgCbM8QfvdZ9m8XoJ6CfFfKFRsmgH4SWuxTP8Fp6vqXLk-6aQGFFSMnNQ7VOYIac0dO7sPhHLhLUap-2p8VVGKs4HeAaa1FIrnT8O' }}
                      style={[styles.instructorImg, { backgroundColor: colors.surface2 }]}
                    />
                    <View>
                      <Text style={[typography.labelSm, { color: colors.textPrimary, fontWeight: '600' }]}>Marcus Vance</Text>
                      <Text style={[typography.labelSm, { color: colors.textTertiary }]}>Graphics Specialist</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                    <Text style={[typography.labelSm, { color: colors.textTertiary, textDecorationLine: 'line-through' }]}>$120</Text>
                    <Text style={[typography.headlineSm, { color: colors.textPrimary, fontWeight: '700' }]}>$79.00</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Featured Mentors */}
        <View style={{ marginTop: spacing.xl }}>
          <View style={[styles.sectionHeader, { paddingHorizontal: spacing.base }]}>
            <Text style={[typography.headlineSm, { color: colors.textPrimary }]}>Featured Mentors</Text>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[typography.labelMd, { color: colors.primary, fontWeight: '600' }]}>Directory</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: spacing.base, paddingTop: spacing.sm, paddingBottom: spacing.lg, gap: spacing.md }}
          >
            {mentors.map((mentor) => (
              <View key={mentor.id} style={[styles.mentorCard, { backgroundColor: colors.surface0, borderRadius: radii.xl }, shadows.sm]}>
                <View>
                  <Image source={{ uri: mentor.uri }} style={styles.mentorImg} />
                  {!mentor.following && <View style={[styles.statusDot, { backgroundColor: colors.success, borderColor: colors.surface0 }]} />}
                </View>
                <View style={styles.mentorInfo}>
                  <Text style={[typography.labelMd, { color: colors.textPrimary, fontWeight: '600' }]} numberOfLines={1}>{mentor.name}</Text>
                  <Text style={[typography.labelSm, { color: colors.textTertiary }]} numberOfLines={1}>{mentor.role}</Text>
                </View>
                <TouchableOpacity 
                  style={[styles.followBtn, { backgroundColor: mentor.following ? colors.surface2 : colors.primaryFixed }]} 
                  onPress={() => {
                    setMentors(mentors.map(m => m.id === mentor.id ? { ...m, following: !m.following } : m));
                  }}
                >
                  <Text style={[typography.labelSm, { color: mentor.following ? colors.textSecondary : colors.primary, fontWeight: '600' }]}>
                    {mentor.following ? 'Following' : 'Follow'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* 3-Minute Bites */}
        <View style={{ paddingHorizontal: spacing.base, marginTop: spacing.md }}>
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="flash" size={20} color={colors.primaryContainer} />
              <Text style={[typography.headlineSm, { color: colors.textPrimary }]}>3-Minute Bites</Text>
            </View>
            <Text style={[typography.labelSm, { color: colors.textSecondary }]}>Micro-learning</Text>
          </View>

          <View style={[styles.bitesList, { backgroundColor: colors.surface0, borderRadius: radii.xl, marginTop: spacing.sm }, shadows.sm]}>
            {[
              { title: 'Swift 6 Isolation Domains', desc: 'Actors & Sendable · 2m 45s', bg: 'rgba(226, 223, 255, 0.6)', iconColor: colors.primary },
              { title: 'VisionOS Hover Effects', desc: 'Spatial Controls · 3m 10s', bg: 'rgba(255, 220, 198, 0.7)', iconColor: colors.tertiary },
              { title: 'CoreData to SwiftData Migration', desc: 'Persistence · 3m 50s', bg: colors.secondaryFixed, iconColor: colors.secondaryFixed }
            ].map((bite, idx) => (
              <View key={idx}>
                <TouchableOpacity style={styles.biteItem} onPress={() => router.push('/lesson/1')}>
                  <View style={styles.biteLeft}>
                    <View style={[styles.biteIconBox, { backgroundColor: bite.bg, borderRadius: radii.md }]}>
                      <Ionicons name="play" size={20} color={bite.iconColor} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[typography.labelLg, { color: colors.textPrimary, fontWeight: '600' }]} numberOfLines={1}>{bite.title}</Text>
                      <Text style={[typography.labelSm, { color: colors.textTertiary }]}>{bite.desc}</Text>
                    </View>
                  </View>
                  <View style={[styles.biteStartBtn, { backgroundColor: colors.surface2 }]}>
                    <Text style={[typography.labelSm, { color: colors.textSecondary }]}>Start</Text>
                  </View>
                </TouchableOpacity>
                {idx < 2 && <View style={[styles.separator, { backgroundColor: colors.surface3 }]} />}
              </View>
            ))}
          </View>
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
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    height: '100%',
  },
  pillActive: {
    paddingHorizontal: 16,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    paddingHorizontal: 16,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  courseCard: {
    padding: 16,
  },
  courseImgContainer: {
    width: '100%',
    height: 176,
    overflow: 'hidden',
  },
  courseImg: {
    width: '100%',
    height: '100%',
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
  badgeBottomRight: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  courseInfo: {
    marginTop: 12,
  },
  courseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  courseFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  instructorImg: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  mentorCard: {
    width: 144,
    padding: 12,
    alignItems: 'center',
  },
  mentorImg: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  mentorInfo: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
    width: '100%',
  },
  followBtn: {
    width: '100%',
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bitesList: {
    overflow: 'hidden',
  },
  biteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  biteLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 12,
  },
  biteIconBox: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  biteStartBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 68,
  },
});

