import { NextRequest, NextResponse } from "next/server";

import { getQuestionsByAssessmentId } from "@/lib/assessment/questionService";

interface RouteParams {
  params: Promise<{
    assessmentId: string;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { assessmentId } = await params;

    const questions = getQuestionsByAssessmentId(assessmentId);

    if (questions.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No questions found for this assessment.",
        },
        { status: 404 }
      );
    }

    const sanitizedQuestions = questions.map(
      ({ correctAnswer, explanation, ...question }) => question
    );

    return NextResponse.json(
      {
        success: true,
        totalQuestions: sanitizedQuestions.length,
        data: sanitizedQuestions,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Assessment Questions API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error.",
      },
      { status: 500 }
    );
  }
}