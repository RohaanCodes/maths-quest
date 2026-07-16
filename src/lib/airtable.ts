import "server-only";
import { World, Challenge, LessonStep, ExerciseQuestion } from "../types";
import { MOCK_WORLDS, MOCK_CHALLENGES } from "./mock-data";

// Helper to access fields with flexible case-insensitivity and whitespace handling
function getField<T = any>(fields: any, ...keys: string[]): T | undefined {
  if (!fields) return undefined;
  for (const key of keys) {
    if (fields[key] !== undefined) return fields[key] as T;
    // Check case-insensitively
    const lowerKey = key.toLowerCase().replace(/[^a-z0-9]/g, "");
    for (const fKey of Object.keys(fields)) {
      const normalizedFKey = fKey.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (normalizedFKey === lowerKey) {
        return fields[fKey] as T;
      }
    }
  }
  return undefined;
}

function slugifyDomain(domain: string): string {
  return domain
    .toLowerCase()
    .trim()
    .replace(/[—–]/g, "-")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Resilient parsing of worked example text into steps
function parseWorkedExampleSteps(
  rawText: string,
): { number: number; expression: string; explanation: string }[] {
  if (!rawText) {
    return [
      {
        number: 1,
        expression: "X + A = B",
        explanation:
          "Follow the guidelines to balance the equation and find the unknown value.",
      },
    ];
  }

  // Split by newlines or paragraphs and clean up
  const segments = rawText
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const steps: { number: number; expression: string; explanation: string }[] =
    [];
  let stepNum = 1;

  segments.forEach((segment) => {
    // If it starts with step numbers like "1.", "Step 1:", skip or clean it
    const cleanSegment = segment
      .replace(/^(?:step\s*)?\d+[\s.:-]*|^\*+|^\-+/i, "")
      .trim();

    if (cleanSegment.includes("=")) {
      // It has an equation, let's isolate it
      const parts = cleanSegment.split("=");
      const expression = parts[0].trim() + " = " + parts[1].trim();
      steps.push({
        number: stepNum++,
        expression,
        explanation: cleanSegment,
      });
    } else {
      steps.push({
        number: stepNum++,
        expression:
          cleanSegment.substring(0, Math.min(30, cleanSegment.length)) + "...",
        explanation: cleanSegment,
      });
    }
  });

  // Fallback if no steps were parsed
  if (steps.length === 0) {
    steps.push({
      number: 1,
      expression: "Worked Example",
      explanation: rawText,
    });
  }

  return steps;
}

// Resilient parsing of AI-generated Challenge JSON string
interface AIGeneratedChallenge {
  challengeTitle: string;
  challengeIntroduction: string;
  challengeObjective: string;
  challengeSuccessMessage: string;
}

function parseAIGeneratedChallenge(
  rawValue: unknown,
  fallbackTitle: string,
): AIGeneratedChallenge {
  const fallback: AIGeneratedChallenge = {
    challengeTitle: fallbackTitle || "Secret Cipher Vault",
    challengeIntroduction:
      "A new mathematical challenge is waiting. Complete the lesson to continue your adventure!",
    challengeObjective: `Master ${fallbackTitle || "this math concept"} and complete the exercises.`,
    challengeSuccessMessage:
      "Mission complete! You have unlocked the next part of your adventure.",
  };

  if (rawValue === null || rawValue === undefined || rawValue === "") {
    return fallback;
  }

  try {
    let parsed: Record<string, unknown>;

    // Airtable may return the AI field as an object instead of text.
    if (typeof rawValue === "object" && !Array.isArray(rawValue)) {
      const objectValue = rawValue as Record<string, unknown>;

      // Some Airtable AI fields may wrap the result inside "value".
      if (typeof objectValue.value === "string") {
        let cleanJson = objectValue.value
          .replace(/^```json\s*/i, "")
          .replace(/^```\s*/i, "")
          .replace(/\s*```$/i, "")
          .trim();

        parsed = JSON.parse(cleanJson) as Record<string, unknown>;
      } else {
        parsed = objectValue;
      }
    } else {
      let cleanJson = String(rawValue)
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      parsed = JSON.parse(cleanJson) as Record<string, unknown>;
    }

    const readString = (...keys: string[]): string | undefined => {
      for (const key of keys) {
        const value = parsed[key];

        if (typeof value === "string" && value.trim()) {
          return value.trim();
        }
      }

      return undefined;
    };

    return {
      challengeTitle:
        readString("challengeTitle", "title") ?? fallback.challengeTitle,

      challengeIntroduction:
        readString("challengeIntroduction", "introduction", "intro") ??
        fallback.challengeIntroduction,

      challengeObjective:
        readString("challengeObjective", "objective") ??
        fallback.challengeObjective,

      challengeSuccessMessage:
        readString("challengeSuccessMessage", "successMessage") ??
        fallback.challengeSuccessMessage,
    };
  } catch (error) {
    console.warn(
      "Failed to parse AI-generated Challenge from Airtable:",
      error,
      rawValue,
    );

    return fallback;
  }
}

// Fetch all records from Airtable using REST API with pagination support
export async function fetchAirtableRecords(): Promise<any[]> {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = process.env.AIRTABLE_CONCEPTS_TABLE || "Concepts";

  if (!apiKey || !baseId) {
    console.warn(
      "Airtable credentials (AIRTABLE_API_KEY, AIRTABLE_BASE_ID) are missing. Falling back to mock data.",
    );
    return [];
  }

  let records: any[] = [];
  let offset: string | undefined = undefined;

  try {
    do {
      const url = new URL(
        `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`,
      );
      if (offset) {
        url.searchParams.set("offset", offset);
      }

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
        },
        next: { revalidate: 0 }, // Live fetching of challenges
      } as any);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Airtable API error (${response.status}): ${errorText}`,
        );
      }

      const data = await response.json();
      if (data.records) {
        records = records.concat(data.records);
      }
      offset = data.offset;
    } while (offset);

    // Sort records ascending by Order field
    records.sort((a, b) => {
      const orderA = getField<number>(a.fields, "Order") ?? 999;
      const orderB = getField<number>(b.fields, "Order") ?? 999;
      return orderA - orderB;
    });

    return records;
  } catch (error) {
    console.error("Error fetching data from Airtable REST API:", error);
    return [];
  }
}

interface AirtableExerciseQuestion {
  number?: number;
  question?: string;
  type?: string;
  difficulty?: string;
  points?: number;
  correctAnswer?: string;
  acceptedAnswers?: string[];
  explanation?: string;
  options?: string[];
}

interface AirtableExercisePayload {
  questions?: AirtableExerciseQuestion[];
}

function cleanExerciseJson(rawValue: unknown): string {
  if (typeof rawValue === "string") {
    return rawValue
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
  }

  if (rawValue && typeof rawValue === "object" && !Array.isArray(rawValue)) {
    const objectValue = rawValue as Record<string, unknown>;

    if (typeof objectValue.value === "string") {
      return objectValue.value
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();
    }

    return JSON.stringify(objectValue);
  }

  return "";
}

function normalizeExerciseType(
  value: string | undefined,
): ExerciseQuestion["type"] {
  const normalized = (value || "").toLowerCase().trim();

  if (normalized === "numeric") return "numeric";
  if (normalized === "fraction") return "fraction";
  if (normalized === "decimal") return "decimal";

  if (
    normalized === "true-false" ||
    normalized === "true/false" ||
    normalized === "boolean"
  ) {
    return "true-false";
  }

  if (
    normalized === "multiple-choice" ||
    normalized === "multiple choice" ||
    normalized === "mcq"
  ) {
    return "multiple-choice";
  }

  if (normalized === "open-ended" || normalized === "open ended") {
    return "open-ended";
  }

  return "short-text";
}

function normalizeExerciseDifficulty(
  value: string | undefined,
): ExerciseQuestion["difficulty"] {
  const normalized = (value || "").toLowerCase().trim();

  if (normalized === "hard") return "hard";
  if (normalized === "medium") return "medium";

  return "easy";
}
function extractExercisePayload(
  rawValue: unknown,
): AirtableExercisePayload | null {
  if (rawValue === null || rawValue === undefined) {
    return null;
  }

  /*
   * Handle JSON text.
   */
  if (typeof rawValue === "string") {
    const cleanText = rawValue
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    if (!cleanText) {
      return null;
    }

    try {
      const parsed = JSON.parse(cleanText);

      return extractExercisePayload(parsed);
    } catch {
      return null;
    }
  }

  /*
   * Ignore primitive values.
   */
  if (typeof rawValue !== "object") {
    return null;
  }

  /*
   * Handle an array.
   *
   * Airtable may return:
   * [
   *   { number: 1, question: "..." },
   *   { number: 2, question: "..." }
   * ]
   */
  if (Array.isArray(rawValue)) {
    if (rawValue.length === 0) {
      return null;
    }

    const looksLikeQuestionArray = rawValue.every(
      (item) =>
        item &&
        typeof item === "object" &&
        !Array.isArray(item) &&
        ("question" in item || "correctAnswer" in item || "number" in item),
    );

    if (looksLikeQuestionArray) {
      return {
        questions: rawValue as AirtableExerciseQuestion[],
      };
    }

    /*
     * Search recursively through array items.
     */
    for (const item of rawValue) {
      const extracted = extractExercisePayload(item);

      if (extracted) {
        return extracted;
      }
    }

    return null;
  }

  const objectValue = rawValue as Record<string, unknown>;

  /*
   * Direct expected structure:
   *
   * {
   *   questions: [...]
   * }
   */
  if (Array.isArray(objectValue.questions)) {
    return {
      questions: objectValue.questions as AirtableExerciseQuestion[],
    };
  }

  /*
   * Airtable AI Agent field:
   *
   * {
   *   state: "...",
   *   value: {...},
   *   error: null
   * }
   */
  if ("value" in objectValue) {
    const extractedFromValue = extractExercisePayload(objectValue.value);

    if (extractedFromValue) {
      return extractedFromValue;
    }
  }

  /*
   * Other possible wrappers.
   */
  const wrapperKeys = [
    "output",
    "result",
    "response",
    "content",
    "text",
    "data",
  ];

  for (const key of wrapperKeys) {
    if (key in objectValue) {
      const extracted = extractExercisePayload(objectValue[key]);

      if (extracted) {
        return extracted;
      }
    }
  }

  /*
   * Search all nested properties as a final fallback.
   */
  for (const nestedValue of Object.values(objectValue)) {
    const extracted = extractExercisePayload(nestedValue);

    if (extracted) {
      return extracted;
    }
  }

  return null;
}
function parseExerciseJson(
  rawValue: unknown,
  challengeId: string,
  fallbackQuestion: string,
  fallbackAnswer: string,
): ExerciseQuestion[] {
  try {
    const parsed = extractExercisePayload(rawValue);

    if (
      !parsed ||
      !Array.isArray(parsed.questions) ||
      parsed.questions.length === 0
    ) {
      return [
        {
          id: `q-${challengeId}-1`,
          challengeId,
          number: 1,
          questionText: fallbackQuestion || "Complete this exercise.",
          type: "short-text",
          difficulty: "easy",
          correctAnswer: fallbackAnswer,
          acceptedAnswers: fallbackAnswer ? [fallbackAnswer] : [],
          points: 10,
          explanation: "",
          hint: "Review the worked example before answering.",
        },
      ];
    }

    return parsed.questions.map((item, index) => {
      const correctAnswer = String(item.correctAnswer ?? "").trim();

      const acceptedAnswers = Array.isArray(item.acceptedAnswers)
        ? item.acceptedAnswers
            .map((answer) => String(answer).trim())
            .filter(Boolean)
        : [];

      if (
        correctAnswer &&
        !acceptedAnswers.some(
          (answer) => answer.toLowerCase() === correctAnswer.toLowerCase(),
        )
      ) {
        acceptedAnswers.unshift(correctAnswer);
      }

      const type = normalizeExerciseType(item.type);

      let options: string[] | undefined;

      if (type === "true-false") {
        options = ["True", "False"];
      } else if (type === "multiple-choice" && Array.isArray(item.options)) {
        options = item.options
          .map((option) => String(option).trim())
          .filter(Boolean);
      }

      return {
        id: `q-${challengeId}-${index + 1}`,
        challengeId,
        number: typeof item.number === "number" ? item.number : index + 1,
        questionText:
          String(item.question ?? "").trim() || `Question ${index + 1}`,
        type,
        difficulty: normalizeExerciseDifficulty(item.difficulty),
        correctAnswer,
        acceptedAnswers,
        points: typeof item.points === "number" ? item.points : 10,
        explanation: String(item.explanation ?? "").trim(),
        options,
        hint: "Review the worked example before answering.",
      };
    });
  } catch (error) {
    console.warn(
      `Exercise JSON could not be parsed for challenge ${challengeId}. Using fallback.`,
    );

    return [
      {
        id: `q-${challengeId}-1`,
        challengeId,
        number: 1,
        questionText: fallbackQuestion || "Complete this exercise.",
        type: "short-text",
        difficulty: "easy",
        correctAnswer: fallbackAnswer,
        acceptedAnswers: fallbackAnswer ? [fallbackAnswer] : [],
        points: 10,
        explanation: "",
        hint: "Review the worked example before answering.",
      },
    ];
  }
}
// Convert Airtable raw records into our Challenge and World models
export async function fetchChallengesFromAirtable(): Promise<Challenge[]> {
  const records = await fetchAirtableRecords();
  if (records.length === 0) {
    console.warn(
      "Returning mock challenges due to empty or failed Airtable retrieval.",
    );
    return MOCK_CHALLENGES;
  }

  return records.map((record) => {
    const fields = record.fields;
    const id = record.id;
    const order = getField<number>(fields, "Order") || 1;
    const conceptTitle =
      getField<string>(fields, "Concept Title") || "Math Concept";
    const description = getField<string>(fields, "Description") || "";
    const domainLabel =
      getField<string>(fields, "Domain") ||
      "5.OA — Operations & Algebraic Thinking";

    const domainSlug = slugifyDomain(domainLabel);

    // AI Generated values
    const aiChallengeText = getField<unknown>(fields, "AI-generated Challenge");
    const aiChallenge = parseAIGeneratedChallenge(
      aiChallengeText,
      conceptTitle,
    );

    // Difficulty and estimated times based on order
    const difficulty: Challenge["difficulty"] =
      order <= 2
        ? "Beginner"
        : order === 3
          ? "Apprentice"
          : order === 4
            ? "Heroic"
            : "Legendary";
    const estimatedTime =
      order <= 2
        ? "5 Mins"
        : order === 3
          ? "10 Mins"
          : order === 4
            ? "15 Mins"
            : "20 Mins";

    // Parse the steps
    const steps: LessonStep[] = [];

    // Step 1: Intro Step
    steps.push({
      id: `step-intro-${id}`,
      type: "intro",
      title: aiChallenge.challengeTitle,
      content: aiChallenge.challengeIntroduction,
      wizardText: aiChallenge.challengeObjective,
      wizardMood: "excited",
    });

    // Step 2: Learn step
    const teachResource = getField<string>(fields, "Teach Resource") || "";
    steps.push({
      id: `step-learn-${id}`,
      type: "learn",
      title: `Learn: ${conceptTitle}`,
      content:
        teachResource ||
        description ||
        "Master the formulas and principles of this concept.",
      wizardText: `Welcome to spell school! Let us master the laws of ${conceptTitle} together.`,
      wizardMood: "teaching",
    });

    // Step 3: Worked Example step
    const workedExampleText = getField<string>(fields, "Worked Example") || "";
    const misconceptionsText =
      getField<string>(fields, "Common Misconceptions") || "";
    steps.push({
      id: `step-example-${id}`,
      type: "example",
      title: "Worked Example",
      content:
        "Observe the mystical math wizard solve an equations mystery step-by-step.",
      wizardText:
        "Aha! Let us untangle this magical math formula side-by-side.",
      wizardMood: "abracadabra",
      workedExample: {
        steps: parseWorkedExampleSteps(workedExampleText),
        ahaMoment: "Excellent! The final answer is perfectly isolated!",
        ruleOfBalance:
          "Whatever operation you cast on one side, you MUST cast on the other side!",
        mentalTrick: misconceptionsText
          ? `Watch out! ${misconceptionsText}`
          : "Double-check your solution by plugging it back into the original equation!",
      },
    });

    // Step 4: Video Step (if Teach Link is present)
    // Step 4: Teaching Video
    const teachLink = getField<string>(fields, "Teach Link") || "";

    if (teachLink) {
      steps.push({
        id: `step-teach-video-${id}`,
        type: "video",
        title:
          getField<string>(fields, "Teach Resource") || "Learn the Concept",
        content:
          getField<string>(fields, "Teach Format") ||
          "Watch this lesson video before continuing.",
        wizardText:
          "Watch carefully. This video will help you understand today’s concept.",
        wizardMood: "watching",
        videoUrl: teachLink,
      });
    }

    // Step 5: Practice Video
    const practiceLink = getField<string>(fields, "Practice Link") || "";

    if (practiceLink) {
      steps.push({
        id: `step-practice-video-${id}`,
        type: "video",
        title:
          getField<string>(fields, "Practice Resource") || "Guided Practice",
        content:
          getField<string>(fields, "Practice Format") ||
          "Watch this guided practice before solving the challenge.",
        wizardText:
          "Now watch a few practice examples before trying the mission yourself.",
        wizardMood: "watching",
        videoUrl: practiceLink,
      });
    }

    // Step 5: Practice step
    const practiceResource =
      getField<string>(fields, "Practice Resource") || "";
    steps.push({
      id: `step-practice-${id}`,
      type: "practice",
      title: "Spell Practice",
      content:
        practiceResource ||
        "Test your magic and cast your final spells to open the gate!",
      wizardText:
        getField<string>(fields, "AI Tutor Prompt") ||
        "The cipher keys are charged! It is your turn to solve the puzzle.",
      wizardMood: "challenging",
    });

    // Practice formats

    const exerciseJson = getField<unknown>(fields, "Exercise JSON");

    const dailyExercise = getField<string>(fields, "Daily Exercise") || "";

    const answerKey = getField<string>(fields, "Answer Key") || "";

    const questions = parseExerciseJson(
      exerciseJson,
      id,
      dailyExercise,
      answerKey,
    );

    return {
      id,
      name: conceptTitle,
      worldId: `world-${domainSlug}`,
      description: description || "Master equations and formula ciphers.",
      difficulty,
      estimatedTime,
      status: "locked", // Status gets solved dynamically in data.ts based on player progress
      xpReward: order * 100 + 200,
      bonusXp: order * 5 + 5,
      badge: {
        name: `${conceptTitle} Emblem`,
        icon: "military_tech",
        description: `Awarded for mastering ${conceptTitle}.`,
      },
      requirements: [
        `Level ${order} Explorer`,
        `Concept: ${getField<string>(fields, "Standard Code") || "N/A"}`,
      ],
      steps,
      questions,
    };
  });
}

// Generate unique multiple choice options around a correct answer
function generateMCQOptions(correctAnswer: string): string[] {
  const parsedNum = parseFloat(correctAnswer);
  if (!isNaN(parsedNum)) {
    const num = Math.round(parsedNum);
    const opts = new Set<string>();
    opts.add(correctAnswer);

    const offsets = [-3, -2, -1, 1, 2, 3, 5, 10];
    while (opts.size < 4) {
      const randomOffset = offsets[Math.floor(Math.random() * offsets.length)];
      const candidate = num + randomOffset;
      if (candidate >= 0) {
        opts.add(String(candidate));
      }
    }
    return Array.from(opts).sort((a, b) => parseFloat(a) - parseFloat(b));
  } else {
    return [
      correctAnswer,
      "None of the above",
      "Cannot be determined",
      "Standard Value",
    ];
  }
}

// Fetch Worlds dynamically based on unique Domains in Airtable Concept records
export async function fetchWorldsFromAirtable(): Promise<World[]> {
  const records = await fetchAirtableRecords();

  if (records.length === 0) {
    console.warn(
      "Returning mock worlds due to empty or failed Airtable retrieval.",
    );
    return MOCK_WORLDS;
  }

  // Group records using a safe domain slug.
  const domainsMap = new Map<
    string,
    {
      domainLabel: string;
      records: any[];
    }
  >();

  records.forEach((record) => {
    const domainLabel = (
      getField<string>(record.fields, "Domain") || ""
    ).trim();

    if (!domainLabel) {
      return;
    }

    const domainSlug = slugifyDomain(domainLabel);

    if (!domainsMap.has(domainSlug)) {
      domainsMap.set(domainSlug, {
        domainLabel,
        records: [],
      });
    }

    domainsMap.get(domainSlug)!.records.push(record);
  });

  const domainEntries = Array.from(domainsMap.entries());

  if (domainEntries.length === 0) {
    return MOCK_WORLDS;
  }

  // Keep Airtable curriculum order.
  domainEntries.sort(([, firstGroup], [, secondGroup]) => {
    const firstOrder =
      getField<number>(firstGroup.records[0]?.fields, "Order") ?? 999;

    const secondOrder =
      getField<number>(secondGroup.records[0]?.fields, "Order") ?? 999;

    return firstOrder - secondOrder;
  });

  const banners: Record<string, string> = {
    "5-oa-operations-and-algebraic-thinking":
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAHMKj5zBFlQaUdrAiDjdOLW1j37reKdWaWGyhprWGDbIBHFmo9qywx-0hBf1kKdGmhSiOQnIxituFi2MwA5KHCVddsJwS4SjDw8j9VrRGJsQ9UIRKb1cVz5SlFsauH2WkNBLymQoqTu78NUy7iZfSLEBMYsXK3e9SkCKV69__BtYPoChPwhx8swTL1-0J_BskwSy6ySyQR4_tbnKTpf9EUouiUUazfhNFbp7Q0igTn37uHylQpPwIL",

    "5-nf-number-and-operations-fractions":
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA9awSXO61y9GdaWSe-kdtNfWDytHqjALfE-txVFUm3Dw2UsxeNF2vUa973ptMY2k-RSU2Xr9Gg7fKfUz1ljDLV8uRuLFduAWR8JMAXda_Cjf5PnxKfH37Cl_bLTOoTvxClED4yylAV2MgMpCawi4dr-Numphk8cjvyWVVv6UVqAQEHVP0_GK631Lu10eDag_5xOptR9-FsXgN9swIp3EXO8inXGS99n6WlzbG3fUgeCzbtwPpamosj",

    "5-nbt-number-and-operations-in-base-ten":
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBYCqjLhTTs0e0U4okTqtsHBDkIHcRO7fxi0V2Q8F8oGbfnlyz0KT0bVq1T2chiEfhvrn4F6J_6kcF8uvkbutl165Wg--juedwpCx1hlBYKSth20IEiQjTkpdNyDKRPDCO3nH6bH0DPdSTFYo84luYY_qI2iakOVyxoUIP2wwhBrDEToL4mtpqLormC5U_W6Rkcg58ClTnA7CB7OmG7WJW_EXWY0YTHqwBHSK6A6bRg2cznv3SY2JVD",
  };

  const defaultBanner =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAHMKj5zBFlQaUdrAiDjdOLW1j37reKdWaWGyhprWGDbIBHFmo9qywx-0hBf1kKdGmhSiOQnIxituFi2MwA5KHCVddsJwS4SjDw8j9VrRGJsQ9UIRKb1cVz5SlFsauH2WkNBLymQoqTu78NUy7iZfSLEBMYsXK3e9SkCKV69__BtYPoChPwhx8swTL1-0J_BskwSy6ySyQR4_tbnKTpf9EUouiUUazfhNFbp7Q0igTn37uHylQpPwIL";

  return domainEntries.map(([domainSlug, group], index): World => {
    const firstRecord = group.records[0];
    const fields = firstRecord.fields;

    const worldName =
      getField<string>(fields, "World Name") || group.domainLabel;

    const worldDescription =
      getField<string>(fields, "World Description") ||
      `Master the challenges of ${group.domainLabel}.`;

    const worldTheme =
      getField<string>(fields, "World Theme") || group.domainLabel;

    return {
      id: `world-${domainSlug}`,
      name: worldName,
      description: worldDescription,

      // Store the safe slug because data.ts compares this value.
      domain: domainSlug,

      status: index === 0 ? "current" : "locked",
      completionPercentage: 0,
      bannerUrl: banners[domainSlug] || defaultBanner,
      region: `Region ${index + 1}: ${worldTheme}`,
      currentQuestName: "None",
    };
  });
}


/*
|--------------------------------------------------------------------------
| Student and progress records
|--------------------------------------------------------------------------
*/

export interface AirtableStudent {
  recordId: string;
  studentId: string;
  studentName: string;
  parentEmail: string;
  xp: number;
}

export interface AirtableStudentProgress {
  recordId: string;
  studentRecordId: string;
  lessonRecordId: string;
  status: 'Locked' | 'Unlocked' | 'Completed';
  attempts: number;
  bestScore: number;
  latestScore: number;
  completedDate?: string;
  lastAttemptDate?: string;
  lessonOrder: number;
  totalPointsEarned: number;
  unlockedDate?: string;
  worldId: string;
}

interface AirtableTableResponse {
  records?: Array<{
    id: string;
    createdTime?: string;
    fields: Record<string, unknown>;
  }>;
  offset?: string;
}

function getRequiredAirtableConfig() {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;

  if (!apiKey) {
    throw new Error(
      'AIRTABLE_API_KEY is missing from .env.local',
    );
  }

  if (!baseId) {
    throw new Error(
      'AIRTABLE_BASE_ID is missing from .env.local',
    );
  }

  return {
    apiKey,
    baseId,
  };
}

async function fetchRecordsFromTable(
  tableName: string,
): Promise<
  Array<{
    id: string;
    createdTime?: string;
    fields: Record<string, unknown>;
  }>
> {
  const { apiKey, baseId } =
    getRequiredAirtableConfig();

  const records: Array<{
    id: string;
    createdTime?: string;
    fields: Record<string, unknown>;
  }> = [];

  let offset: string | undefined;

  do {
    const url = new URL(
      `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(
        tableName,
      )}`,
    );

    if (offset) {
      url.searchParams.set('offset', offset);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const responseText = await response.text();

      throw new Error(
        `Could not read Airtable table "${tableName}" (${response.status}): ${responseText}`,
      );
    }

    const data =
      (await response.json()) as AirtableTableResponse;

    if (Array.isArray(data.records)) {
      records.push(...data.records);
    }

    offset = data.offset;
  } while (offset);

  return records;
}

function readLinkedRecordIds(
  value: unknown,
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => String(item))
    .filter(Boolean);
}

