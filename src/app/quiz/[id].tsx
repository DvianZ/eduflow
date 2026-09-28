import { ScrollView, StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';

import { useTheme } from '@/hooks/use-theme';
import { useAppStore } from '@/store/useAppStore';
import { getQuizById, MOCK_QUIZZES } from '@/data/mockDatabase';

export default function QuizScreen() {
  const { colors, typography, spacing, radii, shadows } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { markQuizComplete, completedQuizzes } = useAppStore();

  const quiz = getQuizById(id || '1') || MOCK_QUIZZES[0];
  const questions = quiz.questions;
  const totalPoints = quiz.pointsPerQuestion * questions.length;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showScore, setShowScore] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  // Live countdown timer
  const [timeLeft, setTimeLeft] = useState(questions.length * 150); // ~2.5 min per question
  useEffect(() => {
    if (showScore) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [showScore]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleNext = () => {
    if (!isAnswered) {
      // Submit answer
      setIsAnswered(true);
      if (selectedOption === currentQuestion.correctOptionId) {
        setCorrectCount(prev => prev + 1);
      }
    } else {
      if (isLastQuestion) {
        // Calculate final score: we need the latest correctCount
        // Since the setState from the submit just above already ran,
        // correctCount is now up-to-date for this render cycle
        const finalCorrect = selectedOption === currentQuestion.correctOptionId 
          ? correctCount // already incremented above 
          : correctCount;
        const earnedPoints = finalCorrect * quiz.pointsPerQuestion;

        if (!completedQuizzes.includes(quiz.id)) {
          markQuizComplete(quiz.id, earnedPoints);
        }
        setShowScore(true);
      } else {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedOption(null);
        setIsAnswered(false);
        setShowHint(false);
      }
    }
  };

  const finalScore = correctCount * quiz.pointsPerQuestion;
  const scorePercent = Math.round((correctCount / questions.length) * 100);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm, backgroundColor: colors.background }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="close" size={26} color={colors.textSecondary} />
          </TouchableOpacity>
          <Text style={[typography.headlineSm, { color: colors.textPrimary }]} numberOfLines={1}>
            Quiz
          </Text>
          <View style={styles.iconBtn}>
            <Image
              source={{ uri: useAppStore.getState().user.avatar }}
              style={styles.avatar}
            />
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 60,
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: spacing.base, marginTop: spacing.md }}>
          {/* Progress Header */}
          <View style={{ marginBottom: spacing.md }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={[typography.labelSm, { color: colors.primaryContainer, fontWeight: '600', textTransform: 'uppercase' }]}>Question {currentQuestionIndex + 1} of {questions.length}</Text>
              <Text style={[typography.labelSm, { color: colors.textTertiary, fontWeight: '600' }]}>{Math.round(((currentQuestionIndex) / questions.length) * 100)}% Completed</Text>
            </View>
            <View style={[styles.progressBar, { backgroundColor: colors.surface3 }]}>
              {questions.map((_, idx) => (
                <View 
                  key={idx} 
                  style={[styles.progressSegment, { backgroundColor: idx <= currentQuestionIndex ? colors.primaryContainer : colors.surface2 }]} 
                />
              ))}
            </View>
          </View>

          {/* Status Pills */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md }}>
            <View style={[styles.pill, { backgroundColor: colors.surface0 }, shadows.sm]}>
              <View style={styles.pingDotBox}>
                <View style={[styles.pingDot, { backgroundColor: timeLeft < 60 ? colors.error : colors.primaryContainer }]} />
              </View>
              <Ionicons name="timer-outline" size={16} color={colors.textSecondary} style={{ marginRight: 4 }} />
              <Text style={[typography.labelMd, { color: timeLeft < 60 ? colors.error : colors.textPrimary, fontWeight: '600' }]}>{formatTimer(timeLeft)}</Text>
              <Text style={[typography.labelSm, { color: colors.textTertiary, marginLeft: 4 }]}>left</Text>
            </View>
            <View style={[styles.pill, { backgroundColor: colors.surface0 }, shadows.sm]}>
              <Ionicons name="flash" size={16} color={colors.warning} />
              <Text style={[typography.labelMd, { color: colors.textPrimary, fontWeight: '600', marginLeft: 4 }]}>{totalPoints}</Text>
              <Text style={[typography.labelSm, { color: colors.textSecondary, marginLeft: 2 }]}>pts</Text>
            </View>
          </View>

          {/* Question Card */}
          <View style={[styles.questionCard, { backgroundColor: colors.surface0, borderRadius: radii.xl }, shadows.sm]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <View style={[styles.categoryPill, { backgroundColor: colors.primaryFixed }]}>
                <Text style={[typography.labelSm, { color: colors.primaryContainer, fontWeight: '600' }]}>ACTIVITYKIT & DYNAMIC ISLAND</Text>
              </View>
            </View>
            
            <Text style={[typography.headlineSm, { color: colors.textPrimary, marginBottom: 16, lineHeight: 24 }]}>
              {currentQuestion.text}
            </Text>

            {/* Code Snippet */}
            {currentQuestion.codeSnippet && (
              <View style={[styles.codeBox, { backgroundColor: colors.surface1, borderRadius: radii.lg }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={[typography.labelSm, { color: colors.textTertiary, fontFamily: 'monospace' }]}>Snippet</Text>
                  <Ionicons name="code-slash" size={14} color={colors.textTertiary} />
                </View>
                <Text style={{ fontFamily: 'monospace', fontSize: 13, lineHeight: 20, color: colors.onSurface }}>
                  {currentQuestion.codeSnippet}
                </Text>
              </View>
            )}
          </View>

          {/* Options — now 4 options (A, B, C, D) */}
          <View style={{ gap: 10, marginBottom: spacing.md }}>
            {currentQuestion.options.map((opt) => {
              const isSelected = selectedOption === opt.id;
              const isCorrect = opt.id === currentQuestion.correctOptionId;
              const showStatus = isAnswered;
              
              let bgColor = isSelected ? 'rgba(94, 92, 230, 0.1)' : colors.surface0;
              let borderColor = 'transparent';
              
              if (showStatus) {
                if (isCorrect) {
                  bgColor = 'rgba(50, 183, 107, 0.1)';
                  borderColor = colors.success;
                } else if (isSelected && !isCorrect) {
                  bgColor = 'rgba(255, 59, 48, 0.1)';
                  borderColor = colors.error;
                }
              }

              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[
                    styles.optionCard,
                    { borderRadius: radii.xl, backgroundColor: bgColor, borderWidth: showStatus ? 2 : 0, borderColor },
                    !isSelected && !showStatus && shadows.sm
                  ]}
                  onPress={() => !isAnswered && setSelectedOption(opt.id)}
                  disabled={isAnswered}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                    <View style={[
                      styles.optBadge,
                      { backgroundColor: isSelected ? colors.primaryContainer : colors.surface2 }
                    ]}>
                      <Text style={[typography.labelMd, { color: isSelected ? colors.onPrimary : colors.textSecondary, fontWeight: '600' }]}>
                        {opt.id}
                      </Text>
                    </View>
                    <Text style={[typography.bodyMd, { color: isSelected ? colors.primaryContainer : colors.textPrimary, fontWeight: isSelected ? '600' : '400', flex: 1 }]} numberOfLines={2}>
                      {opt.text}
                    </Text>
                  </View>
                  <View style={[
                    styles.checkCircle,
                    { 
                      backgroundColor: isSelected ? colors.primaryContainer : colors.surface2,
                      width: isSelected ? 24 : 20,
                      height: isSelected ? 24 : 20,
                      borderRadius: isSelected ? 12 : 10,
                    }
                  ]}>
                    {isSelected && <Ionicons name="checkmark" size={16} color={colors.onPrimary} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Hint Accordion */}
          <View style={{ marginBottom: spacing.lg }}>
            <TouchableOpacity 
              style={[styles.hintBtn, { backgroundColor: colors.surface0, borderRadius: radii.xl }, shadows.sm]}
              onPress={() => setShowHint(!showHint)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="bulb" size={18} color={colors.tertiaryContainer} />
                <Text style={[typography.labelMd, { color: colors.textPrimary, fontWeight: '600' }]}>View Architecture Hint</Text>
              </View>
              <Ionicons name={showHint ? "chevron-up" : "chevron-down"} size={20} color={colors.textTertiary} />
            </TouchableOpacity>
            
            {showHint && (
              <View style={[styles.hintContent, { backgroundColor: colors.surface0, borderRadius: radii.xl, marginTop: 4 }, shadows.sm]}>
                <Text style={[typography.bodySm, { color: colors.textSecondary, lineHeight: 20 }]}>
                  {currentQuestion.hint}
                </Text>
              </View>
            )}
          </View>

          {/* Peer Stats */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="checkmark-circle" size={14} color={colors.success} />
              <Text style={[typography.labelSm, { color: colors.textTertiary }]}>84% students solved this on first attempt</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="flag-outline" size={14} color={colors.textTertiary} />
              <Text style={[typography.labelSm, { color: colors.textTertiary }]}>Report</Text>
            </View>
          </View>
        </View>

      </ScrollView>

      {showScore && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background, zIndex: 100, justifyContent: 'center', alignItems: 'center', padding: spacing.xl }]}>
          <Ionicons name="trophy" size={80} color={colors.warning} style={{ marginBottom: spacing.md }} />
          <Text style={[typography.displayLgMobile, { color: colors.textPrimary, textAlign: 'center' }]}>Quiz Completed!</Text>
          <Text style={[typography.headlineMd, { color: colors.textSecondary, textAlign: 'center', marginTop: 8 }]}>You scored {scorePercent}%</Text>
          <Text style={[typography.bodySm, { color: colors.textTertiary, textAlign: 'center', marginTop: 4 }]}>{correctCount} of {questions.length} correct</Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: spacing.lg, backgroundColor: colors.surface2, paddingHorizontal: 16, paddingVertical: 8, borderRadius: radii.xl }}>
            <Ionicons name="flash" size={20} color={colors.warning} />
            <Text style={[typography.headlineSm, { color: colors.textPrimary }]}>+{finalScore} Points Earned</Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.submitBtn, { backgroundColor: colors.primaryContainer, width: '100%', marginTop: spacing.xl }, shadows.sm]}
            onPress={() => router.push('/course/1')}
          >
            <Text style={[typography.labelLg, { color: colors.onPrimary, fontWeight: '600' }]}>Return to Course</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Bottom Dock — uses theme bg instead of hardcoded white */}
      <View style={[styles.bottomDock, { backgroundColor: colors.background, paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity style={styles.skipBtn} onPress={handleNext}>
          <Text style={[typography.labelLg, { color: colors.textSecondary, fontWeight: '600' }]}>Skip</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.submitBtn, { backgroundColor: selectedOption ? colors.primaryContainer : colors.surface2 }, shadows.sm]}
          onPress={handleNext}
          disabled={!selectedOption}
        >
          <Text style={[typography.labelLg, { color: selectedOption ? colors.onPrimary : colors.textTertiary, fontWeight: '600' }]}>
            {!isAnswered ? 'Submit Answer' : (isLastQuestion ? 'View Results' : 'Next Question')}
          </Text>
          <Ionicons name="arrow-forward" size={18} color={selectedOption ? colors.onPrimary : colors.textTertiary} />
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, height: 56 },
  iconBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  avatar: { width: 32, height: 32, borderRadius: 16 },
  progressBar: { flexDirection: 'row', height: 6, borderRadius: 3, overflow: 'hidden', padding: 1, gap: 4 },
  progressSegment: { flex: 1, height: '100%', borderRadius: 2 },
  pill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  pingDotBox: { width: 8, height: 8, justifyContent: 'center', alignItems: 'center', marginRight: 6 },
  pingDot: { width: 8, height: 8, borderRadius: 4 },
  questionCard: { padding: 16, marginBottom: 16, overflow: 'hidden' },
  categoryPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  codeBox: { padding: 12, marginTop: 12 },
  optionCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  optBadge: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  checkCircle: { alignItems: 'center', justifyContent: 'center' },
  hintBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, minHeight: 44 },
  hintContent: { padding: 16 },
  bottomDock: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(0,0,0,0.1)', gap: 12 },
  skipBtn: { height: 48, paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center' },
  submitBtn: { flex: 1, flexDirection: 'row', height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', gap: 8 },
});
