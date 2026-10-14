import React, { useRef, useEffect } from 'react';
import { X, Play, AlertCircle, Dumbbell, Activity, ExternalLink } from 'lucide-react';
import { Exercise } from '../types/index.js';

interface VideoPlayerModalProps {
  exercise: Exercise | null;
  isOpen: boolean;
  onClose: () => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  exercise,
  isOpen,
  onClose,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Al desmontar o cerrar, pausar inmediatamente el video y reiniciar tiempo
  useEffect(() => {
    if (!isOpen && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isOpen]);

  // Manejo de tecla Escape para cerrar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleClose = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    onClose();
  };

  if (!isOpen || !exercise) return null;

  const getYouTubeEmbedUrl = (url?: string): string | null => {
    if (!url) return null;
    const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|watch\?.+&v=))([\w-]{11})/;
    const match = url.match(regExp);
    return match && match[1] ? `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0` : null;
  };

  const hasValidVideo = Boolean(exercise.videoUrl && exercise.videoUrl.trim().length > 0);
  const ytEmbedUrl = exercise.videoUrl ? getYouTubeEmbedUrl(exercise.videoUrl) : null;

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div
        className="modal-container video-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="video-modal-title"
      >
        {/* Header con botón de cierre inmediato */}
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="badge badge-primary">{exercise.grupoMuscularPrincipal}</span>
            <h3 id="video-modal-title" className="modal-title">
              {exercise.nombre}
            </h3>
          </div>
          <div className="modal-header-actions">
            {hasValidVideo && (
              <a
                href={exercise.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-open-external"
                title="Abrir video en YouTube o fuente original"
              >
                <ExternalLink size={15} />
                <span>Abrir en YouTube</span>
              </a>
            )}
            <button
              onClick={handleClose}
              className="btn-icon-close"
              title="Cerrar guía (Esc)"
              aria-label="Cerrar modal"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        <div className="video-player-wrapper">
          {hasValidVideo ? (
            <div className="video-responsive-box">
              {ytEmbedUrl ? (
                <iframe
                  src={ytEmbedUrl}
                  title={`Demostración técnica de ${exercise.nombre}`}
                  className="in-app-video-element in-app-video-iframe"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              ) : (
                <video
                  ref={videoRef}
                  controls
                  autoPlay
                  playsInline
                  preload="metadata"
                  className="in-app-video-element"
                  src={exercise.videoUrl}
                >
                  Tu navegador no soporta la reproducción de video HTML5.
                </video>
              )}
            </div>
          ) : (
            // Manejo de ejercicios sin video cargado
            <div className="no-video-placeholder">
              <div className="placeholder-icon-circle">
                <AlertCircle size={36} className="text-warning" />
              </div>
              <h4 className="placeholder-title">Demostración en video no disponible</h4>
              <p className="placeholder-text">
                El entrenador no ha adjuntado un video para este ejercicio. Revisa las
                instrucciones técnicas y las zonas musculares a continuación.
              </p>
            </div>
          )}
        </div>

        {/* Zonas trabajadas y descripción técnica */}
        <div className="modal-body-content">
          <div className="detail-section">
            <h4 className="section-label">
              <Activity size={16} /> Zonas Musculares Trabajadas
            </h4>
            <div className="muscle-tags-wrap">
              {exercise.zonasTrabajadas && exercise.zonasTrabajadas.length > 0 ? (
                exercise.zonasTrabajadas.map((zone, idx) => (
                  <span key={idx} className="muscle-tag">
                    {zone}
                  </span>
                ))
              ) : (
                <span className="muscle-tag">{exercise.grupoMuscularPrincipal}</span>
              )}
            </div>
          </div>

          <div className="detail-section">
            <h4 className="section-label">
              <Dumbbell size={16} /> Instrucciones Técnicas
            </h4>
            <p className="exercise-description-text">{exercise.descripcion}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button onClick={handleClose} className="btn btn-secondary">
            Volver a la Rutina
          </button>
        </div>
      </div>
    </div>
  );
};
