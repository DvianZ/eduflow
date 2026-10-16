import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/useAuthStore';
import { useElearningStore } from '@/store/useElearningStore';
import { useTourStore } from '@/store/useTourStore';
import { useTranslation } from '@/i18n';

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const { t } = useTranslation();

  const { login } = useAuthStore();
  const { syncUserFromAuth } = useElearningStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = () => {
    setError('');
    setIsLoading(true);

    // Simulate network delay for feel
    setTimeout(() => {
      const result = login(email, password);
      setIsLoading(false);

      if (!result.success) {
        setError(result.error || t.common.failed);
        return;
      }

      if (result.user) {
        syncUserFromAuth({
          id: result.user.id,
          fullName: result.user.fullName,
          email: result.user.email,
          role: result.user.role,
          avatarUrl: result.user.avatarUrl,
        });
        router.replace('/(tabs)');
      }
    }, 600);
  };

  const handleDemoLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('demo123');
    setError('');
  };

  const bg = isDark ? '#090D16' : '#F0F4FF';
  const cardBg = isDark ? '#1E293B' : '#FFFFFF';
  const textPrimary = isDark ? '#F8FAFC' : '#0F172A';
  const textSecondary = isDark ? '#94A3B8' : '#64748B';
  const inputBg = isDark ? '#0F172A' : '#F1F5F9';
  const inputBorder = isDark ? '#334155' : '#CBD5E1';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bg }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {/* Brand */}
          <View style={styles.brandSection}>
            <View style={styles.logoContainer}>
              <View style={styles.logoGradient}>
                <Ionicons name="school" size={32} color="#FFFFFF" />
              </View>
            </View>
            <Text style={[styles.brandTitle, { color: textPrimary }]}>
              EduFlow <Text style={styles.cohortTag}>{t.header.cohortTag}</Text>
            </Text>
            <Text style={[styles.brandSubtitle, { color: textSecondary }]}>
              Collaborative Cohort E-Learning
            </Text>
          </View>

          {/* Login Card */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: cardBg,
                borderColor: isDark ? '#334155' : '#E2E8F0',
              },
            ]}>
            <Text style={[styles.cardTitle, { color: textPrimary }]}>
              {t.auth.loginTitle}
            </Text>
            <Text style={[styles.cardSubtitle, { color: textSecondary }]}>
              {t.auth.loginSubtitle}
            </Text>

            {error !== '' && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color="#DC2626" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: textSecondary }]}>
                {t.auth.emailLabel}
              </Text>
              <View
                style={[
                  styles.inputRow,
                  {
                    backgroundColor: inputBg,
                    borderColor: inputBorder,
                  },
                ]}>
                <Ionicons
                  name="mail-outline"
                  size={18}
                  color={textSecondary}
                />
                <TextInput
                  style={[styles.textInput, { color: textPrimary }]}
                  placeholder={t.auth.emailPlaceholder}
                  placeholderTextColor={textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: textSecondary }]}>
                {t.auth.passwordLabel}
              </Text>
              <View
                style={[
                  styles.inputRow,
                  {
                    backgroundColor: inputBg,
                    borderColor: inputBorder,
                  },
                ]}>
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color={textSecondary}
                />
                <TextInput
                  style={[styles.textInput, { color: textPrimary }]}
                  placeholder={t.auth.passwordPlaceholder}
                  placeholderTextColor={textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[
                styles.primaryButton,
                isLoading && styles.primaryButtonDisabled,
              ]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.85}>
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons name="log-in-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.primaryButtonText}>{t.auth.loginBtn}</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View
                style={[
                  styles.dividerLine,
                  { backgroundColor: isDark ? '#334155' : '#E2E8F0' },
                ]}
              />
              <Text style={[styles.dividerText, { color: textSecondary }]}>
                {t.common.or}
              </Text>
              <View
                style={[
                  styles.dividerLine,
                  { backgroundColor: isDark ? '#334155' : '#E2E8F0' },
                ]}
              />
            </View>

            {/* Register Link */}
            <TouchableOpacity
              style={[
                styles.secondaryButton,
                {
                  borderColor: isDark ? '#334155' : '#CBD5E1',
                  backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                },
              ]}
              onPress={() => router.push('/register')}
              activeOpacity={0.85}>
              <Ionicons
                name="person-add-outline"
                size={18}
                color={isDark ? '#93C5FD' : '#2563EB'}
              />
              <Text
                style={[
                  styles.secondaryButtonText,
                  { color: isDark ? '#93C5FD' : '#2563EB' },
                ]}>
                {t.auth.createAccountBtn}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Demo Quick Login */}
          <View
            style={[
              styles.demoCard,
              {
                backgroundColor: isDark ? '#1E293B' : '#FFFBEB',
                borderColor: isDark ? '#334155' : '#FDE68A',
              },
            ]}>
            <View style={styles.demoHeader}>
              <Ionicons name="flask-outline" size={16} color="#D97706" />
              <Text style={[styles.demoTitle, { color: isDark ? '#FCD34D' : '#92400E' }]}>
                {t.auth.demoQuickLoginTitle}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.demoBtn,
                {
                  backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                  borderColor: isDark ? '#334155' : '#E2E8F0',
                },
              ]}
              onPress={() => handleDemoLogin('budi@eduflow.id')}>
              <View style={[styles.demoAvatar, { backgroundColor: '#DBEAFE' }]}>
                <Ionicons name="person" size={14} color="#2563EB" />
              </View>
              <View style={styles.demoInfo}>
                <Text style={[styles.demoName, { color: textPrimary }]}>
                  Budi Santoso
                </Text>
                <Text style={[styles.demoRole, { color: textSecondary }]}>
                  {t.auth.demoBudiDesc}
                </Text>
              </View>
              <Ionicons name="arrow-forward" size={16} color={textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.demoBtn,
                {
                  backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                  borderColor: isDark ? '#334155' : '#E2E8F0',
                },
              ]}
              onPress={() => handleDemoLogin('alex@eduflow.id')}>
              <View style={[styles.demoAvatar, { backgroundColor: '#EDE9FE' }]}>
                <Ionicons name="school" size={14} color="#7C3AED" />
              </View>
              <View style={styles.demoInfo}>
                <Text style={[styles.demoName, { color: textPrimary }]}>
                  Alex Kurniawan, M.Sc.
                </Text>
                <Text style={[styles.demoRole, { color: textSecondary }]}>
                  {t.auth.demoAlexDesc}
                </Text>
              </View>
              <Ionicons name="arrow-forward" size={16} color={textSecondary} />
            </TouchableOpacity>

            <Text style={[styles.demoHint, { color: textSecondary }]}>
              {t.auth.demoHint}
            </Text>
          </View>

          {/* Client Testing Tour Showcase */}
          <TouchableOpacity
            style={[
              styles.tourCard,
              {
                backgroundColor: isDark ? '#1E293B' : '#EFF6FF',
                borderColor: isDark ? '#3B82F6' : '#93C5FD',
              },
            ]}
            onPress={() => useTourStore.getState().openTour(0)}
            activeOpacity={0.85}>
            <View style={styles.tourCardLeft}>
              <View style={styles.tourIconBadge}>
                <Ionicons name="sparkles" size={20} color="#2563EB" />
              </View>
              <View style={styles.tourCardTexts}>
                <View style={styles.tourPill}>
                  <Text style={styles.tourPillText}>{t.auth.tourCardBadge}</Text>
                </View>
                <Text style={[styles.tourCardTitle, { color: textPrimary }]}>
                  {t.auth.tourCardTitle}
                </Text>
                <Text style={[styles.tourCardDesc, { color: textSecondary }]}>
                  {t.auth.tourCardDesc}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#2563EB" />
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoContainer: {
    marginBottom: 12,
  },
  logoGradient: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  cohortTag: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3B82F6',
  },
  brandSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    marginBottom: 20,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEE2E2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '600',
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 8,
    height: 48,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    height: 48,
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    borderRadius: 14,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
    shadowColor: '#2563EB',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '600',
  },
  secondaryButton: {
    borderRadius: 14,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  demoCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  demoTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  demoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    gap: 10,
  },
  demoAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoInfo: {
    flex: 1,
  },
  demoName: {
    fontSize: 14,
    fontWeight: '700',
  },
  demoRole: {
    fontSize: 11,
    fontWeight: '500',
  },
  demoHint: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
    fontStyle: 'italic',
  },
  tourCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderBottomWidth: 4,
    marginTop: 14,
  },
  tourCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  tourIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tourCardTexts: {
    flex: 1,
  },
  tourPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#2563EB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  tourPillText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tourCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  tourCardDesc: {
    fontSize: 11,
    lineHeight: 15,
  },
  topLangRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  langTogglePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  langToggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
});
