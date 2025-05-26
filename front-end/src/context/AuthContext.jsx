import { createContext, useContext, useState, useEffect } from 'react';

import { API_URL } from '../config/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [empresa, setEmpresa] = useState(null);
  const [loading, setLoading] = useState(true);

  console.log('AuthProvider initialized with empresa:', empresa);

  useEffect(() => {
  const token = localStorage.getItem('token');
  if (!token) {
    setLoading(false);
    return;
  }

  const fetchEmpresa = async () => {
    try {
      const res = await fetch(`${API_URL}/api/empresa/1`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Token inválido');

      const data = await res.json();
      setEmpresa({ token, empresa: data });
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  };

  fetchEmpresa();
}, []);


  const login = (empresaData) => {
    setEmpresa(empresaData);
    localStorage.setItem('token', empresaData.token); // opcional
  };

  const logout = () => {
    setEmpresa(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ empresa, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
