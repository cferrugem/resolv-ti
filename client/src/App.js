import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import NavBar from './components/NavBar';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './pages/Dashboard';
import MyTickets from './pages/MyTickets';
import CreateTicket from './components/CreateTicket';
import TicketDetails from './pages/TicketDetails';
import TicketList from './pages/TicketList';
import RequireAuth from './components/RequireAuth';
import LoadingSpinner from './components/LoadingSpinner';

// Update the existing Unauthorized component
function Unauthorized() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
<<<<<<< HEAD
      <div className="max-w-md w-full glass-card p-8">
        <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Acesso Não Autorizado</h1>
        <p className="text-slate-600 dark:text-slate-300">Você não tem permissão para acessar esta página.</p>
=======
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Acesso Não Autorizado</h1>
        <p className="text-gray-600">Você não tem permissão para acessar esta página.</p>
>>>>>>> 66b67d6b8b221d15e3289bfd3d220f1bbb24760a
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
<<<<<<< HEAD
        <div className="min-h-screen">
=======
        <div className="min-h-screen bg-gray-100">
>>>>>>> 66b67d6b8b221d15e3289bfd3d220f1bbb24760a
          <NavBar />
          <main className="py-10">
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

              {/* Root route with proper role-based redirect */}
              <Route path="/" element={
                <RequireAuth>
                  {({ role }) => (
                    <LoadingSpinner />
                  )}
                </RequireAuth>
              } />

              {/* Protected routes */}
              <Route path="/dashboard" element={
                <RequireAuth role="staff">
                  <Dashboard />
                </RequireAuth>
              } />
              <Route path="/my-tickets" element={
                <RequireAuth role="customer">
                  <MyTickets />
                </RequireAuth>
              } />
              <Route path="/create-ticket" element={<RequireAuth role="customer"><CreateTicket /></RequireAuth>} />
              <Route path="/ticket/:id" element={<RequireAuth><TicketDetails /></RequireAuth>} />
              <Route path="/tickets" element={
                <RequireAuth role="staff">
                  <TicketList />
                </RequireAuth>
              } />
              
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

// Add this new component to handle public routes
function PublicRoute({ children }) {
  const { user, role } = useAuth();

  if (user) {
    // Redirect authenticated users to their appropriate landing page
    return <Navigate to={role === 'staff' ? '/dashboard' : '/my-tickets'} replace />;
  }

  return children;
}

export default App;