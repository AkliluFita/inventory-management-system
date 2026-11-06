import { supabase, supabaseConfigured } from "@/data/supabase";
import type { AuthError, Session } from "@supabase/supabase-js";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type AuthContextValue = {
  session: Session | null;
  loading: boolean;
  demo: boolean;
  enterDemo: () => void;
  exitDemo: () => void;
  signIn: (phone: string, password: string) => Promise<void>;
  signUp: (phone: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function authError(error: AuthError): Error {
  if (error.code === "phone_provider_disabled") return new Error("Phone sign-in is not available yet. Please contact the workspace owner.");
  if (error.code === "phone_exists" || error.code === "user_already_exists" || /already (registered|exists)/i.test(error.message)) {
    return new Error("This phone number is already registered. Sign in instead.");
  }
  return error;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [demo, setDemo] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) console.warn("Could not restore session:", error.message);
      setSession(data.session);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (active) { setSession(nextSession); if (nextSession) setDemo(false); }
    });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);

  const signIn = useCallback(async (phone: string, password: string) => {
    if (!supabaseConfigured) throw new Error("Supabase is not configured.");
    const { error } = await supabase.auth.signInWithPassword({ phone, password });
    if (error) throw authError(error);
    setDemo(false);
  }, []);
  const signUp = useCallback(async (phone: string, password: string) => {
    if (!supabaseConfigured) throw new Error("Supabase is not configured.");
    const { data, error } = await supabase.auth.signUp({ phone, password });
    if (error) throw authError(error);
    if (!data.session) throw new Error("Phone account sign-up needs confirmation disabled in Supabase Auth settings.");
  }, []);
  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setSession(null);
    setDemo(false);
  }, []);
  const value = useMemo(() => ({
    session, loading, demo, enterDemo: () => setDemo(true), exitDemo: () => setDemo(false),
    signIn, signUp, signOut,
  }), [session, loading, demo, signIn, signUp, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within AuthProvider");
  return value;
}
