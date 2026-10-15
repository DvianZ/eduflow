import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useElearningStore } from '@/store/useElearningStore';
import { useAuthStore } from '@/store/useAuthStore';
import { NotificationModal } from '@/components/NotificationModal';
import { FeatureTourModal } from '@/components/FeatureTourModal';
import { useTranslation } from '@/i18n';

export function DemoHeader() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const { t } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();
  const isCompact = screenWidth < 380;
  const isUltraCompact = screenWidth < 340;

  const [showNotifications, setShowNotifications] = useState(false);
  const [showFeatureTour, setShowFeatureTour] = useState(false);

  const {
    currentRole,
    switchRole,
    userStreak,
    currentUser,
    notifications,
    hasSeenAppTour,
  } = useElearningStore();
  const { getCurrentUser } = useAuthStore();
  const authUser = getCurrentUser();

  // Auto-show guided tour if user hasn't seen it yet
  useEffect(() => {
    if (!hasSeenAppTour) {
      const timer = setTimeout(() => {
        setShowFeatureTour(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [hasSeenAppTour]);

  const userNotifications = notifications.filter(
    (n) => n.userId === currentUser.id
  );
  const unreadCount = userNotifications.filter((n) => !n.isRead).length;

  const isTeacher = currentRole === 'teacher';
  const displayName = authUser?.fullName || currentUser.fullName;

  // Only show role switcher for seed demo users
  const isSeedUser =
    currentUser.id === 'user-budi' || currentUser.id === 'user-alex';

  return (
    <View
      style={[
        styles.container,
        isCompact && { paddingHorizontal: isUltraCompact ? 8 : 10, paddingTop: 10, paddingBottom: 8 },
        {
          backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
          borderBottomColor: isDark ? '#1E293B' : '#E2E8F0',
        },
      ]}>
      {/* Brand & Streak Row */}
      <View style={styles.topRow}>
        <View style={[styles.brandContainer, isCompact && { gap: 5, marginRight: 2 }]}>
          <View
            style={[
              styles.logoIcon,
              isCompact && { width: isUltraCompact ? 26 : 28, height: isUltraCompact ? 26 : 28, borderRadius: 6 },
              { backgroundColor: isTeacher ? '#8B5CF6' : '#2563EB' },
            ]}>
            <Ionicons name="school" size={isUltraCompact ? 13 : 15} color="#FFFFFF" />
          </View>
          <View style={styles.brandTextWrapper}>
            <Text
              style={[
                styles.brandTitle,
                isCompact && { fontSize: isUltraCompact ? 12 : 13 },
                { color: isDark ? '#F8FAFC' : '#0F172A' },
              ]}
              numberOfLines={1}>
              EduFlow{!isUltraCompact && <Text style={[styles.cohortTag, isCompact && { fontSize: 10 }]}> {t.header.cohortTag}</Text>}
            </Text>
            <Text style={[styles.userSubtitle, isCompact && { fontSize: 10 }]} numberOfLines={1}>
              {isUltraCompact ? displayName.split(' ')[0] : displayName}
            </Text>
          </View>
        </View>

        <View style={[styles.rightActions, isCompact && { gap: isUltraCompact ? 3 : 4 }]}>
          <View
            style={[
              styles.streakBadge,
              isCompact && { paddingHorizontal: isUltraCompact ? 3 : 4, paddingVertical: 2 },
              { backgroundColor: isDark ? '#1E293B' : '#FEF3C7' },
            ]}>
            <Text style={[styles.streakText, isCompact && { fontSize: 10 }]}>
              {isUltraCompact ? `${userStreak.currentStreak}d` : `🔥 ${userStreak.currentStreak}d`}
            </Text>
          </View>

          {/* Feature Tour Guide Button */}
          <TouchableOpacity
            onPress={() => setShowFeatureTour(true)}
            style={[
              styles.iconBtn,
              isCompact && { width: isUltraCompact ? 24 : 26, height: isUltraCompact ? 24 : 26, borderRadius: 12 },
              {
                backgroundColor: isDark ? '#1E293B' : '#EFF6FF',
                borderWidth: 1,
                borderColor: isDark ? '#334155' : '#BFDBFE',
              },
            ]}
            accessibilityLabel={t.header.guideBtn}>
            <Ionicons name="sparkles" size={isUltraCompact ? 12 : 14} color="#2563EB" />
          </TouchableOpacity>

          {/* In-App Notification Bell */}
          <TouchableOpacity
            onPress={() => setShowNotifications(true)}
            style={[
              styles.iconBtn,
              styles.notifBtn,
              isCompact && { width: isUltraCompact ? 24 : 26, height: isUltraCompact ? 24 : 26, borderRadius: 12 },
              { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' },
            ]}
            accessibilityLabel={`${t.common.notifications} (${unreadCount})`}>
            <Ionicons
              name={unreadCount > 0 ? 'notifications' : 'notifications-outline'}
              size={isUltraCompact ? 13 : 15}
              color={
                unreadCount > 0 ? '#8B5CF6' : isDark ? '#94A3B8' : '#64748B'
              }
            />
            {unreadCount > 0 && (
              <View style={[styles.badgeCountCircle, isUltraCompact && { width: 12, height: 12, top: -2, right: -2 }]}>
                <Text style={[styles.badgeCountText, isUltraCompact && { fontSize: 8 }]}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Settings Button */}
          <TouchableOpacity
            onPress={() => router.push('/settings')}
            style={[
              styles.iconBtn,
              isCompact && { width: isUltraCompact ? 24 : 26, height: isUltraCompact ? 24 : 26, borderRadius: 12 },
              { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' },
            ]}
            accessibilityLabel={t.common.settings}>
            <Ionicons
              name="settings-outline"
              size={isUltraCompact ? 13 : 15}
              color={isDark ? '#94A3B8' : '#64748B'}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Role Switcher Pill — only for seed demo users */}
      {isSeedUser ? (
        <View
          style={[
            styles.roleSwitchContainer,
            isCompact && { padding: 2 },
            { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' },
          ]}>
          <TouchableOpacity
            onPress={() => switchRole('learner')}
            style={[
              styles.rolePill,
              isCompact && { paddingVertical: 5, paddingHorizontal: 3, gap: 3 },
              !isTeacher && styles.activePillLearner,
            ]}>
            <Ionicons
              name="person"
              size={isCompact ? 11 : 14}
              color={!isTeacher ? '#FFFFFF' : isDark ? '#94A3B8' : '#64748B'}
            />
            <Text
              style={[
                styles.rolePillText,
                isCompact && { fontSize: isUltraCompact ? 10 : 11 },
                { color: !isTeacher ? '#FFFFFF' : isDark ? '#94A3B8' : '#64748B' },
              ]}
              numberOfLines={1}>
              {isUltraCompact ? 'Learner' : isCompact ? 'Learner (Budi)' : t.common.modeLearner}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => switchRole('teacher')}
            style={[
              styles.rolePill,
              isCompact && { paddingVertical: 5, paddingHorizontal: 3, gap: 3 },
              isTeacher && styles.activePillTeacher,
            ]}>
            <Ionicons
              name="school"
              size={isCompact ? 11 : 14}
              color={isTeacher ? '#FFFFFF' : isDark ? '#94A3B8' : '#64748B'}
            />
            <Text
              style={[
                styles.rolePillText,
                isCompact && { fontSize: isUltraCompact ? 10 : 11 },
                { color: isTeacher ? '#FFFFFF' : isDark ? '#94A3B8' : '#64748B' },
              ]}
              numberOfLines={1}>
              {isUltraCompact ? 'Instructor' : isCompact ? 'Instructor (Alex)' : t.common.modeInstructor}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View
          style={[
            styles.roleIndicator,
            isCompact && { paddingVertical: 6, gap: 4 },
            {
              backgroundColor: isTeacher
                ? isDark
                  ? '#2D1B69'
                  : '#EDE9FE'
                : isDark
                ? '#172554'
                : '#DBEAFE',
            },
          ]}>
          <Ionicons
            name={isTeacher ? 'school' : 'person'}
            size={isCompact ? 12 : 14}
            color={isTeacher ? '#A78BFA' : '#60A5FA'}
          />
          <Text
            style={[
              styles.roleIndicatorText,
              isCompact && { fontSize: 11 },
              { color: isTeacher ? '#A78BFA' : '#60A5FA' },
            ]}>
            {t.header.loggedInAs} {isTeacher ? t.common.instructor : t.common.learner}
          </Text>
        </View>
      )}

      {/* In-App Guided Feature Tour Modal */}
      <FeatureTourModal
        visible={showFeatureTour}
        onClose={() => setShowFeatureTour(false)}
      />

      {/* Notification Center Modal */}
      <NotificationModal
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 0,
    marginRight: 6,
  },
  brandTextWrapper: {
    flex: 1,
    minWidth: 0,
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  brandTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  cohortTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3B82F6',
  },
  userSubtitle: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    flexShrink: 1,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexShrink: 0,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 12,
  },
  streakText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  xpText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10B981',
  },
  iconBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tourBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  tourBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  roleSwitchContainer: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 3,
  },
  rolePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  activePillLearner: {
    backgroundColor: '#2563EB',
  },
  activePillTeacher: {
    backgroundColor: '#8B5CF6',
  },
  rolePillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  roleIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 12,
  },
  roleIndicatorText: {
    fontSize: 12,
    fontWeight: '700',
  },
  notifBtn: {
    position: 'relative',
  },
  badgeCountCircle: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#EF4444',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeCountText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
});
