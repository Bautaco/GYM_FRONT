import React, { useCallback, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Calendar,
  BarChart2,
  BookOpen,
  PlusCircle,
  LogOut,
  Moon,
  Sun,
  Shield,
} from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext.js';
import { useTheme } from '../features/theme/ThemeContext.js';
import { UserRole } from '../types/index.js';
import { ProfileModal } from './ProfileModal.js';

export const Navbar: React.FC = () => {
  const { user, role, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const closeProfile = useCallback(() => setIsProfileOpen(false), []);
  const avatarUrl = user?.avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'Usuario')}&background=eed8c0&color=5a0505&bold=true`;

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header className="navbar-root">
        <div className="navbar-container">
          {/* Brand */}
          <Link to="/" className="navbar-brand" aria-label="Gym, inicio">
            <span className="brand-title">Gym</span>
          </Link>

          {/* Navigation Links */}
          <nav className="navbar-nav">
            {/* ADMIN */}
            {role === UserRole.ADMIN && (
              <Link
                to="/admin/users"
                className={`nav-link ${isActive('/admin/users') ? 'active' : ''}`}
              >
                <Shield size={18} />
                <span>Gestión de usuarios</span>
              </Link>
            )}

            {/* ATLETA */}
            {role === UserRole.ATLETA && (
              <>
                <Link
                  to="/"
                  className={`nav-link ${isActive('/') ? 'active' : ''}`}
                >
                  <Calendar size={18} />
                  <span>Mi Rutina</span>
                </Link>
              </>
            )}

            {/* ENTRENADOR */}
            {role === UserRole.ENTRENADOR && (
              <Link
                to="/trainer/assign-plan"
                className={`nav-link ${isActive('/trainer/assign-plan') ? 'active' : ''}`}
              >
                <PlusCircle size={18} />
                <span>Asignar Plan</span>
              </Link>
            )}

            {/* Compartido */}
            <Link
              to="/exercises"
              className={`nav-link ${isActive('/exercises') ? 'active' : ''}`}
            >
              <BookOpen size={18} />
              <span>Catálogo</span>
            </Link>

            <Link
              to="/progress"
              className={`nav-link ${isActive('/progress') ? 'active' : ''}`}
            >
              <BarChart2 size={18} />
              <span>Métricas</span>
            </Link>
          </nav>

          {/* User Actions */}
          <div className="navbar-user-actions">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="btn-icon-nav"
              title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              aria-label="Cambiar tema"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Profile Chip - clickable to open settings */}
            <button
              className="user-profile-chip clickable"
              onClick={() => setIsProfileOpen(true)}
              title="Configuración de perfil"
            >
              <img className="user-avatar-img" src={avatarUrl} alt="" />
              <div className="user-info-text">
                <span className="user-name">{user?.fullName || 'Usuario'}</span>
                <span className={`user-role-badge ${role?.toLowerCase()}`}>
                  {role === UserRole.ADMIN
                    ? 'Admin'
                    : role === UserRole.ENTRENADOR
                    ? 'Entrenador'
                    : 'Atleta'}
                </span>
              </div>
            </button>

            {/* Logout */}
            <button
              onClick={logout}
              className="btn-logout"
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Profile / Settings Modal */}
      <ProfileModal isOpen={isProfileOpen} onClose={closeProfile} />
    </>
  );
};
