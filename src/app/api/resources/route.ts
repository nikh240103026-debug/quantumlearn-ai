import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

/**
 * GET /api/resources
 *
 * Returns published resources available to the authenticated user.
 *
 * Optional query parameters:
 *   ?type=research_paper
 *   ?topic=quantum algorithms
 *   ?chapter=6
 *   ?difficulty=advanced
 *   ?search=error correction
 */
export async function GET(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          error: "Authentication required.",
        },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);

    const type = searchParams.get("type")?.trim() || null;
    const topic = searchParams.get("topic")?.trim() || null;
    const chapter = searchParams.get("chapter")?.trim() || null;
    const difficulty =
      searchParams.get("difficulty")?.trim() || null;
    const search = searchParams.get("search")?.trim() || null;

    let query = supabase
      .from("resources")
      .select(
        `
          id,
          title,
          description,
          resource_type,
          topic,
          chapter,
          difficulty,
          resource_url,
          file_url,
          author,
          source_name,
          tags,
          metadata,
          created_at,
          updated_at
        `,
      )
      .eq("is_published", true)
      .order("created_at", {
        ascending: false,
      });

    if (type) {
      query = query.eq("resource_type", type);
    }

    if (topic) {
      query = query.ilike("topic", `%${topic}%`);
    }

    if (chapter) {
      const chapterNumber = Number(chapter);

      if (
        Number.isInteger(chapterNumber) &&
        chapterNumber > 0
      ) {
        query = query.eq("chapter", chapterNumber);
      }
    }

    if (difficulty) {
      query = query.eq("difficulty", difficulty);
    }

    if (search) {
      const safeSearch = search
        .replace(/[%_]/g, "")
        .trim();

      if (safeSearch) {
        query = query.or(
          `title.ilike.%${safeSearch}%,description.ilike.%${safeSearch}%,topic.ilike.%${safeSearch}%,author.ilike.%${safeSearch}%,source_name.ilike.%${safeSearch}%`,
        );
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error(
        "Resources GET database error:",
        error,
      );

      return NextResponse.json(
        {
          error: "Unable to load resources.",
        },
        { status: 500 },
      );
    }

    const resourceIds = (data ?? []).map(
      (resource) => resource.id,
    );

    let savedResourceIds: string[] = [];

    if (resourceIds.length > 0) {
      const { data: saves, error: savesError } =
        await supabase
          .from("resource_saves")
          .select("resource_id")
          .eq("user_id", user.id)
          .in("resource_id", resourceIds);

      if (savesError) {
        console.error(
          "Resource saves GET error:",
          savesError,
        );
      } else {
        savedResourceIds = (saves ?? []).map(
          (save) => save.resource_id,
        );
      }
    }

    const savedSet = new Set(savedResourceIds);

    const resources = (data ?? []).map(
      (resource) => ({
        ...resource,
        is_saved: savedSet.has(resource.id),
      }),
    );

    return NextResponse.json(
      {
        resources,
        count: resources.length,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(
      "Resources GET unexpected error:",
      error,
    );

    return NextResponse.json(
      {
        error: "Unable to load resources.",
      },
      { status: 500 },
    );
  }
}