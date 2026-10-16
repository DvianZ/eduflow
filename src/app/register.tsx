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
import type { UserRole } from '@/types/elearning';

export default function RegisterScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const { t } = useTranslation();

  const { register, login } = useAuthStore();
  const { syncUserFromAuth } = useElearningStore();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('learner');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = () => {
    setError('');

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError(t.common.error);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const result = register(fullName, email, password, selectedRole);
      if (!result.success) {
        setIsLoading(false);
        setError(result.error || 'Registrasi gagal.');
        return;
      }

      // Auto-login after register
      const loginResult = login(email, password);
      setIsLoading(false);

      if (loginResult.success && loginResult.user) {
        syncUserFromAuth({
          id: loginResult.user.id,
          fullName: loginResult.user.fullName,
          email: loginResult.user.email,
          role: loginResult.user.role,
          avatarUrl: loginResult.user.avatarUrl,
        });
        useElearningStore.getState().setHasSeenAppTour(false);
        useTourStore.getState().openTour(0);
        router.replace('/');
      }
    }, 800);
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/login');
    }
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
          {/* Back + Title */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={handleBack}
              style={[
                styles.backBtn,
                { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' },
              ]}>
              <Ionicons
                name="arrow-back"
                size={20}
                color={textPrimary}
              />
            </TouchableOpacity>
            <View style={styles.headerTextCol}>
              <Text style={[styles.headerTitle, { color: textPrimary }]}>
                {t.auth.registerTitle}
              </Text>
              <Text style={[styles.headerSubtitle, { color: textSecondary }]}>
                {t.auth.registerSubtitle}
              </Text>
            </View>
          </View>

          {/* Role Selector */}
          <View
            style={[
              styles.roleSelectorContainer,
              {
                backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
                borderColor: isDark ? '#334155' : '#E2E8F0',
              },
            ]}>
            <TouchableOpacity
              style={[
                styles.roleOption,
                selectedRole === 'learner' && styles.roleOptionActiveLearner,
              ]}
              onPress={() => setSelectedRole('learner')}
              activeOpacity={0.7}>
              <View
                style={[
                  styles.roleIconCircle,
                  {
                    backgroundColor:
                      selectedRole === 'learner' ? '#DBEAFE' : isDark ? '#0F172A' : '#FFFFFF',
                  },
                ]}>
                <Ionicons
                  name="person"
                  size={20}
                  color={selectedRole === 'learner' ? '#2563EB' : textSecondary}
                />
              </View>
              <Text
                style={[
                  styles.roleLabel,
                  {
                    color:
                      selectedRole === 'learner'
                        ? '#FFFFFF'
                        : isDark
                        ? '#94A3B8'
                        : '#64748B',
                  },
                ]}>
                {t.common.learner}
              </Text>
              <Text
                style={[
                  styles.roleDesc,
                  {
                    color:
                      selectedRole === 'learner'
                        ? 'rgba(255,255,255,0.7)'
                        : isDark
                        ? '#64748B'
                        : '#94A3B8',
                  },
                ]}>
                {t.auth.demoBudiDesc}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.roleOption,
                selectedRole === 'teacher' && styles.roleOptionActiveTeacher,
              ]}
              onPress={() => setSelectedRole('teacher')}
              activeOpacity={0.7}>
              <View
                style={[
                  styles.roleIconCircle,
                  {
                    backgroundColor:
                      selectedRole === 'teacher' ? '#EDE9FE' : isDark ? '#0F172A' : '#FFFFFF',
                  },
                ]}>
                <Ionicons
                  name="school"
                  size={20}
                  color={selectedRole === 'teacher' ? '#7C3AED' : textSecondary}
                />
              </View>
              <Text
                style={[
                  styles.roleLabel,
                  {
                    color:
                      selectedRole === 'teacher'
                        ? '#FFFFFF'
                        : isDark
                        ? '#94A3B8'
                        : '#64748B',
                  },
                ]}>
                {t.common.instructor}
              </Text>
              <Text
                style={[
                  styles.roleDesc,
                  {
                    color:
                      selectedRole === 'teacher'
                        ? 'rgba(255,255,255,0.7)'
                        : isDark
                        ? '#64748B'
                        : '#94A3B8',
                  },
                ]}>
                {t.auth.demoAlexDesc}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Card */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: cardBg,
                borderColor: isDark ? '#334155' : '#E2E8F0',
              },
            ]}>
            {error !== '' && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color="#DC2626" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: textSecondary }]}>
                {t.auth.fullNameLabel}
              </Text>
              <View
                style={[
                  styles.inputRow,
                  { backgroundColor: inputBg, borderColor: inputBorder },
                ]}>
                <Ionicons
                  name="person-outline"
                  size={18}
                  color={textSecondary}
                />
                <TextInput
                  style={[styles.textInput, { color: textPrimary }]}
                  placeholder={t.auth.fullNamePlaceholder}
                  placeholderTextColor={textSecondary}
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: textSecondary }]}>
                {t.auth.emailLabel}
              </Text>
              <View
                style={[
                  styles.inputRow,
                  { backgroundColor: inputBg, borderColor: inputBorder },
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
                  { backgroundColor: inputBg, borderColor: inputBorder },
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

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: textSecondary }]}>
                Confirm Password
              </Text>
              <View
                style={[
                  styles.inputRow,
                  { backgroundColor: inputBg, borderColor: inputBorder },
                ]}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={18}
                  color={textSecondary}
                />
                <TextInput
                  style={[styles.textInput, { color: textPrimary }]}
                  placeholder="Repeat your password"
                  placeholderTextColor={textSecondary}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                />
              </View>
            </View>

            {/* Register Button */}
            <TouchableOpacity
              style={[
                styles.primaryButton,
                {
                  backgroundColor:
                    selectedRole === 'teacher' ? '#7C3AED' : '#2563EB',
                },
                isLoading && styles.primaryButtonDisabled,
              ]}
              onPress={handleRegister}
              disabled={isLoading}
              activeOpacity={0.85}>
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.primaryButtonText}>
                    {t.auth.registerSubmitBtn} (
                    {selectedRole === 'teacher' ? t.common.instructor : t.common.learner})
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Back to Login */}
            <TouchableOpacity
              style={styles.linkRow}
              onPress={handleBack}>
              <Text style={[styles.linkText, { color: textSecondary }]}>
                {t.auth.alreadyHaveAccount}
              </Text>
            </TouchableOpacity>
          </View>
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
    paddingTop: 16,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTextCol: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  roleSelectorContainer: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 4,
    gap: 4,
    marginBottom: 20,
    borderWidth: 1,
  },
  roleOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 4,
  },
  roleOptionActiveLearner: {
    backgroundColor: '#2563EB',
    shadowColor: '#2563EB',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  roleOptionActiveTeacher: {
    backgroundColor: '#7C3AED',
    shadowColor: '#7C3AED',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  roleIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  roleDesc: {
    fontSize: 11,
    fontWeight: '500',
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    marginBottom: 16,
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
    borderRadius: 14,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
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
  linkRow: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
  },
});
