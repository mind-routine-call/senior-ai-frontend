import { Navigate, Outlet, useLocation } from "react-router-dom";
import {
  getAccessToken,
  getDefaultPathForRole,
  getStoredRole,
} from "../utils/authSession";

export default function RoleGuard({ allowedRoles }) {
  const location = useLocation();
  const token = getAccessToken();
  const role = getStoredRole();

  if (!token || !role) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to={getDefaultPathForRole(role)} replace />;
  }

  return <Outlet />;
}
