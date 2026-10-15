import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useElearningStore } from '@/store/useElearningStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { InAppNotification, NotificationType } from '@/types/elearning';
import { useTranslation } from '@/i18n';

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
}

export function NotificationModal({ visible, onClose }: NotificationModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const { t } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();
  const isCompact = screenWidth < 450;

  const {
    notifGrades,
    notifRevisions,
    notifAnnouncements,
    notifDeadlines,
  } = useSettingsStore();

  const {
    currentUser,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications,
  } = useElearningStore();

  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  // Filter notifications belonging to currentUser and enabled in Settings
  const userNotifications = notifications.filter((n) => {
    if (n.userId !== currentUser.id) return false;
    if (n.type === 'grade' && !notifGrades) return false;
    if (n.type === 'revision' && !notifRevisions) return false;
    if (n.type === 'announcement' && !notifAnnouncements) return false;
    if (n.type === 'deadline' && !notifDeadlines) return false;
    return true;
  });

  const unreadCount = userNotifications.filter((n) => !n.isRead).length;

  const displayedNotifications =
    activeTab === 'unread'
      ? userNotifications.filter((n) => !n.isRead)
      : userNotifications;

  const handleNotificationPress = (notif: InAppNotification) => {
    if (!notif.isRead) {
      markNotificationAsRead(notif.id);
    }
    if (notif.linkRoute) {
      onClose();
      // Safe navigation
      router.push(notif.linkRoute as any);
    }
  };

  const formatRelativeTime = (isoString: string): string => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMinutes < 1) return t.notifications.timeJustNow;
      if (diffMinutes < 60) return `${diffMinutes} ${t.notifications.timeMinutesAgo}`;
      if (diffHours < 24) return `${diffHours} ${t.notifications.timeHoursAgo}`;
      if (diffDays === 1) return t.notifications.timeYesterday;
      if (diffDays < 7) return `${diffDays} ${t.notifications.timeDaysAgo}`;

      return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
      });
    } catch {
      return '';
    }
  };

  const getIconAndColor = (
    type: NotificationType
  ): { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string } => {
    switch (type) {
      case 'grade':
        return {
          icon: 'trophy',
          color: '#10B981',
          bg: isDark ? 'rgba(16, 185, 129, 0.2)' : '#ECFDF5',
        };
      case 'revision':
        return {
          icon: 'alert-circle',
          color: '#F59E0B',
          bg: isDark ? 'rgba(245, 158, 11, 0.2)' : '#FFFBEB',
        };
      case 'announcement':
        return {
          icon: 'megaphone',
          color: '#8B5CF6',
          bg: isDark ? 'rgba(139, 92, 246, 0.2)' : '#F5F3FF',
        };
      case 'enrollment':
        return {
          icon: 'people',
          color: '#2563EB',
          bg: isDark ? 'rgba(37, 99, 235, 0.2)' : '#EFF6FF',
        };
      case 'deadline':
        return {
          icon: 'time',
          color: '#EF4444',
          bg: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEF2F2',
        };
      case 'system':
      default:
        return {
          icon: 'notifications',
          color: '#6366F1',
          bg: isDark ? 'rgba(99, 102, 241, 0.2)' : '#EEF2FF',
        };
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}>
      <View
        style={[
          styles.modalOverlay,
          !isCompact && styles.modalOverlayCenter,
        ]}>
        {/* Backdrop Dismiss Touch */}
        <TouchableOpacity
          activeOpacity={1}
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityLabel="Dismiss notifications"
        />

        <View
          style={[
            styles.modalContent,
            isCompact ? styles.modalContentCompact : styles.modalContentCenter,
            {
              backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
              borderColor: isDark ? '#334155' : '#E2E8F0',
            },
          ]}>
          {/* Sheet Handle */}
          {isCompact && (
            <View
              style={[
                styles.dragHandle,
                { backgroundColor: isDark ? '#334155' : '#CBD5E1' },
              ]}
            />
          )}

          {/* Header */}
          <View style={[styles.modalHeader, isCompact && { paddingHorizontal: 16, paddingTop: 12 }]}>
            <View style={styles.headerTitleRow}>
              <View style={styles.bellIconBox}>
                <Ionicons name="notifications" size={18} color="#8B5CF6" />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.modalTitle,
                    { color: isDark ? '#F8FAFC' : '#0F172A' },
                  ]}>
                  {t.notifications.modalTitle}
                </Text>
                <Text numberOfLines={1} style={styles.modalSubtitle}>
                  {unreadCount > 0
                    ? `${unreadCount} ${t.notifications.unreadTab.toLowerCase()}`
                    : t.notifications.modalSubtitle}
                </Text>
              </View>
            </View>

            {/* Header Action Buttons - Pinned & Never Clipped */}
            <View style={styles.headerActionBtns}>
              {unreadCount > 0 && (
                <TouchableOpacity
                  onPress={() => markAllNotificationsAsRead(currentUser.id)}
                  style={[
                    styles.readAllBtn,
                    { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' },
                  ]}
                  accessibilityLabel={t.notifications.markAllRead}>
                  <Ionicons name="checkmark-done" size={15} color="#8B5CF6" />
                  {!isCompact && (
                    <Text style={styles.readAllText}>{t.notifications.markAllRead}</Text>
                  )}
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={onClose}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                style={[
                  styles.closeIconBtn,
                  {
                    backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
                    borderColor: isDark ? '#334155' : '#CBD5E1',
                  },
                ]}
                accessibilityLabel="Close notifications">
                <Ionicons
                  name="close"
                  size={19}
                  color={isDark ? '#F8FAFC' : '#0F172A'}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Filter Tabs */}
          <View
            style={[
              styles.tabContainer,
              isCompact && { marginHorizontal: 16 },
              { backgroundColor: isDark ? '#1E293B' : '#F8FAFC' },
            ]}>
            <TouchableOpacity
              onPress={() => setActiveTab('all')}
              style={[
                styles.tabBtn,
                activeTab === 'all' && [
                  styles.activeTabBtn,
                  { backgroundColor: isDark ? '#334155' : '#FFFFFF' },
                ],
              ]}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'all'
                    ? styles.activeTabText
                    : { color: isDark ? '#94A3B8' : '#64748B' },
                ]}>
                {t.notifications.allTab} ({userNotifications.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('unread')}
              style={[
                styles.tabBtn,
                activeTab === 'unread' && [
                  styles.activeTabBtn,
                  { backgroundColor: isDark ? '#334155' : '#FFFFFF' },
                ],
              ]}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'unread'
                    ? styles.activeTabText
                    : { color: isDark ? '#94A3B8' : '#64748B' },
                ]}>
                {t.notifications.unreadTab} ({unreadCount})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Notification List */}
          <ScrollView
            style={[styles.listContainer, isCompact && { paddingHorizontal: 16 }]}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}>
            {displayedNotifications.length === 0 ? (
              <View style={styles.emptyState}>
                <View
                  style={[
                    styles.emptyIconCircle,
                    { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' },
                  ]}>
                  <Ionicons
                    name="notifications-off-outline"
                    size={36}
                    color={isDark ? '#64748B' : '#94A3B8'}
                  />
                </View>
                <Text
                  style={[
                    styles.emptyTitle,
                    { color: isDark ? '#F8FAFC' : '#0F172A' },
                  ]}>
                  {t.notifications.noNotifications}
                </Text>
                <Text style={styles.emptySubtitle}>
                  {t.notifications.modalSubtitle}
                </Text>
              </View>
            ) : (
              displayedNotifications.map((notif) => {
                const config = getIconAndColor(notif.type);
                return (
                  <TouchableOpacity
                    key={notif.id}
                    activeOpacity={0.7}
                    onPress={() => handleNotificationPress(notif)}
                    style={[
                      styles.notifCard,
                      {
                        backgroundColor: notif.isRead
                          ? isDark
                            ? '#131D33'
                            : '#FFFFFF'
                          : isDark
                          ? '#1E293B'
                          : '#F8FAFC',
                        borderColor: !notif.isRead
                          ? isDark
                            ? '#3B82F6'
                            : '#93C5FD'
                          : isDark
                          ? '#1E293B'
                          : '#E2E8F0',
                      },
                    ]}>
                    <View
                      style={[
                        styles.notifIconBox,
                        { backgroundColor: config.bg },
                      ]}>
                      <Ionicons
                        name={config.icon}
                        size={20}
                        color={config.color}
                      />
                    </View>

                    <View style={styles.notifBody}>
                      <View style={styles.notifTopRow}>
                        <Text
                          style={[
                            styles.notifTitle,
                            {
                              color: isDark ? '#F8FAFC' : '#0F172A',
                              fontWeight: notif.isRead ? '600' : '700',
                            },
                          ]}
                          numberOfLines={2}>
                          {notif.title}
                        </Text>
                        {!notif.isRead && <View style={styles.unreadDot} />}
                      </View>

                      <Text
                        style={[
                          styles.notifMessage,
                          { color: isDark ? '#94A3B8' : '#475569' },
                        ]}
                        numberOfLines={3}>
                        {notif.message}
                      </Text>

                      <View style={styles.notifFooter}>
                        <Text style={styles.notifTime}>
                          ⏱️ {formatRelativeTime(notif.createdAt)}
                        </Text>
                        {notif.linkRoute && (
                          <View style={styles.actionPrompt}>
                            <Text style={styles.actionPromptText}>Open</Text>
                            <Ionicons
                              name="arrow-forward"
                              size={12}
                              color="#8B5CF6"
                            />
                          </View>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>

          {/* Footer actions */}
          {userNotifications.length > 0 && (
            <View
              style={[
                styles.modalFooter,
                isCompact && { paddingHorizontal: 16 },
                { borderTopColor: isDark ? '#1E293B' : '#E2E8F0' },
              ]}>
              <TouchableOpacity
                onPress={() => clearNotifications(currentUser.id)}
                style={styles.clearAllBtn}>
                <Ionicons name="trash-outline" size={14} color="#EF4444" />
                <Text style={styles.clearAllText}>Clear All</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  modalOverlayCenter: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  modalContentCompact: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomWidth: 0,
    width: '100%',
    maxHeight: '90%',
    minHeight: 380,
  },
  modalContentCenter: {
    borderRadius: 24,
    width: '100%',
    maxWidth: 500,
    maxHeight: '85%',
    minHeight: 420,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  dragHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 8,
  },
  headerTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minWidth: 0,
  },
  bellIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  modalSubtitle: {
    fontSize: 11,
    color: '#8B5CF6',
    fontWeight: '600',
    marginTop: 1,
  },
  headerActionBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  readAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
    minHeight: 34,
  },
  readAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  closeIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    flexShrink: 0,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 4,
    borderRadius: 10,
    gap: 6,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTabBtn: {
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#8B5CF6',
    fontWeight: '800',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listContent: {
    paddingBottom: 24,
    gap: 10,
  },
  notifCard: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 12,
  },
  notifIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  notifBody: {
    flex: 1,
  },
  notifTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: 14,
    flex: 1,
    lineHeight: 19,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
    marginTop: 5,
  },
  notifMessage: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  notifFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notifTime: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  actionPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  actionPromptText: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '700',
  },
  emptyState: {
    paddingVertical: 50,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 19,
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  clearAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearAllText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
  },
});
