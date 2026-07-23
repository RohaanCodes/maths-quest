import {
  World,
  Challenge,
  Student,
  StudentProgress,
  ExerciseAttempt,
  StudentApiResponse,
  ExerciseQuestion
} from '../types';

import {
  MOCK_WORLDS,
  MOCK_CHALLENGES,
  MOCK_STUDENT_PROGRESS,
} from './mock-data';

export const DEFAULT_DEMO_STUDENT: Student = {
  id: 'student-demo',
  name: 'Explorer',
  email: 'explorer@quest.com',
  rank: 'Novice',
  xp: 0,
  tokens: 0,
  level: 1,
  avatarUrl: '/avatars/profile.png',};

/*
|--------------------------------------------------------------------------
| Local storage helpers
|--------------------------------------------------------------------------
*/

 

 

 

/*
|--------------------------------------------------------------------------
| API helpers
|--------------------------------------------------------------------------
*/

function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return '';
  }

  if (process.env.APP_URL) {
    return process.env.APP_URL.endsWith('/')
      ? process.env.APP_URL.slice(0, -1)
      : process.env.APP_URL;
  }

  return 'http://localhost:3000';
}

function normalizeWorldId(worldId: string): string {
  return worldId.startsWith('world-')
    ? worldId
    : `world-${worldId}`;
}

/*
|--------------------------------------------------------------------------
| Worlds
|--------------------------------------------------------------------------
*/

export async function getWorlds(): Promise<World[]> {
  

  const progress = await getStudentProgress();
  const completedChallengeIds =
    progress.completedChallengeIds || [];

  try {
    const baseUrl = getBaseUrl();

    const [worldsResponse, challengesResponse] =
      await Promise.all([
        fetch(`${baseUrl}/api/worlds`, {
          cache: 'no-store',
        }),
        fetch(`${baseUrl}/api/challenges`, {
          cache: 'no-store',
        }),
      ]);
if (!worldsResponse.ok || !challengesResponse.ok) {
  throw new Error(
    `World API: ${worldsResponse.status}, Challenge API: ${challengesResponse.status}`,
  );
}

    const rawWorlds =
      (await worldsResponse.json()) as World[];

    const rawChallenges =
      (await challengesResponse.json()) as Challenge[];

    let previousWorldCompleted = true;

    return rawWorlds.map((world) => {
      const worldChallenges = rawChallenges.filter(
        (challenge) => challenge.worldId === world.id,
      );

      const totalCount = worldChallenges.length;

      const completedCount = worldChallenges.filter(
        (challenge) =>
          completedChallengeIds.includes(challenge.id),
      ).length;

      const completionPercentage =
        totalCount > 0
          ? Math.round((completedCount / totalCount) * 100)
          : 0;

      let status: World['status'] = 'locked';

      if (totalCount === 0) {
        status = previousWorldCompleted
          ? 'current'
          : 'locked';

        if (status === 'current') {
          previousWorldCompleted = false;
        }
      } else if (completedCount === totalCount) {
        status = 'completed';
      } else if (previousWorldCompleted) {
        status = 'current';
        previousWorldCompleted = false;
      }

      const currentChallenge = worldChallenges.find(
        (challenge) =>
          !completedChallengeIds.includes(challenge.id),
      );

      return {
        ...world,
        completionPercentage,
        status,
        currentQuestId: currentChallenge?.id,
        currentQuestName: currentChallenge?.name ?? 'None',
      };
    });
 } catch (error) {
  console.error(
    'Failed to fetch worlds and challenges:',
    error,
  );

  return [];
}
}

export async function getWorldByDomain(
  worldIdOrDomain: string,
): Promise<World | undefined> {
  const worlds = await getWorlds();

  const normalizedWorldId =
    normalizeWorldId(worldIdOrDomain);

  return worlds.find(
    (world) =>
      world.id === normalizedWorldId ||
      world.id === worldIdOrDomain ||
      world.domain === worldIdOrDomain,
  );
}

/*
|--------------------------------------------------------------------------
| Challenges
|--------------------------------------------------------------------------
*/