/*
|--------------------------------------------------------------------------
| Configured student
|--------------------------------------------------------------------------
*/

export async function fetchConfiguredStudentFromAirtable(): Promise<
  AirtableStudent
> {
  const studentId =
    process.env.APP_STUDENT_ID?.trim();

  const studentsTable =
    process.env.AIRTABLE_STUDENTS_TABLE ||
    'Students';

  if (!studentId) {
    throw new Error(
      'APP_STUDENT_ID is missing from .env.local',
    );
  }

  const records =
    await fetchRecordsFromTable(studentsTable);

  const studentRecord = records.find((record) => {
    const recordStudentId =
      getField<string>(
        record.fields,
        'Student ID',
      )?.trim();

    return recordStudentId === studentId;
  });

  if (!studentRecord) {
    throw new Error(
      `No student was found in "${studentsTable}" with Student ID "${studentId}".`,
    );
  }

  return {
    recordId: studentRecord.id,

    studentId:
      getField<string>(
        studentRecord.fields,
        'Student ID',
      ) || studentId,

    studentName:
      getField<string>(
        studentRecord.fields,
        'Student Name',
      ) || 'Explorer',

    parentEmail:
      getField<string>(
        studentRecord.fields,
        'Parent Email',
      ) || '',

    xp:
      getField<number>(
        studentRecord.fields,
        'XP',
      ) || 0,
  };
}

