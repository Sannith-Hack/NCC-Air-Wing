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
  
  // This flag prevents the onAuthStateChange listener from running
  // until *after* the initial getSession() has completed.
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Helper function to check admin status
  const checkAdminStatus = async () => {
    try {
      const { data, error } = await supabase.rpc('is_admin');
      if (error) throw error;
      console.log("Admin status check successful. Is admin:", !!data);
      setIsAdmin(!!data);
    } catch (error: any) {
      console.error("Error during admin check:", error.message);
      setIsAdmin(false); // Default to not-admin on error
    }
  };

  // 1. Handle Initial Page Load (getSession)
  useEffect(() => {
    console.log("AuthProvider mounted. Fetching initial session.");
    setLoading(true);

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log("Initial session fetched:", session);
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        console.log("User found (getSession), checking admin status...");
        await checkAdminStatus();
      }
      
      console.log("Initial auth flow finished (getSession). Setting loading to false.");
      setLoading(false);
      
      // Now that the initial load is done, we can allow
      // the onAuthStateChange listener to take over.
      setInitialLoadComplete(true);
    });
  }, []); // This effect runs only ONCE on mount

  // 2. Handle Subsequent Auth Changes (onAuthStateChange)
  useEffect(() => {
    // Only subscribe to changes *after* the initial load is complete.
    // This prevents the "double-run" bug on page refresh.
    if (!initialLoadComplete) {
      console.log("Skipping auth listener setup until initial load is complete.");
      return;
    }

    console.log("Setting up auth state change listener.");
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.log("Auth state changed (listener):", _event);

        // --- THIS IS THE UPDATED LOGIC ---
        // We now handle each auth event explicitly
        switch (_event) {
          case 'SIGNED_IN':
            // Fires when a user logs in.
            console.log("Auth listener: User SIGNED_IN.");
            setSession(session);
            setUser(session?.user ?? null);
            await checkAdminStatus(); // Check admin on new sign-in
            break;
          
          case 'SIGNED_OUT':
            // Fires when a user logs out.
            console.log("Auth listener: User SIGNED_OUT.");
            setSession(null);
            setUser(null);
            setIsAdmin(false); // Clear admin on sign-out
            break;
          
          case 'TOKEN_REFRESHED':
            // Fires on tab focus or when token is auto-refreshed.
            // This is what was causing your bug.
            console.log("Auth listener: Token refreshed, updating session.");
            setSession(session);
            setUser(session?.user ?? null);
            // *** We no longer call checkAdminStatus() here ***
            break;

          case 'USER_UPDATED':
            // Fires if user's email/password is updated.
            console.log("Auth listener: User updated.");
            setUser(session?.user ?? null);
            break;

          case 'INITIAL_SESSION':
            // This is handled by getSession, so we skip it.
            console.log("Auth listener: Skipping INITIAL_SESSION.");
            break;
            
          default:
            console.log(`Auth listener: Unhandled event: ${_event}`);
        }
        // --- END OF UPDATED LOGIC ---
      }
    );

    // Cleanup
    return () => {
      console.log("Unsubscribing from auth state changes.");
      subscription?.unsubscribe();
    };
  }, [initialLoadComplete]); // This effect now depends on initialLoadComplete

  const value = { user, session, isAdmin, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};