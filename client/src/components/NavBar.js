import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { supabase } from "../supabase";
import { useState, useEffect } from "react";
import Logo from "./Logo";
import Button from "./ui/Button";

function NavBar() {
  const { user, role } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      return savedTheme ? savedTheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const navLinkClasses = ({ isActive }) => 
    `${isActive 
      ? "bg-primary-500/10 text-primary-600 dark:text-primary-400" 
      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"} 
    px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200`;

  return (
    <nav className="sticky top-0 z-50 glass-header border-b border-slate-200/40 dark:border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-8">
            <Link to="/" className="transition-transform hover:scale-105 active:scale-95">
              <Logo className="h-9 w-auto text-slate-900 dark:text-white" />
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {role === "staff" ? (
                <>
                  <NavLink to="/dashboard" className={navLinkClasses}>Painel</NavLink>
                  <NavLink to="/tickets" className={navLinkClasses}>Chamados</NavLink>
                </>
              ) : (
                <>
                  <NavLink to="/my-tickets" className={navLinkClasses}>Meus Chamados</NavLink>
                  <NavLink to="/create-ticket" className={navLinkClasses}>Novo Chamado</NavLink>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5 transition-all active:scale-90"
              aria-label="Alternar Tema"
            >
              {isDarkMode ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>

            {user ? (
              <div className="flex items-center gap-4 ml-2 pl-4 border-l border-slate-200 dark:border-white/10">
                <div className="hidden lg:block text-right">
                  <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">{user.email.split('@')[0]}</p>
                  <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest mt-1">{role === 'staff' ? 'Suporte' : 'Cliente'}</p>
                </div>
                <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-primary-600 to-primary-400 flex items-center justify-center text-white font-black shadow-glow ring-2 ring-white dark:ring-slate-900">
                  {user.email.charAt(0).toUpperCase()}
                </div>
                <Button variant="ghost" size="sm" onClick={() => supabase.auth.signOut()} className="!text-slate-500 !font-bold">Sair</Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">Entrar</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Começar</Button>
                </Link>
              </div>
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden glass-header border-t border-slate-200/40 dark:border-white/5 p-4 space-y-2 animate-in slide-in-from-top duration-200">
          {role === "staff" ? (
            <>
              <NavLink to="/dashboard" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-400 active:bg-primary-500/10 active:text-primary-600">Painel</NavLink>
              <NavLink to="/tickets" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-400 active:bg-primary-500/10 active:text-primary-600">Todos os Chamados</NavLink>
            </>
          ) : (
            <>
              <NavLink to="/my-tickets" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-400 active:bg-primary-500/10 active:text-primary-600">Meus Chamados</NavLink>
              <NavLink to="/create-ticket" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-400 active:bg-primary-500/10 active:text-primary-600">Criar Chamado</NavLink>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

export default NavBar;
