import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL =
  process.env.GEMINI_TUTOR_MODEL ?? "gemini-3.5-flash-lite";

type AnalysisResult = {
  strengths: string[];
  weakAreas: string[];
  learningPattern: string;
  practicePattern: string;
  recommendedNextTopic: string;
  recommendedChapter: number | null;
  recommendedDifficulty: string;
  reason: string;
  priorityActions: string[];
};

function normalizeStringArray(
  value: unknown,
  maxItems = 5,
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (item): item is string =>
        typeof item === "string",
    )
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, maxItems);
}

function parseAnalysis(
  text: string,
): AnalysisResult {
  try {
    const cleaned = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    const recommendedChapter =
      Number.isFinite(
        Number(parsed.recommendedChapter),
      )
        ? Number(parsed.recommendedChapter)
        : null;

    return {
      strengths: normalizeStringArray(
        parsed.strengths,
      ),
      weakAreas: normalizeStringArray(
        parsed.weakAreas,
      ),
      learningPattern:
        typeof parsed.learningPattern === "string"
          ? parsed.learningPattern.trim()
          : "Insufficient activity data.",
      practicePattern:
        typeof parsed.practicePattern === "string"
          ? parsed.practicePattern.trim()
          : "Insufficient practice data.",
      recommendedNextTopic:
        typeof parsed.recommendedNextTopic ===
        "string"
          ? parsed.recommendedNextTopic.trim()
          : "Review your current learning topic.",
      recommendedChapter:
        recommendedChapter !== null &&
        recommendedChapter >= 1 &&
        recommendedChapter <= 10
          ? recommendedChapter
          : null,
      recommendedDifficulty:
        typeof parsed.recommendedDifficulty ===
        "string"
          ? parsed.recommendedDifficulty.trim()
          : "medium",
      reason:
        typeof parsed.reason === "string"
          ? parsed.reason.trim()
          : "Recommendation based on your available learning activity.",
      priorityActions: normalizeStringArray(
        parsed.priorityActions,
        5,
      ),
    };
  } catch {
    return {
      strengths: [],
      weakAreas: [],
      learningPattern:
        "The analysis could not be parsed.",
      practicePattern:
        "The analysis could not be parsed.",
      recommendedNextTopic:
        "Continue reviewing your recent lessons.",
      recommendedChapter: null,
      recommendedDifficulty: "medium",
      reason:
        "The AI analysis response was not in the expected format.",
      priorityActions: [],
    };
  }
}

