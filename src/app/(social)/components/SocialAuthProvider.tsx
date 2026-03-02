"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type {
  User,
  Session,
  SupabaseClient,
  AuthChangeEvent,
} from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";

interface SocialAuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const SocialAuthContext = createContext<SocialAuthContextValue | undefined>(
  undefined
);

function createSocialBrowserClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SOCIAL_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SOCIAL_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createBrowserClient(url, key);
}

let browserClient: SupabaseClient | null = null;

function getSocialBrowserClient(): SupabaseClient | null {
  if (!browserClient) {
    browserClient = createSocialBrowserClient();
  }
  return browserClient;
}

export function SocialAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);

  useEffect(() => {
    const client = getSocialBrowserClient();
    if (!client) {
      setLoading(false);
      return;
    }
    setSupabase(client);

    client.auth
      .getSession()
      .then(
        ({
          data: { session: s },
        }: {
          data: { session: Session | null };
        }) => {
          setSession(s);
          setUser(s?.user ?? null);
          setLoading(false);
        }
      );

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(
      (_event: AuthChangeEvent, s: Session | null) => {
        setSession(s);
        setUser(s?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { hd: "mesocrats.org" },
      },
    });
  }, [supabase]);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  }, [supabase]);

  return (
    <SocialAuthContext.Provider
      value={{ user, session, loading, signInWithGoogle, signOut }}
    >
      {children}
    </SocialAuthContext.Provider>
  );
}

export function useSocialAuth() {
  const ctx = useContext(SocialAuthContext);
  if (!ctx)
    throw new Error("useSocialAuth must be used within SocialAuthProvider");
  return ctx;
}

export function SocialAuthProviderWrapper({
  children,
}: {
  children: ReactNode;
}) {
  return <SocialAuthProvider>{children}</SocialAuthProvider>;
}
