import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';

function RequireAuth({ children, role }) {
  const { user, role: userRole } = useAuth();
  const location = useLocation();

  // Add loading state
  if (user === undefined) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && userRole !== role) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (typeof children === 'function') {
    return children({ role: userRole });
  }

  return children;
}

export default RequireAuth;