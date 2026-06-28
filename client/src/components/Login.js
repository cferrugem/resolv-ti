import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabase';
import Logo from './Logo';
import Button from './ui/Button';
import Card from './ui/Card';

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
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;

      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', (await supabase.auth.getUser()).data.user.id)
        .single();

      navigate(userData?.role === 'staff' ? '/dashboard' : '/my-tickets');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 relative">
      {/* Background Orbs */}
      <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-[120px] animate-pulse-slow pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] animate-pulse-slow pointer-events-none" style={{ animationDelay: '2s' }}></div>

      <Card variant="glass" className="max-w-md w-full !p-8 sm:!p-12 relative z-10 border-white/10 shadow-2xl">
        <div className="flex flex-col items-center mb-10">
          <div className="p-4 bg-white dark:bg-slate-800 rounded-3xl shadow-xl mb-6 ring-1 ring-slate-200 dark:ring-white/10 transition-transform hover:scale-110 duration-500">
            <Logo className="h-10 w-auto text-slate-900 dark:text-white" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight text-center">Acesso ResolvTI</h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-widest text-[10px]">Portal Corporativo</p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3">
             <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
             <p className="text-xs font-bold text-red-600 dark:text-red-400 leading-relaxed">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Endereço de E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
              placeholder="seu@empresa.com"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2 ml-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Senha Corporativa</label>
              <Link to="/forgot" className="text-[10px] font-black text-primary-500 uppercase tracking-widest hover:underline">Esqueci</Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" className="w-full py-4 text-base shadow-lg shadow-primary-500/25" isLoading={isLoading}>
            ENTRAR NA PLATAFORMA
          </Button>
        </form>

        <p className="mt-10 text-center text-xs text-slate-500 dark:text-slate-500 font-bold uppercase tracking-widest">
          Novo na Resolv? <Link to="/register" className="text-primary-500 hover:text-primary-600 transition-colors">Solicitar Acesso</Link>
        </p>
      </Card>
    </div>
  );
}