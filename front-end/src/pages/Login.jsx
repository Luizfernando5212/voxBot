import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

import '../styles/styleslogin.css';

import { API_URL } from '../config/api';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });

  const { login } = useAuth();

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Falha no login');

      const result = await response.json();
      login(result);
      navigate('/empresa');
      
    } catch (err) {
      alert('Erro ao logar: ' + err.message);
    }
  }

  return (
    <main>
      <section className="form-section">
        <img src="/assets/voxbot_logo.png" className="logo-pequeno" alt="logo" />
        <h2>Login into your account</h2>

        <form id="loginForm" onSubmit={handleSubmit}>
          <div className="input-wrapper">
            <label htmlFor="email">Email</label>
            <div className="input-content">
              <input type="email"
                id="email"
                name="email"
                placeholder="johndoe@gmail.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required />
              <div className="icon">
                <img src="/assets/email-icon.svg" alt="email" />
              </div>
            </div>
          </div>

          <div className="input-wrapper">
            <label htmlFor="password">Your Password</label>
            <div className="input-content">
              <input type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required />
              <div className="icon">
                <img src="/assets/password-icon.svg" alt="password" />
              </div>
            </div>
          </div>

          <span>Forgot password?</span>
        </form>

        <div className="btn-wrapper">
          <button className="btn-primary" type="submit" form="loginForm">Login Now</button>
          <div className="divider">
            <div></div>
            <span>or</span>
            <div></div>
          </div>
          <button className="btn-secondary" onClick={() => window.location.href = '/signup'}>Signup Now</button>
        </div>
      </section>

      <section className="main-section">
        <img src="/assets/voxbot_logo.png" className="logo-grande" alt="logo" />
      </section>
    </main>
  );
}
