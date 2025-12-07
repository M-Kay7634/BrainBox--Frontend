import { createContext, useContext, useState, useEffect } from "react";
import { setAuthToken } from "../services/api";
import API from "../services/api";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loadingAuth, setLoadingAuth] = useState(true); // ⭐ NEW

  // ⭐ Auto-login with saved token
  useEffect(() => {
    if (!token) {
      setLoadingAuth(false);
      return;
    }

    setAuthToken(token);

    API.get("/auth/me")
      .then((res) => {
        setUser(res.data);
      })
      .catch(() => {
        setToken(null);
        localStorage.removeItem("token");
        setUser(null);
      })
      .finally(() => {
        setLoadingAuth(false);
      });
  }, [token]);

  // ⭐ Called after successful login
  const login = (token, userData) => {
    setToken(token);
    localStorage.setItem("token", token);

    setAuthToken(token);
    setUser(userData);
  };

  // ⭐ Logout handler
  const logout = () => {
    setToken(null);
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isLoggedIn: !!user,
        loadingAuth, // ⭐ expose loading state
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
