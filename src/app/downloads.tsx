import { ScrollView, StyleSheet, Text, View, TouchableOpacity, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';

import { useTheme } from '@/hooks/use-theme';

export default function DownloadsScreen() {
  const { colors, typography, spacing, radii, shadows } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [wifiOnly, setWifiOnly] = useState(true);
  const [autoDelete, setAutoDelete] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [cacheCleared, setCacheCleared] = useState<boolean | string>(false);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.primaryContainer} />
          </TouchableOpacity>
          <Text style={[typography.headlineSm, { color: colors.textPrimary }]} numberOfLines={1}>
            Downloads
          </Text>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/(tabs)')}>
            <Ionicons name="close" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 60,
          paddingBottom: insets.bottom + 100, // Space for bottom dock
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: spacing.base, marginTop: spacing.md }}>
          {/* Storage Breakdown */}
          <View style={[styles.storageCard, { backgroundColor: colors.surface0, borderRadius: radii.xl }, shadows.sm]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="phone-portrait-outline" size={20} color={colors.primaryContainer} />
                <Text style={[typography.headlineSm, { color: colors.textPrimary }]}>iPhone Storage</Text>
              </View>
              <Text style={[typography.labelMd, { color: colors.textSecondary }]}>70.0 GB Total</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: 12 }}>
              <Text style={[typography.headlineLg, { color: colors.textPrimary }]}>5.3 GB</Text>
              <Text style={[typography.labelMd, { color: colors.textSecondary }]}>Used by EduFlow • 64.2 GB Available</Text>
            </View>

            {/* Segmented Bar */}
            <View style={[styles.storageBar, { backgroundColor: colors.surface3 }]}>
              <View style={[styles.storageSeg, { flex: 0.58, backgroundColor: colors.primaryContainer }]} />
              <View style={[styles.storageSeg, { flex: 0.12, backgroundColor: colors.primary }]} />
              <View style={[styles.storageSeg, { flex: 0.06, backgroundColor: colors.secondaryFixedDim }]} />
              <View style={[styles.storageSeg, { flex: 0.24, backgroundColor: colors.surface2 }]} />
            </View>

            {/* Legends */}
            <View style={styles.legendGrid}>
              <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: colors.primaryContainer }]} /><View><Text style={[typography.labelSm, { color: colors.textSecondary }]}>Videos</Text><Text style={[typography.labelMd, { color: colors.textPrimary }]}>4.8 GB</Text></View></View>
              <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: colors.primary }]} /><View><Text style={[typography.labelSm, { color: colors.textSecondary }]}>Slides & Code</Text><Text style={[typography.labelMd, { color: colors.textPrimary }]}>320 MB</Text></View></View>
              <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: colors.secondaryFixedDim }]} /><View><Text style={[typography.labelSm, { color: colors.textSecondary }]}>Cache & Data</Text><Text style={[typography.labelMd, { color: colors.textPrimary }]}>180 MB</Text></View></View>
              <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: colors.surface3 }]} /><View><Text style={[typography.labelSm, { color: colors.textSecondary }]}>Free Space</Text><Text style={[typography.labelMd, { color: colors.textPrimary }]}>64.2 GB</Text></View></View>
            </View>

            {/* Settings Toggles */}
            <View style={[styles.settingsBox, { backgroundColor: colors.surface1, borderRadius: radii.lg }]}>
              <View style={styles.settingRow}>
                <View>
                  <Text style={[typography.labelLg, { color: colors.textPrimary }]}>Download over Wi-Fi Only</Text>
                  <Text style={[typography.bodySm, { color: colors.textSecondary }]}>Prevents mobile data usage</Text>
                </View>
                <Switch value={wifiOnly} onValueChange={setWifiOnly} trackColor={{ true: colors.success, false: colors.surface4 }} />
              </View>
              <View style={[styles.divider, { backgroundColor: colors.surface3 }]} />
              <View style={styles.settingRow}>
                <View>
                  <Text style={[typography.labelLg, { color: colors.textPrimary }]}>Auto-Delete Completed</Text>
                  <Text style={[typography.bodySm, { color: colors.textSecondary }]}>Free up space after finishing</Text>
                </View>
                <Switch value={autoDelete} onValueChange={setAutoDelete} trackColor={{ true: colors.success, false: colors.surface4 }} />
              </View>
            </View>
          </View>

          {/* Filters */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md, overflow: 'visible' }}>
            <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 4 }}>
              <TouchableOpacity onPress={() => setActiveFilter('All')} style={[styles.filterPill, { backgroundColor: activeFilter === 'All' ? colors.primaryContainer : colors.surface0 }, activeFilter === 'All' && shadows.sm]}>
                <Text style={[typography.labelMd, { color: activeFilter === 'All' ? colors.onPrimary : colors.textSecondary }]}>All Downloads (8)</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setActiveFilter('Videos')} style={[styles.filterPill, { backgroundColor: activeFilter === 'Videos' ? colors.primaryContainer : colors.surface0 }, activeFilter === 'Videos' && shadows.sm]}>
                <Text style={[typography.labelMd, { color: activeFilter === 'Videos' ? colors.onPrimary : colors.textSecondary }]}>Video Lectures (5)</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setActiveFilter('Projects')} style={[styles.filterPill, { backgroundColor: activeFilter === 'Projects' ? colors.primaryContainer : colors.surface0 }, activeFilter === 'Projects' && shadows.sm]}>
                <Text style={[typography.labelMd, { color: activeFilter === 'Projects' ? colors.onPrimary : colors.textSecondary }]}>Project Files (3)</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Course Group 1 */}
          <View style={[styles.courseGroup, { backgroundColor: colors.surface0, borderRadius: radii.xl }, shadows.sm]}>
            <View style={[styles.courseHeader, { backgroundColor: colors.surface2 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={[styles.courseIcon, { backgroundColor: colors.surface0 }, shadows.sm]}>
                  <Ionicons name="phone-portrait" size={20} color={colors.primaryContainer} />
                </View>
                <View>
                  <Text style={[typography.headlineSm, { color: colors.textPrimary }]}>Mastering Dynamic Island</Text>
                  <Text style={[typography.bodySm, { color: colors.textSecondary }]}>3 files • 2.4 GB</Text>
                </View>
              </View>
              <Ionicons name="ellipsis-horizontal" size={20} color={colors.textTertiary} />
            </View>
            
            <View style={styles.groupItems}>
              <View style={styles.fileRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                  <View style={[styles.fileIcon, { backgroundColor: colors.surface1 }]}><Ionicons name="play" size={16} color={colors.primaryContainer} /></View>
                  <View>
                    <Text style={[typography.labelLg, { color: colors.textPrimary }]}>01. ActivityKit Architecture</Text>
                    <Text style={[typography.bodySm, { color: colors.textSecondary }]}>1080p Video • 420 MB</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                  <Ionicons name="ellipsis-vertical" size={20} color={colors.textTertiary} />
                </View>
              </View>
              <View style={[styles.fileDivider, { backgroundColor: colors.surface2 }]} />
              <View style={styles.fileRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                  <View style={[styles.fileIcon, { backgroundColor: colors.surface1 }]}><Ionicons name="folder" size={16} color={colors.primary} /></View>
                  <View>
                    <Text style={[typography.labelLg, { color: colors.textPrimary }]} numberOfLines={1}>DynamicIsland_Starter_Xcode16.zip</Text>
                    <Text style={[typography.bodySm, { color: colors.textSecondary }]}>Starter Project • 140 MB</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                  <Ionicons name="ellipsis-vertical" size={20} color={colors.textTertiary} />
                </View>
              </View>
            </View>
          </View>

        </View>
      </ScrollView>

      {/* Ambient Micro-Action: Clear Cache Sheet */}
      {!cacheCleared && (
        <View style={[styles.clearCacheDock, { bottom: insets.bottom + 16 }]}>
          <View style={[styles.clearCacheCard, { backgroundColor: 'rgba(255,255,255,0.95)' }, shadows.md]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={[styles.cleanIcon, { backgroundColor: colors.surface2 }]}>
                <Ionicons name="trash-bin-outline" size={18} color={colors.textSecondary} />
              </View>
              <View>
                <Text style={[typography.labelSm, { color: colors.textSecondary }]}>Cache & Temporary files</Text>
                <Text style={[typography.labelMd, { color: colors.textPrimary }]}>320 MB reclaimable</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={[styles.clearBtn, { backgroundColor: cacheCleared === 'clearing' ? colors.primaryContainer : colors.surface2 }]} 
              onPress={() => {
                setCacheCleared('clearing');
                setTimeout(() => setCacheCleared(true), 1500);
              }}
            >
              <Text style={[typography.labelMd, { color: cacheCleared === 'clearing' ? colors.onPrimary : colors.textPrimary }]}>
                {cacheCleared === 'clearing' ? 'Clearing...' : 'Clear Cache'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(0,0,0,0.05)', backgroundColor: 'rgba(249,249,249,0.9)', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, height: 56 },
  iconBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  storageCard: { padding: 16, marginBottom: 16 },
  storageBar: { flexDirection: 'row', height: 12, borderRadius: 6, padding: 2, gap: 2, marginBottom: 12 },
  storageSeg: { height: '100%', borderRadius: 4 },
  legendGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', width: '45%', gap: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  settingsBox: { padding: 12, gap: 8 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  divider: { height: StyleSheet.hairlineWidth, width: '100%' },
  filterPill: { paddingHorizontal: 16, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  courseGroup: { overflow: 'hidden', marginBottom: 24 },
  courseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  courseIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  groupItems: { padding: 8 },
  fileRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 8, minHeight: 56 },
  fileIcon: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  fileDivider: { height: StyleSheet.hairlineWidth, marginLeft: 56, marginRight: 8 },
  clearCacheDock: { position: 'absolute', left: 16, right: 16, zIndex: 40 },
  clearCacheCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: 16 },
  cleanIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  clearBtn: { paddingHorizontal: 16, height: 44, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
});

