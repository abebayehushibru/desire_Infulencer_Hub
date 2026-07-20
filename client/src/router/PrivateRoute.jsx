import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuthStore from "../store/authStore";

/**
 * PrivateRoute — wraps any route tree that requires authentication.
 *
 * If the user has a token in the store they pass through.
 * If not, they are redirected to /login and the intended destination
 * is stored in location.state so Login can redirect back after success.
 */
export default function PrivateRoute() {
  const token = useAuthStore((state) => state.token);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
