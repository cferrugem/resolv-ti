import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from './supabase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    user: undefined,
    role: undefined,
    isLoading: true
  });

  // Tracks whether we've already resolved auth to avoid duplicate fetchRole calls
  // if both getSession() and onAuthStateChange fire for the same session.
  const resolvedRef = useRef(false);

  useEffect(() => {
    const fetchRole = async (userId) => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', userId)
          .single();
        if (error) throw error;
        return data?.role ?? null;
      } catch (err) {
        console.error('Error fetching role:', err);
        return null;
      }
    };

    const resolveAuth = async (session) => {
      if (resolvedRef.current) return; // already resolved, skip duplicate event
      resolvedRef.current = true;

      if (session) {
        const role = await fetchRole(session.user.id);
        setAuthState({ user: session.user, role, isLoading: false });
      } else {
        setAuthState({ user: null, role: null, isLoading: false });
      }
    };

    // ── Primary path: getSession() resolves from local storage ──
    // We add a catch block to handle any localStorage/cookie exceptions in Chrome
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        resolveAuth(session);
      })
      .catch((err) => {
        console.error('Error getting session:', err);
        resolveAuth(null); // Fallback: resolve as not authenticated
      });

    // ── Secondary path: onAuthStateChange handles initial & subsequent events ──
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'INITIAL_SESSION') {
        resolveAuth(session);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // Reset the guard so re-login after logout works correctly
        resolvedRef.current = false;
        resolveAuth(session);
      } else if (event === 'SIGNED_OUT') {
        resolvedRef.current = false;
        setAuthState({ user: null, role: null, isLoading: false });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
}