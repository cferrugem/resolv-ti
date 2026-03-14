import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import LoadingSpinner from './LoadingSpinner';

function RequireAuth({ children, role }) {
  const { user, role: userRole, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading || user === undefined) {
    return <LoadingSpinner />;
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Handle role-based redirects
  if (location.pathname === '/') {
    return <Navigate to={userRole === 'staff' ? '/dashboard' : '/my-tickets'} replace />;
  }

  // Check role-based access for specific routes
  if (role && userRole !== role) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (typeof children === 'function') {
    return children({ role: userRole });
  }

  return children;
}

export default RequireAuth;