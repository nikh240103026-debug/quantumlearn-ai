import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase =
      await createSupabaseServerClient();

    // ----------------------------------------------------------
    // MODULES
    // ----------------------------------------------------------

    const {
      data: modules,
      error: modulesError,
    } = await supabase
      .from("curriculum_modules")
      .select(
        `
          id,
          module_number,
          slug,
          title,
          description
        `,
      )
      .eq("is_published", true)
      .order("module_number", {
        ascending: true,
      });

    if (modulesError) {
      console.error(
        "Failed to fetch curriculum modules:",
        modulesError,
      );

      return NextResponse.json(
        {
          error:
            "Failed to load curriculum modules.",
        },
        { status: 500 },
      );
    }

    // ----------------------------------------------------------
    // TOPICS
    // ----------------------------------------------------------

    const {
      data: topics,
      error: topicsError,
    } = await supabase
      .from("curriculum_topics")
      .select(
        `
          id,
          module_id,
          title,
          description,
          order_index
        `,
      )
      .eq("is_published", true)
      .order("order_index", {
        ascending: true,
      });

    if (topicsError) {
      console.error(
        "Failed to fetch curriculum topics:",
        topicsError,
      );

      return NextResponse.json(
        {
          error:
            "Failed to load curriculum topics.",
        },
        { status: 500 },
      );
    }

    // ----------------------------------------------------------
    // BUILD MODULE → TOPICS STRUCTURE
    // ----------------------------------------------------------

    const topicRows = topics ?? [];

    const curriculumModules =
      (modules ?? []).map(
        (module) => ({
          id: module.id,
          moduleNumber:
            module.module_number,
          slug: module.slug,
          title: module.title,
          description:
            module.description,
          topics: topicRows
            .filter(
              (topic) =>
                topic.module_id ===
                module.id,
            )
            .map((topic) => ({
              id: topic.id,
              moduleId:
                topic.module_id,
              title: topic.title,
              description:
                topic.description,
              orderIndex:
                topic.order_index,
            })),
        }),
      );

    return NextResponse.json({
      modules: curriculumModules,
      count:
        curriculumModules.length,
    });
  } catch (error) {
    console.error(
      "Curriculum API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unexpected error while loading curriculum.",
      },
      { status: 500 },
    );
  }
}