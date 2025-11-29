// frontend/src/components/ProtectedRoute.tsx
import React from "react";
import { Navigate } from "react-router-dom";

interface Props {
  children: React.ReactElement;
  roles?: string[]; // optional allowed roles
}

const getUserFromStorage = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    // optionally parse role from localStorage 'role' you set at login
    const role = localStorage.getItem("role");
    return { token, role };
  } catch (e) {
    return null;
  }
};

const ProtectedRoute: React.FC<Props> = ({ children, roles }) => {
  const user = getUserFromStorage();
  if (!user?.token) return <Navigate to="/login" replace />;

  if (roles && roles.length > 0) {
    if (!user.role || !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
