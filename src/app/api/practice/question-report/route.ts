import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase-server";

import type {
  PracticeReportReason,
} from "@/types/practice-report";

const VALID_REASONS: PracticeReportReason[] = [
  "wrong_answer",
  "ambiguous_question",
  "incorrect_explanation",
  "typo",
  "too_difficult",
  "other",
];

function cleanString(
  value: unknown,
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed.length > 0
    ? trimmed
    : null;
}

export async function POST(
  request: Request,
) {
  try {
    const supabase =
      await createSupabaseServerClient();

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

    const body = await request.json();

    const questionId =
      cleanString(body.question_id);

    const practiceResultId =
      cleanString(
        body.practice_result_id,
      );

    const reason =
      cleanString(body.reason) as
        | PracticeReportReason
        | null;

    const description =
      cleanString(body.description);

    const pageUrl =
      cleanString(body.page_url) ??
      request.headers.get("referer");

    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------

    if (!questionId) {
      return NextResponse.json(
        {
          error:
            "Practice question ID is required.",
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

    if (
      description &&
      description.length > 2000
    ) {
      return NextResponse.json(
        {
          error:
            "Description must be 2,000 characters or less.",
        },
        {
          status: 400,
        },
      );
    }

    // --------------------------------------------------------
    // PREVENT DUPLICATE OPEN REPORTS
    // --------------------------------------------------------

    const {
      data: existingReport,
      error: existingReportError,
    } = await supabase
      .from(
        "practice_question_reports",
      )
      .select("id, status")
      .eq("user_id", user.id)
      .eq("question_id", questionId)
      .in("status", [
        "open",
        "reviewing",
      ])
      .maybeSingle();

    if (existingReportError) {
      console.error(
        "Failed to check existing practice question report:",
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
            "You have already reported this question. It is currently under review.",
          report: existingReport,
        },
        {
          status: 409,
        },
      );
    }

    // --------------------------------------------------------
    // CREATE REPORT
    // --------------------------------------------------------

    const {
      data: report,
      error: reportError,
    } = await supabase
      .from(
        "practice_question_reports",
      )
      .insert({
        user_id: user.id,
        question_id: questionId,
        practice_result_id:
          practiceResultId,
        reason,
        description,
        page_url: pageUrl,
        status: "open",
      })
      .select(
        `
          id,
          user_id,
          question_id,
          practice_result_id,
          reason,
          description,
          page_url,
          status,
          admin_notes,
          created_at,
          updated_at
        `,
      )
      .single();

    if (reportError) {
      console.error(
        "Failed to create practice question report:",
        reportError,
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

    return NextResponse.json(
      {
        success: true,
        report,
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