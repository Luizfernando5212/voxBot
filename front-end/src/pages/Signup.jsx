import React, { useState, useEffect } from 'react';
import '../styles/styleslogin.css';

export default function Signup() {
  const [login, setLogin] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
  }

  return (
    <main>
      <section className="form-section">
        <img src="/assets/voxbot_logo.png" className="logo-pequeno" alt="logo" />
        <h2>Sign in!</h2>

        <form id="signupForm" onSubmit={(e) => {
          e.preventDefault();
          alert("Signup simulado.");
        }}>
          <div className="input-wrapper">
            <label htmlFor="name">Razão Social</label>
            <div className="input-content">
              <input type="text" id="name" name="name" placeholder="Voxbot Ltda" required />
              <div className="icon">
                <img src="/assets/email-icon.svg" alt="name" />
              </div>
            </div>
          </div>

          <div className="input-wrapper">
            <label htmlFor="email">Email</label>
            <div className="input-content">
              <input type="email" id="email" name="email" placeholder="voxbot@mail.com" required />
              <div className="icon">
                <img src="/assets/email-icon.svg" alt="email" />
              </div>
            </div>
          </div>

          <div className="input-wrapper">
            <label htmlFor="cnpj">CNPJ</label>
            <div className="input-content">
              <input type="text" id="cnpj" name="cnpj" placeholder="00.000.000/0000-00" required />
              <div className="icon">
                <img src="/assets/email-icon.svg" alt="cnpj" />
              </div>
            </div>
          </div>

          <div className="input-wrapper">
            <label htmlFor="password">Senha</label>
            <div className="input-content">
              <input type="password" id="password" name="password" required />
              <div className="icon">
                <img src="/assets/password-icon.svg" alt="password" />
              </div>
            </div>
          </div>

          <div className="input-wrapper">
            <label htmlFor="passwordConfirm">Confirme a senha</label>
            <div className="input-content">
              <input type="password" id="passwordConfirm" name="passwordConfirm" required />
              <div className="icon">
                <img src="/assets/password-icon.svg" alt="confirm" />
              </div>
            </div>
          </div>
        </form>

        <div className="btn-wrapper">
          <button className="btn-primary" type="submit" form="signupForm">Cadastre-se</button>
          <div className="divider">
            <div></div>
            <span>or</span>
            <div></div>
          </div>
          <button className="btn-secondary" onClick={() => window.location.href = '/'}>Login</button>
        </div>
      </section>

      <section className="main-section">
        <img src="/assets/voxbot_logo.png" className="logo-grande" alt="logo" />
      </section>
    </main>
  );
}