/*
|--------------------------------------------------------------------------
| Student progress
|--------------------------------------------------------------------------
*/

export async function fetchStudentProgressFromAirtable(
  studentRecordId: string,
): Promise<AirtableStudentProgress[]> {
  const progressTable =
    process.env.AIRTABLE_PROGRESS_TABLE ||
    'Student Progress';

  const records =
    await fetchRecordsFromTable(progressTable);

  return records
    .filter((record) => {
      const linkedStudents =
        readLinkedRecordIds(
          getField<unknown>(
            record.fields,
            'Student Name',
          ),
        );

      return linkedStudents.includes(
        studentRecordId,
      );
    })
    .map((record) => {
      const linkedStudents =
        readLinkedRecordIds(
          getField<unknown>(
            record.fields,
            'Student Name',
          ),
        );

      const linkedLessons =
        readLinkedRecordIds(
          getField<unknown>(
            record.fields,
            'Lesson',
          ),
        );

      const rawStatus =
        getField<string>(
          record.fields,
          'Status',
        );

      let status:
        | 'Locked'
        | 'Unlocked'
        | 'Completed' = 'Locked';

      if (rawStatus === 'Completed') {
        status = 'Completed';
      } else if (rawStatus === 'Unlocked') {
        status = 'Unlocked';
      }

      return {
        recordId: record.id,

        studentRecordId:
          linkedStudents[0] ||
          studentRecordId,

        lessonRecordId:
          linkedLessons[0] || '',

        status,

        attempts:
          getField<number>(
            record.fields,
            'Attempts',
          ) || 0,

        bestScore:
          getField<number>(
            record.fields,
            'Best Score',
          ) || 0,

        latestScore:
          getField<number>(
            record.fields,
            'Latest Score',
          ) || 0,

        completedDate:
          getField<string>(
            record.fields,
            'Completed Date',
          ),

        lastAttemptDate:
          getField<string>(
            record.fields,
            'Last Attempt Date',
          ),

        lessonOrder:
          getField<number>(
            record.fields,
            'Lesson Order',
          ) || 0,

        totalPointsEarned:
          getField<number>(
            record.fields,
            'Total Points Earned',
          ) || 0,

        unlockedDate:
          getField<string>(
            record.fields,
            'Unlocked Date',
          ),

        worldId:
          getField<string>(
            record.fields,
            'World ID',
          ) || '',
      };
    })
    .filter(
      (progress) =>
        Boolean(progress.lessonRecordId),
    );
}


