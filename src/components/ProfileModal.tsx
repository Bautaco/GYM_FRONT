import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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
} from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext.js';
import { useTheme } from '../features/theme/ThemeContext.js';
import { authService } from '../services/authService.js';
import { UserRole } from '../types/index.js';
import { prepareProfilePhoto } from '../utils/profilePhoto.js';

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

/**
 * Redimensiona y comprime una imagen seleccionada desde PC/Teléfono a un cuadrado 1:1
 * optimizado para avatar (~25-35KB), evitando problemas de peso y red.
 */
const _compressAndResizeImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('El archivo seleccionado debe ser una imagen válida.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 300;
          const width = img.width;
          const height = img.height;

          // Crop centrado a proporción cuadrada 1:1
          const minDim = Math.min(width, height);
          const startX = (width - minDim) / 2;
          const startY = (height - minDim) / 2;

          canvas.width = MAX_SIZE;
          canvas.height = MAX_SIZE;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }

          ctx.drawImage(
            img,
            startX,
            startY,
            minDim,
            minDim,
            0,
            0,
            MAX_SIZE,
            MAX_SIZE,
          );

          const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
          resolve(dataUrl);
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error('No se pudo procesar la imagen.'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo.'));
    reader.readAsDataURL(file);
  });
};

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [notes, setNotes] = useState(user?.notes || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [isPreparingPhoto, setIsPreparingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState('');

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setPhotoError('');
    setIsPreparingPhoto(true);
    try {
      setAvatarUrl(await prepareProfilePhoto(file));
    } catch (error) {
      setPhotoError(error instanceof Error ? error.message : 'No se pudo cargar la foto.');
    } finally {
      setIsPreparingPhoto(false);
    }
  };

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const dialogRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab') return;
      const controls = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), a[href]',
      );
      if (!controls?.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      previousFocus?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen || !user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPreparingPhoto) return;
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
    )}&background=eed8c0&color=5a0505&bold=true`;

  // El portal evita que la barra superior limite o recorte la ventana.
  return createPortal(
    <div className="modal-backdrop">
      <div ref={dialogRef} className="modal-container profile-modal-card" role="dialog" aria-modal="true" aria-labelledby="profile-title" tabIndex={-1}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-box">
            <UserIcon size={20} className="modal-icon primary" />
            <div>
              <h2 id="profile-title">Configuración de usuario</h2>
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
          <button type="button" onClick={onClose} className="btn-close-modal" aria-label="Cerrar">
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
              <span>Foto de perfil</span>
            </div>

            <div className="avatar-selection-box">
              <img src={currentDisplayAvatar} alt={user.fullName} className="profile-avatar-preview" />
              <div className="avatar-options-group">
                <label className="avatar-help-text" htmlFor="profile-photo">Elegí una foto de tu dispositivo:</label>
                <input id="profile-photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoChange} disabled={isPreparingPhoto || isSubmitting} className="profile-photo-input" />
                <span className="avatar-help-text">JPG, PNG o WebP, hasta 10 MB. Se guarda con “Guardar cambios”.</span>
                {isPreparingPhoto && <span role="status">Preparando foto...</span>}
                {photoError && <span role="alert">{photoError}</span>}
                <div className="avatar-presets-row">
                  {AVATAR_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={isPreparingPhoto || isSubmitting}
                      onClick={() => setAvatarUrl(preset)}
                      className={`avatar-preset-btn ${avatarUrl === preset ? 'selected' : ''}`}
                    >
                      <img src={preset} alt={`Preset ${idx + 1}`} />
                    </button>
                  ))}
                </div>
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

            {/* SECCIÓN 3: CAMBIO DE CONTRASEÑA */}
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
              disabled={isSubmitting || isPreparingPhoto}
            >
              <Save size={16} />
              <span>{isSubmitting ? 'Guardando...' : 'Guardar Cambios'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};
