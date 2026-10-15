export type Language = 'en';

export interface TranslationDictionary {
  // Common & Navigation
  common: {
    dashboard: string;
    syllabus: string;
    assignments: string;
    gradebook: string;
    profile: string;
    graduation: string;
    settings: string;
    guide: string;
    notifications: string;
    reset: string;
    logout: string;
    back: string;
    next: string;
    previous: string;
    finish: string;
    save: string;
    cancel: string;
    close: string;
    submit: string;
    submitted: string;
    inProgress: string;
    completed: string;
    locked: string;
    passed: string;
    failed: string;
    score: string;
    learner: string;
    instructor: string;
    modeLearner: string;
    modeInstructor: string;
    or: string;
    loading: string;
    success: string;
    error: string;
    copied: string;
    download: string;
    active: string;
    closed: string;
    search: string;
    filter: string;
    all: string;
    unread: string;
  };

  // Header
  header: {
    cohortTag: string;
    guideBtn: string;
    resetConfirmTitle: string;
    resetConfirmMsg: string;
    resetSuccess: string;
    logoutConfirmTitle: string;
    logoutConfirmMsg: string;
    loggedInAs: string;
    streakDays: string;
    xpPoints: string;
  };

  // Dashboard
  dashboard: {
    welcomeBack: string;
    cohortStatus: string;
    batchActive: string;
    daysRemaining: string;
    overallProgress: string;
    statsLessonsCompleted: string;
    statsQuizAverage: string;
    statsFinalGrade: string;
    statsDayStreak: string;
    currentMissionTitle: string;
    currentMissionDesc: string;
    continueLearning: string;
    announcementsTitle: string;
    noAnnouncements: string;
    enrollCardTitle: string;
    enrollCardDesc: string;
    enrollInputPlaceholder: string;
    enrollBtn: string;
    enrollSuccess: string;
    enrollError: string;
    instructorOverviewTitle: string;
    instructorOverviewDesc: string;
    manageClassesBtn: string;
    pendingReviews: string;
    totalEnrolledStudents: string;

    // Bento Hero & Badges
    heroBadgeActiveMission: string;
    heroBadgeGraduated: string;
    heroBadgeActiveClass: string;
    heroCodeLabel: string;
    heroCodeCopied: string;
    heroMentorLabel: string;
    adventureProgress: string;
    openSyllabusBtn: string;

    // Student Bento Metrics
    metricLessons: string;
    metricCompleted: string;
    metricQuiz: string;
    metricPassed: string;
    metricAssignment: string;
    metricProjectScore: string;
    metricNotGraded: string;
    metricStatus: string;
    statusPassed: string;
    statusInProgress: string;
    statusCertReady: string;
    statusPursue: string;

    // Cohort list & enroll
    enrolledClassesTitle: string;
    enrolledClassesSubtitle: string;
    noClassesEnrolledTitle: string;
    noClassesEnrolledSubtitle: string;
    enterClassCodeBtn: string;
    cohortActive: string;
    cohortGraduated: string;
    cohortSelected: string;
    curriculumProgress: string;
    viewSyllabus: string;
    joinNewClassTitle: string;
    joinNewClassSubtitle: string;

    // Teacher Bento Metrics & Actions
    metricStudents: string;
    metricRegisteredStudents: string;
    metricQueue: string;
    metricNeedsGrading: string;
    metricAverage: string;
    metricClassAverage: string;
    manageClassesShortcut: string;
    manageClassesDesc: string;
    openGradingPanelBtn: string;
    pendingReviewsCount: string;
    createAnnouncementTitle: string;
    announcementTitlePlaceholder: string;
    announcementMsgPlaceholder: string;
    postAnnouncementBtn: string;
    createNewCourseClassTitle: string;
    createNewCourseClassSubtitle: string;

    // Stream & Modals
    streamTitle: string;
    streamSubtitle: string;
    joinModalTitle: string;
    joinModalDesc: string;
    joinModalBtn: string;
    formIncompleteAlert: string;
    formIncompleteMsg: string;
    announcementSuccessAlert: string;
    joinSuccessAlert: string;
    joinSuccessMsg: string;
    enterClassCodeError: string;
    joinFailedError: string;
  };

