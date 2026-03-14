import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import Logo from './Logo';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', (await supabase.auth.getUser()).data.user.id)
        .single();

      // Redirect based on role
      if (userData?.role === 'staff') {
        navigate('/tickets');
      } else {
        navigate('/my-tickets');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-300 dark:bg-primary-900/30 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-3xl opacity-30 animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-300 dark:bg-indigo-900/30 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-3xl opacity-30 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>

      <div className="max-w-md w-full glass-card p-10 z-10">
        <div className="flex flex-col items-center">
          <Logo className="h-16 w-auto mb-6 text-slate-900 dark:text-white transition-colors" />
          <h2 className="text-center text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
            Bem-vindo de volta
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
            Entre para gerenciar seus chamados de suporte
          </p>
        </div>

        {error && (
          <div className="mt-6 bg-red-50/80 dark:bg-red-900/20 backdrop-blur-sm border-l-4 border-red-500 p-4 rounded-r-xl">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700 dark:text-red-300 font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                E-mail corporativo
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full px-4 py-3 form-input-dark sm:text-sm"
                placeholder="nome@empresa.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none block w-full px-4 py-3 form-input-dark sm:text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3 text-base shadow-primary-500/30"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Autenticando...
                </>
              ) : (
                'Entrar na Plataforma'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}