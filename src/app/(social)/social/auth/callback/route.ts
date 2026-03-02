import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/sign-in?error=missing_code`);
  }

  const response = NextResponse.redirect(origin);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SOCIAL_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SOCIAL_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { error, data } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/sign-in?error=auth_failed`);
  }

  // Enforce @mesocrats.org domain
  const email = data.session?.user?.email;
  if (!email || !email.toLowerCase().endsWith("@mesocrats.org")) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/sign-in?error=unauthorized`);
  }

  return response;
}
