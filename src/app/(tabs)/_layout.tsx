import React, { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme, Platform } from 'react-native';
import { useElearningStore } from '@/store/useElearningStore';
import { useAuthStore } from '@/store/useAuthStore';

export default function TabsLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
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

  const activeColor = currentRole === 'teacher' ? '#8B5CF6' : '#2563EB';
  const inactiveColor = isDark ? '#94A3B8' : '#64748B';
  const bgColor = isDark ? '#0F172A' : '#FFFFFF';
  const borderColor = isDark ? '#1E293B' : '#E2E8F0';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: {
          backgroundColor: bgColor,
          borderTopColor: borderColor,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="syllabus"
        options={{
          title: 'Silabus',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="layers-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="grading"
        options={{
          title: currentRole === 'teacher' ? 'Periksa' : 'Tugas',
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
          title: currentRole === 'teacher' ? 'Akun & Evaluasi' : 'Kelulusan',
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