/*
|--------------------------------------------------------------------------
| Initialize student progress
|--------------------------------------------------------------------------
*/

interface AirtableWriteResponse {
  records?: Array<{
    id: string;
    fields: Record<string, unknown>;
  }>;
}

async function createRecordsInTable(
  tableName: string,
  records: Array<{
    fields: Record<string, unknown>;
  }>,
): Promise<void> {
  const { apiKey, baseId } =
    getRequiredAirtableConfig();

  const url =
    `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(
      tableName,
    )}`;

  /*
   * Airtable accepts a maximum of 10 records
   * per create request.
   */
  for (
    let index = 0;
    index < records.length;
    index += 10
  ) {
    const batch = records.slice(
      index,
      index + 10,
    );

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        records: batch,
        typecast: true,
      }),
      cache: 'no-store',
    });

    if (!response.ok) {
      const responseText =
        await response.text();

      throw new Error(
        `Could not create records in "${tableName}" (${response.status}): ${responseText}`,
      );
    }

    await response.json() as AirtableWriteResponse;
  }
}

export async function initializeStudentProgressInAirtable(): Promise<{
  created: number;
  existing: number;
}> {
  const student =
    await fetchConfiguredStudentFromAirtable();

  const existingProgress =
    await fetchStudentProgressFromAirtable(
      student.recordId,
    );

  /*
   * Do nothing if progress already exists.
   */
  if (existingProgress.length > 0) {
    return {
      created: 0,
      existing: existingProgress.length,
    };
  }

  const concepts =
    await fetchAirtableRecords();

  if (concepts.length === 0) {
    throw new Error(
      'No Concepts records were found.',
    );
  }

  const progressTable =
    process.env.AIRTABLE_PROGRESS_TABLE ||
    'Student Progress';

  const now =
    new Date().toISOString();

  const recordsToCreate = concepts.map(
    (concept, index) => {
      const fields = concept.fields;

      const order =
        getField<number>(
          fields,
          'Order',
        ) || index + 1;

      const domainLabel =
        getField<string>(
          fields,
          'Domain',
        ) || '';

      const worldId =
        `world-${slugifyDomain(domainLabel)}`;

      const isFirstLesson =
        index === 0;

  

      return {
       fields: {
  'Student Name': [student.recordId],

  Lesson: [concept.id],

  Status: isFirstLesson
    ? 'Unlocked'
    : 'Locked',

  Attempts: 0,
  'Best Score': 0,
  'Latest Score': 0,
  'Lesson Order': order,
  'Total Points Earned': 0,
  'World ID': worldId,

  ...(isFirstLesson
    ? {
        'Unlocked Date': now,
      }
    : {}),
}
      };
    },
  );

  await createRecordsInTable(
    progressTable,
    recordsToCreate,
  );

  return {
    created: recordsToCreate.length,
    existing: 0,
  };
}



