import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Unauthorized from "../pages/Unauthorized";

export default function RoleProtectedRoute({
  children,
  allowedRoles = [],
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user.role)
  ) {
    return <Unauthorized/>;
  }

  return children;
}