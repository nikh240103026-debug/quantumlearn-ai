import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase-server";

const VALID_TYPES = [
  "bug",
  "feature",
  "content",
  "ai_response",
  "general",
  "support",
] as const;

type FeedbackType = (typeof VALID_TYPES)[number];

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

    const formData =
      await request.formData();

    const type =
      cleanString(
        formData.get("type"),
      ) as FeedbackType | null;

    const description =
      cleanString(
        formData.get("description"),
      );

    const page =
      cleanString(
        formData.get("page"),
      );

    const tryingToDo =
      cleanString(
        formData.get("tryingToDo"),
      );

    const errorId =
      cleanString(
        formData.get("errorId"),
      );

    if (
      !type ||
      !VALID_TYPES.includes(type)
    ) {
      return NextResponse.json(
        {
          error:
            "Please select a valid feedback type.",
        },
        {
          status: 400,
        },
      );
    }

    if (!description) {
      return NextResponse.json(
        {
          error:
            "Please describe your feedback.",
        },
        {
          status: 400,
        },
      );
    }

    if (description.length > 5000) {
      return NextResponse.json(
        {
          error:
            "Feedback must be 5,000 characters or less.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      tryingToDo &&
      tryingToDo.length > 2000
    ) {
      return NextResponse.json(
        {
          error:
            "The action description must be 2,000 characters or less.",
        },
        {
          status: 400,
        },
      );
    }

    const userAgent =
      request.headers.get(
        "user-agent",
      );

    const screenshot =
      formData.get("screenshot");

    let screenshotUrl: string | null =
      null;

    // ========================================================
    // SCREENSHOT UPLOAD
    // ========================================================

    if (
      screenshot instanceof File &&
      screenshot.size > 0
    ) {
      const MAX_FILE_SIZE =
        5 * 1024 * 1024;

      if (
        screenshot.size >
        MAX_FILE_SIZE
      ) {
        return NextResponse.json(
          {
            error:
              "Screenshot must be 5 MB or smaller.",
          },
          {
            status: 400,
          },
        );
      }

      const allowedTypes = [
        "image/png",
        "image/jpeg",
        "image/webp",
      ];

      if (
        !allowedTypes.includes(
          screenshot.type,
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Screenshot must be PNG, JPG, or WebP.",
          },
          {
            status: 400,
          },
        );
      }

      const extension =
        screenshot.name
          .split(".")
          .pop()
          ?.toLowerCase() ?? "png";

      const fileName = `${crypto.randomUUID()}.${extension}`;

      const filePath = `${user.id}/${fileName}`;

      const {
        error: uploadError,
      } = await supabase.storage
        .from(
          "feedback-screenshots",
        )
        .upload(
          filePath,
          screenshot,
          {
            contentType:
              screenshot.type,
            upsert: false,
          },
        );

      if (uploadError) {
        console.error(
          "Feedback screenshot upload failed:",
          uploadError,
        );

        return NextResponse.json(
          {
            error:
              "Unable to upload the screenshot.",
          },
          {
            status: 500,
          },
        );
      }

      screenshotUrl = filePath;
    }

    // ========================================================
    // DEVICE INFORMATION
    // ========================================================

    const device =
      detectDevice(userAgent);

    // ========================================================
    // DATABASE INSERT
    // ========================================================

    const {
      data,
      error,
    } = await supabase
      .from("feedback")
      .insert({
        user_id: user.id,
        feedback_type: type,
        description,
        page,
        trying_to_do: tryingToDo,
        screenshot_url:
          screenshotUrl,
        browser:
          userAgent,
        device,
        user_agent:
          userAgent,
        error_id:
          errorId,
        status: "open",
      })
      .select(
        `
          id,
          user_id,
          feedback_type,
          description,
          page,
          trying_to_do,
          screenshot_url,
          browser,
          device,
          user_agent,
          error_id,
          status,
          admin_notes,
          created_at,
          updated_at
        `,
      )
      .single();

    if (error) {
      console.error(
        "Failed to create feedback:",
        error,
      );

      // Remove uploaded screenshot if
      // database insertion failed.
      if (screenshotUrl) {
        await supabase.storage
          .from(
            "feedback-screenshots",
          )
          .remove([
            screenshotUrl,
          ]);
      }

      return NextResponse.json(
        {
          error:
            "Unable to submit feedback right now.",
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json(
      {
        success: true,
        feedback: data,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "Feedback API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while submitting your feedback.",
      },
      {
        status: 500,
      },
    );
  }
}

// ============================================================
// DEVICE DETECTION
// ============================================================

function detectDevice(
  userAgent: string | null,
): string | null {
  if (!userAgent) {
    return null;
  }

  if (
    /tablet|ipad/i.test(
      userAgent,
    )
  ) {
    return "tablet";
  }

  if (
    /mobile|android|iphone|ipod/i.test(
      userAgent,
    )
  ) {
    return "mobile";
  }

  return "desktop";
}