/*
|--------------------------------------------------------------------------
| Save exercise attempt and update progress
|--------------------------------------------------------------------------
*/

export interface SaveExerciseAttemptInput {
  challengeId: string;
  score: number;
  maxScore: number;
  pointsEarned: number;
  totalPoints: number;
  xpGained: number;
  gemsGained: number;
  answers: Record<string, string>;
  results: Array<{
    questionId: string;
    studentAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    explanation: string;
    pointsEarned: number;
    maxPoints: number;
  }>;

  /*
   * data.ts will decide whether the result passes.
   * This keeps the Airtable layer separate from
   * grading rules.
   */
  passed: boolean;
}

export interface SaveExerciseAttemptResult {
  attemptRecordId: string;
  progressRecordId: string;
  attemptNumber: number;
  completedLesson: boolean;
  unlockedNextLesson: boolean;
  nextLessonRecordId?: string;
  totalStudentXp: number;
}

interface AirtableSingleRecordResponse {
  id: string;
  createdTime?: string;
  fields: Record<string, unknown>;
}

function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

async function createSingleRecordInTable(
  tableName: string,
  fields: Record<string, unknown>,
): Promise<AirtableSingleRecordResponse> {
  const { apiKey, baseId } =
    getRequiredAirtableConfig();

  const url =
    `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(
      tableName,
    )}`;

  const response = await fetch(url, {
    method: 'POST',

    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },

    body: JSON.stringify({
      fields,
      typecast: true,
    }),

    cache: 'no-store',
  });

  if (!response.ok) {
    const responseText =
      await response.text();

    throw new Error(
      `Could not create a record in "${tableName}" (${response.status}): ${responseText}`,
    );
  }

  return (
    await response.json()
  ) as AirtableSingleRecordResponse;
}

