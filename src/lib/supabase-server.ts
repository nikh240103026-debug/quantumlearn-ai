import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies, headers } from "next/headers";

function createCookieClient(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },

        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Components cannot always modify cookies.
          }
        },
      },
    },
  );
}

// Both branches expose exactly the cookie client's type, so every route
// keeps its existing typing.
type ServerClient = ReturnType<typeof createCookieClient>;

/*
 * Bearer-token clients (QuantumLearn mobile app).
 *
 * The website authenticates with Supabase session cookies. The mobile app
 * has no cookies, so it sends `Authorization: Bearer <access token>`.
 * When that header is present, build a client that:
 *   - sends the token on every database request, so RLS sees the user;
 *   - verifies the token with Supabase in auth.getUser() (no local trust).
 * Browser requests never send this header, so the website is unaffected.
 */
function createBearerClient(token: string): ServerClient {
  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  );

  // Routes call supabase.auth.getUser() with no argument; with no stored
  // session that would fail, so verify the bearer token instead.
  const getUser = client.auth.getUser.bind(client.auth);
  client.auth.getUser = (jwt?: string) => getUser(jwt ?? token);

  return client as unknown as ServerClient;
}

function bearerToken(authorization: string | null): string | null {
  const match = authorization?.match(/^Bearer\s+(.+)$/i);
  const token = match?.[1]?.trim();

  // A Supabase access token is a JWT (three dot-separated parts).
  return token && token.split(".").length === 3 ? token : null;
}

export async function createSupabaseServerClient(): Promise<ServerClient> {
  let authorization: string | null = null;

  try {
    authorization = (await headers()).get("authorization");
  } catch {
    // Outside a request (e.g. build time): no headers, use cookies.
  }

  const token = bearerToken(authorization);

  if (token) {
    return createBearerClient(token);
  }

  return createCookieClient(await cookies());
}
