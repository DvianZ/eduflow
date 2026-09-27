import { ScrollView, StyleSheet, Text, View, TouchableOpacity, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';

import { useTheme } from '@/hooks/use-theme';
import { useAppStore } from '@/store/useAppStore';

export default function OnboardingScreen() {
  const { colors, typography, spacing, radii, shadows } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { completeOnboarding } = useAppStore();

  const [selectedTracks, setSelectedTracks] = useState<string[]>(['spatial']);
  const [selectedPace, setSelectedPace] = useState('30');
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);

  const toggleTrack = (id: string) => {
    setSelectedTracks(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const tracks = [
    { id: 'spatial', title: 'SwiftUI & Spatial UI', desc: 'visionOS, gestures, & tactile layouts', icon: 'cube-outline' },
    { id: 'design', title: 'Design Systems & HIG', desc: 'Apple ergonomics & tokens', icon: 'color-palette-outline' },
    { id: 'ml', title: 'AI & CoreML Engineering', desc: 'On-device neural inference', icon: 'hardware-chip-outline' },
    { id: 'product', title: 'Product Strategy & Metrics', desc: 'Retention loops & cohorts', icon: 'stats-chart-outline' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      
      {/* Header */}
      <View style={{ paddingHorizontal: spacing.base, paddingVertical: spacing.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={[styles.logoBox, { backgroundColor: colors.primaryContainer }]}>
            <Ionicons name="school" size={24} color={colors.onPrimary} />
          </View>
          <View>
            <Text style={[typography.headlineSm, { color: colors.textPrimary }]}>EduFlow</Text>
            <Text style={[typography.labelSm, { color: colors.textSecondary }]}>Onboarding</Text>
          </View>
        </View>
        <View style={[styles.stepBadge, { backgroundColor: colors.surface2 }]}>
          <Text style={[typography.labelSm, { color: colors.primary, fontWeight: '600' }]}>Step {currentStep}</Text>
          <Text style={[typography.labelSm, { color: colors.textTertiary }]}> / 3</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={{ flexDirection: 'row', gap: 6, paddingHorizontal: spacing.base, marginVertical: spacing.sm }}>
        <View style={[styles.progBar, { backgroundColor: currentStep >= 1 ? colors.primaryContainer : colors.surface3 }]} />
        <View style={[styles.progBar, { backgroundColor: currentStep >= 2 ? colors.primaryContainer : colors.surface3 }]} />
        <View style={[styles.progBar, { backgroundColor: currentStep >= 3 ? colors.primaryContainer : colors.surface3 }]} />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.base,
          paddingBottom: insets.bottom + 120,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[typography.displayLgMobile, { color: colors.textPrimary, marginBottom: 6, marginTop: spacing.md }]}>What do you wish to master?</Text>
        <Text style={[typography.bodyMd, { color: colors.textSecondary, marginBottom: spacing.lg }]}>
          Personalize your curriculum with AI-curated daily sprints crafted for modern product makers.
        </Text>

        {currentStep === 1 && (
        <View style={{ marginBottom: spacing.lg }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={[typography.labelMd, { color: colors.textSecondary, textTransform: 'uppercase' }]}>Select Primary Focus</Text>
            <Text style={[typography.labelSm, { color: colors.primary }]}>Multi-select enabled</Text>
          </View>
          <View style={{ gap: 12 }}>
            {tracks.map(track => {
              const isSelected = selectedTracks.includes(track.id);
              return (
                <TouchableOpacity
                  key={track.id}
                  style={[
                    styles.trackCard,
                    { backgroundColor: isSelected ? 'rgba(94, 92, 230, 0.03)' : colors.surface0 },
                    !isSelected && shadows.sm
                  ]}
                  onPress={() => toggleTrack(track.id)}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                    <View style={[styles.trackIconBox, { backgroundColor: isSelected ? 'rgba(94, 92, 230, 0.1)' : colors.surface2 }]}>
                      <Ionicons name={track.icon as any} size={24} color={isSelected ? colors.primary : colors.textSecondary} />
                    </View>
                    <View>
                      <Text style={[typography.headlineSm, { color: colors.textPrimary }]}>{track.title}</Text>
                      <Text style={[typography.bodySm, { color: colors.textSecondary }]}>{track.desc}</Text>
                    </View>
                  </View>
                  <View style={[styles.checkCircle, { backgroundColor: isSelected ? colors.primaryContainer : colors.surface2 }]}>
                    {isSelected && <Ionicons name="checkmark" size={16} color={colors.onPrimary} />}
                  </View>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>
        )}

        {currentStep === 2 && (
        <View style={{ marginBottom: spacing.lg }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={[typography.labelMd, { color: colors.textSecondary, textTransform: 'uppercase' }]}>Daily Pace Commitment</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="flash" size={14} color={colors.success} />
              <Text style={[typography.labelSm, { color: colors.success, fontWeight: '500' }]}>High Completion Rate</Text>
            </View>
          </View>
          <View style={{ gap: 12 }}>
            {[
              { id: '15', title: '15 min / day', desc: 'Casual • 1 micro-lesson', icon: 'partly-sunny-outline', label: 'Light' },
              { id: '30', title: '30 min / day', desc: 'Focused • 2 lessons + 1 quiz', icon: 'timer-outline', label: 'Optimal', rec: true },
              { id: '45', title: '45 min / day', desc: 'Intensive • Deep project sprint', icon: 'flame-outline', label: 'Pro' }
            ].map(pace => {
              const isSelected = selectedPace === pace.id;
              return (
                <TouchableOpacity
                  key={pace.id}
                  style={[
                    styles.paceCard,
                    { backgroundColor: isSelected ? 'rgba(94, 92, 230, 0.02)' : colors.surface0 },
                    isSelected ? { borderWidth: 2, borderColor: colors.primary } : shadows.sm
                  ]}
                  onPress={() => setSelectedPace(pace.id)}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Ionicons name={pace.icon as any} size={24} color={isSelected ? colors.primary : colors.textSecondary} />
                    <View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={[typography.headlineSm, { color: colors.textPrimary }]}>{pace.title}</Text>
                        {pace.rec && <View style={[styles.recTag, { backgroundColor: 'rgba(94, 92, 230, 0.1)' }]}><Text style={[typography.labelSm, { color: colors.primary }]}>Recommended</Text></View>}
                      </View>
                      <Text style={[typography.bodySm, { color: colors.textSecondary }]}>{pace.desc}</Text>
                    </View>
                  </View>
                  <Text style={[typography.labelSm, { color: isSelected ? colors.primary : colors.textTertiary, fontWeight: isSelected ? '600' : '400' }]}>{pace.label}</Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>
        )}

        {currentStep === 3 && (
        <View style={[styles.reminderCard, { backgroundColor: colors.surface0, borderRadius: radii.xl }, shadows.sm]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <View style={[styles.remIconBox, { backgroundColor: 'rgba(255, 149, 0, 0.1)' }]}>
              <Ionicons name="notifications" size={24} color={colors.warning} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[typography.headlineSm, { color: colors.textPrimary }]}>Morning Focus Push</Text>
              <Text style={[typography.bodySm, { color: colors.textSecondary }]}>Daily reminder scheduled at 09:00 AM</Text>
            </View>
          </View>
          <Switch value={remindersEnabled} onValueChange={setRemindersEnabled} trackColor={{ true: colors.primaryContainer, false: colors.surface3 }} />
        </View>
        )}
      </ScrollView>

      {/* Bottom Actions */}
      <View style={[styles.bottomDock, { paddingBottom: insets.bottom + 12, backgroundColor: colors.background }]}>
        <TouchableOpacity 
          style={[styles.continueBtn, { backgroundColor: colors.primaryContainer }, shadows.sm]}
          onPress={() => {
            if (currentStep < 3) {
              setCurrentStep(currentStep + 1);
            } else {
              completeOnboarding({
                tracks: selectedTracks,
                dailyPace: selectedPace,
                remindersEnabled,
              });
              router.push('/(tabs)');
            }
          }}
        >
          <Text style={[typography.labelLg, { color: colors.onPrimary }]}>{currentStep < 3 ? 'Next Step' : 'Complete Setup'}</Text>
          <Ionicons name="arrow-forward" size={18} color={colors.onPrimary} />
        </TouchableOpacity>
        {currentStep === 1 && (
        <TouchableOpacity style={styles.skipBtn} onPress={() => {
          completeOnboarding({
            tracks: selectedTracks,
            dailyPace: selectedPace,
            remindersEnabled,
          });
          router.push('/(tabs)');
        }}>
          <Text style={[typography.labelMd, { color: colors.textSecondary }]}>Skip for now</Text>
        </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  logoBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  stepBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  progBar: { flex: 1, height: 6, borderRadius: 3 },
  trackCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 12 },
  trackIconBox: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  checkCircle: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  paceCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 12, borderWidth: 2, borderColor: 'transparent' },
  recTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  reminderCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, marginBottom: 24 },
  remIconBox: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  bottomDock: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 16, paddingTop: 12 },
  continueBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 52, borderRadius: 12, gap: 8 },
  skipBtn: { alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
});

