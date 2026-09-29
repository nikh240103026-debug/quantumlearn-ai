import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase-server";

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

    const {
      data: existingReport,
      error: existingReportError,
    } = await supabase
      .from("practice_question_reports")
      .select("id")
      .eq("question_id", questionId)
      .eq("user_id", user.id)
      .maybeSingle();

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
    // IMPORTANT:
    // The database table does not contain a `metadata`
    // column, so we intentionally do not send one here.
    //
    // `details` is also not inserted as a separate column
    // because the current table schema does not expose it.
    // The report reason is therefore stored in `reason`.
    // ---------------------------------------------------------

    const {
      data,
      error,
    } = await supabase
      .from("practice_question_reports")
      .insert({
        question_id: questionId,
        user_id: user.id,
        reason,
        status: "open",
      })
      .select(
        "id, question_id, user_id, reason, status, created_at",
      )
      .single();

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