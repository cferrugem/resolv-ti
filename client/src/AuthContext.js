import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('customer');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        supabase.from('users').select('role').eq('id', session.user.id).then(({ data }) => {
          if (data && data.length > 0) {
            setRole(data[0].role);
          }
        });
      }
    });

    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setUser(session.user);
        supabase.from('users').select('role').eq('id', session.user.id).then(({ data }) => {
          if (data && data.length > 0) {
            setRole(data[0].role);
          }
        });
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setRole('customer');
      }
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, role }}>
      {children}
    </AuthContext.Provider>
  );
}