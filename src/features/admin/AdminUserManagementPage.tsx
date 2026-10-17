import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Dumbbell,
  Award,
  Search,
  Trash2,
  X,
  Phone,
  Mail,
  Calendar,
  AlertCircle,
  CheckCircle,
  UserCheck,
} from 'lucide-react';
import { authService } from '../../services/authService.js';
import { User, UserRole } from '../../types/index.js';
import { useAuth } from '../auth/AuthContext.js';

export const AdminUserManagementPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [trainers, setTrainers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | UserRole>('ALL');

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState<User | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.ATLETA);
  const [trainerId, setTrainerId] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [allUsers, allTrainers] = await Promise.all([
        authService.getAllUsersAdmin(),
        authService.getTrainers(),
      ]);
      setUsers(allUsers);
      setTrainers(allTrainers);
    } catch (err) {
      console.error('Error cargando usuarios:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreateModal = () => {
    setFullName('');
    setEmail('');
    setPassword('');
    setRole(UserRole.ATLETA);
    setTrainerId(trainers[0]?.id || '');
    setPhone('');
    setNotes('');
    setAvatarUrl('');
    setFormError('');
    setFormSuccess('');
    setIsCreateModalOpen(true);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setFormError('Por favor completa todos los campos requeridos (*).');
      return;
    }

    if (password.length < 6) {
      setFormError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.createUserByAdmin({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password: password.trim(),
        role,
        trainerId: role === UserRole.ATLETA && trainerId ? trainerId : undefined,
        phone: phone.trim() || undefined,
        notes: notes.trim() || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
      });

      setFormSuccess('✅ Usuario creado exitosamente');
      setTimeout(() => {
        setIsCreateModalOpen(false);
        loadData();
      }, 1000);
    } catch (err: any) {
      setFormError(
        err.response?.data?.message || 'Error al crear el usuario en el servidor.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteCandidate) return;
    setIsSubmitting(true);
    try {
      await authService.deleteUserAdmin(deleteCandidate.id);
      setDeleteCandidate(null);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al eliminar el usuario.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtrado
  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      u.fullName.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      (u.phone && u.phone.toLowerCase().includes(term));
    return matchesRole && matchesSearch;
  });

  const totalUsers = users.length;
  const totalTrainers = users.filter((u) => u.role === UserRole.ENTRENADOR).length;
  const totalAthletes = users.filter((u) => u.role === UserRole.ATLETA).length;

  return (
    <div className="admin-page-container">
      {/* Header Banner */}
      <div className="admin-header-banner">
        <div>
          <h1 className="admin-title">Gestión de Usuarios y Roles</h1>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="btn-primary btn-with-icon"
        >
          <UserPlus size={18} />
          <span>+ Nuevo Usuario</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="admin-kpi-grid">
        <div className="kpi-card card-glass">
          <div className="kpi-info">
            <span className="kpi-label">Total de Usuarios</span>
            <span className="kpi-value">{totalUsers}</span>
          </div>
        </div>

        <div className="kpi-card card-glass">
          <div className="kpi-info">
            <span className="kpi-label">Entrenadores registrados</span>
            <span className="kpi-value">{totalTrainers}</span>
          </div>
        </div>

        <div className="kpi-card card-glass">
          <div className="kpi-info">
            <span className="kpi-label">Atletas Registrados</span>
            <span className="kpi-value">{totalAthletes}</span>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="admin-toolbar card-glass">
        <div className="admin-search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar por nombre, correo o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-search-input"
          />
        </div>

        <div className="admin-filter-group">
          <button
            onClick={() => setRoleFilter('ALL')}
            className={`filter-pill-btn ${roleFilter === 'ALL' ? 'active' : ''}`}
          >
            Todos ({totalUsers})
          </button>
          <button
            onClick={() => setRoleFilter(UserRole.ENTRENADOR)}
            className={`filter-pill-btn ${roleFilter === UserRole.ENTRENADOR ? 'active' : ''}`}
          >
            Entrenadores ({totalTrainers})
          </button>
          <button
            onClick={() => setRoleFilter(UserRole.ATLETA)}
            className={`filter-pill-btn ${roleFilter === UserRole.ATLETA ? 'active' : ''}`}
          >
            Atletas ({totalAthletes})
          </button>
        </div>
      </div>

      {/* Users Table / List */}
      <div className="admin-table-container card-glass">
        {isLoading ? (
          <div className="table-loading-box">
            <div className="spinner"></div>
            <p>Cargando directorio de usuarios...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="table-empty-box">
            <Users size={48} className="empty-icon" />
            <h3>No se encontraron usuarios</h3>
            <p>Prueba con otros términos de búsqueda o cambia el filtro de rol.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-users-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Rol</th>
                  <th>Entrenador Asignado</th>
                  <th>Contacto</th>
                  <th>Notas / Perfil</th>
                  <th style={{ textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const isCurrent = u.id === currentUser?.id;
                  return (
                    <tr key={u.id} className={isCurrent ? 'current-user-row' : ''}>
                      <td>
                        <div className="user-cell-meta">
                          <img
                            src={
                              u.avatarUrl ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                u.fullName,
                              )}&background=eed8c0&color=5a0505&bold=true`
                            }
                            alt={u.fullName}
                            className="user-cell-avatar"
                          />
                          <div>
                            <div className="user-cell-name">
                              {u.fullName}
                              {isCurrent && (
                                <span className="you-chip">(Tú)</span>
                              )}
                            </div>
                            <div className="user-cell-email">
                              <Mail size={12} />
                              <span>{u.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className={`user-role-badge ${u.role.toLowerCase()}`}>
                          {u.role === UserRole.ADMIN
                            ? 'Admin'
                            : u.role === UserRole.ENTRENADOR
                            ? 'Entrenador'
                            : 'Atleta'}
                        </span>
                      </td>

                      <td>
                        {u.role === UserRole.ATLETA ? (
                          u.trainerName ? (
                            <span className="trainer-assigned-badge">
                              <UserCheck size={13} />
                              <span>{u.trainerName}</span>
                            </span>
                          ) : (
                            <span className="unassigned-text">Sin asignar</span>
                          )
                        ) : (
                          <span className="dash-text">—</span>
                        )}
                      </td>

                      <td>
                        {u.phone ? (
                          <div className="user-cell-phone">
                            <Phone size={13} />
                            <span>{u.phone}</span>
                          </div>
                        ) : (
                          <span className="unassigned-text">Sin teléfono</span>
                        )}
                      </td>

                      <td>
                        <span className="user-notes-snippet" title={u.notes || ''}>
                          {u.notes || '—'}
                        </span>
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        {!isCurrent && u.role !== UserRole.ADMIN ? (
                          <button
                            onClick={() => setDeleteCandidate(u)}
                            className="btn-table-action delete"
                            title="Eliminar usuario"
                          >
                            <Trash2 size={16} />
                          </button>
                        ) : (
                          <span className="dash-text" title="No eliminable">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Crear Usuario (HU-01) */}
      {isCreateModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-container admin-create-modal">
            <div className="modal-header">
              <div className="modal-title-box">
                <UserPlus size={20} className="modal-icon primary" />
                <h2>Crear Nuevo Usuario</h2>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="btn-close-modal"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="modal-form">
              <div className="modal-body">
                {formError && (
                  <div className="alert-box error">
                    <AlertCircle size={18} />
                    <span>{formError}</span>
                  </div>
                )}

                {formSuccess && (
                  <div className="alert-box success">
                    <CheckCircle size={18} />
                    <span>{formSuccess}</span>
                  </div>
                )}

                {/* Rol Selector */}
                <div className="form-group">
                  <label className="form-label">Rol del Usuario *</label>
                  <div className="role-selector-pills">
                    <button
                      type="button"
                      onClick={() => setRole(UserRole.ATLETA)}
                      className={`role-select-btn ${role === UserRole.ATLETA ? 'active' : ''}`}
                    >
                      <Dumbbell size={16} />
                      <span>Atleta</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole(UserRole.ENTRENADOR)}
                      className={`role-select-btn ${role === UserRole.ENTRENADOR ? 'active' : ''}`}
                    >
                      <Award size={16} />
                      <span>Entrenador</span>
                    </button>
                  </div>
                </div>

                {/* Si es atleta, desplegable de entrenador asignado */}
                {role === UserRole.ATLETA && (
                  <div className="form-group">
                    <label className="form-label">Entrenador Asignado</label>
                    <select
                      value={trainerId}
                      onChange={(e) => setTrainerId(e.target.value)}
                      className="form-input form-select"
                    >
                      <option value="">-- Sin entrenador asignado --</option>
                      {trainers.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.fullName} ({t.email})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Nombre y Correo */}
                <div className="form-row">
                  <div className="form-group flex-1">
                    <label className="form-label">Nombre Completo *</label>
                    <input
                      type="text"
                      required
                      placeholder="ej. Valeria Rossi"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group flex-1">
                    <label className="form-label">Correo Electrónico *</label>
                    <input
                      type="email"
                      required
                      placeholder="ej. valeria@gym.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>

                {/* Contraseña y Teléfono */}
                <div className="form-row">
                  <div className="form-group flex-1">
                    <label className="form-label">Contraseña Temporal *</label>
                    <input
                      type="password"
                      required
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group flex-1">
                    <label className="form-label">Teléfono de Contacto</label>
                    <input
                      type="tel"
                      placeholder="+54 9 11 1234-5678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>

                {/* URL Avatar */}
                <div className="form-group">
                  <label className="form-label">URL de Avatar / Foto (Opcional)</label>
                  <input
                    type="url"
                    placeholder="https://ejemplo.com/foto.jpg"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="form-input"
                  />
                </div>

                {/* Notas */}
                <div className="form-group">
                  <label className="form-label">Notas / Objetivos del Perfil</label>
                  <textarea
                    rows={2}
                    placeholder="ej. Atleta de powerlifting, enfocado en hipertrofia de piernas..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="form-input form-textarea"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
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
                  {isSubmitting ? 'Guardando...' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirmar Eliminación */}
      {deleteCandidate && (
        <div className="modal-backdrop">
          <div className="modal-container modal-sm">
            <div className="modal-header">
              <div className="modal-title-box">
                <Trash2 size={20} className="modal-icon danger" />
                <h2>Eliminar Usuario</h2>
              </div>
              <button
                onClick={() => setDeleteCandidate(null)}
                className="btn-close-modal"
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body delete-confirm-body">
              <div className="delete-confirm-icon">
                <Trash2 size={32} />
              </div>
              <p className="delete-confirm-text">
                ¿Estás seguro de que deseas eliminar permanentemente a{' '}
                <strong>{deleteCandidate.fullName}</strong> ({deleteCandidate.email})?
              </p>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setDeleteCandidate(null)}
                className="btn-secondary"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteUser}
                className="btn-danger"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Eliminando...' : 'Sí, Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