async function generateAnalysis(
  prompt: string,
): Promise<AnalysisResult> {
  if (!GEMINI_API_KEY) {
    throw new Error(
      "GEMINI_API_KEY is not configured.",
    );
  }

  const endpoint =
    `https://generativelanguage.googleapis.com/v1beta/models/` +
    `${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [
          {
            text: `
You are the learning intelligence engine for QuantumLearn AI.

Analyze only the learner data provided to you.

Do not invent:
- scores
- attempts
- completed lessons
- topics
- laboratory activity
- learning time
- strengths
- weaknesses

If there is insufficient evidence, explicitly say so.

Return ONLY valid JSON with this exact structure:

{
  "strengths": ["..."],
  "weakAreas": ["..."],
  "learningPattern": "...",
  "practicePattern": "...",
  "recommendedNextTopic": "...",
  "recommendedChapter": 1,
  "recommendedDifficulty": "easy|medium|hard",
  "reason": "...",
  "priorityActions": ["...", "..."]
}

The recommended chapter must be a number from 1 to 10 or null.
Keep recommendations practical and educational.
`.trim(),
          },
        ],
      },
      contents: [
        {
          role: "user",
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        maxOutputTokens: 1600,
        responseMimeType: "application/json",
      },
    }),
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(
      data?.error?.message ??
        `Gemini request failed with status ${response.status}.`,
    );

    (
      error as Error & {
        status?: number;
      }
    ).status = response.status;

    throw error;
  }

  const text =
    data?.candidates?.[0]?.content?.parts
      ?.map(
        (part: { text?: string }) =>
          part.text ?? "",
      )
      .join("")
      .trim() ?? "";

  if (!text) {
    throw new Error(
      "Gemini returned an empty analysis.",
    );
  }

  return parseAnalysis(text);
}

export async function POST(
  _request: NextRequest,
) {
  try {
    const supabase =
      await createSupabaseServerClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          error:
            "You must be logged in to generate your learning analysis.",
        },
        { status: 401 },
      );
    }

    /*
     * ---------------------------------------------------------
     * LOAD REAL LEARNING DATA
     * ---------------------------------------------------------
     */

    const [
      profileResult,
      progressResult,
      practiceResult,
      activityResult,
    ] = await Promise.all([
      supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle(),

      supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", user.id),

      supabase
        .from("practice_results")
        .select("*")
        .eq("user_id", user.id)
        .order("completed_at", {
          ascending: false,
        })
        .limit(100),

      supabase
        .from("ai_activity")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        })
        .limit(100),
    ]);

    if (profileResult.error) {
      console.warn(
        "Profile query error:",
        profileResult.error,
      );
    }

    if (progressResult.error) {
      console.warn(
        "Progress query error:",
        progressResult.error,
      );
    }

    if (practiceResult.error) {
      console.warn(
        "Practice results query error:",
        practiceResult.error,
      );
    }

    if (activityResult.error) {
      console.warn(
        "AI activity query error:",
        activityResult.error,
      );
    }

    const profile =
      profileResult.data ?? null;

    const progress =
      progressResult.data ?? [];

    const practiceResults =
      practiceResult.data ?? [];

    const activities =
      activityResult.data ?? [];

    /*
     * ---------------------------------------------------------
     * CREATE SAFE SUMMARY FOR THE MODEL
     * ---------------------------------------------------------
     */

    const practiceSummary =
      practiceResults.map((result) => ({
        lesson_slug:
          result.lesson_slug ?? null,
        score:
          typeof result.score === "number"
            ? result.score
            : null,
        total_questions:
          typeof result.total_questions ===
          "number"
            ? result.total_questions
            : null,
        percentage:
          typeof result.percentage ===
          "number"
            ? result.percentage
            : null,
        completed_at:
          result.completed_at ?? null,
      }));

    const activitySummary =
      activities.map((activity) => ({
        activity_type:
          activity.activity_type ?? null,
        source_page:
          activity.source_page ?? null,
        topic:
          activity.topic ?? null,
        description:
          activity.description ?? null,
        created_at:
          activity.created_at ?? null,
      }));

    const progressSummary =
      progress.map((item) => ({
        lesson_id:
          item.lesson_id ?? null,
        lesson_slug:
          item.lesson_slug ?? null,
        completed:
          item.completed ?? null,
        progress:
          item.progress ?? null,
        completed_at:
          item.completed_at ?? null,
        updated_at:
          item.updated_at ?? null,
      }));

    const prompt = `
Learner profile:
${JSON.stringify(profile)}

Learning progress:
${JSON.stringify(progressSummary)}

Recent practice results:
${JSON.stringify(practiceSummary)}

Recent AI activity:
${JSON.stringify(activitySummary)}

Analyze the learner's current learning state.

Identify:
1. Evidence-based strengths.
2. Evidence-based weak areas.
3. Learning pattern.
4. Practice pattern.
5. The best next topic.
6. The appropriate chapter if evidence allows it.
7. Appropriate difficulty.
8. Why that recommendation is appropriate.
9. The most useful priority actions.

Do not infer information that is not present in the supplied data.
`.trim();

    const analysis =
      await generateAnalysis(prompt);

    /*
     * ---------------------------------------------------------
     * SAVE RECOMMENDATION
     * ---------------------------------------------------------
     */

    const { data: recommendation, error } =
      await supabase
        .from("ai_recommendations")
        .insert({
          user_id: user.id,
          recommendation_type:
            "learning_analysis",
          title:
            "Your Personalized Learning Analysis",
          recommendation:
            analysis.recommendedNextTopic,
          reason: analysis.reason,
          recommended_topic:
            analysis.recommendedNextTopic,
          recommended_chapter:
            analysis.recommendedChapter,
          recommended_difficulty:
            analysis.recommendedDifficulty,
          priority:
            analysis.priorityActions.length > 0
              ? "high"
              : "medium",
          status: "active",
          metadata: {
            strengths: analysis.strengths,
            weak_areas: analysis.weakAreas,
            learning_pattern:
              analysis.learningPattern,
            practice_pattern:
              analysis.practicePattern,
            priority_actions:
              analysis.priorityActions,
          },
        })
        .select(
          `
            id,
            user_id,
            recommendation_type,
            title,
            recommendation,
            reason,
            recommended_topic,
            recommended_chapter,
            recommended_difficulty,
            priority,
            status,
            metadata,
            created_at,
            updated_at
          `,
        )
        .single();

    if (error) {
      console.error(
        "AI recommendation insert error:",
        error,
      );

      return NextResponse.json(
        {
          error:
            "Analysis was generated, but could not be saved.",
          analysis,
        },
        { status: 500 },
      );
    }

    /*
     * ---------------------------------------------------------
     * LOG AI ACTIVITY
     * ---------------------------------------------------------
     */

    const { error: activityError } =
      await supabase
        .from("ai_activity")
        .insert({
          user_id: user.id,
          activity_type:
            "analysis_generated",
          source_page: "dashboard",
          topic:
            analysis.recommendedNextTopic,
          description:
            "Generated personalized learning analysis.",
          metadata: {
            recommendation_id:
              recommendation.id,
            recommended_chapter:
              analysis.recommendedChapter,
            recommended_difficulty:
              analysis.recommendedDifficulty,
          },
        });

    if (activityError) {
      console.warn(
        "AI analysis activity logging error:",
        activityError,
      );
    }

    return NextResponse.json(
      {
        success: true,
        learner: {
          name:
            profile?.full_name ??
            user.email ??
            "Learner",
        },
        analysis,
        recommendation,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(
      "Unexpected AI analysis error:",
      error,
    );

    const status =
      typeof error === "object" &&
      error !== null &&
      "status" in error
        ? Number(
            (
              error as {
                status?: number;
              }
            ).status,
          )
        : 500;

    if (status === 429) {
      return NextResponse.json(
        {
          error:
            "AI analysis is temporarily rate-limited. Please try again shortly.",
        },
        { status: 429 },
      );
    }

    if (
      status === 401 ||
      status === 403
    ) {
      return NextResponse.json(
        {
          error:
            "AI provider authentication failed. Check GEMINI_API_KEY.",
        },
        { status: 502 },
      );
    }

    if (
      status === 500 ||
      status === 502 ||
      status === 503
    ) {
      return NextResponse.json(
        {
          error:
            "AI analysis is temporarily unavailable. Please try again shortly.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      {
        error:
          "Unable to generate learning analysis.",
        details:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : String(error)
            : undefined,
      },
      { status: 500 },
    );
  }
}