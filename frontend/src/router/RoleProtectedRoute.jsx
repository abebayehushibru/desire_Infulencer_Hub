import { Navigate } from "react-router-dom";

export default function RoleProtectedRoute({
  children,
  user,
  allowedRoles,
}) {
  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}