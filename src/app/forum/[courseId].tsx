import { ScrollView, StyleSheet, Text, View, Image, TouchableOpacity, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { useTheme } from '@/hooks/use-theme';
import { useAppStore } from '@/store/useAppStore';

export default function ForumScreen() {
  const { colors, typography, spacing, radii, shadows } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  // Removed courseId
  const { user } = useAppStore();

  const [activeFilter, setActiveFilter] = useState('All');
  const [newPostText, setNewPostText] = useState('');
  const [upvoted, setUpvoted] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isAsking, setIsAsking] = useState(false);
  const [isAttaching, setIsAttaching] = useState(false);
  const [isCodeMode, setIsCodeMode] = useState(false);
  const [posts, setPosts] = useState([
    {
      id: '1',
      author: 'Marcus Vance',
      role: 'Student',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJXXRRlZ8R4zIoOL3idCRrs_tZg67Hi6H37ER0LDiAamBD9GXV3iPYGzVi1tNekF81fmog3BxNV74Qgm8Pz7m_xsLcQIjoZIKSaBsxFWwnminV6JUdkmB70frMiR9OFRpbHKwjQ9PlPDa-HT38OGuO2NuFwBSTK1jn6AaS4Hr0zUQrWkZcf5e4x5bMPbMmZ0PZ5ChdLFldzNXRew6Myzr0EXCxTL0N1YXqPTYo5LKrbanYO0MvMzvi',
      time: '2 hours ago',
      topic: 'ActivityKit 2',
      title: 'How do we handle Live Activity dismissal animation when push payload has stale dismissal date?',
      content: 'When triggering an end-state push notification with an invalid timestamp, the system UI keeps lingering in the compact presentation slot for up to 30 seconds instead of smoothly collapsing.',
      solution: {
        author: 'Sarah Lin',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCyvy-i3T9IUqb-rqNMfNjgAOR5D-OaqLqEIM-E5pYAH5e67cMa0Bb158Nnnl4wxH_PrJT4rrXmEtOZgRfGYrE17Vqt_00yr6MIjoohdUEjKoM0AUSea4pASQSRLCN5gjAc-iZDj3LK-VYGEA8qPs3yGegDhvA-L7yWlxfzYhmn4OCLOhpOWdNTS3vO3JVZSCePl0UVyJR9ppHrQHxHxK-iiwfmhD7_X4W5ebG2-asMw_jE_J28S8b6',
        text: '"You can explicitly invoke Activity.end(dismissalPolicy: .immediate) or fallback to default spring timing within the APNs remote handler payload..."'
      },
      upvotes: 14,
      replies: 6
    }
  ]);

  const filters = [
    { id: 'All', label: 'All', count: posts.length + 47 },
    { id: 'Unanswered', label: 'Unanswered' },
    { id: 'Instructor Solved', label: 'Instructor Solved', icon: 'star' },
    { id: 'My Questions', label: 'My Questions' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.primaryContainer} />
          </TouchableOpacity>
          <Text style={[typography.headlineSm, { color: colors.textPrimary }]} numberOfLines={1}>
            Forum Q&A
          </Text>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setShowOptions(!showOptions)}>
            <Ionicons name="ellipsis-horizontal" size={24} color={showOptions ? colors.primaryContainer : colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 60,
          paddingBottom: insets.bottom + 80, // Space for bottom dock
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: spacing.base, marginTop: spacing.xs }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={[styles.coursePill, { backgroundColor: colors.surface2 }]}>
              <Ionicons name="book" size={16} color={colors.primary} />
              <Text style={[typography.labelSm, { color: colors.onSurfaceVariant, marginLeft: 6 }]} numberOfLines={1}>
                Mastering Dynamic Island · Mod 01
              </Text>
            </View>
            <TouchableOpacity 
              style={[styles.askBtn, { backgroundColor: isAsking ? colors.surface3 : colors.primaryContainer }, shadows.sm]} 
              onPress={() => {
                setIsAsking(true);
                setTimeout(() => setIsAsking(false), 500);
                // Can scroll down or focus input natively here if needed
              }}
            >
              <Ionicons name="add" size={16} color={isAsking ? colors.textPrimary : colors.onPrimary} />
              <Text style={[typography.labelSm, { color: isAsking ? colors.textPrimary : colors.onPrimary, marginLeft: 4 }]}>Ask</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ paddingHorizontal: spacing.base, marginTop: spacing.md, gap: spacing.sm }}>
          <View style={[styles.searchBox, { backgroundColor: colors.surface1, borderRadius: radii.xl }]}>
            <Ionicons name="search" size={20} color={colors.textTertiary} />
            <TextInput
              style={[styles.searchInput, typography.bodySm, { color: colors.textPrimary }]}
              placeholder="Search questions or keywords..."
              placeholderTextColor={colors.textTertiary}
            />
            <Ionicons name="mic" size={18} color={colors.textTertiary} />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ overflow: 'visible' }}>
            <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 4 }}>
              {filters.map((f) => {
                const isActive = activeFilter === f.id;
                return (
                  <TouchableOpacity
                    key={f.id}
                    style={[
                      styles.filterPill,
                      { backgroundColor: isActive ? colors.primary : colors.surface0 },
                      !isActive && shadows.sm
                    ]}
                    onPress={() => setActiveFilter(f.id)}
                  >
                    {f.icon && <Ionicons name={f.icon as any} size={14} color={isActive ? colors.onPrimary : colors.warning} style={{ marginRight: 4 }} />}
                    <Text style={[typography.labelMd, { color: isActive ? colors.onPrimary : colors.textSecondary }]}>
                      {f.label}
                    </Text>
                    {f.count && (
                      <Text style={[typography.labelSm, { color: isActive ? 'rgba(255,255,255,0.8)' : colors.textTertiary, marginLeft: 4 }]}>
                        ({f.count})
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Discussion Stream */}
        <View style={{ paddingHorizontal: spacing.base, marginTop: spacing.sm, gap: spacing.md }}>
          {posts.map((post) => (
            <View key={post.id} style={[styles.postCard, { backgroundColor: colors.surface0, borderRadius: radii.xl }, shadows.sm]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <Image source={{ uri: post.avatar }} style={styles.avatar} />
                  <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={[typography.headlineSm, { color: colors.textPrimary }]}>{post.author}</Text>
                      <View style={[styles.roleTag, { backgroundColor: colors.surface2 }]}><Text style={[typography.labelSm, { fontSize: 10, color: colors.textSecondary }]}>{post.role}</Text></View>
                    </View>
                    <Text style={[typography.bodySm, { color: colors.textTertiary, fontSize: 11 }]}>{post.time}</Text>
                  </View>
                </View>
                <View style={[styles.topicTag, { backgroundColor: colors.secondaryFixed }]}>
                  <Text style={[typography.labelSm, { color: colors.secondaryFixed }]}>{post.topic}</Text>
                </View>
              </View>

              {post.title && <Text style={[typography.headlineSm, { color: colors.textPrimary, marginBottom: 8, lineHeight: 22 }]}>
                {post.title}
              </Text>}
              <Text style={[typography.bodySm, { color: colors.onSurfaceVariant, marginBottom: post.solution ? 12 : 0 }]} numberOfLines={3}>
                {post.content}
              </Text>

              {post.solution && (
                <View style={[styles.solutionBox, { backgroundColor: colors.surface1, borderRadius: radii.lg }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Image source={{ uri: post.solution.avatar }} style={styles.miniAvatar} />
                      <Text style={[typography.labelMd, { color: colors.textPrimary }]}>{post.solution.author}</Text>
                      <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
                    </View>
                    <View style={[styles.solvedTag, { backgroundColor: 'rgba(50, 183, 107, 0.15)' }]}>
                      <Ionicons name="checkmark-circle" size={12} color={colors.success} />
                      <Text style={[typography.labelSm, { fontSize: 11, color: colors.success, marginLeft: 4 }]}>Solved</Text>
                    </View>
                  </View>
                  <Text style={[typography.bodySm, { color: colors.onSurfaceVariant }]} numberOfLines={2}>
                    {post.solution.text}
                  </Text>
                </View>
              )}

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                <View style={{ flexDirection: 'row', gap: 16 }}>
                  <TouchableOpacity 
                    style={[styles.actionPill, { backgroundColor: post.id === '1' && upvoted ? colors.primaryContainer : colors.surface2 }]}
                    onPress={() => {
                      if (post.id === '1') setUpvoted(!upvoted);
                    }}
                  >
                    <Ionicons name="thumbs-up" size={16} color={post.id === '1' && upvoted ? colors.onPrimary : colors.primary} />
                    <Text style={[typography.labelMd, { color: post.id === '1' && upvoted ? colors.onPrimary : colors.textPrimary, marginLeft: 6 }]}>
                      {post.id === '1' ? (upvoted ? post.upvotes + 1 : post.upvotes) : post.upvotes}
                    </Text>
                  </TouchableOpacity>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="chatbubble-outline" size={18} color={colors.textSecondary} />
                    <Text style={[typography.labelMd, { color: colors.textSecondary }]}>{post.replies} replies</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <Ionicons name="bookmark-outline" size={20} color={colors.textTertiary} />
                  <Ionicons name="share-outline" size={20} color={colors.textTertiary} />
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Input */}
      <View style={[styles.bottomDock, { backgroundColor: 'rgba(255,255,255,0.9)', paddingBottom: insets.bottom + 12 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TouchableOpacity 
            style={[styles.attachBtn, { backgroundColor: isAttaching ? 'rgba(50, 183, 107, 0.15)' : 'rgba(0,0,0,0.05)' }]} 
            onPress={() => {
              setIsAttaching(true);
              setTimeout(() => setIsAttaching(false), 2000);
            }}
          >
            <Ionicons name="attach" size={22} color={isAttaching ? colors.success : colors.textSecondary} />
          </TouchableOpacity>
          <View style={[styles.inputContainer, { backgroundColor: colors.surface1, borderRadius: radii.full }]}>
            <TextInput
              style={[styles.input, typography.bodySm, { color: isCodeMode ? colors.primaryContainer : colors.textPrimary, fontFamily: isCodeMode ? 'monospace' : undefined }]}
              placeholder={isCodeMode ? "func getHelp() {..." : "Ask Sarah & Community..."}
              placeholderTextColor={colors.textTertiary}
              value={newPostText}
              onChangeText={setNewPostText}
            />
            <TouchableOpacity 
              style={[styles.codeBtn, { backgroundColor: isCodeMode ? colors.primaryContainer : 'transparent' }]} 
              onPress={() => setIsCodeMode(!isCodeMode)}
            >
              <Ionicons name="code" size={18} color={isCodeMode ? colors.onPrimary : colors.textTertiary} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            style={[styles.postBtn, { backgroundColor: newPostText.length > 0 ? colors.primary : colors.surface2 }]}
            onPress={() => {
              if (newPostText.trim().length > 0) {
                setPosts([{
                  id: Date.now().toString(),
                  author: user.name,
                  role: 'Student',
                  avatar: user.avatar,
                  time: 'Just now',
                  topic: 'General',
                  title: '',
                  content: newPostText,
                  solution: undefined as any,
                  upvotes: 0,
                  replies: 0
                }, ...posts]);
                setNewPostText('');
              }
            }}
          >
            <Text style={[typography.labelMd, { color: newPostText.length > 0 ? colors.onPrimary : colors.textTertiary }]}>Post</Text>
            <Ionicons name="arrow-up" size={16} color={newPostText.length > 0 ? colors.onPrimary : colors.textTertiary} style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(0,0,0,0.05)', backgroundColor: 'rgba(249,249,249,0.9)', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, height: 56 },
  iconBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  coursePill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, maxWidth: '70%' },
  askBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  searchBox: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, height: 44, gap: 8 },
  searchInput: { flex: 1, height: '100%' },
  filterPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16 },
  postCard: { padding: 16 },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  roleTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  topicTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  solutionBox: { padding: 12, marginTop: 12 },
  miniAvatar: { width: 24, height: 24, borderRadius: 12 },
  solvedTag: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  actionPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  bottomDock: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 16, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(0,0,0,0.1)' },
  attachBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.05)', alignItems: 'center', justifyContent: 'center' },
  inputContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', height: 44, paddingLeft: 16, paddingRight: 8 },
  input: { flex: 1, height: '100%' },
  codeBtn: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  postBtn: { flexDirection: 'row', alignItems: 'center', height: 44, paddingHorizontal: 16, borderRadius: 22 },
});
