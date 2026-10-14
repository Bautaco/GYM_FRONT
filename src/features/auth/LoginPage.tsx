import React, { useState } from 'react';
import { Dumbbell, Shield, User, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from './AuthContext.js';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Error al iniciar sesión. Verifica tus credenciales.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (userEmail: string, userPass: string) => {
    setError('');
    setIsLoading(true);
    try {
      await login(userEmail, userPass);
    } catch (err: any) {
      setError('Error al iniciar con el usuario de prueba');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-card-container">
        {/* Header */}
        <div className="login-header text-center">
          <div className="brand-badge-large">
            <Dumbbell size={36} className="text-accent" />
          </div>
          <h1 className="login-title">APEX FIT</h1>
          <p className="login-subtitle">
            Plataforma de Alto Rendimiento y Seguimiento de Entrenamiento Físico
          </p>
        </div>

        {/* Demo Fast Login Pills */}
        <div className="demo-credentials-box">
          <span className="demo-box-label">⚡ Acceso Rápido de Prueba (1-Click):</span>
          <div className="demo-buttons-grid demo-buttons-3">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@gym.com', 'admin123')}
              className="btn-demo-card admin"
              disabled={isLoading}
            >
              <div className="demo-icon">
                <Shield size={18} />
              </div>
              <div className="demo-text">
                <span className="demo-role">Rol Admin</span>
                <span className="demo-name">admin@gym.com</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('entrenador@gym.com', 'admin123')}
              className="btn-demo-card trainer"
              disabled={isLoading}
            >
              <div className="demo-icon">
                <Shield size={18} />
              </div>
              <div className="demo-text">
                <span className="demo-role">Rol Entrenador</span>
                <span className="demo-name">Prof. Carlos Mendoza</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('atleta@gym.com', 'atleta123')}
              className="btn-demo-card athlete"
              disabled={isLoading}
            >
              <div className="demo-icon">
                <User size={18} />
              </div>
              <div className="demo-text">
                <span className="demo-role">Rol Atleta</span>
                <span className="demo-name">Lucas Gómez</span>
              </div>
            </button>
          </div>
        </div>

        <div className="divider-line">
          <span>O ingresa con tus credenciales</span>
        </div>

        {error && (
          <div className="alert-box alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Custom Form */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="emailInput">
              Correo Electrónico
            </label>
            <input
              id="emailInput"
              type="email"
              required
              className="form-input"
              placeholder="nombre@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="passwordInput">
              Contraseña
            </label>
            <input
              id="passwordInput"
              type="password"
              required
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={isLoading}
          >
            {isLoading ? (
              'Iniciando...'
            ) : (
              <>
                <span>Ingresar a la Plataforma</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="login-footer-info">
          <div className="feature-pill">
            <CheckCircle2 size={14} className="text-success" />
            <span>Gestión y Planes de Entrenamiento</span>
          </div>
          <div className="feature-pill">
            <CheckCircle2 size={14} className="text-success" />
            <span>Videos In-App Integrados</span>
          </div>
        </div>
      </div>
    </div>
  );
};
