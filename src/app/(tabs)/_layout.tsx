import React, { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme, Platform } from 'react-native';
import { useElearningStore } from '@/store/useElearningStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useTranslation } from '@/i18n';

export default function TabsLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const { t } = useTranslation();
  const session = useAuthStore((state) => state.session);
  const currentRole = useElearningStore((state) => state.currentRole);
  const currentUser = useElearningStore((state) => state.currentUser);
  const batches = useElearningStore((state) => state.batches);
  const teacherBatchIds = batches
    .filter((b) => b.instructorId === currentUser.id)
    .map((b) => b.id);
  const pendingSubmissionsCount = useElearningStore((state) =>
    state.submissions.filter(
      (s) => s.status === 'SUBMITTED' && teacherBatchIds.includes(s.batchId)
    ).length
  );

  useEffect(() => {
    if (!session?.isAuthenticated) {
      router.replace('/login');
    }
  }, [session?.isAuthenticated, router]);

  const activeColor = currentRole === 'teacher' ? '#8B5CF6' : '#007AFF';
  const inactiveColor = isDark ? '#8E8E93' : '#8E8E93';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: {
          backgroundColor: isDark
            ? 'rgba(28, 28, 30, 0.85)'
            : 'rgba(255, 255, 255, 0.85)',
          borderTopColor: isDark
            ? 'rgba(255, 255, 255, 0.08)'
            : 'rgba(0, 0, 0, 0.06)',
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 8,
          ...(Platform.OS === 'web' && ({
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          } as any)),
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t.common.dashboard,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="syllabus"
        options={{
          title: t.common.syllabus,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="layers-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="grading"
        options={{
          title: currentRole === 'teacher' ? t.common.gradebook : t.common.assignments,
          tabBarBadge:
            currentRole === 'teacher' && pendingSubmissionsCount > 0
              ? pendingSubmissionsCount
              : undefined,
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name={currentRole === 'teacher' ? 'clipboard-outline' : 'document-text-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: currentRole === 'teacher' ? t.common.profile : t.common.graduation,
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name={currentRole === 'teacher' ? 'person-circle-outline' : 'ribbon-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
