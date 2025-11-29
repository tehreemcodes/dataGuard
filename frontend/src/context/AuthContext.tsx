import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type AuthState = {
  token: string | null;
  role: string | null;
  name: string | null;
};

type AuthContextType = {
  auth: AuthState;
  setAuth: (s: AuthState) => void;
  login: (token: string, role: string, name?: string) => void;
  logout: () => void;
};

const defaultState: AuthContextType = {
  auth: { token: null, role: null, name: null },
  setAuth: () => {},
  login: () => {},
  logout: () => {}
};

const AuthContext = createContext<AuthContextType>(defaultState);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [auth, setAuthState] = useState<AuthState>(() => ({
    token: localStorage.getItem("token"),
    role: localStorage.getItem("role"),
    name: localStorage.getItem("username")
  }));

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "token" || e.key === "role" || e.key === "username") {
        setAuthState({
          token: localStorage.getItem("token"),
          role: localStorage.getItem("role"),
          name: localStorage.getItem("username")
        });
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setAuth = (s: AuthState) => {
    setAuthState(s);
    if (s.token) localStorage.setItem("token", s.token); else localStorage.removeItem("token");
    if (s.role) localStorage.setItem("role", s.role); else localStorage.removeItem("role");
    if (s.name) localStorage.setItem("username", s.name); else localStorage.removeItem("username");
  };

  const login = (token: string, role: string, name?: string) => {
    setAuth({ token, role, name: name || null });
    // optional: navigate to dashboard
    navigate("/dashboard");
  };

  const logout = () => {
    setAuth({ token: null, role: null, name: null });
    // clear localStorage (keeps in sync for other tabs)
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ auth, setAuth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
