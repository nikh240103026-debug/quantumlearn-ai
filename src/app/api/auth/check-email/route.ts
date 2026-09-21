import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email =
      typeof body?.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    if (!email) {
      return NextResponse.json(
        {
          exists: false,
          error: "Email address is required.",
        },
        { status: 400 },
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        {
          exists: false,
          error: "Please provide a valid email address.",
        },
        { status: 400 },
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    /*
     * Prefer the newer Supabase secret key.
     *
     * SUPABASE_SERVICE_ROLE_KEY is also supported so that
     * existing projects using the legacy key continue to work.
     */
    const supabaseSecretKey =
      process.env.SUPABASE_SECRET_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseSecretKey) {
      console.error(
        "[CHECK EMAIL] Missing Supabase server environment variables.",
      );

      return NextResponse.json(
        {
          exists: false,
          error: "Server authentication configuration is incomplete.",
        },
        { status: 500 },
      );
    }

    /*
     * IMPORTANT:
     * This client is created only on the server.
     * Never expose the secret/service-role key to the browser.
     */
    const supabaseAdmin = createClient(
      supabaseUrl,
      supabaseSecretKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        },
      },
    );

    /*
     * Supabase Admin API returns users in pages.
     *
     * We search through all pages so this continues working
     * even when the project has more than 1,000 users.
     */
    let page = 1;
    const perPage = 1000;

    while (true) {
      const {
        data,
        error,
      } = await supabaseAdmin.auth.admin.listUsers({
        page,
        perPage,
      });

      if (error) {
        console.error(
          "[CHECK EMAIL] Supabase admin error:",
          error,
        );

        return NextResponse.json(
          {
            exists: false,
            error: "Unable to check the email address.",
          },
          { status: 500 },
        );
      }

      const users = data?.users ?? [];

      const emailExists = users.some(
        (user) =>
          typeof user.email === "string" &&
          user.email.trim().toLowerCase() === email,
      );

      if (emailExists) {
        return NextResponse.json({
          exists: true,
        });
      }

      /*
       * If fewer users than the page size were returned,
       * there are no more pages to search.
       */
      if (users.length < perPage) {
        break;
      }

      page += 1;
    }

    return NextResponse.json({
      exists: false,
    });
  } catch (error) {
    console.error("[CHECK EMAIL] Unexpected error:", error);

    return NextResponse.json(
      {
        exists: false,
        error: "Unable to check the email address.",
      },
      { status: 500 },
    );
  }
}