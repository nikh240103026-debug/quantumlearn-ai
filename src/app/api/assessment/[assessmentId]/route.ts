import { NextRequest, NextResponse } from "next/server";

import { getAssessmentById } from "@/lib/assessment/assessmentService";

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

    const assessment = getAssessmentById(assessmentId);

    if (!assessment) {
      return NextResponse.json(
        {
          success: false,
          message: "Assessment not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: assessment,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Assessment Details API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error.",
      },
      { status: 500 }
    );
  }
}