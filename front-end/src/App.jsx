import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Empresa from './pages/Empresa';
import Funcionario from './pages/Funcionario';
import Setor from './pages/Setor';
import React from 'react';
import PrivateRoute from './routes/PrivateRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/empresa" element={<PrivateRoute><Empresa /></PrivateRoute>} />
        <Route path="/funcionario" element={<Funcionario />} />
        <Route path="/setor" element={<Setor />} />
        {/* <Route path="/planos" element={<Planos />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
