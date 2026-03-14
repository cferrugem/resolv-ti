import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined);
  const [role, setRole] = useState(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single();

          setUser(session.user);
          setRole(userData?.role);
        } else {
          setUser(null);
          setRole(null);
        }
      } catch (error) {
        console.error('Auth error:', error);
        setUser(null);
        setRole(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        setUser(session.user);
        supabase.from('users').select('role').eq('id', session.user.id).then(({ data }) => {
          if (data && data.length > 0) {
            setRole(data[0].role);
          }
        });
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
<<<<<<< HEAD
        setRole(null);
=======
        setRole('customer');
>>>>>>> 66b67d6b8b221d15e3289bfd3d220f1bbb24760a
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}