  // Syllabus
  syllabus: {
    headerTitle: string;
    headerSubtitle: string;
    gatekeeperBadge: string;
    gatekeeperInfo: string;
    moduleLabel: string;
    moduleGateWarning: string;
    quizLabel: string;
    quizPassRequirement: string;
    takeQuizBtn: string;
    assignmentLabel: string;
    viewAssignmentBtn: string;
    lessonLabel: string;
    lessonLockedAlertTitle: string;
    lessonLockedAlertMsg: string;
    quizLockedAlertTitle: string;
    quizLockedAlertMsg: string;
    assignmentLockedAlertTitle: string;
    assignmentLockedMod2AlertMsg: string;
    assignmentLockedAlertMsg: string;
    lessonCompletedAlertTitle: string;
    lessonCompletedAlertMsg: string;
    quizAttentionTitle: string;
    quizAttentionAnswerAll: string;
    quizPassedAlertTitle: string;
    quizPassedAlertMsg: string;
    assignmentSubmittedSuccessTitle: string;
    assignmentSubmittedSuccessMsg: string;
    fillAssignmentPrompt: string;
    addLessonBtn: string;
    addModuleBtn: string;
    addAssignmentBtn: string;
    modalAddLessonTitle: string;
    modalAddModuleTitle: string;
    modalAddAssignmentTitle: string;
    modalEditDueDateTitle: string;
    editDueDateBtn: string;
    deleteItemConfirmTitle: string;
    deleteItemConfirmMsg: string;
    selectBatchPlaceholder: string;
  };

  // Lesson Viewer
  lesson: {
    lessonNotFound: string;
    markAsCompleted: string;
    completedBadge: string;
    nextLessonBtn: string;
    takeModuleQuizBtn: string;
    copyCode: string;
    codeCopied: string;
    videoPlayerTitle: string;
    resourcesTitle: string;
  };

  // Quiz
  quiz: {
    quizTitle: string;
    questionProgress: string;
    submitQuizBtn: string;
    nextQuestionBtn: string;
    passedTitle: string;
    passedDesc: string;
    failedTitle: string;
    failedDesc: string;
    scoreSummary: string;
    passingScoreNote: string;
    retakeBtn: string;
    continueSyllabusBtn: string;
    quizLockedTitle: string;
    quizLockedDesc: string;
  };

  // Assignment & Grading
  assignment: {
    assignmentTitle: string;
    dueDeadline: string;
    instructionsTitle: string;
    submissionFormTitle: string;
    repoUrlLabel: string;
    repoUrlPlaceholder: string;
    notesLabel: string;
    notesPlaceholder: string;
    submitBtn: string;
    resubmitBtn: string;
    submittedStatus: string;
    gradedStatus: string;
    revisionRequiredStatus: string;
    instructorFeedbackTitle: string;
    gradeScore: string;
    gradingQueueTitle: string;
    gradingQueueSubtitle: string;
    noSubmissions: string;
    gradeInputPlaceholder: string;
    feedbackInputPlaceholder: string;
    saveGradeBtn: string;
    requestRevisionBtn: string;
    exportCsvBtn: string;
    studentName: string;
    dateSubmitted: string;
    allBatchesFilter: string;
    filterByBatch: string;
    gradeSavedSuccess: string;
    revisionRequestedSuccess: string;
    downloadCsvSuccess: string;
    copiedCsvSuccess: string;
  };

  // Profile & Graduation
  profile: {
    headerTitle: string;
    headerSubtitle: string;
    officialNameTitle: string;
    officialNameDesc: string;
    officialNamePlaceholder: string;
    saveNameBtn: string;
    nameSavedSuccess: string;
    nameRequiredError: string;
    graduationGateTitle: string;
    graduationGateDesc: string;
    weightedFormula: string;
    materialWeight: string;
    quizWeight: string;
    assignmentWeight: string;
    finalCompositeGrade: string;
    graduationStatusEligible: string;
    graduationStatusPending: string;
    claimCertificateBtn: string;
    certificateClaimedSuccess: string;
    certificateTitle: string;
    certificateSubtitle: string;
    certIdLabel: string;
    certDateLabel: string;
    certVerifiedBy: string;
    certStandard: string;
    teacherClassManagerTitle: string;
    teacherClassManagerDesc: string;
    openClassManagerBtn: string;
  };

  // Class Manager
  classManager: {
    headerTitle: string;
    headerSubtitle: string;
    createNewClassBtn: string;
    createModalTitle: string;
    editModalTitle: string;
    classNameLabel: string;
    classNamePlaceholder: string;
    descriptionLabel: string;
    descriptionPlaceholder: string;
    capacityLabel: string;
    startDateLabel: string;
    endDateLabel: string;
    categoryLabel: string;
    levelLabel: string;
    classCodeGenerated: string;
    copyCodeBtn: string;
    saveClassBtn: string;
    closeClassBtn: string;
    reopenClassBtn: string;
    activeCohortBadge: string;
    closedCohortBadge: string;
    enrolledCount: string;
    tabMyClasses: string;
    tabCreateClass: string;
    createSuccessAlert: string;
    editSuccessAlert: string;
  };

