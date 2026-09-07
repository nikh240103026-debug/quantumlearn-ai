import { NextResponse } from "next/server";

import { getAllAssessments } from "@/lib/assessment/assessmentService";

export async function GET() {
  try {
    const assessments = getAllAssessments();

    return NextResponse.json(
      {
        success: true,
        data: assessments,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Assessment API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch assessments.",
      },
      { status: 500 }
    );
  }
}