import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { Alert } from '@/utils/alert';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { DemoHeader } from '@/components/DemoHeader';
import { useElearningStore } from '@/store/useElearningStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import {
  isLessonUnlocked,
  isQuizUnlocked,
  isAssignmentUnlocked,
} from '@/utils/lockEngine';
import { Lesson, Quiz, Assignment } from '@/types/elearning';
import { useTranslation } from '@/i18n';
import { triggerMilestoneFeedback } from '@/utils/feedback';
import { InlineVideoPlayer } from '@/components/InlineVideoPlayer';

export default function SyllabusScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { t } = useTranslation();
  const autoAdvanceLesson = useSettingsStore((state) => state.autoAdvanceLesson);

  const {
    currentRole,
    modules,
    lessons,
    quizzes,
    assignments,
    completedLessonIds,
    quizAttempts,
    submissions,
    grades,
    completeLesson,
    submitQuiz,
    submitAssignment,
    addLesson,
    deleteLesson,
    addAssignment,
    deleteAssignment,
    updateAssignmentDueDate,
    batches,
    courses,
    selectedBatchId,
    selectBatch,
    currentUser,
    enrollments,
    addModule,
  } = useElearningStore();

  const isTeacher = currentRole === 'teacher';

  const userEnrollments = enrollments.filter((e) => e.userId === currentUser.id);
  const enrolledBatches = batches.filter((b) =>
    userEnrollments.some((e) => e.batchId === b.id)
  );
  const teacherBatches = batches.filter((b) => b.instructorId === currentUser.id);

  const displayBatches = isTeacher
    ? (teacherBatches.length > 0 ? teacherBatches : batches)
    : (enrolledBatches.length > 0 ? enrolledBatches : batches);

  const activeBatch =
    displayBatches.find((b) => b.id === selectedBatchId) ||
    displayBatches[0] ||
    batches[0];
  const activeCourse = courses.find((c) => c.id === activeBatch?.courseId) || courses[0];
  const currentModules = modules.filter((m) => m.courseId === activeBatch?.courseId);
  const isDynamicTestingBatch = activeBatch?.id === 'batch-edf-402';
  const userQuizAttempts = quizAttempts.filter((q) => q.userId === currentUser.id);
  const userSubmissions = submissions.filter((s) => s.userId === currentUser.id);
  const userGrades = grades.filter((g) => {
    const s = submissions.find((sub) => sub.id === g.submissionId);
    return s ? s.userId === currentUser.id : false;
  });
  const lockSnapshot = {
    completedLessonIds,
    quizAttempts: userQuizAttempts,
    submissions: userSubmissions,
    grades: userGrades,
  };

  // Student action modal states
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  // Quiz active state
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizResultText, setQuizResultText] = useState<string | null>(null);

  // Assignment active state
  const [assignmentText, setAssignmentText] = useState('');
  const [assignmentUrl, setAssignmentUrl] = useState('');

  // Teacher CRUD Modal states
  const [isAddLessonModalOpen, setIsAddLessonModalOpen] = useState(false);
  const [targetModuleForLesson, setTargetModuleForLesson] = useState<string>('mod-1');
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonDuration, setNewLessonDuration] = useState('15');
  const [newLessonBody, setNewLessonBody] = useState('');
  const [newLessonType, setNewLessonType] = useState<'reading' | 'video'>('reading');
  const [newLessonVideoUrl, setNewLessonVideoUrl] = useState('');
  const [videoSourceMode, setVideoSourceMode] = useState<'upload' | 'link'>('upload');
  const [uploadedVideoName, setUploadedVideoName] = useState<string>('');
  const [uploadedVideoSize, setUploadedVideoSize] = useState<string>('');
  const [copiedSnippetIndex, setCopiedSnippetIndex] = useState<number | null>(null);

  const currentLessonModule = modules.find((m) => m.id === selectedLesson?.moduleId);
  const currentModuleLessons = lessons
    .filter((l) => l.moduleId === selectedLesson?.moduleId)
    .sort((a, b) => a.sequenceNumber - b.sequenceNumber);
  const nextLessonInModule = currentModuleLessons.find(
    (l) => l.sequenceNumber > (selectedLesson?.sequenceNumber || 0)
  );
  const currentModuleQuiz = quizzes.find((q) => q.moduleId === selectedLesson?.moduleId);

  const handleCopyCodeSnippet = async (text: string, index: number) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      }
    } catch {
      // fallback
    }
    setCopiedSnippetIndex(index);
    setTimeout(() => setCopiedSnippetIndex(null), 2000);
  };

  const [isAddAssignmentModalOpen, setIsAddAssignmentModalOpen] = useState(false);
  const [targetModuleForAssignment, setTargetModuleForAssignment] = useState<string>('mod-2');
  const [newAssignTitle, setNewAssignTitle] = useState('');
  const [newAssignInstructions, setNewAssignInstructions] = useState('');
  const [newAssignDueDate, setNewAssignDueDate] = useState('2026-11-20 23:59');
  const [newAssignMaxScore, setNewAssignMaxScore] = useState('100');

  const [isEditDueDateModalOpen, setIsEditDueDateModalOpen] = useState(false);
  const [targetAssignmentToEdit, setTargetAssignmentToEdit] = useState<Assignment | null>(null);
  const [editDueDateInput, setEditDueDateInput] = useState('');

  // Teacher Module state
  const [isAddModuleModalOpen, setIsAddModuleModalOpen] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');

  // Handler: Open student item
  const handleOpenLesson = (lesson: Lesson, unlocked: boolean) => {
    if (!unlocked && !isTeacher) {
      Alert.alert('Lesson Locked', 'Please complete the prerequisite lesson units first.');
      return;
    }
    setSelectedLesson(lesson);
  };

  const handleOpenQuiz = (quiz: Quiz, unlocked: boolean) => {
    if (!unlocked && !isTeacher) {
      Alert.alert('Quiz Locked', 'Please complete all lesson units in this module first.');
      return;
    }
    setQuizAnswers({});
    setQuizResultText(null);
    setSelectedQuiz(quiz);
  };

  const handleOpenAssignment = (assignment: Assignment, unlocked: boolean) => {
    if (!unlocked && !isTeacher) {
      if (assignment.moduleId === 'mod-2') {
        Alert.alert(
          'Assignment Locked (Prerequisites Required)',
          'This Module 2 assignment is locked because you have not yet passed the Module 1 Quiz. Complete Module 1 lessons and achieve at least 80% on the quiz to unlock this assignment!'
        );
      } else {
        Alert.alert(
          'Assignment Locked',
          'Please complete the prerequisite module materials first.'
        );
      }
      return;
    }
    const existing = submissions.find(
      (s) => s.assignmentId === assignment.id && s.userId === currentUser.id
    );
    if (existing) {
      setAssignmentText(existing.submissionContent);
      setAssignmentUrl(existing.attachmentUrl || '');
    } else {
      setAssignmentText('');
      setAssignmentUrl('');
    }
    setSelectedAssignment(assignment);
  };

  // Student actions
  const handleCompleteLessonPress = (autoNext = false) => {
    if (selectedLesson) {
      if (!completedLessonIds.includes(selectedLesson.id)) {
        completeLesson(selectedLesson.id);
        triggerMilestoneFeedback();
      }
      if (!autoNext) {
        if (autoAdvanceLesson && nextLessonInModule) {
          Alert.alert('Lesson Completed', 'Lesson completed! +25 XP earned. Advancing to the next lesson.');
          setSelectedLesson(nextLessonInModule);
        } else {
          Alert.alert('Lesson Completed', 'Lesson marked as completed! +25 XP earned.');
          setSelectedLesson(null);
        }
      }
    }
  };

  const handleNextLessonPress = (nextLesson: Lesson) => {
    if (selectedLesson && !completedLessonIds.includes(selectedLesson.id)) {
      completeLesson(selectedLesson.id);
      triggerMilestoneFeedback();
    }
    setSelectedLesson(nextLesson);
  };

  const handleProceedToQuizPress = (quiz: Quiz) => {
    if (selectedLesson && !completedLessonIds.includes(selectedLesson.id)) {
      completeLesson(selectedLesson.id);
      triggerMilestoneFeedback();
    }
    setSelectedLesson(null);
    handleOpenQuiz(quiz, true);
  };

  const handleSubmitQuizPress = () => {
    if (!selectedQuiz) return;
    const answeredCount = Object.keys(quizAnswers).length;
    if (answeredCount < selectedQuiz.questions.length) {
      Alert.alert('Attention', 'Please answer all quiz questions before submitting.');
      return;
    }

    const answersArray = selectedQuiz.questions.map((_, idx) => quizAnswers[idx] ?? -1);
    const result = submitQuiz(selectedQuiz.id, answersArray);
    setQuizResultText(result.explanation);

    if (result.isPassed) {
      triggerMilestoneFeedback();
      Alert.alert('Congratulations!', `${result.explanation}\n+50 XP earned!`, [
        { text: 'Close', onPress: () => setSelectedQuiz(null) },
      ]);
    }
  };

  const handleSubmitAssignmentPress = () => {
    if (!selectedAssignment) return;
    if (!assignmentText.trim()) {
      Alert.alert('Attention', 'Assignment description or solution notes are required.');
      return;
    }

    submitAssignment(
      selectedAssignment.id,
      activeBatch.id,
      assignmentText.trim(),
      assignmentUrl.trim() || undefined
    );

    Alert.alert(
      'Assignment Submitted',
      'Your deliverable is now waiting in the instructor evaluation queue. Switch to Instructor Mode to review and grade!',
      [{ text: 'OK', onPress: () => setSelectedAssignment(null) }]
    );
  };

  // Teacher CRUD Handlers
  const handleOpenAddLesson = (moduleId: string) => {
    setTargetModuleForLesson(moduleId);
    setNewLessonTitle('');
    setNewLessonDuration('15');
    setNewLessonBody('');
    setNewLessonType('reading');
    setNewLessonVideoUrl('');
    setVideoSourceMode('upload');
    setUploadedVideoName('');
    setUploadedVideoSize('');
    setIsAddLessonModalOpen(true);
  };

  const handlePickVideoFile = () => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'video/mp4,video/webm,video/ogg,video/quicktime,video/*';
      input.onchange = (e: any) => {
        const file = e.target?.files?.[0];
        if (file) {
          const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
          const objectUrl = URL.createObjectURL(file);
          setUploadedVideoName(file.name);
          setUploadedVideoSize(`${sizeMB} MB`);
          setNewLessonVideoUrl(objectUrl);
        }
      };
      input.click();
    } else {
      // Fallback sample video for standalone native or web fallback
      const sampleUrl =
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
      setUploadedVideoName('lecture_presentation_sample.mp4');
      setUploadedVideoSize('8.2 MB');
      setNewLessonVideoUrl(sampleUrl);
      Alert.alert('Video Terpilih', 'File video berhasil disematkan untuk pemutaran langsung.');
    }
  };

  const handleSaveLesson = () => {
    if (!newLessonTitle.trim() || !newLessonBody.trim()) {
      Alert.alert('Incomplete Fields', 'Lesson title and content body are required.');
      return;
    }
    if (newLessonType === 'video' && !newLessonVideoUrl.trim()) {
      Alert.alert(
        'Video Lecture Wajib Diisi',
        'Untuk materi tipe Video Lecture, Anda wajib mengunggah file video atau memasukkan tautan URL video agar materi dapat diputar langsung di dalam aplikasi.'
      );
      return;
    }
    const mins = parseInt(newLessonDuration, 10) || 15;
    addLesson(
      targetModuleForLesson,
      newLessonTitle.trim(),
      newLessonBody.trim(),
      mins,
      newLessonType,
      newLessonVideoUrl.trim() || undefined
    );
    setIsAddLessonModalOpen(false);
    Alert.alert('Sukses', 'Materi video lecture baru berhasil ditambahkan dan siap diputar langsung!');
  };

  const handleDeleteLesson = (lesson: Lesson) => {
    Alert.alert(
      'Delete Lesson Unit',
      `Are you sure you want to delete "${lesson.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteLesson(lesson.id);
            Alert.alert('Deleted', 'Lesson unit removed from curriculum.');
          },
        },
      ]
    );
  };

  const handleOpenAddAssignment = (moduleId: string) => {
    setTargetModuleForAssignment(moduleId);
    setNewAssignTitle('');
    setNewAssignInstructions('');
    setNewAssignDueDate('2026-11-20 23:59');
    setNewAssignMaxScore('100');
    setIsAddAssignmentModalOpen(true);
  };

  const handleSaveAssignment = () => {
    if (!newAssignTitle.trim() || !newAssignInstructions.trim()) {
      Alert.alert('Incomplete Fields', 'Assignment title and instructions are required.');
      return;
    }
    const score = parseInt(newAssignMaxScore, 10) || 100;
    addAssignment(
      targetModuleForAssignment,
      newAssignTitle.trim(),
      newAssignInstructions.trim(),
      newAssignDueDate.trim(),
      score
    );
    setIsAddAssignmentModalOpen(false);
    Alert.alert('Success', 'New project assignment added with submission deadline!');
  };

  const handleDeleteAssignment = (assignment: Assignment) => {
    Alert.alert(
      'Delete Project Assignment',
      `Are you sure you want to delete "${assignment.title}"? Any existing student submissions will also be deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteAssignment(assignment.id);
            Alert.alert('Deleted', 'Project assignment removed.');
          },
        },
      ]
    );
  };

  const handleOpenEditDueDate = (assignment: Assignment) => {
    setTargetAssignmentToEdit(assignment);
    setEditDueDateInput(assignment.dueDate);
    setIsEditDueDateModalOpen(true);
  };

  const handleSaveNewDueDate = () => {
    if (!targetAssignmentToEdit || !editDueDateInput.trim()) return;
    updateAssignmentDueDate(targetAssignmentToEdit.id, editDueDateInput.trim());
    setIsEditDueDateModalOpen(false);
    Alert.alert('Deadline Updated', `Assignment submission deadline updated to ${editDueDateInput.trim()}`);
  };

  const handleSaveModule = () => {
    if (!newModuleTitle.trim()) {
      Alert.alert('Incomplete Fields', 'Module title is required.');
      return;
    }
    addModule(activeCourse.id, newModuleTitle.trim());
    setNewModuleTitle('');
    setIsAddModuleModalOpen(false);
    Alert.alert('Success', 'New module added to curriculum!');
  };

  const renderFormattedLessonContent = (body: string, dark: boolean) => {
    const lines = body.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBlockBuffer: string[] = [];
    let codeBlockLang = 'typescript';
    let codeIndex = 0;

    const renderInlineFormatted = (rawText: string, baseColor: string) => {
      const parts = rawText.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
      return parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          const boldText = part.slice(2, -2);
          return (
            <Text
              key={`inline-${pIdx}`}
              style={{ fontWeight: '800', color: dark ? '#F1F5F9' : '#0F172A' }}>
              {boldText}
            </Text>
          );
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          const codeSnippet = part.slice(1, -1);
          return (
            <Text
              key={`inline-${pIdx}`}
              style={{
                fontFamily: 'monospace',
                backgroundColor: dark ? '#1E293B' : '#E2E8F0',
                color: dark ? '#38BDF8' : '#0369A1',
                fontSize: 12,
                fontWeight: '600',
              }}>
              {` ${codeSnippet} `}
            </Text>
          );
        }
        return (
          <Text key={`inline-${pIdx}`} style={{ color: baseColor }}>
            {part}
          </Text>
        );
      });
    };

    lines.forEach((line, index) => {
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          const codeText = codeBlockBuffer.join('\n');
          const currentCodeIdx = codeIndex++;
          const isCopied = copiedSnippetIndex === currentCodeIdx;
          elements.push(
            <View key={`code-${index}`} style={styles.richCodeCard}>
              <View style={styles.richCodeHeader}>
                <View style={styles.richCodeDots}>
                  <View style={[styles.richDot, { backgroundColor: '#EF4444' }]} />
                  <View style={[styles.richDot, { backgroundColor: '#F59E0B' }]} />
                  <View style={[styles.richDot, { backgroundColor: '#10B981' }]} />
                  <Text style={styles.richCodeLang}>{codeBlockLang || 'code'}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleCopyCodeSnippet(codeText, currentCodeIdx)}
                  style={styles.richCopyBtn}>
                  <Ionicons
                    name={isCopied ? 'checkmark' : 'copy-outline'}
                    size={13}
                    color={isCopied ? '#10B981' : '#94A3B8'}
                  />
                  <Text style={[styles.richCopyText, isCopied && { color: '#10B981' }]}>
                    {isCopied ? 'Tersalin' : 'Salin'}
                  </Text>
                </TouchableOpacity>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.richCodeScroll}>
                <Text style={styles.richCodeText}>{codeText}</Text>
              </ScrollView>
            </View>
          );
          codeBlockBuffer = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
          codeBlockLang = line.trim().replace(/^```/, '').trim() || 'code';
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockBuffer.push(line);
        return;
      }

      const trimmed = line.trim();
      if (!trimmed) {
        elements.push(<View key={`spacer-${index}`} style={{ height: 10 }} />);
        return;
      }

      if (trimmed.startsWith('#### ')) {
        elements.push(
          <View key={`h4-${index}`} style={styles.richH4Container}>
            <Text style={[styles.richH4Text, { color: dark ? '#E2E8F0' : '#1E293B' }]}>
              {trimmed.replace('#### ', '')}
            </Text>
          </View>
        );
      } else if (trimmed.startsWith('### ')) {
        elements.push(
          <View key={`h3-${index}`} style={styles.richH3Container}>
            <View style={styles.richH3Bar} />
            <Text style={[styles.richH3Text, { color: dark ? '#F1F5F9' : '#0F172A' }]}>
              {trimmed.replace('### ', '')}
            </Text>
          </View>
        );
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        elements.push(
          <View key={`li-${index}`} style={styles.richLiRow}>
            <View style={styles.richLiBullet} />
            <Text style={styles.richLiText}>
              {renderInlineFormatted(trimmed.substring(2), dark ? '#CBD5E1' : '#334155')}
            </Text>
          </View>
        );
      } else if (/^\d+\.\s/.test(trimmed)) {
        const match = trimmed.match(/^(\d+)\.\s(.*)$/);
        const num = match ? match[1] : '1';
        const text = match ? match[2] : trimmed;
        elements.push(
          <View key={`num-${index}`} style={styles.richLiRow}>
            <View style={styles.richNumBadge}>
              <Text style={styles.richNumBadgeText}>{num}</Text>
            </View>
            <Text style={styles.richLiText}>
              {renderInlineFormatted(text, dark ? '#CBD5E1' : '#334155')}
            </Text>
          </View>
        );
      } else {
        elements.push(
          <Text key={`p-${index}`} style={styles.richParagraph}>
            {renderInlineFormatted(trimmed, dark ? '#CBD5E1' : '#334155')}
          </Text>
        );
      }
    });

    if (inCodeBlock && codeBlockBuffer.length > 0) {
      const codeText = codeBlockBuffer.join('\n');
      elements.push(
        <View key="code-end" style={styles.richCodeCard}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.richCodeScroll}>
            <Text style={styles.richCodeText}>{codeText}</Text>
          </ScrollView>
        </View>
      );
    }

    return elements;
  };

  return (
    <SafeAreaView
      edges={['top']}
      style={[
        styles.safeArea,
        { backgroundColor: isDark ? '#0B0F19' : '#F4F6FA' },
      ]}>
      <DemoHeader />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.headerTitleContainer}>
          <Text
            style={[
              styles.screenTitle,
              { color: isDark ? '#F8FAFC' : '#0F172A' },
            ]}>
            📚 {t.syllabus.headerTitle}
          </Text>
          <Text style={styles.screenSubtitle}>
            {isTeacher
              ? 'Instructor View: Manage lesson units, assignments, and schedule deadlines'
              : t.syllabus.headerSubtitle}
          </Text>
        </View>

        {/* Horizontal Class / Cohort Selector */}
        <View style={styles.classSelectorContainer}>
          <Text style={[styles.selectorLabel, { color: isDark ? '#94A3B8' : '#64748B' }]}>
            MY COHORT CLASSES:
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.classSelectorScroll}>
            {displayBatches.map((batch) => {
              const course = courses.find((c) => c.id === batch.courseId);
              const isSelected = batch.id === activeBatch.id;
              const isDynamic = batch.id === 'batch-edf-402';
              const isCompleted = batch.status === 'completed';

              return (
                <TouchableOpacity
                  key={batch.id}
                  onPress={() => selectBatch(batch.id)}
                  style={[
                    styles.classChip,
                    {
                      backgroundColor: isSelected
                        ? isTeacher
                          ? '#8B5CF6'
                          : '#4F46E5'
                        : isDark
                        ? '#1E293B'
                        : '#FFFFFF',
                      borderColor: isSelected
                        ? isTeacher
                          ? '#7C3AED'
                          : '#4338CA'
                        : isDark
                        ? '#334155'
                        : '#E2E8F0',
                      borderBottomColor: isSelected
                        ? isTeacher
                          ? '#6D28D9'
                          : '#312E81'
                        : isDark
                        ? '#0F172A'
                        : '#CBD5E1',
                    },
                  ]}>
                  <View style={styles.classChipTop}>
                    <Ionicons
                      name={
                        isDynamic
                          ? 'phone-portrait-outline'
                          : isCompleted
                          ? 'ribbon-outline'
                          : 'sparkles-outline'
                      }
                      size={14}
                      color={isSelected ? '#FFFFFF' : isDark ? '#94A3B8' : '#64748B'}
                    />
                    <Text
                      style={[
                        styles.classChipCode,
                        {
                          color: isSelected ? '#FFFFFF' : isDark ? '#E2E8F0' : '#1E293B',
                          fontWeight: isSelected ? '800' : '600',
                        },
                      ]}>
                      {batch.classCode}
                    </Text>
                    {isDynamic && (
                      <View
                        style={[
                          styles.chipTag,
                          {
                            backgroundColor: isSelected
                              ? 'rgba(255,255,255,0.25)'
                              : '#EFF6FF',
                          },
                        ]}>
                        <Text
                          style={[
                            styles.chipTagText,
                            { color: isSelected ? '#FFFFFF' : '#2563EB' },
                          ]}>
                          Active
                        </Text>
                      </View>
                    )}
                    {isCompleted && (
                      <View
                        style={[
                          styles.chipTag,
                          {
                            backgroundColor: isSelected
                              ? 'rgba(255,255,255,0.25)'
                              : '#DCFCE7',
                          },
                        ]}>
                        <Text
                          style={[
                            styles.chipTagText,
                            { color: isSelected ? '#FFFFFF' : '#15803D' },
                          ]}>
                          Graduated
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.classChipTitle,
                      { color: isSelected ? '#FFFFFF' : isDark ? '#CBD5E1' : '#475569' },
                    ]}>
                    {course?.title || batch.batchName}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
        {/* Active Class Hero Banner (Gamified Bento 3D Hero) */}
        <View
          style={[
            styles.courseBannerCard,
            {
              backgroundColor: '#4F46E5',
              borderColor: '#4338CA',
              borderBottomColor: '#312E81',
            },
          ]}>
          <View style={styles.courseBannerHeader}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>
                {activeCourse?.category || 'Accredited Certification'}
              </Text>
            </View>

            <View style={styles.cohortCodeBadge}>
              <Text style={styles.cohortCodeText}>{activeBatch.classCode}</Text>
            </View>
          </View>

          <Text style={styles.courseBannerTitle}>
            {activeCourse?.title}
          </Text>
          <Text style={styles.courseBannerDesc}>{activeCourse?.description}</Text>

          <View style={styles.courseBannerMetaRow}>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>Instructor:</Text>
              <Text style={styles.metaValue}>
                {activeBatch.instructorName}
              </Text>
            </View>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>Cohort Status:</Text>
              <Text style={[styles.metaValue, { color: '#A7F3D0' }]}>
                {activeBatch.status === 'completed' ? 'Completed (Graduated)' : 'Active Cohort'}
              </Text>
            </View>
          </View>

          {/* Dynamic Interactive Hint */}
          {isDynamicTestingBatch ? (
            <View style={styles.dynamicNoticeBox}>
              <Ionicons name="sparkles" size={16} color="#FDE047" />
              <Text style={styles.dynamicNoticeText}>
                This cohort applies an <Text style={{ fontWeight: '800', color: '#FDE047' }}>interactive & structured curriculum</Text> (step-by-step units, quiz evaluations, project deliverables, mentor reviews & accredited certificate issuance).
              </Text>
            </View>
          ) : (
            <View style={styles.referenceNoticeBox}>
              <Ionicons
                name={activeBatch.status === 'completed' ? 'ribbon' : 'information-circle'}
                size={16}
                color="#FDE047"
              />
              <Text style={styles.referenceNoticeText}>
                {activeBatch.status === 'completed'
                  ? 'Learners have completed this accredited curriculum. Official digital credentials have been issued in Profile.'
                  : 'Curriculum & syllabus modules are open for self-paced reference and study.'}
              </Text>
            </View>
          )}
        </View>

        {/* Modules Section Header */}
        <View style={styles.moduleSectionHeader}>
          <Text
            style={[
              styles.moduleSectionTitle,
              { color: isDark ? '#F8FAFC' : '#0F172A' },
            ]}>
            Curriculum Modules ({currentModules.length})
          </Text>
          {isTeacher && (
            <TouchableOpacity
              onPress={() => {
                setNewModuleTitle('');
                setIsAddModuleModalOpen(true);
              }}
              style={styles.addModuleHeaderBtn}>
              <Ionicons name="add-circle" size={16} color="#8B5CF6" />
              <Text style={styles.addModuleHeaderBtnText}>+ New Module</Text>
            </TouchableOpacity>
          )}
        </View>

        {currentModules.length === 0 && (
          <View
            style={[
              styles.emptyStateCard,
              {
                backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                borderColor: isDark ? '#334155' : '#E2E8F0',
              },
            ]}>
            <Ionicons name="folder-outline" size={40} color="#94A3B8" />
            <Text
              style={[
                styles.emptyStateTitle,
                { color: isDark ? '#F8FAFC' : '#0F172A' },
              ]}>
              No Modules Yet
            </Text>
            <Text style={styles.emptyStateDesc}>
              Curriculum for this cohort is currently being prepared by the academic team.
            </Text>
          </View>
        )}

        {currentModules.map((mod) => {
          const modLessons = lessons.filter((l) => l.moduleId === mod.id);
          const modQuiz = quizzes.find((q) => q.moduleId === mod.id);
          const modAssignments = assignments.filter((a) => a.moduleId === mod.id);

          return (
            <View
              key={mod.id}
              style={[
                styles.moduleCard,
                {
                  backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                  borderColor: isDark ? '#334155' : '#E2E8F0',
                  borderBottomColor: isDark ? '#0F172A' : '#CBD5E1',
                },
              ]}>
              {/* Module Header with Teacher Action Buttons */}
              <View style={styles.moduleHeaderRow}>
                <View style={styles.moduleTitleContainer}>
                  <Ionicons name="folder-open" size={20} color="#2563EB" />
                  <Text
                    style={[
                      styles.moduleTitle,
                      { color: isDark ? '#F8FAFC' : '#0F172A' },
                    ]}>
                    {mod.title}
                  </Text>
                </View>

                {isTeacher && (
                  <View style={styles.teacherActionBtnGroup}>
                    <TouchableOpacity
                      onPress={() => handleOpenAddLesson(mod.id)}
                      style={styles.addMiniBtn}>
                      <Ionicons name="add-circle" size={14} color="#8B5CF6" />
                      <Text style={styles.addMiniBtnText}>+ Lesson</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleOpenAddAssignment(mod.id)}
                      style={[styles.addMiniBtn, { borderColor: '#6366F1' }]}>
                      <Ionicons name="add-circle" size={14} color="#6366F1" />
                      <Text style={[styles.addMiniBtnText, { color: '#6366F1' }]}>+ Assignment</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              <View style={styles.itemsList}>
                {/* Render Lessons */}
                {modLessons.map((lesson) => {
                  const isDone = completedLessonIds.includes(lesson.id);
                  const unlocked = isLessonUnlocked(
                    lesson,
                    lessons,
                    quizzes,
                    lockSnapshot
                  );

                  return (
                    <View
                      key={lesson.id}
                      style={[
                        styles.itemRow,
                        {
                          backgroundColor: isDone
                            ? isDark ? '#064E3B' : '#F0FDF4'
                            : isDark ? '#0F172A' : '#FFFFFF',
                          borderColor: isDone
                            ? '#10B981'
                            : unlocked || isTeacher
                            ? '#3B82F6'
                            : isDark
                            ? '#334155'
                            : '#E2E8F0',
                          borderBottomColor: isDone
                            ? '#047857'
                            : unlocked || isTeacher
                            ? '#1D4ED8'
                            : isDark
                            ? '#1E293B'
                            : '#CBD5E1',
                          opacity: unlocked || isTeacher ? 1 : 0.65,
                        },
                      ]}>
                      <TouchableOpacity
                        onPress={() => handleOpenLesson(lesson, unlocked)}
                        style={styles.itemLeft}>
                        <View
                          style={[
                            styles.statusIcon,
                            {
                              backgroundColor: isDone
                                ? '#DCFCE7'
                                : lesson.contentType === 'video'
                                ? '#FEE2E2'
                                : unlocked || isTeacher
                                ? '#DBEAFE'
                                : '#F1F5F9',
                            },
                          ]}>
                          <Ionicons
                            name={
                              isDone
                                ? 'checkmark-circle'
                                : lesson.contentType === 'video'
                                ? 'videocam'
                                : unlocked || isTeacher
                                ? 'play'
                                : 'lock-closed'
                            }
                            size={16}
                            color={
                              isDone
                                ? '#15803D'
                                : lesson.contentType === 'video'
                                ? '#DC2626'
                                : unlocked || isTeacher
                                ? '#2563EB'
                                : '#94A3B8'
                            }
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={[
                              styles.itemTitle,
                              { color: isDark ? '#F8FAFC' : '#0F172A' },
                            ]}>
                            {lesson.title}
                          </Text>
                          <Text style={styles.itemMeta}>
                            {lesson.contentType === 'video' ? 'Video Lecture' : 'Reading Material'} • {lesson.durationMinutes} min
                          </Text>
                        </View>
                      </TouchableOpacity>

                      <View style={styles.itemRightRow}>
                        <TouchableOpacity
                          onPress={() => handleOpenLesson(lesson, unlocked)}
                          style={[
                            styles.badgePill,
                            {
                              backgroundColor: isDone
                                ? '#DCFCE7'
                                : unlocked || isTeacher
                                ? (lesson.contentType === 'video' ? '#FEE2E2' : '#EFF6FF')
                                : '#F1F5F9',
                            },
                          ]}>
                          <Text
                            style={[
                              styles.badgeText,
                              {
                                color: isDone
                                  ? '#15803D'
                                  : unlocked || isTeacher
                                  ? (lesson.contentType === 'video' ? '#DC2626' : '#2563EB')
                                  : '#94A3B8',
                              },
                            ]}>
                            {isDone ? 'Completed' : unlocked || isTeacher ? 'Open' : 'Locked'}
                          </Text>
                        </TouchableOpacity>

                        {/* Teacher Delete Lesson Button */}
                        {isTeacher && (
                          <TouchableOpacity
                            onPress={() => handleDeleteLesson(lesson)}
                            style={styles.deleteIconBtn}
                            accessibilityLabel="Delete lesson">
                            <Ionicons name="trash-outline" size={16} color="#EF4444" />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  );
                })}

                {/* Render Quiz if exists */}
                {modQuiz && (() => {
                  const quizAttempt = quizAttempts.find(
                    (q) => q.quizId === modQuiz.id && q.userId === currentUser.id
                  );
                  const isPassed = quizAttempt?.isPassed ?? false;
                  const unlocked = isQuizUnlocked(modQuiz, lessons, lockSnapshot);

                  return (
                    <TouchableOpacity
                      key={modQuiz.id}
                      onPress={() => handleOpenQuiz(modQuiz, unlocked)}
                      style={[
                        styles.itemRow,
                        {
                          backgroundColor: isPassed
                            ? isDark ? '#064E3B' : '#F0FDF4'
                            : isDark ? '#0F172A' : '#FFFFFF',
                          borderColor: isPassed
                            ? '#10B981'
                            : unlocked || isTeacher
                            ? '#F59E0B'
                            : isDark
                            ? '#334155'
                            : '#E2E8F0',
                          borderBottomColor: isPassed
                            ? '#047857'
                            : unlocked || isTeacher
                            ? '#B45309'
                            : isDark
                            ? '#1E293B'
                            : '#CBD5E1',
                          opacity: unlocked || isTeacher ? 1 : 0.65,
                        },
                      ]}>
                      <View style={styles.itemLeft}>
                        <View
                          style={[
                            styles.statusIcon,
                            {
                              backgroundColor: isPassed
                                ? '#DCFCE7'
                                : unlocked || isTeacher
                                ? '#FEF3C7'
                                : '#F1F5F9',
                            },
                          ]}>
                          <Ionicons
                            name={
                              isPassed
                                ? 'shield-checkmark'
                                : unlocked || isTeacher
                                ? 'help-circle'
                                : 'lock-closed'
                            }
                            size={16}
                            color={isPassed ? '#15803D' : unlocked || isTeacher ? '#D97706' : '#94A3B8'}
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={[
                              styles.itemTitle,
                              { color: isDark ? '#F8FAFC' : '#0F172A' },
                            ]}>
                            {modQuiz.title}
                          </Text>
                          <Text style={styles.itemMeta}>
                            Module Assessment Quiz • Min {modQuiz.passingScorePercentage}%
                          </Text>
                        </View>
                      </View>

                      <View
                        style={[
                          styles.badgePill,
                          {
                            backgroundColor: isPassed
                              ? '#DCFCE7'
                              : unlocked || isTeacher
                              ? '#FEF3C7'
                              : '#F1F5F9',
                          },
                        ]}>
                        <Text
                          style={[
                            styles.badgeText,
                            {
                              color: isPassed
                                ? '#15803D'
                                : unlocked || isTeacher
                                ? '#D97706'
                                : '#94A3B8',
                            },
                          ]}>
                          {isPassed
                            ? `Passed (${quizAttempt?.scorePercentage}%)`
                            : unlocked || isTeacher
                            ? 'Start Quiz'
                            : 'Locked'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })()}

                {/* Render Assignments */}
                {modAssignments.map((assignment) => {
                  const sub = submissions.find(
                    (s) => s.assignmentId === assignment.id && s.userId === currentUser.id
                  );
                  const grade = grades.find((g) => g.submissionId === sub?.id);
                  const unlocked = isAssignmentUnlocked(
                    assignment,
                    lockSnapshot
                  );

                  return (
                    <View
                      key={assignment.id}
                      style={[
                        styles.itemRow,
                        {
                          backgroundColor: grade && grade.score >= 75
                            ? isDark ? '#064E3B' : '#F0FDF4'
                            : isDark ? '#0F172A' : '#FFFFFF',
                          borderColor:
                            grade && grade.score >= 75
                              ? '#10B981'
                              : sub
                              ? '#8B5CF6'
                              : unlocked || isTeacher
                              ? '#6366F1'
                              : isDark
                              ? '#334155'
                              : '#E2E8F0',
                          borderBottomColor:
                            grade && grade.score >= 75
                              ? '#047857'
                              : sub
                              ? '#6D28D9'
                              : unlocked || isTeacher
                              ? '#4338CA'
                              : isDark
                              ? '#1E293B'
                              : '#CBD5E1',
                          opacity: unlocked || isTeacher ? 1 : 0.65,
                        },
                      ]}>
                      <TouchableOpacity
                        onPress={() => handleOpenAssignment(assignment, unlocked)}
                        style={styles.itemLeft}>
                        <View
                          style={[
                            styles.statusIcon,
                            {
                              backgroundColor:
                                grade && grade.score >= 75
                                  ? '#DCFCE7'
                                  : sub
                                  ? '#EDE9FE'
                                  : unlocked || isTeacher
                                  ? '#E0E7FF'
                                  : '#F1F5F9',
                            },
                          ]}>
                          <Ionicons
                            name={
                              grade && grade.score >= 75
                                ? 'ribbon'
                                : sub
                                ? 'time'
                                : unlocked || isTeacher
                                ? 'cloud-upload'
                                : 'lock-closed'
                            }
                            size={16}
                            color={
                              grade && grade.score >= 75
                                ? '#15803D'
                                : sub
                                ? '#7C3AED'
                                : unlocked || isTeacher
                                ? '#4F46E5'
                                : '#94A3B8'
                            }
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={[
                              styles.itemTitle,
                              { color: isDark ? '#F8FAFC' : '#0F172A' },
                            ]}>
                            {assignment.title}
                          </Text>
                          <Text style={styles.itemMeta}>
                            Project Assignment • Max {assignment.maxScore} Pts
                          </Text>
                          <Text style={styles.dueDateLabel}>
                            ⏰ Deadline: {assignment.dueDate}
                          </Text>
                          {!unlocked && !isTeacher && (
                            <Text style={styles.lockHintText}>
                              🔒 Locked (Complete Module 1 lessons & quiz first)
                            </Text>
                          )}
                        </View>
                      </TouchableOpacity>

                      <View style={styles.itemRightRow}>
                        <View
                          style={[
                            styles.badgePill,
                            {
                              backgroundColor:
                                grade && grade.score >= 75
                                  ? '#DCFCE7'
                                  : sub
                                  ? '#EDE9FE'
                                  : unlocked || isTeacher
                                  ? '#E0E7FF'
                                  : '#F1F5F9',
                            },
                          ]}>
                          <Text
                            style={[
                              styles.badgeText,
                              {
                                color:
                                  grade && grade.score >= 75
                                    ? '#15803D'
                                    : sub
                                    ? '#7C3AED'
                                    : unlocked || isTeacher
                                    ? '#4F46E5'
                                    : '#94A3B8',
                              },
                            ]}>
                            {grade
                              ? `Score: ${grade.score}`
                              : sub
                              ? 'Pending Review'
                              : unlocked || isTeacher
                              ? 'Submit'
                              : 'Locked'}
                          </Text>
                        </View>

                        {/* Teacher Actions for Assignment: Edit Deadline & Delete */}
                        {isTeacher && (
                          <View style={styles.teacherActionIcons}>
                            <TouchableOpacity
                              onPress={() => handleOpenEditDueDate(assignment)}
                              style={styles.editDateBtn}
                              accessibilityLabel="Edit deadline">
                              <Ionicons name="calendar-outline" size={16} color="#8B5CF6" />
                            </TouchableOpacity>

                            <TouchableOpacity
                              onPress={() => handleDeleteAssignment(assignment)}
                              style={styles.deleteIconBtn}
                              accessibilityLabel="Delete assignment">
                              <Ionicons name="trash-outline" size={16} color="#EF4444" />
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* MODAL 1: RICH LESSON READER & PLAYER (STUDENT) */}
      <Modal
        visible={!!selectedLesson}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedLesson(null)}>
        <SafeAreaView
          style={[
            styles.modalContainer,
            { backgroundColor: isDark ? '#0F172A' : '#FFFFFF' },
          ]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setSelectedLesson(null)}>
              <Ionicons name="close" size={24} color={isDark ? '#F8FAFC' : '#0F172A'} />
            </TouchableOpacity>
            <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: 8 }}>
              <Text
                style={[
                  styles.modalHeaderTitle,
                  { color: isDark ? '#F8FAFC' : '#0F172A' },
                ]}>
                Learning Material
              </Text>
              {currentLessonModule && (
                <Text style={styles.modalHeaderSub} numberOfLines={1}>
                  {currentLessonModule.title}
                </Text>
              )}
            </View>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView
            style={styles.modalScroll}
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}>
            {selectedLesson && (
              <>
                <View style={styles.lessonMetaRow}>
                  <View
                    style={[
                      styles.lessonTypeBadge,
                      {
                        backgroundColor:
                          selectedLesson.contentType === 'video'
                            ? (isDark ? '#450A0A' : '#FEE2E2')
                            : (isDark ? '#172554' : '#EFF6FF'),
                      },
                    ]}>
                    <Ionicons
                      name={
                        selectedLesson.contentType === 'video'
                          ? 'play-circle'
                          : 'book-outline'
                      }
                      size={14}
                      color={
                        selectedLesson.contentType === 'video' ? '#EF4444' : '#2563EB'
                      }
                    />
                    <Text
                      style={[
                        styles.lessonTypeBadgeText,
                        {
                          color:
                            selectedLesson.contentType === 'video'
                              ? '#EF4444'
                              : '#2563EB',
                        },
                      ]}>
                      {selectedLesson.contentType === 'video'
                        ? 'Video Lesson'
                        : 'Reading Material'}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.lessonDurationBadge,
                      { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' },
                    ]}>
                    <Ionicons name="time-outline" size={13} color="#64748B" />
                    <Text style={styles.lessonDurationText}>
                      {selectedLesson.durationMinutes} Min
                    </Text>
                  </View>

                  {completedLessonIds.includes(selectedLesson.id) && (
                    <View style={styles.completedBadgePill}>
                      <Ionicons name="checkmark-circle" size={13} color="#10B981" />
                      <Text style={styles.completedBadgePillText}>Completed</Text>
                    </View>
                  )}
                </View>

                <Text
                  style={[
                    styles.modalTitle,
                    { color: isDark ? '#F8FAFC' : '#0F172A' },
                  ]}>
                  {selectedLesson.title}
                </Text>

                {/* In-Place Direct Video Player */}
                {selectedLesson.contentType === 'video' && (
                  <InlineVideoPlayer
                    videoUrl={selectedLesson.videoUrl}
                    title={selectedLesson.title}
                  />
                )}

                {/* Formatted Content */}
                <View style={styles.formattedContentWrapper}>
                  {renderFormattedLessonContent(selectedLesson.contentBody, isDark)}
                </View>
              </>
            )}
          </ScrollView>

          {/* Smart Next-Step Footer */}
          <View
            style={[
              styles.modalFooterMulti,
              {
                backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                borderTopColor: isDark ? '#1E293B' : '#E2E8F0',
              },
            ]}>
            <TouchableOpacity
              onPress={() => handleCompleteLessonPress(false)}
              style={[
                styles.modalPrimaryBtn,
                completedLessonIds.includes(selectedLesson?.id || '') && {
                  backgroundColor: '#10B981',
                },
              ]}>
              <Ionicons
                name={
                  completedLessonIds.includes(selectedLesson?.id || '')
                    ? 'checkmark-circle'
                    : 'checkmark-done'
                }
                size={18}
                color="#FFFFFF"
              />
              <Text style={styles.modalPrimaryBtnText}>
                {completedLessonIds.includes(selectedLesson?.id || '')
                  ? 'Lesson Completed ✓'
                  : 'Mark Completed (+25 XP)'}
              </Text>
            </TouchableOpacity>

            {nextLessonInModule && (
              <TouchableOpacity
                onPress={() => handleNextLessonPress(nextLessonInModule)}
                style={[
                  styles.nextStepBtn,
                  {
                    backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                    borderColor: isDark ? '#334155' : '#E2E8F0',
                  },
                ]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.nextStepSmallLabel}>Continue to Next Lesson:</Text>
                  <Text
                    style={[
                      styles.nextStepTitle,
                      { color: isDark ? '#F8FAFC' : '#0F172A' },
                    ]}
                    numberOfLines={1}>
                    {nextLessonInModule.title}
                  </Text>
                </View>
                <Ionicons name="arrow-forward-circle" size={26} color="#8B5CF6" />
              </TouchableOpacity>
            )}

            {!nextLessonInModule && currentModuleQuiz && (
              <TouchableOpacity
                onPress={() => handleProceedToQuizPress(currentModuleQuiz)}
                style={[
                  styles.nextStepBtn,
                  {
                    borderColor: '#10B981',
                    backgroundColor: isDark ? '#064E3B' : '#ECFDF5',
                  },
                ]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.nextStepSmallLabel, { color: '#059669' }]}>
                    Lessons Completed! Test Your Knowledge:
                  </Text>
                  <Text
                    style={[
                      styles.nextStepTitle,
                      { color: isDark ? '#6EE7B7' : '#047857' },
                    ]}
                    numberOfLines={1}>
                    {currentModuleQuiz.title}
                  </Text>
                </View>
                <Ionicons name="help-circle" size={26} color="#10B981" />
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </Modal>

      {/* MODAL 2: INTERACTIVE QUIZ (STUDENT) */}
      <Modal
        visible={!!selectedQuiz}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedQuiz(null)}>
        <SafeAreaView
          style={[
            styles.modalContainer,
            { backgroundColor: isDark ? '#0F172A' : '#FFFFFF' },
          ]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setSelectedQuiz(null)}>
              <Ionicons name="close" size={24} color={isDark ? '#F8FAFC' : '#0F172A'} />
            </TouchableOpacity>
            <Text
              style={[
                styles.modalHeaderTitle,
                { color: isDark ? '#F8FAFC' : '#0F172A' },
              ]}>
              Module Assessment Quiz
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalScroll}>
            {selectedQuiz && (
              <>
                <Text
                  style={[
                    styles.modalTitle,
                    { color: isDark ? '#F8FAFC' : '#0F172A' },
                  ]}>
                  {selectedQuiz.title}
                </Text>
                <Text style={styles.quizInstructions}>
                  Select the most accurate response. Passing threshold is{' '}
                  {selectedQuiz.passingScorePercentage}%.
                </Text>

                {selectedQuiz.questions.map((q, qIndex) => (
                  <View
                    key={q.id}
                    style={[
                      styles.quizQuestionCard,
                      {
                        backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                        borderColor: isDark ? '#334155' : '#E2E8F0',
                      },
                    ]}>
                    <Text
                      style={[
                        styles.questionText,
                        { color: isDark ? '#F8FAFC' : '#0F172A' },
                      ]}>
                      {qIndex + 1}. {q.questionText}
                    </Text>

                    {q.options.map((opt, optIdx) => {
                      const isSelected = quizAnswers[qIndex] === optIdx;

                      return (
                        <TouchableOpacity
                          key={optIdx}
                          onPress={() =>
                            setQuizAnswers((prev) => ({
                              ...prev,
                              [qIndex]: optIdx,
                            }))
                          }
                          style={[
                            styles.optionRow,
                            isSelected
                              ? {
                                  backgroundColor: isDark ? '#064E3B' : '#ECFDF5',
                                  borderColor: '#10B981',
                                  borderBottomWidth: 5,
                                  borderBottomColor: '#047857',
                                }
                              : {
                                  backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                                  borderColor: isDark ? '#334155' : '#E2E8F0',
                                  borderBottomWidth: 4,
                                  borderBottomColor: isDark ? '#0F172A' : '#CBD5E1',
                                },
                          ]}>
                          <View
                            style={[
                              styles.radioCircle,
                              isSelected && styles.radioCircleSelected,
                            ]}>
                            {isSelected && <View style={styles.radioDot} />}
                          </View>
                          <Text
                            style={[
                              styles.optionText,
                              {
                                color: isSelected
                                  ? isDark
                                    ? '#A7F3D0'
                                    : '#065F46'
                                  : isDark
                                  ? '#F8FAFC'
                                  : '#0F172A',
                                fontWeight: isSelected ? '800' : '600',
                              },
                            ]}>
                            {opt}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ))}

                {quizResultText && (
                  <View style={styles.resultBox}>
                    <Text style={styles.resultText}>{quizResultText}</Text>
                  </View>
                )}
              </>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              onPress={handleSubmitQuizPress}
              style={styles.tactileBtnGreen}>
              <Ionicons name="send" size={18} color="#FFFFFF" />
              <Text style={styles.tactileBtnGreenText}>Submit Quiz Answers</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* MODAL 3: ASSIGNMENT SUBMISSION (STUDENT) */}
      <Modal
        visible={!!selectedAssignment}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedAssignment(null)}>
        <SafeAreaView
          style={[
            styles.modalContainer,
            { backgroundColor: isDark ? '#0F172A' : '#FFFFFF' },
          ]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setSelectedAssignment(null)}>
              <Ionicons name="close" size={24} color={isDark ? '#F8FAFC' : '#0F172A'} />
            </TouchableOpacity>
            <Text
              style={[
                styles.modalHeaderTitle,
                { color: isDark ? '#F8FAFC' : '#0F172A' },
              ]}>
              Project Deliverable Submission
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalScroll}>
            {selectedAssignment && (
              <>
                <Text
                  style={[
                    styles.modalTitle,
                    { color: isDark ? '#F8FAFC' : '#0F172A' },
                  ]}>
                  {selectedAssignment.title}
                </Text>

                <View
                  style={[
                    styles.instructionsBox,
                    {
                      backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
                      borderColor: isDark ? '#334155' : '#E2E8F0',
                    },
                  ]}>
                  <Text
                    style={[
                      styles.instructionsTitle,
                      { color: isDark ? '#93C5FD' : '#1D4ED8' },
                    ]}>
                    📋 Instructor Assignment Guidelines:
                  </Text>
                  <Text
                    style={[
                      styles.instructionsText,
                      { color: isDark ? '#CBD5E1' : '#475569' },
                    ]}>
                    {selectedAssignment.instructions}
                  </Text>
                  <Text style={styles.modalDueDateBadge}>
                    ⏰ Due Date: {selectedAssignment.dueDate}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.inputLabel,
                    { color: isDark ? '#F8FAFC' : '#0F172A' },
                  ]}>
                  Repository Link / Deliverable URL (Optional):
                </Text>
                <TextInput
                  placeholder="https://github.com/username/project..."
                  placeholderTextColor="#94A3B8"
                  value={assignmentUrl}
                  onChangeText={setAssignmentUrl}
                  style={[
                    styles.modalInput,
                    {
                      backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                      color: isDark ? '#F8FAFC' : '#0F172A',
                      borderColor: isDark ? '#334155' : '#CBD5E1',
                    },
                  ]}
                />

                <Text
                  style={[
                    styles.inputLabel,
                    { color: isDark ? '#F8FAFC' : '#0F172A' },
                  ]}>
                  Student Solution Notes & Implementation Details *:
                </Text>
                <TextInput
                  placeholder="Summarize your architecture, deliverables, and features..."
                  placeholderTextColor="#94A3B8"
                  value={assignmentText}
                  onChangeText={setAssignmentText}
                  multiline
                  numberOfLines={4}
                  style={[
                    styles.modalInput,
                    styles.modalTextArea,
                    {
                      backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                      color: isDark ? '#F8FAFC' : '#0F172A',
                      borderColor: isDark ? '#334155' : '#CBD5E1',
                    },
                  ]}
                />
              </>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              onPress={handleSubmitAssignmentPress}
              style={styles.tactileBtnGreen}>
              <Ionicons name="cloud-upload" size={18} color="#FFFFFF" />
              <Text style={styles.tactileBtnGreenText}>
                Submit Project to Instructor (+75 XP)
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* TEACHER MODAL 1: ADD NEW LESSON */}
      <Modal
        visible={isAddLessonModalOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsAddLessonModalOpen(false)}>
        <SafeAreaView
          style={[
            styles.modalContainer,
            { backgroundColor: isDark ? '#0F172A' : '#FFFFFF' },
          ]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsAddLessonModalOpen(false)}>
              <Ionicons name="close" size={24} color={isDark ? '#F8FAFC' : '#0F172A'} />
            </TouchableOpacity>
            <Text
              style={[
                styles.modalHeaderTitle,
                { color: isDark ? '#F8FAFC' : '#0F172A' },
              ]}>
              Add New Lesson Unit
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalScroll}>
            {/* Target Module Picker */}
            <Text
              style={[
                styles.inputLabel,
                { color: isDark ? '#F8FAFC' : '#0F172A' },
              ]}>
              Target Module *:
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 14 }}>
              {currentModules.map((m) => {
                const isSelected = targetModuleForLesson === m.id;
                return (
                  <TouchableOpacity
                    key={m.id}
                    onPress={() => setTargetModuleForLesson(m.id)}
                    style={[
                      styles.moduleSelectChip,
                      {
                        backgroundColor: isSelected
                          ? '#8B5CF6'
                          : isDark
                          ? '#1E293B'
                          : '#F1F5F9',
                        borderColor: isSelected
                          ? '#7C3AED'
                          : isDark
                          ? '#334155'
                          : '#CBD5E1',
                      },
                    ]}>
                    <Ionicons
                      name="folder-open"
                      size={13}
                      color={isSelected ? '#FFFFFF' : '#8B5CF6'}
                    />
                    <Text
                      style={[
                        styles.moduleSelectChipText,
                        {
                          color: isSelected
                            ? '#FFFFFF'
                            : isDark
                            ? '#CBD5E1'
                            : '#475569',
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}>
                      {m.title}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Text
              style={[
                styles.inputLabel,
                { color: isDark ? '#F8FAFC' : '#0F172A' },
              ]}>
              Lesson Title *:
            </Text>
            <TextInput
              placeholder="e.g. 1.3 Advanced Routing with Expo Router"
              placeholderTextColor="#94A3B8"
              value={newLessonTitle}
              onChangeText={setNewLessonTitle}
              style={[
                styles.modalInput,
                {
                  backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                  color: isDark ? '#F8FAFC' : '#0F172A',
                  borderColor: isDark ? '#334155' : '#CBD5E1',
                },
              ]}
            />

            <Text
              style={[
                styles.inputLabel,
                { color: isDark ? '#F8FAFC' : '#0F172A' },
              ]}>
              Estimated Duration (Minutes):
            </Text>
            <TextInput
              placeholder="15"
              placeholderTextColor="#94A3B8"
              value={newLessonDuration}
              onChangeText={setNewLessonDuration}
              keyboardType="numeric"
              style={[
                styles.modalInput,
                {
                  backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                  color: isDark ? '#F8FAFC' : '#0F172A',
                  borderColor: isDark ? '#334155' : '#CBD5E1',
                },
              ]}
            />

            <Text
              style={[
                styles.inputLabel,
                { color: isDark ? '#F8FAFC' : '#0F172A' },
              ]}>
              Lesson Content Type *:
            </Text>
            <View style={styles.typeSelectorRow}>
              <TouchableOpacity
                onPress={() => setNewLessonType('reading')}
                style={[
                  styles.typeSelectorChip,
                  newLessonType === 'reading' && styles.typeSelectorChipActive,
                  {
                    backgroundColor:
                      newLessonType === 'reading'
                        ? '#8B5CF6'
                        : isDark
                        ? '#1E293B'
                        : '#F1F5F9',
                    borderColor:
                      newLessonType === 'reading'
                        ? '#7C3AED'
                        : isDark
                        ? '#334155'
                        : '#CBD5E1',
                  },
                ]}>
                <Ionicons
                  name="book-outline"
                  size={15}
                  color={newLessonType === 'reading' ? '#FFFFFF' : '#8B5CF6'}
                />
                <Text
                  style={[
                    styles.typeSelectorText,
                    {
                      color:
                        newLessonType === 'reading'
                          ? '#FFFFFF'
                          : isDark
                          ? '#CBD5E1'
                          : '#475569',
                      fontWeight: newLessonType === 'reading' ? '700' : '500',
                    },
                  ]}>
                  Reading & Text
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setNewLessonType('video')}
                style={[
                  styles.typeSelectorChip,
                  newLessonType === 'video' && styles.typeSelectorChipActive,
                  {
                    backgroundColor:
                      newLessonType === 'video'
                        ? '#EF4444'
                        : isDark
                        ? '#1E293B'
                        : '#F1F5F9',
                    borderColor:
                      newLessonType === 'video'
                        ? '#DC2626'
                        : isDark
                        ? '#334155'
                        : '#CBD5E1',
                  },
                ]}>
                <Ionicons
                  name="videocam-outline"
                  size={15}
                  color={newLessonType === 'video' ? '#FFFFFF' : '#EF4444'}
                />
                <Text
                  style={[
                    styles.typeSelectorText,
                    {
                      color:
                        newLessonType === 'video'
                          ? '#FFFFFF'
                          : isDark
                          ? '#CBD5E1'
                          : '#475569',
                      fontWeight: newLessonType === 'video' ? '700' : '500',
                    },
                  ]}>
                  Video Lecture
                </Text>
              </TouchableOpacity>
            </View>

            {newLessonType === 'video' && (
              <View
                style={[
                  styles.videoConfigBox,
                  {
                    backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                    borderColor: '#EF4444',
                  },
                ]}>
                <View style={styles.videoConfigHeader}>
                  <View style={styles.videoMandatoryRow}>
                    <Ionicons name="videocam" size={16} color="#EF4444" />
                    <Text
                      style={[
                        styles.inputLabel,
                        { color: isDark ? '#F8FAFC' : '#0F172A', marginBottom: 0 },
                      ]}>
                      Materi Video Lecture (Wajib) *
                    </Text>
                  </View>
                  <View style={styles.mandatoryBadge}>
                    <Text style={styles.mandatoryBadgeText}>WAJIB DIISI</Text>
                  </View>
                </View>

                <Text
                  style={[
                    styles.videoConfigSub,
                    { color: isDark ? '#94A3B8' : '#64748B' },
                  ]}>
                  Pilih unggah file video langsung dari perangkat Anda atau masukkan tautan link video. Video dapat langsung diputar di dalam aplikasi tanpa berpindah tempat.
                </Text>

                {/* Dual Mode Switcher Tabs */}
                <View
                  style={[
                    styles.videoModeToggleRow,
                    { backgroundColor: isDark ? '#0F172A' : '#E2E8F0' },
                  ]}>
                  <TouchableOpacity
                    onPress={() => setVideoSourceMode('upload')}
                    style={[
                      styles.videoModeTab,
                      videoSourceMode === 'upload' && styles.videoModeTabActive,
                    ]}>
                    <Ionicons
                      name="cloud-upload-outline"
                      size={14}
                      color={
                        videoSourceMode === 'upload'
                          ? '#FFFFFF'
                          : isDark
                          ? '#CBD5E1'
                          : '#475569'
                      }
                    />
                    <Text
                      style={[
                        styles.videoModeTabText,
                        {
                          color:
                            videoSourceMode === 'upload'
                              ? '#FFFFFF'
                              : isDark
                              ? '#CBD5E1'
                              : '#475569',
                        },
                      ]}>
                      Upload File Video
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setVideoSourceMode('link')}
                    style={[
                      styles.videoModeTab,
                      videoSourceMode === 'link' && styles.videoModeTabActive,
                    ]}>
                    <Ionicons
                      name="link-outline"
                      size={14}
                      color={
                        videoSourceMode === 'link'
                          ? '#FFFFFF'
                          : isDark
                          ? '#CBD5E1'
                          : '#475569'
                      }
                    />
                    <Text
                      style={[
                        styles.videoModeTabText,
                        {
                          color:
                            videoSourceMode === 'link'
                              ? '#FFFFFF'
                              : isDark
                              ? '#CBD5E1'
                              : '#475569',
                        },
                      ]}>
                      Tautan Link Video
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Sub-view: Upload Video Mode */}
                {videoSourceMode === 'upload' ? (
                  <View style={styles.uploadSection}>
                    {newLessonVideoUrl && uploadedVideoName ? (
                      <View
                        style={[
                          styles.uploadedFileCard,
                          {
                            backgroundColor: isDark ? '#0F172A' : '#EFF6FF',
                            borderColor: '#3B82F6',
                          },
                        ]}>
                        <View style={styles.uploadedFileHeader}>
                          <View style={styles.uploadedFileLeft}>
                            <View style={styles.videoFileIcon}>
                              <Ionicons name="film" size={20} color="#3B82F6" />
                            </View>
                            <View style={{ flex: 1, minWidth: 0 }}>
                              <Text
                                numberOfLines={1}
                                style={[
                                  styles.uploadedFileName,
                                  { color: isDark ? '#F8FAFC' : '#0F172A' },
                                ]}>
                                {uploadedVideoName}
                              </Text>
                              <Text style={styles.uploadedFileSize}>
                                {uploadedVideoSize} • Siap Diputar In-Place
                              </Text>
                            </View>
                          </View>
                          <TouchableOpacity
                            onPress={() => {
                              setNewLessonVideoUrl('');
                              setUploadedVideoName('');
                              setUploadedVideoSize('');
                            }}
                            style={styles.removeVideoBtn}>
                            <Ionicons name="trash-outline" size={16} color="#DC2626" />
                          </TouchableOpacity>
                        </View>

                        {/* In-Place Preview */}
                        <View style={{ marginTop: 8 }}>
                          <Text
                            style={[
                              styles.previewLabel,
                              { color: isDark ? '#94A3B8' : '#64748B' },
                            ]}>
                            Pratinjau Pemutar Video Langsung:
                          </Text>
                          <InlineVideoPlayer
                            videoUrl={newLessonVideoUrl}
                            title={newLessonTitle || 'Preview Video'}
                          />
                        </View>

                        <TouchableOpacity
                          onPress={handlePickVideoFile}
                          style={styles.changeFileBtn}>
                          <Ionicons name="swap-horizontal" size={14} color="#2563EB" />
                          <Text style={styles.changeFileBtnText}>
                            Ganti File Video Lain
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={styles.dropzoneWrapper}>
                        <TouchableOpacity
                          onPress={handlePickVideoFile}
                          style={[
                            styles.dropzoneCard,
                            {
                              backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                              borderColor: isDark ? '#334155' : '#CBD5E1',
                            },
                          ]}
                          activeOpacity={0.8}>
                          <View style={styles.dropzoneIconCircle}>
                            <Ionicons name="cloud-upload" size={28} color="#EF4444" />
                          </View>
                          <Text
                            style={[
                              styles.dropzoneTitle,
                              { color: isDark ? '#F8FAFC' : '#0F172A' },
                            ]}>
                            Klik untuk Pilih & Unggah Video
                          </Text>
                          <Text style={styles.dropzoneSub}>
                            Mendukung file MP4, WebM, MOV (Maksimal 100MB)
                          </Text>
                          <View style={styles.dropzonePill}>
                            <Ionicons
                              name="folder-open-outline"
                              size={13}
                              color="#EF4444"
                            />
                            <Text style={styles.dropzonePillText}>
                              Buka File Picker
                            </Text>
                          </View>
                        </TouchableOpacity>

                        {/* Quick Sample Demo Video */}
                        <TouchableOpacity
                          onPress={() => {
                            setUploadedVideoName('lecture_digital_venture_demo.mp4');
                            setUploadedVideoSize('12.5 MB');
                            setNewLessonVideoUrl(
                              'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
                            );
                          }}
                          style={[
                            styles.sampleQuickBtn,
                            { backgroundColor: isDark ? '#0F172A' : '#FEF2F2' },
                          ]}>
                          <Ionicons name="sparkles" size={13} color="#DC2626" />
                          <Text style={styles.sampleQuickBtnText}>
                            Atau Gunakan File Video Sampel Demo (1-Klik)
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                ) : (
                  /* Sub-view: Video Link Mode */
                  <View style={styles.linkSection}>
                    <Text
                      style={[
                        styles.inputLabel,
                        { color: isDark ? '#F8FAFC' : '#0F172A', marginTop: 4 },
                      ]}>
                      Tautan URL Video (YouTube / MP4 Direct):
                    </Text>
                    <TextInput
                      placeholder="https://www.youtube.com/watch?v=... atau https://.../video.mp4"
                      placeholderTextColor="#94A3B8"
                      value={newLessonVideoUrl}
                      onChangeText={(val) => {
                        setNewLessonVideoUrl(val);
                        setUploadedVideoName('');
                        setUploadedVideoSize('');
                      }}
                      style={[
                        styles.modalInput,
                        {
                          backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                          color: isDark ? '#F8FAFC' : '#0F172A',
                          borderColor: isDark ? '#334155' : '#CBD5E1',
                        },
                      ]}
                    />

                    {/* Quick Preset Buttons */}
                    <View style={styles.presetRow}>
                      <Text
                        style={[
                          styles.presetTitle,
                          { color: isDark ? '#94A3B8' : '#64748B' },
                        ]}>
                        Preset Cepat:
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          setNewLessonVideoUrl(
                            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
                          )
                        }
                        style={[
                          styles.presetChip,
                          { backgroundColor: isDark ? '#0F172A' : '#EFF6FF' },
                        ]}>
                        <Text style={styles.presetChipText}>🎬 Sample MP4</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() =>
                          setNewLessonVideoUrl(
                            'https://www.youtube.com/watch?v=kJQP7kiw5Fk'
                          )
                        }
                        style={[
                          styles.presetChip,
                          { backgroundColor: isDark ? '#0F172A' : '#FEF2F2' },
                        ]}>
                        <Text
                          style={[styles.presetChipText, { color: '#DC2626' }]}>
                          🔴 YouTube
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Live In-Place Preview */}
                    {newLessonVideoUrl.trim() ? (
                      <View style={{ marginTop: 10 }}>
                        <Text
                          style={[
                            styles.previewLabel,
                            { color: isDark ? '#94A3B8' : '#64748B' },
                          ]}>
                          Pratinjau Pemutar Video Langsung:
                        </Text>
                        <InlineVideoPlayer
                          videoUrl={newLessonVideoUrl}
                          title={newLessonTitle || 'Preview Video'}
                        />
                      </View>
                    ) : null}
                  </View>
                )}
              </View>
            )}

            <Text
              style={[
                styles.inputLabel,
                { color: isDark ? '#F8FAFC' : '#0F172A' },
              ]}>
              Lesson Content & Body *:
            </Text>
            <TextInput
              placeholder="Write detailed lesson explanation, concepts, or references..."
              placeholderTextColor="#94A3B8"
              value={newLessonBody}
              onChangeText={setNewLessonBody}
              multiline
              numberOfLines={6}
              style={[
                styles.modalInput,
                styles.modalTextAreaLarge,
                {
                  backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                  color: isDark ? '#F8FAFC' : '#0F172A',
                  borderColor: isDark ? '#334155' : '#CBD5E1',
                },
              ]}
            />
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              onPress={handleSaveLesson}
              style={styles.tactileBtnPurple}>
              <Ionicons name="add-circle" size={18} color="#FFFFFF" />
              <Text style={styles.tactileBtnPurpleText}>Save Lesson Unit</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* TEACHER MODAL 2: ADD NEW ASSIGNMENT */}
      <Modal
        visible={isAddAssignmentModalOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsAddAssignmentModalOpen(false)}>
        <SafeAreaView
          style={[
            styles.modalContainer,
            { backgroundColor: isDark ? '#0F172A' : '#FFFFFF' },
          ]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsAddAssignmentModalOpen(false)}>
              <Ionicons name="close" size={24} color={isDark ? '#F8FAFC' : '#0F172A'} />
            </TouchableOpacity>
            <Text
              style={[
                styles.modalHeaderTitle,
                { color: isDark ? '#F8FAFC' : '#0F172A' },
              ]}>
              Add New Project Assignment
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalScroll}>
            {/* Target Module Picker */}
            <Text
              style={[
                styles.inputLabel,
                { color: isDark ? '#F8FAFC' : '#0F172A' },
              ]}>
              Target Module *:
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 14 }}>
              {currentModules.map((m) => {
                const isSelected = targetModuleForAssignment === m.id;
                return (
                  <TouchableOpacity
                    key={m.id}
                    onPress={() => setTargetModuleForAssignment(m.id)}
                    style={[
                      styles.moduleSelectChip,
                      {
                        backgroundColor: isSelected
                          ? '#6366F1'
                          : isDark
                          ? '#1E293B'
                          : '#F1F5F9',
                        borderColor: isSelected
                          ? '#4F46E5'
                          : isDark
                          ? '#334155'
                          : '#CBD5E1',
                      },
                    ]}>
                    <Ionicons
                      name="folder-open"
                      size={13}
                      color={isSelected ? '#FFFFFF' : '#6366F1'}
                    />
                    <Text
                      style={[
                        styles.moduleSelectChipText,
                        {
                          color: isSelected
                            ? '#FFFFFF'
                            : isDark
                            ? '#CBD5E1'
                            : '#475569',
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}>
                      {m.title}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Text
              style={[
                styles.inputLabel,
                { color: isDark ? '#F8FAFC' : '#0F172A' },
              ]}>
              Assignment Title *:
            </Text>
            <TextInput
              placeholder="e.g. Assignment 2: Reactive State Architecture"
              placeholderTextColor="#94A3B8"
              value={newAssignTitle}
              onChangeText={setNewAssignTitle}
              style={[
                styles.modalInput,
                {
                  backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                  color: isDark ? '#F8FAFC' : '#0F172A',
                  borderColor: isDark ? '#334155' : '#CBD5E1',
                },
              ]}
            />

            <Text
              style={[
                styles.inputLabel,
                { color: isDark ? '#F8FAFC' : '#0F172A' },
              ]}>
              Submission Deadline *:
            </Text>
            <TextInput
              placeholder="e.g. 2026-11-20 23:59"
              placeholderTextColor="#94A3B8"
              value={newAssignDueDate}
              onChangeText={setNewAssignDueDate}
              style={[
                styles.modalInput,
                {
                  backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                  color: isDark ? '#F8FAFC' : '#0F172A',
                  borderColor: isDark ? '#334155' : '#CBD5E1',
                },
              ]}
            />

            <Text
              style={[
                styles.inputLabel,
                { color: isDark ? '#F8FAFC' : '#0F172A' },
              ]}>
              Maximum Score:
            </Text>
            <TextInput
              placeholder="100"
              placeholderTextColor="#94A3B8"
              value={newAssignMaxScore}
              onChangeText={setNewAssignMaxScore}
              keyboardType="numeric"
              style={[
                styles.modalInput,
                {
                  backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                  color: isDark ? '#F8FAFC' : '#0F172A',
                  borderColor: isDark ? '#334155' : '#CBD5E1',
                },
              ]}
            />

            <Text
              style={[
                styles.inputLabel,
                { color: isDark ? '#F8FAFC' : '#0F172A' },
              ]}>
              Assignment Instructions *:
            </Text>
            <TextInput
              placeholder="Detail evaluation criteria and expected student deliverables..."
              placeholderTextColor="#94A3B8"
              value={newAssignInstructions}
              onChangeText={setNewAssignInstructions}
              multiline
              numberOfLines={5}
              style={[
                styles.modalInput,
                styles.modalTextArea,
                {
                  backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                  color: isDark ? '#F8FAFC' : '#0F172A',
                  borderColor: isDark ? '#334155' : '#CBD5E1',
                },
              ]}
            />
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              onPress={handleSaveAssignment}
              style={styles.tactileBtnPurple}>
              <Ionicons name="save-outline" size={18} color="#FFFFFF" />
              <Text style={styles.tactileBtnPurpleText}>Save Project Assignment</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* TEACHER MODAL 3: EDIT DUE DATE */}
      <Modal
        visible={isEditDueDateModalOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setIsEditDueDateModalOpen(false)}>
        <View style={styles.promptModalOverlay}>
          <View
            style={[
              styles.promptModalCard,
              {
                backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                borderColor: isDark ? '#334155' : '#E2E8F0',
              },
            ]}>
            <Text
              style={[
                styles.promptTitle,
                { color: isDark ? '#F8FAFC' : '#0F172A' },
              ]}>
              ⏰ Set Assignment Deadline
            </Text>
            <Text style={styles.promptSubtitle}>
              {targetAssignmentToEdit?.title}
            </Text>

            <TextInput
              placeholder="e.g. 2026-11-25 23:59"
              placeholderTextColor="#94A3B8"
              value={editDueDateInput}
              onChangeText={setEditDueDateInput}
              style={[
                styles.modalInput,
                {
                  backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                  color: isDark ? '#F8FAFC' : '#0F172A',
                  borderColor: isDark ? '#334155' : '#CBD5E1',
                  marginTop: 10,
                },
              ]}
            />

            <View style={styles.promptBtnRow}>
              <TouchableOpacity
                onPress={() => setIsEditDueDateModalOpen(false)}
                style={styles.promptCancelBtn}>
                <Text style={styles.promptCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSaveNewDueDate}
                style={styles.promptSaveBtn}>
                <Text style={styles.promptSaveText}>Update Deadline</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* TEACHER MODAL 4: ADD NEW MODULE */}
      <Modal
        visible={isAddModuleModalOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setIsAddModuleModalOpen(false)}>
        <View style={styles.promptModalOverlay}>
          <View
            style={[
              styles.promptModalCard,
              {
                backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                borderColor: isDark ? '#334155' : '#E2E8F0',
              },
            ]}>
            <Text
              style={[
                styles.promptTitle,
                { color: isDark ? '#F8FAFC' : '#0F172A' },
              ]}>
              📁 Add New Module
            </Text>

            <Text style={styles.promptSubtitle}>
              Create a new module chapter for &quot;{activeCourse.title}&quot;
            </Text>

            <TextInput
              value={newModuleTitle}
              onChangeText={setNewModuleTitle}
              placeholder="e.g. Module 3: Deployment & CI/CD"
              placeholderTextColor="#94A3B8"
              style={[
                styles.modalInput,
                {
                  backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                  color: isDark ? '#F8FAFC' : '#0F172A',
                  borderColor: isDark ? '#334155' : '#CBD5E1',
                  marginTop: 10,
                },
              ]}
            />

            <View style={styles.promptBtnRow}>
              <TouchableOpacity
                onPress={() => setIsAddModuleModalOpen(false)}
                style={styles.promptCancelBtn}>
                <Text style={styles.promptCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSaveModule}
                style={[styles.promptSaveBtn, { backgroundColor: '#8B5CF6' }]}>
                <Text style={styles.promptSaveText}>Save Module</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  headerTitleContainer: {
    marginBottom: 16,
  },
  moduleSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  moduleSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  addModuleHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  addModuleHeaderBtnText: {
    color: '#8B5CF6',
    fontSize: 12,
    fontWeight: '700',
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  screenSubtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  moduleCard: {
    borderRadius: 24,
    padding: 18,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderBottomWidth: 5,
    borderBottomColor: '#CBD5E1',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  moduleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    flexWrap: 'wrap',
    gap: 8,
  },
  moduleTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 140,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
    flex: 1,
  },
  teacherActionBtnGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  addMiniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1.5,
    borderColor: '#8B5CF6',
    borderBottomWidth: 3,
    borderBottomColor: '#6D28D9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: '#F5F3FF',
  },
  addMiniBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8B5CF6',
  },
  itemsList: {
    gap: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 18,
    borderWidth: 2,
    borderBottomWidth: 4,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  statusIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  itemMeta: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  dueDateLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D97706',
    marginTop: 2,
  },
  lockHintText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#EF4444',
    marginTop: 2,
  },
  itemRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  badgePill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  deleteIconBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  teacherActionIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editDateBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // MODAL STYLES
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalScroll: {
    flex: 1,
    padding: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 14,
  },
  modalBodyText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#475569',
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  modalPrimaryBtn: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#059669',
    borderBottomWidth: 5,
    borderBottomColor: '#047857',
    minHeight: 48,
    gap: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  modalPrimaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 0.2,
  },
  tactileBtnGreen: {
    backgroundColor: '#10B981',
    borderWidth: 1,
    borderColor: '#059669',
    borderBottomWidth: 5,
    borderBottomColor: '#047857',
    borderRadius: 16,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  tactileBtnGreenText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 0.2,
  },
  tactileBtnPurple: {
    backgroundColor: '#8B5CF6',
    borderWidth: 1,
    borderColor: '#7C3AED',
    borderBottomWidth: 5,
    borderBottomColor: '#6D28D9',
    borderRadius: 16,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  tactileBtnPurpleText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 0.2,
  },
  quizInstructions: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 16,
  },
  quizQuestionCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderBottomWidth: 4,
    borderBottomColor: '#CBD5E1',
    marginBottom: 16,
  },
  questionText: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 14,
    letterSpacing: -0.2,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 10,
    gap: 12,
    minHeight: 48,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2.5,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: '#10B981',
    backgroundColor: '#10B981',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },
  optionText: {
    fontSize: 14,
    flex: 1,
  },
  resultBox: {
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
    marginBottom: 20,
  },
  resultText: {
    fontSize: 13,
    color: '#1E40AF',
    fontWeight: '600',
  },
  instructionsBox: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
  },
  instructionsTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  instructionsText: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 6,
  },
  modalDueDateBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 14,
  },
  modalTextArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  modalTextAreaLarge: {
    height: 140,
    textAlignVertical: 'top',
  },
  promptModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  promptModalCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  promptTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  promptSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 8,
  },
  promptBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 6,
  },
  promptCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  promptCancelText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  promptSaveBtn: {
    backgroundColor: '#8B5CF6',
    borderWidth: 1,
    borderColor: '#7C3AED',
    borderBottomWidth: 4,
    borderBottomColor: '#6D28D9',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  promptSaveText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  classSelectorContainer: {
    marginBottom: 16,
  },
  selectorLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  classSelectorScroll: {
    gap: 10,
    paddingRight: 10,
  },
  classChip: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderBottomWidth: 4,
    minWidth: 160,
    maxWidth: 220,
  },
  classChipTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  classChipCode: {
    fontSize: 12,
  },
  chipTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  chipTagText: {
    fontSize: 10,
    fontWeight: '800',
  },
  classChipTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  courseBannerCard: {
    padding: 20,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#4338CA',
    borderBottomWidth: 6,
    borderBottomColor: '#312E81',
    backgroundColor: '#4F46E5',
    marginBottom: 20,
    shadowColor: '#312E81',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
    ...(Platform.OS === 'web' && ({
      backgroundImage: 'linear-gradient(135deg, #6366F1, #4F46E5)',
    } as any)),
  },
  courseBannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  cohortCodeBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  cohortCodeText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.6,
  },
  courseBannerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  courseBannerDesc: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.88)',
    lineHeight: 19,
    marginBottom: 14,
  },
  courseBannerMetaRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  metaCol: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.75)',
    marginBottom: 2,
    fontWeight: '600',
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  dynamicNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    padding: 12,
    borderRadius: 14,
    gap: 10,
  },
  dynamicNoticeText: {
    fontSize: 12,
    color: '#FFFFFF',
    flex: 1,
    lineHeight: 17,
  },
  referenceNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    padding: 12,
    borderRadius: 14,
    gap: 10,
  },
  referenceNoticeText: {
    fontSize: 12,
    color: '#FFFFFF',
    flex: 1,
    lineHeight: 17,
  },
  emptyStateCard: {
    padding: 30,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 4,
  },
  emptyStateDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },
  moduleSelectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    marginRight: 8,
  },
  moduleSelectChipText: {
    fontSize: 12,
  },
  modalHeaderSub: {
    fontSize: 11,
    color: '#8B5CF6',
    fontWeight: '600',
    marginTop: 2,
  },
  lessonMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  lessonTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  lessonTypeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  lessonDurationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  lessonDurationText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  completedBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  completedBadgePillText: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '700',
  },
  videoPlayerCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  videoPlayerScreen: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  videoPlayerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  videoPlayerSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 12,
    maxWidth: '90%',
    textAlign: 'center',
  },
  videoLaunchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  videoLaunchBtnText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  formattedContentWrapper: {
    marginTop: 6,
  },
  modalFooterMulti: {
    padding: 16,
    borderTopWidth: 1,
    gap: 10,
  },
  nextStepBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  nextStepSmallLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8B5CF6',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  nextStepTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  richCodeCard: {
    backgroundColor: '#0B1120',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    overflow: 'hidden',
    marginVertical: 10,
  },
  richCodeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  richCodeDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  richDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
  },
  richCodeLang: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    marginLeft: 6,
    textTransform: 'uppercase',
  },
  richCopyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  richCopyText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  richCodeScroll: {
    padding: 14,
  },
  richCodeText: {
    fontFamily: 'monospace',
    fontSize: 13,
    lineHeight: 20,
    color: '#38BDF8',
  },
  richH3Container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 6,
    gap: 8,
  },
  richH3Bar: {
    width: 4,
    height: 16,
    borderRadius: 2,
    backgroundColor: '#8B5CF6',
  },
  richH3Text: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  richH4Container: {
    marginTop: 10,
    marginBottom: 4,
  },
  richH4Text: {
    fontSize: 14,
    fontWeight: '700',
  },
  richLiRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginVertical: 4,
    paddingLeft: 4,
  },
  richLiBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8B5CF6',
    marginTop: 7,
  },
  richNumBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  richNumBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#7C3AED',
  },
  richLiText: {
    fontSize: 13,
    lineHeight: 20,
    flex: 1,
  },
  richParagraph: {
    fontSize: 14,
    lineHeight: 22,
    marginVertical: 4,
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  typeSelectorChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  typeSelectorChipActive: {
    elevation: 2,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  typeSelectorText: {
    fontSize: 12,
  },
  videoConfigBox: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 16,
  },
  videoConfigHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  videoMandatoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mandatoryBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  mandatoryBadgeText: {
    color: '#DC2626',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  videoConfigSub: {
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 12,
  },
  videoModeToggleRow: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: 12,
    marginBottom: 12,
  },
  videoModeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 10,
  },
  videoModeTabActive: {
    backgroundColor: '#EF4444',
  },
  videoModeTabText: {
    fontSize: 12,
    fontWeight: '700',
  },
  uploadSection: {
    marginTop: 4,
  },
  dropzoneWrapper: {
    gap: 8,
  },
  dropzoneCard: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  dropzoneIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  dropzoneTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  dropzoneSub: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
  },
  dropzonePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
    marginTop: 4,
  },
  dropzonePillText: {
    color: '#DC2626',
    fontSize: 11,
    fontWeight: '700',
  },
  sampleQuickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  sampleQuickBtnText: {
    fontSize: 11,
    color: '#DC2626',
    fontWeight: '700',
  },
  uploadedFileCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  uploadedFileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  uploadedFileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  videoFileIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadedFileName: {
    fontSize: 12,
    fontWeight: '800',
  },
  uploadedFileSize: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  removeVideoBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
  },
  changeFileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: 8,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  changeFileBtnText: {
    color: '#2563EB',
    fontSize: 11,
    fontWeight: '700',
  },
  previewLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  linkSection: {
    marginTop: 4,
  },
  presetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  presetTitle: {
    fontSize: 11,
    fontWeight: '700',
  },
  presetChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  presetChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
});


