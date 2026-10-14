import React, { useState, useEffect, useRef } from 'react';
import { Timer, Play, Pause, RotateCcw, Plus, X, ChevronUp, ChevronDown, Bell } from 'lucide-react';

export const RestTimerWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [totalSeconds, setTotalSeconds] = useState(90);
  const [remainingSeconds, setRemainingSeconds] = useState(90);
  const [isRunning, setIsRunning] = useState(false);
  const [isAlarmActive, setIsAlarmActive] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);

  // Reproducir un pitido sintético mediante Web Audio API
  const playBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // Nota A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch (e) {
      console.warn('Audio feedback blocked by browser policies:', e);
    }
  };

  // Escuchar eventos globales de inicio de timer desde las rutinas
  useEffect(() => {
    const handleStartTimer = (e: any) => {
      const seconds = Number(e.detail?.seconds) || 90;
      setTotalSeconds(seconds);
      setRemainingSeconds(seconds);
      setIsRunning(true);
      setIsOpen(true);
      setIsAlarmActive(false);
    };

    window.addEventListener('start-rest-timer', handleStartTimer);
    return () => window.removeEventListener('start-rest-timer', handleStartTimer);
  }, []);

  // Intervalo de cuenta regresiva
  useEffect(() => {
    let interval: any = null;
    if (isRunning && remainingSeconds > 0) {
      interval = setInterval(() => {
        setRemainingSeconds((prev) => prev - 1);
      }, 1000);
    } else if (remainingSeconds === 0 && isRunning) {
      setIsRunning(false);
      setIsAlarmActive(true);
      playBeep();
      setTimeout(playBeep, 350);
      setTimeout(playBeep, 700);
    }
    return () => clearInterval(interval);
  }, [isRunning, remainingSeconds]);

  const toggleRun = () => {
    setIsAlarmActive(false);
    setIsRunning(!isRunning);
  };

  const resetTimer = (newSeconds = totalSeconds) => {
    setIsRunning(false);
    setIsAlarmActive(false);
    setRemainingSeconds(newSeconds);
    setTotalSeconds(newSeconds);
  };

  const addTime = (secs: number) => {
    setRemainingSeconds((prev) => prev + secs);
    setTotalSeconds((prev) => Math.max(prev, remainingSeconds + secs));
    setIsAlarmActive(false);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = totalSeconds > 0 ? ((totalSeconds - remainingSeconds) / totalSeconds) * 100 : 0;

  return (
    <div className={`rest-timer-floating-root ${isOpen ? 'expanded' : 'collapsed'}`}>
      {/* Botón flotante colapsado */}
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className={`rest-timer-pill-btn ${isRunning ? 'running' : ''} ${isAlarmActive ? 'alarm-pulse' : ''}`}
          title="Abrir Cronómetro de Descanso"
        >
          <Timer size={18} className="timer-pill-icon" />
          <span className="timer-pill-text">{formatTime(remainingSeconds)}</span>
          {isAlarmActive && <Bell size={14} className="bell-alert-icon" />}
        </button>
      ) : (
        /* Widget expandido */
        <div className={`rest-timer-card card-glass ${isAlarmActive ? 'alarm-active' : ''}`}>
          {/* Header */}
          <div className="rest-timer-header">
            <div className="timer-header-title">
              <Timer size={16} className="timer-icon-lead" />
              <span>Cronómetro de Descanso (HU-11)</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="btn-icon-timer"
              title="Minimizar"
            >
              <ChevronDown size={16} />
            </button>
          </div>

          {/* Barra de progreso visual */}
          <div className="timer-progress-bar-bg">
            <div
              className="timer-progress-bar-fill"
              style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
            ></div>
          </div>

          {/* Tiempo principal */}
          <div className="rest-timer-display">
            <span className={`timer-clock-digits ${remainingSeconds <= 10 && remainingSeconds > 0 ? 'urgent' : ''}`}>
              {formatTime(remainingSeconds)}
            </span>
            {isAlarmActive && (
              <span className="timer-finished-badge">¡Tiempo de Descanso Cumplido!</span>
            )}
          </div>

          {/* Controles Principales */}
          <div className="rest-timer-controls">
            <button
              onClick={toggleRun}
              className={`btn-timer-primary ${isRunning ? 'running' : ''}`}
            >
              {isRunning ? <Pause size={18} /> : <Play size={18} />}
              <span>{isRunning ? 'Pausar' : 'Iniciar'}</span>
            </button>

            <button
              onClick={() => resetTimer()}
              className="btn-timer-secondary"
              title="Reiniciar"
            >
              <RotateCcw size={16} />
            </button>

            <button
              onClick={() => addTime(30)}
              className="btn-timer-secondary"
              title="Añadir 30 segundos"
            >
              <Plus size={16} /> <span>30s</span>
            </button>
          </div>

          {/* Presets Rápidos */}
          <div className="rest-timer-presets">
            <button
              onClick={() => resetTimer(60)}
              className={`preset-btn ${totalSeconds === 60 ? 'selected' : ''}`}
            >
              60s
            </button>
            <button
              onClick={() => resetTimer(90)}
              className={`preset-btn ${totalSeconds === 90 ? 'selected' : ''}`}
            >
              90s
            </button>
            <button
              onClick={() => resetTimer(120)}
              className={`preset-btn ${totalSeconds === 120 ? 'selected' : ''}`}
            >
              120s
            </button>
            <button
              onClick={() => resetTimer(180)}
              className={`preset-btn ${totalSeconds === 180 ? 'selected' : ''}`}
            >
              3m
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
