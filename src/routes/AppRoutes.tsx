import React from 'react';
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
import { RestTimerWidget } from '../components/RestTimerWidget.js';

export const AppRoutes: React.FC = () => {
  const { isAuthenticated, isLoading, role } = useAuth();

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
      {/* El registro de peso está disponible dentro de Métricas. */}
      <Navbar />

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

         {/* Catálogo de ejercicios: acceso exclusivo del entrenador */}
        <Route
          path="/exercises"
          element={
            role === UserRole.ENTRENADOR ? (
              <ExerciseCatalogPage />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        
          {/* Métricas y Evolución de Cargas */}
          <Route path="/progress" element={<ProgressPage />} />

          {/* Ruta fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Widget Flotante de Cronómetro de Descanso (HU-11): Solo visible para Atletas */}
      {role === UserRole.ATLETA && <RestTimerWidget />}

    </div>
  );
};
