import { createContext, useEffect, useState, useContext, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Get the initial session information
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      // 2. If a user exists, check their admin role
      if (session?.user) {
        const { data, error } = await supabase.rpc('is_admin');
        if (error) {
          setIsAdmin(false);
        } else {
          setIsAdmin(!!data);
        }
      }

      // 3. Mark loading as false ONLY after all initial checks are done
      setLoading(false);

      // 4. Now, set up a listener for any FUTURE auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (_event, session) => {
          setSession(session);
          setUser(session?.user ?? null);

          // Re-check admin status on any change
          if (session?.user) {
            const { data } = await supabase.rpc('is_admin');
            setIsAdmin(!!data);
          } else {
            setIsAdmin(false);
          }
        }
      );

      // Return the cleanup function for the listener
      return () => {
        subscription?.unsubscribe();
      };
    });
  }, []);

  const value = useMemo(() => ({ user, session, isAdmin, loading }), [user, session, isAdmin, loading]);

  // Render children only after the initial loading is complete
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};