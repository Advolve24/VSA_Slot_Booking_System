import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export default function PrivateRoute({ children, allowedRoles }) {
  const { admin } = useAuth();

  if (!admin) return <Navigate to="/admin/login" />;

  if (allowedRoles && !allowedRoles.includes(admin.role))
    return <Navigate to="/admin/login" />;

  return children;
}
