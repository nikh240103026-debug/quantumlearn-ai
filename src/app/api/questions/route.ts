import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase-server";

const MAX_TITLE = 180;
const MAX_DESCRIPTION = 12000;

const TOPICS = new Set([
  "Quantum Computing",
  "Quantum Gates",
  "Quantum Circuits",
  "Quantum Algorithms",
  "Quantum Mathematics",
  "Quantum Programming",
  "Quantum Hardware",
  "Quantum Error Correction",
  "Other",
]);

async function getUser() {
  const supabase =
    await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return {
    supabase,
    user,
  };
}

export async function GET(
  request: Request,
) {
  const { supabase, user } =
    await getUser();

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

  const { searchParams } =
    new URL(request.url);

  const search =
    searchParams
      .get("search")
      ?.trim() ?? "";

  const filter =
    searchParams.get("filter") ??
    "all";

  const topic =
    searchParams
      .get("topic")
      ?.trim() ?? "";

  let query = supabase
    .from("community_questions")
    .select(
      "id, user_id, title, description, topic, attachment_url, attachment_type, status, view_count, accepted_answer_id, created_at, updated_at",
    )
    .order("created_at", {
      ascending: false,
    })
    .limit(40);

  if (search) {
    const safe = search.replace(
      /[%_,]/g,
      " ",
    );

    query = query.or(
      `title.ilike.%${safe}%,description.ilike.%${safe}%,topic.ilike.%${safe}%`,
    );
  }

  if (
    topic &&
    TOPICS.has(topic)
  ) {
    query = query.eq(
      "topic",
      topic,
    );
  }

  if (filter === "unanswered") {
    query = query.eq(
      "status",
      "unanswered",
    );
  }

  if (filter === "answered") {
    query = query.eq(
      "status",
      "answered",
    );
  }

  if (filter === "mine") {
    query = query.eq(
      "user_id",
      user.id,
    );
  }

  const {
    data: questions,
    error,
  } = await query;

  if (error) {
    console.error(
      "[QUESTIONS GET]",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to load questions.",
      },
      {
        status: 500,
      },
    );
  }

  const rows = questions ?? [];

  const ids = rows.map(
    (question) => question.id,
  );

  const userIds =
    Array.from(
      new Set(
        rows.map(
          (question) =>
            question.user_id,
        ),
      ),
    );

  if (!ids.length) {
    return NextResponse.json({
      questions: [],
    });
  }

  const [
    profilesResult,
    answersResult,
    votesResult,
    followsResult,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "id, full_name, username, avatar_url, bio, branch, institute, role, learning_level, quantum_experience",
      )
      .in("id", userIds),

    supabase
      .from("community_answers")
      .select("question_id")
      .in(
        "question_id",
        ids,
      ),

    supabase
      .from(
        "community_question_votes",
      )
      .select(
        "question_id, user_id",
      )
      .in(
        "question_id",
        ids,
      ),

    supabase
      .from(
        "community_question_follows",
      )
      .select(
        "question_id, user_id",
      )
      .in(
        "question_id",
        ids,
      )
      .eq(
        "user_id",
        user.id,
      ),
  ]);

  const profiles = new Map(
    (
      profilesResult.data ?? []
    ).map((profile) => [
      profile.id,
      profile,
    ]),
  );

  const answerCounts =
    new Map<string, number>();

  for (const row of
    answersResult.data ?? []) {
    answerCounts.set(
      row.question_id,
      (answerCounts.get(
        row.question_id,
      ) ?? 0) + 1,
    );
  }

  const voteCounts =
    new Map<string, number>();

  const votedByMe =
    new Set<string>();

  for (const row of
    votesResult.data ?? []) {
    voteCounts.set(
      row.question_id,
      (voteCounts.get(
        row.question_id,
      ) ?? 0) + 1,
    );

    if (
      row.user_id === user.id
    ) {
      votedByMe.add(
        row.question_id,
      );
    }
  }

  const following = new Set(
    (
      followsResult.data ?? []
    ).map(
      (row) =>
        row.question_id,
    ),
  );

  let result = rows.map(
    (question) => ({
      ...question,
      author:
        profiles.get(
          question.user_id,
        ) ?? null,

      answer_count:
        answerCounts.get(
          question.id,
        ) ?? 0,

      vote_count:
        voteCounts.get(
          question.id,
        ) ?? 0,

      has_voted:
        votedByMe.has(
          question.id,
        ),

      is_following:
        following.has(
          question.id,
        ),
    }),
  );

  if (filter === "popular") {
    result = result.sort(
      (a, b) =>
        b.vote_count -
          a.vote_count ||
        b.answer_count -
          a.answer_count ||
        b.view_count -
          a.view_count,
    );
  }

  return NextResponse.json({
    questions: result,
  });
}

export async function POST(
  request: Request,
) {
  const { supabase, user } =
    await getUser();

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

  let body: Record<
    string,
    unknown
  >;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        error:
          "Invalid request body.",
      },
      {
        status: 400,
      },
    );
  }

  const title =
    typeof body.title ===
    "string"
      ? body.title.trim()
      : "";

  const description =
    typeof body.description ===
    "string"
      ? body.description.trim()
      : "";

  const topic =
    typeof body.topic ===
    "string"
      ? body.topic.trim()
      : null;

  const code =
    typeof body.code ===
    "string"
      ? body.code.slice(
          0,
          20000,
        )
      : null;

  const attachmentUrl =
    typeof body.attachment_url ===
    "string"
      ? body.attachment_url
          .trim()
          .slice(0, 2048)
      : null;

  const attachmentType =
    body.attachment_type ===
      "image" ||
    body.attachment_type ===
      "file"
      ? body.attachment_type
      : null;

  if (
    title.length < 8 ||
    title.length > MAX_TITLE
  ) {
    return NextResponse.json(
      {
        error:
          "Title must be between 8 and 180 characters.",
      },
      {
        status: 400,
      },
    );
  }

  if (
    description.length < 10 ||
    description.length >
      MAX_DESCRIPTION
  ) {
    return NextResponse.json(
      {
        error:
          "Description must be between 10 and 12,000 characters.",
      },
      {
        status: 400,
      },
    );
  }

  if (
    topic &&
    !TOPICS.has(topic)
  ) {
    return NextResponse.json(
      {
        error:
          "Invalid topic.",
      },
      {
        status: 400,
      },
    );
  }

  let circuitData:
    | unknown
    | null = null;

  if (body.circuit_data) {
    try {
      circuitData =
        typeof body.circuit_data ===
        "string"
          ? JSON.parse(
              body.circuit_data,
            )
          : body.circuit_data;

      JSON.stringify(
        circuitData,
      );
    } catch {
      return NextResponse.json(
        {
          error:
            "Circuit data must be valid JSON.",
        },
        {
          status: 400,
        },
      );
    }
  }

  const {
    data,
    error,
  } = await supabase
    .from(
      "community_questions",
    )
    .insert({
      user_id: user.id,
      title,
      description,
      topic: topic || null,
      code: code || null,
      circuit_data:
        circuitData,
      attachment_url:
        attachmentUrl || null,
      attachment_type:
        attachmentType,
    })
    .select("id")
    .single();

  if (error) {
    console.error(
      "[QUESTIONS POST]",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to post your question.",
      },
      {
        status: 500,
      },
    );
  }

  return NextResponse.json(
    {
      questionId: data.id,
    },
    {
      status: 201,
    },
  );
}