import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { supabase } from "../lib/supabase";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const pendingCallbackRef = useRef(null);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      const prevUser = user;
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false);

      // If we just got a user (login event) and there's a pending callback, run it
      if (newSession?.user && !prevUser && pendingCallbackRef.current) {
        const cb = pendingCallbackRef.current;
        pendingCallbackRef.current = null;
        setAuthModalOpen(false);
        // Small delay to let auth state settle
        setTimeout(cb, 100);
      }
    });

    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  }

  async function signUp(email, password, metadata = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    });
    if (error) throw error;
    return data;
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  /**
   * Opens the auth modal. Optionally accepts a callback to run after
   * successful login (used by useAuthGuard).
   */
  const openAuthModal = useCallback((onSuccessCallback = null) => {
    if (onSuccessCallback) {
      pendingCallbackRef.current = onSuccessCallback;
    }
    setAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    pendingCallbackRef.current = null;
    setAuthModalOpen(false);
  }, []);

  /**
   * Call this from the AuthModal after a successful sign-in to
   * immediately run the pending callback and close the modal.
   */
  const handleAuthSuccess = useCallback(() => {
    const cb = pendingCallbackRef.current;
    pendingCallbackRef.current = null;
    setAuthModalOpen(false);
    if (cb) setTimeout(cb, 100);
  }, []);

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin: user?.role === "admin",
    // Auth modal control (used by useAuthGuard)
    authModalOpen,
    openAuthModal,
    closeAuthModal,
    handleAuthSuccess,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
