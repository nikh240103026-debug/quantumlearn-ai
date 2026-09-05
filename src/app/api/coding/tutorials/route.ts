import { NextResponse } from "next/server";
import {
  codingTutorials,
  tutorialFrameworks,
} from "@/lib/coding-tutorials";

export async function GET() {
  return NextResponse.json({
    tutorials: codingTutorials,
    frameworks: tutorialFrameworks,
  });
}