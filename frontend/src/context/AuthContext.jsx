import { createContext, useContext, useState, useEffect } from 'react';
import { verifyToken } from '../utils/api';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('sr_admin_token') || '');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      verifyToken(token).then(valid => {
        setIsAdmin(valid);
        if (!valid) {
          setToken('');
          localStorage.removeItem('sr_admin_token');
        }
        setLoading(false);
      }).catch(() => {
        setIsAdmin(false);
        setLoading(false);
      });
    } else {
      setIsAdmin(false);
      setLoading(false);
    }
  }, [token]);

  const login = (newToken) => {
    setToken(newToken);
    setIsAdmin(true);
    localStorage.setItem('sr_admin_token', newToken);
  };

  const logout = () => {
    setToken('');
    setIsAdmin(false);
    localStorage.removeItem('sr_admin_token');
  };

  return (
    <AuthContext.Provider value={{ token, isAdmin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
