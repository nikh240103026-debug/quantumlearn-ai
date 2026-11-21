import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { isMissingColumnError } from "@/lib/supabase-errors";

const VALID_REASONS = [
  "wrong_answer",
  "ambiguous_question",
  "incorrect_explanation",
  "typo",
  "too_difficult",
  "other",
] as const;

type ReportReason = (typeof VALID_REASONS)[number];

function cleanString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();

    // ---------------------------------------------------------
    // AUTHENTICATION
    // ---------------------------------------------------------

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Unauthorized.",
        },
        {
          status: 401,
        },
      );
    }

    // ---------------------------------------------------------
    // REQUEST BODY
    // ---------------------------------------------------------

    const body = await request.json();

    const questionId = cleanString(
      body.question_id,
    );

    const reason = cleanString(
      body.reason,
    ) as ReportReason | null;

    const details = cleanString(
      body.details,
    );

    // ---------------------------------------------------------
    // VALIDATION
    // ---------------------------------------------------------

    if (!questionId) {
      return NextResponse.json(
        {
          error: "Question ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !reason ||
      !VALID_REASONS.includes(reason)
    ) {
      return NextResponse.json(
        {
          error:
            "Please select a valid report reason.",
        },
        {
          status: 400,
        },
      );
    }

    if (details && details.length > 5000) {
      return NextResponse.json(
        {
          error:
            "Additional details must be 5,000 characters or less.",
        },
        {
          status: 400,
        },
      );
    }

    // ---------------------------------------------------------
    // VERIFY QUESTION
    // ---------------------------------------------------------

    const {
      data: question,
      error: questionError,
    } = await supabase
      .from("practice_questions")
      .select(
        "id, question, chapter_number, difficulty",
      )
      .eq("id", questionId)
      .maybeSingle();

    if (questionError) {
      console.error(
        "Failed to verify practice question:",
        questionError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to verify the practice question.",
        },
        {
          status: 500,
        },
      );
    }

    if (!question) {
      return NextResponse.json(
        {
          error: "Practice question not found.",
        },
        {
          status: 404,
        },
      );
    }

    // ---------------------------------------------------------
    // PREVENT DUPLICATE REPORTS
    // ---------------------------------------------------------

    // Only an OPEN report blocks a new one, so a question can be
    // reported again after the earlier report was resolved. `limit(1)`
    // instead of maybeSingle(): several older rows must not cause an
    // error that blocks every future report.
    const {
      data: existingReports,
      error: existingReportError,
    } = await supabase
      .from("practice_question_reports")
      .select("id")
      .eq("question_id", questionId)
      .eq("user_id", user.id)
      .eq("status", "open")
      .limit(1);

    const existingReport =
      existingReports?.[0] ?? null;

    if (existingReportError) {
      console.error(
        "Failed to check existing question report:",
        existingReportError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to submit the report right now.",
        },
        {
          status: 500,
        },
      );
    }

    if (existingReport) {
      return NextResponse.json(
        {
          error:
            "You have already reported this question.",
        },
        {
          status: 409,
        },
      );
    }

    // ---------------------------------------------------------
    // CREATE REPORT
    //
    // The table has no `metadata` column. The learner's details
    // go in `description`, which the migration
    // supabase/migrations/..._practice_integrity... adds; until
    // it runs, the insert is retried without it.
    // ---------------------------------------------------------

    const insertReport = (
      withDescription: boolean,
    ) =>
      supabase
        .from("practice_question_reports")
        .insert({
          question_id: questionId,
          user_id: user.id,
          reason,
          status: "open",
          ...(withDescription && details
            ? { description: details }
            : {}),
        })
        .select(
          "id, question_id, user_id, reason, status, created_at",
        )
        .single();

    let { data, error } =
      await insertReport(true);

    if (
      error &&
      details &&
      isMissingColumnError(error)
    ) {
      ({ data, error } =
        await insertReport(false));
    }

    if (error) {
      console.error(
        "Failed to create practice question report:",
        error,
      );

      return NextResponse.json(
        {
          error:
            "Unable to submit the report right now.",
        },
        {
          status: 500,
        },
      );
    }

    // ---------------------------------------------------------
    // SUCCESS
    // ---------------------------------------------------------

    return NextResponse.json(
      {
        success: true,
        report: data,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "Practice question report API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while submitting the report.",
      },
      {
        status: 500,
      },
    );
  }
}