export async function getChallengesByWorld(
  worldId: string,
): Promise<Challenge[]> {
  

  const progress = await getStudentProgress();

  const completedChallengeIds =
    progress.completedChallengeIds || [];

  const normalizedWorldId = normalizeWorldId(worldId);

  try {
    const baseUrl = getBaseUrl();

    /*
     * URLSearchParams handles encoding once.
     * Do not use encodeURIComponent around worldId.
     */
    const searchParams = new URLSearchParams({
      worldId: normalizedWorldId,
    });

    const response = await fetch(
      `${baseUrl}/api/challenges?${searchParams.toString()}`,
      {
        cache: 'no-store',
      },
    );

  if (!response.ok) {
  throw new Error(
    `Challenge API returned ${response.status}`,
  );
}

    const rawChallenges =
      (await response.json()) as Challenge[];

    let currentChallengeFound = false;

    return rawChallenges.map((challenge) => {
      const isCompleted =
        completedChallengeIds.includes(challenge.id);

      let status: Challenge['status'] = 'locked';

      if (isCompleted) {
        status = 'completed';
      } else if (!currentChallengeFound) {
        status = 'current';
        currentChallengeFound = true;
      }

      return {
        ...challenge,
        status,
      };
    });
  } catch (error) {
  console.error(
    'Failed to fetch challenges for world:',
    error,
  );

  return [];
}
}

export async function getChallengeById(
  id: string,
): Promise<Challenge | undefined> {
   

  let rawChallenge: Challenge | undefined;

  try {
    const baseUrl = getBaseUrl();

    const searchParams = new URLSearchParams({
      challengeId: id,
    });

    const response = await fetch(
      `${baseUrl}/api/challenges?${searchParams.toString()}`,
      {
        cache: 'no-store',
      },
    );

    if (response.ok) {
      rawChallenge =
        (await response.json()) as Challenge;
    }
  } catch (error) {
    console.warn(
      'Failed to fetch challenge by ID:',
      error,
    );
  }

  if (!rawChallenge) {
  return undefined;
}

  const worldChallenges = await getChallengesByWorld(
    rawChallenge.worldId,
  );

  return (
    worldChallenges.find(
      (challenge) => challenge.id === id,
    ) ?? rawChallenge
  );
}

/*
|--------------------------------------------------------------------------
| Demo student
|--------------------------------------------------------------------------
*/

export async function getStudentApiData(): Promise<StudentApiResponse> {
  const baseUrl = getBaseUrl();

  const response = await fetch(
    `${baseUrl}/api/student`,
    {
      cache: 'no-store',
    },
  );

  if (!response.ok) {
    let errorMessage =
      'Unable to load student data.';

    try {
      const errorBody =
        (await response.json()) as {
          error?: string;
        };

      if (errorBody.error) {
        errorMessage = errorBody.error;
      }
    } catch {
      // Keep default message.
    }

    throw new Error(errorMessage);
  }

  return (
    await response.json()
  ) as StudentApiResponse;
}

export async function getCurrentStudent(): Promise<Student> {
  try {
    const data =
       await getStudentApiData();

    return {
      id: data.student.id,
      name: data.student.name,
      email: data.student.email,
      rank: data.student.rank,
      xp: data.student.xp,
      tokens: data.student.tokens,
      level: data.student.level,

      // Keep the existing avatar until an Avatar field
      // is added to the Students table.
      avatarUrl:
        DEFAULT_DEMO_STUDENT.avatarUrl,
    };
  } catch (error) {
    console.warn(
      'Failed to load student from Airtable. Using temporary fallback:',
      error,
    );

    return DEFAULT_DEMO_STUDENT;
  }
}

export async function getStudent(): Promise<Student> {
  return getCurrentStudent();
}

export async function getStudentProgress(): Promise<StudentProgress> {
  try {
    const data =
      await getStudentApiData();

    const completedChallengeIds =
      data.progress
        .filter(
          (item) =>
            item.status === 'Completed',
        )
        .map(
          (item) =>
            item.lessonRecordId,
        );

    const unlockedWorldIds =
      Array.from(
        new Set(
          data.progress
            .filter(
              (item) =>
                item.status === 'Unlocked' ||
                item.status === 'Completed',
            )
            .map(
              (item) =>
                item.worldId,
            )
            .filter(Boolean),
        ),
      );

    return {
      studentId:
        data.student.id,

      completedChallengeIds,

      unlockedWorldIds,

      // These are not stored in Airtable yet,
      // so keep safe defaults temporarily.
      activeStreak: 0,

      dailyGoalProgress:
        Math.min(
          data.stats.completedLessons,
          1,
        ),

      dailyGoalMax: 1,

      earnedBadges: [],
    };
} catch (error) {
  console.error(
    'Failed to load progress from Airtable:',
    error,
  );

  return {
    studentId: DEFAULT_DEMO_STUDENT.id,
    completedChallengeIds: [],
    unlockedWorldIds: [],
    activeStreak: 0,
    dailyGoalProgress: 0,
    dailyGoalMax: 1,
    earnedBadges: [],
  };
}}

/*
|--------------------------------------------------------------------------
| Exercise scoring
|--------------------------------------------------------------------------
*/

