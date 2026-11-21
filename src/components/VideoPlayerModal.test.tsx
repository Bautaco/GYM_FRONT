import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ExerciseDetailModal } from './VideoPlayerModal';
import { Exercise } from '../types';

describe('ExerciseDetailModal (HU-07 & Manejo de Video)', () => {
  const baseExercise: Exercise = {
    id: 'ex-1',
    nombre: 'Press de Banca Plano',
    grupoMuscularPrincipal: 'Pecho',
    zonasTrabajadas: ['Pectoral Mayor', 'Tríceps Braquial'],
    descripcion: 'Bajar la barra controlada al esternón y empujar con potencia.',
    videoUrl: 'https://www.youtube.com/watch?v=rT7DgCr-3pg',
  };

  it('renderiza la información del ejercicio y el iframe de YouTube cuando hay URL válida', () => {
    const handleClose = vi.fn();
    render(
      <ExerciseDetailModal
        isOpen={true}
        exercise={baseExercise}
        onClose={handleClose}
      />
    );

    expect(screen.getByText('Press de Banca Plano')).toBeInTheDocument();
    expect(screen.getAllByText('Pecho').length).toBeGreaterThan(0);
    expect(screen.getByText('Pectoral Mayor')).toBeInTheDocument();
    expect(screen.getByText('Tríceps Braquial')).toBeInTheDocument();
    expect(screen.getByText(/Bajar la barra controlada/i)).toBeInTheDocument();

    const iframe = screen.getByTitle(/Demostración técnica de Press de Banca Plano/i);
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('src', expect.stringContaining('youtube.com/embed/rT7DgCr-3pg'));
  });

  it('renderiza el mensaje amigable de "sin video" cuando el ejercicio no tiene videoUrl', () => {
    const noVideoExercise: Exercise = {
      ...baseExercise,
      videoUrl: null,
    };

    render(
      <ExerciseDetailModal
        isOpen={true}
        exercise={noVideoExercise}
        onClose={vi.fn()}
      />
    );

    // Corroborar mensaje amigable de que no hay video
    expect(screen.getByText(/Demostración en video no disponible/i)).toBeInTheDocument();
    expect(
      screen.getByText(/El entrenador no ha adjuntado un video para este ejercicio/i)
    ).toBeInTheDocument();
    // No debe haber iframe
    expect(screen.queryByTitle(/Demostración técnica/i)).not.toBeInTheDocument();
  });

  it('renderiza el mensaje amigable de "sin video" cuando videoUrl es un string vacío', () => {
    const emptyVideoExercise: Exercise = {
      ...baseExercise,
      videoUrl: '',
    };

    render(
      <ExerciseDetailModal
        isOpen={true}
        exercise={emptyVideoExercise}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText(/Demostración en video no disponible/i)).toBeInTheDocument();
  });

  it('llama a onClose al hacer clic en el botón de cerrar y en el botón Volver', () => {
    const handleClose = vi.fn();
    render(
      <ExerciseDetailModal
        isOpen={true}
        exercise={baseExercise}
        onClose={handleClose}
      />
    );

    const closeBtn = screen.getByLabelText(/Cerrar modal/i);
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);

    const backBtn = screen.getByText(/Volver a la Rutina/i);
    fireEvent.click(backBtn);
    expect(handleClose).toHaveBeenCalledTimes(2);
  });

  it('no renderiza nada cuando isOpen es false', () => {
    const { container } = render(
      <ExerciseDetailModal
        isOpen={false}
        exercise={baseExercise}
        onClose={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });
});
