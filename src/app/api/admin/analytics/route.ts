// fixing deployemeny error
import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  AdminAuthorizationError,
  requireAdminApi,
} from "@/lib/admin";

export const dynamic =
  "force-dynamic";

type PlatformEvent = {
  event_name: string | null;
  event_category: string | null;
  user_id: string | null;
  created_at: string;
};

export async function GET(
  request: NextRequest,
) {
  try {
    const {
      adminSupabase,
    } =
      await requireAdminApi();

    const requestedDays =
      Number(
        request.nextUrl.searchParams.get(
          "days",
        ) ?? "30",
      );

    const days =
      Number.isFinite(
        requestedDays,
      )
        ? Math.min(
            90,
            Math.max(
              1,
              Math.floor(
                requestedDays,
              ),
            ),
          )
        : 30;

    const since = new Date(
      Date.now() -
        days *
          24 *
          60 *
          60 *
          1000,
    ).toISOString();

    const {
      data,
      error,
    } =
      await adminSupabase
        .from("platform_events")
        .select(
          `
            event_name,
            event_category,
            user_id,
            created_at
          `,
        )
        .gte(
          "created_at",
          since,
        )
        .order(
          "created_at",
          {
            ascending: true,
          },
        );

    if (error) {
      console.error(
        "[ADMIN_ANALYTICS_QUERY]",
        error,
      );

      return NextResponse.json(
        {
          error:
            "Unable to load analytics data.",
        },
        {
          status: 500,
        },
      );
    }

    const rows =
      (data ??
        []) as PlatformEvent[];

    /*
     * Daily activity.
     */

    const daily =
      new Map<
        string,
        {
          events: number;
          users: Set<string>;
        }
      >();

    /*
     * Event counts.
     */

    const eventCounts =
      new Map<
        string,
        number
      >();

    /*
     * Category counts.
     */

    const categoryCounts =
      new Map<
        string,
        number
      >();

    /*
     * Unique users.
     */

    const uniqueUsers =
      new Set<string>();

    for (const event of rows) {
      const date =
        event.created_at.slice(
          0,
          10,
        );

      const dailyEntry =
        daily.get(date) ??
        {
          events: 0,
          users:
            new Set<string>(),
        };

      dailyEntry.events += 1;

      if (event.user_id) {
        dailyEntry.users.add(
          event.user_id,
        );
        uniqueUsers.add(
          event.user_id,
        );
      }

      daily.set(
        date,
        dailyEntry,
      );

      const eventName =
        event.event_name?.trim() ||
        "unknown";

      eventCounts.set(
        eventName,
        (eventCounts.get(
          eventName,
        ) ?? 0) + 1,
      );

      const category =
        event.event_category?.trim() ||
        "uncategorized";

      categoryCounts.set(
        category,
        (categoryCounts.get(
          category,
        ) ?? 0) + 1,
      );
    }

    const dailyRows =
      [...daily.entries()]
        .map(
          ([date, value]) => ({
            date,
            events:
              value.events,
            users:
              value.users.size,
          }),
        );

    const byEvent =
      [...eventCounts.entries()]
        .sort(
          (a, b) =>
            b[1] - a[1],
        )
        .slice(0, 20);

    const byCategory =
      [
        ...categoryCounts.entries(),
      ]
        .sort(
          (a, b) =>
            b[1] - a[1],
        )
        .slice(0, 20);

    return NextResponse.json(
      {
        range: {
          days,
          since,
          until:
            new Date().toISOString(),
        },

        summary: {
          events:
            rows.length,
          uniqueUsers:
            uniqueUsers.size,
          activeDays:
            daily.size,
        },

        daily:
          dailyRows,

        byEvent,

        byCategory,
      },
      {
        headers: {
          "Cache-Control":
            "private, no-store",
        },
      },
    );
  } catch (error) {
    if (
      error instanceof
      AdminAuthorizationError
    ) {
      return NextResponse.json(
        {
          error:
            error.message,
        },
        {
          status:
            error.status,
        },
      );
    }

    console.error(
      "[ADMIN_ANALYTICS]",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to load analytics.",
      },
      {
        status: 500,
      },
    );
  }
}