import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import NavBar from './components/NavBar';
import RequireAuth from './components/RequireAuth';

// Eagerly loaded (tiny, always needed)
import Login from './components/Login';
import Register from './components/Register';

// Lazy-loaded page bundles — only downloaded when the user navigates to them
const Dashboard    = lazy(() => import('./pages/Dashboard'));
const MyTickets    = lazy(() => import('./pages/MyTickets'));
const CreateTicket = lazy(() => import('./components/CreateTicket'));
const TicketDetails = lazy(() => import('./pages/TicketDetails'));
const TicketList   = lazy(() => import('./pages/TicketList'));

// Simple full-page loading fallback used by Suspense
function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-4 border-primary-500/20 border-t-primary-500 animate-spin" />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
          <NavBar />
          <main className="py-6 sm:py-10">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } />
                <Route path="/register" element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                } />

                {/* Protected routes */}
                {/* Root route with proper role-based redirect handled inside RequireAuth */}
                <Route path="/" element={<RequireAuth />} />

                <Route path="/dashboard" element={
                  <RequireAuth role="staff">
                    <Dashboard />
                  </RequireAuth>
                } />
                
                <Route path="/tickets" element={
                  <RequireAuth role="staff">
                    <TicketList />
                  </RequireAuth>
                } />

                <Route path="/my-tickets" element={
                  <RequireAuth role="customer">
                    <MyTickets />
                  </RequireAuth>
                } />
                
                <Route path="/create-ticket" element={
                  <RequireAuth role="customer">
                    <CreateTicket />
                  </RequireAuth>
                } />
                
                <Route path="/ticket/:id" element={
                  <RequireAuth>
                    <TicketDetails />
                  </RequireAuth>
                } />
                
                <Route path="/unauthorized" element={
                  <div className="min-h-[60vh] flex items-center justify-center px-4">
                    <div className="max-w-md w-full glass-card p-8 text-center">
                      <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      </div>
                      <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Acesso Restrito</h1>
                      <p className="text-slate-600 dark:text-slate-400 mb-6 font-medium">Você não tem as permissões necessárias para visualizar este recurso.</p>
                      <NavigateToHome />
                    </div>
                  </div>
                } />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

// Helper to redirect to correct home based on role
function NavigateToHome() {
  const { role } = useAuth();
  return (
    <button 
      onClick={() => window.location.href = role === 'staff' ? '/dashboard' : '/my-tickets'}
      className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-colors shadow-glow"
    >
      Voltar para o Início
    </button>
  );
}

// Handle public routes: redirect authenticated users away
function PublicRoute({ children }) {
  const { user, role, isLoading } = useAuth();

  if (isLoading) return null;

  if (user) {
    return <Navigate to={role === 'staff' ? '/dashboard' : '/my-tickets'} replace />;
  }

  return children;
}

export default App;