async function updateSingleRecordInTable(
  tableName: string,
  recordId: string,
  fields: Record<string, unknown>,
): Promise<AirtableSingleRecordResponse> {
  const { apiKey, baseId } =
    getRequiredAirtableConfig();

  const url =
    `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(
      tableName,
    )}/${recordId}`;

  const response = await fetch(url, {
    method: 'PATCH',

    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },

    body: JSON.stringify({
      fields,
      typecast: true,
    }),

    cache: 'no-store',
  });

  if (!response.ok) {
    const responseText =
      await response.text();

    throw new Error(
      `Could not update record "${recordId}" in "${tableName}" (${response.status}): ${responseText}`,
    );
  }

  return (
    await response.json()
  ) as AirtableSingleRecordResponse;
}

function calculateScorePercentage(
  score: number,
  maxScore: number,
): number {
  if (maxScore <= 0) {
    return 0;
  }

  return Math.round(
    (score / maxScore) * 100,
  );
}

export async function saveExerciseAttemptToAirtable(
  input: SaveExerciseAttemptInput,
): Promise<SaveExerciseAttemptResult> {
  const progressTable =
    process.env.AIRTABLE_PROGRESS_TABLE ||
    'Student Progress';

  const attemptsTable =
    process.env.AIRTABLE_ATTEMPTS_TABLE ||
    'Exercise Attempts';

  const studentsTable =
    process.env.AIRTABLE_STUDENTS_TABLE ||
    'Students';

  /*
   * Find the configured student.
   */
  const student =
    await fetchConfiguredStudentFromAirtable();

  /*
   * Get all progress records for this student.
   */
  const progressRecords =
    await fetchStudentProgressFromAirtable(
      student.recordId,
    );

  /*
   * challengeId is the Airtable Concepts record ID.
   * Challenge IDs are created from record.id in
   * fetchChallengesFromAirtable().
   */
  const currentProgress =
    progressRecords.find(
      (progress) =>
        progress.lessonRecordId ===
        input.challengeId,
    );

  if (!currentProgress) {
    throw new Error(
      `No Student Progress record exists for lesson "${input.challengeId}".`,
    );
  }

  if (currentProgress.status === 'Locked') {
    throw new Error(
      'This lesson is locked and cannot accept an attempt.',
    );
  }

  const attemptNumber =
    currentProgress.attempts + 1;

  const scorePercentage =
    calculateScorePercentage(
      input.score,
      input.maxScore,
    );

  const today =
    getTodayDate();

  /*
   * Create a permanent record of this submission.
   *
   * Do not send:
   * - Attempt ID
   * - Attempt Date
   * - Score Percentage
   *
   * Airtable calculates those fields.
   */
  const attemptRecord =
    await createSingleRecordInTable(
      attemptsTable,
      {
        'Student Name': [
          student.recordId,
        ],

        Lesson: [
          input.challengeId,
        ],

        'Student Progress': [
          currentProgress.recordId,
        ],

        'Attempt Number':
          attemptNumber,

        Score: input.score,

        'Max Score':
          input.maxScore,

        'Points Earned':
          input.pointsEarned,

        'Total Points':
          input.totalPoints,

        'XP Earned':
          input.xpGained,

        'Gems Earned':
          input.gemsGained,

        Passed:
          input.passed,

        'Submitted Answers JSON':
          JSON.stringify(
            input.answers,
            null,
            2,
          ),

        'Question Results JSON':
          JSON.stringify(
            input.results,
            null,
            2,
          ),
      },
    );

  /*
   * Update the lesson's cumulative progress.
   */
  const bestScore =
    Math.max(
      currentProgress.bestScore,
      scorePercentage,
    );

  const totalPointsEarned =
    currentProgress.totalPointsEarned +
    input.pointsEarned;

  const progressUpdate:
    Record<string, unknown> = {
    Attempts:
      attemptNumber,

    'Latest Score':
      scorePercentage,

    'Best Score':
      bestScore,

    'Last Attempt Date':
      today,

    'Latest Attempt': [
      attemptRecord.id,
    ],

    'Total Points Earned':
      totalPointsEarned,
  };

  /*
   * Once completed, keep it completed.
   * Retaking a lesson must not relock it.
   */
  const completedLesson =
    input.passed ||
    currentProgress.status ===
      'Completed';

  if (completedLesson) {
    progressUpdate.Status =
      'Completed';

    if (
      !currentProgress.completedDate
    ) {
      progressUpdate[
        'Completed Date'
      ] = today;
    }
  }

  await updateSingleRecordInTable(
    progressTable,
    currentProgress.recordId,
    progressUpdate,
  );

  /*
   * Update the student's lifetime XP.
   */
  const totalStudentXp =
    student.xp + input.xpGained;

  await updateSingleRecordInTable(
    studentsTable,
    student.recordId,
    {
      XP: totalStudentXp,
    },
  );

  /*
   * Unlock the next lesson only when the current
   * lesson passes.
   */
  let unlockedNextLesson = false;
  let nextLessonRecordId:
    string | undefined;

  if (input.passed) {
    const sortedProgress = [
      ...progressRecords,
    ].sort(
      (first, second) =>
        first.lessonOrder -
        second.lessonOrder,
    );

    const nextProgress =
      sortedProgress.find(
        (progress) =>
          progress.lessonOrder >
          currentProgress.lessonOrder,
      );

    if (
      nextProgress &&
      nextProgress.status === 'Locked'
    ) {
      await updateSingleRecordInTable(
        progressTable,
        nextProgress.recordId,
        {
          Status: 'Unlocked',
          'Unlocked Date': today,
        },
      );

      unlockedNextLesson = true;
      nextLessonRecordId =
        nextProgress.lessonRecordId;
    }
  }

  return {
    attemptRecordId:
      attemptRecord.id,

    progressRecordId:
      currentProgress.recordId,

    attemptNumber,

    completedLesson,

    unlockedNextLesson,

    nextLessonRecordId,

    totalStudentXp,
  };
}