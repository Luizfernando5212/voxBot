import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PrivateRoute({ children }) {
  const { empresa, loading } = useAuth();

  if (loading) {
    return <p>Carregando...</p>; // Ou um spinner
  }

  if (!empresa) {
    return <Navigate to="/" replace />;
  }

  return children;
}
