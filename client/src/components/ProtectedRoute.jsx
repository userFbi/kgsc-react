import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");

  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }

  let user;
  try {
    user = JSON.parse(userStr);
  } catch {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Wrong role — bhej do unke apne sahi dashboard pe
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    if (user.role === "manager") return <Navigate to="/manager" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
