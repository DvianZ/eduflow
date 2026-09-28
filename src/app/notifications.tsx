import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';

const MOCK_NOTIFICATIONS = [
  { id: '1', title: 'New Course Available!', message: 'A new Advanced Swift course has just been published. Check it out now.', time: '2h ago', isRead: false, icon: 'star' },
  { id: '2', title: 'Daily Streak Reminder', message: 'You are on a 14-day streak! Keep it up and earn more points today.', time: '5h ago', isRead: false, icon: 'flame' },
  { id: '3', title: 'Assignment Graded', message: 'Your spatial UI assignment has been reviewed by the mentor.', time: '1d ago', isRead: true, icon: 'checkmark-circle' },
];

export default function NotificationsScreen() {
  const { colors, typography, spacing, radii, shadows } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm, backgroundColor: colors.background }]}>
        <TouchableOpacity 
          style={[styles.backBtn, { backgroundColor: colors.surface0 }, shadows.sm]} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[typography.headlineSm, { color: colors.textPrimary }]}>Notifications</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.base, paddingBottom: insets.bottom + spacing.xl }}>
        {MOCK_NOTIFICATIONS.map(notif => (
          <TouchableOpacity 
            key={notif.id} 
            style={[
              styles.notificationCard, 
              { backgroundColor: notif.isRead ? colors.background : colors.surface0, borderRadius: radii.lg },
              !notif.isRead && shadows.sm
            ]}
          >
            <View style={[styles.iconContainer, { backgroundColor: colors.primaryContainer, borderRadius: radii.full }]}>
              <Ionicons name={notif.icon as any} size={20} color={colors.primary} />
            </View>
            <View style={styles.textContainer}>
              <Text style={[typography.labelMd, { color: colors.textPrimary, fontWeight: notif.isRead ? '500' : '700' }]}>{notif.title}</Text>
              <Text style={[typography.labelSm, { color: colors.textSecondary, marginTop: 4, lineHeight: 20 }]}>{notif.message}</Text>
              <Text style={[typography.labelSm, { color: colors.textTertiary, marginTop: 8, fontSize: 11 }]}>{notif.time}</Text>
            </View>
            {!notif.isRead && <View style={[styles.unreadDot, { backgroundColor: colors.error }]} />}
          </TouchableOpacity>
        ))}
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
    zIndex: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    width: 40,
  },
  notificationCard: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
    marginTop: 4,
  }
});
