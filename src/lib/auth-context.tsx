"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { User, AuthChangeEvent, Session } from "@supabase/supabase-js";
import type { UserProfile } from "@/types";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = getSupabaseBrowser();

  const fetchProfile = useCallback(
    async (userId: string) => {
      // maybeSingle() returns null (not 406) when no row exists
      const { data } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      setProfile(data ?? null);
    },
    [supabase]
  );

  useEffect(() => {
    const init = async () => {
      const result = await supabase.auth.getUser();
      const currentUser: User | null = result.data?.user ?? null;
      setUser(currentUser);
      if (currentUser) fetchProfile(currentUser.id);
      setLoading(false);
    };
    init();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        const currentUser: User | null = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          fetchProfile(currentUser.id);
        } else {
          setProfile(null);
        }
      }
    );

    return () => authListener.subscription.unsubscribe();
  }, [supabase, fetchProfile]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
