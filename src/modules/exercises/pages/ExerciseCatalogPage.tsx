import { Plus } from 'lucide-react';
import { UserRole } from '../../../types/index.js';
import { ExerciseDetailModal } from '../components/ExerciseDetailModal.js';
import '../exercises.css';
import { useAuth } from '../../../shared/auth/AuthContext.js';
import { DeleteExerciseModal } from '../components/DeleteExerciseModal.js';
import { ExerciseFilters } from '../components/ExerciseFilters.js';
import { ExerciseFormModal } from '../components/ExerciseFormModal.js';
import { ExerciseList } from '../components/ExerciseList.js';
import { useExerciseCatalog } from '../hooks/useExerciseCatalog.js';

/**
 * Pantalla completa del catálogo.
 * Su responsabilidad es componer componentes y conectar sus eventos con el hook.
 */
export function ExerciseCatalogPage() {
  const { role } = useAuth();
  const catalog = useExerciseCatalog();

  return (
    <div className="catalog-page-layout">
      <div className="catalog-header-row">
        <div>
          <h1 className="page-main-title">Catálogo Oficial de Ejercicios</h1>
          <p className="page-main-subtitle">
            Guía biomecánica completa con zonas musculares trabajadas dinámicas,
            muñeco anatómico y reproducción in-app de técnica.
          </p>
        </div>

        {role === UserRole.ENTRENADOR && (
          <button onClick={catalog.openCreateModal} className="btn btn-primary">
            <Plus size={18} />
            <span>Crear Ejercicio</span>
          </button>
        )}
      </div>

      {/* La página conecta los controles visuales con el estado del catálogo. */}
      <ExerciseFilters
        searchTerm={catalog.searchTerm}
        selectedMuscle={catalog.selectedMuscle}
        categories={catalog.categories}
        onSearchChange={catalog.setSearchTerm}
        onMuscleChange={catalog.setSelectedMuscle}
      />

      <ExerciseList
        exercises={catalog.filteredExercises}
        isLoading={catalog.isLoading}
        role={role}
        onViewDetail={(exercise) => {
          catalog.setSelectedExerciseForModal(exercise);
          catalog.setIsDetailModalOpen(true);
        }}
        onEdit={catalog.openEditModal}
        onDelete={catalog.setDeleteTarget}
      />

      <ExerciseDetailModal
        exercise={catalog.selectedExerciseForModal}
        isOpen={catalog.isDetailModalOpen}
        onClose={() => catalog.setIsDetailModalOpen(false)}
      />

      <ExerciseFormModal
        isOpen={catalog.isFormModalOpen}
        editTarget={catalog.editTarget}
        form={catalog.form}
        muscleGroups={catalog.muscleGroups}
        formSelectedZones={catalog.formSelectedZones}
        unselectedSuggestions={catalog.unselectedSuggestions}
        isCustomGroupMode={catalog.isCustomGroupMode}
        customGroupName={catalog.customGroupName}
        newZoneInput={catalog.newZoneInput}
        error={catalog.formError}
        success={catalog.formSuccess}
        isSubmitting={catalog.isSubmitting}
        onClose={() => catalog.setIsFormModalOpen(false)}
        onSubmit={catalog.submitForm}
        onFormChange={catalog.setForm}
        onCustomGroupModeChange={catalog.setIsCustomGroupMode}
        onCustomGroupNameChange={catalog.setCustomGroupName}
        onNewZoneInputChange={catalog.setNewZoneInput}
        onAddZone={catalog.addZone}
        onRemoveZone={catalog.removeZone}
      />

      <DeleteExerciseModal
        exercise={catalog.deleteTarget}
        error={catalog.deleteError}
        isDeleting={catalog.isDeleting}
        onClose={() => catalog.setDeleteTarget(null)}
        onConfirm={catalog.deleteExercise}
      />
    </div>
  );
}
