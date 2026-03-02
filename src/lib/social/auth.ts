import { createServerSupabase } from "./supabase";

const ALLOWED_DOMAIN = "mesocrats.org";

export function isMesocratsEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  return email.toLowerCase().endsWith(`@${ALLOWED_DOMAIN}`);
}

/**
 * Verify the request is from an authenticated @mesocrats.org user.
 * Checks the Authorization header for a Supabase access token.
 * Returns the user if valid, null otherwise.
 */
export async function verifyApiAuth(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);
  const supabase = createServerSupabase();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) return null;
  if (!isMesocratsEmail(user.email)) return null;

  return user;
}
