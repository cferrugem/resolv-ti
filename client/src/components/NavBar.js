import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { supabase } from "../supabase";
<<<<<<< HEAD
import { useState, useEffect } from "react";
import Logo from "./Logo";

function NavBar() {
  const { user, role } = useAuth();
  
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
            
            <div className="hidden sm:flex sm:space-x-2">
=======

function NavBar() {
  const { user, role } = useAuth();

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <img
                  src={`${process.env.PUBLIC_URL}/logo.png`}
                  alt="ResolvTI Logo"
                  className="h-16 w-auto"
                />
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
>>>>>>> 66b67d6b8b221d15e3289bfd3d220f1bbb24760a
              {/* Navigation Links */}
              {role === "staff" ? (
                <>
                  <NavLink
                    className={({ isActive }) =>
                      `${
                        isActive
<<<<<<< HEAD
                          ? "bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300"
                          : "text-slate-600 hover:bg-slate-100/50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700/60 dark:hover:text-slate-100"
                      } px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200`
=======
                          ? "border-primary-500 text-gray-900"
                          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                      } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`
>>>>>>> 66b67d6b8b221d15e3289bfd3d220f1bbb24760a
                    }
                    to="/dashboard"
                  >
                    Painel
                  </NavLink>
                  <NavLink
                    className={({ isActive }) =>
                      `${
                        isActive
<<<<<<< HEAD
                          ? "bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300"
                          : "text-slate-600 hover:bg-slate-100/50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700/60 dark:hover:text-slate-100"
                      } px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200`
=======
                          ? "border-primary-500 text-gray-900"
                          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                      } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`
>>>>>>> 66b67d6b8b221d15e3289bfd3d220f1bbb24760a
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
<<<<<<< HEAD
                          ? "bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300"
                          : "text-slate-600 hover:bg-slate-100/50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700/60 dark:hover:text-slate-100"
                      } px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200`
=======
                          ? "border-primary-500 text-gray-900"
                          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                      } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`
>>>>>>> 66b67d6b8b221d15e3289bfd3d220f1bbb24760a
                    }
                    to="/my-tickets"
                  >
                    Meus Chamados
                  </NavLink>
                  <NavLink
                    className={({ isActive }) =>
                      `${
                        isActive
<<<<<<< HEAD
                          ? "bg-primary-50 text-primary-700"
                          : "text-slate-600 hover:bg-slate-100/50 hover:text-slate-900"
                      } px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200`
=======
                          ? "border-primary-500 text-gray-900"
                          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                      } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`
>>>>>>> 66b67d6b8b221d15e3289bfd3d220f1bbb24760a
                    }
                    to="/create-ticket"
                  >
                    Criar Chamado
                  </NavLink>
                </>
              )}
            </div>
          </div>
<<<<<<< HEAD
          
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
=======
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">{user.email}</span>
                <button
                  onClick={() => supabase.auth.signOut()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
>>>>>>> 66b67d6b8b221d15e3289bfd3d220f1bbb24760a
                >
                  Sair
                </button>
              </div>
            ) : (
<<<<<<< HEAD
              <div className="space-x-3 flex items-center">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400 transition-colors px-4 py-2"
=======
              <div className="space-x-4">
                <Link
                  to="/login"
                  className="text-primary-600 hover:text-primary-700"
>>>>>>> 66b67d6b8b221d15e3289bfd3d220f1bbb24760a
                >
                  Entrar
                </Link>
                <Link
                  to="/register"
<<<<<<< HEAD
                  className="btn-primary text-sm"
                >
                  Criar conta
=======
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  Registrar
>>>>>>> 66b67d6b8b221d15e3289bfd3d220f1bbb24760a
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
