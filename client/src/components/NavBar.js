import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabase';

function NavBar() {
  const { user, role } = useAuth();

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-2xl font-display font-bold text-primary-600">
                ResolvTI
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {/* Navigation Links */}
              {role === 'staff' ? (
                <>
                  <NavLink className={({ isActive }) =>
                    `${isActive ? 'border-primary-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`
                  } to="/dashboard">
                    Painel
                  </NavLink>
                  <NavLink className={({ isActive }) =>
                    `${isActive ? 'border-primary-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`
                  } to="/tickets">
                    Todos os Chamados
                  </NavLink>
                </>
              ) : (
                <>
                  <NavLink className={({ isActive }) =>
                    `${isActive ? 'border-primary-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`
                  } to="/my-tickets">
                    Meus Chamados
                  </NavLink>
                  <NavLink className={({ isActive }) =>
                    `${isActive ? 'border-primary-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`
                  } to="/create-ticket">
                    Criar Chamado
                  </NavLink>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">{user.email}</span>
                <button
                  onClick={() => supabase.auth.signOut()} 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                >
                  Sair
                </button>
              </div>
            ) : (
              <div className="space-x-4">
                <Link to="/login" className="text-primary-600 hover:text-primary-700">
                  Entrar
                </Link>
                <Link to="/register" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
                  Registrar
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