export async function submitChallengeAnswers(
  challengeId: string,
  answers: Record<string, string>,
): Promise<ExerciseAttempt> {
   

  const challenge =
    await getChallengeById(challengeId);

  if (!challenge) {
    throw new Error('Challenge not found');
  }

  /*
   * Grade each question using correctAnswer
   * and acceptedAnswers.
   */
  const results = challenge.questions.map(
    (question) => {
const studentAnswer =
  answers[question.id] || '';

const normalizedStudentAnswer =
  normalizeAnswerForQuestion(
    studentAnswer,
    question,
  );

const acceptedAnswers = [
  question.correctAnswer,
  ...(question.acceptedAnswers || []),
]
  .map((answer) =>
    normalizeAnswerForQuestion(
      String(answer),
      question,
    ),
  )
  .filter(Boolean);

const isCorrect =
  acceptedAnswers.includes(
    normalizedStudentAnswer,
  );

      return {
        questionId: question.id,
        studentAnswer,
        correctAnswer:
          question.correctAnswer,
        isCorrect,
        explanation:
          question.explanation || '',
        pointsEarned: isCorrect
          ? question.points
          : 0,
        maxPoints: question.points,
      };
    },
  );

  const score = results.filter(
    (result) => result.isCorrect,
  ).length;

  const maxScore =
    challenge.questions.length;

  const pointsEarned = results.reduce(
    (total, result) =>
      total + result.pointsEarned,
    0,
  );

  const totalPoints = results.reduce(
    (total, result) =>
      total + result.maxPoints,
    0,
  );

  const scorePercentage =
    maxScore > 0
      ? score / maxScore
      : 0;

  /*
   * Temporary passing rule:
   * the student must answer at least 50%
   * of the questions correctly.
   */
  const passed =
    scorePercentage >= 0.5;

  const xpGained =
    pointsEarned +
    (score === maxScore
      ? challenge.bonusXp
      : 0);

  const gemsGained =
    score === maxScore
      ? 15
      : passed
        ? 5
        : 0;

  const attempt: ExerciseAttempt = {
    id: `attempt-${Date.now()}`,
    studentId: DEFAULT_DEMO_STUDENT.id,
    challengeId,
    answers,
    score,
    maxScore,
    pointsEarned,
    totalPoints,
    xpGained,
    gemsGained,
    results,
    timestamp:
      new Date().toISOString(),
  };

  /*
   * Save the permanent attempt and progress
   * updates to Airtable.
   */
  const baseUrl = getBaseUrl();

  const response = await fetch(
    `${baseUrl}/api/submit-attempt`,
    {
      method: 'POST',

      headers: {
        'Content-Type':
          'application/json',
      },

      body: JSON.stringify({
        challengeId,
        score,
        maxScore,
        pointsEarned,
        totalPoints,
        xpGained,
        gemsGained,
        answers,
        results,
        passed,
      }),

      cache: 'no-store',
    },
  );

  if (!response.ok) {
    let errorMessage =
      'The attempt could not be saved.';

    try {
      const errorResponse =
        (await response.json()) as {
          error?: string;
        };

      if (errorResponse.error) {
        errorMessage =
          errorResponse.error;
      }
    } catch {
      // Keep the default message.
    }

    throw new Error(errorMessage);
  }

  /*
 * Airtable has already saved the attempt,
 * updated progress and unlocked the next lesson.
 * Notify the UI to fetch the latest Airtable data.
 */

  /*
   * Let client components refresh progress.
   */
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new Event(
        'student-progress-updated',
      ),
    );
  }

  return attempt;
}



 


function normalizeAnswerText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[−–—]/g, '-')
    .replace(/[×✕xX]/g, '*')
    .replace(/÷/g, '/')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, ' ');
}

function normalizeCompactAnswer(value: string): string {
  return normalizeAnswerText(value).replace(
    /\s*([+\-*/=(),[\]{}])\s*/g,
    '$1',
  ).replace(/(\d)\(/g, '$1*(');
}

function normalizeNumericAnswer(value: string): string {
  return normalizeCompactAnswer(value)
    .replace(/,/g, '')
    .replace(/\.0+$/, '');
}

function normalizeBooleanAnswer(value: string): string {
  const normalized = normalizeAnswerText(value);

  if (['true', 't', 'yes', 'y'].includes(normalized)) {
    return 'true';
  }

  if (['false', 'f', 'no', 'n'].includes(normalized)) {
    return 'false';
  }

  return normalized;
}

function normalizeAnswerForQuestion(
  value: string,
  question: ExerciseQuestion,
): string {
  switch (question.type) {
    case 'numeric':
    case 'decimal':
      return normalizeNumericAnswer(value);

    case 'fraction':
      return normalizeCompactAnswer(value);

    case 'true-false':
      return normalizeBooleanAnswer(value);

    case 'multiple-choice':
    case 'short-text':
    case 'open-ended':
    default:
      return normalizeAnswerText(value);
  }
}