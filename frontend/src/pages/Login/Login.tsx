import { useState } from 'react';
import axios from 'axios';
import './Login.css';

// Importamos tu logo Gigachad de SIGMA
import logoEmpresa from '../../assets/logo.png'; 

interface LoginProps {
  onLoginSuccess: (user: { usuario: string; rol: string }) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const manejarLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    axios.post('https://sigma-production-e9dc.up.railway.app/api/login', { usuario, password })
      .then(res => {
        if (res.data.success) onLoginSuccess(res.data.user);
      })
      .catch(err => setError(err.response?.data?.error || 'Error de conexión con el servidor'));
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        
        {/* LOGO GIGACHAD POR ENCIMA */}
        <div className="login-logo-container">
          <img src={logoEmpresa} alt="Logo SIGMA" className="login-logo" />
        </div>

        {/* TARJETA GLASSMORPHISM */}
        <div className="login-card">
          <h3>Bienvenido de vuelta</h3>
          <p className="subtitle">Ingresa tus credenciales para continuar</p>

          <form onSubmit={manejarLogin}>
            
            {/* INPUT USUARIO */}
            <div className="form-group">
              <label>Usuario</label>
              <div className="input-icon-wrapper">
                <span className="icon-left">👤</span>
                <input 
                  type="text" 
                  value={usuario} 
                  onChange={e => setUsuario(e.target.value)} 
                  placeholder="Ingresa tu usuario" 
                  required 
                />
              </div>
            </div>

            {/* INPUT CONTRASEÑA */}
            <div className="form-group">
              <label>Contraseña</label>
              <div className="input-icon-wrapper">
                <span className="icon-left">🔒</span>
                <input 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="Ingresa tu contraseña" 
                  required 
                />
              </div>
            </div>
            
            {error && <p className="error-text">{error}</p>}
            
            {/* BOTÓN CON FLECHA */}
            <button type="submit" className="btn-submit">
              Ingresar al Sistema <span>→</span>
            </button>
          </form>

          {/* DIVIDER Y LINK DE AYUDA INFERIOR */}
          <div className="login-divider"></div>
          
          <a href="#ayuda" className="login-help-link" onClick={(e) => { e.preventDefault(); alert('Comunícate con el administrador del sistema.'); }}>
            <span>❓</span> ¿Necesitas ayuda?
          </a>
        </div>

      </div>
    </div>
  );
}
