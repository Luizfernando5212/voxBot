import React, { useState } from 'react';
import '../styles/styleslogin.css';

import { API_URL } from '../config/api';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cnpj: '',
    password: '',
    passwordConfirm: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.passwordConfirm) {
      alert("As senhas não coincidem.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/empresa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Erro ao cadastrar empresa');
      }

      const data = await response.json();
      alert('Empresa cadastrada com sucesso!');
      window.location.href = '/'; // Redireciona para a página de login
    } catch (error) {
      alert('Erro ao cadastrar empresa: ' + error.message);
    }
  };

  return (
    <main>
      <section className="form-section">
        <img src="/assets/voxbot_logo.png" className="logo-pequeno" alt="logo" />
        <h2>Sign up!</h2>

        <form id="signupForm" onSubmit={handleSubmit}>
          <div className="input-wrapper">
            <label htmlFor="name">Razão Social</label>
            <div className="input-content">
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Voxbot Ltda"
                required
                value={formData.razaoSocial}
                onChange={(e) => setFormData({ ...formData, razaoSocial: e.target.value })}
              />
              <div className="icon">
                <img src="/assets/email-icon.svg" alt="name" />
              </div>
            </div>
          </div>

          <div className="input-wrapper">
            <label htmlFor="email">Email</label>
            <div className="input-content">
              <input
                type="email"
                id="email"
                name="email"
                placeholder="voxbot@mail.com"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <div className="icon">
                <img src="/assets/email-icon.svg" alt="email" />
              </div>
            </div>
          </div>

          <div className="input-wrapper">
            <label htmlFor="cnpj">CNPJ</label>
            <div className="input-content">
              <input
                type="text"
                id="cnpj"
                name="cnpj"
                placeholder="00.000.000/0000-00"
                required
                value={formData.cnpj}
                onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
              />
              <div className="icon">
                <img src="/assets/email-icon.svg" alt="cnpj" />
              </div>
            </div>
          </div>

          <div className="input-wrapper">
            <label htmlFor="password">Senha</label>
            <div className="input-content">
              <input
                type="password"
                id="password"
                name="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <div className="icon">
                <img src="/assets/password-icon.svg" alt="password" />
              </div>
            </div>
          </div>

          <div className="input-wrapper">
            <label htmlFor="passwordConfirm">Confirme a senha</label>
            <div className="input-content">
              <input
                type="password"
                id="passwordConfirm"
                name="passwordConfirm"
                required
                value={formData.passwordConfirm}
                onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
              />
              <div className="icon">
                <img src="/assets/password-icon.svg" alt="confirm" />
              </div>
            </div>
          </div>

          <div className="btn-wrapper">
            <button className="btn-primary" type="submit">Cadastre-se</button>
            <div className="divider">
              <div></div>
              <span>or</span>
              <div></div>
            </div>
            <button className="btn-secondary" onClick={() => window.location.href = '/'}>Login</button>
          </div>
        </form>
      </section>

      <section className="main-section">
        <img src="/assets/voxbot_logo.png" className="logo-grande" alt="logo" />
      </section>
    </main>
  );
}
