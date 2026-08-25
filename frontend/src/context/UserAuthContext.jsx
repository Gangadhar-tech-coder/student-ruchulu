import { createContext, useContext, useState, useEffect } from 'react';
import { fetchMe } from '../utils/api';

const UserAuthContext = createContext();

export function useUserAuth() {
  return useContext(UserAuthContext);
}

export function UserAuthProvider({ children }) {
  const [userToken, setUserToken] = useState(localStorage.getItem('sr_user_token') || '');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userToken) {
      fetchMe(userToken)
        .then((userData) => {
          setUser(userData);
          setLoading(false);
        })
        .catch(() => {
          setUserToken('');
          setUser(null);
          localStorage.removeItem('sr_user_token');
          setLoading(false);
        });
    } else {
      setUser(null);
      setLoading(false);
    }
  }, [userToken]);

  const loginUser = (token, userData) => {
    setUserToken(token);
    setUser(userData);
    localStorage.setItem('sr_user_token', token);
  };

  const logoutUser = () => {
    setUserToken('');
    setUser(null);
    localStorage.removeItem('sr_user_token');
  };

  return (
    <UserAuthContext.Provider value={{ userToken, user, loading, loginUser, logoutUser }}>
      {children}
    </UserAuthContext.Provider>
  );
}
