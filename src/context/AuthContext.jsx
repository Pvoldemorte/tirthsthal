import { createContext, useContext, useState, useEffect } from "react";
import {
  login as loginService,
  register as registerService,
  logout as logoutService,
  getCurrentUser,
  getProfile as getProfileService,
  isAuthenticated,
} from "../services/authServices";



const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(getCurrentUser());
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const data = await loginService(email, password);
      setUser(data.user);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    try {
      setLoading(true);
      setError(null);
      const data = await registerService(name, email, password);
      setUser(data.user);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await logoutService();
    setUser(null);
  };

  const clearError = () => setError(null);

  // ── Backend se latest profile fetch karke user state refresh karo ──
  const refreshUser = async () => {
    try {
      const freshUser = await getProfileService();
      setUser(freshUser);
      localStorage.setItem("tirthstal_user", JSON.stringify(freshUser));
      return freshUser;
    } catch (err) {
      console.error("Failed to refresh user:", err);
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      isAuthenticated: !!user,
      isAdmin: user?.role === "admin",
      isLoggedIn: !!user,
      login,
      register,
      logout,
      clearError,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};