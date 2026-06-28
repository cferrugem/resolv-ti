import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import LoadingSpinner from './LoadingSpinner';

function RequireAuth({ children, role }) {
  const { user, role: userRole, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication OR if we have a user but are still waiting for their role
  // (Though the new AuthContext keeps isLoading=true until both are ready, this is a safe double-check)
  if (isLoading || (user && userRole === undefined)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <LoadingSpinner />
        <p className="mt-4 text-slate-500 animate-pulse text-sm font-medium">Verificando credenciais...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Handle root route (/) - redirect to appropriate dashboard
  if (location.pathname === '/') {
    return <Navigate to={userRole === 'staff' ? '/dashboard' : '/my-tickets'} replace />;
  }

  // Check role-based access for specific routes
  if (role && userRole !== role) {
    console.warn(`Access denied for ${user.email}: requires ${role}, has ${userRole}`);
    
    // Instead of just showing "Unauthorized", we can be smarter:
    // If a customer tries to access a staff page, send them to their tickets
    if (userRole === 'customer') {
      return <Navigate to="/my-tickets" replace />;
    }
    // If staff tries to access a customer-only page (like create-ticket if restricted), send to dashboard
    if (userRole === 'staff') {
      return <Navigate to="/dashboard" replace />;
    }
    
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

export default RequireAuth;