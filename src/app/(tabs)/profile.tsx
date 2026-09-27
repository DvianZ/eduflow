import { ScrollView, StyleSheet, Text, View, Image, TouchableOpacity, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

import { useTheme } from '@/hooks/use-theme';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';
import { TextInput } from 'react-native';

export default function ProfileScreen() {
  const { colors, typography, spacing, radii, shadows } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, setUser, resetStore } = useAppStore();
  const isPro = user.isPro;
  
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeSettingModal, setActiveSettingModal] = useState<string | null>(null);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.sm,
          paddingBottom: insets.bottom + 96,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: spacing.base, marginTop: spacing.xs }}>
          <View style={styles.header}>
            <Text style={[typography.headlineMd, { color: colors.textPrimary }]}>
              Profile
            </Text>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.iconBtn} onPress={() => setShowNotifications(!showNotifications)}>
                <Ionicons name="notifications-outline" size={22} color={colors.textSecondary} />
                <View style={{ position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.error }} />
              </TouchableOpacity>
              <Image
                source={{ uri: 'https://lh3.googleusercontent.com/aida/AEtjO1WaHZb7NKm-N9FPGnW28jnYsblH33HsbgLJYMY7q-8Mm3GwDKspdqsW_3iurw9pZ9Qit-OdyBbz2XGXVNy1yMlaQi8wPQLCqj9AciVod62FAT6d46-qLZfpZ7SOScAoB1f6qvEqsyY_NasA5nKJausIBVSNfdtCJOelfNAYMV0LXKd43_7LNjnZxevvcNXQn6EDW089a-zP6zoLCnQBCyF0DqkEIg45iEu824uvs_N0YPHPo_o' }}
                style={styles.profileHeaderImg}
              />
            </View>
          </View>
        </View>

        <View style={{ paddingHorizontal: spacing.base, marginTop: spacing.md, gap: spacing.md }}>
          {/* Identity Card */}
          <View style={[styles.identityCard, { backgroundColor: colors.surface0, borderRadius: radii.xl }, shadows.sm]}>
            <View style={styles.identityTop}>
              <View>
                <Image
                  source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD72_bzYly7wG1zbwGJPAlIiR5FHYaU23gu1DdljFGXy_DdvrgEdnJEdJnBjgzFWadt6F6IMr-IJ6hB3zx4sQD0Y2NbKzV8ks1CUNFKplVL_aUMtuHyPqv9xGwqdsCoLlFBLVahNEbW0XRVGe9mCIKrDvaL3_Ny3TN40IZ65mYN4rg4mYCqsK_JImSQJPt6opZLNtMyMGcymxoMlCOaF_U7BoA418OAvf4p0OC3RlgVZvaLTQKHeNPD' }}
                  style={styles.avatarImg}
                />
                <View style={[styles.verifiedBadge, { backgroundColor: colors.surface0 }]}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                </View>
              </View>
              <TouchableOpacity style={[styles.editBtn, { backgroundColor: isEditing ? colors.primaryContainer : 'rgba(225, 226, 235, 0.5)' }]} onPress={() => {
                if (isEditing && name.trim()) {
                  setUser({ name: name.trim() });
                }
                setIsEditing(!isEditing);
              }}>
                <Ionicons name={isEditing ? "checkmark" : "pencil"} size={16} color={isEditing ? colors.onPrimary : colors.primary} />
                <Text style={[typography.labelMd, { color: isEditing ? colors.onPrimary : colors.primary, marginLeft: 6 }]}>{isEditing ? 'Save' : 'Edit Profile'}</Text>
              </TouchableOpacity>
            </View>

            <View style={{ marginTop: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {isEditing ? (
                  <TextInput 
                    style={[typography.headlineLg, { color: colors.textPrimary, borderBottomWidth: 1, borderBottomColor: colors.primaryContainer, padding: 0 }]}
                    value={name}
                    onChangeText={setName}
                    autoFocus
                  />
                ) : (
                  <Text style={[typography.headlineLg, { color: colors.textPrimary }]}>{name}</Text>
                )}
                <View style={[styles.verifiedTag, { backgroundColor: 'rgba(68, 65, 204, 0.1)' }]}>
                  <Text style={[typography.labelSm, { color: colors.primary }]}>Verified Learner</Text>
                </View>
              </View>
              <Text style={[typography.bodyMd, { color: colors.onSurfaceVariant, marginTop: 2 }]}>
                Senior iOS Student & Lead Designer
              </Text>
              
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name="mail-outline" size={15} color={colors.outline} />
                  <Text style={[typography.labelMd, { color: colors.textSecondary }]}>{user.email}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name="calendar-outline" size={15} color={colors.outline} />
                  <Text style={[typography.labelMd, { color: colors.textSecondary }]}>Member since Feb 2025</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Pro Banner */}
          {isPro ? (
            <View style={[styles.proBanner, { backgroundColor: colors.surface0, borderRadius: radii.xl, borderColor: colors.primaryContainer, borderWidth: 1 }, shadows.sm]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={[styles.proTag, { backgroundColor: colors.surface1 }, shadows.sm]}>
                  <Ionicons name="ribbon" size={16} color={colors.primary} />
                  <Text style={[typography.labelSm, { color: colors.primary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginLeft: 6 }]}>
                    Pro Member • Annual
                  </Text>
                </View>
                <Text style={[typography.labelSm, { color: colors.textSecondary }]}>Renews Oct 2026</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 12 }}>
                <View style={{ flex: 1, paddingRight: 16 }}>
                  <Text style={[typography.headlineSm, { color: colors.textPrimary }]}>Unlimited Pro Access</Text>
                  <Text style={[typography.bodySm, { color: colors.onSurfaceVariant, marginTop: 2 }]}>
                    Full offline lessons, code reviews, and priority certificates
                  </Text>
                </View>
                <TouchableOpacity style={[styles.manageBtn, { backgroundColor: colors.primaryContainer }]} onPress={() => router.push('/checkout')}>
                  <Text style={[typography.labelMd, { color: colors.onPrimaryContainer }]}>Manage</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={[styles.proBanner, { backgroundColor: colors.surface0, borderRadius: radii.xl, borderColor: colors.outlineVariant, borderWidth: 1 }, shadows.sm]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={[styles.proTag, { backgroundColor: colors.surface2 }]}>
                  <Ionicons name="star" size={16} color={colors.textSecondary} />
                  <Text style={[typography.labelSm, { color: colors.textSecondary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginLeft: 6 }]}>
                    Free Plan
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 12 }}>
                <View style={{ flex: 1, paddingRight: 16 }}>
                  <Text style={[typography.headlineSm, { color: colors.textPrimary }]}>Upgrade to Pro</Text>
                  <Text style={[typography.bodySm, { color: colors.onSurfaceVariant, marginTop: 2 }]}>
                    Unlock full offline lessons, code reviews, and premium certificates.
                  </Text>
                </View>
                <TouchableOpacity style={[styles.manageBtn, { backgroundColor: colors.primary }]} onPress={() => router.push('/checkout')}>
                  <Text style={[typography.labelMd, { color: colors.onPrimary }]}>Upgrade</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Statistics */}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={[styles.statCard, { backgroundColor: colors.surface0, borderRadius: radii.xl }, shadows.sm]}>
              <View style={[styles.statIconBox, { backgroundColor: 'rgba(255, 220, 198, 0.6)' }]}>
                <Ionicons name="flame" size={20} color={colors.tertiaryContainer} />
              </View>
              <Text style={[typography.headlineSm, { color: colors.textPrimary, marginTop: 6 }]}>14 Days</Text>
              <Text style={[typography.labelSm, { color: colors.textSecondary }]}>Study Streak</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.surface0, borderRadius: radii.xl }, shadows.sm]}>
              <View style={[styles.statIconBox, { backgroundColor: 'rgba(226, 223, 255, 0.8)' }]}>
                <Ionicons name="time" size={20} color={colors.primary} />
              </View>
              <Text style={[typography.headlineSm, { color: colors.textPrimary, marginTop: 6 }]}>48.5 hrs</Text>
              <Text style={[typography.labelSm, { color: colors.textSecondary }]}>Total Learned</Text>
            </View>
            <TouchableOpacity 
              style={[styles.statCard, { backgroundColor: colors.surface0, borderRadius: radii.xl }, shadows.sm]}
              onPress={() => router.push('/certificate/1')}
            >
              <View style={[styles.statIconBox, { backgroundColor: 'rgba(50, 183, 107, 0.15)' }]}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              </View>
              <Text style={[typography.headlineSm, { color: colors.textPrimary, marginTop: 6 }]}>{user.certificates} Certs</Text>
              <Text style={[typography.labelSm, { color: colors.textSecondary }]}>Verified Badges</Text>
            </TouchableOpacity>
          </View>

          {/* Settings Groups */}
          <View style={{ marginTop: spacing.sm }}>
            <Text style={[typography.labelSm, { color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, paddingHorizontal: 4 }]}>
              Learning Preferences
            </Text>
            <View style={[styles.settingsGroup, { backgroundColor: colors.surface0, borderRadius: radii.xl }, shadows.sm]}>
              <SettingsItem icon="calendar" title="Daily Study Goal" value="45 mins/day" colors={colors} typography={typography} onPress={() => setActiveSettingModal('Daily Study Goal')} />
              <View style={[styles.divider, { backgroundColor: colors.surfaceContainer }]} />
              <SettingsItem icon="folder" title="Download & Storage" value="5.3 GB used" colors={colors} typography={typography} onPress={() => setActiveSettingModal('Download & Storage')} />
              <View style={[styles.divider, { backgroundColor: colors.surfaceContainer }]} />
              <SettingsItem icon="play-circle" title="Video Playback Quality" value="1080p (Auto)" colors={colors} typography={typography} onPress={() => setActiveSettingModal('Video Playback Quality')} />
              <View style={[styles.divider, { backgroundColor: colors.surfaceContainer }]} />
              <View style={styles.settingsItem}>
                <View style={styles.settingsLeft}>
                  <View style={[styles.settingIconBox, { backgroundColor: 'rgba(255, 220, 198, 0.6)' }]}>
                    <Ionicons name="headset" size={19} color={colors.tertiary} />
                  </View>
                  <Text style={[typography.bodyMd, { color: colors.textPrimary }]}>Audio & Background Play</Text>
                </View>
                <Switch
                  value={isAudioEnabled}
                  onValueChange={setIsAudioEnabled}
                  trackColor={{ false: colors.surfaceContainerHighest, true: colors.primaryContainer }}
                  thumbColor={colors.surface0}
                />
              </View>
              <View style={[styles.divider, { backgroundColor: colors.surfaceContainer }]} />
              <SettingsItem icon="notifications" title="Push & Study Reminders" value="Daily 09:00 AM" colors={colors} typography={typography} onPress={() => setActiveSettingModal('Push Reminders')} />
            </View>
          </View>

          <View>
            <Text style={[typography.labelSm, { color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, paddingHorizontal: 4 }]}>
              Account & Security
            </Text>
            <View style={[styles.settingsGroup, { backgroundColor: colors.surface0, borderRadius: radii.xl }, shadows.sm]}>
              <SettingsItem icon="key" title="Apple ID & Passkeys" value="Connected" valueColor={colors.success} colors={colors} typography={typography} onPress={() => setActiveSettingModal('Apple ID')} />
              <View style={[styles.divider, { backgroundColor: colors.surfaceContainer }]} />
              <SettingsItem icon="git-network" title="Linked Accounts" value="GitHub, LinkedIn" colors={colors} typography={typography} onPress={() => setActiveSettingModal('Linked Accounts')} />
              <View style={[styles.divider, { backgroundColor: colors.surfaceContainer }]} />
              <SettingsItem icon="card" title="Payment Methods" value="Pay ending in 4242" colors={colors} typography={typography} onPress={() => setActiveSettingModal('Payment Methods')} />
            </View>
          </View>

          <View>
            <Text style={[typography.labelSm, { color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, paddingHorizontal: 4 }]}>
              Support & Legal
            </Text>
            <View style={[styles.settingsGroup, { backgroundColor: colors.surface0, borderRadius: radii.xl }, shadows.sm]}>
              <SettingsItem icon="help-circle-outline" title="Help Center & FAQs" colors={colors} typography={typography} onPress={() => setActiveSettingModal('Help Center')} />
              <View style={[styles.divider, { backgroundColor: colors.surfaceContainer }]} />
              <SettingsItem icon="shield-checkmark-outline" title="Terms of Service & Privacy" colors={colors} typography={typography} onPress={() => setActiveSettingModal('Privacy Policy')} />
            </View>
          </View>

          {/* Logout */}
          <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: colors.surface0, borderRadius: radii.xl }, shadows.sm]} onPress={() => {
            resetStore();
            router.replace('/onboarding');
          }}>
            <Ionicons name="log-out-outline" size={20} color={colors.error} />
            <Text style={[typography.headlineSm, { color: colors.error, marginLeft: 8 }]}>Log Out</Text>
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[typography.labelSm, { color: colors.textSecondary }]}>EduFlow v2.4.0 (Build 1802)</Text>
            <Text style={[typography.labelSm, { color: colors.outline, marginTop: 2 }]}>Designed with care for iOS 18</Text>
          </View>

        </View>
      </ScrollView>

      {/* Notifications Panel */}
      {showNotifications && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 50 }]}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowNotifications(false)} />
          <View style={{ backgroundColor: colors.surface0, borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, padding: spacing.md, paddingBottom: insets.bottom + spacing.md }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
              <Text style={[typography.headlineSm, { color: colors.textPrimary }]}>Notifications</Text>
              <TouchableOpacity onPress={() => setShowNotifications(false)}><Ionicons name="close" size={24} color={colors.textSecondary} /></TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start', paddingVertical: 8 }}>
              <View style={[styles.settingIconBox, { backgroundColor: 'rgba(68, 65, 204, 0.1)' }]}><Ionicons name="flash" size={18} color={colors.primary} /></View>
              <View style={{ flex: 1 }}>
                <Text style={[typography.labelMd, { color: colors.textPrimary }]}>Daily Streak at Risk!</Text>
                <Text style={[typography.bodySm, { color: colors.textSecondary, marginTop: 2 }]}>Complete a 3-min bite to keep your 14-day streak burning.</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Settings Modal */}
      {activeSettingModal && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 60, justifyContent: 'center', alignItems: 'center', padding: spacing.xl }]}>
          <View style={{ backgroundColor: colors.surface0, borderRadius: radii.xl, padding: spacing.lg, width: '100%', alignItems: 'center' }}>
            <Ionicons name="settings" size={48} color={colors.primaryContainer} style={{ marginBottom: 12 }} />
            <Text style={[typography.headlineSm, { color: colors.textPrimary, textAlign: 'center' }]}>{activeSettingModal}</Text>
            <Text style={[typography.bodyMd, { color: colors.textSecondary, textAlign: 'center', marginTop: 8, marginBottom: 24 }]}>
              Settings management for this feature is coming in the next update.
            </Text>
            <TouchableOpacity style={[styles.manageBtn, { backgroundColor: colors.surface2, width: '100%', alignItems: 'center' }]} onPress={() => setActiveSettingModal(null)}>
              <Text style={[typography.labelLg, { color: colors.textPrimary }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

function SettingsItem({ icon, title, value, valueColor, colors, typography, onPress }: any) {
  return (
    <TouchableOpacity style={styles.settingsItem} onPress={onPress}>
      <View style={styles.settingsLeft}>
        <View style={[styles.settingIconBox, { backgroundColor: colors.secondaryFixed }]}>
          <Ionicons name={icon as any} size={19} color={colors.onSecondaryFixed} />
        </View>
        <Text style={[typography.bodyMd, { color: colors.textPrimary }]}>{title}</Text>
      </View>
      <View style={styles.settingsRight}>
        {value && <Text style={[typography.bodyMd, { color: valueColor || colors.textSecondary, marginRight: 6 }]}>{value}</Text>}
        <Ionicons name="chevron-forward" size={18} color={colors.outline} />
      </View>
    </TouchableOpacity>
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
    paddingBottom: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileHeaderImg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(194, 193, 255, 0.4)',
  },
  identityCard: {
    padding: 24,
  },
  identityTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  avatarImg: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    padding: 2,
    borderRadius: 12,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  verifiedTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  proBanner: {
    padding: 16,
  },
  proTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  manageBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  statCard: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
  },
  statIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsGroup: {
    overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 56,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingBottom: 32,
  },
});

