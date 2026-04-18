import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { supabase } from "../supabase";
import { useState, useEffect } from "react";
import Logo from "./Logo";

function NavBar() {
  const { user, role } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Verificar preferência salva no localStorage ou do sistema
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <nav className="sticky top-0 z-50 glass-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18 py-2">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center mr-8">
              <Link to="/" className="flex items-center transition-transform hover:scale-105">
                <Logo className="h-10 w-auto text-slate-900 dark:text-white transition-colors" />
              </Link>
            </div>
            
            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-colors"
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>

            <div className="hidden sm:flex sm:space-x-2">
              {/* Navigation Links */}
              {role === "staff" ? (
                <>
                  <NavLink
                    className={({ isActive }) =>
                      `${
                        isActive
                          ? "bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300"
                          : "text-slate-600 hover:bg-slate-100/50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700/60 dark:hover:text-slate-100"
                      } px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200`
                    }
                    to="/dashboard"
                  >
                    Painel
                  </NavLink>
                  <NavLink
                    className={({ isActive }) =>
                      `${
                        isActive
                          ? "bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300"
                          : "text-slate-600 hover:bg-slate-100/50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700/60 dark:hover:text-slate-100"
                      } px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200`
                    }
                    to="/tickets"
                  >
                    Todos os Chamados
                  </NavLink>
                </>
              ) : (
                <>
                  <NavLink
                    className={({ isActive }) =>
                      `${
                        isActive
                          ? "bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300"
                          : "text-slate-600 hover:bg-slate-100/50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700/60 dark:hover:text-slate-100"
                      } px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200`
                    }
                    to="/my-tickets"
                  >
                    Meus Chamados
                  </NavLink>
                  <NavLink
                    className={({ isActive }) =>
                      `${
                        isActive
                          ? "bg-primary-50 text-primary-700"
                          : "text-slate-600 hover:bg-slate-100/50 hover:text-slate-900"
                      } px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200`
                    }
                    to="/create-ticket"
                  >
                    Criar Chamado
                  </NavLink>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="mr-2 sm:mr-4 p-2 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              )}
            </button>
            {user ? (
              <div className="flex items-center space-x-5">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-tight">{user.email.split('@')[0]}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide uppercase">{role === 'staff' ? 'Suporte Técnico' : 'Cliente'}</span>
                </div>
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary-500 to-primary-300 flex items-center justify-center text-white font-bold shadow-sm">
                  {user.email.charAt(0).toUpperCase()}
                </div>
                <button
                  onClick={() => supabase.auth.signOut()}
                  className="btn-secondary text-sm px-4 py-1.5"
                >
                  Sair
                </button>
              </div>
            ) : (
              <div className="space-x-3 flex items-center">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400 transition-colors px-4 py-2"
                >
                  Entrar
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm"
                >
                  Criar conta
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Mobile menu, show/hide based on menu state. */}
      {isMenuOpen && (
        <div className="sm:hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 pt-2 pb-3 space-y-1 shadow-lg">
          {role === "staff" ? (
            <>
              <NavLink
                to="/dashboard"
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  `${
                    isActive
                      ? "bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300"
                      : "text-slate-600 hover:bg-slate-100/50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700/60 dark:hover:text-slate-100"
                  } block px-3 py-2 rounded-md text-base font-medium transition-all`
                }
              >
                Painel
              </NavLink>
              <NavLink
                to="/tickets"
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  `${
                    isActive
                      ? "bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300"
                      : "text-slate-600 hover:bg-slate-100/50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700/60 dark:hover:text-slate-100"
                  } block px-3 py-2 rounded-md text-base font-medium transition-all`
                }
              >
                Todos os Chamados
              </NavLink>
            </>
          ) : (
            <>
              <NavLink
                to="/my-tickets"
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  `${
                    isActive
                      ? "bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300"
                      : "text-slate-600 hover:bg-slate-100/50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700/60 dark:hover:text-slate-100"
                  } block px-3 py-2 rounded-md text-base font-medium transition-all`
                }
              >
                Meus Chamados
              </NavLink>
              <NavLink
                to="/create-ticket"
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  `${
                    isActive
                      ? "bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300"
                      : "text-slate-600 hover:bg-slate-100/50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700/60 dark:hover:text-slate-100"
                  } block px-3 py-2 rounded-md text-base font-medium transition-all`
                }
              >
                Criar Chamado
              </NavLink>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

export default NavBar;
