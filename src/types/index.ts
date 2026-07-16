export type ExerciseQuestionType =
  | 'numeric'
  | 'fraction'
  | 'decimal'
  | 'true-false'
  | 'multiple-choice'
  | 'short-text'
  | 'open-ended';


  export type ExerciseDifficulty =
  | 'easy'
  | 'medium'
  | 'hard';


export interface MathConcept {
  id: string;
  name: string;
  description: string;
  formula?: string;
  exampleQuestion?: string;
  exampleSolution?: string;
}

export interface World {
  id: string;
  name: string;
  description: string;
  domain: string; // e.g. "operations", "fractions", "decimals"
  status: 'completed' | 'current' | 'locked';
  completionPercentage: number;
  bannerUrl: string;
  region: string; // e.g. "Region 1: The Grasslands"
  currentQuestName?: string;
  currentQuestId?: string;
  mapX?: number; // percentage on map for positioning
  mapY?: number;
}

export interface LessonStep {
  id: string;
  type: 'intro' | 'learn' | 'example' | 'video' | 'practice';
  title: string;
  content: string;
  wizardText?: string;
  wizardMood?: string;
  videoUrl?: string; // For video step
  workedExample?: {
    steps: { number: number; expression: string; explanation: string }[];
    ahaMoment: string;
    ruleOfBalance?: string;
    mentalTrick?: string;
  };
}

export interface Challenge {
  id: string;
  name: string;
  worldId: string;
  description: string;
  difficulty: 'Beginner' | 'Apprentice' | 'Heroic' | 'Legendary';
  estimatedTime: string;
  status: 'completed' | 'current' | 'locked';
  xpReward: number;
  bonusXp: number;
  badge?: {
    name: string;
    icon: string;
    description: string;
    image?: string;
  };
  requirements: string[];
  steps: LessonStep[];
  questions: ExerciseQuestion[];
}

export interface Student {
  id: string;
  name: string;
  email: string;
  rank: string;
  xp: number;
  tokens: number;
  level: number;
  avatarUrl: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  image: string;
  type: string;
}

export interface StudentProgress {
  studentId: string;
  completedChallengeIds: string[];
  unlockedWorldIds: string[];
  activeStreak: number;
  dailyGoalProgress: number;
  dailyGoalMax: number;
  earnedBadges: Badge[];
}

export interface AirtableLessonProgress {
  recordId: string;
  studentRecordId: string;
  lessonRecordId: string;

  status:
    | 'Locked'
    | 'Unlocked'
    | 'Completed';

  attempts: number;
  bestScore: number;
  latestScore: number;

  completedDate?: string;
  lastAttemptDate?: string;
  unlockedDate?: string;

  lessonOrder: number;
  totalPointsEarned: number;
  worldId: string;
}

export interface StudentStats {
  totalLessons: number;
  completedLessons: number;
  unlockedLessons: number;
  totalAttempts: number;
  totalPointsEarned: number;
  bestScore: number;
  completionPercentage: number;

  currentLessonRecordId?: string;
  currentWorldId?: string;
}

export interface StudentApiResponse {
  student: {
    id: string;
    recordId: string;
    name: string;
    email: string;
    xp: number;
    level: number;
    rank: string;
    tokens: number;
  };

  progress: AirtableLessonProgress[];
  stats: StudentStats;
}

export interface ExerciseQuestion {
  id: string;
  challengeId: string;

  number: number;
  questionText: string;
  type: ExerciseQuestionType;
  difficulty: ExerciseDifficulty;

  correctAnswer: string;
  acceptedAnswers: string[];

  points: number;
  explanation: string;

  // Used only when the original question provides choices.
  options?: string[];

  hint?: string;
}

export interface ExerciseQuestionResult {
  questionId: string;
  studentAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
  pointsEarned: number;
  maxPoints: number;
}


export interface ExerciseAttempt {
  id: string;
  studentId: string;
  challengeId: string;

  answers: Record<string, string>;

  score: number;
  maxScore: number;

  pointsEarned: number;
  totalPoints: number;

  xpGained: number;
  gemsGained: number;

  results: ExerciseQuestionResult[];

  timestamp: string;
}


