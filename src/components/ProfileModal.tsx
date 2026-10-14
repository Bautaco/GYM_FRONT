import React, { useState } from 'react';
import {
  X,
  User as UserIcon,
  Lock,
  Phone,
  FileText,
  CheckCircle,
  AlertCircle,
  Moon,
  Sun,
  Save,
  Camera,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext.js';
import { useTheme } from '../features/theme/ThemeContext.js';
import { authService } from '../services/authService.js';
import { UserRole } from '../types/index.js';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
];

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [notes, setNotes] = useState(user?.notes || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    // Validar contraseña si se quiere cambiar
    if (newPassword || currentPassword) {
      if (newPassword !== confirmPassword) {
        setErrorMsg('La nueva contraseña y la confirmación no coinciden.');
        return;
      }
      if (newPassword.length < 6) {
        setErrorMsg('La nueva contraseña debe tener al menos 6 caracteres.');
        return;
      }
      if (!currentPassword) {
        setErrorMsg('Debes ingresar tu contraseña actual para cambiarla.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload: Record<string, string> = {};
      if (fullName.trim() && fullName.trim() !== user.fullName) payload.fullName = fullName.trim();
      if (phone.trim() !== (user.phone || '')) payload.phone = phone.trim();
      if (notes.trim() !== (user.notes || '')) payload.notes = notes.trim();
      if (avatarUrl.trim() !== (user.avatarUrl || '')) payload.avatarUrl = avatarUrl.trim();
      if (newPassword && currentPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      if (Object.keys(payload).length === 0) {
        setErrorMsg('No realizaste ningún cambio.');
        setIsSubmitting(false);
        return;
      }

      const updated = await authService.updateProfile(payload);

      // Actualizar localStorage con datos actualizados
      const savedUser = {
        ...user,
        fullName: updated.fullName,
        phone: updated.phone,
        notes: updated.notes,
        avatarUrl: updated.avatarUrl,
      };
      localStorage.setItem('gym_auth_user', JSON.stringify(savedUser));

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccessMsg('✅ Perfil actualizado correctamente. Recargando...');
      setTimeout(() => {
        window.location.reload();
      }, 900);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Error al guardar cambios.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentDisplayAvatar =
    avatarUrl ||
    user.avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user.fullName,
    )}&background=ff5722&color=fff&bold=true`;

  return (
    <div className="modal-backdrop">
      <div className="modal-container profile-modal-card">
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-box">
            <UserIcon size={20} className="modal-icon primary" />
            <div>
              <h2>Configuración de Usuario</h2>
              <span className="modal-subheading">
                {user.email} &bull;{' '}
                <span className={`user-role-badge ${user.role.toLowerCase()}`}>
                  {user.role === UserRole.ADMIN
                    ? 'Administrador'
                    : user.role === UserRole.ENTRENADOR
                    ? 'Entrenador'
                    : 'Atleta'}
                </span>
              </span>
            </div>
          </div>
          <button onClick={onClose} className="btn-close-modal" aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className="modal-form">
          <div className="modal-body profile-form-body">
            {/* Feedback Alerts */}
            {successMsg && (
              <div className="alert-box success">
                <CheckCircle size={18} />
                <span>{successMsg}</span>
              </div>
            )}
            {errorMsg && (
              <div className="alert-box error">
                <AlertCircle size={18} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* SECCIÓN 1: FOTO / AVATAR */}
            <div className="profile-section-label">
              <Camera size={15} />
              <span>Foto de Perfil / Avatar (HU-02)</span>
            </div>

            <div className="avatar-selection-box">
              <img
                src={currentDisplayAvatar}
                alt={user.fullName}
                className="profile-avatar-preview"
              />
              <div className="avatar-options-group">
                <span className="avatar-help-text">Selecciona un preset rápido o ingresa una URL:</span>
                <div className="avatar-presets-row">
                  {AVATAR_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatarUrl(preset)}
                      className={`avatar-preset-btn ${avatarUrl === preset ? 'selected' : ''}`}
                    >
                      <img src={preset} alt={`Preset ${idx + 1}`} />
                    </button>
                  ))}
                </div>
                <input
                  type="url"
                  placeholder="https://ejemplo.com/mi-avatar.jpg"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="form-input form-input-sm"
                />
              </div>
            </div>

            {/* SECCIÓN 2: TEMA VISUAL */}
            <div className="profile-section-label">
              {theme === 'dark' ? <Moon size={15} /> : <Sun size={15} />}
              <span>Tema de la Interfaz</span>
            </div>

            <div className="theme-toggle-row">
              <div className="theme-toggle-info">
                <span className="theme-toggle-desc">
                  Tema actual: <strong>{theme === 'dark' ? 'Modo Oscuro' : 'Modo Claro'}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                className="btn-theme-toggle"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun size={16} /> Cambiar a Modo Claro
                  </>
                ) : (
                  <>
                    <Moon size={16} /> Cambiar a Modo Oscuro
                  </>
                )}
              </button>
            </div>

            {/* SECCIÓN 3: DATOS PERSONALES */}
            <div className="profile-section-label">
              <UserIcon size={15} />
              <span>Datos Personales</span>
            </div>

            <div className="form-group">
              <label className="form-label">Nombre Completo</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Tu nombre completo"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Phone size={13} style={{ display: 'inline', marginRight: 4 }} />
                Teléfono de Contacto
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+54 9 11 1234-5678"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <FileText size={13} style={{ display: 'inline', marginRight: 4 }} />
                Notas del Perfil / Objetivos
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notas personales o directrices de entrenamiento..."
                className="form-input form-textarea"
              />
            </div>

            {/* SECCIÓN 4: CAMBIO DE CONTRASEÑA */}
            <div className="profile-section-label">
              <Lock size={15} />
              <span>Cambiar Contraseña</span>
              <span className="label-hint">(dejar vacío si no deseas cambiarla)</span>
            </div>

            <div className="form-group">
              <label className="form-label">Contraseña Actual</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Ingresa tu contraseña actual"
                className="form-input"
                autoComplete="current-password"
              />
            </div>

            <div className="profile-pw-grid">
              <div className="form-group">
                <label className="form-label">Nueva Contraseña</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="form-input"
                  autoComplete="new-password"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirmar Contraseña</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la nueva contraseña"
                  className="form-input"
                  autoComplete="new-password"
                />
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              <Save size={16} />
              <span>{isSubmitting ? 'Guardando...' : 'Guardar Cambios'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
