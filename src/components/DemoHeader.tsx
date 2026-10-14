import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useElearningStore } from '@/store/useElearningStore';
import { useAuthStore } from '@/store/useAuthStore';
import { NotificationModal } from '@/components/NotificationModal';

export function DemoHeader() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  const [showNotifications, setShowNotifications] = useState(false);
  const {
    currentRole,
    switchRole,
    userStreak,
    resetDemoData,
    currentUser,
    notifications,
  } = useElearningStore();
  const { logout, getCurrentUser } = useAuthStore();
  const authUser = getCurrentUser();

  const userNotifications = notifications.filter(
    (n) => n.userId === currentUser.id
  );
  const unreadCount = userNotifications.filter((n) => !n.isRead).length;

  const handleReset = () => {
    if (typeof window !== 'undefined' && window.confirm) {
      if (window.confirm('Reset semua data demo ke kondisi awal?')) {
        resetDemoData();
      }
    } else {
      Alert.alert(
        'Reset Data Demo',
        'Kembalikan semua progres belajar, kuis, dan tugas ke kondisi awal?',
        [
          { text: 'Batal', style: 'cancel' },
          { text: 'Reset', style: 'destructive', onPress: resetDemoData },
        ]
      );
    }
  };

  const handleLogout = () => {
    const doLogout = () => {
      logout();
      resetDemoData();
      router.replace('/login');
    };

    if (typeof window !== 'undefined' && window.confirm) {
      if (window.confirm('Keluar dari akun?')) {
        doLogout();
      }
    } else {
      Alert.alert('Logout', 'Keluar dari akun EduFlow?', [
        { text: 'Batal', style: 'cancel' },
        { text: 'Keluar', style: 'destructive', onPress: doLogout },
      ]);
    }
  };

  const isTeacher = currentRole === 'teacher';
  const displayName = authUser?.fullName || currentUser.fullName;

  // Only show role switcher for seed demo users
  const isSeedUser =
    currentUser.id === 'user-budi' || currentUser.id === 'user-alex';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
          borderBottomColor: isDark ? '#1E293B' : '#E2E8F0',
        },
      ]}>
      {/* Brand & Streak Row */}
      <View style={styles.topRow}>
        <View style={styles.brandContainer}>
          <View
            style={[
              styles.logoIcon,
              { backgroundColor: isTeacher ? '#8B5CF6' : '#2563EB' },
            ]}>
            <Ionicons name="school" size={16} color="#FFFFFF" />
          </View>
          <View>
            <Text
              style={[
                styles.brandTitle,
                { color: isDark ? '#F8FAFC' : '#0F172A' },
              ]}>
              EduFlow <Text style={styles.cohortTag}>Cohort</Text>
            </Text>
            <Text style={styles.userSubtitle} numberOfLines={1}>
              {displayName}
            </Text>
          </View>
        </View>

        <View style={styles.rightActions}>
          <View
            style={[
              styles.streakBadge,
              { backgroundColor: isDark ? '#1E293B' : '#FEF3C7' },
            ]}>
            <Text style={styles.streakText}>🔥 {userStreak.currentStreak}d</Text>
            <Text style={styles.xpText}>{userStreak.totalXp} XP</Text>
          </View>

          {/* In-App Notification Bell */}
          <TouchableOpacity
            onPress={() => setShowNotifications(true)}
            style={[
              styles.iconBtn,
              styles.notifBtn,
              { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' },
            ]}
            accessibilityLabel={`Notifikasi (${unreadCount} belum dibaca)`}>
            <Ionicons
              name={unreadCount > 0 ? 'notifications' : 'notifications-outline'}
              size={17}
              color={
                unreadCount > 0 ? '#8B5CF6' : isDark ? '#94A3B8' : '#64748B'
              }
            />
            {unreadCount > 0 && (
              <View style={styles.badgeCountCircle}>
                <Text style={styles.badgeCountText}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleReset}
            style={[
              styles.iconBtn,
              { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' },
            ]}
            accessibilityLabel="Reset Demo Data">
            <Ionicons
              name="refresh-outline"
              size={16}
              color={isDark ? '#94A3B8' : '#64748B'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLogout}
            style={[
              styles.iconBtn,
              { backgroundColor: isDark ? '#371520' : '#FEE2E2' },
            ]}
            accessibilityLabel="Logout">
            <Ionicons name="log-out-outline" size={16} color="#DC2626" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Role Switcher Pill — only for seed demo users */}
      {isSeedUser ? (
        <View
          style={[
            styles.roleSwitchContainer,
            { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' },
          ]}>
          <TouchableOpacity
            onPress={() => switchRole('learner')}
            style={[
              styles.rolePill,
              !isTeacher && styles.activePillLearner,
            ]}>
            <Ionicons
              name="person"
              size={14}
              color={!isTeacher ? '#FFFFFF' : isDark ? '#94A3B8' : '#64748B'}
            />
            <Text
              style={[
                styles.rolePillText,
                { color: !isTeacher ? '#FFFFFF' : isDark ? '#94A3B8' : '#64748B' },
              ]}>
              Mode Siswa (Budi)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => switchRole('teacher')}
            style={[
              styles.rolePill,
              isTeacher && styles.activePillTeacher,
            ]}>
            <Ionicons
              name="school"
              size={14}
              color={isTeacher ? '#FFFFFF' : isDark ? '#94A3B8' : '#64748B'}
            />
            <Text
              style={[
                styles.rolePillText,
                { color: isTeacher ? '#FFFFFF' : isDark ? '#94A3B8' : '#64748B' },
              ]}>
              Mode Pengajar (Pak Alex)
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View
          style={[
            styles.roleIndicator,
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
            size={14}
            color={isTeacher ? '#A78BFA' : '#60A5FA'}
          />
          <Text
            style={[
              styles.roleIndicatorText,
              { color: isTeacher ? '#A78BFA' : '#60A5FA' },
            ]}>
            Login sebagai {isTeacher ? 'Pengajar' : 'Siswa'}
          </Text>
        </View>
      )}

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
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 16,
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
    maxWidth: 160,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
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
