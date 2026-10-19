import React, { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, useWindowDimensions } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useElearningStore } from '@/store/useElearningStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useTranslation } from '@/i18n';

export default function TabsLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const { t } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();
  const isNarrow = screenWidth < 360;
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

  const activeColor =
    currentRole === 'teacher'
      ? isDark
        ? '#8B5CF6'
        : '#7C3AED'
      : isDark
      ? '#3B82F6'
      : '#2563EB';
  const inactiveColor = '#64748B';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: {
          backgroundColor: isDark
            ? 'rgba(15, 23, 42, 0.85)'
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
          fontSize: isNarrow ? 9.5 : 10,
          fontWeight: '700',
          letterSpacing: -0.3,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: isNarrow ? 'Home' : t.common.dashboard,
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
          title:
            currentRole === 'teacher'
              ? isNarrow
                ? 'Grades'
                : t.common.gradebook
              : isNarrow
              ? 'Tasks'
              : t.common.assignments,
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
          title:
            currentRole === 'teacher'
              ? t.common.profile
              : isNarrow
              ? 'Grad'
              : t.common.graduation,
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
