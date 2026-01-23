// src/app/providers/AuthProvider.jsx
import { createContext, useContext, useEffect, useState } from "react";
import api from "../../lib/axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    localStorage.getItem("adminToken")
  );
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!token;

  // 🔥 Restore session on refresh
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get("/auth/me") // token auto attached by axios
      .then((res) => setUser(res.data))
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, [token]);

  const setAuth = (tokenValue, userValue) => {
    localStorage.setItem("adminToken", tokenValue);
    localStorage.setItem("adminUser", JSON.stringify(userValue));

    setToken(tokenValue);
    setUser(userValue);
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");

    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        setAuth,
        logout,
        isAuthenticated,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
