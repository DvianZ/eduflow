import { ScrollView, StyleSheet, Text, View, Image, TouchableOpacity, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';

import { useTheme } from '@/hooks/use-theme';
import { useAppStore } from '@/store/useAppStore';
import { getLessonById, MOCK_LESSONS } from '@/data/mockDatabase';

export default function LessonScreen() {
  const { colors, typography, spacing, radii, shadows } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { courseProgress, updateLessonProgress: updateProgress, markLessonComplete } = useAppStore();
  
  const lesson = getLessonById(id || '1') || MOCK_LESSONS[0];
  const lessonId = lesson.id;
  const currentProgress = courseProgress[lessonId] || 0;

  const [isPlaying, setIsPlaying] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [activeTab, setActiveTab] = useState('notes');
  const [newNoteText, setNewNoteText] = useState('');
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const totalTime = lesson.durationSeconds;
  const [currentTime, setCurrentTime] = useState(402);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying && currentTime < totalTime) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const next = prev + (1 * playbackSpeed);
          if (next >= totalTime) {
            setIsPlaying(false);
            markLessonComplete(id); // use id instead of lessonId which isn't defined here
            return totalTime;
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTime, playbackSpeed, totalTime, markLessonComplete, id]);

  const progressPercent = Math.min((currentTime / totalTime) * 100, 100);
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const [notes, setNotes] = useState([
    { id: '1', time: '02:15', label: 'Yesterday', text: 'DynamicIslandExpandedLeading needs keyframe animation spec for smooth expansion.' },
    { id: '2', time: '05:40', label: '12m ago', text: 'Remember to configure background audio capability in Info.plist.' },
  ]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.primaryContainer} />
          </TouchableOpacity>
          <Text style={[typography.headlineSm, { color: colors.textPrimary, flex: 1, textAlign: 'center' }]} numberOfLines={1}>
            Video Player & Notes
          </Text>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setShowOptions(!showOptions)}>
            <Ionicons name="ellipsis-horizontal" size={24} color={showOptions ? colors.primaryContainer : colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 60,
          paddingBottom: insets.bottom + 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Video Player */}
        <View style={{ paddingHorizontal: spacing.base }}>
          <View style={[styles.videoContainer, { backgroundColor: '#000', borderRadius: radii.xl }]}>
            <Image
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAUMV_s3RYuZZUzJaxqYHuMAH_dJWMgBOAsgn764KNOFy3fmjv_hfXI28udRuzkevvmCDWoddxt00NfkC6fXn1wQEngQt69xwdkIR69tBdsNsHU_P8ELoZRzsTwu-MJns2HFQL5sebPwPSpp4Jvulb9OY7wLEAP-cJ1IYsXmIqCSKES9FI5-FuBEXrq1Ebh5xup6M4t6gkNudkhQjkJpBzuw4lbmS3jjOWN1z7KrXrlEgS9FDK0wpN6' }}
              style={styles.videoImg}
            />
            <View style={styles.videoOverlay} />

            {/* Top Quick Actions */}
            <View style={styles.videoTopActions}>
              <View style={styles.videoTag}>
                <View style={[styles.dot, { backgroundColor: colors.error }]} />
                <Text style={[typography.labelSm, { color: '#fff', marginLeft: 4 }]}>SwiftUI 6.0</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity style={styles.videoTopBtn}>
                  <Ionicons name="albums-outline" size={16} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.videoTopBtn}>
                  <Ionicons name="tv-outline" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Center Controls */}
            <View style={styles.videoCenterControls}>
              <TouchableOpacity style={styles.videoControlSmall}>
                <Ionicons name="play-back" size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.playPauseBtn, { backgroundColor: colors.primaryContainer }]}
                onPress={() => setIsPlaying(!isPlaying)}
              >
                <Ionicons name={isPlaying ? "pause" : "play"} size={28} color="#fff" style={{ marginLeft: isPlaying ? 0 : 2 }} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.videoControlSmall}>
                <Ionicons name="play-forward" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Bottom Scrubber */}
            <View style={styles.videoBottomControls}>
              <View style={styles.scrubberTrack}>
                <View style={styles.scrubberBg}>
                  <View style={[styles.scrubberFill, { backgroundColor: colors.primaryContainer, width: `${progressPercent}%` }]} />
                </View>
                <View style={[styles.scrubberThumb, { left: `${progressPercent}%` }]} />
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                <Text style={[typography.labelSm, { color: '#fff' }]}>{formatTime(currentTime)} / 18:15</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <TouchableOpacity style={styles.speedBtn} onPress={() => setPlaybackSpeed(playbackSpeed === 2 ? 1 : playbackSpeed + 0.5)}>
                    <Text style={[typography.labelSm, { color: '#fff' }]}>{playbackSpeed}x</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setIsFullscreen(!isFullscreen)}>
                    <Ionicons name={isFullscreen ? "contract" : "expand"} size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Title & Progress */}
        <View style={{ paddingHorizontal: spacing.base, marginTop: spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={[typography.labelSm, { color: colors.textSecondary }]}>
              <Text style={{ color: colors.primaryContainer, fontWeight: '600' }}>MODULE 01</Text> • Foundations • 18 mins
            </Text>
            <TouchableOpacity onPress={() => setIsBookmarked(!isBookmarked)}>
              <Ionicons name={isBookmarked ? "bookmark" : "bookmark-outline"} size={20} color={isBookmarked ? colors.primaryContainer : colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <Text style={[typography.headlineLg, { color: colors.textPrimary, marginTop: 4, fontWeight: '700' }]}>
            02. Expanded Presentation State & Audio Engine
          </Text>

          <View style={[styles.progCard, { backgroundColor: colors.surface0, borderRadius: radii.xl }, shadows.sm]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={[styles.autoDot, { backgroundColor: 'rgba(50, 183, 107, 0.15)' }]}>
                  <Ionicons name="sparkles" size={12} color={colors.success} />
                </View>
                <Text style={[typography.bodySm, { color: colors.textPrimary, fontWeight: '500' }]}>Automatic Completion</Text>
              </View>
              <Text style={[typography.labelMd, { color: colors.primaryContainer, fontWeight: '600' }]}>{currentProgress}% watched</Text>
            </View>
            <View style={[styles.progBg, { backgroundColor: colors.surface2 }]}>
              <View style={[styles.progFill, { backgroundColor: colors.primaryContainer, width: `${progressPercent}%` }]} />
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={{ paddingHorizontal: spacing.base, marginTop: spacing.lg }}>
          <View style={[styles.tabBar, { backgroundColor: colors.surface2, borderRadius: radii.lg }]}>
            <TouchableOpacity 
              style={[styles.tabBtn, activeTab === 'notes' && { backgroundColor: colors.surface0, ...shadows.sm }]}
              onPress={() => setActiveTab('notes')}
            >
              <Text style={[typography.labelMd, { color: activeTab === 'notes' ? colors.primaryContainer : colors.textSecondary, fontWeight: activeTab === 'notes' ? '600' : '400' }]}>Notes ({notes.length})</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tabBtn, activeTab === 'resources' && { backgroundColor: colors.surface0, ...shadows.sm }]}
              onPress={() => setActiveTab('resources')}
            >
              <Text style={[typography.labelMd, { color: activeTab === 'resources' ? colors.primaryContainer : colors.textSecondary, fontWeight: activeTab === 'resources' ? '600' : '400' }]}>Resources</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tabBtn, activeTab === 'discussion' && { backgroundColor: colors.surface0, ...shadows.sm }]}
              onPress={() => setActiveTab('discussion')}
            >
              <Text style={[typography.labelMd, { color: activeTab === 'discussion' ? colors.primaryContainer : colors.textSecondary, fontWeight: activeTab === 'discussion' ? '600' : '400' }]}>Discussion</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content based on Tab */}
        {activeTab === 'notes' && (
          <View style={{ paddingHorizontal: spacing.base, marginTop: spacing.md, gap: spacing.md }}>
            {/* Add Note */}
            <View style={[styles.addNoteCard, { backgroundColor: colors.surface0, borderRadius: radii.xl }, shadows.sm]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="time-outline" size={16} color={colors.primaryContainer} />
                  <Text style={[typography.labelSm, { color: colors.primaryContainer, fontWeight: '600' }]}>Current Playhead: {formatTime(currentTime)}</Text>
                </View>
                <Text style={[typography.labelSm, { color: colors.textTertiary }]}>Auto-anchored</Text>
              </View>
              <View style={[styles.noteInputRow, { backgroundColor: colors.surface1, borderRadius: radii.lg }]}>
                <TextInput
                  style={[styles.noteInput, typography.bodyMd, { color: colors.textPrimary }]}
                  placeholder="Add a timestamped note..."
                  placeholderTextColor={colors.textTertiary}
                  value={newNoteText}
                  onChangeText={setNewNoteText}
                />
                <TouchableOpacity 
                  style={styles.micBtn} 
                  onPress={() => {
                    setIsListening(!isListening);
                    if (!isListening) setTimeout(() => setIsListening(false), 3000);
                  }}
                >
                  <Ionicons name="mic-outline" size={20} color={isListening ? colors.error : colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.saveBtn, { backgroundColor: newNoteText.trim() ? colors.primaryContainer : colors.surface2, borderRadius: radii.md }]}
                  onPress={() => {
                    if (newNoteText.trim()) {
                      setNotes([{
                        id: Date.now().toString(),
                        time: formatTime(currentTime),
                        label: 'Just now',
                        text: newNoteText
                      }, ...notes]);
                      setNewNoteText('');
                    }
                  }}
                >
                  <Text style={[typography.labelSm, { color: newNoteText.trim() ? colors.onPrimary : colors.textTertiary }]}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Notes List */}
            <View style={{ gap: 10 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 }}>
                <Text style={[typography.labelSm, { color: colors.textSecondary, fontWeight: '600', textTransform: 'uppercase' }]}>Your Timestamped Notes</Text>
                <TouchableOpacity 
                  onPress={() => {
                    setIsExporting(true);
                    setTimeout(() => setIsExporting(false), 2000);
                  }}
                >
                  <Text style={[typography.labelSm, { color: isExporting ? colors.success : colors.primaryContainer }]}>
                    {isExporting ? 'Exported!' : 'Export'}
                  </Text>
                </TouchableOpacity>
              </View>

              {notes.map(note => (
                <View key={note.id} style={[styles.noteItem, { backgroundColor: colors.surface0, borderRadius: radii.xl }, shadows.sm]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <View style={[styles.timestampBadge, { backgroundColor: colors.primaryFixed }]}>
                      <Ionicons name="play-circle" size={14} color={colors.primary} />
                      <Text style={[typography.labelSm, { color: colors.primary, fontWeight: '600', marginLeft: 4 }]}>{note.time}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Text style={[typography.labelSm, { color: colors.textTertiary }]}>{note.label}</Text>
                      <Ionicons name="ellipsis-vertical" size={16} color={colors.textSecondary} />
                    </View>
                  </View>
                  <Text style={[typography.bodyMd, { color: colors.textPrimary }]}>
                    {note.text}
                  </Text>
                </View>
              ))}
            </View>

            {/* Tip Callout */}
            <View style={{ marginTop: spacing.xs }}>
              <View style={[styles.tipCard, { backgroundColor: colors.surface2, borderRadius: radii.xl }]}>
                <View style={[styles.tipIcon, { backgroundColor: colors.primaryContainer }]}>
                  <Ionicons name="bulb-outline" size={18} color={colors.onPrimary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.labelMd, { color: colors.textPrimary, fontWeight: '600' }]}>Pro-tip for Live Activities</Text>
                  <Text style={[typography.bodySm, { color: colors.textSecondary, marginTop: 4 }]}>
                    Keep your leading and trailing views compact. Excessive text length will truncate aggressively when phone transitions to silent ring mode.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'resources' && (
          <View style={{ paddingHorizontal: spacing.base, marginTop: spacing.md, gap: spacing.md, alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }}>
            <Ionicons name="document-text" size={48} color={colors.surface3} />
            <Text style={[typography.labelLg, { color: colors.textSecondary, marginTop: 12 }]}>No resources available for this lesson.</Text>
          </View>
        )}

        {activeTab === 'discussion' && (
          <View style={{ paddingHorizontal: spacing.base, marginTop: spacing.md, gap: spacing.md, alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }}>
            <Ionicons name="chatbubbles-outline" size={48} color={colors.surface3} />
            <Text style={[typography.labelLg, { color: colors.textSecondary, marginTop: 12 }]}>Join the forum to discuss this lesson.</Text>
            <TouchableOpacity 
              style={[styles.saveBtn, { backgroundColor: colors.primaryContainer, borderRadius: radii.md, marginTop: 12 }]}
              onPress={() => router.push('/forum/1')}
            >
              <Text style={[typography.labelSm, { color: colors.onPrimary }]}>Go to Forum</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: spacing.base, marginTop: spacing.xl }}>
          <TouchableOpacity style={[styles.navBtnPrev, { backgroundColor: colors.surface2, borderRadius: radii.xl }]} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={18} color={colors.textPrimary} />
            <Text style={[typography.labelLg, { color: colors.textPrimary, marginLeft: 6 }]}>Previous</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.navBtnNext, { backgroundColor: colors.primaryContainer, borderRadius: radii.xl }, shadows.sm]}
            onPress={() => {
              updateProgress(lessonId, Math.min(currentProgress + 20, 100));
              router.push(`/quiz/${lesson.quizId || '1'}`);
            }}
          >
            <Text style={[typography.labelLg, { color: colors.onPrimary, marginRight: 6 }]} numberOfLines={1}>Next: Lesson Quiz</Text>
            <Ionicons name="arrow-forward" size={18} color={colors.onPrimary} />
          </TouchableOpacity>
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
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.05)',
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
  iconBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginRight: -8,
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    overflow: 'hidden',
  },
  videoImg: {
    ...StyleSheet.absoluteFill as any,
    opacity: 0.8,
  },
  videoOverlay: {
    ...StyleSheet.absoluteFill as any,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  videoTopActions: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  videoTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  videoTopBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoCenterControls: {
    ...StyleSheet.absoluteFill as any,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    zIndex: 10,
  },
  playPauseBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoControlSmall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoBottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    zIndex: 10,
  },
  scrubberTrack: {
    height: 20,
    justifyContent: 'center',
  },
  scrubberBg: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
  },
  scrubberFill: {
    height: '100%',
    borderRadius: 2,
  },
  scrubberThumb: {
    position: 'absolute',
    width: 12,
    height: 12,
    backgroundColor: '#fff',
    borderRadius: 6,
    marginLeft: -6, // offset half width
  },
  speedBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  progCard: {
    padding: 12,
    marginTop: 12,
  },
  autoDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progBg: {
    height: 6,
    borderRadius: 3,
  },
  progFill: {
    height: '100%',
    borderRadius: 3,
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
  addNoteCard: {
    padding: 14,
  },
  noteInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    paddingRight: 4,
    height: 44,
  },
  noteInput: {
    flex: 1,
    height: '100%',
  },
  micBtn: {
    padding: 8,
  },
  saveBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  noteItem: {
    padding: 14,
  },
  timestampBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
  },
  tipIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnPrev: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
  },
  navBtnNext: {
    flex: 1.8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
  },
});
