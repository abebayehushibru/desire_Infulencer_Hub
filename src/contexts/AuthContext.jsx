import { createContext, useContext, useState, useEffect } from 'react';

// 1. Initialize the context
const AuthContext = createContext(null);

// 2. Create the Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if a user session exists on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('access_token');
    if (storedUser) {
       setToken(storedToken)
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  } , []);

  // Login action
  const login = async (user, token) => {
    try {
      console.log(user,token);
      
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('access_token', token);
      setUser(user);
      setToken(token)
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Logout action
  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setToken(null)

  };

  const value = {
    user,
    loading,
    login,
    logout,
    token,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// 3. Create a custom hook for easy consumption
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
