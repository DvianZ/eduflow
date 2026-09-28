import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';

import { useTheme } from '@/hooks/use-theme';

export default function CertificateScreen() {
  const { colors, typography, spacing, radii, shadows } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isWalletAdded, setIsWalletAdded] = useState(false);
  const [isShared, setIsShared] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm, backgroundColor: colors.surface0, borderBottomColor: colors.surface3 }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.primaryContainer} />
          </TouchableOpacity>
          <Text style={[typography.headlineSm, { color: colors.textPrimary }]} numberOfLines={1}>
            Certificate
          </Text>
          <View style={styles.iconBtn}>
            <Ionicons name="close" size={24} color={colors.textSecondary} />
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 60,
          paddingBottom: insets.bottom + 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: spacing.base, marginTop: spacing.md, gap: spacing.md }}>
          {/* Status Banner */}
          <View style={[styles.statusCard, { backgroundColor: colors.surface0, borderRadius: radii.xl }, shadows.sm]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={[styles.verifiedTag, { backgroundColor: 'rgba(50, 183, 107, 0.1)' }]}>
                <Ionicons name="shield-checkmark" size={16} color={colors.success} />
                <Text style={[typography.labelSm, { color: colors.success, fontWeight: '600', marginLeft: 6 }]}>Verified by EduFlow Academy</Text>
              </View>
              <Text style={[typography.labelSm, { color: colors.textTertiary }]}>Live on Ledger</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={[typography.labelSm, { color: colors.textTertiary }]}>REF:</Text>
                <Text style={[typography.labelMd, { color: colors.textPrimary, fontFamily: 'monospace', fontWeight: '600', letterSpacing: 1 }]}>#EDU-2026-DI-98421</Text>
              </View>
              <TouchableOpacity 
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }} 
                onPress={() => {
                  setIsCopied(true);
                  setTimeout(() => setIsCopied(false), 2000);
                }}
              >
                <Ionicons name={isCopied ? "checkmark" : "copy-outline"} size={16} color={isCopied ? colors.success : colors.primaryContainer} />
                <Text style={[typography.labelSm, { color: isCopied ? colors.success : colors.primaryContainer, fontWeight: '600' }]}>{isCopied ? 'Copied!' : 'Copy ID'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Certificate Canvas */}
          <View style={[styles.certCanvas, { backgroundColor: colors.surfaceContainer, borderRadius: radii.xl * 1.5 }, shadows.md]}>
            <View style={[styles.certInner, { backgroundColor: colors.surface0, borderRadius: radii.xl }]}>
              
              <View style={{ alignItems: 'center', marginBottom: 16 }}>
                <View style={[styles.academySeal, { backgroundColor: colors.primaryContainer }]}>
                  <Ionicons name="school" size={16} color={colors.onPrimaryContainer} />
                </View>
                <Text style={[typography.labelSm, { color: colors.textSecondary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 2, marginTop: 8, textAlign: 'center' }]}>EduFlow Institute of Design</Text>
                <View style={[styles.dividerLine, { backgroundColor: colors.surface4 }]} />
              </View>

              <Text style={[typography.labelMd, { color: colors.primary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 3, textAlign: 'center', marginBottom: 4 }]}>Certificate of Accomplishment</Text>
              <Text style={[typography.labelSm, { color: colors.textTertiary, textTransform: 'uppercase', letterSpacing: 1.5, textAlign: 'center', marginBottom: 12 }]}>This is proudly presented to</Text>

              <Text style={[styles.studentName, { color: colors.textPrimary }]}>Alex Morgan</Text>

              <Text style={[typography.bodySm, { color: colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 20, paddingHorizontal: 16 }]}>
                For successfully mastering the advanced curriculum in <Text style={{ fontWeight: '600', color: colors.textPrimary }}>Mastering Dynamic Island & Live Activities</Text>, demonstrating excellence in ActivityKit and SwiftUI Keyframe Animations.
              </Text>

              <View style={[styles.metaRow, { backgroundColor: colors.surface1 }]}>
                <View style={{ alignItems: 'flex-start' }}>
                  <Text style={[typography.labelSm, { fontSize: 10, color: colors.textTertiary, textTransform: 'uppercase' }]}>Date of Award</Text>
                  <Text style={[typography.labelMd, { color: colors.textPrimary, fontWeight: '500' }]}>Oct 14, 2026</Text>
                </View>
                <View style={[styles.vDivider, { backgroundColor: colors.surface4 }]} />
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[typography.labelSm, { fontSize: 10, color: colors.textTertiary, textTransform: 'uppercase' }]}>Grade Level</Text>
                  <Text style={[typography.labelMd, { color: colors.success, fontWeight: '600' }]}>Distinction (A+)</Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%', marginTop: 24, paddingHorizontal: 12 }}>
                <View style={{ alignItems: 'center', width: 80 }}>
                  <Text style={{ fontFamily: 'monospace', color: colors.primaryContainer, fontSize: 18, fontStyle: 'italic', marginBottom: -4 }}>S.Lin</Text>
                  <View style={[styles.sigLine, { backgroundColor: colors.surface3 }]} />
                  <Text style={[typography.labelSm, { fontSize: 10, fontWeight: '600', color: colors.textPrimary }]}>Sarah Lin</Text>
                  <Text style={[typography.labelSm, { fontSize: 8, color: colors.textTertiary }]}>Lead Architect</Text>
                </View>

                <View style={[styles.goldSeal, { borderColor: colors.tertiary, backgroundColor: colors.surface0, shadowColor: colors.tertiary }]}>
                  <Ionicons name="ribbon" size={16} color={colors.tertiary} />
                  <Text style={{ fontSize: 8, fontWeight: '700', textTransform: 'uppercase', color: colors.textPrimary, marginTop: 2 }}>EduFlow</Text>
                </View>

                <View style={{ alignItems: 'center', width: 80 }}>
                  <Text style={{ fontFamily: 'monospace', color: colors.primaryContainer, fontSize: 18, fontStyle: 'italic', marginBottom: -4 }}>D.Chen</Text>
                  <View style={[styles.sigLine, { backgroundColor: colors.surface3 }]} />
                  <Text style={[typography.labelSm, { fontSize: 10, fontWeight: '600', color: colors.textPrimary }]}>David Chen</Text>
                  <Text style={[typography.labelSm, { fontSize: 8, color: colors.textTertiary }]}>Director</Text>
                </View>
              </View>

            </View>
          </View>

          {/* Competencies */}
          <View style={[styles.compCard, { backgroundColor: colors.surface0, borderRadius: radii.xl }, shadows.sm]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={[typography.headlineSm, { color: colors.textPrimary }]}>Curriculum Competencies</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name="checkmark-done-circle" size={16} color={colors.success} />
                <Text style={[typography.labelSm, { color: colors.textSecondary }]}>8/8 Passed</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              <View style={[styles.skillTag, { backgroundColor: colors.surface2 }]}><View style={[styles.skillDot, { backgroundColor: colors.primaryContainer }]} /><Text style={[typography.labelSm, { color: colors.textPrimary }]}>ActivityKit 2.0</Text></View>
              <View style={[styles.skillTag, { backgroundColor: colors.surface2 }]}><View style={[styles.skillDot, { backgroundColor: colors.primaryContainer }]} /><Text style={[typography.labelSm, { color: colors.textPrimary }]}>Dynamic Island Architecture</Text></View>
              <View style={[styles.skillTag, { backgroundColor: colors.surface2 }]}><View style={[styles.skillDot, { backgroundColor: colors.primaryContainer }]} /><Text style={[typography.labelSm, { color: colors.textPrimary }]}>SwiftUI Keyframe Animation</Text></View>
            </View>
          </View>

          {/* Actions */}
          <View style={{ gap: 8, marginTop: 8 }}>
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: isDownloaded ? colors.surface3 : colors.primaryContainer }, shadows.sm]} 
              onPress={() => {
                if (isDownloaded) return;
                setIsDownloading(true);
                setTimeout(() => { setIsDownloading(false); setIsDownloaded(true); }, 2000);
              }}
            >
              <Ionicons name={isDownloaded ? "checkmark-circle" : "download-outline"} size={20} color={isDownloaded ? colors.textPrimary : colors.onPrimaryContainer} />
              <Text style={[typography.labelLg, { color: isDownloaded ? colors.textPrimary : colors.onPrimaryContainer }]}>
                {isDownloading ? 'Downloading...' : isDownloaded ? 'Downloaded to Device' : 'Download Certificate (PDF)'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: isWalletAdded ? 'rgba(50, 183, 107, 0.1)' : colors.surface0 }, shadows.sm]} 
              onPress={() => setIsWalletAdded(true)}
            >
              <Ionicons name={isWalletAdded ? "checkmark-circle" : "wallet-outline"} size={20} color={isWalletAdded ? colors.success : colors.textPrimary} />
              <Text style={[typography.labelLg, { color: isWalletAdded ? colors.success : colors.textPrimary }]}>{isWalletAdded ? 'Added to Wallet' : 'Add to Apple Wallet'}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: 'transparent' }]} 
              onPress={() => {
                setIsShared(true);
                setTimeout(() => setIsShared(false), 2000);
              }}
            >
              <Ionicons name={isShared ? "checkmark" : "share-social-outline"} size={18} color={isShared ? colors.success : colors.primaryContainer} />
              <Text style={[typography.labelMd, { color: isShared ? colors.success : colors.primaryContainer, fontWeight: '600' }]}>{isShared ? 'Link Shared!' : 'Share Credential to LinkedIn'}</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { borderBottomWidth: StyleSheet.hairlineWidth, position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, height: 56 },
  iconBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  statusCard: { padding: 16 },
  verifiedTag: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  certCanvas: { padding: 20, overflow: 'hidden' },
  certInner: { padding: 16, alignItems: 'center' },
  academySeal: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  dividerLine: { width: 40, height: 2, borderRadius: 1, marginTop: 12 },
  studentName: { fontSize: 28, fontWeight: '700', fontStyle: 'italic', fontFamily: 'serif', marginBottom: 12 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', width: '90%', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  vDivider: { width: 1, height: 24 },
  sigLine: { width: '100%', height: 1, marginVertical: 4 },
  goldSeal: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  compCard: { padding: 16 },
  skillTag: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16 },
  skillDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 48, borderRadius: 12, gap: 8 },
});
