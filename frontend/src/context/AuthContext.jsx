import { createContext, useContext, useEffect, useState } from 'react';
import axios from '../api/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async () => {
    window.location.href = 'http://localhost:5000/auth/google';
  };

  const logout = async () => {
    try {
      await axios.get('/auth/logout');
      setUser(null);
    } catch (error) {
      console.error('Error logging out', error);
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await axios.get('/auth/me');
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user', error);
      }
    };
    checkUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
