import { createContext, useEffect, useState, useContext } from "react";
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
    console.log("AuthProvider mounted. Kicking off session check.");

    // 1. Get the initial session information
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log("Initial session fetched:", session);
      setSession(session);
      setUser(session?.user ?? null);

      // 2. If a user exists, check their admin role
      if (session?.user) {
        console.log("User found, checking admin status...");
        const { data, error } = await supabase.rpc('is_admin');
        if (error) {
          console.error("Error during admin check:", error.message);
          setIsAdmin(false);
        } else {
          console.log("Admin status check successful. Is admin:", !!data);
          setIsAdmin(!!data);
        }
      }

      // 3. Mark loading as false ONLY after all initial checks are done
      console.log("Initial auth flow finished. Setting loading to false.");
      setLoading(false);

      // 4. Now, set up a listener for any FUTURE auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (_event, session) => {
          console.log("Auth state changed:", _event, session);
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
        console.log("Unsubscribing from auth state changes.");
        subscription?.unsubscribe();
      };
    });
  }, []);

  const value = { user, session, isAdmin, loading };

  // Render children only after the initial loading is complete
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};