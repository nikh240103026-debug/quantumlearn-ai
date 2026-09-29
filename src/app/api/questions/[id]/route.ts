import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase-server";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: Request,
  { params }: Params,
) {
  const { id } = await params;

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

  const {
    data: question,
    error: questionError,
  } = await supabase
    .from("community_questions")
    .select(
      "id, user_id, title, description, topic, attachment_url, attachment_type, circuit_data, code, status, view_count, accepted_answer_id, created_at, updated_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (questionError) {
    return NextResponse.json(
      {
        error:
          "Unable to load the question.",
      },
      {
        status: 500,
      },
    );
  }

  if (!question) {
    return NextResponse.json(
      {
        error:
          "Question not found.",
      },
      {
        status: 404,
      },
    );
  }

  const {
    data: answers,
    error: answersError,
  } = await supabase
    .from("community_answers")
    .select(
      "id, question_id, user_id, body, is_accepted, created_at, updated_at",
    )
    .eq("question_id", id)
    .order("is_accepted", {
      ascending: false,
    })
    .order("created_at", {
      ascending: true,
    });

  if (answersError) {
    return NextResponse.json(
      {
        error:
          "Unable to load answers.",
      },
      {
        status: 500,
      },
    );
  }

  const answerIds =
    (answers ?? []).map(
      (answer) => answer.id,
    );

  const userIds =
    Array.from(
      new Set([
        question.user_id,
        ...(answers ?? []).map(
          (answer) =>
            answer.user_id,
        ),
      ]),
    );

  const [
    profilesResult,
    questionVotesResult,
    followResult,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "id, full_name, username, avatar_url, bio, branch, institute, role, learning_level, quantum_experience",
      )
      .in("id", userIds),

    supabase
      .from(
        "community_question_votes",
      )
      .select("user_id")
      .eq(
        "question_id",
        id,
      ),

    supabase
      .from(
        "community_question_follows",
      )
      .select("user_id")
      .eq(
        "question_id",
        id,
      )
      .eq(
        "user_id",
        user.id,
      ),
  ]);

  const {
    data: answerVotes,
  } = answerIds.length
    ? await supabase
        .from(
          "community_answer_votes",
        )
        .select(
          "answer_id, user_id",
        )
        .in(
          "answer_id",
          answerIds,
        )
    : {
        data: [] as Array<{
          answer_id: string;
          user_id: string;
        }>,
      };

  const profiles = new Map(
    (
      profilesResult.data ?? []
    ).map((profile) => [
      profile.id,
      profile,
    ]),
  );

  const answerVoteCounts =
    new Map<string, number>();

  const answerVotedByMe =
    new Set<string>();

  for (const vote of
    answerVotes ?? []) {
    answerVoteCounts.set(
      vote.answer_id,
      (answerVoteCounts.get(
        vote.answer_id,
      ) ?? 0) + 1,
    );

    if (
      vote.user_id === user.id
    ) {
      answerVotedByMe.add(
        vote.answer_id,
      );
    }
  }

  await supabase
    .from("community_questions")
    .update({
      view_count:
        (question.view_count ??
          0) + 1,
    })
    .eq("id", id);

  return NextResponse.json({
    question: {
      ...question,

      view_count:
        (question.view_count ??
          0) + 1,

      author:
        profiles.get(
          question.user_id,
        ) ?? null,

      vote_count:
        questionVotesResult.data
          ?.length ?? 0,

      has_voted: (
        questionVotesResult.data ??
        []
      ).some(
        (vote) =>
          vote.user_id ===
          user.id,
      ),

      is_following:
        Boolean(
          followResult.data
            ?.length,
        ),
    },

    answers: (
      answers ?? []
    ).map((answer) => ({
      ...answer,

      author:
        profiles.get(
          answer.user_id,
        ) ?? null,

      vote_count:
        answerVoteCounts.get(
          answer.id,
        ) ?? 0,

      has_voted:
        answerVotedByMe.has(
          answer.id,
        ),
    })),

    viewer_id: user.id,
  });
}

export async function DELETE(
  _request: Request,
  { params }: Params,
) {
  const { id } = await params;

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

  const { error } =
    await supabase
      .from(
        "community_questions",
      )
      .delete()
      .eq("id", id)
      .eq(
        "user_id",
        user.id,
      );

  if (error) {
    return NextResponse.json(
      {
        error:
          "Unable to delete the question.",
      },
      {
        status: 500,
      },
    );
  }

  return NextResponse.json({
    ok: true,
  });
}