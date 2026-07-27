import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Load from local storage on mount
    const storedToken = localStorage.getItem('saws_token');
    const storedUser = localStorage.getItem('saws_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('saws_token', userToken);
    localStorage.setItem('saws_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('saws_token');
    localStorage.removeItem('saws_user');
  };

  const isAuthenticated = !!token;
  const isPatient = user?.role === 'PATIENT';
  const isCoordinator = user?.role === 'COORDINATOR';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated,
        isPatient,
        isCoordinator,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