  // Notifications Modal
  notifications: {
    modalTitle: string;
    modalSubtitle: string;
    markAllRead: string;
    noNotifications: string;
    allTab: string;
    unreadTab: string;
    gradeType: string;
    revisionType: string;
    announcementType: string;
    systemType: string;
    timeJustNow: string;
    timeMinutesAgo: string;
    timeHoursAgo: string;
    timeYesterday: string;
    timeDaysAgo: string;
  };

  // Feature Tour Modal
  tour: {
    stepIndicator: string;
    skipTour: string;
    nextBtn: string;
    prevBtn: string;
    finishBtn: string;
    clientTestingTipsTitle: string;
    step1Tag: string;
    step1Title: string;
    step1Subtitle: string;
    step1Desc: string;
    step1Feature1Title: string;
    step1Feature1Desc: string;
    step1Feature2Title: string;
    step1Feature2Desc: string;
    step1Tip1: string;
    step1Tip2: string;
    step1Action: string;

    step2Tag: string;
    step2Title: string;
    step2Subtitle: string;
    step2Desc: string;
    step2Feature1Title: string;
    step2Feature1Desc: string;
    step2Feature2Title: string;
    step2Feature2Desc: string;
    step2Tip1: string;
    step2Tip2: string;
    step2Action: string;

    step3Tag: string;
    step3Title: string;
    step3Subtitle: string;
    step3Desc: string;
    step3Feature1Title: string;
    step3Feature1Desc: string;
    step3Feature2Title: string;
    step3Feature2Desc: string;
    step3Tip1: string;
    step3Tip2: string;
    step3Action: string;

    step4Tag: string;
    step4Title: string;
    step4Subtitle: string;
    step4Desc: string;
    step4Feature1Title: string;
    step4Feature1Desc: string;
    step4Feature2Title: string;
    step4Feature2Desc: string;
    step4Tip1: string;
    step4Tip2: string;
    step4Action: string;

    step5Tag: string;
    step5Title: string;
    step5Subtitle: string;
    step5Desc: string;
    step5Feature1Title: string;
    step5Feature1Desc: string;
    step5Feature2Title: string;
    step5Feature2Desc: string;
    step5Tip1: string;
    step5Tip2: string;
    step5Action: string;

    step6Tag: string;
    step6Title: string;
    step6Subtitle: string;
    step6Desc: string;
    step6Feature1Title: string;
    step6Feature1Desc: string;
    step6Feature2Title: string;
    step6Feature2Desc: string;
    step6Tip1: string;
    step6Tip2: string;
    step6Action: string;
  };

  // Settings Screen
  settings: {
    headerTitle: string;
    headerSubtitle: string;
    languageSectionTitle: string;
    languageSectionDesc: string;
    langEnglish: string;
    langEnglishDesc: string;
    langLocale: string;
    langLocaleDesc: string;
    appearanceSectionTitle: string;
    appearanceSectionDesc: string;
    themeSystem: string;
    themeLight: string;
    themeDark: string;
    tactileFeedbackLabel: string;
    tactileFeedbackDesc: string;
    soundEffectsLabel: string;
    soundEffectsDesc: string;
    notificationSectionTitle: string;
    notificationSectionDesc: string;
    notifGradesLabel: string;
    notifGradesDesc: string;
    notifRevisionsLabel: string;
    notifRevisionsDesc: string;
    notifAnnouncementsLabel: string;
    notifAnnouncementsDesc: string;
    notifDeadlinesLabel: string;
    notifDeadlinesDesc: string;
    learningSectionTitle: string;
    learningSectionDesc: string;
    autoAdvanceLabel: string;
    autoAdvanceDesc: string;
    passGradeInfoLabel: string;
    passGradeInfoValue: string;
    certificateSectionTitle: string;
    certificateSectionDesc: string;
    officialNameLabel: string;
    officialNamePlaceholder: string;
    saveOfficialNameBtn: string;
    demoSectionTitle: string;
    demoSectionDesc: string;
    replayTourBtn: string;
    replayTourDesc: string;
    resetDemoBtn: string;
    resetDemoDesc: string;
    exportGradebookBtn: string;
    exportGradebookDesc: string;
    aboutSectionTitle: string;
    aboutAppName: string;
    aboutVersion: string;
    aboutStandard: string;
    aboutArchitecture: string;
    aboutArchitectureDesc: string;
  };

  // Auth (Login & Register)
  auth: {
    loginTitle: string;
    loginSubtitle: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    loginBtn: string;
    registerLink: string;
    createAccountBtn: string;
    registerTitle: string;
    registerSubtitle: string;
    fullNameLabel: string;
    fullNamePlaceholder: string;
    roleSelectLabel: string;
    registerSubmitBtn: string;
    alreadyHaveAccount: string;
    demoQuickLoginTitle: string;
    demoBudiDesc: string;
    demoAlexDesc: string;
    demoHint: string;
    tourCardBadge: string;
    tourCardTitle: string;
    tourCardDesc: string;
  };
}
