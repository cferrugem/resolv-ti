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

// Add this new component
function Unauthorized() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Unauthorized Access</h1>
        <p className="text-gray-600">You don't have permission to access this page.</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
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

              {/* Protected routes */}
              <Route path="/" element={
                <RequireAuth>
                  {({ role }) => role === 'staff' ? <Navigate to="/dashboard" /> : <Navigate to="/my-tickets" />}
                </RequireAuth>
              } />
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