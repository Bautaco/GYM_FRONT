import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext.js';
import { UserRole } from '../types/index.js';
import { LoginPage } from '../features/auth/LoginPage.js';
import { AthleteDashboard } from '../features/training/AthleteDashboard.js';
import { TrainerPlanBuilder } from '../features/training/TrainerPlanBuilder.js';
import { ExerciseCatalogPage } from '../features/exercises/ExerciseCatalogPage.js';
import { ProgressPage } from '../features/progress/ProgressPage.js';
import { AdminUserManagementPage } from '../features/admin/AdminUserManagementPage.js';
import { Navbar } from '../components/Navbar.js';
import { BodyWeightModal } from '../components/BodyWeightModal.js';
import { RestTimerWidget } from '../components/RestTimerWidget.js';

export const AppRoutes: React.FC = () => {
  const { isAuthenticated, isLoading, role } = useAuth();
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="fullscreen-loading">
        <div className="spinner"></div>
        <p>Iniciando sesión segura...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="app-shell">
      {/* Barra de navegación superior con botón registrar peso para atleta */}
      <Navbar onOpenWeightModal={() => setIsWeightModalOpen(true)} />

      {/* Contenido principal de la página */}
      <main className="main-content-container">
        <Routes>
          {/* Ruta Raíz: Redirección según rol */}
          <Route
            path="/"
            element={
              role === UserRole.ADMIN ? (
                <Navigate to="/admin/users" replace />
              ) : role === UserRole.ENTRENADOR ? (
                <Navigate to="/trainer/assign-plan" replace />
              ) : (
                <AthleteDashboard />
              )
            }
          />

          {/* Rutas de Administrador (HU-01) */}
          <Route
            path="/admin/users"
            element={
              role === UserRole.ADMIN ? (
                <AdminUserManagementPage />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          {/* Rutas de Entrenador (HU-03 & HU-12) */}
          <Route
            path="/trainer/assign-plan"
            element={
              role === UserRole.ENTRENADOR ? (
                <TrainerPlanBuilder />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          {/* Catálogo de Ejercicios */}
          <Route path="/exercises" element={<ExerciseCatalogPage />} />

          {/* Métricas y Evolución de Cargas */}
          <Route path="/progress" element={<ProgressPage />} />

          {/* Ruta fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Widget Flotante de Cronómetro de Descanso (HU-11) */}
      <RestTimerWidget />

      {/* Modal global de peso corporal (HU-06) */}
      <BodyWeightModal
        isOpen={isWeightModalOpen}
        onClose={() => setIsWeightModalOpen(false)}
      />
    </div>
  );
};
