import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase-server";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  request: Request,
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

  const action =
    typeof body.action ===
    "string"
      ? body.action
      : "";

  // ==========================================================
  // QUESTION VOTE
  // ==========================================================

  if (
    action === "question_vote"
  ) {
    const { data: existing } =
      await supabase
        .from(
          "community_question_votes",
        )
        .select(
          "question_id",
        )
        .eq(
          "question_id",
          id,
        )
        .eq(
          "user_id",
          user.id,
        )
        .maybeSingle();

    if (existing) {
      const { error } =
        await supabase
          .from(
            "community_question_votes",
          )
          .delete()
          .eq(
            "question_id",
            id,
          )
          .eq(
            "user_id",
            user.id,
          );

      if (error) {
        return NextResponse.json(
          {
            error:
              "Unable to remove vote.",
          },
          {
            status: 500,
          },
        );
      }

      return NextResponse.json({
        active: false,
      });
    }

    const { error } =
      await supabase
        .from(
          "community_question_votes",
        )
        .insert({
          question_id: id,
          user_id: user.id,
        });

    if (error) {
      return NextResponse.json(
        {
          error:
            "Unable to vote.",
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json({
      active: true,
    });
  }

  // ==========================================================
  // FOLLOW
  // ==========================================================

  if (action === "follow") {
    const { data: existing } =
      await supabase
        .from(
          "community_question_follows",
        )
        .select(
          "question_id",
        )
        .eq(
          "question_id",
          id,
        )
        .eq(
          "user_id",
          user.id,
        )
        .maybeSingle();

    if (existing) {
      const { error } =
        await supabase
          .from(
            "community_question_follows",
          )
          .delete()
          .eq(
            "question_id",
            id,
          )
          .eq(
            "user_id",
            user.id,
          );

      if (error) {
        return NextResponse.json(
          {
            error:
              "Unable to unfollow question.",
          },
          {
            status: 500,
          },
        );
      }

      return NextResponse.json({
        active: false,
      });
    }

    const { error } =
      await supabase
        .from(
          "community_question_follows",
        )
        .insert({
          question_id: id,
          user_id: user.id,
        });

    if (error) {
      return NextResponse.json(
        {
          error:
            "Unable to follow question.",
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json({
      active: true,
    });
  }

  // ==========================================================
  // ANSWER
  // ==========================================================

  if (action === "answer") {
    const answer =
      typeof body.body ===
      "string"
        ? body.body.trim()
        : "";

    if (
      answer.length < 5 ||
      answer.length > 12000
    ) {
      return NextResponse.json(
        {
          error:
            "Answer must be between 5 and 12,000 characters.",
        },
        {
          status: 400,
        },
      );
    }

    const {
      data,
      error,
    } = await supabase
      .from("community_answers")
      .insert({
        question_id: id,
        user_id: user.id,
        body: answer,
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json(
        {
          error:
            "Unable to post your answer.",
        },
        {
          status: 500,
        },
      );
    }

    await supabase
      .from(
        "community_questions",
      )
      .update({
        status: "answered",
      })
      .eq("id", id)
      .eq(
        "status",
        "unanswered",
      );

    return NextResponse.json(
      {
        answerId: data.id,
      },
      {
        status: 201,
      },
    );
  }

  // ==========================================================
  // ANSWER VOTE
  // ==========================================================

  if (
    action === "answer_vote"
  ) {
    const answerId =
      typeof body.answer_id ===
      "string"
        ? body.answer_id
        : "";

    if (!answerId) {
      return NextResponse.json(
        {
          error:
            "Answer is required.",
        },
        {
          status: 400,
        },
      );
    }

    const {
      data: existing,
    } = await supabase
      .from(
        "community_answer_votes",
      )
      .select("answer_id")
      .eq(
        "answer_id",
        answerId,
      )
      .eq(
        "user_id",
        user.id,
      )
      .maybeSingle();

    if (existing) {
      const { error } =
        await supabase
          .from(
            "community_answer_votes",
          )
          .delete()
          .eq(
            "answer_id",
            answerId,
          )
          .eq(
            "user_id",
            user.id,
          );

      if (error) {
        return NextResponse.json(
          {
            error:
              "Unable to remove vote.",
          },
          {
            status: 500,
          },
        );
      }

      return NextResponse.json({
        active: false,
      });
    }

    const { error } =
      await supabase
        .from(
          "community_answer_votes",
        )
        .insert({
          answer_id: answerId,
          user_id: user.id,
        });

    if (error) {
      return NextResponse.json(
        {
          error:
            "Unable to vote.",
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json({
      active: true,
    });
  }

  // ==========================================================
  // ACCEPT ANSWER
  // ==========================================================

  if (
    action === "accept_answer"
  ) {
    const answerId =
      typeof body.answer_id ===
      "string"
        ? body.answer_id
        : "";

    if (!answerId) {
      return NextResponse.json(
        {
          error:
            "Answer is required.",
        },
        {
          status: 400,
        },
      );
    }

    const { error } =
      await supabase.rpc(
        "accept_community_answer",
        {
          p_question_id: id,
          p_answer_id: answerId,
        },
      );

    if (error) {
      return NextResponse.json(
        {
          error: error.message.includes(
            "Not authorized",
          )
            ? "Only the question author can accept an answer."
            : "Unable to accept this answer.",
        },
        {
          status: 403,
        },
      );
    }

    return NextResponse.json({
      ok: true,
    });
  }

  // ==========================================================
  // REPORT
  // ==========================================================

  if (action === "report") {
    const answerId =
      typeof body.answer_id ===
      "string"
        ? body.answer_id
        : null;

    const reason =
      typeof body.reason ===
      "string"
        ? body.reason
        : "other";

    const details =
      typeof body.details ===
      "string"
        ? body.details
            .trim()
            .slice(0, 2000)
        : null;

    if (
      ![
        "spam",
        "harassment",
        "incorrect",
        "copyright",
        "other",
      ].includes(reason)
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid report reason.",
        },
        {
          status: 400,
        },
      );
    }

    const { error } =
      await supabase
        .from(
          "community_reports",
        )
        .insert({
          reporter_id:
            user.id,

          question_id:
            answerId
              ? null
              : id,

          answer_id:
            answerId,

          reason,
          details,
        });

    if (error) {
      return NextResponse.json(
        {
          error:
            "Unable to submit report.",
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

  return NextResponse.json(
    {
      error:
        "Unsupported action.",
    },
    {
      status: 400,
    },
  );
}