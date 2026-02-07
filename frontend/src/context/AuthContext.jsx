import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on refresh
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Register
  const register = async (name, email, password) => {
    const res = await api.post("/api/auth/register", {
      name,
      email,
      password,
    });

    localStorage.setItem("user", JSON.stringify(res.data));
    setUser(res.data);
  };

  // Login
  const login = async (email, password) => {
    const res = await api.post("/api/auth/login", {
      email,
      password,
    });

    localStorage.setItem("user", JSON.stringify(res.data));
    setUser(res.data);
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, register, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => useContext(AuthContext);
