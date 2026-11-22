import { Navigate, Route, Routes } from 'react-router-dom';
import { UserRole } from '../types/index.js';
import { AdminUserManagementPage } from '../modules/admin/pages/AdminUserManagementPage.js';
import { ADMIN_USERS_PATH } from '../modules/admin/admin.routes.js';
import { LoginPage } from '../modules/auth/pages/LoginPage.js';
import { ExerciseCatalogPage } from '../modules/exercises/pages/ExerciseCatalogPage.js';
import { EXERCISES_CATALOG_PATH } from '../modules/exercises/exercises.routes.js';
import { ProgressPage } from '../modules/progress/pages/ProgressPage.js';
import { PROGRESS_PATH } from '../modules/progress/progress.routes.js';
import { AthleteDashboard } from '../modules/training/pages/AthleteDashboard.js';
import { TrainerPlanBuilder } from '../modules/training/pages/TrainerPlanBuilder.js';
import { TRAINER_ASSIGN_PLAN_PATH } from '../modules/training/training.routes.js';
import { useAuth } from '../shared/auth/AuthContext.js';
import { Navbar } from '../shared/ui/Navbar.js';
import { RestTimerWidget } from '../shared/ui/RestTimerWidget.js';

/** Declara la navegación y los permisos de cada ruta. */
export function AppRoutes() {
  const { isAuthenticated, isLoading, role } = useAuth();

  if (isLoading) {
    return (
      <div className="fullscreen-loading">
        <div className="spinner"></div>
        <p>Iniciando sesión segura...</p>
      </div>
    );
  }

  if (!isAuthenticated) return <LoginPage />;

  return (
    <div className="app-shell">
      <Navbar />
      <main className="main-content-container">
        <Routes>
          <Route
            path="/"
            element={
              role === UserRole.ADMIN ? (
                <Navigate to={ADMIN_USERS_PATH} replace />
              ) : role === UserRole.ENTRENADOR ? (
                <Navigate to={TRAINER_ASSIGN_PLAN_PATH} replace />
              ) : (
                <AthleteDashboard />
              )
            }
          />
          <Route
            path={ADMIN_USERS_PATH}
            element={
              role === UserRole.ADMIN ? (
                <AdminUserManagementPage />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path={TRAINER_ASSIGN_PLAN_PATH}
            element={
              role === UserRole.ENTRENADOR ? (
                <TrainerPlanBuilder />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path={EXERCISES_CATALOG_PATH}
            element={
              role === UserRole.ENTRENADOR ? (
                <ExerciseCatalogPage />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route path={PROGRESS_PATH} element={<ProgressPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {role === UserRole.ATLETA && <RestTimerWidget />}
    </div>
  );
}
